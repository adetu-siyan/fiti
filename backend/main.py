from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from backend.routes.analysis import router as analysis_router
from backend.routes.classifier import router as classifier_router
from backend.routes.report import router as report_router
from backend.routes.chat import router as chat_router


limiter = Limiter(key_func=get_remote_address)

app = FastAPI()

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://fiti-lemon.vercel.app",
    ],
    allow_credentials=False,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
)


# ==========================================
# GLOBAL ERROR HANDLER
# ==========================================

# @app.exception_handler(Exception)
# async def global_exception_handler(request: Request, exc: Exception):
#     return JSONResponse(
#         status_code=500,
#         content={"error": "An internal error occurred. Please try again."}
#     )


# ==========================================
# ROUTES
# ==========================================

app.include_router(analysis_router)

app.include_router(classifier_router)

app.include_router(
    report_router,
    prefix="/report",
    tags=["report"]
)

app.include_router(
    chat_router,
    prefix="/chat",
    tags=["chat"]
)


# ==========================================
# ROOT
# ==========================================

@app.get("/")
async def root():
    return {
        "message": "FITI AI Backend Running"
    }







# from fastapi import FastAPI, Request
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.responses import JSONResponse

# from slowapi import Limiter, _rate_limit_exceeded_handler
# from slowapi.util import get_remote_address
# from slowapi.errors import RateLimitExceeded

# from backend.routes.analysis import router as analysis_router
# from backend.routes.classifier import router as classifier_router
# from backend.routes.report import router as report_router
# from backend.routes.chat import router as chat_router


# limiter = Limiter(key_func=get_remote_address)

# app = FastAPI()

# app.state.limiter = limiter
# app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# # ==========================================
# # CORS
# # ==========================================

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173"],
#     allow_credentials=False,
#     allow_methods=["POST", "GET"],
#     allow_headers=["Content-Type"],
# )


# # ==========================================
# # GLOBAL ERROR HANDLER
# # ==========================================

# @app.exception_handler(Exception)
# async def global_exception_handler(request: Request, exc: Exception):
#     return JSONResponse(
#         status_code=500,
#         content={"error": "An internal error occurred. Please try again."}
#     )


# # ==========================================
# # ROUTES
# # ==========================================

# app.include_router(analysis_router)

# app.include_router(classifier_router)

# app.include_router(
#     report_router,
#     prefix="/report",
#     tags=["report"]
# )

# app.include_router(
#     chat_router,
#     prefix="/chat",
#     tags=["chat"]
# )


# # ==========================================
# # ROOT
# # ==========================================

# @app.get("/")
# async def root():
#     return {
#         "message": "FITI AI Backend Running"
#     }


# from fastapi import FastAPI

# from fastapi.middleware.cors import CORSMiddleware

# from backend.routes.analysis import (
#     router as analysis_router
# )

# from backend.routes.classifier import (
#     router as classifier_router
# )

# from backend.routes.report import router as report_router
# from backend.routes.chat import router as chat_router


# app = FastAPI()


# # ==========================================
# # CORS
# # ==========================================

# app.add_middleware(

#     CORSMiddleware,

#     allow_origins=["*"],

#     allow_credentials=True,

#     allow_methods=["*"],

#     allow_headers=["*"],
# )


# # ==========================================
# # ROUTES
# # ==========================================

# app.include_router(
#     analysis_router
# )

# app.include_router(
#     classifier_router
# )

# app.include_router(
#     report_router,
#     prefix="/report",
#     tags=["report"]
# )

# app.include_router(
#     chat_router,
#     prefix="/chat",
#     tags=["chat"]
# )

# # ==========================================
# # ROOT
# # ==========================================

# @app.get("/")

# async def root():

#     return {
#         "message": "FITI AI Backend Running"
    # }






# from fastapi import FastAPI


# from backend.routes.analysis import (
#     router as analysis_router
# )
# from backend.routes.classifier import (
#     router as classifier_router
# )
# app = FastAPI(
#     title="FITI"
# )


# @app.get("/")

# async def root():

#     return {
#         "message": "FITI Backend Running"
#     }


# app.include_router(
#     analysis_router,
#     prefix="/analysis",
#     tags=["analysis"]
# )
# app.include_router(
#     classifier_router,
#     prefix="/classifier",
#     tags=["classifier"]
# )