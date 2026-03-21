from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, func, update
from datetime import datetime, timezone
from app.core.database import get_db, AsyncSessionLocal
from app.core.security import decode_token
from app.models.user import User
from app.models.match import Match, MatchStatus
from app.models.message import Message
from app.api.v1.deps import get_current_user
from app.schemas.message import MessageSend, MessageOut, ConversationOut
import json

router = APIRouter(prefix="/chat", tags=["chat"])

# WebSocket bağlantı havuzu: match_id -> {user_id: websocket}
_connections: dict[str, dict[str, WebSocket]] = {}


async def _get_match_or_403(match_id: str, user_id: str, db: AsyncSession) -> Match:
    result = await db.execute(select(Match).where(Match.id == match_id))
    match = result.scalar_one_or_none()
    if not match:
        raise HTTPException(status_code=404, detail="Sohbet bulunamadı")
    if match.status != MatchStatus.matched:
        raise HTTPException(status_code=403, detail="Sadece eşleşilen kişilerle mesajlaşabilirsin")
    if user_id not in (match.user_a_id, match.user_b_id):
        raise HTTPException(status_code=403, detail="Bu sohbete erişim izniniz yok")
    return match


@router.post("/{match_id}/send", response_model=MessageOut, status_code=201)
async def send_message(
    match_id: str,
    body: MessageSend,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Eşleşilen kişiye mesaj gönder."""
    await _get_match_or_403(match_id, current_user.id, db)

    msg = Message(
        match_id=match_id,
        sender_id=current_user.id,
        content=body.content,
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)

    # WebSocket üzerinden karşı tarafa anlık ilet
    if match_id in _connections:
        payload = json.dumps({
            "id": msg.id,
            "sender_id": msg.sender_id,
            "content": msg.content,
            "created_at": msg.created_at.isoformat(),
        })
        for uid, ws in list(_connections[match_id].items()):
            if uid != current_user.id:
                try:
                    await ws.send_text(payload)
                except Exception:
                    pass

    return msg


@router.get("/{match_id}/messages", response_model=list[MessageOut])
async def get_messages(
    match_id: str,
    limit: int = 50,
    before_id: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Sohbet geçmişini getir (sayfalama destekli)."""
    await _get_match_or_403(match_id, current_user.id, db)

    query = select(Message).where(Message.match_id == match_id)

    if before_id:
        anchor = await db.get(Message, before_id)
        if anchor:
            query = query.where(Message.created_at < anchor.created_at)

    query = query.order_by(Message.created_at.desc()).limit(limit)
    result = await db.execute(query)
    messages = result.scalars().all()

    # Karşı tarafın mesajlarını okundu olarak işaretle
    await db.execute(
        update(Message)
        .where(
            and_(
                Message.match_id == match_id,
                Message.sender_id != current_user.id,
                Message.is_read == False,
            )
        )
        .values(is_read=True, read_at=datetime.now(timezone.utc))
    )
    await db.commit()

    return list(reversed(messages))


@router.get("/conversations", response_model=list[ConversationOut])
async def list_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Tüm aktif sohbetleri listele."""
    matches_result = await db.execute(
        select(Match, User)
        .join(
            User,
            or_(
                and_(Match.user_a_id == current_user.id, User.id == Match.user_b_id),
                and_(Match.user_b_id == current_user.id, User.id == Match.user_a_id),
            ),
        )
        .where(
            and_(
                or_(Match.user_a_id == current_user.id, Match.user_b_id == current_user.id),
                Match.status == MatchStatus.matched,
            )
        )
    )
    rows = matches_result.all()

    conversations = []
    for match, other_user in rows:
        # Son mesaj
        last_msg_result = await db.execute(
            select(Message)
            .where(Message.match_id == match.id)
            .order_by(Message.created_at.desc())
            .limit(1)
        )
        last_msg = last_msg_result.scalar_one_or_none()

        # Okunmamış sayısı
        unread_result = await db.execute(
            select(func.count()).where(
                and_(
                    Message.match_id == match.id,
                    Message.sender_id != current_user.id,
                    Message.is_read == False,
                )
            )
        )
        unread_count = unread_result.scalar_one()

        conversations.append(
            ConversationOut(
                match_id=match.id,
                other_user_id=other_user.id,
                other_user_name=other_user.name,
                last_message=last_msg.content if last_msg else None,
                last_message_at=last_msg.created_at if last_msg else None,
                unread_count=unread_count,
            )
        )

    conversations.sort(key=lambda c: c.last_message_at or datetime.min.replace(tzinfo=timezone.utc), reverse=True)
    return conversations


@router.websocket("/ws/{match_id}")
async def websocket_chat(match_id: str, websocket: WebSocket, token: str):
    """Gerçek zamanlı mesajlaşma WebSocket bağlantısı."""
    user_id = decode_token(token)
    if not user_id:
        await websocket.close(code=4001)
        return

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Match).where(Match.id == match_id))
        match = result.scalar_one_or_none()
        if not match or match.status != MatchStatus.matched or user_id not in (match.user_a_id, match.user_b_id):
            await websocket.close(code=4003)
            return

    await websocket.accept()

    if match_id not in _connections:
        _connections[match_id] = {}
    _connections[match_id][user_id] = websocket

    try:
        while True:
            await websocket.receive_text()  # ping/pong için açık tut
    except WebSocketDisconnect:
        pass
    finally:
        _connections.get(match_id, {}).pop(user_id, None)
        if match_id in _connections and not _connections[match_id]:
            del _connections[match_id]
