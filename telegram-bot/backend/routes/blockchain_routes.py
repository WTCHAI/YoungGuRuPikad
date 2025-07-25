from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from ..config import get_db
from ..schemas import BlockchainEventCreate, BlockchainEventResponse
from ..services.blockchain_service import BlockchainService

router = APIRouter(prefix="/events", tags=["blockchain"])

@router.post("/", response_model=BlockchainEventResponse)
def create_blockchain_event(event: BlockchainEventCreate, db: Session = Depends(get_db)):
    """Create new blockchain event"""
    return BlockchainService.create_blockchain_event(db, event)

@router.get("/", response_model=List[BlockchainEventResponse])
def get_blockchain_events(
    skip: int = 0, 
    limit: int = 100, 
    result_filter: Optional[bool] = None,
    prover_filter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get blockchain events with optional filters"""
    return BlockchainService.get_blockchain_events(db, skip, limit, result_filter, prover_filter)

@router.get("/{event_id}", response_model=BlockchainEventResponse)
def get_blockchain_event(event_id: int, db: Session = Depends(get_db)):
    """Get specific blockchain event"""
    event = BlockchainService.get_blockchain_event(db, event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return event
