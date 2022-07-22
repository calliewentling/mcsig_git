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
from operator import itemgetter




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
                "publication": row["publication"].replace('"','\\\"').replace("'","\\\'")
            }
            if iExist == True: #ensure instances exist
                geonoticia["instances"] = instances
                print()
                print("geonoticia w instances: ", geonoticia)
                num_instances = len(instances)
                print("num_instances: ",num_instances)

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
                            #"priority": priority,
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
                    return render_template("jornal/historia.html", num_instances=num_instances, instance=instance, geonoticia =geonoticia, nearbys = nearbys)   
                return render_template("jornal/historia.html", num_instances=num_instances, instance=instance, geonoticia =geonoticia, nearbys = [])
            return render_template("jornal/historia.html", num_instances=0, instance=[], geonoticia=geonoticia, nearbys = [])
    return render_template("user/index.html", notice="A história não  existe")


