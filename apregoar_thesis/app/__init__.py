from flask import Flask

app = Flask(__name__)
app.config.from_object("config.DevelopmentConfig")

import os
from flask import g
import flask
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import *
from sqlalchemy.orm import *
from geoalchemy2 import *



#ensure the instance folder exists
try:
    os.makedirs(app.instance_path)
except OSError:
    pass

engine = create_engine('postgresql://postgres:thesis2021@localhost/postgres', echo=False)
#Session = sessionmaker(bind=engine)
Session = sessionmaker(engine) #as per https://docs.sqlalchemy.org/en/14/orm/session_basics.html#basics-of-using-a-session
session = Session()

#########################
###### Initializing sessions
#########################



@app.before_request
def create_session():
    flask.g.session = Session()

    
@app.teardown_appcontext
def shutdown_session(response_or_exc):
    flask.g.session.commit()
    flask.g.session.close()

from app import user_views
from app import publisher_views
from app import jornal_views