from app import app
from flask import render_template

@app.route("/heyhey/welcome")
def welcome():
    return render_template("my_templates/test_page.html")