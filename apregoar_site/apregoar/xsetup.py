from shapely import *
from sqlalchemy import *
from geoalchemy2 import *

with engine.connect() as conn:
    SQL = text("SELECT * FROM gazetteer.freguesia_3763")
    result = conn.execute(SQL)
    print("Freguesias loaded")
    for row in result:
        distrito = row['distrito']
        if distrito == 'LISBOA':
            o_id = row['gid']
            source = "freguesia_3763"
            typen = "Freguesia"
            name = row['freguesia']
            geom = func.ST_Transform(row['geom'], 3857) #Transform data from SRID3764 to 3857
            entry=EGazetteer(o_id,source,typen,name,geom)
            session.add(entry)
            #session.commit()

######### SQL TO GROUP freguesias into AML
INSERT INTO apregoar.egazetteer (source,type,name,geom) 
VALUES (
	'freguesia_3763', 'Área Administrativa', 'Área Metropolitana Lisboa', (
		SELECT ST_Transform (
			ST_UNION(
				ARRAY(
					SELECT geom from gazetteer.freguesia_3763 
					WHERE concelho 
					IN ('ALCOCHETE','ALMADA','AMADORA','BARREIRO','CASCAIS','LISBOA','LOURES','MAFRA','MOITA','MONTIJO','ODIVELAS','OEIRAS','PALMELA','SEIXAL','SESIMBRA','SETÚBAL','SINTRA','VILA FRANCA DE XIRA')
				)
			),
			3857
		)
	)
);
############## PYTHON add Non district AML to egazetteer
from shapely import *
from sqlalchemy import *
from geoalchemy2 import *

AMLnotdist = ('ALCOCHETE','ALMADA','BARREIRO','MOITA','MONTIJO','PALMELA','SEIXAL','SESIMBRA','SETÚBAL')

def commitFreg(row):
    o_id = row['gid']
    source = "freguesia_3763"
    typen = "Freguesia"
    name = row['freguesia']
    geom = func.ST_Transform(row['geom'], 3857) #Transform data from SRID3764 to 3857
    entry=EGazetteer(o_id,source,typen,name,geom)
    
    print(name,entry)
    print()
    session.add(entry)
    #session.commit()
    return


with engine.connect() as conn:
    SQL = text("SELECT * FROM gazetteer.freguesia_3763")
    result = conn.execute(SQL)
    print("Freguesias loaded")
    countT=0
    countL=0
    for row in result:
        concelho = row['concelho']
        countT = countT+1
        #if distrito == 'LISBOA':
        if concelho == 'ALCOCHETE':
            commitFreg(row)
            countL = countL+1
        elif concelho == 'ALMADA':
            commitFreg(row)
            countL = countL+1
        elif concelho == 'BARREIRO':
            commitFreg(row)
            countL = countL+1
        elif concelho == 'MOITA':
            commitFreg(row)
            countL = countL+1
        elif concelho == 'MONTIJO':
            commitFreg(row)
            countL = countL+1
        elif concelho == 'PALMELA':
            commitFreg(row)
            countL = countL+1
        elif concelho == 'SEIXAL':
            commitFreg(row)
            countL = countL+1
        elif concelho == 'SESIMBRA':
            commitFreg(row)
            countL = countL+1
        elif concelho == 'SETÚBAL':
            commitFreg(row)
            countL = countL+1
            
print("Total freguesias loaded: ",countT)
print("Lisboa freguesias: ", countL)

###################################

