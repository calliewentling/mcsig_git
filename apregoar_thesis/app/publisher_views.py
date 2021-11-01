from app import app
from flask import render_template

@app.route("/publisher/dashboard")
def publisher_dashboard():
    return render_template("publisher/dashboard.html")

@app.route("/publisher/profile")
def publisher_profile():
    return render_template("publisher/profile.html")