# YapePay Services

Backend de **YapePay** — plataforma de pagos digitales P2P. Arquitectura de microservicios sobre AWS ECS Fargate + Lambda, con contrato de API generado desde modelos Smithy.

## Repositorios relacionados

| Repo | Descripción |
|------|-------------|
| [yapepay-smithy](https://github.com/jhonaumss/yapepay-smithy) | Modelos Smithy — fuente de verdad del contrato API |
| yapepay-services | Microservicios (este repo) |
| [yapepay-infra](https://github.com/jhonaumss/yapepay-infra) | Infraestructura AWS CDK |

---

## Base URL (AWS — ambiente dev)

```
http://yapepay-dev-alb-717626426.us-east-1.elb.amazonaws.com
```

Todos los endpoints de usuario requieren autenticación:
```
Authorization: Bearer <access_token>
```

---

## Arquitectura

```
Cliente
  │
  ▼
ALB  yapepay-dev-alb-717626426.us-east-1.elb.amazonaws.com
  ├── /v1/usuarios*      → user-service         (ECS Fargate, puerto 3000)
  ├── /v1/billeteras*    → wallet-service        (ECS Fargate, puerto 3000)
  ├── /v1/recargas*      → wallet-service        (ECS Fargate, puerto 3000)
  ├── /v1/transacciones* → transaction-service   (ECS Fargate, puerto 3000)
  └── /v1/qr*            → qr-handler            (Lambda Node.js 22 ARM64)

Comunicación interna (a través del mismo ALB):
  transaction-service ──► wallet-service    (débito / crédito)
  transaction-service ──► user-service      (lookup por teléfono)
  transaction-service ──► qr-service        (reclamar QR)
  transaction-service ──► SQS              (eventos de notificación)
  user-service        ──► wallet-service    (crear billetera al registrar)
  SQS ──► notification-handler (Lambda)    (procesar notificaciones)

Almacenamiento:
  RDS PostgreSQL (instancia compartida):
    yapepay_users · yapepay_wallets · yapepay_transactions · yapepay_qr

Identidad:
  AWS Cognito User Pool — autenticación y emisión de JWT

Secretos:
  AWS Secrets Manager — credenciales de base de datos (leídas en arranque)
```

---

## API Reference

### user-service — Usuarios y autenticación

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/v1/usuarios/registro` | ❌ | Registrar nuevo usuario |
| POST | `/v1/usuarios/login` | ❌ | Iniciar sesión (Cognito) |
| GET | `/v1/usuarios/me` | ✅ | Obtener perfil propio |
| PATCH | `/v1/usuarios/me` | ✅ | Actualizar nombre o email |
| GET | `/v1/usuarios/portelefono?numero=` | ❌ interno | Buscar usuario por teléfono |

### wallet-service — Billeteras y recargas

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/v1/billeteras/me` | ✅ | Consultar saldo propio |
| POST | `/v1/recargas` | ✅ | Recargar billetera |
| POST | `/v1/billeteras` | ❌ interno | Crear billetera (llamado por user-service) |
| POST | `/v1/billeteras/debito` | ❌ interno | Débito (llamado por transaction-service) |
| POST | `/v1/billeteras/credito` | ❌ interno | Crédito (llamado por transaction-service) |

### transaction-service — Transacciones

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/v1/transacciones` | ✅ | Transferencia P2P por número de teléfono |
| POST | `/v1/transacciones/qr` | ✅ | Pago con código QR |
| GET | `/v1/transacciones` | ✅ | Listar transacciones propias (paginado) |
| GET | `/v1/transacciones/:txId` | ✅ | Obtener transacción por ID |

### qr-service — Códigos QR (Lambda)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/v1/qr` | ✅ | Generar QR de cobro |
| GET | `/v1/qr/:qrId` | ✅ | Consultar QR propio |
| PATCH | `/v1/qr/:qrId/use` | ❌ interno | Marcar QR como usado (llamado por transaction-service) |

---

## Guía de uso con AWS

### Registro e inicio de sesión

```bash
BASE=http://yapepay-dev-alb-717626426.us-east-1.elb.amazonaws.com

# Registrar usuario
curl -X POST $BASE/v1/usuarios/registro \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "987654321",
    "fullName": "Juan Pérez",
    "email": "juan@example.com",
    "pinHash": "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"
  }'

# Iniciar sesión
curl -X POST $BASE/v1/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "987654321",
    "pinHash": "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"
  }'
# → { "accessToken": "eyJ...", "expiresIn": 3600, ... }

TOKEN="eyJ..."  # guardar el accessToken
```

> **PIN hash:** el campo `pinHash` es el SHA-256 hex (64 caracteres) del PIN. Se calcula en el cliente.

### Consultar saldo

```bash
curl $BASE/v1/billeteras/me \
  -H "Authorization: Bearer $TOKEN"
```

### Recargar billetera

```bash
curl -X POST $BASE/v1/recargas \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bankAccountId": "00000000-0000-4000-8000-000000000001",
    "amount": "100.00",
    "idempotencyKey": "00000000-0000-4000-8000-000000000002"
  }'
```

### Transferencia P2P

```bash
curl -X POST $BASE/v1/transacciones \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverPhone": "912345678",
    "amount": "50.00",
    "currency": "BOB",
    "description": "Pago alquiler",
    "idempotencyKey": "00000000-0000-4000-8000-000000000003"
  }'
```

### Pago por QR

**Paso 1 — Cobrador genera el QR:**

```bash
curl -X POST $BASE/v1/qr \
  -H "Authorization: Bearer $TOKEN_COBRADOR" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "75.00",
    "currency": "BOB",
    "description": "Servicio de diseño",
    "ttlMinutes": 15
  }'
# → { "qrCode": { "qrId": "abc12345-...", "qrData": "...", "used": false, ... } }
```

**Paso 2 — Pagador escanea y paga:**

```bash
curl -X POST $BASE/v1/transacciones/qr \
  -H "Authorization: Bearer $TOKEN_PAGADOR" \
  -H "Content-Type: application/json" \
  -d '{
    "qrId": "abc12345-...",
    "idempotencyKey": "00000000-0000-4000-8000-000000000004"
  }'
```

El QR queda marcado `used: true` — no puede reutilizarse. Un QR expirado o ya usado devuelve `409 Conflict`.

### Listar transacciones

```bash
# Todas las propias (sender o receiver), orden descendente por fecha
curl "$BASE/v1/transacciones" \
  -H "Authorization: Bearer $TOKEN"

# Con filtros
curl "$BASE/v1/transacciones?type=PAYMENT_QR&status=COMPLETED&pageSize=10" \
  -H "Authorization: Bearer $TOKEN"

# Página siguiente
curl "$BASE/v1/transacciones?cursor=<nextCursor>" \
  -H "Authorization: Bearer $TOKEN"
```

Parámetros de query:

| Parámetro | Valores | Descripción |
|-----------|---------|-------------|
| `type` | P2P_TRANSFER \| PAYMENT_QR \| RECHARGE \| REVERSAL | Filtrar por tipo |
| `status` | PENDING \| COMPLETED \| FAILED \| REVERSED | Filtrar por estado |
| `fromDate` | ISO 8601 | Desde fecha |
| `toDate` | ISO 8601 | Hasta fecha |
| `pageSize` | 1–50 | Tamaño de página (defecto: 20) |
| `cursor` | string | Token de paginación del response anterior |

### Obtener transacción

```bash
curl $BASE/v1/transacciones/<txId> \
  -H "Authorization: Bearer $TOKEN"
```

---

## Contratos importantes

### Formato de montos

Todos los montos son strings con exactamente dos decimales: `"100.00"`, `"75.50"`.

### Idempotencia

`POST /transacciones`, `POST /transacciones/qr` y `POST /recargas` exigen un campo `idempotencyKey` (UUID v4). Reenviar la misma key devuelve el resultado original sin procesar la operación dos veces.

### QR sin monto fijo

Si el QR se generó sin `amount`, el pago QR retorna `400` con código `QR_NO_AMOUNT`. Para pagos con monto libre, usar la transferencia P2P.

---

## CI/CD

Los despliegues se hacen exclusivamente por GitHub Actions al hacer push a `main`. No se debe desplegar localmente.

1. Build y test de cada servicio
2. Build de imagen Docker + push a ECR (`yapepay-dev-<servicio>-service:latest`)
3. `ecs update-service --force-new-deployment` por servicio

El qr-service se despliega como Lambda: build TypeScript → zip → `lambda update-function-code`.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Runtime | Node.js 22 + TypeScript |
| Framework | Express 5 |
| Contrato API | Smithy 2.0 → TypeScript SSDK |
| Base de datos | PostgreSQL (AWS RDS) |
| Mensajería | AWS SQS (Standard queue) |
| Autenticación | AWS Cognito (JWT access tokens) |
| Secretos | AWS Secrets Manager |
| Cómputo (Fargate) | ECS Fargate (256 CPU / 512 MB) |
| Cómputo (Lambda) | Lambda ARM64 128 MB, Node.js 22 |
| Enrutamiento | Application Load Balancer (path-based) |

---

## Estructura del repositorio

```
yapepay-services/
├── ssdk/                    # SDK generado desde Smithy (tipos compartidos)
├── user-service/            # Usuarios, autenticación Cognito
├── wallet-service/          # Billeteras, saldos, recargas
├── transaction-service/     # Transferencias P2P y pagos QR
└── qr-service/              # Generación y validación de QR (Lambda)
```
