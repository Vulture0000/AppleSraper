from decimal import Decimal
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from price_monitor.models import Product, PriceHistory

INITIAL_PRODUCTS = [
    {
        "url": "https://www.apple.com/in/shop/buy-mac/macbook-air/13-inch-midnight-m5-chip-10-core-cpu-10-core-gpu-16gb-memory-512gb-storage",
        "name": "MacBook Air 13\" (M5 10-core CPU, 10-core GPU, 16GB, 512GB) - Midnight",
        "store": "Apple India",
        "description": "Apple MacBook Air 13-inch Midnight with Apple Silicon M5 chip (10-core CPU, 10-core GPU), 16GB Unified Memory, 512GB SSD Storage, Liquid Retina Display.",
        "current_price": Decimal("119900.00"),
        "previous_price": Decimal("124900.00"),
        "lowest_price": Decimal("114900.00"),
        "highest_price": Decimal("124900.00"),
        "threshold_price": Decimal("115000.00"),
        "image_url": "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/mba13-midnight-select-202402?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1708367688034",
    },
    {
        "url": "https://www.apple.com/in/shop/buy-mac/macbook-air/13-inch-midnight-m5-chip-10-core-cpu-10-core-gpu-24gb-memory-512gb-storage",
        "name": "MacBook Air 13\" (M5 10-core CPU, 10-core GPU, 24GB, 512GB) - Midnight",
        "store": "Apple India",
        "description": "Apple MacBook Air 13-inch Midnight with Apple Silicon M5 chip (10-core CPU, 10-core GPU), 24GB Unified Memory, 512GB SSD Storage.",
        "current_price": Decimal("139900.00"),
        "previous_price": Decimal("139900.00"),
        "lowest_price": Decimal("134900.00"),
        "highest_price": Decimal("139900.00"),
        "threshold_price": Decimal("130000.00"),
        "image_url": "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/mba13-midnight-select-202402?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1708367688034",
    },
    {
        "url": "https://www.apple.com/in/shop/buy-mac/macbook-air/13-inch-midnight-m5-chip-8-core-cpu-8-core-gpu-16gb-memory-512gb-storage",
        "name": "MacBook Air 13\" (M5 8-core CPU, 8-core GPU, 16GB, 512GB) - Midnight",
        "store": "Apple India",
        "description": "Apple MacBook Air 13-inch Midnight with Apple Silicon M5 chip (8-core CPU, 8-core GPU), 16GB Unified Memory, 512GB SSD Storage.",
        "current_price": Decimal("99900.00"),
        "previous_price": Decimal("104900.00"),
        "lowest_price": Decimal("94900.00"),
        "highest_price": Decimal("104900.00"),
        "threshold_price": Decimal("95000.00"),
        "image_url": "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/mba13-midnight-select-202402?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1708367688034",
    },
    {
        "url": "https://www.apple.com/in-edu/shop/buy-mac/macbook-air/13-inch-midnight-m5-chip-8-core-cpu-8-core-gpu-16gb-memory-512gb-storage",
        "name": "MacBook Air 13\" [Edu Store] (M5 8-core CPU, 8-core GPU, 16GB, 512GB)",
        "store": "Apple India (Edu)",
        "description": "Apple Education Store Special: MacBook Air 13-inch Midnight (8-core CPU, 8-core GPU), 16GB Unified Memory, 512GB SSD.",
        "current_price": Decimal("89900.00"),
        "previous_price": Decimal("94900.00"),
        "lowest_price": Decimal("89900.00"),
        "highest_price": Decimal("94900.00"),
        "threshold_price": Decimal("90000.00"),
        "image_url": "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/mba13-midnight-select-202402?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1708367688034",
    },
    {
        "url": "https://www.apple.com/in-edu/shop/buy-mac/macbook-air/13-inch-midnight-m5-chip-10-core-cpu-10-core-gpu-16gb-memory-512gb-storage",
        "name": "MacBook Air 13\" [Edu Store] (M5 10-core CPU, 10-core GPU, 16GB, 512GB)",
        "store": "Apple India (Edu)",
        "description": "Apple Education Store Special: MacBook Air 13-inch Midnight (10-core CPU, 10-core GPU), 16GB Unified Memory, 512GB SSD.",
        "current_price": Decimal("109900.00"),
        "previous_price": Decimal("114900.00"),
        "lowest_price": Decimal("104900.00"),
        "highest_price": Decimal("114900.00"),
        "threshold_price": Decimal("110000.00"),
        "image_url": "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/mba13-midnight-select-202402?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1708367688034",
    },
    {
        "url": "https://www.apple.com/in-edu/shop/buy-mac/macbook-air/13-inch-midnight-m5-chip-10-core-cpu-10-core-gpu-24gb-memory-512gb-storage",
        "name": "MacBook Air 13\" [Edu Store] (M5 10-core CPU, 10-core GPU, 24GB, 512GB)",
        "store": "Apple India (Edu)",
        "description": "Apple Education Store Special: MacBook Air 13-inch Midnight (10-core CPU, 10-core GPU), 24GB Unified Memory, 512GB SSD.",
        "current_price": Decimal("129900.00"),
        "previous_price": Decimal("129900.00"),
        "lowest_price": Decimal("124900.00"),
        "highest_price": Decimal("129900.00"),
        "threshold_price": Decimal("125000.00"),
        "image_url": "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/mba13-midnight-select-202402?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1708367688034",
    }
]


class Command(BaseCommand):
    help = "Seed initial MacBook Air products and historical baseline data into SQLite database"

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding initial 6 MacBook Air models..."))
        created_count = 0
        now = timezone.now()

        for item in INITIAL_PRODUCTS:
            product, created = Product.objects.get_or_create(
                url=item["url"],
                defaults={
                    "name": item["name"],
                    "store": item["store"],
                    "description": item["description"],
                    "current_price": item["current_price"],
                    "previous_price": item["previous_price"],
                    "lowest_price": item["lowest_price"],
                    "highest_price": item["highest_price"],
                    "threshold_price": item["threshold_price"],
                    "currency": "INR",
                    "image_url": item["image_url"],
                    "active": True,
                    "last_checked_at": now,
                }
            )

            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f" + Created: {product.name}"))
                
                # Create initial baseline price history sequence
                base_price = item["current_price"]
                prev_price = item["previous_price"]
                
                # Sample trend points across last 7 days
                history_points = [
                    (now - timedelta(days=7), prev_price + Decimal("2000.00")),
                    (now - timedelta(days=5), prev_price),
                    (now - timedelta(days=3), prev_price),
                    (now - timedelta(days=2), base_price + Decimal("1000.00")),
                    (now - timedelta(days=1), prev_price),
                    (now - timedelta(hours=6), base_price),
                    (now, base_price),
                ]

                for recorded_time, price_val in history_points:
                    h = PriceHistory.objects.create(
                        product=product,
                        price=price_val
                    )
                    # Manually update recorded_at timestamp for seed data
                    PriceHistory.objects.filter(id=h.id).update(recorded_at=recorded_time)
            else:
                self.stdout.write(self.style.WARNING(f" . Already exists: {product.name}"))

        self.stdout.write(self.style.SUCCESS(f"Seeding completed successfully! ({created_count} products created)."))
