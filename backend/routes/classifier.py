from fastapi import APIRouter, UploadFile, File, HTTPException, Request
import pandas as pd
import tempfile
import os
import traceback

from slowapi import Limiter
from slowapi.util import get_remote_address

from backend.services.schema_detector import detect_schema
from backend.services.transaction_classifier import classify_router
from backend.services.risk_engine import analyze_risk
from backend.services.behavior_analyzer import analyze_behavior
from backend.services.insight_generator import generate_insights
from backend.services.report_generator import generate_report
from backend.routes.analysis import read_excel_safe

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

ALLOWED_EXTENSIONS = {"csv", "xlsx"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024


def validate_upload(file: UploadFile, content: bytes):

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only CSV and Excel files are accepted."
        )

    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail="File too large. Maximum size is 10MB."
        )

    safe_name = os.path.basename(file.filename)

    if safe_name != file.filename:
        raise HTTPException(
            status_code=400,
            detail="Invalid filename."
        )


@router.post("/classify")
@limiter.limit("10/minute")
async def classify_statement(
    request: Request,
    file: UploadFile = File(...)
):

    temp_path = None

    try:

        print("STEP 1: Reading uploaded file")

        content = await file.read()

        validate_upload(file, content)

        filename = file.filename
        suffix = ".xlsx" if filename.endswith(".xlsx") else ".csv"

        print(f"STEP 2: Creating temp file -> {filename}")

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(content)
            temp_path = temp_file.name

        print("STEP 3: Loading dataframe")

        if filename.endswith(".csv"):
            df = pd.read_csv(temp_path)

        elif filename.endswith(".xlsx"):
            df = read_excel_safe(temp_path)

        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type."
            )

        print(f"STEP 4: Dataframe loaded ({len(df)} rows)")

        print("STEP 5: Detecting schema")
        column_mapping = await detect_schema(list(df.columns))

        print("STEP 6: Running classifier")
        classifications = await classify_router(df, column_mapping)

        print("STEP 7: Running risk analysis")
        risk_analysis = analyze_risk(
            df,
            classifications,
            column_mapping
        )

        print("STEP 8: Running behavior analysis")
        behavior_analysis = await analyze_behavior(
            df,
            column_mapping
        )

        currency = column_mapping.get(
            "currency_symbol",
            "₦"
        )

        print("STEP 9: Generating AI insights")
        ai_insights = await generate_insights(
            behavior_analysis,
            risk_analysis,
            currency
        )

        print("STEP 10: Generating report")
        final_report = generate_report(
            behavior_analysis,
            classifications,
            risk_analysis,
            ai_insights,
            column_mapping
        )

        print("STEP 11: Success")

        return {
            "filename": filename,
            "rows_processed": len(df),
            "column_mapping": column_mapping,
            "classifications": classifications,
            "report": final_report
        }

    except HTTPException:
        raise

    except Exception as e:

        print("\n" + "=" * 80)
        print("FITI CLASSIFICATION ERROR")
        print("=" * 80)

        traceback.print_exc()

        print("=" * 80)
        print(f"ERROR TYPE: {type(e).__name__}")
        print(f"ERROR MESSAGE: {str(e)}")
        print("=" * 80 + "\n")

        raise HTTPException(
            status_code=500,
            detail={
                "error": str(e),
                "type": type(e).__name__
            }
        )

    finally:

        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass




# from fastapi import APIRouter, UploadFile, File, HTTPException, Request
# import pandas as pd
# import tempfile
# import os

# from slowapi import Limiter
# from slowapi.util import get_remote_address

# from backend.services.schema_detector import detect_schema
# from backend.services.transaction_classifier import classify_router
# from backend.services.risk_engine import analyze_risk
# from backend.services.behavior_analyzer import analyze_behavior
# from backend.services.insight_generator import generate_insights
# from backend.services.report_generator import generate_report
# from backend.routes.analysis import read_excel_safe

# router  = APIRouter()
# limiter = Limiter(key_func=get_remote_address)

# ALLOWED_EXTENSIONS  = {"csv", "xlsx"}
# MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10MB


# def validate_upload(file: UploadFile, content: bytes):

#     ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
#     if ext not in ALLOWED_EXTENSIONS:
#         raise HTTPException(
#             status_code=400,
#             detail="Invalid file type. Only CSV and Excel files are accepted."
#         )

#     if len(content) > MAX_FILE_SIZE_BYTES:
#         raise HTTPException(
#             status_code=413,
#             detail="File too large. Maximum size is 10MB."
#         )

#     safe_name = os.path.basename(file.filename)
#     if safe_name != file.filename:
#         raise HTTPException(
#             status_code=400,
#             detail="Invalid filename."
#         )


# @router.post("/classify")
# @limiter.limit("10/minute")
# async def classify_statement(request: Request, file: UploadFile = File(...)):

#     temp_path = None

#     try:

#         content = await file.read()
#         validate_upload(file, content)

#         filename = file.filename
#         suffix   = ".xlsx" if filename.endswith(".xlsx") else ".csv"

#         with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
#             temp_file.write(content)
#             temp_path = temp_file.name

#         if filename.endswith(".csv"):
#             df = pd.read_csv(temp_path)
#         elif filename.endswith(".xlsx"):
#             df = read_excel_safe(temp_path)
#         else:
#             raise HTTPException(status_code=400, detail="Unsupported file type.")

#         column_mapping    = await detect_schema(list(df.columns))
#         currency          = column_mapping.get("currency_symbol", "₦")
#         classifications   = await classify_router(df, column_mapping)
#         risk_analysis     = analyze_risk(df, classifications, column_mapping)
#         behavior_analysis = await analyze_behavior(df, column_mapping)
#         ai_insights       = await generate_insights(behavior_analysis, risk_analysis, currency)
#         final_report      = generate_report(
#             behavior_analysis,
#             classifications,
#             risk_analysis,
#             ai_insights,
#             column_mapping
#         )

#         return {
#             "filename":        filename,
#             "rows_processed":  len(df),
#             "column_mapping":  column_mapping,
#             "classifications": classifications,
#             "report":          final_report
#         }

#     except HTTPException:
#         raise

#     except Exception:
#         raise HTTPException(
#             status_code=500,
#             detail="Analysis failed. Please check your file and try again."
#         )

#     finally:
#         if temp_path and os.path.exists(temp_path):
#             os.remove(temp_path)


















# from fastapi import APIRouter, UploadFile, File
# import pandas as pd
# import tempfile
# import os

# from backend.services.schema_detector import detect_schema
# from backend.services.transaction_classifier import classify_router
# from backend.services.risk_engine import analyze_risk
# from backend.services.behavior_analyzer import analyze_behavior
# from backend.services.insight_generator import generate_insights
# from backend.services.report_generator import generate_report
# from backend.routes.analysis import read_excel_safe

# router = APIRouter()


# @router.post("/classify")
# async def classify_statement(file: UploadFile = File(...)):

#     filename = file.filename
#     temp_path = None

#     try:

#         suffix = ".xlsx" if filename.endswith(".xlsx") else ".csv"

#         with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
#             content = await file.read()
#             temp_file.write(content)
#             temp_path = temp_file.name

#         if filename.endswith(".csv"):
#             df = pd.read_csv(temp_path)
#         elif filename.endswith(".xlsx"):
#             df = read_excel_safe(temp_path)
#         else:
#             return {"error": "Unsupported file type"}

#         column_mapping  = await detect_schema(list(df.columns))
#         currency        = column_mapping.get("currency_symbol", "₦")
#         classifications = await classify_router(df, column_mapping)
#         risk_analysis   = analyze_risk(df, classifications, column_mapping)
#         behavior_analysis = await analyze_behavior(df, column_mapping)
#         ai_insights     = await generate_insights(behavior_analysis, risk_analysis, currency)
#         final_report    = generate_report(
#             behavior_analysis,
#             classifications,
#             risk_analysis,
#             ai_insights,
#             column_mapping
#         )

#         return {
#             "filename":       filename,
#             "rows_processed": len(df),
#             "column_mapping": column_mapping,
#             "classifications": classifications,
#             "report":         final_report
#         }

#     except Exception as e:
#         return {"error": str(e)}

#     finally:
#         if temp_path and os.path.exists(temp_path):
#             os.remove(temp_path)





            


# from fastapi import APIRouter, UploadFile, File
# import pandas as pd
# import tempfile
# import os

# from backend.services.schema_detector import detect_schema
# from backend.services.transaction_classifier import classify_router
# from backend.services.risk_engine import analyze_risk
# from backend.services.behavior_analyzer import analyze_behavior
# from backend.services.insight_generator import generate_insights
# from backend.services.report_generator import generate_report
# from backend.routes.analysis import read_excel_safe

# router = APIRouter()


# @router.post("/classify")
# async def classify_statement(file: UploadFile = File(...)):

#     filename = file.filename
#     temp_path = None

#     try:

#         suffix = ".xlsx" if filename.endswith(".xlsx") else ".csv"

#         with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
#             content = await file.read()
#             temp_file.write(content)
#             temp_path = temp_file.name

#         if filename.endswith(".csv"):
#             df = pd.read_csv(temp_path)
#         elif filename.endswith(".xlsx"):
#             df = read_excel_safe(temp_path)
#         else:
#             return {"error": "Unsupported file type"}

#         column_mapping = await detect_schema(list(df.columns))

#         currency = column_mapping.get("currency_symbol", "₦")

#         classifications = await classify_router(df, column_mapping)

#         risk_analysis = analyze_risk(df, classifications, column_mapping)

#         behavior_analysis = await analyze_behavior(df, column_mapping)

#         ai_insights = await generate_insights(
#             behavior_analysis,
#             risk_analysis,
#             currency
#         )

#         final_report = generate_report(
#             behavior_analysis,
#             classifications,
#             risk_analysis,
#             ai_insights,
#             column_mapping
#         )

#         return {
#             "filename": filename,
#             "rows_processed": len(df),
#             "column_mapping": column_mapping,
#             "classifications": classifications,
#             "report": final_report
#         }

#     except Exception as e:
#         return {"error": str(e)}

#     finally:
#         if temp_path and os.path.exists(temp_path):
#             os.remove(temp_path)



















# from fastapi import (
#     APIRouter,
#     UploadFile,
#     File
# )

# import pandas as pd
# import tempfile
# import os

# from backend.services.schema_detector import (
#     detect_schema
# )

# from backend.services.transaction_classifier import (
#     classify_router
# )

# from backend.routes.analysis import (
#     read_excel_safe
# )

# from backend.services.risk_engine import (
#     analyze_risk
# )

# from backend.services.behavior_analyzer import (
#     analyze_behavior
# )

# from backend.services.insight_generator import (
#     generate_insights
# )

# from backend.services.report_generator import (
#     generate_report
# )


# router = APIRouter()


# # ==========================================
# # CLASSIFICATION ROUTE
# # ==========================================

# @router.post("/classify")

# async def classify_statement(
#     file: UploadFile = File(...)
# ):

#     filename = file.filename

#     temp_path = None

#     try:

#         # ==========================================
#         # SAVE TEMP FILE
#         # ==========================================

#         suffix = (
#             ".xlsx"
#             if filename.endswith(".xlsx")
#             else ".csv"
#         )

#         with tempfile.NamedTemporaryFile(
#             delete=False,
#             suffix=suffix
#         ) as temp_file:

#             content = await file.read()

#             temp_file.write(content)

#             temp_path = temp_file.name

#         # ==========================================
#         # READ FILE
#         # ==========================================

#         if filename.endswith(".csv"):

#             df = pd.read_csv(temp_path)

#         elif filename.endswith(".xlsx"):

#             df = read_excel_safe(temp_path)

#         else:

#             return {
#                 "error": "Unsupported file type"
#             }

#         # ==========================================
#         # DETECT SCHEMA
#         # ==========================================

#         column_mapping = await detect_schema(
#             list(df.columns)
#         )

#         # ==========================================
#         # TRANSACTION CLASSIFICATION
#         # ==========================================

#         classifications = await classify_router(
#             df,
#             column_mapping
#         )

#         # ==========================================
#         # RISK ANALYSIS
#         # ==========================================

#         risk_analysis = analyze_risk(
#             df,
#             classifications,
#             column_mapping
#         )

#         # ==========================================
#         # BEHAVIOR ANALYSIS
#         # ==========================================

#         behavior_analysis = analyze_behavior(
#             df,
#             column_mapping
#         )

#         # ==========================================
#         # AI INSIGHT GENERATION
#         # ==========================================

#         ai_insights = await generate_insights(
#             behavior_analysis,
#             risk_analysis
#         )

#         # ==========================================
#         # FINAL REPORT GENERATION
#         # ==========================================

#         final_report = generate_report(

#             behavior_analysis,

#             classifications,

#             risk_analysis,

#             ai_insights
#         )

#         # ==========================================
#         # FINAL RESPONSE
#         # ==========================================

#         return {

#             "filename": filename,

#             "rows_processed": len(df),

#             "column_mapping": column_mapping,

#             "report": final_report
#         }

#     except Exception as e:

#         return {
#             "error": str(e)
#         }

#     finally:

#         if (
#             temp_path
#             and
#             os.path.exists(temp_path)
#         ):

#             os.remove(temp_path)







# from fastapi import APIRouter, UploadFile, File
# import pandas as pd
# import tempfile
# import os

# from backend.services.schema_detector import detect_schema
# from backend.services.transaction_classifier import classify_router
# from backend.routes.analysis import read_excel_safe
# from backend.services.insight_generator import (
#     generate_insights
# )

# from backend.services.report_generator import (
#     generate_report
# )

# from backend.services.behavior_analyzer import (
#     analyze_behavior
# )

# router = APIRouter()


# # =========================
# # CLASSIFICATION ROUTE
# # =========================

# @router.post("/classify")

# async def classify_statement(
#     file: UploadFile = File(...)
# ):

#     filename = file.filename

#     temp_path = None

#     try:

#         # =========================
#         # SAVE TEMP FILE
#         # =========================

#         suffix = (
#             ".xlsx"
#             if filename.endswith(".xlsx")
#             else ".csv"
#         )

#         with tempfile.NamedTemporaryFile(
#             delete=False,
#             suffix=suffix
#         ) as temp_file:

#             content = await file.read()

#             temp_file.write(content)

#             temp_path = temp_file.name

#         # =========================
#         # READ FILE
#         # =========================

#         if filename.endswith(".csv"):

#             df = pd.read_csv(temp_path)

#         elif filename.endswith(".xlsx"):

#             df = read_excel_safe(temp_path)

#         else:

#             return {
#                 "error": "Unsupported file type"
#             }

#         # =========================
#         # DETECT SCHEMA
#         # =========================

#         column_mapping = await detect_schema(
#             list(df.columns)
#         )

#         # =========================
#         # CLASSIFY TRANSACTIONS
#         # =========================

#         classifications = await classify_router(
#             df,
#             column_mapping
#         )

#         # =========================
#         # RESPONSE
#         # =========================

#         return {

#             "filename": filename,

#             "rows_classified": len(classifications),

#             "column_mapping": column_mapping,

#             "classifications": classifications
#         }

#     except Exception as e:

#         return {
#             "error": str(e)
#         }

#     finally:

#         if temp_path and os.path.exists(temp_path):

#             os.remove(temp_path)