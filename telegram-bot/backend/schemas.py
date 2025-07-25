from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

# Device Data Schemas
class DeviceDataCreate(BaseModel):
    device_id: str
    value: float
    location: str

class DeviceDataResponse(BaseModel):
    id: int
    device_id: str
    value: float
    location: str
    timestamp: datetime
    
    class Config:
        from_attributes = True

# Blockchain Event Schemas
class BlockchainEventCreate(BaseModel):
    prover: str
    result: bool
    timestamp: int
    block_number: int
    transaction_hash: str

class BlockchainEventResponse(BaseModel):
    id: int
    prover: str
    result: bool
    timestamp: int
    block_number: int
    transaction_hash: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Subscriber Schemas
class SubscriberCreate(BaseModel):
    chat_id: int
    user_id: int
    username: Optional[str] = None
    notify_successful_proofs: bool = True
    notify_failed_proofs: bool = False
    prover_filter: Optional[str] = None

class SubscriberResponse(BaseModel):
    id: int
    chat_id: int
    user_id: int
    username: Optional[str]
    subscribed_at: datetime
    is_active: bool
    notify_successful_proofs: bool
    notify_failed_proofs: bool
    prover_filter: Optional[str]
    
    class Config:
        from_attributes = True
