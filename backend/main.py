from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Dict, Any
import uvicorn
import os
import json
import uuid
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

from models.campaign import CampaignRequest, CampaignResult, AgentMessage
from agents.orchestrator import CampaignOrchestrator

# Load environment variables
load_dotenv()

app = FastAPI(
    title="AI Content Marketing Campaign Generator",
    description="Multi-agent AI system for automated content marketing campaigns",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure directories exist
Path("generated_content/images").mkdir(parents=True, exist_ok=True)

# Serve generated content
if os.path.exists("generated_content"):
    app.mount("/generated", StaticFiles(directory="generated_content"), name="generated")

# In-memory storage for campaigns (use database in production)
campaigns_db: Dict[str, CampaignResult] = {}

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, campaign_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[campaign_id] = websocket

    def disconnect(self, campaign_id: str):
        if campaign_id in self.active_connections:
            del self.active_connections[campaign_id]

    async def send_message(self, campaign_id: str, message: dict):
        if campaign_id in self.active_connections:
            try:
                await self.active_connections[campaign_id].send_json(message)
            except Exception as e:
                print(f"Error sending message: {e}")

manager = ConnectionManager()


@app.get("/")
async def root():
    return {
        "message": "AI Content Marketing Campaign Generator API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.post("/api/campaigns", response_model=dict)
async def create_campaign(request: CampaignRequest):
    """Create a new marketing campaign"""
    campaign_id = str(uuid.uuid4())

    # Initialize campaign in database
    campaigns_db[campaign_id] = CampaignResult(
        campaign_id=campaign_id,
        status="pending",
        agent_logs=[],
        content_pieces=[]
    )

    return {
        "campaign_id": campaign_id,
        "status": "created",
        "message": "Campaign created successfully. Connect to WebSocket for real-time updates."
    }


@app.websocket("/ws/{campaign_id}")
async def websocket_endpoint(websocket: WebSocket, campaign_id: str):
    """WebSocket endpoint for real-time campaign generation updates"""
    await manager.connect(campaign_id, websocket)

    try:
        # Wait for start command
        data = await websocket.receive_json()

        if data.get("action") == "start":
            campaign_request = data.get("campaign_request")

            # Initialize orchestrator
            google_api_key = os.getenv("GOOGLE_API_KEY")
            hf_token = os.getenv("HF_TOKEN")

            if not google_api_key:
                await manager.send_message(campaign_id, {
                    "type": "error",
                    "message": "GOOGLE_API_KEY not configured"
                })
                return

            orchestrator = CampaignOrchestrator(google_api_key, hf_token or "")

            # Set up callback for agent updates
            async def message_callback(message: dict):
                # Store in database
                campaigns_db[campaign_id].agent_logs.append(AgentMessage(**message))

                # Send to WebSocket
                await manager.send_message(campaign_id, {
                    "type": "agent_update",
                    "data": message
                })

            orchestrator.set_message_callback(message_callback)

            # Run campaign
            await manager.send_message(campaign_id, {
                "type": "status",
                "message": "Campaign generation started..."
            })

            result = await orchestrator.run_campaign(campaign_request)

            # Update database
            campaigns_db[campaign_id].status = result.get("status", "completed")
            campaigns_db[campaign_id].research = result.get("research")
            campaigns_db[campaign_id].strategy = result.get("strategy")
            campaigns_db[campaign_id].content_pieces = result.get("content_pieces", [])
            campaigns_db[campaign_id].completed_at = datetime.now()

            # Send completion message
            await manager.send_message(campaign_id, {
                "type": "completed",
                "data": {
                    "campaign_id": campaign_id,
                    "status": result.get("status"),
                    "content_count": len(result.get("content_pieces", []))
                }
            })

    except WebSocketDisconnect:
        manager.disconnect(campaign_id)
    except Exception as e:
        await manager.send_message(campaign_id, {
            "type": "error",
            "message": str(e)
        })
        manager.disconnect(campaign_id)


@app.get("/api/campaigns/{campaign_id}", response_model=CampaignResult)
async def get_campaign(campaign_id: str):
    """Get campaign details and results"""
    if campaign_id not in campaigns_db:
        raise HTTPException(status_code=404, detail="Campaign not found")

    return campaigns_db[campaign_id]


@app.get("/api/campaigns")
async def list_campaigns():
    """List all campaigns"""
    return {
        "campaigns": [
            {
                "campaign_id": cid,
                "status": campaign.status,
                "created_at": campaign.created_at.isoformat(),
                "content_count": len(campaign.content_pieces)
            }
            for cid, campaign in campaigns_db.items()
        ]
    }


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=os.getenv("DEBUG", "True").lower() == "true"
    )
