import boto3
from groq import Groq
import os

from backend.config import (
    GROQ_API_KEY,
    AWS_REGION
)

# =========================================
# GROQ CLIENT
# =========================================

groq_client = Groq(
    api_key=GROQ_API_KEY
)
# =========================================
# AZURE OPENAI CLIENT
# =========================================
from openai import AzureOpenAI
from backend.config import AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_KEY

azure_client = AzureOpenAI(
    azure_endpoint=AZURE_OPENAI_ENDPOINT,
    api_key=AZURE_OPENAI_KEY,
    api_version="2025-01-01-preview"
)

# =========================================
# BEDROCK CLIENT
# =========================================


bedrock_client = boto3.client(
    service_name="bedrock-runtime",
    region_name=AWS_REGION,
    aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY")
)