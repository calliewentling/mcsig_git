from pytz import NonExistentTimeError
from app import app

#https://exploreflask.com/en/latest/configuration.html
#https://flask.palletsprojects.com/en/2.0.x/tutorial/layout/

import os
import flask
from flask import Flask, g, render_template, request, flash, jsonify, make_response, json
#from flask_sqlalchemy import SQLAlchemy
#from apregoar.models import Stories, UGazetteer, Instances, Users, EGazetteer, SpatialAssoc
from sqlalchemy import text
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from flask_table import Table, Col
import json
import geojson
import shapely.wkt as wkt
import shapely.wkb as wkb
import psycopg2
import pandas as pd
import datetime
from sqlalchemy import *
from sqlalchemy.orm import *
from geoalchemy2 import *
from geoalchemy2.shape import from_shape
import shapely
import shapely.wkt
#import osgeo.ogr
from shapely.geometry import Polygon, MultiPolygon
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
                "u_id": row["u_id"],
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

@app.route("/publisher/sign_up", methods=["GET","POST"])
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
                                RETURNING u_id
                                ;""",
                                {'username':username,'password':password, 'organization':organization, 'email':email}
                            )
                            u_id = cur.fetchone()[0]
                            print("New user id: ",u_id)
                            con.commit()
                            cur.close()
                except:
                    print("Error in saving new user")
                    feedback=f"Erro"
                    flash(feedback, "danger")
                    cur.close()
                else:
                    print("User added to database")
                    return redirect(url_for("sign_in"))
            else:
                feedback=f"This username is already in use. Please select a new username."
                return render_template("publisher/sign_up.html", feedback=feedback)
    return render_template("publisher/sign_up.html")

@app.route("/publisher/sign_in", methods=["GET", "POST"])
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
                        "u_id": row['u_id']
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
                fsession['u_id'] = user[username]["u_id"]
                fsession['org'] = user[username]["affiliation"]
                fsession['email'] = user[username]["email"]
                print("fsession: ",fsession)
                #session.modified = True
                print("Session user assigned")
                return redirect(url_for("publisher_dashboard"))    
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
            "u_id": fsession["u_id"]
        }
        print("User id: ",user["u_id"])

        return render_template("publisher/my_profile.html", user=user)
    else:
        print("No username found in fsession")
        return redirect(url_for("sign_in"))

@app.route("/publisher/sign_out")
def sign_out():
    fsession.pop("username", None)
    fsession.pop("email", None)
    fsession.pop("u_id", None)
    fsession.pop("org", None)
    print("fsession: ",fsession)
    return redirect(url_for("sign_in"))
'''
@app.route("/profile/<username>")
def profile(username):
    user = None
    if username in users:
        user = users[username]
    return render_template("publisher/profile.html", username=username, user=user)
'''
#########################
###### Dashboard and Profile
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
                        "title": row["title"],                            
                        "date": row["pub_date"]
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
            return render_template("publisher/dashboard.html", username=fsession["username"], uID = fsession["u_id"], organization=fsession["org"], userStories = user_stories, orgStories = org_stories)
    else:
        print("No username found in fsession")
        feedback=f"Não há um user ativo."
        flash(feedback,"danger")
        return redirect(url_for("sign_in"))

@app.route("/publisher/profile")
def publisher_profile():
    return render_template("publisher/my_profile.html")

#########################
###### New Story
#########################

@app.route("/publisher/addstory")
def addstory():
    return render_template("publisher/create.html")




@app.route("/publisher/<s_id>/review", methods=["GET","POST"])
def review_e(s_id):
    print({s_id})
    if request.method =="POST":
        delete_req = request.form.to_dict()
        print(delete_req)
        delete_inst = []
        delete_story = []
        for key in delete_req.keys():
            if "deleteStory" in key:
                key = int(key[11:])
                delete_story.append(key)
                print("key type: ",type(key))
                print("We're deleting a story (ID: ",key,")! Continue dev here!")
                print("The story key of the page = ",s_id)
                #Delete story and related instances
                
                try:
                    with engine.connect() as conn:
                        print("Arrived in try")
                        SQL = "SELECT i_id FROM apregoar.instances WHERE s_id = %(s_id)s"
                        #result = conn.execute(SQL)
                        #SQL = "SELECT i_id FROM apregoar.instances WHERE s_id IN %(s_id)s"
                        result = conn.execute(SQL, {
                            's_id': s_id
                        })
                        print("Did we make it here?")
                        delete_i = []
                        for i in result:
                            delete_i.append(i["i_id"])
                        print("Related instances: ", delete_i, " Totalling: ", len(delete_i))
                        print("Associated places not deleted... yet!")
                        #Testing here
                        SQL2 = "DELETE FROM apregoar.instances WHERE s_id = %(s_id)s"
                        conn.execute(SQL2, {
                            's_id': s_id,
                        })
                        print("Instances deleted")
                        SQL3 = "DELETE FROM apregoar.stories WHERE s_id = %(s_id)s"
                        conn.execute(SQL3, {
                            's_id': s_id
                        })
                        print("Story deleted")
                
                except: 
                    conn.close()
                    print("Error in finding story, related instances and places")
                    feedback=f"Erro na eliminação"
                    flash(feedback,"danger")
                else:
                    conn.close()
                    num_i_d=str(len(delete_i))
                    print("Successfully deleted story and ",len(delete_i),"associated instances")
                    feedback = "Notícia e "+num_i_d+" instâncias reletadas eliminadas"
                    flash(feedback, "success")
                    #We should go to the next scenario
                    return redirect(url_for("publisher_dashboard")) 
                
            else: #Assuming that we're deleting an instance
                key = int(key[8:]) #Extract instance key (ignore "instance", capture number)
                delete_inst.append(key)
                delete_inst
                print(delete_inst)
        try:
            with engine.connect() as conn:
                SQL = "SELECT p_id FROM apregoar.instances WHERE i_id IN %(delete_inst)s"
                result = conn.execute(SQL, {
                    'delete_inst': tuple(delete_inst),
                })
                delete_p = []
                for i in result:
                    delete_p.append(i["p_id"])
                print("p_ids: ",delete_p)
                SQL2 = "DELETE FROM apregoar.instances WHERE i_id IN %(delete_inst)s"
                conn.execute(SQL2, {
                    'delete_inst': tuple(delete_inst),
                })
                #Functional... but should this remain, or should locations be deleted separately?
                """
                SQL3 = "DELETE FROM apregoar.ugazetteer WHERE p_id IN %(delete_p)s"
                conn.execute(SQL3, {
                    'delete_p': tuple(delete_p),
                })
                """
                        
        except:
            conn.close()
            print("Error in finding related stories")
            feedback=f"Erro na eliminação"
            flash(feedback,"danger") 
        else:
            conn.close()
            numInstDel = str(len(delete_inst))
            feedback = numInstDel+" instâncias eliminadas"
            flash(feedback, "success")
                    

    # Normal behavior: load review
    try:
        with engine.connect() as conn:
            SQL = text("SELECT * FROM apregoar.stories WHERE s_id = :x")
            SQL = SQL.bindparams(x=s_id)
            result = conn.execute(SQL)
            conn.close()
    except:
        conn.close()
        print("Error in extracting desired story from database")
        feedback=f"Erro"
        flash(feedback,"danger")
    else:
        story = {}
        for row in result:
            story = row
        print(story)
        if story:
            try:
                with engine.connect() as conn:
                    SQL = text("SELECT * FROM apregoar.instances i LEFT JOIN apregoar.ugazetteer u ON i.p_id = u.p_id WHERE s_id = :x")
                    SQL = SQL.bindparams(x=s_id)
                    print(SQL)
                    result = conn.execute(SQL)
            except:
                print("Error in extracting instances for this story")
                feedback=f"Não consiguimos de procurar as instâncias da história"
                flash(feedback, "warning")
                return render_template("publisher/review.html", story=story, sID = s_id, instances=[])
            else:
                instances = []
                for row in result:
                    instance = {
                        row["i_id"] : {
                            "p_name": row["p_name"],
                            "t_begin": row["t_begin"].date(),
                            "t_end": row["t_end"].date()
                        }
                    }
                    instances.append(instance)
                print(instances)
                return render_template("publisher/review.html", story=story, sID = s_id, instances=instances) #
        else:
            feedback = f"No valid story selected"
            flash(feedback, "danger")

    return render_template("publisher/dashboard.html")


@app.route("/publisher/review", methods=['POST'])
def review():
    print()
    print("current user is: ",fsession["username"])
    print("current user id is: ",fsession["u_id"]) 
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
                        RETURNING s_id
                        ;""",
                        {'title':story["title"],'summary':story["summary"], 'pub_date':story["pub_date"], 'web_link': story["web_link"], 'section': story["section"], 'tags': story["tags"], 'author': story["author"], 'publication':story["publication"], 'u_id':fsession["u_id"]}
                    )
                    s_id = cur.fetchone()[0]
                    con.commit()
                    print("Story added to database. s_id: ",s_id)
            con.close()
        except psycopg2.Error as e:
            #If not submitted, attempt to create again
            print(e.pgerror)
            print(e.diag.message_primary)
            feedback = f"Excepção: a história não ficou guardada. Erro: "+e.pgerror+", "+e.diag.message_primary
            flash(feedback, "danger")
            con.close()
            return render_template("publisher/create.html")
        else:
            story["s_id"] = s_id
            return render_template("publisher/review.html", story=story, sID = s_id)
    
    return render_template("publisher/dashboard.html")

#########################
###### New Instance
#########################
            
@app.route("/publisher/<s_id>/localize", methods=["GET", "POST"])
def localize(s_id):
    print({s_id})
    try:
        with engine.connect() as conn:
            SQL = text("SELECT * FROM apregoar.stories WHERE s_id = :x")
            SQL = SQL.bindparams(x=s_id)
            result = conn.execute(SQL)
    except:
        conn.close()
        print("Error in extracting desired story from database")
        feedback=f"Erro"
        flash(feedback,"danger")
    else:
        conn.close()
        story = {}
        for row in result:
            story = row
        print(story)
        egaz_area = []
        egaz_freguesia = []
        egaz_concelho = []
        egaz_extra = []
        if story:
            try:
                with engine.connect() as conn:
                    SQL2 = text("SELECT * FROM apregoar.admin_gaz")
                    result2 = conn.execute(SQL2)
            except:
                print("Extraction of admin gazetteer unsuccessful")
                conn.close()
                print("Error in extracting Existing Admin gazetteer from database")
                feedback = f"Não conseguimos de carregar localizações existentes"
                flash(feedback,"warning")
                print("No egaz")
                return render_template("publisher/localize.html", story=story, sID = s_id, eGazF=egaz_freguesia)
            else:
                conn.close()
                print("Successful extraction of egazetteer!")
                for row in result2:                  
                    entry_egaz = {
                        "e_ids": row["e_ids"],
                        #"type": row["type"],
                        "name": row["name"],
                        #"geom": row["t_geom"]
                    }
                    if row["type"] == "freguesia":
                        egaz_freguesia.append(entry_egaz)
                    elif row["type"] == "Concelho":
                        egaz_concelho.append(entry_egaz)
                    elif row["type"] == "Área Administrativa":
                        egaz_area.append(entry_egaz)
                    else:
                        egaz_extra.append(entry_egaz)
                print("Number of egazetteer freguesia entries extracted: ",len(egaz_freguesia))
                
                return render_template("publisher/localize.html", story=story, sID = s_id, eGazF=egaz_freguesia, eGazC=egaz_concelho, eGazA = egaz_area, eGazX = egaz_extra)
        else:
            feedback = f"No valid story selected"
            flash(feedback, "danger")
    
    return render_template("publisher/dashboard.html")

@app.route("/publisher/<i_id>/edit_instance", methods=["GET", "POST"])
def edit_instance(i_id):
    print("Instance ID: ",{i_id})
    try:
        with engine.connect() as conn:
            SQL = text("""
                SELECT * 
                FROM ( SELECT *
                        FROM apregoar.instances i
                            LEFT JOIN apregoar.stories s ON i.s_id = s.s_id
                        WHERE i_id = :x) AS si
                    LEFT JOIN apregoar.ugazetteer u ON si.p_id = u.p_id;
                """)
            SQL = SQL.bindparams(x=i_id)
            result = conn.execute(SQL)
    except:
        print("Error in extracting desired instance from database")
        feedback=f"Erro"
        flash(feedback,"danger")
    else:
        instance = {}
        for row in result:
            instance = row
        print(instance)
        if instance:
            d_begin = instance["t_begin"].date()
            d_end = instance["t_end"].date()
            print(d_begin)
            print(d_end)
            return render_template("publisher/instance.html", instance=instance, dBegin = d_begin, dEnd = d_end)
        else:
            feedback = f"No valid instance selected"
            flash(feedback, "danger")
    
    return render_template("publisher/dashboard.html")



@app.route("/publisher/<s_id>/save_instance", methods=["POST"])
def save_instance(s_id):
    #Results from user input on localize
    req = request.get_json()
    print()
    print("Received: ")
    print(req)
    print()
    res = make_response(jsonify(req), 200)
    u_id = fsession["u_id"]
    print("Story id: ",s_id,", User ID: ",u_id)
    print()
    
    #Transforming Temporal and descriptions from user input
    instance = req["properties"]
    print("instance: ",instance)
    print()
    p_name = instance["pName"]
    p_desc = instance["pDesc"]
    all_day = instance["allDay"]
    t_begin = instance["tBegin"]
    t_end = instance["tEnd"]
    t_desc = instance["tDesc"]
    e_ids = instance["eIds"]

    #Extract geometry in correct format from user input
    #UGaz
    idx=0
    features = req['geometry']
    print("Features1: ",features)

    #Extract tempoarl element
    print()
    print("All day? ",all_day)
    print("t_begin before: ",t_begin)
    print("t_end before: ",t_end)
    print()
    if all_day in ["date"]:
        t_begin = t_begin+"T00:00"
        t_end = t_end+"T23:59"
    print("t_begin type: ",type(t_begin))
    print("t_begin: ",t_begin)
    print("t_end type: ",type(t_end))
    print("t_end: ",t_end)

    #Extract e_ids
    print("e_ids: ",e_ids)

    #Define connection
    con = psycopg2.connect("dbname=postgres user=postgres password=thesis2021")

    #Extract and Save UGaz (if exists)
    if features:
        print("There are UGaz features")
        features = json.loads(features)
        print("Features2: ")
        print(features)
        multiShape=[]
        shapeP = None
        for idx,val in enumerate(features): #supports multiple polygons with the same temporal description
            coords=features[idx]['geometry']['coordinates'][0] #extracting coordinates
            shapeP = Polygon(coords)
            multiShape.append(shapeP) 
        print("Length of Multishape (number of polygons): ", len(multiShape))
        multiP = MultiPolygon(multiShape)
        print("multiP wkt: ",multiP.wkt)

        #Save place to database
        try:
            with con:
                with con.cursor() as cur:
                    cur.execute("""
                        INSERT INTO apregoar.ugazetteer (p_name, geom, u_id, p_desc) 
                        VALUES (%(p_name)s, ST_GeomFromEWKT(%(geom)s), %(u_id)s, %(p_desc)s)
                        RETURNING p_id
                        ;""",
                        {'p_name':p_name, 'geom':multiP.wkt, 'u_id':u_id, 'p_desc':p_desc}
                    )
                    p_id = cur.fetchone()[0]
                    con.commit()            
        except psycopg2.Error as e:
            print("Error in saving new place")
            print(e.pgerror)
            print(e.diag.message_primary)
            #feedback = f"Erro: não consiguimos de guardar o novo lugar. Se faz favor, tenta de novo."
            #flash(feedback, "danger")
            con.close()
            return res
        else:
            print("Place added to database. p_id: ",p_id)
            instance["p_id"] = p_id
    else:
        print("No UGAZ features assigned")
        p_id = None

    #Save instance to database
    try: 
        with con:
            with con.cursor() as cur:
                cur.execute("""
                    INSERT INTO apregoar.instances (t_begin, t_end, t_desc, p_desc, s_id, p_id, u_id, t_type, p_name) 
                    VALUES (%(t_begin)s, %(t_end)s, %(t_desc)s, %(p_desc)s, %(s_id)s, %(p_id)s, %(u_id)s, %(t_type)s, %(p_name)s)
                    RETURNING i_id
                    ;""",
                    {'t_begin':t_begin, 't_end':t_end, 't_desc':t_desc, 'p_desc':p_desc, 's_id':s_id, 'p_id':p_id, 'u_id':u_id, 't_type':all_day,'p_name':p_name}
                )
                i_id = cur.fetchone()[0]
                con.commit()
                con.close
    except psycopg2.Error as e:
        print("Error in saving new instance: ",e)
        #feedback = f"Erro: não consiguimos de guardar a nova instância. Se faz favor, tenta de novo."
        #flash(feedback, "danger")
        con.close()
        return res
    else:
        print("Instance added to database. i_id: ",i_id)
        instance["i_id"]=i_id
        print(e_ids)
        if e_ids:
            print("e_ids: ",e_ids)
            for e_id in e_ids:
                e_id.strip("'")
                print("e_id",e_id)
                try:
                    with con:
                        with con.cursor() as cur:
                            cur.execute("""
                                INSERT INTO apregoar.instance_positioning (i_id, e_id, explicit)
                                VALUES (%(i_id)s, %(e_id)s, %(explicit)s)
                                ;""",
                                {'i_id':i_id, 'e_id':e_id,'explicit':True}
                            )
                            #result = cur.fetchone()[0]
                            #print("result of save: ",result)
                    con.commit()
                except psycopg2.Error as e:
                    print("Error in saving new instance to EGaz: ",e)
                    con.close()
                    return res
                else:    
                    print("instance associated with explicit existing gazetteers")
            con.close()
            print("saving of instance positioning complete!")
        else:
            print("no e_ids")
 
    return res

    print("Why is this reaching here??") 