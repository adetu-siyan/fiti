import asyncio
import json
import re

import pandas as pd

from backend.llm.providers import bedrock_client
from backend.config import NOVA_PRO_MODEL


BATCH_SIZE = 100
BATCH_DELAY_SECONDS = 0
MAX_RETRIES = 3

VALID_TYPES = [
    "income",
    "expense",
    "transfer",
    "fee"
]

CATEGORY_MAP = {
    "value added tax": "VAT",
    "vat": "VAT",
    "tax": "VAT",
    "bank charge": "Bank Charge",
    "bank charges": "Bank Charge",
    "ussd charge": "Bank Charge",
    "ussd charges": "Bank Charge",
    "airtime": "Airtime",
    "data": "Data",
    "data subscription": "Data",
    "transfer": "Transfer",
    "pos": "POS Withdrawal",
    "pos withdrawal": "POS Withdrawal",
    "salary": "Salary",
    "wages": "Salary",
    "wage": "Salary",
    "betting": "Betting",
    "gambling": "Betting",
    "food": "Food",
    "transport": "Transport",
    "utilities": "Utilities",
    "shopping": "Shopping",
    "subscription": "Subscription",
    "school fees": "School Fees",
    "tuition": "School Fees",
    "rent": "Rent",
    "savings": "Savings",
}


def clean_text(value):
    if pd.isna(value):
        return ""
    return str(value).replace("\n", " ").replace("\r", " ").strip()


def normalize_category(raw: str) -> str:
    key = raw.strip().lower()
    return CATEGORY_MAP.get(key, raw.strip().title())


def invoke_nova(prompt: str) -> str:

    body = json.dumps({
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "text": prompt
                    }
                ]
            }
        ],
        "system": [
            {
                "text": (
                    "You are a precise financial AI classifier. "
                    "Return only valid JSON arrays. "
                    "No explanation. No markdown. No backticks."
                )
            }
        ],
        "inferenceConfig": {
            "temperature": 0.1,
            "maxTokens": 8000,
            "topP": 0.9
        }
    })

    response = bedrock_client.invoke_model(
        modelId=NOVA_PRO_MODEL,
        body=body,
        contentType="application/json",
        accept="application/json"
    )

    result = json.loads(response["body"].read())

    return result["output"]["message"]["content"][0]["text"]


async def classify_router(df: pd.DataFrame, column_mapping: dict) -> list:

    date_col = column_mapping.get("date_column")
    debit_col = column_mapping.get("debit_column")
    credit_col = column_mapping.get("credit_column")
    narration_col = column_mapping.get("narration_column")

    rows = []

    for _, row in df.iterrows():
        rows.append({
            "date": clean_text(row[date_col]) if date_col and date_col in df.columns else None,
            "debit": float(row[debit_col]) if debit_col and debit_col in df.columns and pd.notna(row[debit_col]) else 0.0,
            "credit": float(row[credit_col]) if credit_col and credit_col in df.columns and pd.notna(row[credit_col]) else 0.0,
            "narration": clean_text(row[narration_col]) if narration_col and narration_col in df.columns else ""
        })

    results = []

    for i in range(0, len(rows), BATCH_SIZE):
        batch = rows[i:i + BATCH_SIZE]
        print(f"Processing batch {i // BATCH_SIZE + 1}")
        classified_batch = await _classify_batch(batch)
        results.extend(classified_batch)
        await asyncio.sleep(BATCH_DELAY_SECONDS)

    return results


async def _classify_batch(batch: list) -> list:

    prompt_batch = [
        {
            "narration": item["narration"],
            "debit": item["debit"],
            "credit": item["credit"]
        }
        for item in batch
    ]

    prompt = f"""
You are an expert financial transaction classifier.

Classify every transaction below.

Return ONLY a JSON array.

Each item must contain:
- type
- category
- confidence

Allowed types:
- income
- expense
- transfer
- fee

Confidence values:
- high
- medium
- low

Transactions:
{json.dumps(prompt_batch, ensure_ascii=False)}

IMPORTANT:
- Return valid JSON array ONLY
- No markdown
- No explanations
- No comments
- Array length MUST equal {len(prompt_batch)}

Example:
[
  {{
    "type": "expense",
    "category": "Airtime",
    "confidence": "high"
  }}
]
"""

    for attempt in range(MAX_RETRIES):

        try:

            loop = asyncio.get_event_loop()
            content = await loop.run_in_executor(
                None,
                invoke_nova,
                prompt
            )

            if not content:
                raise ValueError("Empty response from model")

            cleaned = re.sub(r"```json|```", "", content).strip()

            # =========================================
            # EXTRACT LONGEST JSON ARRAY
            # =========================================

            matches = list(re.finditer(r"\[.*?\]", cleaned, re.DOTALL))

            if not matches:
                obj_match = re.search(r"\{.*\}", cleaned, re.DOTALL)
                if obj_match:
                    parsed = json.loads(obj_match.group(0))
                    classified = None
                    for value in parsed.values():
                        if isinstance(value, list):
                            classified = value
                            break
                    if classified is None:
                        raise ValueError("No array found in object")
                else:
                    raise ValueError("No JSON found")
            else:
                match_str = max(
                    matches,
                    key=lambda m: len(m.group(0))
                ).group(0)

                parsed = json.loads(match_str)

                if isinstance(parsed, dict):
                    classified = None
                    for value in parsed.values():
                        if isinstance(value, list):
                            classified = value
                            break
                    if classified is None:
                        raise ValueError("No array in dict")
                else:
                    classified = parsed

            if not isinstance(classified, list):
                raise ValueError("Response is not a list")

            if len(classified) != len(batch):
                while len(classified) < len(batch):
                    classified.append({
                        "type": "expense",
                        "category": "Other",
                        "confidence": "low"
                    })
                classified = classified[:len(batch)]

            normalized = []

            for i, item in enumerate(classified):

                tx_type = str(item.get("type", "")).lower().strip()

                if tx_type not in VALID_TYPES:
                    tx_type = "expense"

                normalized.append({
                    "type": tx_type,
                    "category": normalize_category(
                        str(item.get("category", "Other"))
                    ),
                    "confidence": str(item.get("confidence", "low")).lower(),
                    "date": batch[i]["date"],
                    "debit": batch[i]["debit"],
                    "credit": batch[i]["credit"],
                    "narration": batch[i]["narration"]
                })

            return normalized

        except Exception as e:
            print(f"Retry {attempt + 1} failed:")
            print(e)
            await asyncio.sleep(2 * (attempt + 1))

    fallback = []

    for item in batch:
        fallback.append({
            "type": "unknown",
            "category": "Unclassified",
            "confidence": "low",
            "date": item["date"],
            "debit": item["debit"],
            "credit": item["credit"],
            "narration": item["narration"]
        })

    return fallback

# import asyncio
# import json
# import re

# import pandas as pd

# from backend.llm.providers import groq_client

# from backend.config import QWEN_MODEL


# # =========================================
# # CONFIG
# # =========================================

# BATCH_SIZE = 100

# BATCH_DELAY_SECONDS = 2

# MAX_RETRIES = 3


# # =========================================
# # MAIN CLASSIFICATION ROUTER
# # =========================================

# async def classify_router(
#     df: pd.DataFrame,
#     column_mapping: dict
# ) -> list:

#     date_col = column_mapping.get(
#         "date_column"
#     )

#     debit_col = column_mapping.get(
#         "debit_column"
#     )

#     credit_col = column_mapping.get(
#         "credit_column"
#     )

#     narration_col = column_mapping.get(
#         "narration_column"
#     )

#     rows = []

#     # =========================================
#     # BUILD CLEAN TRANSACTIONS
#     # =========================================

#     for _, row in df.iterrows():

#         rows.append({

#             "date": (
#                 str(row[date_col])
#                 if date_col
#                 and date_col in df.columns
#                 else None
#             ),

#             "debit": (
#                 float(row[debit_col])
#                 if debit_col
#                 and debit_col in df.columns
#                 and pd.notna(row[debit_col])
#                 else 0.0
#             ),

#             "credit": (
#                 float(row[credit_col])
#                 if credit_col
#                 and credit_col in df.columns
#                 and pd.notna(row[credit_col])
#                 else 0.0
#             ),

#             "narration": (
#                 str(row[narration_col])
#                 if narration_col
#                 and narration_col in df.columns
#                 else ""
#             )

#         })

#     results = []

#     # =========================================
#     # PROCESS BATCHES
#     # =========================================

#     for i in range(0, len(rows), BATCH_SIZE):

#         batch = rows[i:i + BATCH_SIZE]

#         print(
#             f"Processing batch "
#             f"{i // BATCH_SIZE + 1}"
#         )

#         classified_batch = await _classify_batch(
#             batch
#         )

#         results.extend(classified_batch)

#         # =========================================
#         # RATE LIMIT PROTECTION
#         # =========================================

#         await asyncio.sleep(
#             BATCH_DELAY_SECONDS
#         )

#     return results


# # =========================================
# # SINGLE BATCH CLASSIFIER
# # =========================================

# async def _classify_batch(
#     batch: list
# ) -> list:

#     prompt = f"""
# You are an expert financial transaction classifier.

# Classify each transaction below.

# For each transaction return:

# - "type"
#     One of:
#     income
#     expense
#     fee
#     transfer

# - "category"
#     Examples:
#     Airtime
#     Salary
#     Food
#     Betting
#     POS
#     Transfer
#     Data
#     Shopping
#     Loan
#     Bank Charge

# - "confidence"
#     One of:
#     high
#     medium
#     low

# Transactions:
# {json.dumps(batch, indent=2)}

# IMPORTANT:
# - Return ONLY valid JSON
# - No markdown
# - No explanations
# - No backticks
# - Length MUST match exactly {len(batch)}

# Example:
# [
#     {{
#         "type": "expense",
#         "category": "Food",
#         "confidence": "high"
#     }}
# ]
# """

#     # =========================================
#     # RETRIES
#     # =========================================

#     for attempt in range(MAX_RETRIES):

#         try:

#             completion = (
#                 groq_client.chat.completions.create(

#                     model=QWEN_MODEL,

#                     messages=[

#                         {
#                             "role": "system",
#                             "content": (
#                                 "You are a financial "
#                                 "transaction classifier."
#                             )
#                         },

#                         {
#                             "role": "user",
#                             "content": prompt
#                         }

#                     ],

#                     temperature=0.2,

#                     max_completion_tokens=4096,

#                     top_p=0.95
#                 )
#             )

#             content = (
#                 completion
#                 .choices[0]
#                 .message
#                 .content
#             )

#             # =========================================
#             # CLEAN OUTPUT
#             # =========================================

#             cleaned = re.sub(
#                 r"```json|```",
#                 "",
#                 content
#             ).strip()

#             # =========================================
#             # EXTRACT JSON ARRAY SAFELY
#             # =========================================

#             match = re.search(
#                 r"\[.*\]",
#                 cleaned,
#                 re.DOTALL
#             )

#             if not match:

#                 raise ValueError(
#                     "No JSON array found"
#                 )

#             cleaned = match.group(0)

#             classified = json.loads(cleaned)

#             # =========================================
#             # VALIDATION
#             # =========================================

#             if (
#                 not isinstance(classified, list)
#                 or len(classified) != len(batch)
#             ):

#                 raise ValueError(
#                     "Response length mismatch"
#                 )

#             # =========================================
#             # ATTACH ORIGINAL DATA
#             # =========================================

#             for i, item in enumerate(batch):

#                 classified[i]["date"] = (
#                     item["date"]
#                 )

#                 classified[i]["debit"] = (
#                     item["debit"]
#                 )

#                 classified[i]["credit"] = (
#                     item["credit"]
#                 )

#                 classified[i]["narration"] = (
#                     item["narration"]
#                 )

#             return classified

#         except Exception as e:

#             print(
#                 f"Retry {attempt + 1} failed:"
#             )

#             print(e)

#             await asyncio.sleep(
#                 2 * (attempt + 1)
#             )

#     # =========================================
#     # FALLBACK
#     # =========================================

#     fallback = []

#     for item in batch:

#         fallback.append({

#             "type": "unknown",

#             "category": "Unclassified",

#             "confidence": "low",

#             "date": item["date"],

#             "debit": item["debit"],

#             "credit": item["credit"],

#             "narration": item["narration"]

#         })

#     return fallback
# import asyncio
# import json
# import re

# import pandas as pd

# from langchain_google_genai import ChatGoogleGenerativeAI


# from backend.llm.providers import flash_llm

# # =========================================
# # GEMINI LLM SETUP
# # =========================================

# llm = flash_llm


# # =========================================
# # CONFIG
# # =========================================

# BATCH_SIZE = 100

# BATCH_DELAY_SECONDS = 3

# MAX_RETRIES = 3


# # =========================================
# # MAIN CLASSIFICATION ROUTER
# # =========================================

# async def classify_router(
#     df: pd.DataFrame,
#     column_mapping: dict
# ) -> list:

#     date_col = column_mapping.get("date_column")

#     debit_col = column_mapping.get("debit_column")

#     credit_col = column_mapping.get("credit_column")

#     narration_col = column_mapping.get(
#         "narration_column"
#     )

#     rows = []

#     # =========================================
#     # BUILD CLEAN TRANSACTION OBJECTS
#     # =========================================

#     for _, row in df.iterrows():

#         rows.append({

#             "date": (
#                 str(row[date_col])
#                 if date_col
#                 and date_col in df.columns
#                 else None
#             ),

#             "debit": (
#                 float(row[debit_col])
#                 if debit_col
#                 and debit_col in df.columns
#                 and pd.notna(row[debit_col])
#                 else 0.0
#             ),

#             "credit": (
#                 float(row[credit_col])
#                 if credit_col
#                 and credit_col in df.columns
#                 and pd.notna(row[credit_col])
#                 else 0.0
#             ),

#             "narration": (
#                 str(row[narration_col])
#                 if narration_col
#                 and narration_col in df.columns
#                 else ""
#             )
#         })

#     results = []

#     # =========================================
#     # PROCESS IN BATCHES
#     # =========================================

#     for i in range(0, len(rows), BATCH_SIZE):

#         batch = rows[i:i + BATCH_SIZE]

#         print(
#             f"Processing batch "
#             f"{i // BATCH_SIZE + 1}"
#         )

#         classified_batch = await _classify_batch(
#             batch
#         )

#         results.extend(classified_batch)

#         # =========================================
#         # RATE LIMIT PROTECTION
#         # =========================================

#         await asyncio.sleep(
#             BATCH_DELAY_SECONDS
#         )

#     return results


# # =========================================
# # SINGLE BATCH CLASSIFICATION
# # =========================================

# async def _classify_batch(
#     batch: list
# ) -> list:

#     prompt = f"""
# You are an expert financial transaction classifier.

# Classify each transaction below.

# For each transaction return:

# - "type"
#     One of:
#     income
#     expense
#     fee
#     transfer

# - "category"
#     Short label like:
#     Airtime
#     Salary
#     Food
#     Betting
#     POS
#     Transfer
#     Data
#     Shopping
#     Loan
#     Bank Charge

# - "confidence"
#     One of:
#     high
#     medium
#     low

# Transactions:
# {json.dumps(batch, indent=2)}

# IMPORTANT RULES:
# - Return JSON ONLY
# - No markdown
# - No explanation
# - No backticks
# - Length MUST match exactly {len(batch)}

# Example:
# [
#     {{
#         "type": "expense",
#         "category": "Airtime",
#         "confidence": "high"
#     }},
#     {{
#         "type": "income",
#         "category": "Salary",
#         "confidence": "high"
#     }}
# ]
# """

#     # =========================================
#     # RETRY LOGIC
#     # =========================================

#     for attempt in range(MAX_RETRIES):

#         try:

#             response = llm.invoke(prompt)

#             cleaned = response.content.strip()

#             cleaned = re.sub(
#                 r"```json|```",
#                 "",
#                 cleaned
#             ).strip()

#             classified = json.loads(cleaned)

#             if (
#                 not isinstance(classified, list)
#                 or len(classified) != len(batch)
#             ):
#                 raise ValueError(
#                     "Response length mismatch"
#                 )

#             # =========================================
#             # ATTACH ORIGINAL TRANSACTION DATA
#             # =========================================

#             for i, item in enumerate(batch):

#                 classified[i]["date"] = (
#                     item["date"]
#                 )

#                 classified[i]["debit"] = (
#                     item["debit"]
#                 )

#                 classified[i]["credit"] = (
#                     item["credit"]
#                 )

#                 classified[i]["narration"] = (
#                     item["narration"]
#                 )

#             return classified

#         except Exception as e:

#             print(
#                 f"Retry "
#                 f"{attempt + 1} failed: {e}"
#             )

#             await asyncio.sleep(
#                 2 * (attempt + 1)
#             )

#     # =========================================
#     # FALLBACK IF ALL RETRIES FAIL
#     # =========================================

#     fallback = []

#     for item in batch:

#         fallback.append({

#             "type": "unknown",

#             "category": "Unclassified",

#             "confidence": "low",

#             "date": item["date"],

#             "debit": item["debit"],

#             "credit": item["credit"],

#             "narration": item["narration"]
#         })

#     return fallback