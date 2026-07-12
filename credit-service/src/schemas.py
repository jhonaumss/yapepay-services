"""Pydantic models mirroring models/credits.smithy in yapepay-smithy.
Keep both in sync manually — this service doesn't yet consume the generated
OpenAPI spec, matching how the other Node services also hand-write their
routes against the SSDK types rather than the generated server dispatcher.
"""
from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, model_validator


class EducationLevel(str, Enum):
    SECUNDARIA = "SECUNDARIA"
    TECNICO = "TECNICO"
    UNIVERSITARIO = "UNIVERSITARIO"
    POSGRADO = "POSGRADO"


class EmploymentStatus(str, Enum):
    DEPENDIENTE = "DEPENDIENTE"
    INDEPENDIENTE = "INDEPENDIENTE"
    DESEMPLEADO = "DESEMPLEADO"


class CreditPurpose(str, Enum):
    NEGOCIO = "NEGOCIO"
    EDUCACION = "EDUCACION"
    EMERGENCIA = "EMERGENCIA"
    CONSUMO = "CONSUMO"
    OTRO = "OTRO"


class RiskCategory(str, Enum):
    BAJO = "BAJO"
    MEDIO = "MEDIO"
    ALTO = "ALTO"


class CreditDecision(str, Enum):
    APROBADO = "APROBADO"
    RECHAZADO = "RECHAZADO"


class UserSegment(str, Enum):
    NUEVO = "NUEVO"
    EN_TRANSICION = "EN_TRANSICION"
    ESTABLECIDO = "ESTABLECIDO"


class ConfidenceLevel(str, Enum):
    ALTA = "ALTA"
    MEDIA = "MEDIA"
    BAJA = "BAJA"


class FactorDirection(str, Enum):
    POSITIVO = "POSITIVO"
    NEGATIVO = "NEGATIVO"


class CreditApplication(BaseModel):
    age: int = Field(ge=18, le=75)
    education_level: EducationLevel = Field(alias="educationLevel")
    employment_status: EmploymentStatus = Field(alias="employmentStatus")
    monthly_income: float = Field(alias="monthlyIncome", gt=0)
    employment_years: Optional[float] = Field(default=None, alias="employmentYears", ge=0)

    existing_debt: float = Field(default=0, alias="existingDebt", ge=0)
    monthly_debt_payments: float = Field(default=0, alias="monthlyDebtPayments", ge=0)
    had_previous_default: bool = Field(default=False, alias="hadPreviousDefault")
    estimated_assets_value: float = Field(default=0, alias="estimatedAssetsValue", ge=0)

    requested_amount: float = Field(alias="requestedAmount", gt=0)
    term_months: int = Field(alias="termMonths", ge=3, le=36)
    purpose: Optional[CreditPurpose] = None

    model_config = {"populate_by_name": True}

    @model_validator(mode="after")
    def _employment_years_required_unless_unemployed(self):
        if self.employment_status != EmploymentStatus.DESEMPLEADO and self.employment_years is None:
            raise ValueError("employmentYears is required unless employmentStatus is DESEMPLEADO")
        return self


class ExplanationFactor(BaseModel):
    factor: str
    impact: float
    direction: FactorDirection


class CreditEvaluation(BaseModel):
    evaluation_id: UUID = Field(alias="evaluationId")
    user_id: UUID = Field(alias="userId")
    application: CreditApplication
    probability_of_default: float = Field(alias="probabilityOfDefault")
    score: int = Field(ge=0, le=1000)
    risk_category: RiskCategory = Field(alias="riskCategory")
    decision: CreditDecision
    user_segment: UserSegment = Field(alias="userSegment")
    confidence_level: ConfidenceLevel = Field(alias="confidenceLevel")
    explanation_factors: list[ExplanationFactor] = Field(alias="explanationFactors")
    model_version: str = Field(alias="modelVersion")
    created_at: datetime = Field(alias="createdAt")

    model_config = {"populate_by_name": True}


class SubmitCreditApplicationRequest(BaseModel):
    application: CreditApplication
    idempotency_key: UUID = Field(alias="idempotencyKey")

    model_config = {"populate_by_name": True}


class SubmitCreditApplicationResponse(BaseModel):
    evaluation: CreditEvaluation


class GetCreditEvaluationResponse(BaseModel):
    evaluation: CreditEvaluation


class ListCreditEvaluationsResponse(BaseModel):
    evaluations: list[CreditEvaluation]
    next_cursor: Optional[str] = Field(default=None, alias="nextCursor")
    total: int

    model_config = {"populate_by_name": True}
