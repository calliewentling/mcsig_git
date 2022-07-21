from app import app
from datetime import datetime
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from flask import Flask, g, render_template, request, flash, jsonify, make_response, json, request, jsonify, make_response, render_template, session as fsession, redirect, url_for
import psycopg2

from app import engine, session, text


@app.route("/")
def index():
    return render_template("user/index.html")

#########################
###### User login
#########################

@app.route("/<login_source>/sign_up", methods=["GET","POST"])
def sign_upU(login_source):
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
                    conn.rollback()
                    cur.close()
                else:
                    print("User added to database")
                    return redirect(url_for("sign_inU"))
            else:
                feedback=f"O username já existe. Seleciona um novo username, se faz favor."
                return render_template("user/sign_up.html", feedback=feedback)
    return render_template("user/sign_up.html")

@app.route("/<login_source>/sign_in", methods=["GET", "POST"])
def sign_inU(login_source):
    print("sign_inU")

    
    
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
                if login_source == "publisher":
                    return redirect(url_for("publisher_dashboard"))
                else:
                    return render_template("user/profile.html",user=fsession)    
            else:
                print("Combo not found")
                feedback = f"Username/password combination not found. Please try again."
                return render_template("user/sign_in.html", feedback=feedback)

    return render_template("user/sign_in.html")

@app.route("/<login_source>/sign_out")
def sign_outU(login_source):
    fsession.pop("username", None)
    fsession.pop("email", None)
    fsession.pop("u_id", None)
    fsession.pop("org", None)
    print("fsession: ",fsession)
    return redirect(url_for("sign_inU", login_source = login_source))

@app.route("/user/profile")
def render_profile():
    print('fsession exists: ',fsession)
    print("length of fsession: ",len(fsession))
    if len(fsession) > 0:
        return render_template("user/profile.html", user=fsession)
    else: 
        return redirect(url_for("sign_inU", login_source = 'user'))
