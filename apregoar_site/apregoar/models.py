from flask import current_app, g
from flask.cli import with_appcontext
from sqlalchemy import Table, Column, Integer, String, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from geoalchemy2 import Geometry

Base = declarative_base()

class Users(Base):
    __tablename__= "users"
    __table_args__ = {"schema":"apregoar"}
    u_id = Column(Integer, primary_key=True)
    username = Column(Text, unique=True, nullable=False)
    password = Column(Text, nullable=False)
    organization = Column(Text, nullable=True)
    stories = relationship("Stories")
    places = relationship("UGazetteer")

    def __init__(self, username, password, organization):
        self.username = username
        self.password = password
        self.organization = organization



class Stories(Base):
    __tablename__= "stories"
    __table_args__ = {"schema":"apregoar"}
    s_id = Column(Integer, primary_key=True)
    title = Column(Text, unique=True, nullable=False)
    summary = Column(Text, nullable=True)
    pub_date = Column(Date, nullable=False)
    web_link = Column(Text, nullable=False)
    section = Column(Text, nullable=True)
    tags = Column(Text, nullable=True)
    author = Column(Text, nullable=True)
    publication = Column(Text, nullable=False)
    u_id = Column(Integer, ForeignKey('apregoar.users.u_id'))
    instances = relationship("Instances", cascade="all, delete")
    

    def __init__(self, title, summary, pub_date, web_link, section, tags, author, publication, u_id):
        self.title = title
        self.summary = summary
        self.pub_date = pub_date
        self.web_link = web_link
        self.section = section
        self.tags = tags
        self.author = author
        self.publication = publication
        self.u_id = u_id

class UGazetteer(Base):
    __tablename__="ugazetteer"
    __table_args__={"schema":"apregoar"}
    p_id = Column(Integer, primary_key=True)
    p_name = Column(Text, nullable=False)
    geom = Column(Geometry('POLYGON'))
    u_id = Column(Integer, ForeignKey('apregoar.users.u_id'))
    instances = relationship("Instances")

    def __init__(self, p_name, geom, u_id):
        self.p_name = p_name
        self.geom = geom
        self.u_id = u_id
    

class Instances(Base):
    __tablename__="instances"
    __table_args__={"schema":"apregoar"}
    i_id = Column(Integer, primary_key=True)
    t_begin = Column(Date, nullable=False)
    t_end = Column(Date, nullable=False)
    t_type = Column(Text, nullable=True)
    t_desc = Column(Text, nullable=True)
    p_desc = Column(Text, nullable=True)
    s_id = Column(Integer, ForeignKey('apregoar.stories.s_id')) #define as foreign key
    p_id = Column(Integer, ForeignKey('apregoar.ugazetteer.p_id')) #define as foriegn key
    u_id = Column(Integer, ForeignKey('apregoar.users.u_id'))
    
    def __init__(self, t_begin, t_end, t_type, t_desc, p_desc, s_id, p_id, u_id):
        self.t_begin = t_begin
        self.t_end = t_end
        self.t_type = t_type
        self.t_desc = t_desc
        self.p_desc = p_desc
        self.s_id = s_id
        self.p_id = p_id
        self.u_id = u_id
