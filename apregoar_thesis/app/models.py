from app import db
from sqlalchemy import create_engine, ForeignKey, PrimaryKeyConstraint
from sqlalchemy.orm import relationship


class Stories(db.Model):
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
    u_id = db.Column(db.Integer)
    created = db.Column(db.DateTime)
    edited = db.Column(db.DateTime)
    __table_args__ = {
        "schema":"apregoar"
    }

class Tags(db.Model):
    __tablename__ = "tags"
    tag_id = db.Column(db.Integer, primary_key=True)
    tag_name = db.Column(db.Text)
    __table_args__ = {
        "schema":"apregoar"
    }
    
    s_ids = relationship("Tagging", back_populates="name")


class Tagging(db.Model):
    __tablename__ = "tagging"
    s_id = db.Column(db.Integer, ForeignKey("apregoar.stories.s_id"))
    t_id = db.Column(db.Integer, ForeignKey("apregoar.tags.tag_id"))
    __table_args__ = (
        PrimaryKeyConstraint(t_id, s_id),
        {"schema":"apregoar"},
    )
    name = relationship("Tags", back_populates="s_ids")

    
