import sys
import os

# Add backend directory to Python path so Django can find its modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Import and expose the Django WSGI application
from config.wsgi import application

# Vercel looks for a variable named `app` or `application`
app = application
