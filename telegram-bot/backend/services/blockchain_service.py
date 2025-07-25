from sqlalchemy.orm import Session
from typing import List, Optional
from ..models import BlockchainEvent
from ..schemas import BlockchainEventCreate

class BlockchainService:
    @staticmethod
    def create_blockchain_event(db: Session, event: BlockchainEventCreate) -> BlockchainEvent:
        """Create new blockchain event (or return existing if duplicate)"""
        # Check if event already exists (prevent duplicates)
        existing_event = db.query(BlockchainEvent).filter(
            BlockchainEvent.transaction_hash == event.transaction_hash
        ).first()
        
        if existing_event:
            return existing_event
        
        db_event = BlockchainEvent(**event.dict())
        db.add(db_event)
        db.commit()
        db.refresh(db_event)
        return db_event
    
    @staticmethod
    def get_blockchain_events(
        db: Session, 
        skip: int = 0, 
        limit: int = 100, 
        result_filter: Optional[bool] = None,
        prover_filter: Optional[str] = None
    ) -> List[BlockchainEvent]:
        """Get blockchain events with optional filters"""
        query = db.query(BlockchainEvent).order_by(BlockchainEvent.block_number.desc())
        
        if result_filter is not None:
            query = query.filter(BlockchainEvent.result == result_filter)
        
        if prover_filter:
            query = query.filter(BlockchainEvent.prover.ilike(f"%{prover_filter}%"))
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def get_blockchain_event(db: Session, event_id: int) -> Optional[BlockchainEvent]:
        """Get specific blockchain event by ID"""
        return db.query(BlockchainEvent).filter(BlockchainEvent.id == event_id).first()
