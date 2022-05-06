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
        conn.close()
        instances = []
        geonoticia = {}
        valid = False
        print("Result: ",result)
        for row in result:
            valid = True
            print(row)
            print()
            if row["i_id"] is not None:
                instance = {
                    "i_id": row["i_id"],
                    "t_begin": row["t_begin"],
                    "t_end": row["t_end"],
                    "t_type": row["t_type"],
                    "t_desc": row["t_desc"].replace('"','\\\"').replace("'","\\\'"),
                    "p_name": row["p_name"].replace('"','\\\"').replace("'","\\\'"),
                    "p_desc": row["p_desc"].replace('"','\\\"').replace("'","\\\'"),
                    "geom": row["all_gaz"]
                }
                instances.append(instance)
        print("instances: ",instances)
        if valid == True: #Ensure the story is real
            geonoticia = {
                "s_id": s_id,
                "title": row["title"].replace('"','\\\"').replace("'","\\\'"),
                "summary": row["summary"].replace('"','\\\"').replace("'","\\\'"),
                "pub_date": row["pub_date"],
                "web_link": row["web_link"],
                "section": row["section"].replace('"','\\\"').replace("'","\\\'"),
                "tags": row["tags"].replace('"','\\\"').replace("'","\\\'"),
                "author": row["author"].replace('"','\\\"').replace("'","\\\'"),
                "publication": row["publication"].replace('"','\\\"').replace("'","\\\'"),
                "instances": instances
            }
            print()
            print("geonoticias: ", geonoticia)
            num_instances = len(instances)
            print("num_instances: ",num_instances)
            return render_template("jornal/historia.html", geonoticia=geonoticia, numInstances = num_instances, instance=instance)
    return render_template("user/index.html", notice="A história não  existe")