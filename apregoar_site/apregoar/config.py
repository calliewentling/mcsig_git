# BCRYPT_LOG_ROUNDS = 12 # Configuration for the Flask-Bcrypt extension
# MAIL_FROM_EMAIL = "cwentling@novaims.unl.pt" # For use in application emails


# SECRET_KEY = 'Sm9obiBTY2hyb20ga2lja3MgYXNz'
# STRIPE_API_KEY = 'SmFjb2IgS2FwbGFuLU1vc3MgaXMgYSBoZXJv'


# DEBUG = True

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine('postgresql://postgres:thesis2021@localhost/postgres', echo=True)
Session = sessionmaker(bind=engine)
session = Session()
