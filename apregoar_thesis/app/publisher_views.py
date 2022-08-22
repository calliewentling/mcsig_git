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
'''
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
                                INSERT INTO apregoar.users (username, password, organization, email,created,edited)
                                VALUES (%(username)s,%(password)s,%(organization)s,%(email)s,NOW(),NOW())
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
                    conn.rollback()
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
        return redirect(url_for("sign_inU", login_source = "publisher"))

@app.route("/publisher/publication")
def publisher_profile():
    return render_template("publisher/publication.html")

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
        con = psycopg2.connect("dbname=postgres user=postgres password=thesis2021")
        for key in delete_req.keys():
            if "deleteStory" in key:
                key = int(key[11:])
                delete_story.append(key)
                print("key type: ",type(key))
                print("We're deleting a story (ID: ",key,")! Continue dev here!")
                print("The story key of the page = ",s_id)
                #Delete story and related instances
                try:
                    with con:
                        with con.cursor() as cur:
                            print("Arrived in Delete entire story")
                            SQL = "SELECT i_id FROM apregoar.instances WHERE s_id = %(s_id)s"
                            result = cur.execute(SQL, {
                                's_id': s_id
                            })
                            print("Did we make it here?")
                            delete_i = []
                            if result:
                                for i in result:
                                    print("i: ",i)
                                    delete_i.append(i["i_id"])
                                print("Related instances: ", delete_i, " Totalling: ", len(delete_i))
                                print("Associated places not deleted... yet!")
                                #Testing here
                                SQL2 = "DELETE FROM apregoar.instances WHERE s_id = %(s_id)s"
                                cur.execute(SQL2, {
                                    's_id': s_id,
                                })
                                print("Instances deleted")
                            SQL3 = "DELETE FROM apregoar.stories WHERE s_id = %(s_id)s"
                            cur.execute(SQL3, {
                                's_id': s_id
                            })
                            print("Story deleted")
                
                except: 
                    con.rollback()
                    con.close()
                    print("Error in finding story, related instances and places")
                    feedback=f"Erro na eliminação"
                    flash(feedback,"danger")
                else:
                    con.commit()
                    num_i_d=str(len(delete_i))
                    print("Successfully deleted story and ",len(delete_i),"associated instances")
                    feedback = "Notícia e "+num_i_d+" instâncias reletadas eliminadas"
                    flash(feedback, "success")
                    #We should go to the next scenario
                    return redirect(url_for("publisher_dashboard")) 
                
            else: #Assuming that we're deleting an instance
                key = int(key[8:]) #Extract instance key (ignore "instance", capture number)
                delete_inst.append(key)
                print("Instance for deletion: ",delete_inst)
        try:
            with con:
                with con.cursor() as cur:
                    print("Entering delete sequences for: ", delete_inst)
                    cur.execute("DELETE FROM apregoar.instance_ugaz WHERE i_id = ANY (%s);", (delete_inst,))
                    print("Passed delete from instance_ugaz")
                    cur.execute("DELETE FROM apregoar.instance_egaz WHERE i_id = ANY (%s);", (delete_inst,))
                    print("Passed delete from instance_egaz")
                    cur.execute("DELETE FROM apregoar.instance_ngaz WHERE i_id = ANY (%s);",(delete_inst,))
                    print("Passed delete from instance_ngaz")        
                    cur.execute("DELETE FROM apregoar.instances WHERE i_id = ANY (%s);", (delete_inst,))
                    print("Passed delete from instances")   
                               
        except psycopg2.Error as e:
            #If not submitted, attempt to create again
            print("e.pgerror:",e.pgerror)
            print("e.diag.message_primary",e.diag.message_primary)
            feedback = f"Excepção: a instância não ficou apagada. Erro: "+str(e.pgerror)+", "+e.diag.message_primary
            flash(feedback, "danger")
            con.rollback()
            con.close() 
        else:
            con.commit()
            con.close()
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
                    SQL = text("SELECT * FROM apregoar.geonoticias WHERE s_id = :x")
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
                print("Returned result: ",result)
                for row in result:
                    if row["i_id"] != None:
                        if row["t_begin"] is None:
                            instance = {
                                row["i_id"] : {
                                    "p_name": row["p_name"],
                                    "timeframe": ""
                                }
                            }
                        elif row["t_begin"] == row["t_end"]:
                            instance = {
                                row["i_id"] : {
                                    "p_name": row["p_name"],
                                    "timeframe": str(row["t_begin"].date()),
                                }
                            }
                        else:
                            instance = {
                                row["i_id"] : {
                                    "p_name": row["p_name"],
                                    "timeframe": str(row["t_begin"].date())+" - "+str(row["t_end"].date())
                                }
                            }
                        instances.append(instance)
                    else:
                        break
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
                        INSERT INTO apregoar.stories (title, summary, pub_date, web_link, section, tags, author, publication, u_id, created, edited)
                        VALUES (%(title)s,%(summary)s,%(pub_date)s,%(web_link)s,%(section)s, %(tags)s, %(author)s,%(publication)s,%(u_id)s, NOW(), NOW())
                        RETURNING s_id
                        ;""",
                        {'title':story["title"],'summary':story["summary"], 'pub_date':story["pub_date"], 'web_link': story["web_link"], 'section': story["section"], 'tags': story["tags"], 'author': story["author"], 'publication':story["publication"], 'u_id':fsession["u_id"]}
                    )
                    s_id = cur.fetchone()[0]
                    print("Story added to database. s_id: ",s_id)
        except psycopg2.Error as e:
            #If not submitted, attempt to create again
            print(e.pgerror)
            print(e.diag.message_primary)
            feedback = f"Excepção: a história não ficou guardada. Erro: "+e.pgerror+", "+e.diag.message_primary
            flash(feedback, "danger")
            con.rollback()
            con.close()
            return render_template("publisher/create.html")
        else:
            story["s_id"] = s_id
            #Saving Tags
            if story["tags"]:
                tags = story["tags"].split(",")
                for tag in tags:
                    if tag == "":
                        tags.remove(tag)
                    if tag == " ":
                        tags.remove(tag)
                if len(tags)>0:
                    savingAttributes(attr = "tag",s_id=s_id,con=con,attr_vals=tags)
                else:
                    print("Actually, no real tags associated")
                    emptyAttribute(attr="tag", s_id = s_id, con=con)
            else:  
                print("No tags associated")
                emptyAttribute(attr="tag", s_id = s_id, con=con) 
            #Saving Authors
            if story["author"]:
                authors = story["author"].split(",")
                for author in authors:
                    if author == "":
                        authors.remove(author)
                    if author == " ":
                        authors.remove(author)
                if len(authors)>0:
                    savingAttributes(attr = "author",s_id=s_id,con=con,attr_vals=authors)
                else:
                    print("Actually, no real authors associated")
                    emptyAttribute(attr="author", s_id = s_id, con=con)
            else:  
                print("No authors associated")
                emptyAttribute(attr="author", s_id = s_id, con=con)
            #Saving Sections
            if story["section"]:
                section = story["section"]
                if section == "":
                    emptyAttribute(attr="section", s_id = s_id, con=con)
                elif section == " ":
                    emptyAttribute(attr="section", s_id = s_id, con=con)
                else:
                    savingAttributes(attr = "section",s_id=s_id,con=con,attr_vals=[section])
                    
            else:  
                print("No authors associated")
                emptyAttribute(attr="section", s_id = s_id, con=con)
            #Saving Publication
            if story["publication"]:
                publication = story["publication"]
                if publication == "":
                    emptyAttribute(attr="publication", s_id = s_id, con=con)
                elif publication == " ":
                    emptyAttribute(attr="publication", s_id = s_id, con=con)
                else:
                    savingAttributes(attr = "publication",s_id=s_id,con=con,attr_vals=[publication])
                    
            else:  
                print("No authors associated")
                emptyAttribute(attr="publication", s_id = s_id, con=con)
            con.commit()
            con.close()
            return render_template("publisher/review.html", story=story, sID = s_id)
    return render_template("publisher/dashboard.html")

def savingAttributes(attr,s_id,con,attr_vals):
    print("Saving: "+attr)
    try:
        with engine.connect() as conn:
            SQL = text("SELECT * FROM apregoar."+attr+"s")
            print(SQL)
            result = conn.execute(SQL)
    except:
        print("Error in extracting "+attr+"s from database")
        feedback=f"Erro"
        flash(feedback,"danger")
    else:
        existing_vals = {}
        attr_id_name = attr[0]+"_id"
        if attr == "tag":
            attr_ing = "tagging"
        else:
            attr_ing = attr+"ing"
        for row in result:
            existing_vals[row[attr+"_name"]] = row[attr+"_id"]
        for val in attr_vals:
            val.strip().lower()
            if val not in existing_vals:
                try:
                    with con:
                        with con.cursor() as cur:
                            cur.execute(
                                "INSERT INTO apregoar."+attr+"s ("+attr+"_name) VALUES (%(attr_name)s) RETURNING "+attr+"_id;",
                                {'attr_name':val}
                            )
                            id = cur.fetchone()[0]
                except psycopg2.Error as e:
                    print(e.pgerror)
                    print(e.diag.message_primary)
                    con.rollback()
                    con.close()
                else:
                    print("extracted "+attr+"s from db")
            elif val in existing_vals:
                id = existing_vals[val]
                print("existing "+attr+"s =",id," ",val)
            else:
                print("how did we get here?")
            try:
                with con:
                    with con.cursor() as cur:
                        cur.execute(
                            "INSERT INTO apregoar."+attr_ing+" (story_id,"+attr_id_name+") VALUES (%(s_id)s,%(attr_id)s);",
                            {'s_id':s_id, 'attr_id':id}
                        )
                        print(attr+"relation added to database")
            except psycopg2.Error as e:
                print(e.pgerror)
                print(e.diag.message_primary)
                con.rollback()
                con.close()
                return render_template("publisher/create.html")
            else:
                print("Successful association to existing "+attr+"!")


def emptyAttribute(attr,s_id,con):
    print(attr)
    if attr == "tag":
        attr_ing = "tagging"
    else:
        attr_ing = attr+"ing"
    no_vals = {
        "tag": 102,
        "author": 1,
        "section": 1,
        "publication": 9
    }
    attr_id_val = no_vals[attr]
    attr_id_name = attr[0]+"_id"
    print("attr_id_val: ",attr_id_val," attr_id_name: ",attr_id_name)
    try:
        with con:
            with con.cursor() as cur:
                cur.execute("INSERT INTO apregoar."+attr_ing+" (story_id,"+attr_id_name+") VALUES (%(s_id)s,%(attr_id)s);",
                    {'s_id':s_id, 'attr_id':attr_id_val}
                )
                print(attr+" relation added to database")
    except psycopg2.Error as e:
        print(e.pgerror)
        print(e.diag.message_primary)
        con.rollback()
        con.close()
        return render_template("publisher/create.html")
    else:
        print("Successful association to '*sem valor' of "+attr)


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
        #egaz_area = []
        #egaz_freguesia = []
        #egaz_concelho = []
        #egaz_extra = []
        if story:               
            return render_template("publisher/localize.html", story=story, sID = s_id)
                #return render_template("publisher/localize.html", story=story, sID = s_id, eGazF=egaz_freguesia, eGazC=egaz_concelho, eGazA = egaz_area, eGazX = egaz_extra)
        else:
            feedback = f"No valid story selected"
            flash(feedback, "danger")
    
    return render_template("publisher/dashboard.html")

@app.route("/publisher/<s_id>/gazetteer", methods=["GET", "POST"])
def loadGaz(s_id):
    #Prepare fetch response
    req = request.get_json()
    print("Received: ")
    print(req)
    print()
    gazetteer = req["gazetteer"]
    print(gazetteer)
    #Load relevant user and story info
    u_id = fsession["u_id"]
    print("Story id: ",s_id,", User ID: ",u_id)
    #Access relevant queries
    if gazetteer == "ugaz_personal":
        SQL = text("""
            SELECT
                p_id AS gaz_id,
                p_name AS gaz_name,
                p_desc AS gaz_desc,
                u_id
            FROM apregoar.access_ugaz
            WHERE u_id = :x
            ;
        """)
        SQL = SQL.bindparams(x=u_id)
    elif gazetteer == "ugaz_empresa":
        #Get Publisher
        try:
            with engine.connect() as conn:
                SQL = text("SELECT * FROM apregoar.stories WHERE s_id = :x")
                SQL = SQL.bindparams(x=s_id)
                result = conn.execute(SQL)
        except:
            conn.close()
            print("Error in extracting desired story from database")
            res = make_response(jsonify("Não conseguimos carregar os dados"))
        else:
            conn.close()
            #Extract publication to use in query
            for row in result:
                publication = row["publication"]
            #Define query
            SQL = text("""
                SELECT
                    p_id AS gaz_id,
                    p_name AS gaz_name,
                    p_desc AS gaz_desc,
                    publication AS gaz_pub
                FROM apregoar.access_ugaz
                WHERE publication = :x AND u_id NOT IN (:y)
                ;
            """)
            SQL = SQL.bindparams(x=publication,y=u_id)
    elif gazetteer == "ugaz_all":
        SQL = text("""
            SELECT
                p_id AS gaz_id,
                p_name AS gaz_name,
                p_desc AS gaz_desc,
                u_id
            FROM apregoar.access_ugaz
            WHERE u_id NOT IN :x
            ;
        """)
        SQL = SQL.bindparams(x=u_id)
    elif gazetteer == "egaz_freguesia":
        SQL = text("""
            SELECT
                e_id AS gaz_id,
                name AS gaz_name,
                type AS gaz_desc
            FROM apregoar.egazetteer
            WHERE type = 'freguesia'
            ORDER BY gaz_name
            ;
        """)
    elif gazetteer == "egaz_concelho":
        SQL = text("""
            SELECT
                e_id AS gaz_id,
                name AS gaz_name,
                type AS gaz_desc
            FROM apregoar.egazetteer
            WHERE type = 'concelho'
            ORDER BY gaz_name
            ;
        """)
    elif gazetteer == "egaz_green":
        SQL = text("""
            SELECT
                e_id AS gaz_id,
                name AS gaz_name,
                type AS gaz_desc
            FROM apregoar.egazetteer
            WHERE type = 'espaço_verde'
            ORDER BY gaz_name
            ;
        """)
    elif gazetteer == "egaz_archive":
        print("egaz_archive")
        SQL = text("""
            SELECT
                e_id AS gaz_id,
                name AS gaz_name,
                'archive' AS gaz_desc
            FROM apregoar.egazetteer
            WHERE type IN ('freguesia_archivo')
            ORDER BY gaz_name
            ;
        """)
    elif gazetteer == "egaz_extra":
        print("egaz_extra")
        SQL = text("""
            SELECT
                e_id AS gaz_id,
                name AS gaz_name,
                type AS gaz_desc
            FROM apregoar.egazetteer
            WHERE type NOT IN ('concelho','freguesia','freguesia_archivo')
            ORDER BY gaz_name
            ;
        """)
    elif gazetteer == "poi_poi":
        search_term = req["searchTerm"]
        print("search_term: ",search_term)
        query = """
            SELECT
                id as gaz_id,
                name as gaz_name,
                'poi' AS gaz_desc
            FROM apregoar.apregoar_poi
        """
        print("query:",query)
        if search_term:
            where_clause = " WHERE LOWER(name) LIKE '%"+search_term.lower()+"%';"
            print("where_clause",where_clause)
            SQL = text(query+where_clause)
        else:
            SQL = text(query+";")
        print("SQL: ",SQL)
        print("Successfull definition of SQL!")
    elif gazetteer == "gaz_prev":
        search_term = req["searchTerm"]
        print("search_term: ",search_term)
        query_egaz = """
            SELECT
                e_id as gaz_id,
                name as gaz_name,
                type AS gaz_desc
            FROM apregoar.egazetteer
        """
        print("query_egaz:",query_egaz)
        query_ugaz = """
            SELECT
                p_id as gaz_id,
                p_name as gaz_name,
                concat('ugaz',u_id) as gaz_desc
            FROM apregoar.ugazetteer
        """
        print("query_ugaz:",query_ugaz)
        if search_term:
            where_clause_e = " WHERE LOWER(name) SIMILAR TO LOWER('%("+search_term.replace(", ","|")+")%')"
            #where_clause_u = " WHERE LOWER(p_name) LIKE '%"+search_term.lower()+"%'"
            where_clause_u = " WHERE LOWER(p_name) SIMILAR TO LOWER('%("+search_term.replace(", ","|")+")%')"
            print("where_clause_e",where_clause_e,". where_clause_u: ",where_clause_u)
            SQL = text(query_ugaz+where_clause_u+" UNION "+query_egaz+where_clause_e+";")
            #SQL = text(query_ugaz+where_clause_u+";")
        else:
            SQL = text(query+";")
        print("SQL: ",SQL)
        print("Successfull definition of SQL!")
    elif gazetteer == "poi_locale":
        layer_extent = req["layerExtent"]
        print("layer_extent: ",layer_extent)
        query = """
            SELECT
                id as gaz_id,
                name as gaz_name,
                'poi' as gaz_desc
            FROM apregoar.apregoar_poi
            ;
        """
        print("query for locale: ",query)
        SQL = text(query)    
    else:
        #If no valid gazetteer selected
        res = make_response(jsonify("No valid gazetteer selected"))
    #Call query for gazetteer
    try:
        with engine.connect() as conn:
            result = conn.execute(SQL)
    except:
        print("Error in accessing gazetteer",gazetteer)
        res = make_response(jsonify("Error in accessing the gazetteer"))
    else:
        gaz_options=[]
        for row in result:
            print(row)
            ugaz_entry = {
                "gaz_id": row["gaz_id"],
                "gaz_name": row["gaz_name"],
                "gaz_desc": row["gaz_desc"]
            }
            gaz_options.append(ugaz_entry)
        print(gaz_options)
        res = make_response(jsonify(gaz_options), 200)

    return res
    
    
    
    
    

@app.route("/publisher/<i_id>/edit_instance", methods=["GET", "POST"])
def edit_instance(i_id):
    print("Instance ID: ",{i_id})
    try:
        with engine.connect() as conn:
            #Edit this to connect instances to instance_ugaz to ugaz
            SQL = text("""
                SELECT * 
                FROM apregoar.geonoticias
                WHERE i_id = :x
                ;
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
            print("title",instance["title"])
        if instance:
            d_begin = instance["t_begin"].date()
            d_end = instance["t_end"].date()
            print(d_begin)
            print(d_end)
            map_story_filter = "s_id="+str(instance["s_id"])
            print("map_story_filter",map_story_filter)
            return render_template("publisher/instance.html", instance=instance, mapStoryFilter=map_story_filter, dBegin = d_begin, dEnd = d_end)
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
    p_ids = instance["pIds"]
    nominatims = instance["nominatims"]

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

    #Extract p_ids
    print("p_ids: ",p_ids)

    #Define connection
    con = psycopg2.connect("dbname=postgres user=postgres password=thesis2021")
    
    #BEGIN EDITS
    try:
        with con:
            with con.cursor() as cur:
                #Save new instance
                cur.execute("""
                    INSERT INTO apregoar.instances (t_begin, t_end, t_desc, p_desc, s_id, u_id, t_type, p_name,created,edited) 
                    VALUES (%(t_begin)s, %(t_end)s, %(t_desc)s, %(p_desc)s, %(s_id)s, %(u_id)s, %(t_type)s, %(p_name)s,NOW(),NOW())
                    RETURNING i_id
                    ;""",
                    {'t_begin':t_begin, 't_end':t_end, 't_desc':t_desc, 'p_desc':p_desc, 's_id':s_id, 'u_id':u_id, 't_type':all_day,'p_name':p_name}
                )
                i_id = cur.fetchone()[0]
                print("Instance added to database. i_id: ",i_id)
                instance["i_id"]=i_id

                #Extract and Save UGaz (if exists)
                if features:
                    print("There are UGaz features")
                    features = json.loads(features)
                    print("Features: ")
                    print(features)
                    multiShape=[]
                    shapeP = None
                    #Prepare feature geometry
                    all_coords = features['coordinates']
                    print("all_coords",all_coords)
                    for i in range(len(all_coords)):
                        shape_coords = all_coords[i]
                        print(shape_coords)
                        shapeP = Polygon(shape_coords)
                        multiShape.append(shapeP)
                    print("Length of Multishape (number of polygons): ", len(multiShape))
                    multiP = MultiPolygon(multiShape)
                    print("# polys in MultiP: ",len(multiP.geoms))
                    print("multiP wkt: ",multiP.wkt)
                    new_geom = 'SRID=4326;'+multiP.wkt
                    print(new_geom)
                    
                    #Save place to database
                    cur.execute("""
                        INSERT INTO apregoar.ugazetteer (p_name, geom, u_id, p_desc,created,edited) 
                        VALUES (%(p_name)s, ST_GeomFromEWKT(%(geom)s), %(u_id)s, %(p_desc)s,NOW(),NOW())
                        RETURNING p_id
                        ;""",
                        {'p_name':p_name, 'geom':multiP.wkt, 'u_id':u_id, 'p_desc':p_desc}
                    )
                    p_id = cur.fetchone()[0]
                    instance["p_id"] = p_id
                    print("Custom place added to database. p_id: ",p_id)
                    instance["p_id"] = p_id
                    #Relate instance and new place
                    cur.execute("""
                        INSERT INTO apregoar.instance_ugaz (i_id, p_id, original)
                        VALUES (%(i_id)s, %(p_id)s, %(original)s)
                        ;""",
                        {'i_id':i_id, 'p_id':p_id,'original':True}
                    )
                    print("Custome place successfully related to instance")

                    #Find related geometries
                    cur.execute("""
                        SELECT
                            ugaz.p_id AS p_id,
                            egaz.e_id AS e_id,
                            ST_Contains(ST_Makevalid(ugaz.geom), ST_Makevalid(egaz.geom)) AS u_contains_e,
                            ST_Within(ST_Makevalid(ugaz.geom), ST_Makevalid(egaz.geom)) AS u_within_e,
                            ST_Overlaps(ST_Makevalid(ugaz.geom), ST_Makevalid(egaz.geom)) AS u_overlaps_e,
                            ST_Touches(ST_Makevalid(ugaz.geom), ST_Makevalid(egaz.geom)) AS u_touches_e
                        FROM 
                            apregoar.ugazetteer ugaz, 
                            apregoar.egazetteer egaz
                        WHERE
                            ugaz.p_id = %(p_id)s AND
                            ST_Intersects(ST_Makevalid(ugaz.geom), ST_Makevalid(egaz.geom))
                        ;""",
                        {'p_id':p_id}
                    )
                    records = cur.fetchall()
                    for row in records:
                        g_rel = ""
                        egaz_id = row[1]
                        print("row[1]: ",row[1])
                        print("Type of boolean (row[3]): ",type(row[3]))
                        print("row: ",row)
                        if row[2] == True:
                            g_rel = "u_contains_e"
                        elif row[3] == True:
                            g_rel = "u_within_e"
                        elif row[4] == True:
                            g_rel = "u_overlaps_e"
                        elif row[5] == True:
                            g_rel = "u_touches_e"
                        else:
                            print("No ST_Intersect relation here")
                            break
                        print("entry: ",p_id,",",egaz_id,",",g_rel)
                        cur.execute("""
                            INSERT INTO apregoar.spatial_assoc (p_id, e_id, relation) 
                            VALUES (%(p_id)s, %(e_id)s, %(relation)s)
                            ;""",
                            {'p_id':p_id, 'e_id':egaz_id, 'relation':g_rel}
                        )
                        print("1 relation added")

                    
                
                else:
                    print("No new features created")
                    p_id = None

                ### Setting up Nominatim table
                if nominatims:
                    print("nominatims: ",nominatims)
                    for place in nominatims:
                        osm_id = place["id"]
                        name = place["name"]
                        nomExists = False
                        geojson = json.dumps(place["geojson"])
                        print("type of geojson: ",type(geojson))
                        all_coords= place["geojson"]["coordinates"]
                        multiShape = []
                        for i in range(len(all_coords)):
                            shape_coords = all_coords[i]
                            shapeP = Polygon(shape_coords)
                            multiShape.append(shapeP)
                        multiP= MultiPolygon(multiShape)
                        
                    
                        cur.execute("""
                            SELECT *
                            FROM apregoar.ngazetteer
                            WHERE osm_id = %(osm_id)s
                            ;""",
                            {'osm_id':osm_id}
                        )
                        records = cur.fetchall()
                        for row in records:
                            n_id = row[0]
                            print("n_id: ",n_id)
                            nomExists = True
                        if nomExists == False:
                            print("ngazetteer entry doesn't exists yet")
                            cur.execute("""
                                INSERT INTO apregoar.ngazetteer (n_name, geom, osm_id, geojson) 
                                VALUES (%(n_name)s, ST_GeomFromEWKT(%(geom)s), %(osm_id)s, %(geojson)s)
                                RETURNING n_id
                                ;""",
                                {'n_name':name, 'geom':'SRID=4326;'+multiP.wkt, 'osm_id':osm_id, 'geojson':geojson}
                            )
                            print("checkpoint")
                            n_id = cur.fetchone()[0]
                            print("n_id after new entry save: ", n_id)
                            
                        #Relate instance and new place
                        cur.execute("""
                            INSERT INTO apregoar.instance_ngaz (i_id, n_id)
                            VALUES (%(i_id)s, %(n_id)s)
                            RETURNING n_id, i_id
                            ;""",
                            {'i_id':i_id, 'n_id':n_id,}
                        )
                        results = cur.fetchone()[0]
                        #for result in results:
                        #    print("i_id, n_id",result["i_id"]+result["n_id"])
                        print("Nominatim place successfully related to instance")

                        
                        


                #Associate any existing administrative gazetteers
                print("e_ids: ",e_ids)
                if e_ids:
                    print("e_ids: ",e_ids)
                    for e_id in e_ids:
                        print("e_id",e_id)
                        cur.execute("""
                            INSERT INTO apregoar.instance_egaz (i_id, e_id, explicit,last_edited)
                            VALUES (%(i_id)s, %(e_id)s, %(explicit)s,NOW())
                            ;""",
                            {'i_id':i_id, 'e_id':e_id,'explicit':True}
                        )
                    print("Successfully associated ",len(e_ids)," existing admin features")
                else:
                    print("no admin features associated")
                
                #Associate any existing user created gazetteers
                print("p_ids",p_ids)
                if p_ids:
                    print("p_ids: ",p_ids)
                    for id in p_ids:
                        print("p_id (existing)",id)
                        cur.execute("""
                            INSERT INTO apregoar.instance_ugaz (i_id, p_id, original)
                            VALUES (%(i_id)s, %(p_id)s, %(original)s)
                            ;""",
                            {'i_id':i_id, 'p_id':id,'original':False}
                        )
                    print("Successfully associated ",len(p_ids)," previous ugaz features")
                else:
                    print("No association to previous ugaz features")                        
    except psycopg2.Error as e:
        print("Error in saving new instance")
        print(e.pgerror)
        print(e.diag.message_primary)
        res = make_response(jsonify(req), 500)
        con.rollback()
        con.close()
        return res
    else:
        #Commit all additions to database
        con.commit()
        con.close()
        print("Successful save of instance and related places") 
    res = make_response(jsonify(req), 200) 
    return res