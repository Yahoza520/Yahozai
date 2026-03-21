import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings


async def send_verification_email(to_email: str, name: str, code: str) -> None:
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0f0f13;color:#e8e8f5;padding:32px;border-radius:16px">
      <h1 style="font-size:2rem;font-weight:900;background:linear-gradient(135deg,#a78bfa,#fc5c8a);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:4px">DENK</h1>
      <p style="color:#6060a0;margin-bottom:24px;font-size:0.85rem">Geçmişte kesiştiğin kişileri keşfet</p>
      <p style="margin-bottom:8px">Merhaba <strong>{name}</strong>,</p>
      <p style="color:#9090c0;margin-bottom:24px">Kaydını tamamlamak için aşağıdaki doğrulama kodunu gir:</p>
      <div style="background:#1a1a2a;border:2px solid #7c5cfc;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
        <span style="font-size:2.5rem;font-weight:900;letter-spacing:0.2em;color:#a78bfa">{code}</span>
      </div>
      <p style="color:#6060a0;font-size:0.8rem">Bu kod <strong>10 dakika</strong> geçerlidir. Eğer kayıt olmadıysan bu e-postayı yok say.</p>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"{code} — DENK Doğrulama Kodu"
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = to_email
    msg.attach(MIMEText(html, "html"))

    await aiosmtplib.send(
        msg,
        hostname=settings.SMTP_HOST,
        port=settings.SMTP_PORT,
        username=settings.SMTP_USER,
        password=settings.SMTP_PASSWORD,
        start_tls=True,
    )
