from backend.llm.providers import groq_client
from backend.config import QWEN_MODEL
import json
import re


async def detect_schema(columns):

    prompt = f"""
You are an elite financial schema detector.

Analyze these transaction statement columns:

{columns}

Identify the most likely columns for:

- date_column
- debit_column
- credit_column
- balance_column
- narration_column
- currency_symbol: detect from column names (e.g. "NGN" → "₦", "USD" → "$", "GBP" → "£", "EUR" → "€", "KES" → "KSh", "GHS" → "₵"). Default to "₦" if unclear.

IMPORTANT:
- Return ONLY valid JSON
- No markdown
- No backticks
- No explanations
- No comments

Example:
{{
    "date_column": "Date",
    "debit_column": "Withdrawals",
    "credit_column": "Deposits",
    "balance_column": "Balance",
    "narration_column": "Description",
    "currency_symbol": "₦"
}}
"""

    try:

        completion = groq_client.chat.completions.create(

            model=QWEN_MODEL,

            response_format={
                "type": "json_object"
            },

            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert "
                        "financial schema detector."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],

            temperature=0.1,

            max_completion_tokens=1000,

            top_p=0.9
        )

        content = (
            completion
            .choices[0]
            .message
            .content
        )

        if not content:
            raise ValueError("Empty response from model")

        cleaned = re.sub(
            r"```json|```",
            "",
            content
        ).strip()

        cleaned = re.sub(
            r"<think>.*?</think>",
            "",
            cleaned,
            flags=re.DOTALL
        ).strip()

        match = re.search(
            r"\{.*\}",
            cleaned,
            re.DOTALL
        )

        if not match:
            raise ValueError("No valid JSON object found")

        cleaned = match.group(0)

        mapping = json.loads(cleaned)

        required_keys = [
            "date_column",
            "debit_column",
            "credit_column",
            "balance_column",
            "narration_column",
            "currency_symbol"
        ]

        normalized = {}

        for key in required_keys:
            normalized[key] = mapping.get(key)

        if not normalized["currency_symbol"]:
            normalized["currency_symbol"] = "₦"

        return normalized

    except Exception as e:

        print("SCHEMA DETECTOR ERROR:")
        print(e)

        return {
            "date_column": None,
            "debit_column": None,
            "credit_column": None,
            "balance_column": None,
            "narration_column": None,
            "currency_symbol": "₦",
            "error": str(e)
        }

# from langchain_google_genai import ChatGoogleGenerativeAI
# import json

# from backend.config import (
#     GOOGLE_API_KEY,
#     GEMINI_MODEL
# )

# llm = ChatGoogleGenerativeAI(
#     model=GEMINI_MODEL,
#     google_api_key=GOOGLE_API_KEY,
#     temperature=0.2
# )


# async def detect_schema(columns):

#     prompt = f"""
#     You are an elite financial data analyst.

#     Analyze these transaction statement columns:

#     {columns}

#     Return STRICT JSON ONLY.

#     Example:

#     {{
#         "date_column": "Date",
#         "debit_column": "Withdrawals",
#         "credit_column": "Deposits",
#         "balance_column": "Balance",
#         "narration_column": "Description"
#     }}
#     """

#     response = llm.invoke(prompt)

#     cleaned = response.content.strip()

#     try:

#         mapping = json.loads(cleaned)

#     except Exception:

#         mapping = {
#             "error": "Failed to parse schema mapping",
#             "raw_response": cleaned
#         }

#     return mapping