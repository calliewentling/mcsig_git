from app import app

#https://exploreflask.com/en/latest/configuration.html
#https://flask.palletsprojects.com/en/2.0.x/tutorial/layout/

import os
import flask
from flask import Flask, g, render_template, request, flash, jsonify, make_response
#from flask_sqlalchemy import SQLAlchemy
#from apregoar.models import Stories, UGazetteer, Instances, Users, EGazetteer, SpatialAssoc
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
from flask import request, redirect, jsonify, make_response, render_template, session, redirect, url_for

#import geopandas as gpd
#import geojson

#global currentuser
#global currentuid

@app.route("/publisher/dashboard")
def publisher_dashboard():
    return render_template("publisher/dashboard.html", username=session["USERNAME"])

@app.route("/publisher/profile")
def publisher_profile():
    return render_template("publisher/profile.html")

@app.route("/addstory")
def addstory():
    return render_template("publisher/create.html")

@app.route("/storyadd", methods=['POST'])
def storyadd():
        #solve this user issue -- apparently globals are staying global
        #currentuser = "cwentling"
        #current_uid=1
        #title = "Jorge Romão, o artista que faz dos muros da graça telas para as suas pinturas"
    print("")
    print()
    print("currentuser is: ",session["USERNAME"])
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
    '''
    ##THIS MUST BE FIGURED OUT Pausing because first I need to redo the signin
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
    '''
    return render_template("publish/review.html")