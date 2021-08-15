#https://exploreflask.com/en/latest/configuration.html
#https://flask.palletsprojects.com/en/2.0.x/tutorial/layout/

import os

from flask import Flask, render_template, request, flash
from flask_sqlalchemy import SQLAlchemy

def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    #app.config.from_pyfile('config.py') #Access configuration variables via app.config["VAR_NAME"], Load the default configuration

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    

#### It's on
    
    from apregoar.models import Stories, session, engine
            
    @app.route('/')
    def home():
        return '<a href="/addstory"><button> Click here to publish articles </button></a>'
    

    
    @app.route("/addstory")
    def addstory():
        return render_template("layout.html")


    @app.route("/storyadd", methods=['POST'])
    def personadd():
        title = request.form["title"]
        summary =request.form["summary"]
        pub_date = request.form["pub_date"]
        web_link =request.form["web_link"]
        section = request.form["section"]
        tags = request.form["tags"]
        author = request.form["author"]
        publication =request.form["publication"]
        entry = Stories(title, summary, pub_date, web_link, section, tags, author, publication)
        session.add(entry)
        session.commit()

        return render_template("layout.html")

    #Stories.__table__.create(engine)

    return app

    #from . import auth
    #app.register_blueprint(auth.bp)

    #from . import blog
    #app.register_blueprint(blog.bp)
    #app.add_url_rule('/', endpoint='index')

   ## Run to initialize table in Postgresql
    

    # @app.route("/favicon.ico")
    # def favicon():
    #     return "", 200



## Moved to models.py or config.py
#from sqlalchemy import create_engine
#engine = create_engine('postgresql://postgres:thesis2021@localhost/postgres', echo=True)
#Base = declarative_base()
#from sqlalchemy.ext.declarative import declarative_base
#from sqlalchemy import Column, Integer, String
#from geoalchemy2 import Geometry