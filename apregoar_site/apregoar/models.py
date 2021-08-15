from flask import current_app, g
from flask.cli import with_appcontext
from sqlalchemy import create_engine, Column, Integer, String, Date, Text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

engine = create_engine('postgresql://postgres:thesis2021@localhost/postgres', echo=True)
Base = declarative_base()

Session = sessionmaker(bind=engine)
session = Session()



class Stories(Base):
    __tablename__= "stories"
    __table_args__ = {"schema":"apregoar"}
    id = Column(Integer, primary_key=True)
    title = Column(Text, unique=True, nullable=False)
    summary = Column(Text, nullable=True)
    pub_date = Column(Date, nullable=True)
    web_link = Column(Text, nullable=False)
    section = Column(Text, nullable=True)
    tags = Column(Text, nullable=True)
    author = Column(Text, nullable=True)
    publication = Column(Text, nullable=False)
    

    def __init__(self, title, summary, pub_date, web_link, section, tags, author, publication):
        self.title = title
        self.summary = summary
        self.pub_date = pub_date
        self.web_link = web_link
        self.section = section
        self.tags = tags
        self.author = author
        self.publication = publication