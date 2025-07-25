import asyncio
import json
import logging
import websockets
from typing import Set
from datetime import datetime

logger = logging.getLogger(__name__)

class WebSocketNotificationServer:
    def __init__(self):
        self.clients: Set[websockets.WebSocketServerProtocol] = set()
        self.bot_application = None
        
    def set_bot_application(self, application):
        """Set the telegram bot application for sending notifications"""
        self.bot_application = application
    
    async def register_client(self, websocket):
        """Register a new WebSocket client (indexer)"""
        self.clients.add(websocket)
        logger.info(f"Indexer connected: {websocket.remote_address}")
        
    async def unregister_client(self, websocket):
        """Unregister a WebSocket client"""
        self.clients.discard(websocket)
        logger.info(f"Indexer disconnected: {websocket.remote_address}")
        
    async def handle_notification(self, message_data: dict):
        """Handle incoming notification from indexer"""
        try:
            if message_data.get('type') == 'blockchain_event':
                await self.send_blockchain_notification(message_data['data'])
            elif message_data.get('type') == 'device_alert':
                await self.send_device_notification(message_data['data'])
            else:
                logger.warning(f"Unknown notification type: {message_data.get('type')}")
                
        except Exception as e:
            logger.error(f"Error handling notification: {e}")
    
    async def send_blockchain_notification(self, event_data: dict):
        """Send blockchain event notification to subscribers"""
        if not self.bot_application:
            logger.error("Bot application not set")
            return
            
        try:
            # Get subscribers from backend
            import aiohttp
            import os
            backend_url = os.getenv('BACKEND_URL', 'http://localhost:8000')
            
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{backend_url}/subscribers/") as response:
                    if response.status == 200:
                        subscribers = await response.json()
                        logger.info(f"📧 Processing notifications for {len(subscribers)} subscribers")
                        
                        notifications_sent = 0
                        for subscriber in subscribers:
                            should_notify = False
                            
                            # Check if subscriber wants this type of notification
                            if event_data['result'] and subscriber['notify_successful_proofs']:
                                should_notify = True
                            elif not event_data['result'] and subscriber['notify_failed_proofs']:
                                should_notify = True
                            
                            # Check prover filter
                            if should_notify and subscriber['prover_filter']:
                                if subscriber['prover_filter'].lower() not in event_data['prover'].lower():
                                    should_notify = False
                            
                            if should_notify:
                                success = await self.send_telegram_message(subscriber['chat_id'], event_data)
                                if success:
                                    notifications_sent += 1
                                    
                                    # Mark as notified in backend (if we have event ID)
                                    if 'id' in event_data:
                                        async with session.post(f"{backend_url}/subscribers/{subscriber['chat_id']}/mark-notified/{event_data['id']}") as mark_response:
                                            if mark_response.status == 200:
                                                logger.info(f"Event {event_data['id']} marked as notified for chat {subscriber['chat_id']}")
                        
                        logger.info(f"📨 Sent {notifications_sent} real-time notifications")
                        
        except Exception as e:
            logger.error(f"Error sending blockchain notification: {e}")
    
    async def send_telegram_message(self, chat_id: int, event_data: dict):
        """Send telegram message to specific chat"""
        try:
            prover = event_data.get('prover', 'Unknown')
            result = event_data.get('result', False)
            timestamp = event_data.get('timestamp', 'Unknown')
            block_number = event_data.get('block_number', 'Unknown')
            
            if result:
                emoji = "✅"
                status = "SUCCESSFUL"
            else:
                emoji = "❌"
                status = "FAILED"
            
            # Convert timestamp to readable format
            if isinstance(timestamp, int):
                timestamp_str = datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S UTC')
            else:
                timestamp_str = str(timestamp)
            
            message = (
                f"{emoji} **{status} PROOF**\n\n"
                f"👤 **Prover:** `{prover}`\n"
                f"🕐 **Time:** {timestamp_str}\n"
                f"📦 **Block:** {block_number}\n"
                f"🔗 **Result:** {result}\n"
                f"🚀 **Real-time via WebSocket**"
            )
            
            await self.bot_application.bot.send_message(
                chat_id=chat_id,
                text=message,
                parse_mode='Markdown'
            )
            
            logger.info(f"✅ Real-time notification sent to chat {chat_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending telegram message to chat {chat_id}: {e}")
            return False
    
    async def handle_client(self, websocket, path):
        """Handle WebSocket client connection"""
        await self.register_client(websocket)
        try:
            async for message in websocket:
                try:
                    data = json.loads(message)
                    await self.handle_notification(data)
                except json.JSONDecodeError:
                    logger.error(f"Invalid JSON received: {message}")
                    await websocket.send(json.dumps({"error": "Invalid JSON format"}))
                except Exception as e:
                    logger.error(f"Error processing message: {e}")
                    await websocket.send(json.dumps({"error": f"Processing error: {str(e)}"}))
        except websockets.exceptions.ConnectionClosed:
            logger.info("Indexer connection closed normally")
        except Exception as e:
            logger.error(f"WebSocket error: {e}")
        finally:
            await self.unregister_client(websocket)
    
    async def start_server(self, host='localhost', port=8765):
        """Start the WebSocket server"""
        try:
            logger.info(f"Starting WebSocket server on {host}:{port}")
            return await websockets.serve(
                self.handle_client, 
                host, 
                port,
                ping_interval=20,  # Send ping every 20 seconds
                ping_timeout=10,   # Wait 10 seconds for pong
                close_timeout=10   # Wait 10 seconds for close
            )
        except Exception as e:
            logger.error(f"Failed to start WebSocket server: {e}")
            raise

# Global instance
notification_server = WebSocketNotificationServer()
