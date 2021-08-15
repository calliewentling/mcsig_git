
##Initiatlizing database with postgres.
# Forcing table generation with db.session.people(...) since it returns errors of missing tables without
#https://towardsdatascience.com/sending-data-from-a-flask-app-to-postgresql-database-889304964bf2

from flask import Flask, render_template, request, flash
#from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

engine = create_engine('postgresql://postgres:thesis2021@localhost/postgres', echo=True)
Base = declarative_base()

app = Flask(__name__)
app.secret_key = 'secret string'

class People(Base):
    __tablename__= "people"
    __table_args__ = {"schema":"flask"}
    id = Column(Integer, primary_key=True)
    pname = Column(String, unique=True, nullable=False)
    color = Column(String, nullable=False)
    

    def __init__(self, pname, color):
        self.pname = pname
        self.color = color
    


@app.route('/')
def home():
    return '<a href="/addperson"><button> Click here to add Person </button></a>'


@app.route("/addperson")
def addperson():
    return render_template("index.html")


@app.route("/personadd", methods=['POST'])
def personadd():
    pname = request.form["pname"]
    color = request.form["color"]
    entry = People(pname, color)
    session.add(entry)
    session.commit()

    return render_template("index.html")



if __name__ == '__main__':
    #db.create_all()
    #db.session.add(People(pname="forced test name4", color="forced test color"))
    #db.session.commit()
    #People.__table__.create(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    app.run()