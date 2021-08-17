#https://exploreflask.com/en/latest/blueprints.html
from flask import Blueprint, render_template
from ..models import User

profile = Blueprint('profile', __name__)

@profile.url_value_preprocessor
def get_profile_owner(endpoint, values):
    query = User.query.filter_by(url_slug=values.pop('user_url_slug'))
    g.profile_owner = query.first_or_404()

@profile.route('/')
def about(user_url_slug):
    #do some stuffs
    return render_template('profile.html')