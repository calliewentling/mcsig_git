from flask import current_app, g
from flask.cli import with_appcontext
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

engine = create_engine('postgresql://postgres:thesis2021@localhost/postgres', echo=True)
Base = declarative_base()

Session = sessionmaker(bind=engine)
session = Session()



class People(Base):
    __tablename__= "people"
    __table_args__ = {"schema":"flask"}
    id = Column(Integer, primary_key=True)
    pname = Column(String, unique=True, nullable=False)
    color = Column(String, nullable=False)
    

    def __init__(self, pname, color):
        self.pname = pname
        self.color = color