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
from .explore_views import process_explore,prepare_explore, cleanLists
from operator import itemgetter

##############################################
### DEFINE VIEW OF INDIVIDUAL STORIES WITH MOCK MAP DISPLAY
##############################################

@app.route("/jornal/<s_id>/historia", methods=["GET","POST"])
def historia(s_id):
    print(s_id)
    try:
        with engine.connect() as conn:
            SQL = text("SELECT * FROM apregoar.geonoticias WHERE s_id = :x")
            SQL = SQL.bindparams(x=s_id)
            result = conn.execute(SQL)
    except: 
        conn.close()
        print("Error in extracting desired story from database")
        feedback=f"Erro"
        flash(feedback,"danger")
    else:
        instances = []
        geonoticia = {}
        sExists = False
        iExist = False
        print("Result: ",result)
        for row in result:
            sExists = True
            print(row)
            print()
            if row["i_id"] is not None:
                iExist = True
                instance = {
                    "i_id": row["i_id"],
                    "t_begin": row["t_begin"],
                    "t_end": row["t_end"],
                    "t_type": row["t_type"],
                    "t_desc": row["t_desc"].replace('"','\\\"').replace("'","\\\'"),
                    "p_name": row["p_name"].replace('"','\\\"').replace("'","\\\'"),
                    "p_desc": row["p_desc"].replace('"','\\\"').replace("'","\\\'"),
                    #"geom": row["all_gaz"]
                }
                instances.append(instance)
        print("instances: ",instances)
        if sExists == True: #Ensure the story is real
            geonoticia = {
                "s_id": s_id,
                "title": row["title"].replace('"','\\\"').replace("'","\\\'"),
                "summary": row["summary"].replace('"','\\\"').replace("'","\\\'"),
                "pub_date": row["pub_date"],
                "web_link": row["web_link"],
                "section": row["section"].replace('"','\\\"').replace("'","\\\'"),
                "tags": list(row["tags"].replace('"','\\\"').replace("'","\\\'").split(",")),
                "author": row["author"].replace('"','\\\"').replace("'","\\\'"),
                "publication": row["publication"].replace('"','\\\"').replace("'","\\\'"),
                "publication_id": row["publication_id"],
            }
            if iExist == True: #ensure instances exist
                geonoticia["instances"] = instances
                print()
                print("geonoticia w instances: ", geonoticia)
                num_instances = len(instances)
                print("num_instances: ",num_instances)

                #Extract jornal info from database
                try: 
                    with engine.connect() as conn:
                        SQL = text("SELECT * FROM apregoar.publications WHERE publication_id = :x")
                        SQL = SQL.bindparams(x=geonoticia["publication_id"])
                        result = conn.execute(SQL)
                except:
                    print("problem with extraction of publication information")
                    conn.close()
                else:
                    for row in result:
                        publication = {
                            "p_name": row["publication_name"],
                            "p_id": row["publication_id"],
                            "p_colors": row["colors"],
                            "p_sections": row["main_sections"],
                        }
                    #Add a way to view related instances
                    try:
                        with engine.connect() as conn:
                            SQL = text("SELECT egazetteer.name, egazetteer.type, egazetteer.e_id, egaz_filter.total_count FROM (SELECT DISTINCT(COALESCE(instance_egaz.e_id,spatial_assoc.e_id)) AS e_id FROM apregoar.instances LEFT JOIN apregoar.instance_ugaz ON instances.i_id = instance_ugaz.i_id LEFT JOIN apregoar.spatial_assoc ON instance_ugaz.p_id = spatial_assoc.p_id LEFT JOIN apregoar.instance_egaz ON instances.i_id = instance_egaz.i_id WHERE s_id = :x) egaz_id LEFT JOIN apregoar.egazetteer ON egaz_id.e_id = egazetteer.e_id LEFT JOIN apregoar.egaz_filter ON egaz_id.e_id = egaz_filter.e_id")
                            SQL = SQL.bindparams(x=s_id)
                            result = conn.execute(SQL)
                            print("result: ",result)
                    except:
                        print("problem with extraction of place")
                        conn.close()
                    else:
                        conn.close()
                        nearbys = []
                        p1 = []
                        p2 = []
                        p3 = []
                        p4 = []
                        for row in result:
                            ## New method
                            nearby = {
                                "name": row["name"].upper(),
                                "type": row["type"],
                                "e_id": row["e_id"],
                                "count": row["total_count"],
                            }
                            if row["type"] == "freguesia":
                                nearby["priority"] = 1
                                p1.append(nearby)
                            elif row["type"] == "conselho":
                                nearby["priority"] = 2
                                p2.append(nearby)
                            elif row["type"] == "concelho":
                                nearby["priority"] = 2
                                p2.append(nearby)
                            elif row["type"] == "distrito":
                                nearby["priority"] = 4
                                p4.append(nearby)
                            elif row["type"] == "":
                                nearby["priority"] = 4
                                p4.append(nearby)
                            else:
                                nearby["priority"] = 3
                                p3.append(nearby)
                        for n in p1:
                            nearbys.append(n)
                        for n in p2:
                            nearbys.append(n)
                        for n in p3:
                            nearbys.append(n)
                        for n in p4:
                            nearbys.append(n)
                
                        print("nearbys: ",nearbys)
                        print("publication: ",publication)
                        return render_template("jornal/historia.html", num_instances=num_instances, instance=instance, geonoticia =geonoticia, nearbys = nearbys, publication = publication)   
                    return render_template("jornal/historia.html", num_instances=num_instances, instance=instance, geonoticia =geonoticia, nearbys = [], publication = publication)
            return render_template("jornal/historia.html", num_instances=0, instance=[], geonoticia=geonoticia, nearbys = [], publication = {})
    return render_template("user/index.html", notice="A história não  existe")

#This an interim to capture the e_id passed from JS. It assigns the e_id as a session variable and passes it to a prettier URL that renders the jornal map
@app.route("/<publication>/mapa/<e_id>", methods=["GET","POST"])
def pub_map_specific(publication, e_id):
    fsession["e_id"] = e_id
    print("pub_map(publication,e_id)")
    print("publication: ",publication)
    print("e_id: ",e_id)
    try:
        with engine.connect() as conn:
            SQL = text("SELECT publication_id, publication_name FROM apregoar.publications WHERE publication_name LIKE :x")
            SQL = SQL.bindparams(x=publication.lower().replace("_"," "))
            result = conn.execute(SQL)
    except:
        conn.close()
        return redirect(url_for("explore"))
    else:
        for row in result:
            fsession["p_name"] = row["publication_name"]                
        return redirect(url_for("pub_map",publication=fsession["p_name"]))


#Rely on existing explore.js to reduce dev.
@app.route("/<publication>/mapa", methods=["GET","POST"])
def pub_map(publication):
    print("pub_map(publication)")
    print("publication: ",publication)

    if request.method == "POST":
        req = request.get_json()
        response = process_explore(req=req)
        return make_response(response,200)
    else:
        #Determine if any e_id have been passed with the publication
        try:
            e_id = fsession["e_id"] 
        except:
            e_id = 0
        else:
            if e_id == 0:    
                print("e_id: none")
            else:
                print("e_id: ",e_id)
            fsession["e_id"] = 0
        
        try:
            with engine.connect() as conn:
                SQL = text("SELECT publication_id, publication_name, colors, main_sections FROM apregoar.publications WHERE publication_name LIKE :x")
                SQL = SQL.bindparams(x=publication.lower().replace("_"," "))
                result = conn.execute(SQL)
        except:
            conn.close()
            return render_template("explore/explore_map.html")
        else:
            for row in result:
                p_id = row["publication_id"]
                p_sections = row["main_sections"]
                
                publication = {
                    "p_id": p_id,
                    "p_name": row["publication_name"],
                    "p_colors": row["colors"],
                }
                jVals = prepare_exploreJ(p_id)
                #Determining main sections for jornal
                counter = 0
                counterMax = 5
                big_section = []
                print("p_sections: ",p_sections, type(p_sections))
                if len(p_sections) > 1:
                    if len(p_sections) < counterMax:
                        counterMax = len(p_sections)
                    
                    for section in p_sections:
                        if section in jVals["sections"]:
                            big_section.append(section)
                            if (counter == counterMax):
                                break
                            counter += 1
                    if counter < counterMax:
                        for section in jVals["sections"]:
                            if section not in big_section:
                                big_section.append(section)
                            if (counter == counterMax):
                                break
                            counter += 1
                else:
                    if len(jVals["sections"]) < counterMax:
                        counterMax = len(jVals["sections"])
                    for section in jVals["sections"]:
                        big_section.append(section)
                        if (counter == counterMax):
                                break
                        counter += 1
                print("counterMax = ",counterMax,". counter: ",counter)
                big_section2 = []
                for i in big_section:
                    big_section2.append(i.upper())
                return render_template("jornal/jornal_map.html", publication = publication ,e_id=e_id, jVals = jVals,bigSections = big_section2)
    return render_template("explore/explore_map.html")
    


def prepare_exploreJ(p_id):
    try:
        with engine.connect() as conn:
            SQL = text("SELECT s_id, i_id, pub_date, section, section_id, author, author_id, publication, publication_id, t_begin, t_end, t_type, p_id, e_ids FROM apregoar.geonoticias WHERE publication_id = :x")
            SQL = SQL.bindparams(x=p_id)
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
                SQL2 = text("SELECT * FROM apregoar.egaz_filter") #Leave this as all EGAZ or reduce to only egaz in jornal?
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
                SQL = text("SELECT t_id, tag_name, count FROM (SELECT t_id, COUNT(*) AS count FROM apregoar.stories LEFT JOIN apregoar.publicationing ON stories.s_id = publicationing.story_id LEFT JOIN apregoar.tagging ON stories.s_id = tagging.story_id WHERE p_id = :x GROUP BY t_id) t LEFT JOIN apregoar.tags ON t.t_id = tags.tag_id ORDER BY tag_name")
                SQL = SQL.bindparams(x = p_id)
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
                SQL = text("SELECT s.s_id, section_name, count FROM (SELECT sectioning.s_id, COUNT(*) AS count FROM apregoar.stories LEFT JOIN apregoar.publicationing ON stories.s_id = publicationing.story_id LEFT JOIN apregoar.sectioning ON stories.s_id = sectioning.story_id  WHERE p_id = :x GROUP BY sectioning.s_id) s LEFT JOIN apregoar.sections ON s.s_id = sections.section_id ORDER BY count DESC")
                SQL = SQL.bindparams(x = p_id)
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
                SQL = text("SELECT a_id, author_name, count FROM (SELECT a_id, COUNT(*) AS count FROM apregoar.stories LEFT JOIN apregoar.publicationing ON stories.s_id = publicationing.story_id LEFT JOIN apregoar.authoring ON stories.s_id = authoring.story_id WHERE p_id = :x GROUP BY a_id) a LEFT JOIN apregoar.authors ON a.a_id = authors.author_id ORDER BY author_name")
                SQL = SQL.bindparams(x = p_id)
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

        dates = {}
        #Get max and min pub date
        try:
            with engine.connect() as conn:
                SQL = text("SELECT MIN(pub_date) AS pubdate1, MAX(pub_date) as pubdate2 FROM apregoar.stories LEFT JOIN apregoar.publicationing ON stories.s_id = publicationing.story_id WHERE p_id = :x")
                SQL = SQL.bindparams(x = p_id)
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
                SQL2 = text("SELECT MIN(t_begin) AS idate1, MAX(t_end) AS idate2 FROM apregoar.instances LEFT JOIN apregoar.publicationing ON instances.s_id = publicationing.story_id WHERE p_id = :x")
                SQL2 = SQL2.bindparams(x = p_id)
                result2 = conn.execute(SQL2)
        except:
            conn.close()
            print("Error in extracting max and min instance dates")
        else:
            print("Extracted max and min instance dates")
            for row in result2:
                dates["idate1"] = row["idate1"]
                dates["idate2"] = row["idate2"]

        #Get range of last 100 pubdates
        try:
            with engine.connect() as conn:
                SQL3 = text("SELECT MIN(pub_date) AS R1, MAX(pub_date) AS R2 FROM (SELECT * FROM apregoar.stories LEFT JOIN apregoar.publicationing ON stories.s_id = publicationing.story_id WHERE p_id = :x ORDER BY pub_date DESC LIMIT 25) recentstories")
                SQL3 = SQL3.bindparams(x = p_id)
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
            "p_types": p_types,
            "t_types": t_types,
            "e_names": e_names,
            "pub_dates": pub_dates,
            "i_range": i_range, 
            "pub_date_range": pub_date_range, 
            "dates": dates
        }
        return allVals