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
from geoalchemy2 import Geometry
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

def processInstance(instanceResult):
    i_T = ""
    if instanceResult.t_type=="allday_p":
        i_D = "Temporada continual"
    else:
        if instanceResult.t_begin.date() == instanceResult.t_end.date():
            i_D = str(instanceResult.t_begin.date())
        else:
            i_D = str(instanceResult.t_begin.date())+" - "+str(instanceResult.t_end.date())
        if instanceResult.t_type == "allday_no":
            i_T = str(instanceResult.t_begin.time())+" - "+str(instanceResult.t_end.time())
    
    instance_def = {
        "i_id": instanceResult.i_id,
        "t_begin": str(instanceResult.t_end),
        "t_end": str(instanceResult.t_end),
        "t_type": instanceResult.t_type,
        "p_desc": instanceResult.p_desc,
        "t_desc": instanceResult.t_desc,
        "p_name": instanceResult.p_name,
        "i_D": i_D,
        "i_T": i_T,
    }

    return instance_def

def process_explore(req):
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
    stmtI = stmtBase
    stmtLeft = select(Stories, Instances).join(Stories.instancing, isouter=True).order_by(Stories.s_id,Instances.i_id)

    print()
    print()
    print("New request made")
    if len(req["boundaryPolys"]) > 0:
        instance_filtered = True
        print("boundaryPolys exist")
        features = json.loads(req["boundaryPolys"])
        multiShape=[]
        shapeP = None
        #Prepare feature geometry
        all_coords = features['coordinates']
        for i in range(len(all_coords)):
            shape_coords = all_coords[i]
            #print(shape_coords)
            shapeP = Polygon(shape_coords)
            multiShape.append(shapeP)
        multiP = MultiPolygon(multiShape)
        new_geom = 'SRID=4326;'+multiP.wkt
        #Spatial filtering
        geomF = func.ST_MakeValid(func.ST_GeomFromEWKT(new_geom))
        ugaz = (select(Instance_ugaz.i_id, func.ST_Union(func.ST_MakeValid(Ugazetteer.geom)).label('ugeom')).join(Ugazetteer, Instance_ugaz.p_id == Ugazetteer.p_id, isouter=True).group_by(Instance_ugaz.i_id).subquery()) #.where(Instance_ugaz.p_id != 607)
        egaz = (select(Instance_egaz.i_id, func.ST_Union(func.ST_MakeValid(Egazetteer.geom)).label('egeom')).join(Egazetteer, Instance_egaz.e_id == Egazetteer.e_id, isouter=True).group_by(Instance_egaz.i_id).subquery())
        allgaz = (select(Instances.i_id, func.coalesce(func.ST_Union(egaz.c.egeom, ugaz.c.ugeom),func.ST_Collect(egaz.c.egeom, ugaz.c.ugeom)).label('geom')).join(egaz, Instances.i_id==egaz.c.i_id, isouter=True).join(ugaz,Instances.i_id==ugaz.c.i_id, isouter=True).subquery())
        #allgaz = (select(Instances.i_id, func.ST_Union(func.ST_Union(egaz.c.egeom), func.ST_Union(ugaz.c.ugeom)).label('geom')).join(egaz, Instances.i_id == egaz.c.i_id, isouter=True).join(ugaz,Instances.i_id == ugaz.c.i_id, isouter=True).group_by(Instances.i_id,egaz.c.egeom,ugaz.c.ugeom).subquery())
        
        if req["boundaryDefinition"] == "containTotal":
            print("containComplete")
            subqArea = (select(allgaz.c.i_id).where(func.ST_Contains(func.ST_GeomFromEWKT(new_geom),allgaz.c.geom)).subquery())
            #subqUArea = (select(Instance_ugaz.i_id).join(Ugazetteer, Instance_ugaz.p_id == Ugazetteer.p_id).where(func.ST_Contains(func.ST_GeomFromEWKT(new_geom),func.ST_makeValid(Ugazetteer.geom))).subquery())
            #subqEArea = (select(Instance_egaz.i_id).join(Egazetteer, Instance_egaz.e_id == Egazetteer.e_id).where(func.ST_Contains(func.ST_GeomFromEWKT(new_geom),func.ST_makeValid(Egazetteer.geom))).subquery())
        elif req["boundaryDefinition"] == "intersects":
            print("intersect")
            subqArea = (select(allgaz.c.i_id).where(func.ST_Intersects(func.ST_GeomFromEWKT(new_geom),allgaz.c.geom)).subquery())
            #subqUArea = (select(Instance_ugaz.i_id).join(Ugazetteer, Instance_ugaz.p_id == Ugazetteer.p_id).where(func.ST_Intersects(func.ST_GeomFromEWKT(new_geom),func.ST_makeValid(Ugazetteer.geom))).subquery())
            #subqEArea = (select(Instance_egaz.i_id).join(Egazetteer, Instance_egaz.e_id == Egazetteer.e_id).where(func.ST_Intersects(func.ST_GeomFromEWKT(new_geom),func.ST_makeValid(Egazetteer.geom))).subquery())
        elif req["boundaryDefinition"] == "disjoint":
            print("disjoint")
            subqArea = (select(allgaz.c.i_id).where(func.ST_Disjoint(func.ST_GeomFromEWKT(new_geom),allgaz.c.geom)).subquery())
            #subqUArea = (select(Instance_ugaz.i_id).join(Ugazetteer, Instance_ugaz.p_id == Ugazetteer.p_id).where(func.ST_Disjoint(func.ST_GeomFromEWKT(new_geom),func.ST_Buffer(Ugazetteer.geom, 0))).subquery())
            #subqEArea = (select(Instance_egaz.i_id).join(Egazetteer, Instance_egaz.e_id == Egazetteer.e_id).where(func.ST_Disjoint(func.ST_GeomFromEWKT(new_geom),func.ST_Buffer(Egazetteer.geom, 0))).subquery())
        else:
            if req["boundaryDefinition"] == "containPartial":
                print("containPartial")
            else:
                print("no selection. defaulting to contains partial")
            subqArea = (select(allgaz.c.i_id.label('i_id')).where(or_(func.ST_Contains(geomF,allgaz.c.geom),func.ST_Overlaps(geomF,allgaz.c.geom))).subquery())
            #subqUArea = (select(Instance_ugaz.i_id).join(Ugazetteer, Instance_ugaz.p_id == Ugazetteer.p_id).where(or_(func.ST_Contains(func.ST_GeomFromEWKT(new_geom),func.ST_makeValid(Ugazetteer.geom)),func.ST_Overlaps(func.ST_GeomFromEWKT(new_geom),func.ST_makeValid(Ugazetteer.geom)))).subquery())
            #subqEArea = (select(Instance_egaz.i_id).join(Egazetteer, Instance_egaz.e_id == Egazetteer.e_id).where(or_(func.ST_Contains(func.ST_GeomFromEWKT(new_geom),func.ST_makeValid(Egazetteer.geom)),func.ST_Overlaps(func.ST_GeomFromEWKT(new_geom),func.ST_makeValid(Egazetteer.geom)))).subquery())
        #subqArea = (union(select(subqUArea),select(subqEArea)).subquery())
        stmtI = stmtI.join(subqArea,Instances.i_id == subqArea.c.i_id)
        
        """
        #TESTING remove later
        print("Begin test")
        stmt = stmtI
        results = session.execute(stmt)
        sIDs = []
        iIDs = []
        for result in results:
            #print("SID: ",result.Instances.s_id," IID: ",result.Instances.i_id)
            if result.Instances.s_id not in sIDs:
                sIDs.append(result.Instances.s_id)
            if result.Instances.i_id not in iIDs:
                iIDs.append(result.Instances.i_id)
        print("stories: ",len(sIDs)," instances: ",len(iIDs))
        print("End test")
        """
        

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
        stmtI = stmtI.join(subqU, Instances.i_id == subqU.c.i_id)     
    
    if len(req["T_types"])>0:
        instance_filtered = True
        print(req["T_types"])
        stmtI = stmtI.where(Instances.t_type.in_(req["T_types"]))

    if len(req["iDateR1"])>0:
        instance_filtered = True
        print(req["iDateR1"])
        stmtI = stmtI.where(Instances.t_begin >= req["iDateR1"])
    if len(req["iDateR2"])>0:
        instance_filtered = True
        print(req["iDateR2"])
        stmtI = stmtI.where(Instances.t_end <= req["iDateR2"])      

    #This is at the end of instance filters so that it takes all current instance filters into account 
    ptype_filtered = False
    if len(req["P_types"])>0:
        ptype_filtered = True
        instance_filtered = True
        #Make a select subquery for each scenario. Union those relevant
        subqBase = stmtI.join(Instance_egaz, Instances.i_id == Instance_egaz.i_id).join(Instance_ugaz, Instances.i_id == Instance_ugaz.i_id)
        p_type_mixed = False
        p_type_sem = False
        stmtP = stmtI.join(Instance_egaz, Instances.i_id == Instance_egaz.i_id, isouter=True).join(Instance_ugaz,Instances.i_id==Instance_ugaz.i_id,isouter=True)
        if "sem lugares" in req["P_types"]:
            #subqNoInst = select(Stories, Instances).join(Stories.instancing, isouter=True).join(Instance_ugaz,Instances.i_id == Instance_ugaz.i_id,isouter=True).join(Instance_egaz,Instances.i_id ==Instance_egaz.i_id, isouter=True).order_by(Stories.s_id,Instances.i_id).where(Instances.i_id.is_(None))
            subqNoInst = select(Stories, Instances).join(Stories.instancing, isouter=True).order_by(Stories.s_id,Instances.i_id).where(Instances.i_id.is_(None))
            if "administrativo" in req["P_types"]:
                p_type_mixed = True
                if "personalizado" in req["P_types"]:
                    print("sem definição, administrativo, personalizado")
                    subqBase = stmtP.where(or_(Instance_egaz.e_id != None,Instance_ugaz.p_id !=None))
                else:
                    print("Sem definição, administrativo")
                    subqBase = stmtP.where(Instance_egaz.e_id != None)
            elif "personalizado" in req["P_types"]:
                print("Sem definição, personalizado")
                p_type_mixed = True
                subqBase = stmtP.where(Instance_ugaz.p_id !=None)  
            else:
                print("sem definição")
                instance_filtered = False
                p_type_sem = True
        elif "administrativo" in req["P_types"]:
            if "personalizado" in req["P_types"]:
                print("Administrativo, personalizado")
                stmtP = (stmtP.where(or_(Instance_egaz.e_id != None,Instance_ugaz.p_id !=None)).subquery())
            else:
                print("Administrativo")
                stmtP = (stmtP.where(Instance_egaz.e_id != None).subquery())
        else:
            print("Personalizado")
            stmtP = (stmtP.where(Instance_ugaz.p_id !=None).subquery())    

    #If no """instance filters, defaultot story level filters (using the left join)
    if instance_filtered is False:
        print("No instance filters applied")
    else:
        print("Instance filters applied")
        is_filtered = True
        #stmtI = (stmtI.subquery())
    
    ### STORY LEVEL FILTERS ###
    stmtS = stmtLeft
    
    if len(req["Tags"])>0:
        story_filtered = True
        print(req["Tags"])
        subqT = (select(Tags).where(Tags.tag_name.in_(req["Tags"])).subquery())
        stmtS = stmtS.join(Tagging, Stories.s_id == Tagging.story_id).join(subqT, Tagging.t_id == subqT.c.tag_id)
        #print("STMT after Tags: ",stmtS)        
    
    if len(req["Sections"])>0:
        story_filtered = True
        print(req["Sections"])
        subqS = (select(Sections).where(Sections.section_name.in_(req["Sections"])).subquery())
        stmtS = stmtS.join(Sectioning, Stories.s_id == Sectioning.story_id).join(subqS, Sectioning.s_id == subqS.c.section_id)
    
    if len(req["Authors"])>0:
        story_filtered = True
        print(req["Authors"])
        subqA = (select(Authors).where(Authors.author_name.in_(req["Authors"])).subquery())
        stmtS = stmtS.join(Authoring, Stories.s_id == Authoring.story_id).join(subqA, Authoring.a_id == subqA.c.author_id)

    if len(req["Publications"])>0:
        story_filtered = True
        print(req["Publications"]) 
        subqP = (select(Publications).where(Publications.publication_name.in_(req["Publications"])).subquery())
        stmtS = stmtS.join(Publicationing, Stories.s_id == Publicationing.story_id).join(subqP, Publicationing.p_id == subqP.c.publication_id)
    
    #Pubdate filters
    story_filtered = True
    stmtS = stmtS.where(Stories.pub_date.between(req["pubDateR1"],req["pubDateR2"][0:11]+"23:59:59.999Z"))
    
    #pNameSearch filter
    search_filtered = False
    if req["pNameSearch"] != "":
        print("pNameSearch: ",req["pNameSearch"]) 
        instance_filtered = True
        story_filtered = True
        search_filtered = True

    #pType Filtering. Incorporates separate queries unioned for stories and instances (in a mixed context: sem definição and admin/custom)
    if ptype_filtered is True:
        is_filtered = True
        if p_type_mixed == True:
            subqUnion = (union(select(subqNoInst.c.s_id,subqNoInst.c.i_id),select(subqBase.c.s_id,subqBase.c.i_id)).subquery())
            stmt = stmtS.join(subqUnion, (Stories.s_id == subqUnion.c.s_id) & (func.coalesce(Instances.i_id,0) == func.coalesce(subqUnion.c.i_id,0))) #MISSING STORIES WITHOUT INSTANCES; GETTING LOST IN THE JOIN                  
        elif p_type_sem == True:
            stmt = stmtS.where(Instances.i_id.is_(None))
        else: #IF NOT MIXED; NOT SEM DEFINITION
            stmt = stmtS.join(stmtP, Instances.i_id == stmtP.c.i_id)
    elif story_filtered is True:
        is_filtered = True
        if instance_filtered is True:
            stmtI = (stmtI.subquery())
            stmt = stmtS.join(stmtI, Instances.i_id == stmtI.c.i_id)
        else:
            stmt = stmtS
    elif instance_filtered is True:
        is_filtered = True
        stmt = stmtI

    #pNameSearch filtering (part 2)
    if search_filtered is True:
        #Doing this after all other filtering
        pNameSearch = "%{}%".format(req["pNameSearch"].lower())
        subqEgaz = (select(Egazetteer).where(func.lower(Egazetteer.name).like(pNameSearch)).subquery())
        subqEgaz2 = (select(Instance_egaz.i_id).join(subqEgaz,Instance_egaz.e_id==subqEgaz.c.e_id).subquery())
        subqUgaz = (select(Ugazetteer).where(or_(func.lower(Ugazetteer.p_name).like(pNameSearch),func.lower(Ugazetteer.p_desc).like(pNameSearch))).subquery())
        subqUgaz2= (select(Instance_ugaz.i_id).join(subqUgaz, Instance_ugaz.p_id == subqUgaz.c.p_id).subquery())
        subqInst = (select(Instances.i_id).where(func.lower(Instances.p_name).like(pNameSearch)).subquery())
        subqU = (union(select(subqEgaz2),select(subqUgaz2),select(subqInst)).subquery())
        stmtSearchI = (stmtBase.join(subqU, Instances.i_id == subqU.c.i_id).subquery())
        stmtSearchS = (stmtLeft.where(or_(func.lower(Stories.title).like(pNameSearch),func.lower(Stories.summary).like(pNameSearch))).subquery())
        subqU = (union(select(stmtSearchI.c.s_id,stmtSearchI.c.i_id), select(stmtSearchS.c.s_id,stmtSearchS.c.i_id)).subquery())
        stmt = stmt.join(subqU, (Stories.s_id == subqU.c.s_id) & (func.coalesce(Instances.i_id,0)==func.coalesce(subqU.c.i_id,0))) 

    #is_filtered = False #Remove after testing
    #print("Remove: is_filtered=False line")

    #If filters have been activated:
    if is_filtered is True:
        print("executing filtering statement")
        results = session.execute(stmt)
        # results = session.scalars(stmt).all()
        count = 0
        storiesJSON = []
        instancesJSON = []
        instanceStories = []
        for result in results:
            count +=1
            story = None
            #print ("Story: ",result.Stories)
            if result.Stories.s_id not in s_ids:
                #print("SID: ",result.Stories.s_id)
                s_ids.append(result.Stories.s_id)
                story = {
                    "s_id": result.Stories.s_id,
                    "title": result.Stories.title,
                    "pub_date": str(result.Stories.pub_date),
                    "tags": result.Stories.tags,
                    "section": result.Stories.section,
                    "publication": result.Stories.publication,
                    "author": result.Stories.author,
                    "summary": result.Stories.summary,
                    "web_link": result.Stories.web_link,
                    "instances_yes": [],
                    "instances_no": [],
                    #"instances_all": [],
                    "instances_all": {},
                }
                storiesJSON.append(story)
            else:
                dupS += 1
            if result.Instances is not None:
                #print("Instance: ",result.Instances)
                if result.Instances.i_id not in i_ids:
                    i_ids.append(result.Instances.i_id)
                    #Do processing of instance begin and end to return str of t_begin and t_end
                    t_begin = result.Instances.t_begin
                    t_end = result.Instances.t_end
                    ttype = result.Instances.t_type
                    #print(ttype,": ",t_begin,"-",t_end)
                    #print("t_begin type: ",type(t_begin))
                    i_T = ""
                    if ttype=="allday_p":
                        i_D = "Temporada continual"
                    else:
                        if t_begin.date() == t_end.date():
                            i_D = str(t_begin.date())
                        else:
                            i_D = str(t_begin.date())+" - "+str(t_end.date())
                        if ttype == "allday_no":
                            i_T = str(t_begin.time())+" - "+str(t_end.time())
                    
                    instance = {
                        "s_id": result.Stories.s_id,
                        "title": result.Stories.title,
                        "pub_date": str(result.Stories.pub_date),
                        "tags": result.Stories.tags,
                        "section": result.Stories.section,
                        "summary": result.Stories.summary,
                        "publication": result.Stories.publication,
                        "author": result.Stories.author,
                        "web_link": result.Stories.web_link,
                        "i_id": result.Instances.i_id,
                        "t_begin": str(result.Instances.t_end),
                        "t_end": str(result.Instances.t_end),
                        "t_type": result.Instances.t_type,
                        "p_desc": result.Instances.p_desc,
                        "t_desc": result.Instances.t_desc,
                        "p_name": result.Instances.p_name,
                        "i_D": i_D,
                        "i_T": i_T,
                    }
                    instancesJSON.append(instance)
                    for story in storiesJSON:
                        if story['s_id'] == result.Stories.s_id:
                            story["instances_yes"].append(result.Instances.i_id)
            #else:
                #print("no instance")
        print("Number of results: ",count,", # s_ids: ",len(s_ids),", # i_ids: ", len(i_ids), ", # stories: ", len(stories))
    
    response["sIDs"] = s_ids 
    response["iIDs"] = i_ids
    #Extracting all relatedd instances for each story
    stmt2 = select(Instances).where(Instances.s_id.in_(s_ids))
    results2 = session.execute(stmt2).all()
    for result in results2:
        instanceP = processInstance(result.Instances)
        for story in storiesJSON:
            if story["s_id"] == result.Instances.s_id:
                #story["instances_all"].append(result.Instances.i_id)
                story["instances_all"][result.Instances.i_id] = instanceP
                if result.Instances.i_id not in i_ids:
                    story["instances_no"].append(result.Instances.i_id)
    
    #Return current count of stories
    stmt = select(func.count(Stories.s_id.distinct()).label("countStories"))
    results = session.execute(stmt).all()
    for result in results:
        countStories = result.countStories
    response["countStories"] = countStories


    stmt = select(func.count(Instances.i_id.distinct()).label("countInstances"))
    results = session.execute(stmt).all()
    for result in results:
        countInstances = result.countInstances
    response["countInstances"] = countInstances

    """
    subq = (select(Instances.s_id, func.array_agg(Instances.i_id).label("iids")).where(Instances.i_id.in_(i_ids)).group_by(Instances.s_id).subquery())
    stmt3 = select(Instances, func.array_remove(subq.c.iids,Instances.i_id).label("iids")).join(subq, Instances.s_id == subq.c.s_id)
    results3 = session.execute(stmt3).all()

    print("i_ids: ",i_ids)
    for result in results3:
        #print()
        print(result.iids)
        for instance in instancesJSON:
            #print(result.Instances.i_id," ",instance["i_id"]," ",result.iids)
            if instance["i_id"] == result.Instances.i_id:
                #print("instance in instanceJSON: ",instance)
                instance["instances_yes"]=[]
                instance["instances_no"]=[]
                instance["instances_all"] = result.iids
                #print("instances_all: ",instance["instances_all"])
                for i in instance["instances_all"]:
                    #print("i: ",i)
                    if i in i_ids:
                        instance["instances_yes"].append(i)
                    else:
                        instance["instances_no"].append(i)
                break
    """
    for instance in instancesJSON:
        for story in storiesJSON:
            if instance["s_id"] == story["s_id"]:
                instance["instances_all"] = story["instances_all"]
                instance["instances_yes"] = story["instances_yes"]
                instance["instances_no"] = story["instances_no"]
                break
    
    response["stories"] = storiesJSON
    response["instances"] = instancesJSON
    #print("response['instances']: ",response["instances"])
    #print("Stories pre dumps: ",response["stories"])
    response = json.dumps(response, ensure_ascii=False) #Should this be True (default), then decoded on the otherside in js? Safer...
    #print("response: ",response)
    print("complete")
    return response

@app.route("/explore/map", methods=["GET","POST"])
def explore():
    if request.method == "POST":
        req = request.get_json()
        response = process_explore(req=req)
        return make_response(response,200)

#####################################
########  INITIATING MAP EXPLORE PAGE
#####################################

    else:
        #Getting values for user filtering
        allVals = prepare_explore()
    return render_template("explore/explore_map.html", tags = allVals["tags"], sections = allVals["sections"], authors = allVals["authors"], publications = allVals["publications"], t_types=allVals["t_types"], p_types = allVals["p_types"], e_names = allVals["e_names"], pub_dates = allVals["pub_dates"], i_range = allVals["i_range"], pubDateRange = allVals["pub_date_range"], allDates = allVals["dates"])
    

@app.route("/explore/ajuda", methods=["GET","POST"])
def explore_help():
    return render_template("explore/explore_help.html")

def prepare_explore():
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

        dates = {}
        #Get max and min pub date
        try:
            with engine.connect() as conn:
                SQL = text("SELECT MIN(pub_date) AS pubdate1, MAX(pub_date) as pubdate2 FROM apregoar.stories")
                result = conn.execute(SQL)
        except:
            conn.close()
            print("Error in extracting timeframe info")
        else:
            print("Extracted max and min pubdates")
            for row in result:
                dates["pubdate1"] = row["pubdate1"]
                dates["pubdate2"] = row["pubdate2"]
        #Get max and min instance dates
        try:
            with engine.connect() as conn:
                SQL2 = text("SELECT MIN(t_begin) AS idate1, MAX(t_end) AS idate2 FROM apregoar.instances")
                result2 = conn.execute(SQL2)
        except:
            conn.close()
            print("Error in extracting max and min instance dates")
        else:
            print("Extracted max and min instance dates")
            for row in result2:
                dates["idate1"] = row["idate1"]
                dates["idate2"] = row["idate2"]

        #Get range of last 25 pubdates
        try:
            with engine.connect() as conn:
                SQL3 = text("SELECT MIN(pub_date) AS R1, MAX(pub_date) AS R2 FROM (SELECT * FROM apregoar.stories ORDER BY pub_date DESC LIMIT 25) recentstories")
                result3 = conn.execute(SQL3)
        except:
            conn.close()
            print("Error in extraxcting max and min recent values")
        else:
            print("Extracted max and min recent range dates")
            for row in result3:
                #print("in row")
                #print(row)
                #print("row1",row[1])
                dates["pubdateR1"] = row[0]
                dates["pubdateR2"] = row[1]
        print("dates: ",dates, type(dates["pubdateR1"]))
        print("pub_date_range: ",pub_date_range,type(pub_date_range["min"]))
        conn.close()
        allVals = {
            "tags": tags,
            "sections": sections,
            "authors": authors,
            "publications": publications,
            "p_types": p_types,
            "t_types": t_types,
            "e_names": e_names,
            "pub_dates": pub_dates,
            "i_range": i_range, 
            "pub_date_range": pub_date_range, 
            "dates": dates
        }
        return allVals