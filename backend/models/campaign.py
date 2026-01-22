from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class AgentStatus(str, Enum):
    IDLE = "idle"
    THINKING = "thinking"
    WORKING = "working"
    COMPLETED = "completed"
    ERROR = "error"


class ContentType(str, Enum):
    BLOG_POST = "blog_post"
    SOCIAL_MEDIA = "social_media"
    EMAIL = "email"
    IMAGE = "image"


class CampaignRequest(BaseModel):
    product_name: str = Field(..., description="Name of the product or service")
    target_audience: str = Field(..., description="Description of target audience")
    tone: str = Field(default="professional", description="Tone of content (professional, casual, friendly, etc.)")
    industry: str = Field(..., description="Industry or niche")
    key_features: List[str] = Field(default_factory=list, description="Key features or benefits")
    campaign_goals: List[str] = Field(default_factory=list, description="Campaign objectives")
    platforms: List[str] = Field(default=["blog", "twitter", "linkedin", "instagram"], description="Target platforms")


class AgentMessage(BaseModel):
    agent_name: str
    status: AgentStatus
    message: str
    timestamp: datetime = Field(default_factory=datetime.now)
    data: Optional[Dict[str, Any]] = None


class ContentPiece(BaseModel):
    type: ContentType
    title: str
    content: str
    platform: Optional[str] = None
    image_url: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class ResearchInsights(BaseModel):
    market_trends: List[str]
    competitor_analysis: List[str]
    keywords: List[str]
    content_gaps: List[str]


class ContentStrategy(BaseModel):
    themes: List[str]
    content_pillars: List[str]
    posting_schedule: Dict[str, List[str]]
    key_messages: List[str]


class CampaignResult(BaseModel):
    campaign_id: str
    status: str
    research: Optional[ResearchInsights] = None
    strategy: Optional[ContentStrategy] = None
    content_pieces: List[ContentPiece] = Field(default_factory=list)
    agent_logs: List[AgentMessage] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None
