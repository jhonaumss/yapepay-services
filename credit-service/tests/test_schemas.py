import pytest
from pydantic import ValidationError

from src.schemas import CreditApplication


def _base_kwargs(**overrides):
    kwargs = dict(
        age=30,
        educationLevel="UNIVERSITARIO",
        employmentStatus="DEPENDIENTE",
        monthlyIncome=2000,
        employmentYears=3,
        requestedAmount=1000,
        termMonths=12,
    )
    kwargs.update(overrides)
    return kwargs


def test_valid_application_with_employment_years():
    CreditApplication(**_base_kwargs())


def test_employment_years_required_unless_unemployed():
    kwargs = _base_kwargs()
    del kwargs["employmentYears"]
    with pytest.raises(ValidationError):
        CreditApplication(**kwargs)


def test_desempleado_does_not_require_employment_years():
    kwargs = _base_kwargs(employmentStatus="DESEMPLEADO")
    del kwargs["employmentYears"]
    CreditApplication(**kwargs)


@pytest.mark.parametrize("age", [17, 76])
def test_age_out_of_range_rejected(age):
    with pytest.raises(ValidationError):
        CreditApplication(**_base_kwargs(age=age))


@pytest.mark.parametrize("term_months", [2, 37])
def test_term_months_out_of_range_rejected(term_months):
    with pytest.raises(ValidationError):
        CreditApplication(**_base_kwargs(termMonths=term_months))


def test_term_over_age_cap_rejected():
    with pytest.raises(ValidationError):
        CreditApplication(**_base_kwargs(age=75, termMonths=36))


def test_term_within_age_cap_accepted():
    CreditApplication(**_base_kwargs(age=75, termMonths=12))


def test_defaults_for_optional_financial_fields():
    app = CreditApplication(**_base_kwargs())
    assert app.existing_debt == 0
    assert app.monthly_debt_payments == 0
    assert app.had_previous_default is False
    assert app.estimated_assets_value == 0
