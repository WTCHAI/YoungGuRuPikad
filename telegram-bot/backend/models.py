from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, BigInteger, ForeignKey, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

Base = declarative_base()

# Many-to-many association table for subscribers and events
subscriber_events = Table(
    'subscriber_events',
    Base.metadata,
    Column('subscriber_id', Integer, ForeignKey('subscribers.id'), primary_key=True),
    Column('event_id', Integer, ForeignKey('blockchain_events.id'), primary_key=True),
    Column('notified_at', DateTime, default=datetime.utcnow)
)

class DeviceData(Base):
    __tablename__ = "device_data"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, index=True)
    value = Column(Float)
    location = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

class BlockchainEvent(Base):
    __tablename__ = "blockchain_events"
    
    id = Column(Integer, primary_key=True, index=True)
    prover = Column(String, index=True, nullable=False)  # Ethereum address
    result = Column(Boolean, nullable=False)
    timestamp = Column(BigInteger, nullable=False)  # Unix timestamp from blockchain
    block_number = Column(BigInteger, nullable=False, index=True)
    transaction_hash = Column(String, unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Many-to-many relationship with subscribers
    notified_subscribers = relationship(
        "Subscriber",
        secondary=subscriber_events,
        back_populates="received_events"
    )

class Subscriber(Base):
    __tablename__ = "subscribers"
    
    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(BigInteger, unique=True, nullable=False, index=True)
    user_id = Column(BigInteger, nullable=False, index=True)
    username = Column(String, nullable=True)
    subscribed_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Notification preferences
    notify_successful_proofs = Column(Boolean, default=True)
    notify_failed_proofs = Column(Boolean, default=False)
    prover_filter = Column(String, nullable=True)  # Optional prover address filter
    
    # Many-to-many relationship with events
    received_events = relationship(
        "BlockchainEvent",
        secondary=subscriber_events,
        back_populates="notified_subscribers"
    )

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create all tables
Base.metadata.create_all(bind=engine)
