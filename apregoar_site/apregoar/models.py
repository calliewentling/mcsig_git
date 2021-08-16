from flask import current_app, g
from flask.cli import with_appcontext
from sqlalchemy import Table, Column, Integer, String, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from geoalchemy2 import Geometry

Base = declarative_base()


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
    instances = relationship("Instances", cascade="all, delete")
    

    def __init__(self, title, summary, pub_date, web_link, section, tags, author, publication):
        self.title = title
        self.summary = summary
        self.pub_date = pub_date
        self.web_link = web_link
        self.section = section
        self.tags = tags
        self.author = author
        self.publication = publication

class UGazetteer(Base):
    __tablename__="ugazetteer"
    __table_args__={"schema":"apregoar"}
    p_id = Column(Integer, primary_key=True)
    p_name = Column(Text, nullable=False)
    geom = Column(Geometry('POLYGON'))
    instances = relationship("Instances")

    def __init__(self, p_name, geom):
        self.p_name = p_name
        self.geom = geom
    

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
    
    def __init__(self, t_begin, t_end, t_type, t_desc, p_desc, story_id, place_id):
        self.t_begin = t_begin
        self.t_end = t_end
        self.t_type = t_type
        self.t_desc = t_desc
        self.p_desc = p_desc
        self.story_id = story_id
        self.place_id = place_id
