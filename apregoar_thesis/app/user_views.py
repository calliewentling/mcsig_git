from app import app
from datetime import datetime
from flask import request, redirect, jsonify, make_response, render_template, redirect, url_for, g
from flask import session as fsession #To distinguish between flash session and sqalchemy session
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
import psycopg2

from app import engine, session, text
# import secrets
# secrets.token_urlsafe(16)

#app.config["SECRET_KEY"] = "OCML3BRawWEUeaxcuKHLpw"
app.secret_key = '2b3c4ee1b3eea60976f2d55163bbd0f88613657a9260e7de60d4b97c04273460'

users = {} #is this necessary

@app.before_request
def before_request_func():
    print("Test of before request")
    with engine.connect() as conn:
        SQL = text("SELECT * FROM apregoar.users")
        #print(SQL)            
        result = conn.execute(SQL)   
        print("SQL executed")
        
        
        for row in result:
            #print(row)
            #print("username:",row['username'])
            #print("affiliation:",row['organization'])
            users[row['username']] = {
                "id": row["u_id"],
                "username": row['username'],
                "affiliation": row['organization']
            }

        print(users)
        print("Checkpoint end connect")  
    
    #https://pythonise.com/series/learning-flask/python-before-after-request

@app.route("/")
def index():
    return render_template("user/index.html")

@app.route("/about")
def about():
    return render_template("user/about.html")

@app.route("/jinja")
def jinja():
    # Strings
    my_name="Callie"

    # Integers
    my_age = 32

    # Lists
    langs = ["Python", "JavaScript", "Bash", "Ruby", "C", "Rust"]

    # Dictionaries
    friends = {
        "Bernardo": 37,
        "Aly": 33,
        "Ângela": 32,
        "Bruna": 38,
        "Alina": 29
    }

    # Tuples
    colors = ("Red", "Blue")

    # Booleans
    cool = True
    
    # Classes
    class GitRemote:
        def __init__(self, name, description, domain):
            self.name = name
            self.description = description 
            self.domain = domain

        def pull(self):
            return f"Pulling repo '{self.name}'"

        def clone(self, repo):
            return f"Cloning into {repo}"

    my_remote = GitRemote(
        name="Learning Flask",
        description="Learn the Flask web framework for Python",
        domain="https://github.com/Julian-Nash/learning-flask.git"
    )

    # Funtions
    def repeat(x, qty=1):
        return x * qty

    date = datetime.utcnow()

    my_html = "<h1>This is some html</h1>"

    suspicious = "<script>alert('NEVER TRUST USER INPUT!')</script>"

    return render_template(
        "user/jinja.html", 
        my_name=my_name,
        my_age=my_age,
        langs=langs,
        friends=friends,
        colors=colors,
        cool=cool,
        GitRemote=GitRemote,
        my_remote=my_remote,
        repeat=repeat,
        date=date,
        my_html=my_html,
        suspicious = suspicious
    )

@app.template_filter("clean_date")
def clean_date(dt):
    return dt.strftime("%d %b %Y")

#########################
###### User login
#########################

@app.route("/sign-up", methods=["GET","POST"]) #Good to go!
def sign_up():
    if request.method == "POST":
        req = request.form
        missing = list()

        for k, v in req.items():
            if v =="":
                missing.append(k)
        
        if missing:
            feedback = f"Missing fields for {', '.join(missing)}"
            return render_template("user/sign_up.html", feedback=feedback)

        username = request.form.get("username")
        password = request.form.get("password")
        email = request.form.get("email")
        organization = request.form.get("affiliation")
        
        with engine.connect() as conn:
            print(username)
            SQL = text("SELECT username FROM apregoar.users WHERE username = :x")
            SQL = SQL.bindparams(x=username)
            result = conn.execute(SQL)
            count = 0
            for row in result:
                print("username:",row['username'])
                count += 1

            print(count)
        
        if count == 0:
            con = psycopg2.connect("dbname=postgres user=postgres password=thesis2021")
            cur = con.cursor()
            cur.execute("""
                INSERT INTO apregoar.users (username, password, organization, email)
                VALUES (%(username)s,%(password)s,%(organization)s,%(email)s)
                """,
                {'username':username,'password':password, 'organization':organization, 'email':email}
            )
            con.commit()
            print("User added to database")
            return redirect(url_for("sign_in"))
            #return render_template("user/sign_in.html")
        else:
            feedback=f"This username is already in use. Please select a new username."
            return render_template("user/sign_up.html", feedback=feedback)
    return render_template("user/sign_up.html")


@app.route("/sign-in", methods=["GET", "POST"])
def sign_in():
    if request.method == "POST":
        req = request.form
        username = req.get("username")
        password = req.get("password")
        print("Entered username: ", username)
        print("Entered password: ", password)

        with engine.connect() as conn:
            SQL = text("SELECT * FROM apregoar.users WHERE username = :x and password = :y")
            SQL = SQL.bindparams(x=username, y=password)
            print(SQL)
            result = conn.execute(SQL)   
            print("SQL executed")
            userval = {}
                
            for row in result:
                print(row)
                print("username:",row['username'])
                print("affiliation:",row['organization'])
                userval = {
                    username: {
                        "username": row['username'],
                        "affiliation": row['organization']
                    }
                }
                print("users dict: ",userval)
            print("Checkpoint end connect")  


        #while result is not None: #Not using because result is always "not None", even if empty
        if username in userval:
            print("Checkpoint results")
            #print(result[0])
            g.username = username
            fsession['username'] = username #!!!!
            #session.modified = True
            print(fsession)
            print("Session user assigned")
            return redirect(url_for("my_profile"))

        else:
            print("Combo not found")
            feedback = f"Username/password combination not found. Please try again."
            return render_template("user/sign_in.html", feedback=feedback)

    return render_template("user/sign_in.html")

@app.route("/my_profile")
def my_profile():

    if not fsession.get("username") is None:
        username = fsession.get("username")
        user = users[username]
        return render_template("user/my_profile.html", user=user)
    else:
        print("No username found in fsession")
        return redirect(url_for("sign_in"))

@app.route("/sign-out")
def sign_out():
    fsession.pop("username", None)
    return redirect(url_for("sign_in"))

@app.route("/profile/<username>")
def profile(username):
    user = None
    if username in users:
        user = users[username]
    return render_template("user/profile.html", username=username, user=user)

#########################
###### 
#########################

