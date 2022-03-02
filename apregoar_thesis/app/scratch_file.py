#### THIS IS NOT REAL ###
@app.route("/for_testing")
def notreal():
    #Switch coordinate order here
    shape=Polygon(coords)
    print()
    print("shape: ")
    print(shape)
    shapeWKT=shape.to_wkt()
    print(shapeWKT)
    pentry = UGazetteer(p_name, shapeWKT, u_id)
    print()
    print("pentry: ")
    print(pentry)
            
    session.add(pentry)
    session.commit()
    print("feature committed!")
    #determine place ID to associate to instance
    p_id=None
    with engine.connect() as conn:
        SQL = text("SELECT p_id FROM apregoar.ugazetteer WHERE p_name = :x AND u_id =:y ORDER BY p_id DESC LIMIT 1")
        SQL = SQL.bindparams(x=p_name, y=u_id)
        result = conn.execute(SQL)
        print("current assigned p_id: ",p_id)
        for row in result:
            p_id=row['p_id']
            print(p_id)
    #Save instance for each geometry with associated p_id
    ientry = Instances(t_begin, t_end, t_type, t_desc, p_desc, s_id, p_id, u_id)
    session.add(ientry)
    session.commit()
    cur.execute("""
        SELECT e_id, name
        FROM apregoar.egazetteer AS egaz
        WHERE ST_Intersects(
            egaz.geom,
            (
                SELECT geom
                FROM apregoar.ugazetteer
                WHERE p_id = %(pgeom)s
                ORDER BY p_id DESC LIMIT 1
            )
        );""",
        {'pgeom':p_id,}
    )
    autoP = cur.fetchall()
    print(autoP)

    with engine.connect() as conn:
        for i in autoP:
            print(i[0])
            cur.execute("""
                INSERT INTO apregoar.spatial_assoc (place_id, freguesia_id)
                VALUES (%(id)s,%(e_id)s)
                """,
                {'id':p_id,'e_id':i[0]}
            )
    conn.commit()
    print("spatial association complete!")
    print("Instance committed!!")
print("places and instances saved!")

#### Replaced by RETURNING S_ID in story saving
        else:
            story["s_id"] = s_id
            #Get saved id (s_id)
            try:
                with engine.connect() as conn:
                    SQL = text("SELECT * FROM apregoar.stories WHERE web_link = :x")
                    SQL = SQL.bindparams(x=story["web_link"])
                    result = conn.execute(SQL)
            except:
                #Go to dashboard to manually select the story for edit/development
                print("Error in extracting desired story from database")
                feedback=f"Erro"
                flash(feedback,"danger")
                return render_template("publisher/dashboard.html")
            else:
                #Go to story edit page
                for row in result:
                    story = row
                if story:
                    s_id = story["s_id"]
                    print(s_id)
                    return render_template("publisher/review.html", story=story, sID = s_id)
                else:
                    feedback = f"No valid story selected"
                    flash(feedback, "danger")

from shapely.geometry import Polygon
connection = psycopg2.connect(database="pythonspatial",user="postgres", password="postgres")
cursor = conectionn.cursor()
cursor.execute("CREATE TABLE poly (id SERIAL PRIMARY KEY, location GEOMETRY)")
a=Polygon([(-106.936763,35.958191),(-106.944385,35.239293),(-106.452396,35.281908),(-106.407844,35.948708)])
cursor.execute("INSERT INTO poly (location) VALUES (ST_GeomFromText('{}'))".format(a.wkt))
connection.commit()
