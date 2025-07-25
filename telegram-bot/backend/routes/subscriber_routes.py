from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from ..config import get_db
from ..schemas import SubscriberCreate, SubscriberResponse
from ..services.subscriber_service import SubscriberService

router = APIRouter(prefix="/subscribers", tags=["subscribers"])

@router.post("/", response_model=SubscriberResponse)
def create_or_update_subscriber(subscriber: SubscriberCreate, db: Session = Depends(get_db)):
    """Create or update subscriber"""
    return SubscriberService.create_or_update_subscriber(db, subscriber)

@router.get("/", response_model=List[SubscriberResponse])
def get_subscribers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all active subscribers"""
    return SubscriberService.get_subscribers(db, skip, limit)

@router.get("/{chat_id}", response_model=SubscriberResponse)
def get_subscriber(chat_id: int, db: Session = Depends(get_db)):
    """Get specific subscriber"""
    subscriber = SubscriberService.get_subscriber(db, chat_id)
    if subscriber is None:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    return subscriber

@router.delete("/{chat_id}")
def unsubscribe(chat_id: int, db: Session = Depends(get_db)):
    """Unsubscribe user"""
    success = SubscriberService.unsubscribe(db, chat_id)
    if not success:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    return {"message": "Successfully unsubscribed"}

@router.get("/{chat_id}/pending-events")
def get_pending_events(chat_id: int, db: Session = Depends(get_db)):
    """Get pending events for subscriber"""
    subscriber = SubscriberService.get_subscriber(db, chat_id)
    if subscriber is None:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    
    return SubscriberService.get_pending_events(db, chat_id)

@router.post("/{chat_id}/mark-notified/{event_id}")
def mark_event_notified(chat_id: int, event_id: int, db: Session = Depends(get_db)):
    """Mark event as notified for subscriber"""
    success = SubscriberService.mark_event_notified(db, chat_id, event_id)
    if not success:
        raise HTTPException(status_code=404, detail="Subscriber or event not found")
    return {"message": "Event marked as notified"}
