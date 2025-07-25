from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from ..config import get_db
from ..schemas import DeviceDataCreate, DeviceDataResponse
from ..services.device_service import DeviceService

router = APIRouter(prefix="/data", tags=["device"])

@router.post("/", response_model=DeviceDataResponse)
def create_device_data(data: DeviceDataCreate, db: Session = Depends(get_db)):
    """Create new device data entry"""
    return DeviceService.create_device_data(db, data)

@router.get("/{device_id}", response_model=DeviceDataResponse)
def get_latest_device_data(device_id: str, db: Session = Depends(get_db)):
    """Get latest data for a specific device"""
    data = DeviceService.get_latest_device_data(db, device_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Device not found")
    return data

@router.get("/{device_id}/history")
def get_device_history(device_id: str, limit: int = 10, db: Session = Depends(get_db)):
    """Get historical data for a specific device"""
    return DeviceService.get_device_history(db, device_id, limit)
