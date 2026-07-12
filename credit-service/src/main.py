from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .features.consumer import start_consumer_thread
from .ml.model_loader import load_model_bundle
from .routers.credits import router as credits_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_model_bundle()  # keep the model resident in memory (perfil 5.1)
    stop_event = start_consumer_thread()
    yield
    stop_event.set()


app = FastAPI(title="credit-service", lifespan=lifespan)

# Web SPA (yapepay-web) calls this API cross-origin — bearer-token auth only,
# no cookies involved, so a permissive origin is safe here.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(credits_router)


@app.get("/health")
def health():
    return {"status": "ok"}
