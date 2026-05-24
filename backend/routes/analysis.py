from fastapi import APIRouter, UploadFile, File
import pandas as pd
import tempfile
import os

from backend.services.schema_detector import detect_schema
from backend.services.behavior_analyzer import analyze_behavior

router = APIRouter()


def read_excel_safe(temp_path: str) -> pd.DataFrame:
    for engine in ["calamine", "openpyxl"]:
        try:
            raw = pd.read_excel(temp_path, engine=engine, header=None)

            header_row = None
            for i, row in raw.iterrows():
                row_values = [str(v).strip().lower() for v in row.values]
                if any(v in row_values for v in ["date", "transaction type", "transaction status"]):
                    header_row = i
                    break

            if header_row is None:
                return pd.read_excel(temp_path, engine=engine)

            df = pd.read_excel(temp_path, engine=engine, header=header_row)
            df.dropna(how="all", inplace=True)
            df.dropna(axis=1, how="all", inplace=True)
            return df

        except Exception:
            continue

    raise ValueError("Could not read the uploaded Excel file.")


@router.post("/upload")
async def upload_statement(file: UploadFile = File(...)):
    filename = file.filename
    temp_path = None

    try:
        suffix = ".xlsx" if filename.endswith(".xlsx") else ".csv"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = temp_file.name

        if filename.endswith(".csv"):
            df = pd.read_csv(temp_path)
        elif filename.endswith(".xlsx"):
            df = read_excel_safe(temp_path)
        else:
            return {"error": "Unsupported file type. Please upload a .csv or .xlsx file."}

        column_mapping = await detect_schema(list(df.columns))
        behavior = await analyze_behavior(df, column_mapping)

        return {
            "filename": filename,
            "rows": len(df),
            "columns": list(df.columns),
            "schema": column_mapping,
            "behavior_analysis": behavior,
        }

    except Exception as e:
        return {"error": str(e)}

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

# from fastapi import APIRouter, UploadFile, File
# import pandas as pd
# import tempfile

# from backend.services.schema_detector import detect_schema
# from backend.services.behavior_analyzer import analyze_behavior

# router = APIRouter()


# @router.post("/upload")
# async def upload_statement(file: UploadFile = File(...)):
#     filename = file.filename

#     try:
#         # =========================
#         # SAVE TEMP FILE
#         # =========================
#         with tempfile.NamedTemporaryFile(delete=False) as temp_file:
#             content = await file.read()
#             temp_file.write(content)
#             temp_path = temp_file.name

#         # =========================
#         # READ FILE
#         # =========================
#         if filename.endswith(".csv"):
#             df = pd.read_csv(temp_path)

#         elif filename.endswith(".xlsx"):
#             # NOTE: use openpyxl unless you explicitly installed calamine
#             df = pd.read_excel(temp_path, engine="openpyxl")

#         else:
#             return {"error": "Unsupported file type"}

#         # =========================
#         # SCHEMA DETECTION
#         # =========================
#         schema = detect_schema(df)
#         column_mapping = schema.get("column_mapping", {})

#         # =========================
#         # BEHAVIOR ANALYSIS
#         # =========================
#         behavior = analyze_behavior(df, column_mapping)

#         # =========================
#         # FINAL RESPONSE
#         # =========================
#         return {
#             "filename": filename,
#             "rows": len(df),
#             "columns": list(df.columns),
#             "schema": schema,
#             "behavior_analysis": behavior,
#         }

#     except Exception as e:
#         return {"error": str(e)}