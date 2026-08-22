import logging
from django.core.management.base import BaseCommand
from django.conf import settings
from django.core.mail import EmailMultiAlternatives, get_connection

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Send a test email to verify SMTP credentials and ALERT_EMAIL configuration"

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Testing Email / SMTP Configuration..."))

        host = getattr(settings, "EMAIL_HOST", "")
        port = getattr(settings, "EMAIL_PORT", 587)
        user = getattr(settings, "EMAIL_HOST_USER", "")
        pwd = getattr(settings, "EMAIL_HOST_PASSWORD", "")
        recipient = getattr(settings, "ALERT_EMAIL", "")
        use_tls = getattr(settings, "EMAIL_USE_TLS", True)
        backend = getattr(settings, "EMAIL_BACKEND", "")

        self.stdout.write(f"EMAIL_BACKEND: {backend}")
        self.stdout.write(f"EMAIL_HOST: {host}:{port}")
        self.stdout.write(f"EMAIL_HOST_USER: {user if user else '[NOT SET]'}")
        self.stdout.write(f"ALERT_EMAIL: {recipient if recipient else '[NOT SET]'}")
        self.stdout.write(f"EMAIL_USE_TLS: {use_tls}")

        if not recipient:
            self.stdout.write(
                self.style.ERROR(
                    "\n[FAIL] ALERT_EMAIL is not set in backend/.env! Please add: ALERT_EMAIL=your_email@example.com"
                )
            )
            return

        if not user or not pwd:
            self.stdout.write(
                self.style.WARNING(
                    "\n[WARN] EMAIL_HOST_USER or EMAIL_HOST_PASSWORD is missing in backend/.env. Using console backend."
                )
            )

        subject = "🧪 Test Price Alert: MacWatch SMTP Verification"
        body_text = "Congratulations! Your MacWatch SMTP email alert system is working properly."
        html_content = """
        <div style="font-family: sans-serif; background-color: #08090D; color: #E2E8F0; padding: 24px; border-radius: 12px;">
            <h2 style="color: #00F0FF;">✓ MacWatch SMTP Test Successful</h2>
            <p>Your email alerts are configured correctly and ready to receive real-time MacBook Air price drops.</p>
        </div>
        """

        try:
            self.stdout.write("\nAttempting to connect to SMTP server and send test message...")
            connection = get_connection(
                backend='django.core.mail.backends.smtp.EmailBackend',
                host=host,
                port=port,
                username=user,
                password=pwd,
                use_tls=use_tls,
                timeout=15
            )
            
            msg = EmailMultiAlternatives(
                subject=subject,
                body=body_text,
                from_email=user or "alerts@macwatch.internal",
                to=[recipient],
                connection=connection
            )
            msg.attach_alternative(html_content, "text/html")
            msg.send(fail_silently=False)

            self.stdout.write(
                self.style.SUCCESS(
                    f"\n[SUCCESS] Test email successfully sent to {recipient}! Check your inbox (and spam folder)."
                )
            )

        except Exception as err:
            self.stdout.write(
                self.style.ERROR(
                    f"\n[ERROR] Failed to send email via SMTP:\n{type(err).__name__}: {err}"
                )
            )
            if "535" in str(err) or "Username and Password not accepted" in str(err) or "Authentication" in str(err):
                self.stdout.write(
                    self.style.NOTICE(
                        "\n--- Gmail Help ---\n"
                        "If you are using Gmail, standard account passwords do NOT work.\n"
                        "You must generate a 16-character App Password:\n"
                        "1. Go to: https://myaccount.google.com/security\n"
                        "2. Enable 2-Step Verification\n"
                        "3. Search for 'App Passwords'\n"
                        "4. Create an App Password for 'Mail' and paste that 16-letter code into EMAIL_HOST_PASSWORD in backend/.env"
                    )
                )
