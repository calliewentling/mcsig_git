import re
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

#Creating models for querying
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.ext.declarative import declarative_base
engine = create_engine('postgresql+psycopg2://postgres:thesis2021@localhost/postgres', convert_unicode=True)
db_session = scoped_session(sessionmaker(autocommit=False,
                                         autoflush=False,
                                         bind=engine))
Base = declarative_base()
Base.query = db_session.query_property()
def init_db():
    from app import models
    Base.metadata.create_all(bind=engine)
init_db()
from app.models import Users, Stories, Tags, Tagging, Instances, Sectioning, Sections, Authoring, Authors, Publications, Publicationing, Ugazetteer, Egazetteer, Instance_egaz, Instance_ugaz

session = Session(engine)

#Normal stuff here
def cleanLists(list_in, s_id, i_id,list_out):
    for item in list_in:
        if not item:
            item = "*sim valor"
        if item == " ":
            item = "*sim valor"
        #print(item," - ",type(item))
        if isinstance(item,str):
            item_p = item.strip().lower()
            #print("item_p for stirngs: ",item_p)
        else:
            item_p = item
        if item_p not in list_out:
            list_out[item_p] = {
                "total_s": 1,
                "s_ids": [s_id]
            }
            if i_id:
                list_out[item_p]["i_ids"] = [i_id]
                list_out[item_p]["total_i"] = 1

            else:
                list_out[item_p]["i_ids"] = []
                list_out[item_p]["total_i"] = 0
        else:
            
            if s_id not in list_out[item_p]["s_ids"]:
                list_out[item_p]["s_ids"].append(s_id)
                list_out[item_p]["total_s"] = len(list_out[item_p]["s_ids"])
            if i_id:
                list_out[item_p]["i_ids"].append(i_id)
                list_out[item_p]["total_i"] = len(list_out[item_p]["i_ids"])
    #print()
    return list_out


@app.route("/explore/map", methods=["GET","POST"])
def explore():
    if request.method == "POST":
        req = request.get_json()
        sIDs = []
        iIDs = []
        print("received data: ",req)
        response ={}
        s_ids = []
        i_ids = []
        dupS = 0
        dupI = 0
        is_filtered = False
        stmt = select(Instances).join(Stories, Instances.s_id == Stories.s_id) #This loses stories without instances
        #stmt = select(Stories).join(Instances, Stories.s_id == Instances.s_id) #This loses access to the instance.i_id column
        
        ### STORY LEVEL FILTERS ###
        if len(req["Tags"])>0:
            is_filtered = True
            print(req["Tags"])
            subqT = (select(Tags).where(Tags.tag_name.in_(req["Tags"])).subquery())
            stmt = stmt.join(Tagging, Stories.s_id == Tagging.story_id).join(subqT, Tagging.t_id == subqT.c.tag_id)
            print("STMT after Tags: ",stmt)        
        if len(req["Sections"])>0:
            is_filtered = True
            print(req["Sections"])
            #stmt = stmt.where(func.lower(Stories.section).in_(req["Sections"]))
            subqS = (select(Sections).where(Sections.section_name.in_(req["Sections"])).subquery())
            stmt = stmt.join(Sectioning, Stories.s_id == Sectioning.story_id).join(subqS, Sectioning.s_id == subqS.c.section_id)
        if len(req["Authors"])>0:
            is_filtered = True
            print(req["Authors"])
            #stmt = stmt.where(func.lower(Stories.author).in_(req["Authors"]))
            subqA = (select(Authors).where(Authors.author_name.in_(req["Authors"])).subquery())
            stmt = stmt.join(Authoring, Stories.s_id == Authoring.story_id).join(subqA, Authoring.a_id == subqA.c.author_id)
        if len(req["Publications"])>0:
            is_filtered = True
            print(req["Publications"]) 
            #stmt = stmt.where(func.lower(Stories.publication).in_(req["Publications"]))
            subqP = (select(Publications).where(Publications.publication_name.in_(req["Publications"])).subquery())
            stmt = stmt.join(Publicationing, Stories.s_id == Publicationing.story_id).join(subqP, Publicationing.p_id == subqP.c.publication_id)
        if req["pubDateFilterMax"] == True:
            if req["pubDateFilterMin"] == True:
                is_filtered = True
                print("Date range: ",req["pubDateR1"]," - ",req["pubDateR2"])
                print(type(req["pubDateR2"]))
                stmt = stmt.where(Stories.pub_date.between(req["pubDateR1"],req["pubDateR2"][0:11]+"23:59:59.999Z"))
        #if req["pubDateFilter"] == False:
        #    is_filtered = True
        #    print("Date range: all")
        

        ### INSTANCE LEVEL FILTERS ###
       
        
        if is_filtered is True:
            result1 = session.scalars(stmt).all()
            #for result in session.scalars(stmt).all():
            for result in result1:
                print("Result: ",result)
                if result.s_id not in s_ids:
                    s_ids.append(result.s_id)
                else:
                    dupS += 1
                for inst in result.instances:
                    print(inst.i_id)
                if result.i_id not in i_ids:
                    i_ids.append(result.i_id)
                else:
                    dupI += 1
            print("s_ids (",len(s_ids),"): ", s_ids)
            print("i_ids (",len(i_ids),"): ",i_ids)
        print("dupS: ",dupS,". dupI: ",dupI)
        response["sIDs"] = s_ids
        response["iIDs"] = i_ids
        print("response: ",response)
        return make_response(jsonify(response),200)
    else:
        #Getting values for user filtering
        try:
            with engine.connect() as conn:
                SQL = text("SELECT s_id, i_id, pub_date, section, author, publication, t_begin, t_end, t_type, p_id, e_ids FROM apregoar.geonoticias")
                result = conn.execute(SQL)
        except: 
            conn.close()
            print("Error in distracting filters from database")
        else:
            sections = {}
            authors = {}
            publications = {}
            t_begins = []
            t_ends = []
            t_types = {}
            pub_dates = {}
            i_dates = {}
            p_types = {
                "personalizado": {
                    "s_ids": [],
                    "total_s": 0,
                    "i_ids": [],
                    "total_i": 0,
                },
                "administrativo": {
                    "s_ids": [],
                    "total_s": 0,
                    "i_ids": [],
                    "total_i": 0,
                },
                "sim definição": {
                    "s_ids": [],
                    "total_s": 0,
                }
            }
            e_ids = {}
            i_range = {
                "i_start": datetime.datetime.now(),
                "i_end": datetime.datetime.now()
            }
            print("Result: ",result)
            for row in result:
                #sections= cleanLists(list_in = list(row["section"].replace('"','\\\"').replace("'","\\\'").split(",")), s_id = row["s_id"],i_id=row["i_id"],list_out = sections)
                #authors = cleanLists(list_in = list(row["author"].replace('"','\\\"').replace("'","\\\'").split(",")), s_id = row["s_id"],i_id=row["i_id"],list_out = authors)
                publications = cleanLists(list_in = [row["publication"].replace('"','\\\"').replace("'","\\\'")], s_id = row["s_id"],i_id=row["i_id"],list_out = publications)
                t_types = cleanLists(list_in = [row["t_type"]], s_id = row["s_id"],i_id=row["i_id"],list_out = t_types)
                pub_dates = cleanLists(list_in = [row["pub_date"]], s_id = row["s_id"],i_id=row["i_id"],list_out = pub_dates)
                if not row["i_id"]:
                    p_types["sim definição"]["s_ids"].append(row["s_id"])
                else: 
                    if row["p_id"]:
                        if row["s_id"] not in p_types["personalizado"]["s_ids"]:
                            p_types["personalizado"]["s_ids"].append(row["s_id"])
                        p_types["personalizado"]["i_ids"].append(row["i_id"])
                    if row["e_ids"]:
                        if row["s_id"] not in p_types["administrativo"]["s_ids"]:
                            p_types["administrativo"]["s_ids"].append(row["s_id"])
                        p_types["administrativo"]["i_ids"].append(row["i_id"])
                    if row["t_begin"] is not None:
                        if i_range["i_start"] > row["t_begin"]:
                            i_range["i_start"] = row["t_begin"]
                    if row["t_end"] is not None:
                        if i_range["i_end"] < row["t_end"]:
                            i_range["i_end"] = row["t_end"]
            #Calculate all lengths of lists: 
            p_types["sim definição"]["total_s"]=len(p_types["sim definição"]["s_ids"])
            p_types["personalizado"]["total_s"] = len(p_types["personalizado"]["s_ids"])
            p_types["personalizado"]["total_i"] = len(p_types["personalizado"]["i_ids"])
            p_types["administrativo"]["total_s"] = len(p_types["administrativo"]["s_ids"])  
            p_types["administrativo"]["total_i"] = len(p_types["administrativo"]["i_ids"])
            print("i_range: ",i_range)
            #sections = sorted(sections.items())
            #authors = sorted(authors.items())
            publications = sorted(publications.items())
            t_types = sorted(t_types.items())
            pub_dates = sorted(pub_dates.items())
            pub_date_range = {
                "min": min(pub_dates)[0],
                "max": max(pub_dates)[0]
            }
            print("pub_date_range: ",pub_date_range)
            p_types = sorted(p_types.items())
            e_names = {}
            try:
                with engine.connect() as conn:
                    SQL2 = text("SELECT * FROM apregoar.egaz_filter")
                    result2 = conn.execute(SQL2)
            except: 
                conn.close()
                print("Error in distracting filters from database")
            else:
                for row in result2:
                    e_names[row["e_name"].lower()] = {
                        "total_i": row["total_count"],
                        "e_id": row["e_id"]
                    }
                e_names = sorted(e_names.items())
            tags = {}
            try:
                with engine.connect() as conn:
                    SQL = text("SELECT t.t_id, tags.tag_name, count FROM (SELECT t_id, count(*) FROM apregoar.tagging GROUP BY t_id) t LEFT JOIN apregoar.tags on t.t_id = tags.tag_id ORDER BY count DESC")
                    result = conn.execute(SQL)
            except: 
                conn.close()
                print("Error in distracting filters from database")
            else:
                for row in result:
                    tags[row["tag_name"]] = {
                        "total_t": row["count"],
                        "t_id": row["t_id"],
                    }
                print("tags: ",tags)
                for tag in tags:
                    print(tags[tag]["total_t"])
                    break
            sections = {}
            try:
                with engine.connect() as conn:
                    SQL = text("SELECT s.s_id, sections.section_name, count FROM (SELECT s_id, count(*) FROM apregoar.sectioning GROUP BY s_id) s LEFT JOIN apregoar.sections on s.s_id = sections.section_id ORDER BY count DESC")
                    result = conn.execute(SQL)
            except: 
                conn.close()
                print("Error in distracting filters from database")
            else:
                for row in result:
                    sections[row["section_name"]] = {
                        "total_s": row["count"],
                        "s_id": row["s_id"],
                    }
            authors = {}
            try:
                with engine.connect() as conn:
                    SQL = text("SELECT a.a_id, authors.author_name, count FROM (SELECT a_id, count(*) FROM apregoar.authoring GROUP BY a_id) a LEFT JOIN apregoar.authors on a.a_id = authors.author_id ORDER BY count DESC")
                    result = conn.execute(SQL)
            except: 
                conn.close()
                print("Error in distracting filters from database")
            else:
                for row in result:
                    authors[row["author_name"]] = {
                        "total_a": row["count"],
                        "a_id": row["a_id"],
                    }
            publications = {}
            try:
                with engine.connect() as conn:
                    SQL = text("SELECT p.p_id, publications.publication_name, count FROM (SELECT p_id, count(*) FROM apregoar.publicationing GROUP BY p_id) p LEFT JOIN apregoar.publications on p.p_id = publications.publication_id ORDER BY count DESC")
                    result = conn.execute(SQL)
            except: 
                conn.close()
                print("Error in distracting filters from database")
            else:
                for row in result:
                    publications[row["publication_name"]] = {
                        "total_p": row["count"],
                        "p_id": row["p_id"],
                    }
            conn.close()
    return render_template("explore/explore_map.html", tags = tags, sections = sections, authors = authors, publications = publications, t_types=t_types, p_types = p_types, e_names = e_names, pub_dates = pub_dates, i_range = i_range, pubDateRange = pub_date_range)
    

