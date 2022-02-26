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
from flask import request, redirect, jsonify, make_response, render_template, session as fsession, redirect, url_for
from app import engine, session, text
#import geopandas as gpd
#import geojson

#global currentuser
#global currentuid

###############
# Callies Notes
###############
# 
#Url_for redirects to the defined function, not the app.route or template

app.secret_key = '2b3c4ee1b3eea60976f2d55163bbd0f88613657a9260e7de60d4b97c04273460'

users = {} #is this necessary

@app.before_request
def before_request_func():
    #print("Test of before request")
    with engine.connect() as conn:
        SQL = text("SELECT * FROM apregoar.users")
        #print(SQL)            
        result = conn.execute(SQL)   
        #print("SQL executed")
        
        for row in result:
            #print(row)
            #print("username:",row['username'])
            #print("affiliation:",row['organization'])
            users[row['username']] = {
                "id": row["u_id"],
                "username": row['username'],
                "affiliation": row['organization'],
                "email": row['email']
            }

        #print(users)
        #print("Checkpoint end connect")  
    
    #https://pythonise.com/series/learning-flask/python-before-after-request


#########################
###### User login
#########################

@app.route("/sign-up", methods=["GET","POST"]) #Good to go!
def sign_up():
    if request.method == "POST":
        req = request.form
        missing = list()

        for k, v in req.items():
            if v =="":
                missing.append(k)
        
        if missing:
            feedback = f"Missing fields for {', '.join(missing)}"
            return render_template("publisher/sign_up.html", feedback=feedback)

        username = request.form.get("username")
        password = request.form.get("password")
        email = request.form.get("email")
        organization = request.form.get("affiliation")
        
        with engine.connect() as conn:
            print(username)
            SQL = text("SELECT username FROM apregoar.users WHERE username = :x")
            SQL = SQL.bindparams(x=username)
            result = conn.execute(SQL)
            count = 0
            for row in result:
                print("username:",row['username'])
                count += 1

            print(count)
        
        if count == 0:
            con = psycopg2.connect("dbname=postgres user=postgres password=thesis2021")
            cur = con.cursor()
            cur.execute("""
                INSERT INTO apregoar.users (username, password, organization, email)
                VALUES (%(username)s,%(password)s,%(organization)s,%(email)s)
                """,
                {'username':username,'password':password, 'organization':organization, 'email':email}
            )
            con.commit()
            print("User added to database")
            return redirect(url_for("sign_in"))
            #return render_template("user/sign_in.html")
        else:
            feedback=f"This username is already in use. Please select a new username."
            return render_template("publisher/sign_up.html", feedback=feedback)
    return render_template("publisher/sign_up.html")

@app.route("/publisher/sign-in", methods=["GET", "POST"])
def sign_in():
    print("Signin")
    if request.method == "POST":
        req = request.form
        username = req.get("username")
        password = req.get("password")
        print("Entered username: ", username)
        print("Entered password: ", password)

        with engine.connect() as conn:
            SQL = text("SELECT * FROM apregoar.users WHERE username = :x and password = :y")
            SQL = SQL.bindparams(x=username, y=password)
            print(SQL)
            result = conn.execute(SQL)   
            print("SQL executed")
            active_user = {}
                
            for row in result:
                print(row)
                print("username:",row['username'])
                print("affiliation:",row['organization'])
                active_user = {
                    username: {
                        "username": row['username'],
                        "affiliation": row['organization'],
                        "email": row['email'],
                        "id": row['u_id']
                    }
                }
                print("users dict: ",active_user)
            print("Checkpoint end connect")  


        #while result is not None: #Not using because result is always "not None", even if empty
        if username in active_user:
            print("Checkpoint results")
            #print(result[0])
            g.username = username
            fsession['username'] = username #!!!!
            print(fsession['username'])
            #session.modified = True
            print(fsession)
            print("Session user assigned")
            #return redirect(url_for("publisher/my_profile"))
            return redirect(url_for("pub_profile"))    
        else:
            print("Combo not found")
            feedback = f"Username/password combination not found. Please try again."
            return render_template("publisher/sign_in.html", feedback=feedback)

    return render_template("publisher/sign_in.html")

@app.route("/publisher/my_profile")
def pub_profile():
    if not fsession.get("username") is None:
        activeu = fsession.get("username")
        user = {
            "username": activeu,
            "email": users[activeu]["email"],
            "org": users[activeu]["affiliation"], 
            "id": users[activeu]["id"]
        }
        print("User id: ",user["id"])

        return render_template("publisher/my_profile.html", user=user)
    else:
        print("No username found in fsession")
        return redirect(url_for("sign_in"))

@app.route("/sign-out")
def sign_out():
    fsession.pop("username", None)
    return redirect(url_for("sign_in"))

@app.route("/profile/<username>")
def profile(username):
    user = None
    if username in users:
        user = users[username]
    return render_template("publisher/profile.html", username=username, user=user)

#########################
###### 
#########################

@app.route("/publisher/dashboard")
def publisher_dashboard():
    if not fsession.get("username") is None:
        activeu = fsession.get("username")
        user = {
            "username": activeu,
            "email": users[activeu]["email"],
            "org": users[activeu]["affiliation"], 
            "id": users[activeu]["id"]
        }
        print("User id: ",user["id"])

        return render_template("publisher/dashboard.html", username=user["username"])
    else:
        print("No username found in fsession")
        return redirect(url_for("sign_in"))

@app.route("/publisher/profile")
def publisher_profile():
    return render_template("publisher/profile.html")

@app.route("/addstory")
def addstory():
    with engine.connect() as conn:
        SQL = text("SELECT web_link FROM apregoar.stories")
        result = conn.execute(SQL)
        existing_urls = []
        for row in result:
            existing_urls.append(row["web_link"])
        print(existing_urls)
    return render_template("publisher/create.html", urls=existing_urls)

@app.route("/storyadd", methods=['POST'])
def storyadd():
    activeu = fsession.get("username")
    print("")
    print()
    print("current user is: ",activeu)
    u_id = users[activeu]["id"]
    u_org = users[activeu]["affiliation"]
    print("current user id is: ",u_id)
    print()
    
    story = {
        ##Required
        "title": request.form["title"],
        "pub_date": request.form["pubDate"],
        "web_link": request.form["webLink"],
        "publication": request.form["publication"],
        ##Optional 
        "summary": request.form["summary"],
            #Move these to review?
        "section" : request.form["section"],
        "tags": request.form["tags"],
        "author": request.form["author"]
    }

    if story["web_link"] in existing_urls:
        feedback = f"A história já existe no database: "+story["web_link"]
        flash(feedback, "warning")
        return render_template("publisher/create.html")
    
    return render_template("publisher/review.html", story=story)
    #return render_template("publisher/localize.html")    
            
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

    '''
    #Connect to database
    with engine.connect() as conn:
        SQL = text("SELECT s_id FROM apregoar.stories WHERE title =:t and publication =:p") #Should this be title per publication?
        SQL = SQL.bindparams(t=story["title"], p=story["publication"])
        result = conn.execute(SQL)
        print("Result = ",result)
        #If this story/publication combo already exists:
        sametitle = []
        for row in result:
            sametitle.append(row["s_id"])
        if len(sametitle) > 0:
            s_ids = str(sametitle)
            feedback = f"Já existe a manchete de '"+story["title"]+"': "+s_ids+"."
            print(feedback)
            flash(feedback, "warning")
    '''
    