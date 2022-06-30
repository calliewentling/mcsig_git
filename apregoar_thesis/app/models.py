from app import db
from sqlalchemy import create_engine, ForeignKey, PrimaryKeyConstraint, Column, Integer, String, Text, DateTime, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry

Base = declarative_base()

"""class Users(db.Model):
    __tablename__ = "users"

    u_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.Text)
    #password = db.Column(db.Text)
    organization = db.Column(db.Text)
    #email = db.Column(db.Text)
    #created = db.Column(db.Text)
    #edited = db.Column(db.Text)

    __table_args__ = {
        "schema":"apregoar"
    }"""
class Users(Base):
    __tablename__ = "users"

    u_id = Column(Integer, primary_key=True)
    username = Column(Text)
    #password = db.Column(db.Text)
    organization = Column(Text)
    #email = db.Column(db.Text)
    #created = db.Column(db.Text)
    #edited = db.Column(db.Text)

    __table_args__ = {
        "schema":"apregoar"
    }

"""class Stories(db.Model):
    __tablename__ = "stories"

    s_id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.Text)
    summary = db.Column(db.Text)
    pub_date = db.Column(db.Date)
    web_link = db.Column(db.Text)
    section = db.Column(db.Text)
    tags = db.Column(db.Text)
    author = db.Column(db.Text)
    publication =db.Column(db.Text)
    u_id = db.Column(db.Integer, ForeignKey("apregoar.users.u_id"))
    created = db.Column(db.DateTime)
    edited = db.Column(db.DateTime)

    __table_args__ = {
        "schema":"apregoar"
    }

    instancing = relationship("Instances", back_populates="stories")

    def __repr__(self):
        return "<Story(s_id='%s', title='%s')>" % (self.s_id, self.title)"""
class Stories(Base):
    __tablename__ = "stories"

    s_id = Column(Integer, primary_key=True)
    title = Column(Text)
    summary = Column(Text)
    pub_date = Column(Date)
    web_link = Column(Text)
    section = Column(Text)
    tags = Column(Text)
    author = Column(Text)
    publication = Column(Text)
    u_id = Column(Integer, ForeignKey("apregoar.users.u_id"))
    created = Column(DateTime)
    edited = Column(DateTime)

    __table_args__ = {
        "schema":"apregoar"
    }

    instancing = relationship("Instances", back_populates="stories")

    def __repr__(self):
        return "<Story(s_id='%s', title='%s')>" % (self.s_id, self.title)

"""class Tags(db.Model):
    __tablename__ = "tags"

    tag_id = db.Column(db.Integer, primary_key=True)
    tag_name = db.Column(db.Text)

    __table_args__ = {
        "schema":"apregoar"
    }
    
    s_ids = relationship("Tagging", back_populates="name")"""
class Tags(Base):
    __tablename__ = "tags"

    tag_id = Column(Integer, primary_key=True)
    tag_name = Column(Text)

    __table_args__ = {
        "schema":"apregoar"
    }
    
    s_ids = relationship("Tagging", back_populates="name")


"""class Tagging(db.Model):
    __tablename__ = "tagging"

    story_id = db.Column(db.Integer, ForeignKey("apregoar.stories.s_id"))
    t_id = db.Column(db.Integer, ForeignKey("apregoar.tags.tag_id"))

    __table_args__ = (
        PrimaryKeyConstraint(t_id, story_id),
        {"schema":"apregoar"},
    )
    name = relationship("Tags", back_populates="s_ids")"""
class Tagging(Base):
    __tablename__ = "tagging"

    story_id = Column(Integer, ForeignKey("apregoar.stories.s_id"))
    t_id = Column(Integer, ForeignKey("apregoar.tags.tag_id"))

    __table_args__ = (
        PrimaryKeyConstraint(t_id, story_id),
        {"schema":"apregoar"},
    )
    name = relationship("Tags", back_populates="s_ids")

"""class Authors(db.Model):
    __tablename__ = "authors"

    author_id = db.Column(db.Integer, primary_key=True)
    author_name = db.Column(db.Text)

    __table_args__ = {
        "schema":"apregoar"
    }
    
    s_ids = relationship("Authoring", back_populates="name")"""
class Authors(Base):
    __tablename__ = "authors"

    author_id = Column(Integer, primary_key=True)
    author_name = Column(Text)

    __table_args__ = {
        "schema":"apregoar"
    }
    
    s_ids = relationship("Authoring", back_populates="name")


"""class Authoring(db.Model):
    __tablename__ = "authoring"

    story_id = db.Column(db.Integer, ForeignKey("apregoar.stories.s_id"))
    a_id = db.Column(db.Integer, ForeignKey("apregoar.authors.author_id"))

    __table_args__ = (
        PrimaryKeyConstraint(a_id, story_id),
        {"schema":"apregoar"},
    )
    name = relationship("Authors", back_populates="s_ids")"""
class Authoring(Base):
    __tablename__ = "authoring"

    story_id = Column(Integer, ForeignKey("apregoar.stories.s_id"))
    a_id = Column(Integer, ForeignKey("apregoar.authors.author_id"))

    __table_args__ = (
        PrimaryKeyConstraint(a_id, story_id),
        {"schema":"apregoar"},
    )
    name = relationship("Authors", back_populates="s_ids")

"""class Sections(db.Model):
    __tablename__ = "sections"

    section_id = db.Column(db.Integer, primary_key=True)
    section_name = db.Column(db.Text)

    __table_args__ = {
        "schema":"apregoar"
    }
    
    s_ids = relationship("Sectioning", back_populates="name")"""
class Sections(Base):
    __tablename__ = "sections"

    section_id = Column(Integer, primary_key=True)
    section_name = Column(Text)

    __table_args__ = {
        "schema":"apregoar"
    }
    
    s_ids = relationship("Sectioning", back_populates="name")


"""class Sectioning(db.Model):
    __tablename__ = "sectioning"

    story_id = db.Column(db.Integer, ForeignKey("apregoar.stories.s_id"))
    s_id = db.Column(db.Integer, ForeignKey("apregoar.sections.section_id"))

    __table_args__ = (
        PrimaryKeyConstraint(s_id, story_id),
        {"schema":"apregoar"},
    )
    name = relationship("Sections", back_populates="s_ids")"""
class Sectioning(Base):
    __tablename__ = "sectioning"

    story_id = Column(Integer, ForeignKey("apregoar.stories.s_id"))
    s_id = Column(Integer, ForeignKey("apregoar.sections.section_id"))

    __table_args__ = (
        PrimaryKeyConstraint(s_id, story_id),
        {"schema":"apregoar"},
    )
    name = relationship("Sections", back_populates="s_ids")

"""class Publications(db.Model):
    __tablename__ = "publications"

    publication_id = db.Column(db.Integer, primary_key=True)
    publication_name = db.Column(db.Text)

    __table_args__ = {
        "schema":"apregoar"
    }
    
    s_ids = relationship("Publicationing", back_populates="name")"""
class Publications(Base):
    __tablename__ = "publications"

    publication_id = Column(Integer, primary_key=True)
    publication_name = Column(Text)

    __table_args__ = {
        "schema":"apregoar"
    }
    
    s_ids = relationship("Publicationing", back_populates="name")


"""class Publicationing(db.Model):
    __tablename__ = "publicationing"

    story_id = db.Column(db.Integer, ForeignKey("apregoar.stories.s_id"))
    p_id = db.Column(db.Integer, ForeignKey("apregoar.publications.publication_id"))

    __table_args__ = (
        PrimaryKeyConstraint(p_id, story_id),
        {"schema":"apregoar"},
    )
    name = relationship("Publications", back_populates="s_ids")"""

class Publicationing(Base):
    __tablename__ = "publicationing"

    story_id = Column(Integer, ForeignKey("apregoar.stories.s_id"))
    p_id = Column(Integer, ForeignKey("apregoar.publications.publication_id"))

    __table_args__ = (
        PrimaryKeyConstraint(p_id, story_id),
        {"schema":"apregoar"},
    )
    name = relationship("Publications", back_populates="s_ids")

"""class Instances(db.Model):
    __tablename__ = "instances"

    i_id = db.Column(db.Integer, primary_key=True)
    t_begin = db.Column(db.DateTime)
    t_end = db.Column(db.DateTime)
    t_type = db.Column(db.Text)
    t_desc = db.Column(db.Text)
    p_desc = db.Column(db.Text)
    s_id = db.Column(db.Integer, ForeignKey("apregoar.stories.s_id"))
    u_id = db.Column(db.Integer, ForeignKey("apregoar.users.u_id"))
    p_name = db.Column(db.Text)
    #created = db.Column(db.DateTime)
    #edited = db.Column(db.DateTime)

    __table_args__ = {
        "schema":"apregoar"
    }

    stories = relationship("Stories", back_populates="instancing")

    def __repr__(self):
        return f"Instances(i_id={self.i_id!r}, s_id={self.s_id!r})"
"""
class Instances(Base):
    __tablename__ = "instances"

    i_id = Column(Integer, primary_key=True)
    t_begin = Column(DateTime)
    t_end = Column(DateTime)
    t_type = Column(Text)
    t_desc = Column(Text)
    p_desc = Column(Text)
    s_id = Column(Integer, ForeignKey("apregoar.stories.s_id"))
    u_id = Column(Integer, ForeignKey("apregoar.users.u_id"))
    p_name = Column(Text)
    #created = db.Column(db.DateTime)
    #edited = db.Column(db.DateTime)

    __table_args__ = {
        "schema":"apregoar"
    }

    stories = relationship("Stories", back_populates="instancing")

    def __repr__(self):
        return f"Instances(i_id={self.i_id!r}, s_id={self.s_id!r})"
    
class Ugazetteer(Base):
    __tablename__ = "ugazetteer"

    p_id = Column(Integer, primary_key=True)
    p_name = Column(Text)
    geom = Column(Geometry(geometry_type='MULTIPOLYGON', srid=4326))
    u_id = Column(Integer, ForeignKey("apregoar.users.u_id"))
    p_desc = Column(Text)
    created = Column(DateTime)
    edited = Column(DateTime)

    __table_args__ = {
        "schema":"apregoar"
    }

"""class Ugazetteer(db.Model):
    __tablename__ = "ugazetteer"

    p_id = db.Column(db.Integer, primary_key=True)
    p_name = db.Column(db.Text)
    geom = db.Column(db.Geometry('MULTIPOLYGON'))
    u_id = db.Column(db.Integer, ForeignKey("apregoar.users.u_id"))
    p_desc = db.Column(db.Text)
    #created = db.Column(db.DateTime)
    #edited = db.Column(db.DateTime)

    __table_args__ = {
        "schema":"apregoar"
    }"""
class Egazetteer(Base):
    __tablename__ = "egazetteer"

    e_id = Column(Integer, primary_key=True)
    o_id = Column(Integer)
    source = Column(Text)
    type = Column(Text)
    name = Column(Text)
    geom = Column(Geometry(geometry_type='MULTIPOLYGON', srid=4326)) #Not certain about type (untested)
    date_created = Column(DateTime)

    __table_args__ = {
        "schema":"apregoar"
    }

"""class Egazetteer(db.Model):
    __tablename__ = "egazetteer"

    e_id = db.Column(db.Integer, primary_key=True)
    o_id = db.Column(db.Integer)
    source = db.Column(db.Text)
    type = db.Column(db.Text)
    name = db.Column(db.Text)
    geom = db.Column(db.Geometry('MULTIPOLYGON')) #Not certain about type (untested)
    date_created = db.Column(db.DateTime)

    __table_args__ = {
        "schema":"apregoar"
    }"""

"""class Spatial_assoc(db.Model):
    __tablename__ = "spatial_assoc"

    p_id = db.Column(db.Integer, ForeignKey("apregoar.ugazetteer.p_id"))
    relation = db.Column(db.Text)
    e_id = db.Column(db.Integer, ForeignKey("apregoar.egazetteer.e_id"))

    __table_args__ = (
        PrimaryKeyConstraint(p_id, e_id),
        {
            "schema":"apregoar"
        }
    )"""
class Spatial_assoc(Base):
    __tablename__ = "spatial_assoc"

    p_id = Column(Integer, ForeignKey("apregoar.ugazetteer.p_id"))
    relation = Column(Text)
    e_id = Column(Integer, ForeignKey("apregoar.egazetteer.e_id"))

    __table_args__ = (
        PrimaryKeyConstraint(p_id, e_id),
        {
            "schema":"apregoar"
        }
    )

"""class Instance_egaz(db.Model):
    __tablename__ = "instance_egaz"

    i_id = db.Column(db.Integer, ForeignKey("apregoar.instances.i_id"))
    explicit = db.Column(db.Text)
    last_edited = db.Column(db.DateTime)
    e_id = db.Column(db.Integer, ForeignKey("apregoar.egazetteer.e_id"))

    __table_args__ = (
        PrimaryKeyConstraint(i_id, e_id),
        {
            "schema":"apregoar"
        }
    )"""
class Instance_egaz(Base):
    __tablename__ = "instance_egaz"

    i_id = Column(Integer, ForeignKey("apregoar.instances.i_id"))
    explicit = Column(Text)
    last_edited = Column(DateTime)
    e_id = Column(Integer, ForeignKey("apregoar.egazetteer.e_id"))

    __table_args__ = (
        PrimaryKeyConstraint(i_id, e_id),
        {
            "schema":"apregoar"
        }
    )

"""class Instance_ugaz(db.Model):
    __tablename__ = "instance_ugaz"

    i_id = db.Column(db.Integer, ForeignKey("apregoar.instances.i_id"))
    p_id = db.Column(db.Integer, ForeignKey("apregoar.egazetteer.p_id"))
    original = db.Column(db.Text)    

    __table_args__ = (
        PrimaryKeyConstraint(i_id, p_id),
        {
            "schema":"apregoar"
        }
    )"""
class Instance_ugaz(Base):
    __tablename__ = "instance_ugaz"

    i_id = Column(Integer, ForeignKey("apregoar.instances.i_id"))
    p_id = Column(Integer, ForeignKey("apregoar.egazetteer.p_id"))
    original = Column(Text)    

    __table_args__ = (
        PrimaryKeyConstraint(i_id, p_id),
        {
            "schema":"apregoar"
        }
    )