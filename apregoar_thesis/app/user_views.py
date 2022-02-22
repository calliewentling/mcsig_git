from app import app
from datetime import datetime
from flask import request, redirect, jsonify, make_response, render_template, redirect, url_for, g
from flask import session as fsession #To distinguish between flash session and sqalchemy session
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
import psycopg2

from app import engine, session, text

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
