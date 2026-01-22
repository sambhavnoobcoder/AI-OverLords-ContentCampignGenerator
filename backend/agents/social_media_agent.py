from typing import Dict, Any, List
from .base_agent import BaseAgent
import requests


class SocialMediaAgent(BaseAgent):
    """Agent responsible for creating social media content"""

    def __init__(self, hf_token: str):
        super().__init__(
            name="Social Media Specialist",
            description="Creates platform-specific social media content"
        )
        self.hf_token = hf_token
        self.api_url = "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1"
        self.headers = {"Authorization": f"Bearer {hf_token}"}

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate social media posts for different platforms"""
        strategy = context.get("strategy", {})
        research = context.get("research", {})
        product_name = context.get("product_name")
        platforms = context.get("platforms", ["twitter", "linkedin", "instagram"])
        tone = context.get("tone", "professional")
        industry = context.get("industry", "technology")
        key_features = context.get("key_features", [])

        await self.send_status("working", "Creating social media content...")

        social_posts = []

        # Platform-specific templates
        platform_templates = {
            "twitter": [
                f"🚀 Introducing {product_name}! Transform how you work in {industry}. {key_features[0] if key_features else 'Powerful features'} that make a difference. #Innovation #ProductLaunch",
                f"Why choose {product_name}? ✓ Easy to use ✓ Proven results ✓ Expert support. See the difference today! #BusinessGrowth #{industry}",
                f"Join hundreds of teams already using {product_name} to streamline their workflow. Your success story starts here. 💪 #Productivity"
            ],
            "linkedin": [
                f"Excited to announce the launch of {product_name}! 🎉\n\nWe've built a solution specifically for {industry} professionals who want to {key_features[0] if key_features else 'work smarter'}.\n\nKey highlights:\n✓ Streamlined operations\n✓ Measurable ROI\n✓ Enterprise-grade security\n\nLearn more about how {product_name} can transform your business. #Innovation #BusinessSolutions #{industry}",
                f"The future of {industry} is here. {product_name} combines cutting-edge technology with user-friendly design to deliver real business value.\n\nOur customers report:\n• 3x faster workflows\n• 50% cost savings\n• 95% user satisfaction\n\nReady to join them? #BusinessTransformation #Technology",
                f"What if you could {key_features[0] if key_features else 'revolutionize your workflow'} in just minutes?\n\nWith {product_name}, that's not a dream—it's reality. Our platform is designed for modern teams who demand excellence.\n\nDiscover the difference today. #ProductivityTools #Innovation"
            ],
            "instagram": [
                f"✨ Meet {product_name} ✨\n\nYour new favorite {industry} solution is here! Swipe to see how we're helping teams work smarter, not harder.\n\n{key_features[0] if key_features else 'Powerful features'} | Easy setup | Amazing results\n\n#Innovation #BusinessGrowth #{industry} #Productivity #Success",
                f"Behind every great team is a great tool 💼\n\n{product_name} is designed for ambitious professionals like you. From startups to enterprises, we've got you covered.\n\nTap the link in bio to start your journey! #WorkSmarter #TeamSuccess #BusinessTools",
                f"Success looks different for everyone, but the path is the same: the right tools + the right team = amazing results 🚀\n\n{product_name} is your partner in growth.\n\n#SuccessStory #BusinessSolutions #Innovation #{industry}"
            ],
            "facebook": [
                f"🎉 Big news! {product_name} is now available!\n\nWe've created something special for {industry} professionals—a tool that actually makes your work easier.\n\nWhat makes us different?\n• {key_features[0] if key_features else 'User-friendly design'}\n• Proven results\n• Dedicated support team\n\nLearn more and get started today!",
                f"Looking for a better way to {key_features[0] if key_features else 'manage your workflow'}?\n\n{product_name} is here to help! Join our growing community of successful teams who've transformed their operations.\n\nClick to see how we can help you too! 💡",
                f"Why are so many teams switching to {product_name}?\n\nBecause we focus on what matters: your success. Simple as that.\n\nReady to see the difference? Start your free trial today! #BusinessTools #{industry}"
            ]
        }

        for platform in platforms[:4]:
            if platform.lower() not in platform_templates:
                continue

            await self.send_status("working", f"Creating {platform} content...")

            posts = platform_templates[platform.lower()]
            
            for i, post_content in enumerate(posts[:3], 1):
                hashtags = [f"#{product_name.replace(' ', '')}", f"#{industry}", "#Innovation", "#Business", "#Growth"]
                
                social_posts.append({
                    "type": "social_media",
                    "title": f"{platform.capitalize()} Post {i}",
                    "content": post_content,
                    "platform": platform.lower(),
                    "metadata": {
                        "hashtags": hashtags[:3],
                        "char_count": len(post_content)
                    }
                })

        await self.send_status("completed", f"Generated {len(social_posts)} social media posts")

        return {
            "social_posts": social_posts
        }
