from typing import Dict, Any, List
from .base_agent import BaseAgent
import requests
import base64
import os
from pathlib import Path


class ImageGeneratorAgent(BaseAgent):
    """Agent responsible for generating images using AI"""

    def __init__(self, hf_token: str):
        super().__init__(
            name="Image Generator",
            description="Creates visual content using AI image generation"
        )
        self.hf_token = hf_token
        self.api_url = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1"
        self.headers = {"Authorization": f"Bearer {hf_token}"}

        # Create directory for generated images
        self.output_dir = Path("generated_content/images")
        self.output_dir.mkdir(parents=True, exist_ok=True)

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate images for the campaign"""
        product_name = context.get("product_name")
        industry = context.get("industry")
        tone = context.get("tone", "professional")
        blog_posts = context.get("blog_posts", [])
        social_posts = context.get("social_posts", [])

        await self.send_status("working", "Generating campaign images...")

        images = []

        # Generate hero image for main campaign
        hero_prompt = f"professional {tone} marketing banner for {product_name} in {industry} industry, high quality, modern, clean design, 4k"
        hero_image = await self._generate_image(hero_prompt, "campaign_hero")

        if hero_image:
            images.append({
                "type": "image",
                "title": "Campaign Hero Image",
                "content": hero_prompt,
                "image_url": hero_image,
                "platform": "general",
                "metadata": {"purpose": "hero", "prompt": hero_prompt}
            })

        # Generate blog header images
        for i, post in enumerate(blog_posts[:2], 1):
            await self.send_status("working", f"Generating blog image {i}...")
            prompt = f"blog header image for article about {product_name}, {tone} style, modern, professional, relevant to {post.get('title', '')[:100]}"
            image_url = await self._generate_image(prompt, f"blog_{i}")

            if image_url:
                images.append({
                    "type": "image",
                    "title": f"Blog Header {i}",
                    "content": prompt,
                    "image_url": image_url,
                    "platform": "blog",
                    "metadata": {"purpose": "blog_header", "prompt": prompt}
                })

        # Generate social media images
        for i in range(min(3, len(social_posts))):
            await self.send_status("working", f"Generating social media image {i+1}...")
            platform = social_posts[i].get("platform", "social")
            prompt = f"social media post image for {product_name}, {tone} style, engaging, eye-catching, {platform} format"
            image_url = await self._generate_image(prompt, f"social_{i+1}")

            if image_url:
                images.append({
                    "type": "image",
                    "title": f"Social Media Image {i+1}",
                    "content": prompt,
                    "image_url": image_url,
                    "platform": platform,
                    "metadata": {"purpose": "social_post", "prompt": prompt}
                })

        await self.send_status("completed", f"Generated {len(images)} images")

        return {
            "images": images
        }

    async def _generate_image(self, prompt: str, filename: str) -> str:
        """Generate a single image using HuggingFace API"""
        try:
            response = requests.post(
                self.api_url,
                headers=self.headers,
                json={"inputs": prompt},
                timeout=60
            )

            if response.status_code == 200:
                image_path = self.output_dir / f"{filename}.png"
                with open(image_path, "wb") as f:
                    f.write(response.content)

                return str(image_path)
            else:
                self.logger.error(f"Image generation failed: {response.status_code} - {response.text}")
                return self._create_placeholder_image(filename)

        except Exception as e:
            self.logger.error(f"Error generating image: {e}")
            return self._create_placeholder_image(filename)

    def _create_placeholder_image(self, filename: str) -> str:
        """Create a placeholder for failed image generation"""
        placeholder_path = self.output_dir / f"{filename}_placeholder.txt"
        with open(placeholder_path, "w") as f:
            f.write("Image placeholder - Generation in progress or failed")
        return str(placeholder_path)
