import pandas as pd


async def analyze_behavior(df, column_mapping):

    debit_column = column_mapping.get("debit_column")
    credit_column = column_mapping.get("credit_column")

    metrics = {}
    behavioral_flags = []

    # --- DEBIT ANALYSIS (Spending) ---
    if debit_column and debit_column in df.columns:

        total_spending = df[debit_column].fillna(0).sum()
        avg_spending = df[debit_column].fillna(0).mean()
        spending_count = df[debit_column].fillna(0).astype(bool).sum()

        metrics["total_spending"] = float(total_spending)
        metrics["average_spending"] = float(avg_spending)
        metrics["spending_transactions"] = int(spending_count)

        if avg_spending > 100000:
            behavioral_flags.append("High spending behavior detected")

    # --- CREDIT ANALYSIS (Income) ---
    if credit_column and credit_column in df.columns:

        total_income = df[credit_column].fillna(0).sum()
        income_count = df[credit_column].fillna(0).astype(bool).sum()

        metrics["total_income"] = float(total_income)
        metrics["income_transactions"] = int(income_count)

        # Check for negative cashflow
        total_spending = metrics.get("total_spending", 0)
        if total_income < total_spending:
            behavioral_flags.append("Potential negative cashflow pattern")

    # --- DERIVED METRICS ---
    total_income = metrics.get("total_income", 0)
    total_spending = metrics.get("total_spending", 0)

    if total_income > 0:
        metrics["spending_ratio"] = round(total_spending / total_income, 4)
    else:
        metrics["spending_ratio"] = 0.0

    metrics["net_position"] = float(total_income - total_spending)

    # --- CURRENCY ---
    currency_symbol = column_mapping.get("currency_symbol", "₦")
    metrics["currency"] = currency_symbol

    return {
        "metrics": metrics,
        "behavioral_flags": behavioral_flags
    }









# import pandas as pd


# async def analyze_behavior(
#     df,
#     column_mapping
# ):

#     insights = []

#     debit_column = column_mapping.get(
#         "debit_column"
#     )

#     credit_column = column_mapping.get(
#         "credit_column"
#     )

#     if debit_column and debit_column in df.columns:

#         total_spending = df[
#             debit_column
#         ].fillna(0).sum()

#         avg_spending = df[
#             debit_column
#         ].fillna(0).mean()

#         insights.append({
#             "metric": "total_spending",
#             "value": float(total_spending)
#         })

#         insights.append({
#             "metric": "average_spending",
#             "value": float(avg_spending)
#         })

#         if avg_spending > 100000:

#             insights.append({
#                 "behavior":
#                 "High spending behavior detected"
#             })

#     if credit_column and credit_column in df.columns:

#         total_income = df[
#             credit_column
#         ].fillna(0).sum()

#         insights.append({
#             "metric": "total_income",
#             "value": float(total_income)
#         })

#         if total_income < total_spending:

#             insights.append({
#                 "behavior":
#                 "Potential negative cashflow pattern"
#             })

#     return insights