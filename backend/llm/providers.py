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
# BEDROCK CLIENT
# =========================================

bedrock_client = boto3.client(
    service_name="bedrock-runtime",
    region_name=AWS_REGION,
    aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY")
)