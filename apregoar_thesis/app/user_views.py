from app import app
from datetime import datetime
from flask import request, redirect, jsonify, make_response, render_template, session, redirect, url_for

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

@app.route("/sign-up", methods=["GET","POST"])
def sign_up():
    if request.method == "POST":
        req = request.form
        missing = list()

        for k, v in req.items():
            if v =="":
                missing.append(k)
        
        if missing:
            feedback = f"Missing fields for {', '.join(missing)}"
            return render_template("public/sign_up.html", feedback=feedback)

        username = request.form.get("username")
        email = request.form.get("email")
        password = request.form.get("password")
        
        return redirect(request.url)
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
        req = request.form

        username = req.get("username")
        password = req.get("password")

        if not username in users:
            print("Username not found")
            return redirect(request.url)

        else:
            user = users[username]

        if not password == user["password"]:
            print("Incorrect password")
            return redirect(request.url)
        
        else:
            session["USERNAME"] = user["username"]
            print("session username set")
            return redirect(url_for("my_profile"))

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

