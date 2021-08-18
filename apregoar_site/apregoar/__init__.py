#https://exploreflask.com/en/latest/configuration.html
#https://flask.palletsprojects.com/en/2.0.x/tutorial/layout/

import os
import flask
from flask import Flask, g, render_template, request, flash
#from flask_sqlalchemy import SQLAlchemy
from apregoar.models import Stories, UGazetteer, Instances, Users
from sqlalchemy import text
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from flask_table import Table, Col
import json
import pandas as pd
#import geopandas as gpd
#import geojson

#global currentuser
#global currentuid


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
    
    
    engine = create_engine('postgresql://postgres:thesis2021@localhost/postgres', echo=True)
    Session = sessionmaker(bind=engine)
    session = Session()

#########################
###### IT BEGINS ########
#########################

#########################
###### Initializing sessions
#########################

    @app.before_request
    def create_sesion():
        flask.g.session = Session()
    
    @app.teardown_appcontext
    def shutdown_session(response_or_exc):
        flask.g.session.commit()
        flask.g.session.close()

#########################
###### Home
#########################
        
    @app.route('/')
    def home():
        #return '<a href="/addstory"><button> Click here to publish articles </button></a>'
        return render_template("layout.html")

#########################
###### Profile
#########################

    @app.route("/adduser")
    def adduser():
        return render_template("/profile/newuser.html")



    @app.route("/useradd", methods=['POST', 'GET'])
    def useradd():
        error = 0     
        uname = request.form["username"]
        password = request.form["password"]
        organization = request.form["organization"]         
        
        with engine.connect() as conn:
            print(uname)
            SQL = text("SELECT username FROM apregoar.users WHERE username = :x")
            SQL = SQL.bindparams(x=uname)
            result = conn.execute(SQL)
            count = 0
            for row in result:
                print("username:",row['username'])
                count += 1

            print(count)
        
        if count == 0:
            entryU = Users(uname, password, organization)
            session.add(entryU)
            session.commit()
            return render_template("profile/profile.html")

        else:
            return render_template("profile/newuser.html")



        
    @app.route("/login", methods=['GET'])
    def login():
        with engine.connect() as conn:
            SQL = text("SELECT username FROM apregoar.users")
            result = conn.execute(SQL)
            print(result)
            usernames=[]
            for row in result:
                usernames.append(row[0])

            print("usernames: ",usernames)
        
        return render_template("profile/login.html", unames=usernames) 




    @app.route("/confirmu", methods=["GET", "POST"])
    def confirmu():
        
        if request.method == 'POST':
            print("arrived at confirmu")
            global currentuser
            currentuser = request.form["selectuser"]
            print("current user is: "+currentuser)

                    #Retrieve current user ID

            with engine.connect() as conn:
                SQL = text("SELECT u_id FROM apregoar.users WHERE username = :x")
                SQL = SQL.bindparams(x=currentuser)
                result = conn.execute(SQL)
                print("results of query:")
                print(result)
                u_id=[]
                for row in result:
                    u_id.append(row[0])
                print(u_id)
                u_id=u_id[0]
                print("u_id for recording with story: ",u_id)
                global current_uid
                current_uid=u_id
                print("current_uid: ",current_uid)
                print()

            return render_template("profile/profile.html", currentuser=currentuser)
        
        else:
            return render_template("profile/login.html")


#########################
###### Publish
#########################
    
    @app.route("/addstory")
    def addstory():
        return render_template("publish/create.html")



    @app.route("/storyadd", methods=['POST'])
    def storyadd():
        #solve this user issue -- apparently globals are staying global
        #currentuser = "cwentling"
        #current_uid=1
        #title = "Jorge Romão, o artista que faz dos muros da graça telas para as suas pinturas"
        print("")
        print()
        print("currentuser is: ",currentuser)
        print()
        ##Required
        title = request.form["title"]
        pub_date = request.form["pubDate"]
        web_link =request.form["webLink"]
        publication =request.form["publication"]
        ##Optional
        summary =request.form["summary"]
        section = request.form["section"]
        tags = request.form["tags"]
        author = request.form["author"]
        #Global value
        u_id = current_uid
        #Prepare & Submit
        entry = Stories(title, summary, pub_date, web_link, section, tags, author, publication, u_id)
        session.add(entry)
        session.commit()
        return render_template("publish/review.html")



    @app.route("/test", methods=['POST', 'GET'])
    def test():
        #solve this user issue -- apparently globals are staying global
        currentuser = "cwentling"
        current_uid=1
        title = "Jorge Romão, o artista que faz dos muros da graça telas para as suas pinturas"
        SQL = text("SELECT * FROM apregoar.stories WHERE stories.title = :x")
        SQL = SQL.bindparams(x=title)
        SQLt = text("SELECT * FROM apregoar.stories")

        cstory_df = pd.read_sql(
            SQLt, 
            con=engine, 
            #schema='apregoar', 
            index_col='s_id', 
            columns=['s_id', 'title', 'pub_date', 'web_link', 'publication', 'summary', 'section', 'tags', 'author', 'u_id'],
            parse_dates=['pub_date']
        )
        cstory_df["pub_date"] = cstory_df['pub_date'].dt.strftime('%x')
        print(cstory_df.head())
        cstory=cstory_df.to_json(orient='records')
        cstory=json.loads(cstory) #parsed
        cstory=json.dumps(cstory)
        print(cstory)

        return render_template("publish/review.html", cstory=cstory)    




    @app.route("/add_instance")
    def addinstance():
        return render_template("publish/add_instance.html")



    
    @app.route("/viewmap")
    def viewmap():
        return render_template("publish/instance.html")




    @app.route("/localize")
    def localize():
        return render_template("publish/localize.html")

    #Users.__table__.create(engine)
    #Stories.__table__.create(engine)
    #UGazetteer.__table__.create(engine)
    #Instances.__table__.create(engine)
    

    return app