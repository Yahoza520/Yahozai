"""AES-256-GCM şifreleme servisi — wellness hassas veriler için."""
import json
import os
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from app.core.config import settings


def _get_key() -> bytes:
    """32 byte AES anahtarı üretir (config'den alır, eksikse pad'ler)."""
    raw = settings.WELLNESS_ENCRYPTION_KEY.encode()
    return raw[:32].ljust(32, b"\x00")


def encrypt(data: dict) -> str:
    """Dict'i AES-256-GCM ile şifreleyip base64 string döner."""
    key = _get_key()
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)
    plaintext = json.dumps(data, ensure_ascii=False).encode()
    ciphertext = aesgcm.encrypt(nonce, plaintext, None)
    return base64.b64encode(nonce + ciphertext).decode()


def decrypt(token: str) -> dict:
    """Base64 şifreli string'i çözer, dict döner."""
    key = _get_key()
    aesgcm = AESGCM(key)
    raw = base64.b64decode(token.encode())
    nonce, ciphertext = raw[:12], raw[12:]
    plaintext = aesgcm.decrypt(nonce, ciphertext, None)
    return json.loads(plaintext.decode())
