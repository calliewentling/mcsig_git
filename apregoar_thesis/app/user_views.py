from app import app
from datetime import datetime
from flask import request, redirect, jsonify, make_response, render_template, session, redirect, url_for
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
import psycopg2

from app import engine, session, text
# import secrets
# secrets.token_urlsafe(16)

app.config["SECRET_KEY"] = "OCML3BRawWEUeaxcuKHLpw"

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


@app.route("/profile/<username>")
def profile(username):
    user = None
    if username in users:
        user = users[username]
    return render_template("user/profile.html", username=username, user=user)


# Mock database for signin
# This should be replaced ultimately by actual database of users
users = {
    "cwentling": {
        "username": "cwentling",
        "firstname": "Callie",
        "lastname": " Wentling",
        "email": "calliewentling@gmail.com",
        "password": "thesis2021",
        "bio": "Some rando on the itnernet",
        "role": "user",
        "affiliation": ""
    },
    "ccarvalho": {
        "username": "ccarvalho",
        "firstname": "Catarina",
        "lastname": "Carvalho",
        "email": "catarina.carvalho@amensagem.pt",
        "password": "thesis2021",
        "bio": "President, publisher and writer of A Mensagem",
        "role": "publisher",
        "affiliation": "A Mensagem"
    },
    "admin": {
        "username": "admin",
        "firstname": "",
        "lastname": "",
        "email": "cwentling@novaims.unl.pt",
        "password": "thesis2021",
        "bio": "Progress is being made",
        "role": "admin",
        "affiliation": "apregoar"
    }
}


@app.route("/sign-in", methods=["GET", "POST"])
def sign_in():
    if request.method == "POST":
        try: 
            print("Checkpoint A")
            req = request.form
            username = req.get("username")
            password = req.get("password")
            print("Entered username: ", username)
            print("Entered password: ", password)

            #conn = psycopg2.connect("dbname=postgres user=postgres password=thesis2021")
            #cur = conn.cursor()

            #print("Checkpoint B")

            
            #THIS ISNT WORKING COPY 
            #SQL = text("SELECT * FROM apregoar.users WHERE username = (%s) and password = (%s)")
            #SQL = text("SELECT * FROM apregoar.users WHERE username = :x and password = :y")
            #print("Checkpoint D1")
            #SQL = SQL.bindparams(x=username, y=password)
            #print("Checkpoint D2")
            #print(SQL)
            #print("Checkpoint D3")
            #result = cur.execute(SQL)
            #cur.execute(SQL)
            #print("Checkpoint E")
            #result = cur.fetchone()
            #print("DB result: ",result)

            with engine.connect() as conn:
                SQL = text("SELECT * FROM apregoar.users WHERE username = :x and password = :y")
                SQL = SQL.bindparams(x=username, y=password)
                print(SQL)
                result = conn.execute(SQL)
                print("SQL Executed!")
                uexists = 0
                for row in result:
                    print("username:",row['username'])
                    print("affiliation:",row['organization'])
                    print(row)
                    uexists = 1
                print("Checkpoint end connect")
                print("Does a user exist? ",uexists)    

        except:
            print("Checkpoint C")
            feedback = f"Something went wrong. Please try again."
            return render_template("user/sign_in.html", feedback=feedback)

        #while result is not None: #Not using because result is always "not None", even if empty
        while uexists == 1: #moved here to avoid exceptions
            print("Checkpoint results")
            #print(result[0])
            session['USERNAME'] = username #TypeError: 'Session' object does not support item assignment.  Try https://stackoverflow.com/questions/61804039/typeerror-session-object-does-not-support-item-assignment
            print(session)
            print("Checkpoint results2")
            return redirect(url_for("my_profile"))

        else:
            print("Checkpoint not found")
            feedback = f"Username/password combination not found. Please try again."
            return render_template("user/sign_in.html", feedback=feedback)

    return render_template("user/sign_in.html")

@app.route("/my_profile")
def my_profile():

    if not session.get("USERNAME") is None:
        username = session.get("USERNAME")
        user = users[username]
        return render_template("user/my_profile.html", user=user)
    else:
        print("No username found in session")
        return redirect(url_for("sign_in"))

@app.route("/sign-out")
def sign_out():
    session.pop("USERNAME", None)
    return redirect(url_for("sign_in"))

