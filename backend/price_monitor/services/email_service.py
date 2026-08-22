import logging
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)


class EmailService:
    """
    Service responsible for composing and dispatching multi-part HTML & plain-text
    price drop and threshold alerts.
    """

    @classmethod
    def send_threshold_alert(cls, product, current_price, threshold_price, previous_price=None) -> bool:
        """
        Sends an alert notification email to ALERT_EMAIL when a product's price
        hits or falls below the user configured threshold.
        """
        recipient = getattr(settings, "ALERT_EMAIL", "")
        if not recipient:
            logger.info("ALERT_EMAIL is not configured in settings or .env. Skipping email dispatch.")
            return False

        subject = f"🚨 MacBook Air Price Alert: {product.name} hit ₹{current_price:,.2f}!"
        
        # Calculate price drop metrics
        diff_str = ""
        if previous_price and previous_price > current_price:
            savings = previous_price - current_price
            diff_str = f"<p style='color: #10B981; font-weight: bold;'>📉 Price dropped by ₹{savings:,.2f} from previous ₹{previous_price:,.2f}!</p>"

        # HTML Email Body
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #08090D; color: #E2E8F0; margin: 0; padding: 24px; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: #101218; border: 1px solid #1E2330; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }}
                .header {{ border-bottom: 1px solid #1E2330; padding-bottom: 16px; margin-bottom: 24px; }}
                .badge {{ display: inline-block; background-color: rgba(16, 185, 129, 0.15); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.3); padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; }}
                .title {{ font-size: 22px; font-weight: 700; color: #F8FAFC; margin: 12px 0 4px 0; }}
                .specs {{ color: #94A3B8; font-size: 14px; margin-bottom: 20px; }}
                .price-box {{ background: linear-gradient(135deg, #151821, #1A1F2C); border: 1px solid #283042; border-radius: 12px; padding: 20px; margin: 24px 0; }}
                .price-row {{ display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 15px; }}
                .current-price {{ font-size: 28px; font-weight: 800; color: #00F0FF; margin-top: 8px; }}
                .target-tag {{ font-size: 13px; color: #94A3B8; }}
                .button {{ display: inline-block; background: linear-gradient(135deg, #0070F3, #00C2FF); color: #FFFFFF !important; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; margin-top: 20px; text-align: center; }}
                .footer {{ margin-top: 32px; padding-top: 16px; border-top: 1px solid #1E2330; font-size: 12px; color: #64748B; text-align: center; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <span class="badge">Target Price Reached</span>
                    <h1 class="title">{product.name}</h1>
                    <div class="specs">Store: {product.store} | Currency: {product.currency}</div>
                </div>

                <p>Great news! The tracked price for this MacBook configuration has reached or dropped below your target threshold.</p>
                {diff_str}

                <div class="price-box">
                    <div class="price-row">
                        <span>Current Price:</span>
                        <span class="current-price">₹{current_price:,.2f}</span>
                    </div>
                    <div class="price-row target-tag">
                        <span>Your Configured Target:</span>
                        <span>₹{threshold_price:,.2f}</span>
                    </div>
                    {f'<div class="price-row target-tag"><span>Previous Scraped Price:</span><span>₹{previous_price:,.2f}</span></div>' if previous_price else ''}
                </div>

                <a href="{product.url}" class="button" target="_blank">View on Apple Store &rarr;</a>

                <div class="footer">
                    Sent automatically by MacWatch — MacBook Air Price Intelligence Dashboard.<br>
                    To modify price targets, visit your local MacWatch dashboard.
                </div>
            </div>
        </body>
        </html>
        """

        text_content = f"""
MacBook Air Price Alert!

{product.name}
Current Price: ₹{current_price:,.2f}
Your Target: ₹{threshold_price:,.2f}
{f'Previous Price: ₹{previous_price:,.2f}' if previous_price else ''}

The product has reached or fallen below your configured target price!

View on Apple Store: {product.url}

--
MacWatch Price Intelligence
        """.strip()

        from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "alerts@macwatch.internal")

        try:
            msg = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=from_email,
                to=[recipient]
            )
            msg.attach_alternative(html_content, "text/html")
            msg.send(fail_silently=False)
            logger.info("Threshold alert email successfully sent to %s for product %s", recipient, product.name)
            return True
        except Exception as err:
            logger.error("Failed to send alert email to %s: %s", recipient, err)
            return False
