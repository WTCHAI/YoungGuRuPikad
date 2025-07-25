from sqlalchemy.orm import Session
from typing import List, Optional
from ..models import DeviceData
from ..schemas import DeviceDataCreate

class DeviceService:
    @staticmethod
    def create_device_data(db: Session, data: DeviceDataCreate) -> DeviceData:
        """Create new device data entry"""
        db_data = DeviceData(**data.dict())
        db.add(db_data)
        db.commit()
        db.refresh(db_data)
        return db_data
    
    @staticmethod
    def get_latest_device_data(db: Session, device_id: str) -> Optional[DeviceData]:
        """Get latest data for a specific device"""
        return db.query(DeviceData).filter(
            DeviceData.device_id == device_id
        ).order_by(DeviceData.timestamp.desc()).first()
    
    @staticmethod
    def get_device_history(db: Session, device_id: str, limit: int = 10) -> List[DeviceData]:
        """Get historical data for a specific device"""
        return db.query(DeviceData).filter(
            DeviceData.device_id == device_id
        ).order_by(DeviceData.timestamp.desc()).limit(limit).all()
