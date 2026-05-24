import pandas as pd
import numpy as np
from collections import defaultdict


def run_eda(
    df: pd.DataFrame,
    classifications: list,
    column_mapping: dict
) -> dict:

    date_col = column_mapping.get("date_column")
    debit_col = column_mapping.get("debit_column")
    credit_col = column_mapping.get("credit_column")
    balance_col = column_mapping.get("balance_column")
    narration_col = column_mapping.get("narration_column")
    currency = column_mapping.get("currency_symbol", "₦")

    df = df.copy()

    # =========================================
    # PARSE DATES
    # =========================================

    if date_col and date_col in df.columns:
        df[date_col] = pd.to_datetime(df[date_col], errors="coerce")
        df["_month"] = df[date_col].dt.to_period("M").astype(str)
        df["_month_name"] = df[date_col].dt.strftime("%b %Y")
        df["_day_of_week"] = df[date_col].dt.day_name()
        df["_date_only"] = df[date_col].dt.date
        df["_quarter"] = df[date_col].dt.to_period("Q").astype(str)
        df["_year"] = df[date_col].dt.year
        df["_week_of_month"] = df[date_col].apply(
            lambda x: (x.day - 1) // 7 + 1 if pd.notna(x) else None
        )

    # =========================================
    # MONTHLY CREDITS VS DEBITS
    # =========================================

    monthly_flow = []

    if "_month_name" in df.columns:
        grouped = df.groupby("_month").agg(
            month_name=("_month_name", "first"),
            total_credit=(credit_col, "sum") if credit_col else ("_month", "count"),
            total_debit=(debit_col, "sum") if debit_col else ("_month", "count"),
        ).reset_index()

        grouped["margin"] = grouped["total_credit"] - grouped["total_debit"]

        for _, row in grouped.iterrows():
            monthly_flow.append({
                "month": row["month_name"],
                "income": round(float(row["total_credit"]), 2),
                "spending": round(float(row["total_debit"]), 2),
                "margin": round(float(row["margin"]), 2)
            })

    monthly_count = len(monthly_flow)

    # =========================================
    # SAVINGS MARGIN
    # =========================================

    savings_margin = [
        {"month": item["month"], "margin": item["margin"]}
        for item in monthly_flow
    ]

    # =========================================
    # SPENDING BY DAY OF WEEK
    # =========================================

    day_of_week_spending = []

    if "_day_of_week" in df.columns and debit_col and debit_col in df.columns:
        dow = df.groupby("_day_of_week")[debit_col].sum().reset_index()
        dow.columns = ["day", "total_spending"]
        day_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        dow["day"] = pd.Categorical(dow["day"], categories=day_order, ordered=True)
        dow = dow.sort_values("day")

        for _, row in dow.iterrows():
            day_of_week_spending.append({
                "day": row["day"],
                "total_spending": round(float(row["total_spending"]), 2)
            })

    # =========================================
    # TOP 5 SPENDING DAYS
    # =========================================

    top_spending_days = []

    if "_date_only" in df.columns and debit_col and debit_col in df.columns:
        daily_spend = df.groupby("_date_only")[debit_col].sum().reset_index()
        daily_spend.columns = ["date", "total_spending"]
        daily_spend = daily_spend.sort_values("total_spending", ascending=False).head(5)

        for _, row in daily_spend.iterrows():
            top_spending_days.append({
                "date": str(row["date"]),
                "total_spending": round(float(row["total_spending"]), 2)
            })

    # =========================================
    # TOP 5 CREDIT DAYS
    # =========================================

    top_credit_days = []

    if "_date_only" in df.columns and credit_col and credit_col in df.columns:
        daily_credit = df.groupby("_date_only")[credit_col].sum().reset_index()
        daily_credit.columns = ["date", "total_credit"]
        daily_credit = daily_credit.sort_values("total_credit", ascending=False).head(5)

        for _, row in daily_credit.iterrows():
            top_credit_days.append({
                "date": str(row["date"]),
                "total_credit": round(float(row["total_credit"]), 2)
            })

    # =========================================
    # TOP 10 LARGEST TRANSACTIONS
    # =========================================

    top_transactions = []

    if debit_col and debit_col in df.columns:
        largest = df[df[debit_col] > 0].nlargest(10, debit_col)

        for _, row in largest.iterrows():
            top_transactions.append({
                "date": str(row[date_col].date()) if date_col and pd.notna(row[date_col]) else "N/A",
                "amount": round(float(row[debit_col]), 2),
                "narration": str(row[narration_col])[:60] if narration_col and narration_col in df.columns else "N/A"
            })

    # =========================================
    # MONTH OVER MONTH CHANGE
    # =========================================

    mom_change = []

    if monthly_flow:
        for i in range(1, len(monthly_flow)):
            prev = monthly_flow[i - 1]["spending"]
            curr = monthly_flow[i]["spending"]
            change = round(((curr - prev) / prev) * 100, 2) if prev > 0 else 0
            mom_change.append({
                "month": monthly_flow[i]["month"],
                "change_percent": change
            })

    # =========================================
    # ROLLING AVERAGE — 3 months minimum
    # =========================================

    rolling_avg = []

    if monthly_count >= 3:
        spending_series = pd.Series([m["spending"] for m in monthly_flow])
        rolling = spending_series.rolling(window=3).mean()

        for i, item in enumerate(monthly_flow):
            rolling_avg.append({
                "month": item["month"],
                "spending": item["spending"],
                "rolling_avg": round(float(rolling.iloc[i]), 2) if not pd.isna(rolling.iloc[i]) else None
            })

    # =========================================
    # QUARTERLY NET POSITION
    # =========================================

    quarterly = []

    if "_quarter" in df.columns:
        q_grouped = df.groupby("_quarter").agg(
            total_credit=(credit_col, "sum") if credit_col else ("_quarter", "count"),
            total_debit=(debit_col, "sum") if debit_col else ("_quarter", "count"),
        ).reset_index()

        for _, row in q_grouped.iterrows():
            quarterly.append({
                "quarter": row["_quarter"],
                "income": round(float(row["total_credit"]), 2),
                "spending": round(float(row["total_debit"]), 2),
                "net": round(float(row["total_credit"]) - float(row["total_debit"]), 2)
            })

    # =========================================
    # ANOMALY DETECTION
    # =========================================

    anomalies = []

    if "_date_only" in df.columns and debit_col and debit_col in df.columns:
        daily_spend = df.groupby("_date_only")[debit_col].sum().reset_index()
        daily_spend.columns = ["date", "total_spending"]
        mean = daily_spend["total_spending"].mean()
        std = daily_spend["total_spending"].std()
        threshold = mean + (2 * std)
        daily_spend["is_anomaly"] = daily_spend["total_spending"] > threshold

        for _, row in daily_spend.iterrows():
            anomalies.append({
                "date": str(row["date"]),
                "total_spending": round(float(row["total_spending"]), 2),
                "is_anomaly": bool(row["is_anomaly"]),
                "threshold": round(float(threshold), 2)
            })

    # =========================================
    # CUMULATIVE CASH FLOW — area chart
    # =========================================

    cumulative_flow = []

    if "_date_only" in df.columns and debit_col and credit_col and debit_col in df.columns and credit_col in df.columns:
        daily = df.groupby("_date_only").agg(
            daily_credit=(credit_col, "sum"),
            daily_debit=(debit_col, "sum")
        ).reset_index()

        daily = daily.sort_values("_date_only")
        daily["net"] = daily["daily_credit"] - daily["daily_debit"]
        daily["cumulative"] = daily["net"].cumsum()

        for _, row in daily.iterrows():
            cumulative_flow.append({
                "date": str(row["_date_only"]),
                "cumulative": round(float(row["cumulative"]), 2),
                "daily_credit": round(float(row["daily_credit"]), 2),
                "daily_debit": round(float(row["daily_debit"]), 2)
            })

    # =========================================
    # TRANSACTION AMOUNT HISTOGRAM
    # =========================================

    histogram = []

    if debit_col and debit_col in df.columns:
        debits = df[df[debit_col] > 0][debit_col].dropna()

        if len(debits) > 0:
            bins = [0, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000, float("inf")]
            labels = ["0-500", "500-1K", "1K-2.5K", "2.5K-5K", "5K-10K", "10K-25K", "25K-50K", "50K-100K", "100K+"]
            bucketed = pd.cut(debits, bins=bins, labels=labels, right=False)
            counts = bucketed.value_counts().sort_index()

            for label, count in counts.items():
                histogram.append({
                    "range": str(label),
                    "count": int(count)
                })

    # =========================================
    # HEATMAP — spending by day of week x week of month
    # =========================================

    heatmap = []

    if "_day_of_week" in df.columns and "_week_of_month" in df.columns and debit_col and debit_col in df.columns:
        hm = df.groupby(["_day_of_week", "_week_of_month"])[debit_col].sum().reset_index()
        hm.columns = ["day", "week", "total_spending"]

        day_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

        for _, row in hm.iterrows():
            if row["week"] is not None:
                heatmap.append({
                    "day": str(row["day"]),
                    "week": f"Week {int(row['week'])}",
                    "total_spending": round(float(row["total_spending"]), 2)
                })

    # =========================================
    # RECURRING TRANSACTIONS
    # =========================================

    recurring_transactions = []

    if narration_col and narration_col in df.columns and debit_col and debit_col in df.columns:
        narration_groups = df[df[debit_col] > 0].groupby(narration_col).agg(
            count=(debit_col, "count"),
            avg_amount=(debit_col, "mean"),
            total_amount=(debit_col, "sum")
        ).reset_index()

        recurring = narration_groups[narration_groups["count"] >= 2].sort_values(
            "total_amount", ascending=False
        ).head(10)

        for _, row in recurring.iterrows():
            recurring_transactions.append({
                "narration": str(row[narration_col])[:60],
                "count": int(row["count"]),
                "avg_amount": round(float(row["avg_amount"]), 2),
                "total_amount": round(float(row["total_amount"]), 2)
            })

    # =========================================
    # YEAR OVER YEAR — 12+ months only
    # =========================================

    year_over_year = []

    if monthly_count >= 12 and "_year" in df.columns:
        yearly = df.groupby("_year").agg(
            total_credit=(credit_col, "sum") if credit_col else ("_year", "count"),
            total_debit=(debit_col, "sum") if debit_col else ("_year", "count"),
        ).reset_index()

        for _, row in yearly.iterrows():
            year_over_year.append({
                "year": str(int(row["_year"])),
                "income": round(float(row["total_credit"]), 2),
                "spending": round(float(row["total_debit"]), 2),
                "net": round(float(row["total_credit"]) - float(row["total_debit"]), 2)
            })

    # =========================================
    # SEASONAL PATTERNS — 12+ months only
    # =========================================

    seasonal_patterns = []

    if monthly_count >= 12 and "_month_name" in df.columns:
        df["_month_num"] = df[date_col].dt.month if date_col and date_col in df.columns else None

        if "_month_num" in df.columns:
            seasonal = df.groupby("_month_num").agg(
                avg_spending=(debit_col, "mean") if debit_col else ("_month_num", "count"),
                avg_income=(credit_col, "mean") if credit_col else ("_month_num", "count"),
            ).reset_index()

            month_names = {
                1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr",
                5: "May", 6: "Jun", 7: "Jul", 8: "Aug",
                9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec"
            }

            for _, row in seasonal.iterrows():
                seasonal_patterns.append({
                    "month": month_names.get(int(row["_month_num"]), str(row["_month_num"])),
                    "avg_spending": round(float(row["avg_spending"]), 2),
                    "avg_income": round(float(row["avg_income"]), 2)
                })

    # =========================================
    # BALANCE TREND — if balance column exists
    # =========================================

    balance_trend = []

    if balance_col and balance_col in df.columns and date_col and date_col in df.columns:
        bal_df = df[[date_col, balance_col]].dropna()
        bal_df = bal_df.sort_values(date_col)

        for _, row in bal_df.iterrows():
            balance_trend.append({
                "date": str(row[date_col].date()) if pd.notna(row[date_col]) else "N/A",
                "balance": round(float(row[balance_col]), 2)
            })

    # =========================================
    # CATEGORY BREAKDOWN FROM CLASSIFICATIONS
    # =========================================

    category_counts = defaultdict(float)
    type_counts = defaultdict(int)
    fee_breakdown = defaultdict(float)

    for item in classifications:
        category = item.get("category", "Other")
        tx_type = item.get("type", "expense")
        debit = item.get("debit", 0)

        category_counts[category] += debit
        type_counts[tx_type] += 1

        if tx_type == "fee":
            fee_breakdown[category] += debit

    category_breakdown = [
        {"category": k, "amount": round(v, 2)}
        for k, v in sorted(category_counts.items(), key=lambda x: x[1], reverse=True)
    ]

    type_distribution = [
        {"type": k, "count": v}
        for k, v in sorted(type_counts.items(), key=lambda x: x[1], reverse=True)
    ]

    bank_charges_breakdown = [
        {"category": k, "amount": round(v, 2)}
        for k, v in sorted(fee_breakdown.items(), key=lambda x: x[1], reverse=True)
    ]

    # =========================================
    # METADATA — helps narrative LLM decide
    # =========================================

    metadata = {
        "monthly_count": monthly_count,
        "has_full_year": monthly_count >= 12,
        "has_multiple_quarters": len(quarterly) >= 2,
        "has_anomalies": any(a["is_anomaly"] for a in anomalies),
        "has_recurring": len(recurring_transactions) > 0,
        "has_balance_data": len(balance_trend) > 0,
        "total_transactions": len(df),
        "date_range_days": (
            (df[date_col].max() - df[date_col].min()).days
            if date_col and date_col in df.columns and not df[date_col].isna().all()
            else 0
        )
    }

    # =========================================
    # FINAL EDA OUTPUT
    # =========================================

    return {
        "currency": currency,
        "metadata": metadata,
        "monthly_flow": monthly_flow,
        "savings_margin": savings_margin,
        "day_of_week_spending": day_of_week_spending,
        "top_spending_days": top_spending_days,
        "top_credit_days": top_credit_days,
        "top_transactions": top_transactions,
        "mom_change": mom_change,
        "rolling_avg": rolling_avg,
        "quarterly": quarterly,
        "anomalies": anomalies,
        "cumulative_flow": cumulative_flow,
        "histogram": histogram,
        "heatmap": heatmap,
        "recurring_transactions": recurring_transactions,
        "year_over_year": year_over_year,
        "seasonal_patterns": seasonal_patterns,
        "balance_trend": balance_trend,
        "category_breakdown": category_breakdown,
        "type_distribution": type_distribution,
        "bank_charges_breakdown": bank_charges_breakdown
    }