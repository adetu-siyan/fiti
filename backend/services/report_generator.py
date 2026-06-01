from datetime import datetime


def generate_report(
    behavior_analysis: dict,
    classifications: list,
    risk_analysis: dict,
    ai_insights: dict,
    column_mapping: dict
):

    metrics = behavior_analysis.get("metrics", {})

    total_income = metrics.get("total_income", 0)
    total_spending = metrics.get("total_spending", 0)
    average_spending = metrics.get("average_spending", 0)

    category_counts = {}

    for item in classifications:

        category = item.get("category", "Unknown").strip().title()

        category_counts[category] = (
            category_counts.get(category, 0) + 1
        )

    top_categories = sorted(
        category_counts.items(),
        key=lambda x: x[1],
        reverse=True
    )[:5]

    report = {

        "generated_at": str(datetime.now()),

        "executive_summary": {

            "currency": column_mapping.get(
                "currency_symbol", "₦"
            ),

            "total_income": round(total_income, 2),

            "total_spending": round(total_spending, 2),

            "average_spending": round(average_spending, 2),

            "spending_ratio": metrics.get(
                "spending_ratio", 0
            ),

            "total_risks": risk_analysis.get(
                "total_risks", 0
            )
        },

        "transaction_summary": {

            "top_categories": top_categories,

            "gambling_transactions": risk_analysis.get(
                "gambling_transactions", 0
            ),

            "transfer_transactions": risk_analysis.get(
                "transfer_transactions", 0
            ),

            "fee_transactions": risk_analysis.get(
                "fee_transactions", 0
            )
        },

        "risk_analysis": risk_analysis,

        "ai_insights": ai_insights.get(
            "ai_insights",
            "No AI insights generated."
        )
    }

    return report





# from datetime import datetime


# def generate_report(
#     behavior_analysis: list,
#     classifications: list,
#     risk_analysis: dict,
#     ai_insights: dict,
#     column_mapping: dict
# ):

#     total_income = 0
#     total_spending = 0
#     average_spending = 0

#     for item in behavior_analysis:

#         if item["metric"] == "total_income":
#             total_income = item["value"]

#         elif item["metric"] == "total_spending":
#             total_spending = item["value"]

#         elif item["metric"] == "average_spending":
#             average_spending = item["value"]

#     category_counts = {}

#     for item in classifications:

#         category = item.get("category", "Unknown").strip().title()

#         category_counts[category] = (
#             category_counts.get(category, 0) + 1
#         )

#     top_categories = sorted(
#         category_counts.items(),
#         key=lambda x: x[1],
#         reverse=True
#     )[:5]

#     report = {

#         "generated_at": str(datetime.now()),

#         "executive_summary": {

#             "currency": column_mapping.get(
#                 "currency_symbol", "₦"
#             ),

#             "total_income": round(total_income, 2),

#             "total_spending": round(total_spending, 2),

#             "average_spending": round(average_spending, 2),

#             "spending_ratio": risk_analysis.get(
#                 "spending_ratio", 0
#             ),

#             "total_risks": risk_analysis.get(
#                 "total_risks", 0
#             )
#         },

#         "transaction_summary": {

#             "top_categories": top_categories,

#             "gambling_transactions": risk_analysis.get(
#                 "gambling_transactions", 0
#             ),

#             "transfer_transactions": risk_analysis.get(
#                 "transfer_transactions", 0
#             ),

#             "fee_transactions": risk_analysis.get(
#                 "fee_transactions", 0
#             )
#         },

#         "risk_analysis": risk_analysis,

#         "ai_insights": ai_insights.get(
#             "ai_insights",
#             "No AI insights generated."
#         )
#     }

#     return report