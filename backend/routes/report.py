from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
import pandas as pd
import tempfile
import os
import json

from slowapi import Limiter
from slowapi.util import get_remote_address

from backend.services.schema_detector import detect_schema
from backend.services.eda import run_eda
from backend.services.report_narrative import generate_narrative
from backend.services.risk_engine import analyze_risk
from backend.services.behavior_analyzer import analyze_behavior
from backend.routes.analysis import read_excel_safe

router  = APIRouter()
limiter = Limiter(key_func=get_remote_address)

ALLOWED_EXTENSIONS  = {"csv", "xlsx"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10MB


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


@router.post("/generate")
@limiter.limit("5/minute")
async def generate_report(
    request:         Request,
    file:            UploadFile = File(...),
    classifications: str        = Form(...),
    column_mapping:  str        = Form(...)
):

    temp_path = None

    try:

        content = await file.read()
        validate_upload(file, content)

        try:
            classifications_list = json.loads(classifications)
            column_mapping_dict  = json.loads(column_mapping)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=400,
                detail="Invalid classifications or column mapping data."
            )

        currency = column_mapping_dict.get("currency_symbol", "₦")
        filename = file.filename
        suffix   = ".xlsx" if filename.endswith(".xlsx") else ".csv"

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(content)
            temp_path = temp_file.name

        if filename.endswith(".csv"):
            df = pd.read_csv(temp_path)
        elif filename.endswith(".xlsx"):
            df = read_excel_safe(temp_path)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type.")

        eda               = run_eda(df, classifications_list, column_mapping_dict)
        risk_analysis     = analyze_risk(df, classifications_list, column_mapping_dict)
        behavior_analysis = await analyze_behavior(df, column_mapping_dict)

        report = await generate_narrative(
            eda,
            risk_analysis,
            behavior_analysis,
            currency
        )

        return {
            "status": "success",
            "report": {
                **report,
                "risk_analysis":     risk_analysis,
                "behavior_analysis": behavior_analysis
            }
        }

    except HTTPException:
        raise

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="Report generation failed. Please try again."
        )

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)





# import pandas as pd
# import tempfile
# import os
# import json

# from backend.services.schema_detector import detect_schema
# from backend.services.eda import run_eda
# from backend.services.report_narrative import generate_narrative
# from backend.services.risk_engine import analyze_risk
# from backend.services.behavior_analyzer import analyze_behavior
# from backend.routes.analysis import read_excel_safe

# router = APIRouter()


# @router.post("/generate")
# async def generate_report(
#     file: UploadFile = File(...),
#     classifications: str = Form(...),
#     column_mapping: str = Form(...)
# ):

#     temp_path = None

#     try:

#         classifications_list = json.loads(classifications)
#         column_mapping_dict = json.loads(column_mapping)
#         currency = column_mapping_dict.get("currency_symbol", "₦")

#         filename = file.filename
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

#         eda = run_eda(df, classifications_list, column_mapping_dict)

#         risk_analysis = analyze_risk(df, classifications_list, column_mapping_dict)

#         behavior_analysis = await analyze_behavior(df, column_mapping_dict)

#         report = await generate_narrative(
#             eda,
#             risk_analysis,
#             behavior_analysis,
#             currency
#         )

#         return {
#             "status": "success",
#             "report": {
#                 **report,
#                 "risk_analysis": risk_analysis,
#                 "behavior_analysis": behavior_analysis
#             }
#         }

#     except Exception as e:
#         return {"error": str(e)}

#     finally:
#         if temp_path and os.path.exists(temp_path):
#             os.remove(temp_path)