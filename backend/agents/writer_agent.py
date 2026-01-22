from typing import Dict, Any, List
from .base_agent import BaseAgent
import requests


class WriterAgent(BaseAgent):
    """Agent responsible for creating blog posts and long-form content"""

    def __init__(self, hf_token: str):
        super().__init__(
            name="Content Writer",
            description="Creates engaging blog posts and articles"
        )
        self.hf_token = hf_token
        self.api_url = "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1"
        self.headers = {"Authorization": f"Bearer {hf_token}"}

    async def _generate_with_hf(self, prompt: str) -> str:
        """Generate content using HuggingFace API"""
        try:
            response = requests.post(
                self.api_url,
                headers=self.headers,
                json={"inputs": prompt, "parameters": {"max_new_tokens": 800, "temperature": 0.7}},
                timeout=30
            )
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    return result[0].get('generated_text', '').replace(prompt, '').strip()
            return None
        except Exception as e:
            self.logger.error(f"HF API error: {e}")
            return None

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate blog posts based on strategy"""
        strategy = context.get("strategy", {})
        research = context.get("research", {})
        product_name = context.get("product_name")
        target_audience = context.get("target_audience")
        tone = context.get("tone", "professional")
        key_features = context.get("key_features", [])
        industry = context.get("industry", "technology")

        blog_topics = strategy.get("content_types", {}).get("blog", [])

        if not blog_topics:
            blog_topics = [
                f"Introducing {product_name}: Transform Your Workflow",
                f"5 Ways {product_name} Solves Common {industry} Challenges"
            ]

        await self.send_status("working", f"Writing {len(blog_topics[:2])} blog posts...")

        blog_posts = []

        for i, topic in enumerate(blog_topics[:2], 1):
            await self.send_status("working", f"Writing blog post {i}/{min(len(blog_topics), 2)}: {topic}")

            # Generate content with HF
            prompt = f"Write a professional blog post titled '{topic}' about {product_name} for {target_audience}. Include an introduction, 3-4 main points with details, and a conclusion with call-to-action."
            
            generated_content = await self._generate_with_hf(prompt)

            if generated_content:
                content = f"# {topic}\n\n{generated_content}"
            else:
                # Fallback to template
                features_text = ', '.join(key_features[:3]) if key_features else "powerful features"
                content = f"""# {topic}

## Introduction

In today's competitive {industry} landscape, businesses need solutions that deliver real value. {product_name} is designed specifically for {target_audience}, offering {features_text} that transform how you work.

## Key Benefits

### 1. Streamlined Operations
{product_name} simplifies complex workflows, allowing your team to focus on what matters most. With intuitive design and powerful automation, you'll see immediate productivity gains.

### 2. Scalable Solution
Whether you're a small team or a growing enterprise, {product_name} scales with your needs. Our flexible architecture ensures you're never limited by your tools.

### 3. Proven Results
Join hundreds of satisfied customers who have seen measurable improvements in efficiency, cost savings, and team satisfaction. Real results from day one.

### 4. Expert Support
Our dedicated team is here to ensure your success. From onboarding to ongoing optimization, we're your partner in growth.

## Getting Started

Ready to experience the difference? {product_name} makes it easy to get started with a simple setup process and comprehensive resources.

## Conclusion

The future of {industry} is here with {product_name}. Don't let outdated processes hold you back. Discover how {product_name} can transform your operations and drive real business results.

**Get started today** and join the growing community of successful {product_name} users.
"""

            blog_posts.append({
                "type": "blog_post",
                "title": topic,
                "content": content,
                "platform": "blog",
                "metadata": {
                    "word_count": len(content.split()),
                    "estimated_read_time": f"{len(content.split()) // 200} min"
                }
            })

            await self.send_status("working", f"Completed blog post: {topic}")

        await self.send_status("completed", f"Generated {len(blog_posts)} blog posts")

        return {
            "blog_posts": blog_posts
        }
