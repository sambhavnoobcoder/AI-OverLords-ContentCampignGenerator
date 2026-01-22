from abc import ABC, abstractmethod
from typing import Any, Dict, Optional, Callable
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BaseAgent(ABC):
    """Base class for all AI agents in the system"""

    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.status = "idle"
        self.logger = logging.getLogger(f"Agent.{name}")
        self.message_callback: Optional[Callable] = None

    def set_message_callback(self, callback: Callable):
        """Set callback for sending status updates"""
        self.message_callback = callback

    async def send_status(self, status: str, message: str, data: Optional[Dict[str, Any]] = None):
        """Send status update via callback"""
        self.status = status
        self.logger.info(f"[{self.name}] {status}: {message}")

        if self.message_callback:
            await self.message_callback({
                "agent_name": self.name,
                "status": status,
                "message": message,
                "timestamp": datetime.now().isoformat(),
                "data": data
            })

    @abstractmethod
    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the agent's main task"""
        pass

    async def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Run the agent with error handling"""
        try:
            await self.send_status("working", f"{self.name} is starting...")
            result = await self.execute(context)
            await self.send_status("completed", f"{self.name} completed successfully")
            return result
        except Exception as e:
            self.logger.error(f"Error in {self.name}: {str(e)}", exc_info=True)
            await self.send_status("error", f"Error: {str(e)}")
            raise
