import re

from backend.llm.providers import groq_client
from backend.config import LLAMA_70B_MODEL


async def generate_insights(
    behavior_analysis: dict,
    risk_analysis: dict,
    currency: str = "₦"
):

    metrics = behavior_analysis.get("metrics", {})
    flags = behavior_analysis.get("behavioral_flags", [])
    risks = risk_analysis.get("risks", [])

    # Build a clean string representation for the LLM
    metrics_text = "\n".join(
        f"- {k}: {currency}{v:,.2f}" if isinstance(v, (int, float)) and k != "spending_ratio" else f"- {k}: {v}"
        for k, v in metrics.items()
    )

    flags_text = "\n".join(f"- {flag}" for flag in flags) if flags else "None"
    risks_text = "\n".join(f"- {r.get('risk', 'Unknown')}: {r.get('message', '')}" for r in risks) if risks else "None"

    prompt = f"""
You are a senior fintech financial analyst writing a private financial intelligence brief.

Analyze the following financial intelligence data:

Key Metrics:
{metrics_text}

Behavioral Flags:
{flags_text}

Risk Flags:
{risks_text}

Write exactly 6 bullet points.

Requirements:
- Be human, analytical and creative in tone
- Reference actual numbers from the data
- Always use {currency} as the currency symbol — never use $ or any other symbol
- Mention important financial risks
- Mention spending behavior patterns
- Flag suspicious activity if any
- Focus on actionable intelligence
- No preamble
- No closing statement
"""

    try:

        completion = groq_client.chat.completions.create(
            model=LLAMA_70B_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        f"You are a senior AI financial analyst. "
                        f"Always use {currency} as the currency symbol. "
                        f"Return clean bullet points only. "
                        f"No preamble."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.4,
            max_completion_tokens=1200,
            top_p=0.95
        )

        content = (
            completion
            .choices[0]
            .message
            .content
        )

        cleaned = re.sub(
            r"<think>.*?</think>",
            "",
            content,
            flags=re.DOTALL
        ).strip()

        cleaned = re.sub(
            r"```markdown|```",
            "",
            cleaned
        ).strip()

        return {
            "thinking": "",
            "ai_insights": cleaned
        }

    except Exception as e:

        print("INSIGHT GENERATOR ERROR:")
        print(e)

        return {
            "thinking": "",
            "ai_insights": "AI insight generation unavailable.",
            "error": str(e)
        }







# import re

# from backend.llm.providers import groq_client
# from backend.config import LLAMA_70B_MODEL


# async def generate_insights(
#     behavior_analysis: list,
#     risk_analysis: dict,
#     currency: str = "₦"
# ):

#     prompt = f"""
# You are a senior fintech financial analyst writing a private financial intelligence brief.

# Analyze the following financial intelligence data:

# Behavior Analysis:
# {behavior_analysis}

# Risk Analysis:
# {risk_analysis}

# Write exactly 6 bullet points.

# Requirements:
# - Be human, analytical and creative in tone
# - Reference actual numbers from the data
# - Always use {currency} as the currency symbol — never use $ or any other symbol
# - Mention important financial risks
# - Mention spending behavior patterns
# - Flag suspicious activity if any
# - Focus on actionable intelligence
# - No preamble
# - No closing statement
# """

#     try:

#         completion = groq_client.chat.completions.create(

#             model=LLAMA_70B_MODEL,

#             messages=[
#                 {
#                     "role": "system",
#                     "content": (
#                         f"You are a senior AI financial analyst. "
#                         f"Always use {currency} as the currency symbol. "
#                         f"Return clean bullet points only. "
#                         f"No preamble."
#                     )
#                 },
#                 {
#                     "role": "user",
#                     "content": prompt
#                 }
#             ],

#             temperature=0.4,

#             max_completion_tokens=1200,

#             top_p=0.95
#         )

#         content = (
#             completion
#             .choices[0]
#             .message
#             .content
#         )

#         cleaned = re.sub(
#             r"<think>.*?</think>",
#             "",
#             content,
#             flags=re.DOTALL
#         ).strip()

#         cleaned = re.sub(
#             r"```markdown|```",
#             "",
#             cleaned
#         ).strip()

#         return {
#             "thinking": "",
#             "ai_insights": cleaned
#         }

#     except Exception as e:

#         print("INSIGHT GENERATOR ERROR:")
#         print(e)

#         return {
#             "thinking": "",
#             "ai_insights": "AI insight generation unavailable.",
#             "error": str(e)
#         }
    
