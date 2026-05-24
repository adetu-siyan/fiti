import pandas as pd
import numpy as np


def analyze_risk(
    df: pd.DataFrame,
    classifications: list,
    column_mapping: dict
) -> dict:

    risks = []

    narration_col = column_mapping.get("narration_column")
    debit_col = column_mapping.get("debit_column")
    credit_col = column_mapping.get("credit_column")
    date_col = column_mapping.get("date_column")

    total_debit = df[debit_col].fillna(0).sum() if debit_col else 0
    total_credit = df[credit_col].fillna(0).sum() if credit_col else 0
    total_rows = len(df)

    # =========================================
    # SPENDING RATIO — only flag if critically high
    # healthy range is below 85%
    # =========================================

    spending_ratio = 0

    if total_credit > 0:
        spending_ratio = total_debit / total_credit

    if spending_ratio > 0.95:
        risks.append({
            "risk": "critical_spending_ratio",
            "severity": "high",
            "message": f"You are spending {round(spending_ratio * 100, 1)}% of everything you earn, leaving almost no room for savings or emergencies."
        })
    elif spending_ratio > 0.85:
        risks.append({
            "risk": "high_spending_ratio",
            "severity": "medium",
            "message": f"You are spending {round(spending_ratio * 100, 1)}% of your income. A healthy target is below 85%."
        })

    # =========================================
    # MONTHLY SPENDING BENCHMARK
    # flag if any month exceeds 100% of that month's income
    # =========================================

    if date_col and date_col in df.columns:

        df = df.copy()
        df[date_col] = pd.to_datetime(df[date_col], errors="coerce")
        df["_month"] = df[date_col].dt.to_period("M")

        monthly = df.groupby("_month").agg(
            income=(credit_col, "sum"),
            spending=(debit_col, "sum")
        ).reset_index()

        overspent_months = monthly[monthly["spending"] > monthly["income"]]

        if len(overspent_months) > 0:
            months_list = ", ".join([str(m) for m in overspent_months["_month"].tolist()])
            risks.append({
                "risk": "overspent_months",
                "severity": "medium",
                "message": f"You spent more than you earned in {len(overspent_months)} month(s): {months_list}. This indicates a deficit in those periods."
            })

    # =========================================
    # GAMBLING — only flag if consistent pattern
    # 1-2 transactions is not a risk
    # =========================================

    gambling_keywords = [
        "bet9ja", "sportybet", "1xbet",
        "betway", "betking", "nairabet",
        "msport", "parimatch"
    ]

    gambling_transactions = []

    if narration_col and narration_col in df.columns:
        for _, row in df.iterrows():
            narration = str(row[narration_col]).lower()
            for keyword in gambling_keywords:
                if keyword in narration:
                    gambling_transactions.append(row)
                    break

    gambling_count = len(gambling_transactions)

    if gambling_count >= 5:
        gambling_total = sum(
            float(r[debit_col]) for r in gambling_transactions
            if debit_col and pd.notna(r[debit_col])
        )
        risks.append({
            "risk": "consistent_gambling_activity",
            "severity": "medium",
            "message": f"{gambling_count} gambling transactions detected totalling ₦{round(gambling_total, 2):,}. This is a consistent pattern worth reviewing."
        })

    # =========================================
    # SUSPICIOUS INCOME — large irregular credits
    # from senders not seen before
    # only flag if amount is significantly above average credit
    # =========================================

    suspicious_credits = []

    if credit_col and credit_col in df.columns and narration_col and narration_col in df.columns:

        credits = df[df[credit_col].fillna(0) > 0].copy()

        if len(credits) > 0:

            avg_credit = credits[credit_col].mean()
            std_credit = credits[credit_col].std()
            threshold = avg_credit + (3 * std_credit)

            large_credits = credits[credits[credit_col] > threshold]

            sender_counts = credits[narration_col].value_counts()
            rare_senders = sender_counts[sender_counts == 1].index

            for _, row in large_credits.iterrows():
                narration = str(row[narration_col])
                if any(s in narration for s in rare_senders):
                    suspicious_credits.append({
                        "amount": float(row[credit_col]),
                        "narration": narration[:60]
                    })

        if len(suspicious_credits) >= 2:
            risks.append({
                "risk": "unusual_large_credits",
                "severity": "medium",
                "message": f"{len(suspicious_credits)} unusually large credits detected from senders not seen before. These may warrant a closer look."
            })

    # =========================================
    # EXCESSIVE BANK FEES
    # only flag if fees exceed 5% of total spending
    # =========================================

    fee_count = 0
    fee_total = 0

    for item in classifications:
        if item.get("type") == "fee":
            fee_count += 1
            fee_total += item.get("debit", 0)

    if total_debit > 0:
        fee_ratio = fee_total / total_debit

        if fee_ratio > 0.05:
            risks.append({
                "risk": "excessive_bank_fees",
                "severity": "low",
                "message": f"Bank fees account for {round(fee_ratio * 100, 1)}% of your total spending — ₦{round(fee_total, 2):,} in charges. Consider reviewing your account type."
            })

    # =========================================
    # LARGE SINGLE TRANSACTIONS
    # only flag if a single debit exceeds 30% of monthly income
    # =========================================

    if debit_col and debit_col in df.columns and total_credit > 0:

        monthly_avg_income = total_credit / max(
            df["_month"].nunique() if "_month" in df.columns else 1, 1
        )

        large_threshold = monthly_avg_income * 0.3

        large_transactions = df[df[debit_col].fillna(0) > large_threshold]

        if len(large_transactions) > 0:
            risks.append({
                "risk": "large_single_transactions",
                "severity": "low",
                "message": f"{len(large_transactions)} transaction(s) each exceeded 30% of your average monthly income. These are worth reviewing individually."
            })

    # =========================================
    # FINAL SUMMARY
    # =========================================

    return {
        "total_risks": len(risks),
        "risks": risks,
        "spending_ratio": round(spending_ratio, 2),
        "gambling_transactions": gambling_count,
        "fee_transactions": fee_count,
        "fee_total": round(fee_total, 2),
        "transfer_transactions": sum(
            1 for item in classifications
            if item.get("type") == "transfer"
        )
    }