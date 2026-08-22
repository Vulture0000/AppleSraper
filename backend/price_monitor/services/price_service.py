import re
import logging
from decimal import Decimal, InvalidOperation
from django.utils import timezone
from ..models import Product, PriceHistory

logger = logging.getLogger(__name__)


def parse_price(raw_price: str | int | float | Decimal | None) -> Decimal:
    """
    Parse varied price formats into a clean Decimal.
    Supports:
      - '₹99,900'
      - '₹99,900.00'
      - '99900'
      - '99,900'
      - 'INR 99,900'
      - '₹ 1,04,900.00'
      - 99900 / 99900.50
    """
    if raw_price is None:
        raise ValueError("Cannot parse None price")

    if isinstance(raw_price, Decimal):
        return raw_price.quantize(Decimal('0.01'))

    if isinstance(raw_price, (int, float)):
        return Decimal(str(raw_price)).quantize(Decimal('0.01'))

    cleaned = str(raw_price).strip()
    if not cleaned:
        raise ValueError("Cannot parse empty price string")

    # Remove currency abbreviations and symbols
    # Keep only digits and decimal points
    # First remove currency codes and symbols: ₹, INR, Rs., Rs, $, etc.
    cleaned = re.sub(r'(?i)(inr|rs\.?|\$|₹)', '', cleaned).strip()
    
    # Remove all thousand separators (commas and whitespace)
    cleaned = cleaned.replace(',', '').replace(' ', '')

    # Extract any float/decimal pattern
    match = re.search(r'\d+(?:\.\d+)?', cleaned)
    if not match:
        raise ValueError(f"Could not extract numeric price from '{raw_price}'")

    try:
        decimal_val = Decimal(match.group(0))
        return decimal_val.quantize(Decimal('0.01'))
    except (InvalidOperation, ValueError) as exc:
        raise ValueError(f"Failed to convert '{match.group(0)}' to Decimal: {exc}") from exc


def update_product_price(
    product: Product,
    new_price_input: str | int | float | Decimal,
    title: str | None = None,
    description: str | None = None,
    image_url: str | None = None
) -> tuple[Product, PriceHistory | None]:
    """
    Updates the product's price and records a new PriceHistory point.
    Handles shifts:
      current_price -> previous_price
      new_price -> current_price
      updates lowest_price and highest_price
    Checks threshold and triggers alerts if applicable.
    """
    try:
        new_price = parse_price(new_price_input)
    except Exception as err:
        logger.error(
            "Failed to parse price '%s' for product id %s (%s): %s",
            new_price_input,
            product.id,
            product.name,
            err
        )
        return product, None

    # Update title and description if provided and not already custom
    if title and (not product.name or product.name.startswith("Apple MacBook")):
        product.name = title
    if description and not product.description:
        product.description = description
    if image_url and not product.image_url:
        product.image_url = image_url

    # Shift current price to previous price
    if product.current_price is not None:
        product.previous_price = product.current_price

    # Set new current price
    product.current_price = new_price

    # Update lowest and highest historical price
    if product.lowest_price is None or new_price < product.lowest_price:
        product.lowest_price = new_price

    if product.highest_price is None or new_price > product.highest_price:
        product.highest_price = new_price

    product.last_checked_at = timezone.now()
    product.save()

    # Create immutable PriceHistory record
    history = PriceHistory.objects.create(
        product=product,
        price=new_price
    )

    # Check and trigger threshold alerts
    from .alert_service import check_and_process_threshold
    check_and_process_threshold(product)

    return product, history
