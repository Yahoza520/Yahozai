from fastapi import APIRouter
from app.api.v1.endpoints import auth, location, match, user, chat

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(location.router)
api_router.include_router(match.router)
api_router.include_router(user.router)
api_router.include_router(chat.router)
