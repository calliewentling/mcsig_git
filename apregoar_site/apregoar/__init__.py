#https://exploreflask.com/en/latest/configuration.html
#https://flask.palletsprojects.com/en/2.0.x/tutorial/layout/

import os
import flask
from flask import Flask, g, render_template, request, flash, jsonify, make_response
#from flask_sqlalchemy import SQLAlchemy
from apregoar.models import Stories, UGazetteer, Instances, Users, EGazetteer, SpatialAssoc
from sqlalchemy import text
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from flask_table import Table, Col
import json
import geojson
import shapely.wkt
import psycopg2
from shapely.geometry import shape
import pandas as pd
from sqlalchemy import *
from sqlalchemy.orm import *
from geoalchemy2 import *
from shapely.geometry import Polygon
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
    
    #current_sid = 15
    #current_uid=1
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
###### Search
#########################
    @app.route('/search_map')
    def search_map():
        with engine.connect() as conn:
            SQL = text("SELECT * FROM apregoar.ugazetteer LEFT JOIN  apregoar.instances ON ugazetteer.p_id = instances.p_id")
        return render_template("/search/results_map.html")

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
            login()
            return render_template("layout.html")

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

    @app.route("/profile", methods=['POST'])
    def profile():
        return render_template("profile/profile.html")


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
        #Retreive the s_id
        with engine.connect() as conn:
                SQL = text("SELECT s_id FROM apregoar.stories WHERE title = :x")
                SQL = SQL.bindparams(x=title)
                result = conn.execute(SQL)
                for row in result:
                    s_id=row['s_id']
                    print(s_id)
                    global current_sid
                    current_sid=s_id
        return render_template("publish/review.html")


    """     ##This should be layered back into "storyadd", from "create.html" to populate current story on "Review.html"
    @app.route("/test", methods=['POST', 'GET'])
    def test():
        #solve this user issue -- apparently globals are staying global
        #currentuser = "cwentling"
        #current_uid=1
        #title = "Jorge Romão, o artista que faz dos muros da graça telas para as suas pinturas"
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
        cstory = cstory_df.to_json(orient="values")
        cstory = json.dumps(cstory)
        print(cstory)

        return render_template("publish/review.html", cstory=cstory)     """



    
    @app.route("/localize", methods=["GET", "POST"])
    def localize():
        return render_template("publish/localize.html")



    @app.route("/save_instance", methods=["POST"])
    def save_instance():
        con = psycopg2.connect("dbname=postgres user=postgres password=thesis2021")
        cur = con.cursor()
        # These should be global but aren't
        #u_id = current_uid
        #print(u_id)
        s_id = current_sid
        print(s_id)
        ## Comment these badboys out once the above is figured out
        u_id = 1
        print("forcing UID = 1 since not yet global")
        #s_id = 1
        #print("forcing s_id = 1 since not yet global")

        #Results from user input on localize
        req = request.get_json()
        print(req)
        res = make_response(jsonify(req), 200)
        #Transforming Temporal and descriptions from user input
        instance = req["properties"]
        print(instance)
        p_name = instance["pName"]
        p_desc = instance["pDesc"]
        t_begin = instance["tBegin"]
        t_end = instance["tEnd"]
        t_type = instance["tType"]
        t_desc = instance["tDesc"]
        #Extract geometry in correct format from user input
        idx=0
        features = req['geometry']
        features = json.loads(features)
        for idx, val in enumerate(features): #supports multiple polygons with the same temporal description
            coords=features[idx]['geometry']['coordinates'][0] #extracting coordinates
            print()
            print("coords: ")
            print(coords)
            #Switch coordinate order here
            shape=Polygon(coords)
            print()
            print("shape: ")
            print(shape)
            shapeWKT=shape.to_wkt()
            pentry = UGazetteer(p_name, shapeWKT, u_id)
            print()
            print("pentry: ")
            print(pentry)
            
            session.add(pentry)
            session.commit()
            print("feature committed!")
            #determine place ID to associate to instance
            p_id=None
            with engine.connect() as conn:
                SQL = text("SELECT p_id FROM apregoar.ugazetteer WHERE p_name = :x AND u_id =:y ORDER BY p_id DESC LIMIT 1")
                SQL = SQL.bindparams(x=p_name, y=u_id)
                result = conn.execute(SQL)
                print("current assigned p_id: ",p_id)
                for row in result:
                    p_id=row['p_id']
                    print(p_id)
            #Save instance for each geometry with associated p_id
            ientry = Instances(t_begin, t_end, t_type, t_desc, p_desc, s_id, p_id, u_id)
            session.add(ientry)
            session.commit()
            cur.execute("""
                SELECT e_id, name
                FROM apregoar.egazetteer AS egaz
                WHERE ST_Intersects(
                    egaz.geom,
                    (
                        SELECT geom
                        FROM apregoar.ugazetteer
                        WHERE p_id = %(pgeom)s
                        ORDER BY p_id DESC LIMIT 1
                    )
                );""",
                {'pgeom':p_id,}
            )
            autoP = cur.fetchall()
            print(autoP)

            with engine.connect() as conn:
                for i in autoP:
                    print(i[0])
                    cur.execute("""
                        INSERT INTO apregoar.spatial_assoc (place_id, freguesia_id)
                        VALUES (%(id)s,%(e_id)s)
                        """,
                        {'id':p_id,'e_id':i[0]}
                    )
            con.commit()
            print("spatial association complete!")
            print("Instance committed!!")
        print("places and instances saved!")
    
        return res
        #Make localize show text that says: success! and then a button to return to review


    @app.route("/storyreview", methods=['POST'])
    def storyreview():
        return render_template("publish/review.html")


    ## INITIALIZE TABLES
    #Users.__table__.create(engine)
    #Stories.__table__.create(engine)
    #UGazetteer.__table__.create(engine)
    #Instances.__table__.create(engine)
    #EGazetteer.__table__.create(engine)
    #SpatialAssoc.__table__.create(engine)
    
    #TESTING
    @app.route("/testpage")
    def testpage():
        return render_template("x_practice/quickstart.html")

    return app