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


def cleanLists(list_in, s_id, i_id,list_out):
    for item in list_in:
        if not item:
            item = "*sim valor"
        if item == " ":
            item = "*sim valor"
        print(item," - ",type(item))
        if type(item) == "str":
            item_p = item.strip().lower()
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
    return list_out


@app.route("/explore/map", methods=["GET","POST"])
def explore():
    #Getting values for user filtering
    try:
        with engine.connect() as conn:
            SQL = text("SELECT s_id, i_id, pub_date, section, tags, author, publication, t_begin, t_end, t_type, p_id, e_ids FROM apregoar.geonoticias")
            result = conn.execute(SQL)
    except: 
        conn.close()
        print("Error in distracting filters from database")
    else:
        conn.close()
        tags = {}
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
            tags = cleanLists(list_in = list(row["tags"].replace('"','\\\"').replace("'","\\\'").split(",")), s_id = row["s_id"], i_id=row["i_id"],list_out = tags)
            sections= cleanLists(list_in = list(row["section"].replace('"','\\\"').replace("'","\\\'").split(",")), s_id = row["s_id"],i_id=row["i_id"],list_out = sections)
            authors = cleanLists(list_in = list(row["author"].replace('"','\\\"').replace("'","\\\'").split(",")), s_id = row["s_id"],i_id=row["i_id"],list_out = authors)
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
        tags = sorted(tags.items())
        sections = sorted(sections.items())
        authors = sorted(authors.items())
        publications = sorted(publications.items())
        t_types = sorted(t_types.items())
        pub_dates = sorted(pub_dates.items())
        p_types = sorted(p_types.items())
        print("tags: ",tags)
        e_names = {}
        try:
            with engine.connect() as conn:
                SQL2 = text("SELECT * FROM apregoar.egaz_filter")
                result2 = conn.execute(SQL2)
        except: 
            conn.close()
            print("Error in distracting filters from database")
        else:
            conn.close()
            for row in result2:
                e_names[row["e_name"]] = {
                    "total_i": row["total_count"],
                    "e_id": row["e_id"]
                }
            e_names = sorted(e_names.items())
    return render_template("explore/explore_map.html", tags = tags, sections = sections, authors = authors, publications = publications, t_types=t_types, p_types = p_types, e_names = e_names, pub_dates = pub_dates, i_range = i_range)
    

