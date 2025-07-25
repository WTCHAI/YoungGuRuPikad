from sqlalchemy.orm import Session
from typing import List, Optional
from ..models import Subscriber, BlockchainEvent
from ..schemas import SubscriberCreate

class SubscriberService:
    @staticmethod
    def create_or_update_subscriber(db: Session, subscriber: SubscriberCreate) -> Subscriber:
        """Create new subscriber or update existing one"""
        # Check if subscriber already exists
        existing_subscriber = db.query(Subscriber).filter(
            Subscriber.chat_id == subscriber.chat_id
        ).first()
        
        if existing_subscriber:
            # Update existing subscriber
            for key, value in subscriber.dict().items():
                setattr(existing_subscriber, key, value)
            existing_subscriber.is_active = True
            db.commit()
            db.refresh(existing_subscriber)
            return existing_subscriber
        
        # Create new subscriber
        db_subscriber = Subscriber(**subscriber.dict())
        db.add(db_subscriber)
        db.commit()
        db.refresh(db_subscriber)
        return db_subscriber
    
    @staticmethod
    def get_subscribers(db: Session, skip: int = 0, limit: int = 100) -> List[Subscriber]:
        """Get all active subscribers"""
        return db.query(Subscriber).filter(
            Subscriber.is_active == True
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_subscriber(db: Session, chat_id: int) -> Optional[Subscriber]:
        """Get specific subscriber by chat_id"""
        return db.query(Subscriber).filter(Subscriber.chat_id == chat_id).first()
    
    @staticmethod
    def unsubscribe(db: Session, chat_id: int) -> bool:
        """Unsubscribe user (set inactive)"""
        subscriber = db.query(Subscriber).filter(Subscriber.chat_id == chat_id).first()
        if subscriber is None:
            return False
        
        subscriber.is_active = False
        db.commit()
        return True
    
    @staticmethod
    def get_pending_events(db: Session, chat_id: int) -> List[dict]:
        """Get pending events for a subscriber"""
        subscriber = db.query(Subscriber).filter(Subscriber.chat_id == chat_id).first()
        if subscriber is None:
            return []
        
        # Get events that match subscriber preferences and haven't been sent
        query = db.query(BlockchainEvent).filter(
            ~BlockchainEvent.notified_subscribers.contains(subscriber)
        )
        
        # Apply filters based on subscriber preferences
        if subscriber.notify_successful_proofs and subscriber.notify_failed_proofs:
            # User wants both successful and failed proofs - no filter needed
            pass
        elif subscriber.notify_successful_proofs:
            # User only wants successful proofs
            query = query.filter(BlockchainEvent.result == True)
        elif subscriber.notify_failed_proofs:
            # User only wants failed proofs
            query = query.filter(BlockchainEvent.result == False)
        else:
            # User doesn't want any notifications - return empty
            return []
        
        if subscriber.prover_filter:
            query = query.filter(BlockchainEvent.prover.ilike(f"%{subscriber.prover_filter}%"))
        
        pending_events = query.order_by(BlockchainEvent.block_number.desc()).limit(50).all()
        
        # Convert to dict for JSON response
        events_list = []
        for event in pending_events:
            events_list.append({
                'id': event.id,
                'prover': event.prover,
                'result': event.result,
                'timestamp': event.timestamp,
                'block_number': event.block_number,
                'transaction_hash': event.transaction_hash,
                'created_at': event.created_at.isoformat()
            })
        
        return events_list
    
    @staticmethod
    def mark_event_notified(db: Session, chat_id: int, event_id: int) -> bool:
        """Mark event as notified for a subscriber"""
        subscriber = db.query(Subscriber).filter(Subscriber.chat_id == chat_id).first()
        if subscriber is None:
            return False
        
        event = db.query(BlockchainEvent).filter(BlockchainEvent.id == event_id).first()
        if event is None:
            return False
        
        # Add to many-to-many relationship
        if subscriber not in event.notified_subscribers:
            event.notified_subscribers.append(subscriber)
            db.commit()
        
        return True
