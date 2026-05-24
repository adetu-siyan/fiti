import pandas as pd


async def analyze_behavior(
    df,
    column_mapping
):

    insights = []

    debit_column = column_mapping.get(
        "debit_column"
    )

    credit_column = column_mapping.get(
        "credit_column"
    )

    if debit_column and debit_column in df.columns:

        total_spending = df[
            debit_column
        ].fillna(0).sum()

        avg_spending = df[
            debit_column
        ].fillna(0).mean()

        insights.append({
            "metric": "total_spending",
            "value": float(total_spending)
        })

        insights.append({
            "metric": "average_spending",
            "value": float(avg_spending)
        })

        if avg_spending > 100000:

            insights.append({
                "behavior":
                "High spending behavior detected"
            })

    if credit_column and credit_column in df.columns:

        total_income = df[
            credit_column
        ].fillna(0).sum()

        insights.append({
            "metric": "total_income",
            "value": float(total_income)
        })

        if total_income < total_spending:

            insights.append({
                "behavior":
                "Potential negative cashflow pattern"
            })

    return insights