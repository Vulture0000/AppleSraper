import logging
from ..models import Product, AlertHistory
from .email_service import EmailService

logger = logging.getLogger(__name__)


def check_and_process_threshold(product: Product) -> bool:
    """
    Evaluates threshold condition for a product and triggers alert if necessary.
    
    Logic:
      1. If threshold_price is None or current_price is None -> do nothing.
      2. If current_price > threshold_price:
           Reset threshold_triggered to False (if it was previously triggered).
      3. If current_price <= threshold_price:
           If threshold_triggered is False:
             - Send email alert
             - Create AlertHistory record
             - Set threshold_triggered to True
           If threshold_triggered is True:
             - Skip sending duplicate email
    """
    if product.threshold_price is None or product.current_price is None:
        return False

    # Case: Price is above threshold
    if product.current_price > product.threshold_price:
        if product.threshold_triggered:
            logger.info(
                "Product '%s' price ₹%s rose above target threshold ₹%s. Resetting trigger flag.",
                product.name,
                product.current_price,
                product.threshold_price
            )
            product.threshold_triggered = False
            product.save(update_fields=['threshold_triggered'])
        return False

    # Case: Price is at or below threshold
    if product.current_price <= product.threshold_price:
        if not product.threshold_triggered:
            logger.info(
                "Product '%s' reached target threshold (Price: ₹%s <= Target: ₹%s). Dispatching alert!",
                product.name,
                product.current_price,
                product.threshold_price
            )
            
            # Send Email Alert
            EmailService.send_threshold_alert(
                product=product,
                current_price=product.current_price,
                threshold_price=product.threshold_price,
                previous_price=product.previous_price
            )

            # Record in AlertHistory table
            AlertHistory.objects.create(
                product=product,
                price=product.current_price,
                threshold_price=product.threshold_price,
                alert_type="THRESHOLD"
            )

            # Mark as triggered to prevent repetitive hourly alerts
            product.threshold_triggered = True
            product.save(update_fields=['threshold_triggered'])
            return True
        else:
            logger.debug(
                "Product '%s' price is still below threshold (₹%s <= ₹%s), alert already dispatched.",
                product.name,
                product.current_price,
                product.threshold_price
            )
            return False

    return False
