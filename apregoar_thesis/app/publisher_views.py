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
    #Load all users (valid for sign in)
    try:
        with engine.connect() as conn:
            SQL = text("SELECT * FROM apregoar.users")
            #print(SQL)            
            result = conn.execute(SQL)   
            #print("SQL executed")
            
            
    except:
        print("Error in connecting!")
        feedback = f"Erro!"
        flash(feedback, "danger")
    else:
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

    finally:
        conn.close()


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
        
        try:
            with engine.connect() as conn:
                print(username)
                SQL = text("SELECT username FROM apregoar.users WHERE username = :x")
                SQL = SQL.bindparams(x=username)
                result = conn.execute(SQL)
        except:
            print("Error in validating unique username")
            feedback=f"Erro"
            flash(feedback, "danger")
        else:
            count = 0
            for row in result:
                print("username:",row['username'])
                count += 1
            print(count)
            if count == 0:
                con = psycopg2.connect("dbname=postgres user=postgres password=thesis2021")
                try:
                    with con:
                        with con.cursor() as cur:
                            cur.execute("""
                                INSERT INTO apregoar.users (username, password, organization, email)
                                VALUES (%(username)s,%(password)s,%(organization)s,%(email)s)
                                """,
                                {'username':username,'password':password, 'organization':organization, 'email':email}
                            )
                            con.commit()
                except:
                    print("Error in saving new user")
                    feedback=f"Erro"
                    flash(feedback, "danger")
                else:
                    print("User added to database")
                    return redirect(url_for("sign_in"))
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
        try:
            with engine.connect() as conn:
                SQL = text("SELECT * FROM apregoar.users WHERE username = :x and password = :y")
                SQL = SQL.bindparams(x=username, y=password)
                print(SQL)
                result = conn.execute(SQL)   
                print("SQL executed")
        except:
            print("Error in validating username password combo")
            feedback = f"Erro"
            flash(feedback,"danger")
        else:
            user = {}
            for row in result:
                user = {
                    username: {
                        "username": row['username'],
                        "affiliation": row['organization'],
                        "email": row['email'],
                        "id": row['u_id']
                    }
                }
                print("users dict: ",user)
            print("Checkpoint end connect")  


            #while result is not None: #Not using because result is always "not None", even if empty
            if username in user:
                print("Checkpoint results")
                #print(result[0])
                #g.username = username
                fsession['username'] = username #!!!!
                fsession['u_id'] = user[username]["id"]
                fsession['org'] = user[username]["affiliation"]
                fsession['email'] = user[username]["email"]
                print("fsession: ",fsession)
                #session.modified = True
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
        user = {
            "username": fsession["username"],
            "email": fsession["email"],
            "org": fsession["org"], 
            "id": fsession["u_id"]
        }
        print("User id: ",user["id"])

        return render_template("publisher/my_profile.html", user=user)
    else:
        print("No username found in fsession")
        return redirect(url_for("sign_in"))

@app.route("/sign-out")
def sign_out():
    fsession.pop("username", None)
    fsession.pop("email", None)
    fsession.pop("id", None)
    fsession.pop("org", None)
    print("fsession: ",fsession)
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
        print(fsession["username"])

        try:
            with engine.connect() as conn:
                SQL = text("SELECT * FROM apregoar.stories WHERE u_id = :x")
                SQL = SQL.bindparams(x=fsession["u_id"])
                result = conn.execute(SQL)
        except:
            print("Error in identifying stories from user")
            feedback=f"Erro"
            flash(feedback, "danger")
        else:
            user_stories = []
            for row in result:
                u_story = {
                    row["s_id"] : {
                        "title": row["title"],                            "date": row["pub_date"]
                    } 
                }
                user_stories.append(u_story)
        finally: conn.close()

        try:
            with engine.connect() as conn:
                SQL = text("SELECT * FROM apregoar.stories WHERE publication = :x")
                SQL = SQL.bindparams(x=fsession["org"])
                result = conn.execute(SQL)
        except:
            print("Error in identifying stories from user publication")
            feedback=f"Erro"
            flash(feedback,"danger")
        else:
            org_stories = []
            o_story = {}
            for row in result:
                o_story = {
                    row["s_id"] : {
                        "title": row["title"],
                        "date": row["pub_date"]
                    } 
                }
                org_stories.append(o_story)
            print()
            print("last added story: ",o_story)
            print("all stories associated with this organization: ",org_stories)
            print()
            return render_template("publisher/dashboard.html", username=fsession["username"], organization=fsession["org"], userStories = user_stories, orgStories = org_stories)
    else:
        print("No username found in fsession")
        feedback=f"Não há um user ativo."
        flash(feedback,"danger")
        return redirect(url_for("sign_in"))

@app.route("/publisher/profile")
def publisher_profile():
    return render_template("publisher/profile.html")

@app.route("/addstory")
def addstory():
    return render_template("publisher/create.html")


@app.route("/<s_id>/review")
def review_e(s_id):
    print({s_id})
    try:
        with engine.connect() as conn:
            SQL = text("SELECT * FROM apregoar.stories WHERE s_id = :x")
            SQL = SQL.bindparams(x=s_id)
            result = conn.execute(SQL)
    except:
        print("Error in extracting desired story from database")
        feedback=f"Erro"
        flash(feedback,"danger")
    else:
        story = {}
        for row in result:
            story = row
        print(story)
        if story:
            return render_template("publisher/review.html", story=story)
    
    return render_template("publisher/dashboard.html")


@app.route("/review", methods=['POST'])
def review():
    print()
    print("current user is: ",fsession["username"])
    print("current user id is: ",fsession["id"])
    print()

    try:
        with engine.connect() as conn:
            SQL = text("SELECT web_link FROM apregoar.stories")
            result = conn.execute(SQL)
    except:
        print("Error in extracting desired story from database")
        feedback=f"Erro"
        flash(feedback,"danger")
    else:
        existing_urls = []
        for row in result:
            existing_urls.append(row["web_link"])
        print(existing_urls)
    
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

        #Prepare & Submit
        con = psycopg2.connect("dbname=postgres user=postgres password=thesis2021")
        try:
            with con:
                with con.cursor() as cur:
                    cur.execute("""
                        INSERT INTO apregoar.stories (title, summary, pub_date, web_link, section, tags, author, publication, u_id)
                        VALUES (%(title)s,%(summary)s,%(pub_date)s,%(web_link)s,%(section)s, %(tags)s, %(author)s,%(publication)s,%(u_id)s)
                        """,
                        {'title':story["title"],'summary':story["summary"], 'pub_date':story["pub_date"], 'web_link': story["web_link"], 'section': story["section"], 'tags': story["tags"], 'author': story["author"], 'publication':story["publication"], 'u_id':fsession["u_id"]}
                    )
                    con.commit()
                    print("Story added to database")
            con.close()
        except psycopg2.Error as e:
            print(e.pgerror)
            print(e.diag.message_primary)
            feedback = f"Excepção: a história não ficou guardada. Erro: "+e.pgerror+", "+e.diag.message_primary
            flash(feedback, "danger")
            con.close()
        else:
            return render_template("publisher/review.html",story=story)
    
    return render_template("publisher/create.html")
            
    