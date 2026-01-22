from typing import Dict, Any, Callable, Optional
from .research_agent import ResearchAgent
from .strategist_agent import StrategistAgent
from .writer_agent import WriterAgent
from .social_media_agent import SocialMediaAgent
from .image_agent import ImageGeneratorAgent
import asyncio
import logging

logger = logging.getLogger(__name__)


class CampaignOrchestrator:
    """Orchestrates the multi-agent workflow for campaign generation"""

    def __init__(self, google_api_key: str, hf_token: str):
        self.research_agent = ResearchAgent(hf_token)
        self.strategist_agent = StrategistAgent(hf_token)
        self.writer_agent = WriterAgent(hf_token)
        self.social_agent = SocialMediaAgent(hf_token)
        self.image_agent = ImageGeneratorAgent(hf_token)

        self.agents = [
            self.research_agent,
            self.strategist_agent,
            self.writer_agent,
            self.social_agent,
            self.image_agent
        ]

    def set_message_callback(self, callback: Callable):
        """Set callback for all agents to send status updates"""
        for agent in self.agents:
            agent.set_message_callback(callback)

    async def run_campaign(self, campaign_request: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the full campaign generation workflow"""
        logger.info("Starting campaign generation workflow")

        context = {
            "product_name": campaign_request.get("product_name"),
            "target_audience": campaign_request.get("target_audience"),
            "tone": campaign_request.get("tone", "professional"),
            "industry": campaign_request.get("industry"),
            "key_features": campaign_request.get("key_features", []),
            "campaign_goals": campaign_request.get("campaign_goals", []),
            "platforms": campaign_request.get("platforms", [])
        }

        results = {}

        try:
            # Phase 1: Research
            logger.info("Phase 1: Market Research")
            research_result = await self.research_agent.run(context)
            context.update(research_result)
            results.update(research_result)

            # Phase 2: Strategy
            logger.info("Phase 2: Content Strategy")
            strategy_result = await self.strategist_agent.run(context)
            context.update(strategy_result)
            results.update(strategy_result)

            # Phase 3: Content Generation (parallel)
            logger.info("Phase 3: Content Generation")
            writer_task = self.writer_agent.run(context)
            social_task = self.social_agent.run(context)

            writer_result, social_result = await asyncio.gather(
                writer_task,
                social_task,
                return_exceptions=True
            )

            if isinstance(writer_result, Exception):
                logger.error(f"Writer agent failed: {writer_result}")
                writer_result = {"blog_posts": []}
            if isinstance(social_result, Exception):
                logger.error(f"Social agent failed: {social_result}")
                social_result = {"social_posts": []}

            context.update(writer_result)
            context.update(social_result)
            results.update(writer_result)
            results.update(social_result)

            # Phase 4: Image Generation
            logger.info("Phase 4: Image Generation")
            image_result = await self.image_agent.run(context)
            results.update(image_result)

            # Compile final results
            content_pieces = []

            for post in results.get("blog_posts", []):
                content_pieces.append(post)

            for post in results.get("social_posts", []):
                content_pieces.append(post)

            for image in results.get("images", []):
                content_pieces.append(image)

            return {
                "status": "completed",
                "research": results.get("research"),
                "strategy": results.get("strategy"),
                "content_pieces": content_pieces
            }

        except Exception as e:
            logger.error(f"Campaign generation failed: {e}", exc_info=True)
            return {
                "status": "error",
                "error": str(e),
                "partial_results": results
            }
