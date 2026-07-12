from fastapi import APIRouter, Depends, HTTPException, Query

from ..db import repository
from ..features.feature_store import get_transactional_features
from ..middleware.auth import CurrentUser, get_current_user
from ..middleware.rate_limit import enforce_rate_limit
from ..ml.inference import evaluate
from ..ml.model_loader import load_model_bundle
from ..schemas import (
    CreditEvaluation,
    GetCreditEvaluationResponse,
    ListCreditEvaluationsResponse,
    SubmitCreditApplicationRequest,
    SubmitCreditApplicationResponse,
)

router = APIRouter(prefix="/v1/creditos", tags=["Creditos"])


def _row_to_evaluation(row: dict) -> CreditEvaluation:
    return CreditEvaluation.model_validate(
        {
            "evaluationId": row["evaluation_id"],
            "userId": row["user_id"],
            "application": row["application_json"],
            "probabilityOfDefault": row["probability_of_default"],
            "score": row["score"],
            "riskCategory": row["risk_category"],
            "decision": row["decision"],
            "userSegment": row["user_segment"],
            "confidenceLevel": row["confidence_level"],
            "explanationFactors": row["explanation_factors_json"],
            "modelVersion": row["model_version"],
            "createdAt": row["created_at"],
        }
    )


@router.post("", response_model=SubmitCreditApplicationResponse, status_code=201)
def submit_credit_application(
    body: SubmitCreditApplicationRequest,
    user: CurrentUser = Depends(get_current_user),
    _rate_limited: None = Depends(enforce_rate_limit),
):
    idempotency_key = str(body.idempotency_key)
    existing = repository.find_by_idempotency_key(user.user_id, idempotency_key)
    if existing is not None:
        return SubmitCreditApplicationResponse(evaluation=_row_to_evaluation(existing))

    transactional_features, _is_cold_start = get_transactional_features(user.user_id)
    bundle = load_model_bundle()

    application_dict = body.application.model_dump(by_alias=True, mode="json")
    try:
        result = evaluate(body.application, transactional_features, bundle)
    except Exception as exc:  # noqa: BLE001 — explainability/model failure must not block the score
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {exc}") from exc

    row = repository.insert_evaluation(
        user_id=user.user_id,
        idempotency_key=idempotency_key,
        application=application_dict,
        probability_of_default=result["probability_of_default"],
        score=result["score"],
        risk_category=result["risk_category"],
        decision=result["decision"],
        user_segment=result["user_segment"],
        confidence_level=result["confidence_level"],
        explanation_factors=[f for f in result["explanation_factors"]],
        model_version=result["model_version"],
    )
    return SubmitCreditApplicationResponse(evaluation=_row_to_evaluation(row))


@router.get("/{evaluation_id}", response_model=GetCreditEvaluationResponse)
def get_credit_evaluation(evaluation_id: str, user: CurrentUser = Depends(get_current_user)):
    row = repository.get_by_id(evaluation_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Credit evaluation not found")
    if str(row["user_id"]) != user.user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return GetCreditEvaluationResponse(evaluation=_row_to_evaluation(row))


@router.get("", response_model=ListCreditEvaluationsResponse)
def list_credit_evaluations(
    cursor: str | None = Query(default=None),
    page_size: int = Query(default=20, ge=1, le=50, alias="pageSize"),
    user: CurrentUser = Depends(get_current_user),
):
    rows, total = repository.list_by_user(user.user_id, cursor, page_size)
    next_cursor = str(rows[-1]["created_at"]) if len(rows) == page_size else None
    return ListCreditEvaluationsResponse(
        evaluations=[_row_to_evaluation(r) for r in rows],
        nextCursor=next_cursor,
        total=total,
    )
