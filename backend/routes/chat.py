from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional

from backend.services.chat_service import stream_chat_with_fiti

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    conversation_history: list = []
    eda: dict = {}
    risk_analysis: dict = {}
    behavior_analysis: list = []
    currency: str = "₦"


@router.post("/message")
async def send_message(request: ChatRequest):

    return StreamingResponse(
        stream_chat_with_fiti(
            message=request.message,
            conversation_history=request.conversation_history,
            eda=request.eda,
            risk_analysis=request.risk_analysis,
            behavior_analysis=request.behavior_analysis,
            currency=request.currency
        ),
        media_type="text/plain"
    )




# from fastapi import APIRouter
# from fastapi.responses import StreamingResponse
# from pydantic import BaseModel

# from backend.services.chat_service import stream_chat_with_fiti

# router = APIRouter()


# class ChatRequest(BaseModel):
#     message: str
#     conversation_history: list
#     eda: dict
#     risk_analysis: dict
#     behavior_analysis: list
#     currency: str = "₦"


# @router.post("/message")
# async def send_message(request: ChatRequest):

#     return StreamingResponse(
#         stream_chat_with_fiti(
#             message=request.message,
#             conversation_history=request.conversation_history,
#             eda=request.eda,
#             risk_analysis=request.risk_analysis,
#             behavior_analysis=request.behavior_analysis,
#             currency=request.currency
#         ),
#         media_type="text/plain"
#     )