from flask import Flask

app = Flask(__name__)

from app import user_views
from app import publisher_views