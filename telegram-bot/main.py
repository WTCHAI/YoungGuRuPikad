import logging
import os
import asyncio
import aiohttp
from datetime import datetime
from dotenv import load_dotenv
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes, CallbackQueryHandler
from websocket_server import notification_server

# Load environment variables from .env file
load_dotenv()

# Enable logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Load bot token from environment variable
BOT_TOKEN = os.getenv('BOT_TOKEN')

if not BOT_TOKEN:
    raise ValueError("BOT_TOKEN environment variable is not set. Please set it before running the bot.")

# Add global variable for proof_subscribers
proof_subscribers = {}

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Send a message when the command /start is issued."""
    keyboard = [
        [
            InlineKeyboardButton("🔗 Subscribe to Proofs", callback_data='subscribe_proofs'),
            InlineKeyboardButton("❌ Unsubscribe", callback_data='unsubscribe_proofs')
        ],
        [
            InlineKeyboardButton("📋 Check Status", callback_data='check_status')
        ]
    ]
    
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(
        'Hello! I am Younggu.\n\n'
        '🔗 Subscribe to blockchain proof notifications\n'
        '📋 Check your current status',
        reply_markup=reply_markup
    )


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Send a message when the command /help is issued."""
    help_text = """
Available commands:

**Blockchain Monitoring:**
/subscribe - Subscribe to all proof notifications
/subscribe <prover_address> - Subscribe to notifications from specific prover
/unsubscribe - Completely unsubscribe from all notifications
/unsubscribe <prover_address> - Remove specific prover filter (keep subscription)
/mystatus - Check your subscription status

**Examples:**
• `/subscribe` - Get notifications from all provers
• `/subscribe 0x1234...abcd` - Only get notifications from specific prover
• `/unsubscribe` - Stop all notifications completely
• `/unsubscribe 0x1234...abcd` - Remove prover filter, get notifications from all provers again

**General:**
/start - Start the bot
/help - Show this help message
    """
    await update.message.reply_text(help_text, parse_mode='Markdown')

async def load_subscribers_from_backend():
    """Load all active subscribers from backend database on startup"""
    try:
        backend_url = os.getenv('BACKEND_URL', 'http://localhost:8000')
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{backend_url}/subscribers/") as response:
                if response.status == 200:
                    subscribers = await response.json()
                    logger.info(f"Loaded {len(subscribers)} subscribers from database")
                    
                    # Store in local cache for status checks
                    global proof_subscribers
                    proof_subscribers = {}
                    for sub in subscribers:
                        proof_subscribers[sub['chat_id']] = {
                            'user_id': sub['user_id'],
                            'username': sub['username'],
                            'subscribed_at': sub['subscribed_at'],
                            'notify_successful_proofs': sub['notify_successful_proofs'],
                            'notify_failed_proofs': sub['notify_failed_proofs'],
                            'prover_filter': sub['prover_filter']
                        }
                    
                    return subscribers
                else:
                    logger.error(f"Failed to load subscribers: {response.status}")
                    return []
    except Exception as e:
        logger.error(f"Error loading subscribers from backend: {e}")
        return []

# Blockchain proof subscription management
async def subscribe_proofs(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Subscribe to blockchain proof notifications with optional prover filter."""
    chat_id = update.effective_chat.id
    user_id = update.effective_user.id
    username = update.effective_user.username or f"user_{user_id}"
    
    # Check if user provided a prover filter
    prover_filter = None
    if context.args:
        prover_filter = context.args[0].strip()

        if prover_filter and not prover_filter.startswith('0x'):
            prover_filter = f"0x{prover_filter}"
        
        # Basic validation for Ethereum address format
        if prover_filter and len(prover_filter) != 42:
            await update.message.reply_text(
                "❌ Invalid prover address format. Please provide a valid Ethereum address.\n"
                "Usage: /subscribe [prover_address]\n"
                "Example: /subscribe 0x1234567890abcdef1234567890abcdef12345678"
            )
            return
    
    # Save to backend database
    try:
        backend_url = os.getenv('BACKEND_URL', 'http://localhost:8000')
        subscriber_data = {
            "chat_id": chat_id,
            "user_id": user_id,
            "username": username,
            "notify_successful_proofs": True,
            "notify_failed_proofs": False,
            "prover_filter": prover_filter
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{backend_url}/subscribers/", json=subscriber_data) as response:
                if response.status == 200:
                    saved_subscriber = await response.json()
                    logger.info(f"Subscriber saved to backend: {chat_id} with prover filter: {prover_filter}")
                    
                    # Update local cache
                    global proof_subscribers
                    if proof_subscribers is None:
                        proof_subscribers = {}
                    
                    proof_subscribers[chat_id] = {
                        'user_id': user_id,
                        'username': username,
                        'subscribed_at': saved_subscriber['subscribed_at'],
                        'notify_successful_proofs': True,
                        'notify_failed_proofs': False,
                        'prover_filter': prover_filter
                    }
                    
                    # Create response message
                    filter_text = f"🎯 **Specific prover:** `{prover_filter}`" if prover_filter else "👤 **All provers** (no filter)"
                    
                    await update.message.reply_text(
                        "✅ Successfully subscribed to blockchain proof notifications!\n\n"
                        "**Your Settings:**\n"
                        "• ✅ Successful proofs (enabled)\n"
                        "• ❌ Failed proofs (disabled)\n"
                        f"• {filter_text}\n\n"
                        "**Commands:**\n"
                        "• Use /mystatus to see your settings\n"
                        "• Use /unsubscribe to stop notifications\n"
                        "• Use /subscribe <address> to change prover filter",
                        parse_mode='Markdown'
                    )
                else:
                    logger.error(f"Failed to save subscriber to backend: {response.status}")
                    await update.message.reply_text(
                        "❌ Failed to subscribe. Please try again later."
                    )
    except Exception as e:
        logger.error(f"Error saving subscriber to backend: {e}")
        await update.message.reply_text(
            "❌ Failed to subscribe. Please try again later."
        )


async def unsubscribe_proofs(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Unsubscribe from blockchain proof notifications or remove specific prover filter."""
    chat_id = update.effective_chat.id
    backend_url = os.getenv('BACKEND_URL', 'http://localhost:8000')
    
    # Declare global at the beginning of the function
    global proof_subscribers
    
    # Check if user wants to remove specific prover filter
    if context.args:
        prover_filter = context.args[0].strip()
        if not prover_filter.startswith('0x'):
            prover_filter = f"0x{prover_filter}"
        
        # Basic validation for Ethereum address format
        if len(prover_filter) != 42:
            await update.message.reply_text(
                "❌ Invalid prover address format. Please provide a valid Ethereum address.\n"
                "Usage: /unsubscribe [prover_address]\n"
                "Example: /unsubscribe 0x1234567890abcdef1234567890abcdef12345678"
            )
            return
        
        # Update subscriber to remove prover filter (set to None)
        try:
            async with aiohttp.ClientSession() as session:
                # First get current subscriber settings
                async with session.get(f"{backend_url}/subscribers/{chat_id}") as response:
                    if response.status == 200:
                        current_subscriber = await response.json()
                        
                        # Check if the prover filter matches
                        if current_subscriber.get('prover_filter') == prover_filter:
                            # Update to remove prover filter
                            subscriber_data = {
                                "chat_id": chat_id,
                                "user_id": current_subscriber['user_id'],
                                "username": current_subscriber['username'],
                                "notify_successful_proofs": current_subscriber['notify_successful_proofs'],
                                "notify_failed_proofs": current_subscriber['notify_failed_proofs'],
                                "prover_filter": None  # Remove filter
                            }
                            
                            async with session.put(f"{backend_url}/subscribers/{chat_id}", json=subscriber_data) as put_response:
                                if put_response.status == 200:
                                    logger.info(f"Prover filter removed for subscriber: {chat_id}")
                                    
                                    # Update local cache
                                    if proof_subscribers and chat_id in proof_subscribers:
                                        proof_subscribers[chat_id]['prover_filter'] = None
                                    
                                    await update.message.reply_text(
                                        f"✅ Prover filter removed!\n\n"
                                        f"🗑️ **Removed filter:** `{prover_filter}`\n"
                                        f"👤 **Now receiving from:** All provers\n\n"
                                        "Use /mystatus to see your current settings.",
                                        parse_mode='Markdown'
                                    )
                                else:
                                    await update.message.reply_text("❌ Failed to remove prover filter. Please try again later.")
                        else:
                            current_filter = current_subscriber.get('prover_filter')
                            await update.message.reply_text(
                                f"❌ Prover filter mismatch!\n\n"
                                f"**Your current filter:** {current_filter or 'None'}\n"
                                f"**You tried to remove:** `{prover_filter}`\n\n"
                                "Use /mystatus to see your current settings.",
                                parse_mode='Markdown'
                            )
                    else:
                        await update.message.reply_text("❌ You are not currently subscribed to proof notifications.")
        except Exception as e:
            logger.error(f"Error removing prover filter: {e}")
            await update.message.reply_text("❌ Failed to remove prover filter. Please try again later.")
        
        return
    
    # No arguments provided - completely unsubscribe
    try:
        async with aiohttp.ClientSession() as session:
            async with session.delete(f"{backend_url}/subscribers/{chat_id}") as response:
                if response.status == 200:
                    logger.info(f"Subscriber completely removed from backend: {chat_id}")
                    
                    # Remove from local cache
                    if proof_subscribers and chat_id in proof_subscribers:
                        del proof_subscribers[chat_id]
                    
                    await update.message.reply_text(
                        "❌ **Completely unsubscribed** from blockchain proof notifications.\n\n"
                        "🚫 You will no longer receive any proof notifications.\n\n"
                        "Use /subscribe to resubscribe."
                    )
                else:
                    logger.error(f"Failed to remove subscriber from backend: {response.status}")
                    await update.message.reply_text("❌ Failed to unsubscribe. You may not be subscribed.")
    except Exception as e:
        logger.error(f"Error removing subscriber from backend: {e}")
        await update.message.reply_text("❌ Failed to unsubscribe. Please try again later.")


async def my_status(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Show current subscription status from backend database."""
    chat_id = update.effective_chat.id
    
    status_message = "📊 **Your Status:**\n\n"
    
    # Check blockchain subscription status from backend
    try:
        backend_url = os.getenv('BACKEND_URL', 'http://localhost:8000')
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{backend_url}/subscribers/{chat_id}") as response:
                if response.status == 200:
                    subscriber = await response.json()
                    status_message += "🔗 **Blockchain Proofs:** Subscribed ✅\n"
                    status_message += f"• Successful proofs: {'✅' if subscriber['notify_successful_proofs'] else '❌'}\n"
                    status_message += f"• Failed proofs: {'✅' if subscriber['notify_failed_proofs'] else '❌'}\n"
                    status_message += f"• Prover filter: "
                    if subscriber['prover_filter']:
                        status_message += f"`{subscriber['prover_filter']}`\n"
                    else:
                        status_message += "All provers (no filter)\n"
                    status_message += f"• Subscribed: {subscriber['subscribed_at']}\n"
                else:
                    status_message += "🔗 **Blockchain Proofs:** Not subscribed ❌\n"
    except Exception as e:
        logger.error(f"Error checking subscription status: {e}")
        status_message += "🔗 **Blockchain Proofs:** Status unknown ⚠️\n"
    
    await update.message.reply_text(status_message, parse_mode='Markdown')

# Blockchain notification function
async def notify_proof_subscribers(application: Application, proof_data: dict):
    """Notify all subscribed users about a new proof."""
    if not proof_subscribers:
        return
    
    # Create notification message
    prover = proof_data.get('prover', 'Unknown')
    result = proof_data.get('result', False)
    timestamp = proof_data.get('timestamp', 'Unknown')
    block_number = proof_data.get('block_number', 'Unknown')
    
    if result:
        emoji = "✅"
        status = "SUCCESSFUL"
    else:
        emoji = "❌"
        status = "FAILED"
    
    message = (
        f"{emoji} **{status} PROOF**\n\n"
        f"Younggu is nearby your girlfriend - beware! 🚨😱💀\n\n"
        f"👤 **Prover:** `{prover}`\n"
        f"🕐 **Time:** {timestamp}\n"
        f"📦 **Block:** {block_number}\n"
        f"🔗 **Result:** {result}"
    )
    
    # Send to all subscribers
    for chat_id, sub_settings in proof_subscribers.items():
        try:
            # Check if user wants this type of notification
            should_notify = False
            if result and sub_settings['notify_successful_proofs']:
                should_notify = True
            elif not result and sub_settings['notify_failed_proofs']:
                should_notify = True
            
            # Check prover filter
            if should_notify and sub_settings['prover_filter']:
                if sub_settings['prover_filter'].lower() not in prover.lower():
                    should_notify = False
            
            if should_notify:
                await application.bot.send_message(
                    chat_id=chat_id,
                    text=message,
                    parse_mode='Markdown'
                )
                logger.info(f"Sent proof notification to chat {chat_id}")
                
        except Exception as e:
            logger.error(f"Error sending proof notification to chat {chat_id}: {e}")

# Add background task to check for new blockchain events via database polling
async def check_blockchain_notifications(application: Application):
    """Background task to check for new blockchain events and notify subscribers (fallback when WebSocket fails)."""
    backend_url = os.getenv('BACKEND_URL', 'http://localhost:8000')
    
    while True:
        try:
            # Get all active subscribers from backend
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{backend_url}/subscribers/") as response:
                    if response.status == 200:
                        subscribers = await response.json()
                        
                        if subscribers:
                            logger.info(f"📊 Checking for pending events for {len(subscribers)} subscribers")
                        
                        # Check pending events for each subscriber
                        for subscriber in subscribers:
                            chat_id = subscriber['chat_id']
                            
                            # Get pending events for this subscriber
                            async with session.get(f"{backend_url}/subscribers/{chat_id}/pending-events") as events_response:
                                if events_response.status == 200:
                                    pending_events = await events_response.json()
                                    
                                    if pending_events:
                                        logger.info(f"📧 Found {len(pending_events)} pending events for chat {chat_id}")
                                    
                                    # Send notifications for pending events
                                    for event in pending_events:
                                        try:
                                            # Create notification message
                                            prover = event.get('prover', 'Unknown')
                                            result = event.get('result', False)
                                            timestamp = event.get('timestamp', 'Unknown')
                                            block_number = event.get('block_number', 'Unknown')
                                            
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
                                                f"Younggu is nearby your girlfriend - beware! 🚨😱💀\n\n"
                                                f"👤 **Prover:** `{prover}`\n"
                                                f"🕐 **Time:** {timestamp_str}\n"
                                                f"📦 **Block:** {block_number}\n"
                                                f"🔗 **Result:** {result}\n"
                                                f"📊 **Via Database Polling**"
                                            )
                                            
                                            # Send notification
                                            await application.bot.send_message(
                                                chat_id=chat_id,
                                                text=message,
                                                parse_mode='Markdown'
                                            )
                                            
                                            logger.info(f"✅ Database polling notification sent to chat {chat_id} for event {event['id']}")
                                            
                                            # Mark as notified in backend
                                            async with session.post(f"{backend_url}/subscribers/{chat_id}/mark-notified/{event['id']}") as mark_response:
                                                if mark_response.status == 200:
                                                    logger.info(f"Event {event['id']} marked as notified for chat {chat_id}")
                                                
                                        except Exception as e:
                                            logger.error(f"Error sending database polling notification to chat {chat_id}: {e}")
            
            # Check every 10 seconds for new blockchain events
            await asyncio.sleep(10)
            
        except Exception as e:
            logger.error(f"Error in database polling notification check: {e}")
            await asyncio.sleep(30)  # Wait longer on error

async def error_handler(update: object, context: ContextTypes.DEFAULT_TYPE):
    """Log the error and send a telegram message to notify the developer."""
    logger.error(msg="Exception while handling an update:", exc_info=context.error)

async def post_init_callback(application: Application):
    """Initialize background tasks after the application starts."""
    # Load subscribers from database on startup
    await load_subscribers_from_backend()
    
    # Set the bot application in the WebSocket server
    notification_server.set_bot_application(application)
    
    try:
        # Start WebSocket server for indexer communication
        websocket_host = os.getenv('WEBSOCKET_HOST', 'localhost')
        websocket_port = int(os.getenv('WEBSOCKET_PORT', 8765))
        
        websocket_server = await notification_server.start_server(websocket_host, websocket_port)
        logger.info(f"✅ WebSocket server started on {websocket_host}:{websocket_port}")
        
        # Add database polling task as fallback
        application.create_task(check_blockchain_notifications(application))
        logger.info("📊 Database polling task started as fallback for notifications")
        
    except Exception as e:
        logger.error(f"❌ Failed to start WebSocket server: {e}")
        logger.info("🔄 Continuing without WebSocket server - using fallback mode only")
        
        # Still start background tasks even if WebSocket fails
        application.create_task(check_blockchain_notifications(application))
        logger.info("📊 Database polling task started (WebSocket unavailable)")

async def color_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle callback queries."""
    query = update.callback_query
    await query.answer()
    
    # Declare global at the beginning
    global proof_subscribers
    
    if query.data == 'subscribe_proofs':
        # Show subscription options instead of directly subscribing
        keyboard = [
            [
                InlineKeyboardButton("👤 All Provers", callback_data='subscribe_all_provers'),
                InlineKeyboardButton("🎯 Specific Prover", callback_data='subscribe_specific_prover')
            ],
            [
                InlineKeyboardButton("🔙 Back to Menu", callback_data='back_to_menu')
            ]
        ]
        
        reply_markup = InlineKeyboardMarkup(keyboard)
        await query.edit_message_text(
            "🔗 **Subscribe to Blockchain Proof Notifications**\n\n"
            "Choose your subscription type:\n\n"
            "👤 **All Provers:** Get notifications from any prover address\n"
            "🎯 **Specific Prover:** Filter notifications by a specific prover address\n\n"
            "You can change this setting later using commands.",
            reply_markup=reply_markup,
            parse_mode='Markdown'
        )
    
    elif query.data == 'subscribe_all_provers':
        # Subscribe to all provers (no filter)
        chat_id = query.message.chat_id
        user_id = query.from_user.id
        username = query.from_user.username or f"user_{user_id}"
        
        try:
            backend_url = os.getenv('BACKEND_URL', 'http://localhost:8000')
            subscriber_data = {
                "chat_id": chat_id,
                "user_id": user_id,
                "username": username,
                "notify_successful_proofs": True,
                "notify_failed_proofs": False,
                "prover_filter": None  # No filter
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(f"{backend_url}/subscribers/", json=subscriber_data) as response:
                    if response.status == 200:
                        logger.info(f"Subscriber saved to backend (all provers): {chat_id}")
                        
                        # Update local cache
                        if proof_subscribers is None:
                            proof_subscribers = {}
                        
                        proof_subscribers[chat_id] = {
                            'user_id': user_id,
                            'username': username,
                            'subscribed_at': asyncio.get_event_loop().time(),
                            'notify_successful_proofs': True,
                            'notify_failed_proofs': False,
                            'prover_filter': None
                        }
                        
                        await query.edit_message_text(
                            "✅ **Successfully subscribed to blockchain proof notifications!**\n\n"
                            "**Your Settings:**\n"
                            "• ✅ Successful proofs (enabled)\n"
                            "• ❌ Failed proofs (disabled)\n"
                            "• 👤 **All provers** (no filter)\n\n"
                            "**Commands:**\n"
                            "• Use /mystatus to see your settings\n"
                            "• Use /subscribe <address> to add prover filter\n"
                            "• Use /unsubscribe to stop notifications",
                            parse_mode='Markdown'
                        )
                    else:
                        await query.edit_message_text(
                            "❌ Failed to subscribe. Please try again later."
                        )
        except Exception as e:
            logger.error(f"Error saving subscriber (all provers): {e}")
            await query.edit_message_text(
                "❌ Failed to subscribe. Please try again later."
            )
    
    elif query.data == 'subscribe_specific_prover':
        # Ask user to enter prover address
        await query.edit_message_text(
            "🎯 **Subscribe to Specific Prover**\n\n"
            "Please send the prover address you want to monitor.\n\n"
            "**Format:** Ethereum address (42 characters)\n"
            "**Example:** `0x1234567890abcdef1234567890abcdef12345678`\n\n"
            "📝 **Next step:** Type or paste the address in the chat.\n"
            "⚠️ **Note:** Send only the address, nothing else.\n\n"
            "🔙 Use /start to go back to main menu.",
            parse_mode='Markdown'
        )
        
        # Set user state to waiting for prover address
        if not hasattr(context, 'user_data'):
            context.user_data = {}
        context.user_data['waiting_for_prover'] = True
    
    elif query.data == 'back_to_menu':
        # Go back to main menu
        keyboard = [
            [
                InlineKeyboardButton("🔗 Subscribe to Proofs", callback_data='subscribe_proofs'),
                InlineKeyboardButton("❌ Unsubscribe", callback_data='unsubscribe_proofs')
            ],
            [
                InlineKeyboardButton("📋 Check Status", callback_data='check_status')
            ]
        ]
        
        reply_markup = InlineKeyboardMarkup(keyboard)
        await query.edit_message_text(
            'Hello! I am Younggu.\n\n'
            '🔗 Subscribe to blockchain proof notifications\n'
            '📋 Check your current status',
            reply_markup=reply_markup
        )
    
    elif query.data == 'unsubscribe_proofs':
        chat_id = query.message.chat_id
        backend_url = os.getenv('BACKEND_URL', 'http://localhost:8000')
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.delete(f"{backend_url}/subscribers/{chat_id}") as response:
                    if response.status == 200:
                        logger.info(f"Subscriber removed via button: {chat_id}")
                        
                        # Remove from local cache
                        if proof_subscribers and chat_id in proof_subscribers:
                            del proof_subscribers[chat_id]
                        
                        await query.edit_message_text(
                            "❌ **Unsubscribed** from blockchain proof notifications.\n\n"
                            "🚫 You will no longer receive proof notifications.\n\n"
                            "Use the button below or /subscribe to resubscribe."
                        )
                    else:
                        await query.edit_message_text(
                            "❌ Failed to unsubscribe. You may not be subscribed."
                        )
        except Exception as e:
            logger.error(f"Error unsubscribing via button: {e}")
            await query.edit_message_text(
                "❌ Failed to unsubscribe. Please try again later."
            )
    
    elif query.data == 'check_status':
        chat_id = query.message.chat_id
        
        status_message = "📊 **Your Status:**\n\n"
        
        # Check blockchain subscription status from backend
        try:
            backend_url = os.getenv('BACKEND_URL', 'http://localhost:8000')
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{backend_url}/subscribers/{chat_id}") as response:
                    if response.status == 200:
                        subscriber = await response.json()
                        status_message += "🔗 **Blockchain Proofs:** Subscribed ✅\n"
                        status_message += f"• Successful proofs: {'✅' if subscriber['notify_successful_proofs'] else '❌'}\n"
                        status_message += f"• Failed proofs: {'✅' if subscriber['notify_failed_proofs'] else '❌'}\n"
                        status_message += f"• Prover filter: {subscriber['prover_filter'] or 'All provers'}\n"
                    else:
                        status_message += "🔗 **Blockchain Proofs:** Not subscribed ❌\n"
        except Exception as e:
            logger.error(f"Error checking status via button: {e}")
            status_message += "🔗 **Blockchain Proofs:** Status unknown ⚠️\n"
        
        await query.edit_message_text(status_message, parse_mode='Markdown')

async def handle_prover_address_input(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle prover address input from user"""
    # Check if user is waiting for prover address
    if not (hasattr(context, 'user_data') and context.user_data.get('waiting_for_prover')):
        return  # Not waiting for address input
    
    # Clear the waiting state
    context.user_data['waiting_for_prover'] = False
    
    prover_address = update.message.text.strip()
    chat_id = update.effective_chat.id
    user_id = update.effective_user.id
    username = update.effective_user.username or f"user_{user_id}"
    
    # Validate prover address
    if not prover_address.startswith('0x'):
        prover_address = f"0x{prover_address}"
    
    if len(prover_address) != 42:
        await update.message.reply_text(
            "❌ **Invalid prover address format!**\n\n"
            "Please provide a valid Ethereum address (42 characters).\n"
            "**Example:** `0x1234567890abcdef1234567890abcdef12345678`\n\n"
            "Try again by sending the correct address.",
            parse_mode='Markdown'
        )
        # Keep waiting for correct address
        context.user_data['waiting_for_prover'] = True
        return
    
    # Subscribe with specific prover filter
    try:
        backend_url = os.getenv('BACKEND_URL', 'http://localhost:8000')
        subscriber_data = {
            "chat_id": chat_id,
            "user_id": user_id,
            "username": username,
            "notify_successful_proofs": True,
            "notify_failed_proofs": False,
            "prover_filter": prover_address
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{backend_url}/subscribers/", json=subscriber_data) as response:
                if response.status == 200:
                    logger.info(f"Subscriber saved with prover filter: {chat_id} -> {prover_address}")
                    
                    # Update local cache
                    global proof_subscribers
                    if proof_subscribers is None:
                        proof_subscribers = {}
                    
                    proof_subscribers[chat_id] = {
                        'user_id': user_id,
                        'username': username,
                        'subscribed_at': asyncio.get_event_loop().time(),
                        'notify_successful_proofs': True,
                        'notify_failed_proofs': False,
                        'prover_filter': prover_address
                    }
                    
                    await update.message.reply_text(
                        "✅ **Successfully subscribed to blockchain proof notifications!**\n\n"
                        "**Your Settings:**\n"
                        "• ✅ Successful proofs (enabled)\n"
                        "• ❌ Failed proofs (disabled)\n"
                        f"• 🎯 **Specific prover:** `{prover_address}`\n\n"
                        "**Commands:**\n"
                        "• Use /mystatus to see your settings\n"
                        "• Use /subscribe to change prover filter\n"
                        "• Use /unsubscribe to stop notifications",
                        parse_mode='Markdown'
                    )
                else:
                    await update.message.reply_text(
                        "❌ Failed to subscribe. Please try again later."
                    )
    except Exception as e:
        logger.error(f"Error saving subscriber with prover filter: {e}")
        await update.message.reply_text(
            "❌ Failed to subscribe. Please try again later."
        )

# Add message handler for prover address input
async def message_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle text messages"""
    # First check if user is inputting prover address
    if hasattr(context, 'user_data') and context.user_data.get('waiting_for_prover'):
        await handle_prover_address_input(update, context)
        return
    
    # Otherwise, echo the message
    await update.message.reply_text(f"You said: {update.message.text}")

def main():
    """Start the bot."""
    # Create the Application
    application = Application.builder().token(BOT_TOKEN).build()
    
    # Add handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    
    # Blockchain proof subscription handlers
    application.add_handler(CommandHandler("subscribe", subscribe_proofs))
    application.add_handler(CommandHandler("unsubscribe", unsubscribe_proofs))
    application.add_handler(CommandHandler("mystatus", my_status))
    
    # Add the callback handler for inline keyboard buttons
    application.add_handler(CallbackQueryHandler(color_callback))
    
    # Update message handler to handle prover address input
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, message_handler))
    
    # Add error handler
    application.add_error_handler(error_handler)
    
    # Set post init callback to start monitoring
    application.post_init = post_init_callback
    
    # Run the bot
    print("Bot is starting...")
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()