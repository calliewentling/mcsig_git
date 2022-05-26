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
        item_p = item.strip().lower()
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
            SQL = text("SELECT s_id, i_id, section, tags, author, publication, t_begin, t_end, t_type FROM apregoar.geonoticias")
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
        print("Result: ",result)
        for row in result:
            tags = cleanLists(list_in = list(row["tags"].replace('"','\\\"').replace("'","\\\'").split(",")), s_id = row["s_id"], i_id=row["i_id"],list_out = tags)
            sections= cleanLists(list_in = list(row["section"].replace('"','\\\"').replace("'","\\\'").split(",")), s_id = row["s_id"],i_id=row["i_id"],list_out = sections)
            authors = cleanLists(list_in = list(row["author"].replace('"','\\\"').replace("'","\\\'").split(",")), s_id = row["s_id"],i_id=row["i_id"],list_out = authors)

            publications = cleanLists(list_in = [row["publication"].replace('"','\\\"').replace("'","\\\'")], s_id = row["s_id"],i_id=row["i_id"],list_out = publications)
            t_types = cleanLists(list_in = [row["t_type"]], s_id = row["s_id"],i_id=row["i_id"],list_out = t_types)
        tags = sorted(tags.items())
        sections = sorted(sections.items())
        authors = sorted(authors.items())
        publications = sorted(publications.items())
        t_types = sorted(t_types.items())
        print("tags: ",tags)
        #sections.sort()
        #authors.sort()
        #publications.sort()
    return render_template("explore/explore_map.html", tags = tags, sections = sections, authors = authors, publications = publications, t_types=t_types)
    

