#https://readthedocs.org/projects/geoalchemy-2/downloads/pdf/latest/

from sqlalchemy import create_engine
engine = create_engine('postgresql://postgres:thesis2021@localhost/postgres', echo=True)

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String
from geoalchemy2 import Geometry

Base = declarative_base()

class Lake(Base):
    __tablename__ = 'lake'
    __table_args__ = {'schema':'flask'}
    id = Column(Integer, primary_key=True)
    name = Column(String)
    geom = Column(Geometry('POLYGON'))

Lake.__table__

##Uncomment to create the table in postgres
#Lake.__table__.create(engine)

lake = Lake(name='Majeur', geom='POLYGON((0 0,1 0,1 1,0 1,0 0))')

print(lake.geom)
print(str(lake.id))

from sqlalchemy.orm import sessionmaker
Session = sessionmaker(bind=engine)
session = Session()

##Uncomment to create new record 'lake'
#session.add(lake)
#session.commit()

our_lake = session.query(Lake).filter_by(name='Majeur').first()
print(our_lake.name)
print(our_lake.geom)
print(our_lake.id)

""" ## Uncomment to create new records for lake
session.add_all([
    Lake(name='Garde', geom='POLYGON((1 0,3 0,3 2,1 2,1 0))'),
    Lake(name='Orta', geom='POLYGON((3 0,6 0,6 3,3 3,3 0))')
])
session.commit() """

query = session.query(Lake).order_by(Lake.name)
for lake in query:
    print(lake.name)

lakes = session.query(Lake).order_by(Lake.name).all()
print(lakes)

from sqlalchemy import func
query = session.query(Lake).filter(func.ST_Contains(Lake.geom, 'POINT(4 1)'))
for lake in query:
    print(lake.name)

query = session.query(Lake).filter(Lake.geom.ST_Contains('POINT(4 1)'))
for lake in query:
    print(lake.name)

query = session.query(Lake).filter(
    Lake.geom.ST_Intersects('LINESTRING(2 1,4 1)')
)
for lake in query:
    print(lake.name)

lake = session.query(Lake).filter_by(name='Garde').one()
print(session.scalar(lake.geom.ST_Intersects('LINESTRING(2 1,4 1)')))

query = session.query
query = session.query(Lake).filter(
    Lake.geom.intersects('LINESTRING(2 1,4 1)')
)
for lake in query:
    print(lake.name)

class Treasure(Base):
    __tablename__= 'treasure'
    id = Column(Integer, primary_key=True)
    geom = Column(Geometry('POINT'))

""" from sqlalchemy.orm import relationship, backref
class Lake(Base):
    __tablename__ = 'lake'
    id = Column(Integer, primary_key=True)
    name = Column(String)
    geom = Column(Geometry('POLYGON'))
    treasures = relationship(
        'Treasure',
        primaryjoin = 'func.ST_Contains(foreign(Lake.geom), Treasure.geom).as_comparison(1, 2)',
        backref=backref('lake', uselist=False),
        viewonly=True,
        uselist=True,
    ) """

from sqlalchemy import func

query = session.query(Lake.name, func.ST_Area(func.ST_Buffer(Lake.geom, 2)) .label('bufferarea'))
for row in query:
    print('%s: %f' % (row.name, row.bufferarea))

query = session.query(Lake.name, Lake.geom.ST_Buffer(2).ST_Area().label('bufferarea'))
for row in query:
    print('%s: %f' % (row.name, row.bufferarea))

lake = session.query(Lake).filter(
    Lake.geom.ST_Buffer(2).ST_Area() > 33).one()
print(lake.name)