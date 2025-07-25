import asyncio
import os
import aiohttp
from dotenv import load_dotenv
from web3 import AsyncWeb3, WebSocketProvider
from eth_abi.abi import decode
from datetime import datetime
import websockets
import json

# Load environment variables from .env file
load_dotenv()

ADDRESS = os.getenv("CONTRACT_ADDRESS")
BACKEND_URL = os.getenv("BACKEND_URL")

def extract_event_data(log):
    """Extract prover, result, and timestamp from event log"""
    try:
        # The prover is the 3rd indexed parameter (topics[2])
        # Convert HexBytes to hex string and extract address (last 40 chars)
        prover_hex = log['topics'][3].hex()
        prover = "0x" + prover_hex[-40:]  # Get last 40 chars (20 bytes) for address
        
        # The result is in the data field (non-indexed bool parameter)
        data = log['data']
        
        print(f"prover address: {prover}")
        
        if data and data != '0x':
            # The data is already 32 bytes as HexBytes, decode directly
            decoded_data = decode(['bool'], data)
            result = decoded_data[0]
        else:
            result = None
            
        print(f"decoded result: {result}")
        print("-" * 30)
        
        # Get block info for timestamp
        block_number = log['blockNumber']
        
        return {
            'prover': prover,
            'result': result,
            'block_number': block_number,
            'transaction_hash': log['transactionHash'].hex()
        }
    except Exception as e:
        print(f"Error extracting event data: {e}")
        print(f"Log structure: {log}")  # Debug print to see the actual log structure
        return None

async def get_block_timestamp(w3, block_number):
    """Get timestamp for a specific block"""
    try:
        block = await w3.eth.get_block(block_number)
        return block['timestamp']
    except Exception as e:
        print(f"Error getting block timestamp: {e}")
        return None

async def save_event_to_backend(event_data):
    """Save blockchain event to backend database"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{BACKEND_URL}/events/", json=event_data) as response:
                if response.status == 200:
                    saved_event = await response.json()
                    print(f"✅ Event saved to database: ID {saved_event['id']}")
                    return saved_event
                else:
                    error_text = await response.text()
                    print(f"❌ Failed to save event to backend: {response.status} - {error_text}")
                    return None
    except Exception as e:
        print(f"❌ Error saving event to backend: {e}")
        return None

async def get_active_subscribers():
    """Get all active subscribers from backend"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{BACKEND_URL}/subscribers/") as response:
                if response.status == 200:
                    subscribers = await response.json()
                    return subscribers
                else:
                    print(f"Failed to get subscribers: {response.status}")
                    return []
    except Exception as e:
        print(f"Error getting subscribers: {e}")
        return []

async def save_subscriber_to_backend(chat_id, user_id, username=None):
    """Save/update subscriber to backend database"""
    try:
        subscriber_data = {
            "chat_id": chat_id,
            "user_id": user_id,
            "username": username,
            "notify_successful_proofs": True,
            "notify_failed_proofs": False,
            "prover_filter": None
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{BACKEND_URL}/subscribers/", json=subscriber_data) as response:
                if response.status == 200:
                    saved_subscriber = await response.json()
                    print(f"✅ Subscriber saved: {saved_subscriber['chat_id']}")
                    return saved_subscriber
                else:
                    error_text = await response.text()
                    print(f"❌ Failed to save subscriber: {response.status} - {error_text}")
                    return None
    except Exception as e:
        print(f"❌ Error saving subscriber: {e}")
        return None

async def mark_event_notified(chat_id, event_id):
    """Mark event as notified for a specific subscriber"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{BACKEND_URL}/subscribers/{chat_id}/mark-notified/{event_id}") as response:
                if response.status == 200:
                    return True
                else:
                    print(f"Failed to mark event as notified: {response.status}")
                    return False
    except Exception as e:
        print(f"Error marking event as notified: {e}")
        return False

class IndexerWebSocketClient:
    def __init__(self, uri='ws://localhost:8765'):
        self.uri = uri
        self.websocket = None
        self.connected = False
        
    async def connect(self, retry_count=3, retry_delay=5):
        """Connect to the bot's WebSocket server with retry logic"""
        for attempt in range(retry_count):
            try:
                self.websocket = await websockets.connect(self.uri)
                self.connected = True
                print(f"✅ Connected to bot WebSocket server at {self.uri}")
                return True
            except Exception as e:
                print(f"❌ Failed to connect to bot WebSocket (attempt {attempt + 1}/{retry_count}): {e}")
                if attempt < retry_count - 1:
                    print(f"🔄 Retrying in {retry_delay} seconds...")
                    await asyncio.sleep(retry_delay)
        
        print("❌ All WebSocket connection attempts failed")
        return False
    
    async def send_notification(self, notification_type: str, data: dict):
        """Send notification to bot via WebSocket"""
        if not self.connected or not self.websocket:
            print("❌ WebSocket not connected")
            return False
            
        try:
            message = {
                'type': notification_type,
                'data': data,
                'timestamp': asyncio.get_event_loop().time()
            }
            
            await self.websocket.send(json.dumps(message))
            print(f"📤 Sent {notification_type} notification via WebSocket")
            return True
            
        except websockets.exceptions.ConnectionClosed:
            print("❌ WebSocket connection closed")
            self.connected = False
            return False
        except Exception as e:
            print(f"❌ Error sending WebSocket notification: {e}")
            self.connected = False
            return False
    
    async def close(self):
        """Close WebSocket connection"""
        if self.websocket:
            try:
                await self.websocket.close()
                print("🔌 WebSocket connection closed")
            except Exception as e:
                print(f"Error closing WebSocket: {e}")
        self.connected = False

# Global WebSocket client
ws_client = IndexerWebSocketClient()

async def send_fallback_notification(chat_id: int, event_data: dict):
    """Send notification via direct HTTP call to bot's backend when WebSocket fails"""
    try:
        # For now, we'll just log that we would send - but in reality we need the bot's API
        # This is a limitation of the current architecture
        print(f"📧 FALLBACK: Sending notification to chat {chat_id}")
        print(f"   Event: {event_data.get('result')} proof from {event_data.get('prover')}")
        
        # In a real implementation, you would:
        # 1. Have a REST API endpoint on the bot to receive notifications
        # 2. Or use a message queue like Redis/RabbitMQ
        # 3. Or have the bot poll the database more frequently
        
        # For now, the database polling method in the bot should handle this
        return True
        
    except Exception as e:
        print(f"Error in fallback notification: {e}")
        return False

async def notify_telegram_bot(event_data, saved_event=None):
    """Send notification to telegram bot via WebSocket"""
    try:
        # Add the database event ID to the notification data
        notification_data = event_data.copy()
        if saved_event and 'id' in saved_event:
            notification_data['id'] = saved_event['id']
        
        # Try to send via WebSocket first (only if connected)
        if ws_client.connected:
            success = await ws_client.send_notification('blockchain_event', notification_data)
            
            if success:
                print(f"✅ Real-time notification sent via WebSocket for event ID {notification_data.get('id', 'unknown')}")
                return
            else:
                print("🔄 WebSocket send failed, attempting reconnection...")
                # Try to reconnect once
                if await ws_client.connect(retry_count=1, retry_delay=2):
                    success = await ws_client.send_notification('blockchain_event', notification_data)
                    if success:
                        print(f"✅ Real-time notification sent via WebSocket after reconnect")
                        return
        
        # Fallback: The bot's background task will pick up these events from database
        print("🔄 WebSocket unavailable - notifications will be sent via bot's database polling")
        
        # Get active subscribers and show what would be notified
        subscribers = await get_active_subscribers()
        
        if not subscribers:
            print("No active subscribers to notify")
            return
        
        print(f"📢 Event saved to database - {len(subscribers)} subscribers will be notified by bot polling")
        
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
                print(f"📲 Chat {subscriber['chat_id']} will receive notification via database polling")
                
    except Exception as e:
        print(f"Error notifying telegram bot: {e}")

async def process_blockchain_event(event_data, block_timestamp):
    """Process a blockchain event: save to DB and notify subscribers"""
    # Add timestamp to event data
    event_data['timestamp'] = block_timestamp
    
    print(f"🔄 Processing blockchain event:")
    print(f"  Prover: {event_data['prover']}")
    print(f"  Result: {event_data['result']}")
    print(f"  Timestamp: {datetime.fromtimestamp(block_timestamp)}")
    print(f"  Block: {event_data['block_number']}")
    print(f"  Tx Hash: {event_data['transaction_hash']}")
    
    # Save event to database
    saved_event = await save_event_to_backend(event_data)
    
    if saved_event:
        # Notify telegram bot about new event (pass saved_event for ID)
        await notify_telegram_bot(event_data, saved_event)
        print(f"✅ Event processed successfully")
    else:
        print(f"❌ Failed to process event")
    
    print("-" * 50)

async def subscribe_to_transfer_events(event_topic: str, websocket_url: str):
    try:
        async with AsyncWeb3(WebSocketProvider(websocket_url)) as w3:
            # Check connection
            latest_block = await w3.eth.get_block_number()
            print(f"Connected to chain. Latest block: {latest_block}")
        
            # Use the correct topic hash you provided
            print(f"Event topic hash: {event_topic}")
            
            filter_params = {
                "address": ADDRESS,
                "topics": [event_topic],
            }
            
            subscription_id = await w3.eth.subscribe("logs", filter_params)
            print(f"Subscribed to MiaGenProof events. Subscription ID: {subscription_id}")
            print("Waiting for events...")
            
            # Add timeout to avoid infinite waiting
            timeout = 3600  
            start_time = asyncio.get_event_loop().time()
            
            async for payload in w3.socket.process_subscriptions():
                current_time = asyncio.get_event_loop().time()
                if current_time - start_time > timeout:
                    print("Timeout reached. No events received.")
                    break
                    
                result = payload["result"]
                
                # Extract the data we want
                event_data = extract_event_data(result)
                if event_data:
                    # Get timestamp
                    timestamp = await get_block_timestamp(w3, event_data['block_number'])
                    
                    if timestamp:
                        # Process the event (save to DB and notify)
                        await process_blockchain_event(event_data, timestamp)
                    
    except Exception as e:
        print(f"Error: {e}")

async def check_past_events(event_topic: str, websocket_url: str, from_block: int = 0):
    try:
        async with AsyncWeb3(WebSocketProvider(websocket_url)) as w3:
            latest_block = await w3.eth.get_block_number()
            
            # Chunk size to avoid RPC limits (10k blocks max per request)
            chunk_size = 10000
            total_events_processed = 0
            
            print(f"Checking past events from block {from_block} to {latest_block}...")
            
            # Process in chunks
            current_block = from_block
            while current_block <= latest_block:
                end_block = min(current_block + chunk_size - 1, latest_block)
                
                filter_params = {
                    "address": ADDRESS,
                    "topics": [event_topic],
                    "fromBlock": current_block,
                    "toBlock": end_block
                }
                
                print(f"Checking blocks {current_block} to {end_block}...")
                logs = await w3.eth.get_logs(filter_params)
                print(f"Found {len(logs)} events in this chunk")
                
                chunk_events_processed = 0
                for log in logs:
                    # Extract the data we want
                    event_data = extract_event_data(log)
                    if event_data:
                        # Get timestamp
                        timestamp = await get_block_timestamp(w3, event_data['block_number'])
                        
                        if timestamp:
                            # Process the event (save to DB and notify)
                            await process_blockchain_event(event_data, timestamp)
                            chunk_events_processed += 1
                            total_events_processed += 1
                
                print(f"Events processed in this chunk: {chunk_events_processed}")
                current_block = end_block + 1
            
            print(f"Total events processed: {total_events_processed}")
                
    except Exception as e:
        print(f"Error checking past events: {e}")

async def main():
    event_topic = os.getenv("EVENT_TOPIC")
    websocket_url = os.getenv("WS_URL")
    from_block = int(os.getenv("FROM_BLOCK", 0))
    
    print("🚀 Starting Blockchain Indexer Engine")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Contract Address: {ADDRESS}")
    print(f"Event Topic: {event_topic}")
    print("-" * 50)
    
    # Try to connect to bot's WebSocket server (non-blocking)
    print("🔌 Attempting to connect to bot WebSocket server...")
    await ws_client.connect(retry_count=2, retry_delay=3)
    
    if not ws_client.connected:
        print("⚠️  WebSocket connection failed, continuing with fallback mode")
        print("💡 Make sure the bot is running first for real-time notifications")
    
    try:
        print("📚 Checking for past events first...")
        await check_past_events(event_topic, websocket_url, from_block)
        
        print("\n👂 Now subscribing to new events...")
        await subscribe_to_transfer_events(event_topic, websocket_url)
        
    finally:
        # Close WebSocket connection when done
        await ws_client.close()

if __name__ == "__main__":
    asyncio.run(main())