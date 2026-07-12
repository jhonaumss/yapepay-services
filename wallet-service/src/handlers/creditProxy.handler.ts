/**
 * Thin transparent proxy to credit-service (perfil 5.3 step 1: "La
 * aplicación web o wallet-service solicita una evaluación crediticia con JWT
 * válido"). The client's Authorization header is forwarded as-is —
 * credit-service independently re-validates the Cognito JWT itself (perfil
 * 5.4), wallet-service does not assert identity on its behalf.
 */
const CREDIT_SERVICE_URL = process.env.CREDIT_SERVICE_URL || "http://localhost:8000";

interface ProxyResult {
  status: number;
  body: unknown;
}

async function proxy(
  method: string,
  path: string,
  authorization: string,
  body?: unknown
): Promise<ProxyResult> {
  const res = await fetch(`${CREDIT_SERVICE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const responseBody = await res.json().catch(() => ({}));
  return { status: res.status, body: responseBody };
}

export function submitCreditApplication(authorization: string, body: unknown): Promise<ProxyResult> {
  return proxy("POST", "/v1/creditos", authorization, body);
}

export function getCreditEvaluation(authorization: string, evaluationId: string): Promise<ProxyResult> {
  return proxy("GET", `/v1/creditos/${evaluationId}`, authorization);
}

export function listCreditEvaluations(authorization: string, queryString: string): Promise<ProxyResult> {
  return proxy("GET", `/v1/creditos${queryString ? `?${queryString}` : ""}`, authorization);
}
