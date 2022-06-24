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
from app.models import Users, Stories, Tags, Tagging, Instances, Sectioning, Sections, Authoring, Authors, Publications, Publicationing, Ugazetteer, Egazetteer, Instance_egaz, Instance_ugaz, Spatial_assoc

session = Session(engine)

#Normal stuff here
def cleanLists(list_in, s_id, i_id,list_out):
    for item in list_in:
        if not item:
            item = "*sem valor"
        if item == " ":
            item = "*sem valor"
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
        stories = {}
        dupS = 0
        dupI = 0
        noInst = []
        story_filtered = False
        instance_filtered = False
        is_filtered = False
        #The default stmt is an inner join between Stories and Instancs, followed by if statements that will allow the filtering to stories with instances (unless otherwise specified). In the event that no isntance filters are applied, the stmt will change to a stmtLeft which includes an outer join, such that stories without instances will be included as well.
        stmtBase = select(Stories, Instances).join(Stories.instancing).order_by(Stories.s_id,Instances.i_id)
        stmt = stmtBase
        stmtLeft = select(Stories, Instances).join(Stories.instancing, isouter=True).order_by(Stories.s_id,Instances.i_id)
        
        if len(req["E_names"])>0:
            instance_filtered = True
            print(req["E_names"])
            #Spatial Assoc previously associates all ugaz items to intersecting egaz values.
            #Should I do the same for all egaz entries (associate them with other intersecting egaz entries?)
            subqCustom1 = (select(Egazetteer).where(Egazetteer.name.in_(req["E_names"])).subquery())
            subqCustom2 = (select(Spatial_assoc.e_id.label("e_id"),Instance_ugaz.i_id.label("i_id")).join_from(subqCustom1,Spatial_assoc, subqCustom1.c.e_id == Spatial_assoc.e_id).join(Instance_ugaz, Spatial_assoc.p_id == Instance_ugaz.p_id).subquery())
            subqAdmin1 = (select(Egazetteer).where(Egazetteer.name.in_(req["E_names"])).subquery())
            subqAdmin2 = (select(Instance_egaz.e_id.label("e_id"),Instance_egaz.i_id.label("i_id")).join_from(subqAdmin1,Instance_egaz, subqAdmin1.c.e_id == Instance_egaz.e_id).subquery())
            print("subqCustom2: ",subqCustom2)
            print("subqAdmin2: ",subqAdmin2)
            subqU = (union(select(subqCustom2),select(subqAdmin2)).subquery())
            stmt = stmt.join(subqU, Instances.i_id == subqU.c.i_id)     
        
        if len(req["T_types"])>0:
            instance_filtered = True
            print(req["T_types"])
            stmt = stmt.where(Instances.t_type.in_(req["T_types"]))

        #This is at the end of instance filters so that it takes all current instance filters into account 
        if len(req["P_types"])>0:
            instance_filtered = True
            #Make a select subquery for each scenario. Union those relevant
            emptySelect = (stmtBase.where(Instances.i_id == None).subquery())
            subqBase = stmt.join(Instance_egaz, Instances.i_id == Instance_egaz.i_id).join(Instance_ugaz, Instances.i_id == Instance_ugaz.i_id)

            """
            #THIS IS FUNCTIONALISH (works for admin, not for personalizado)
            if "sim definição" in req["P_types"]:
                print("p_types include stories without instances")
                subqNoInst = (select(Stories.s_id,Instances.i_id).join(Stories.instancing, isouter=True).where(Instances.i_id == None).subquery())
            else:
                print("No 'sim definição' filter")
                subqNoInst = emptySelect
            if "administrativo" in req["P_types"]:
                print("includes admin types")
                subqAdmin = (stmt.join(Instance_egaz, Instances.i_id == Instance_egaz.i_id).where(Instance_egaz.e_id != None).subquery())
            else:
                print("No Admin fitler")
                subqAdmin = emptySelect
            if "personalizado" in req["P_types"]:
                print("includes custom types")
                subqCustom = (stmt.join(Instance_ugaz, Instances.i_id == Instance_ugaz.i_id).where(Instance_ugaz.p_id != None).subquery())
            else:
                print("No custom filter")
                subqCustom = emptySelect
            #Create a union of the three use cases (using empty selects if they aren't present)
            #subqP = (union(select(subqNoInst),select(subqAdmin),select(subqCustom)).subquery())
            print("Commencing union")
            subqU = (union(select(subqNoInst.c.s_id,subqNoInst.c.i_id),select(subqAdmin.c.s_id,subqAdmin.c.i_id),select(subqCustom.c.s_id,subqAdmin.c.i_id)).subquery())


            print("Joining to base")
            stmt = stmtBase.join(subqU, Stories.s_id == subqU.c.s_id)
            #Join the ongoing stmt to this, so that it appropriately filters.
            #stmt = subqP.join(stmt, Stories.s_id == stmt.s_id, isouter = True)
            print("After PType: ",stmt)
            """
            """
            if "sim definição" in req["P_types"]:
                subqNoInst = (select(Stories, Instances).join(Stories.instancing, isouter=True).order_by(Stories.s_id,Instances.i_id).where(Instances.i_id.is_(None)).subquery())
                if "administrativo" in req["P_types"]:
                    if "personalizado" in req["P_types"]:
                        print("Union all three")
                        subqBase = stmt.join(Instance_egaz, Instances.i_id == Instance_egaz.i_id, isouter=True).join(Instance_ugaz, Instances.i_id == Instance_ugaz.i_id, isouter=True).where(or_(Instance_egaz.e_id != None,Instance_ugaz.p_id !=None))
                    else:
                        print("Only uion sem and admin")
                        subqBase = stmt.join(Instance_egaz, Instances.i_id == Instance_egaz.i_id, isouter=True).where(Instance_egaz.e_id != None)
                    subqUnion = (union(select(subqNoInst.c.s_id,subqNoInst.c.i_id),select(subqBase.c.s_id,subqBase.c.i_id)).subquery())
                    stmt = stmtBase.join(subqUnion, Stories.s_id == subqUnion.c.s_id) #why was this subqU only?
                elif "personalizado" in req["P_types"]:
                    print("Union none and custom")
                    subqBase = stmt.join(Instance_ugaz, Instances.i_id == Instance_ugaz.i_id, isouter=True).where(Instance_ugaz.p_id !=None)
                    subqUnion = (union(select(subqNoInst.c.s_id,subqNoInst.c.i_id),select(subqBase.c.s_id,subqBase.c.i_id)).subquery())
                    stmt = stmtBase.join(subqUnion, Stories.s_id == subqUnion.c.s_id) #why was this subqU only?
                else:
                    stmt = select(Stories, Instances).join(Stories.instancing, isouter=True).order_by(Stories.s_id,Instances.i_id).where(Instances.i_id.is_(None))
            elif "administrativo" in req["P_types"]:
                if "personalizado" in req["P_types"]:
                    stmt = stmt.join(Instance_egaz, Instances.i_id == Instance_egaz.i_id, isouter=True).join(Instance_ugaz, Instances.i_id == Instance_ugaz.i_id, isouter=True).where(or_(Instance_egaz.e_id != None,Instance_ugaz.p_id !=None))
                else:
                    stmt = stmt.join(Instance_egaz, Instances.i_id == Instance_egaz.i_id, isouter=True).where(Instance_egaz.e_id != None)
            else:
                stmt = stmt.join(Instance_ugaz, Instances.i_id == Instance_ugaz.i_id, isouter=True).where(Instance_ugaz.p_id !=None)
            """
            
            stmt = stmt.join(Instance_egaz, Instances.i_id == Instance_egaz.i_id, isouter=True).join(Instance_ugaz,Instances.i_id==Instance_ugaz.i_id,isouter=True)
            if "sem lugares" in req["P_types"]:
                #subqNoInst = select(Stories, Instances).join(Stories.instancing, isouter=True).join(Instance_ugaz,Instances.i_id == Instance_ugaz.i_id,isouter=True).join(Instance_egaz,Instances.i_id ==Instance_egaz.i_id, isouter=True).order_by(Stories.s_id,Instances.i_id).where(Instances.i_id.is_(None))
                subqNoInst = select(Stories, Instances).join(Stories.instancing, isouter=True).order_by(Stories.s_id,Instances.i_id).where(Instances.i_id.is_(None))
                if "administrativo" in req["P_types"]:
                    if "personalizado" in req["P_types"]:
                        print("sem definição, administrativo, personalizado")
                        subqBase = stmt.where(or_(Instance_egaz.e_id != None,Instance_ugaz.p_id !=None))
                    else:
                        print("Sem definição, administrativo")
                        subqBase = stmt.where(Instance_egaz.e_id != None)
                    subqUnion = (union(select(subqNoInst.c.s_id,subqNoInst.c.i_id),select(subqBase.c.s_id,subqBase.c.i_id)).subquery())
                    stmt = stmtBase.join(subqUnion, (Stories.s_id == subqUnion.c.s_id) & (Instances.i_id == subqUnion.c.i_id)) #wMISSING SORIES WIHOUT INSTANCES, THERE ARE GETTING LOST IN THE JOIN
                elif "personalizado" in req["P_types"]:
                    print("Sem definição, personalizado")
                    subqBase = stmt.where(Instance_ugaz.p_id !=None)
                    subqUnion = (union(select(subqNoInst.c.s_id,subqNoInst.c.i_id),select(subqBase.c.s_id,subqBase.c.i_id)).subquery())
                    stmt = stmtBase.join(subqUnion, (Stories.s_id == subqUnion.c.s_id) & (Instances.i_id == subqUnion.c.i_id)) #MISSING STORIES WITHOUT INSTANCES; GETTING LOST IN THE JOIN
                else:
                    print("sem definição")
                    stmt = subqNoInst
            elif "administrativo" in req["P_types"]:
                if "personalizado" in req["P_types"]:
                    print("Administrativo, personalizado")
                    stmt = stmt.where(or_(Instance_egaz.e_id != None,Instance_ugaz.p_id !=None))
                else:
                    print("Administrativo")
                    stmt = stmt.where(Instance_egaz.e_id != None)
            else:
                print("Personalizado")
                stmt = stmt.where(Instance_ugaz.p_id !=None)    

        #If no """instance filters, defaultot story level filters (using the left join)
        if instance_filtered is False:
            print("No instance filters applied")
            stmt = stmtLeft
        else:
            print("Instance filters applied")
            is_filtered = True
        
        ### STORY LEVEL FILTERS ###
        if len(req["Tags"])>0:
            story_filtered = True
            print(req["Tags"])
            subqT = (select(Tags).where(Tags.tag_name.in_(req["Tags"])).subquery())
            stmt = stmt.join(Tagging, Stories.s_id == Tagging.story_id).join(subqT, Tagging.t_id == subqT.c.tag_id)
            print("STMT after Tags: ",stmt)        
        if len(req["Sections"])>0:
            story_filtered = True
            print(req["Sections"])
            subqS = (select(Sections).where(Sections.section_name.in_(req["Sections"])).subquery())
            stmt = stmt.join(Sectioning, Stories.s_id == Sectioning.story_id).join(subqS, Sectioning.s_id == subqS.c.section_id)
        if len(req["Authors"])>0:
            story_filtered = True
            print(req["Authors"])
            subqA = (select(Authors).where(Authors.author_name.in_(req["Authors"])).subquery())
            stmt = stmt.join(Authoring, Stories.s_id == Authoring.story_id).join(subqA, Authoring.a_id == subqA.c.author_id)
        if len(req["Publications"])>0:
            story_filtered = True
            print(req["Publications"]) 
            subqP = (select(Publications).where(Publications.publication_name.in_(req["Publications"])).subquery())
            stmt = stmt.join(Publicationing, Stories.s_id == Publicationing.story_id).join(subqP, Publicationing.p_id == subqP.c.publication_id)
        if req["pubDateFilterMax"] == True:
            if req["pubDateFilterMin"] == True:
                story_filtered = True
                print("Date range: ",req["pubDateR1"]," - ",req["pubDateR2"])
                print(type(req["pubDateR2"]))
                stmt = stmt.where(Stories.pub_date.between(req["pubDateR1"],req["pubDateR2"][0:11]+"23:59:59.999Z"))
        #if req["pubDateFilter"] == False:
        #    is_filtered = True
        #    print("Date range: all")

        
        if story_filtered is True:
            print("Story filters applied")
            is_filtered = True

        #If filters have been activated:
        if is_filtered is True:
            print("executing filtering statement")
            results = session.execute(stmt)
            # results = session.scalars(stmt).all()
            count = 0
            for result in results:
                count +=1
                #print ("Story: ",result.Stories)
                if result.Stories.s_id not in s_ids:
                    s_ids.append(result.Stories.s_id)
                    stories[result.Stories.s_id] = {
                        "pub_date": result.Stories.pub_date,
                        "tags": result.Stories.tags,
                        "section": result.Stories.section,
                        "publication": result.Stories.publication,
                        "author": result.Stories.author
                    }
                else:
                    dupS += 1
                if result.Instances is not None:
                    #print("Instance: ",result.Instances)
                    if result.Instances.i_id not in i_ids:
                        i_ids.append(result.Instances.i_id)
                        stories[result.Stories.s_id][result.Instances.i_id] = {
                            "t_begin": result.Instances.t_begin,
                            "t_end": result.Instances.t_end,
                            "t_type": result.Instances.t_type,
                            "p_desc": result.Instances.p_desc,
                            "p_name": result.Instances.p_name
                        }
                #else:
                    #print("no instance")
            print("Number of results: ",count,", # s_ids: ",len(s_ids),", # i_ids: ", len(i_ids), ", # stories: ", len(stories))
        
        response["sIDs"] = s_ids 
        response["iIDs"] = i_ids
        #response["stories"] = stories
        #print("response: ",response)
        return make_response(jsonify(response),200)

    #INITIATING MAP EXPLORE PAGE
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
                "sem lugares": {
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
                t_types = cleanLists(list_in = [row["t_type"]], s_id = row["s_id"],i_id=row["i_id"],list_out = t_types)
                pub_dates = cleanLists(list_in = [row["pub_date"]], s_id = row["s_id"],i_id=row["i_id"],list_out = pub_dates)
                if not row["i_id"]:
                    p_types["sem lugares"]["s_ids"].append(row["s_id"])
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
            p_types["sem lugares"]["total_s"]=len(p_types["sem lugares"]["s_ids"])
            p_types["personalizado"]["total_s"] = len(p_types["personalizado"]["s_ids"])
            p_types["personalizado"]["total_i"] = len(p_types["personalizado"]["i_ids"])
            p_types["administrativo"]["total_s"] = len(p_types["administrativo"]["s_ids"])  
            p_types["administrativo"]["total_i"] = len(p_types["administrativo"]["i_ids"])
            print("i_range: ",i_range)
                       
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
                    SQL = text("SELECT t.t_id, tags.tag_name, count FROM (SELECT t_id, count(*) FROM apregoar.tagging GROUP BY t_id) t LEFT JOIN apregoar.tags on t.t_id = tags.tag_id ORDER BY tag_name")
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
                    SQL = text("SELECT s.s_id, sections.section_name, count FROM (SELECT s_id, count(*) FROM apregoar.sectioning GROUP BY s_id) s LEFT JOIN apregoar.sections on s.s_id = sections.section_id ORDER BY section_name")
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
                    SQL = text("SELECT a.a_id, authors.author_name, count FROM (SELECT a_id, count(*) FROM apregoar.authoring GROUP BY a_id) a LEFT JOIN apregoar.authors on a.a_id = authors.author_id ORDER BY author_name")
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
                    SQL = text("SELECT p.p_id, publications.publication_name, count FROM (SELECT p_id, count(*) FROM apregoar.publicationing GROUP BY p_id) p LEFT JOIN apregoar.publications on p.p_id = publications.publication_id ORDER BY publication_name")
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
    

