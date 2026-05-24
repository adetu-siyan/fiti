import os
from dotenv import load_dotenv

load_dotenv()

# =========================================
# GROQ
# =========================================

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# =========================================
# AWS BEDROCK
# =========================================

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")

# =========================================
# MODELS — GROQ
# =========================================

QWEN_MODEL = "qwen/qwen3-32b"
LLAMA_MODEL = "llama-3.1-8b-instant"
LLAMA_70B_MODEL = "llama-3.3-70b-versatile"

# =========================================
# MODELS — BEDROCK
# =========================================

NOVA_PRO_MODEL = "amazon.nova-pro-v1:0"


