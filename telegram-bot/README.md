# YoungguRuPiKad Bot

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Python](https://img.shields.io/badge/Python-3.8+-blue?logo=python)](https://www.python.org/) [![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688?logo=fastapi)](https://fastapi.tiangolo.com/) [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-336791?logo=postgresql)](https://www.postgresql.org/) [![Web3.py](https://img.shields.io/badge/Web3.py-7.12.1-orange?logo=ethereum)](https://web3py.readthedocs.io/) [![Telegram Bot](https://img.shields.io/badge/Telegram-Bot-26A5E4?logo=telegram)](https://python-telegram-bot.org/) [![Docker](https://img.shields.io/badge/Docker-Required-2496ED?logo=docker)](https://www.docker.com/)

A comprehensive Python application featuring a FastAPI backend, PostgreSQL database, blockchain indexer, and Telegram bot integration.

## Architecture

- **Backend**: FastAPI REST API
- **Database**: PostgreSQL
- **Blockchain Indexer**: Web3.py for blockchain data indexing
- **Bot Interface**: Python Telegram Bot with inline keyboards and callback handlers
- **Language**: Python

## Prerequisites

- Python 3.8+
- Docker and Docker Compose
- Virtual environment support
- Telegram account for bot creation

## Bot Setup

### Creating a Telegram Bot

Before running the application, you need to create a Telegram bot:

1. **Start a chat with BotFather**
   - Open Telegram and search for `@BotFather`
   - Start a conversation with the official BotFather bot

2. **Create a new bot**
   ```
   /newbot
   ```
   - Follow the prompts to choose a name for your bot
   - Choose a username ending in 'bot' (e.g., `MyAwesomeBot` or `my_awesome_bot`)

3. **Get your bot token**
   - BotFather will provide you with a token that looks like: `123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ`
   - Copy this token and add it to your `.env` file as `BOT_TOKEN`

4. **Optional: Configure bot settings**
   - Set bot description: `/setdescription`
   - Set bot commands: `/setcommands`
   - Set bot profile picture: `/setuserpic`

**Important**: Keep your bot token secure and never share it publicly.

## Setup Instructions

### Step 0: Environment Setup

Activate the existing virtual environment and install dependencies:

```bash
# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 1: Start Database

Launch PostgreSQL database using Docker Compose:

```bash
docker compose up -d
```

This will start the PostgreSQL database in the background. Ensure your `docker-compose.yml` file is properly configured with the database settings.

### Step 2: Start Backend

Launch the FastAPI backend server:

```bash
python run_backend.py
```

The API will be available at `http://localhost:8000` (or your configured port). You can access the interactive API documentation at `http://localhost:8000/docs`.

### Step 3: Start Indexer

Start the blockchain indexer service:

```bash
python run_indexer.py
```

This service will connect to the blockchain using Web3.py and index relevant data to your PostgreSQL database.

### Step 4: Start Telegram Bot

Launch the Telegram bot:

```bash
python main.py
```

The bot will start polling for messages and handle user interactions through inline keyboards and callback queries.

## Project Structure

```
├── main.py                     # Telegram bot entry point
├── run_backend.py              # FastAPI backend entry point
├── run_indexer.py              # Blockchain indexer entry point
├── requirements.txt            # Python dependencies
├── docker-compose.yml          # Database configuration
└── README.md                   # This file
```

## Key Dependencies

- `fastapi` - Modern web framework for building APIs
- `psycopg2-binary` or `asyncpg` - PostgreSQL adapter
- `web3` - Ethereum blockchain interaction
- `python-telegram-bot` - Telegram Bot API wrapper
- `uvicorn` - ASGI server for FastAPI

## 🌍 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Telegram Bot
BOT_TOKEN=1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZ

# Database
DATABASE_URL=postgresql://user:password@localhost/monitoring_db

# Backend API  
BACKEND_URL=http://localhost:8000

# Blockchain Configuration
WS_URL=ws://<your-ws-ip>:8546 # or from 3rd party like Infura, Alchemy and etc.
EVENT_TOPIC=0xcb731dfd85e1a025f90a463b31542bd88af8dea99606a7cc7b18675780fe17af
CONTRACT_ADDRESS=0xbF5b256525a6bC77D878cA530b795F1720Dfb5b5
FROM_BLOCK=8830554

# WebSocket Server
WEBSOCKET_HOST=localhost
WEBSOCKET_PORT=8765
```

## Usage

1. Users interact with the Telegram bot
2. Bot processes commands and callback queries
3. Backend API handles business logic and database operations
4. Indexer continuously syncs blockchain data
5. All components communicate through the shared PostgreSQL database

## Troubleshooting

- Ensure Docker is running before starting the database
- Check that all environment variables are properly set
- Verify that the required ports are not in use by other services
- Check logs for each component if issues arise

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**⚡ Built with passion by the YoungGuRuPikad team**