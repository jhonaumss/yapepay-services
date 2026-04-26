# YapePay Services

Backend de YapePay — sistema de pagos móviles P2P. Arquitectura de microservicios generados desde modelos Smithy.

## Repositorios relacionados

| Repo | Descripción |
|------|-------------|
| [yapepay-smithy](https://github.com/jhonaumss/yapepay-smithy) | Modelos Smithy — fuente de verdad del contrato API |
| yapepay-services | Microservicios (este repo) |
| [yapepay-infra](https://github.com/jhonaumss/yapepay-infra)  | Infraestructura AWS CDK |

## Arquitectura en local

```
Cliente
    ↓
Keycloak (AuthN/AuthZ) — puerto 8080
    ↓
┌─────────────────────────────────────────┐
│           Microservicios                │
├────────────────┬────────────────────────┤
│ user-service        │ Puerto 3001       │
│ wallet-service      │ Puerto 3002       │
│ transaction-service │ Puerto 3003       │
│ qr-service          │ Puerto 3004       │
│ notification-service│ Puerto 3005       │
└────────────────┴────────────────────────┘
    ↓                    ↓
PostgreSQL (5432)    ElasticMQ (9324)
```

## Servicios

### user-service (3001)
Gestión de usuarios — registro, perfil, KYC.

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | /v1/usuarios/registro | ❌ | Registro de nuevo usuario |
| GET | /v1/usuarios/me | ✅ | Perfil del usuario autenticado |
| PATCH | /v1/usuarios/me | ✅ | Actualizar perfil |
| GET | /v1/usuarios/portelefono | ❌ interno | Buscar usuario por teléfono |

### wallet-service (3002)
Gestión de billeteras — saldo, recargas, débito/crédito.

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | /v1/billeteras/me | ✅ | Consultar saldo |
| POST | /v1/recargas | ✅ | Recargar saldo |
| POST | /v1/billeteras | ❌ interno | Crear billetera |
| POST | /v1/billeteras/debito | ❌ interno | Debitar saldo |
| POST | /v1/billeteras/credito | ❌ interno | Acreditar saldo |

### transaction-service (3003)
Transferencias P2P entre usuarios.

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | /v1/transacciones | ✅ | Crear transferencia P2P |
| GET | /v1/transacciones | ✅ | Historial paginado |
| GET | /v1/transacciones/:txId | ✅ | Detalle de transacción |

### qr-service (3004)
Generación y consulta de códigos QR de cobro.

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | /v1/qr | ✅ | Generar QR de cobro |
| GET | /v1/qr/:qrId | ✅ | Consultar estado de QR |

### notification-service (3005)
Consume eventos de SQS y envía push notifications.

- Escucha cola `yapepay-transactions`
- Procesa evento `TRANSACTION_COMPLETED`
- Envía push al remitente y receptor

## Bases de datos

| Base de datos | Servicio |
|---------------|---------|
| yapepay_users | user-service |
| yapepay_wallets | wallet-service |
| yapepay_transactions | transaction-service |
| yapepay_qr | qr-service |

## Requisitos

- Node.js 20+
- Docker
- PostgreSQL 16 (via Docker)
- Keycloak 22 (via Docker)
- ElasticMQ (via Docker)

## Levantamiento local

### 1. Infraestructura local

```bash
# PostgreSQL
docker run --name yapepay-postgres \
  -e POSTGRES_USER=yapepay \
  -e POSTGRES_PASSWORD=yapepay123 \
  -p 5432:5432 \
  -d postgres:16

# Crear bases de datos
docker exec -it yapepay-postgres psql -U yapepay -c "
CREATE DATABASE yapepay_users;
CREATE DATABASE yapepay_wallets;
CREATE DATABASE yapepay_transactions;
CREATE DATABASE yapepay_qr;
"

# Keycloak
docker run --name yapepay-keycloak \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin123 \
  -p 8080:8080 \
  -d quay.io/keycloak/keycloak:22.0.0 start-dev

# ElasticMQ (SQS local)
docker run --name yapepay-sqs \
  -p 9324:9324 \
  -d softwaremill/elasticmq-native
```

### 2. Configuración Keycloak

1. Crear realm `yapepay`
2. Crear cliente `yapepay-api` (público, OpenID Connect)
3. Agregar mapper `Audience` → `yapepay-api`
4. Crear roles: `user`, `premium_user`, `agent`, `admin`, `compliance`

### 3. Crear cola SQS

```bash
aws sqs create-queue \
  --queue-name yapepay-transactions \
  --endpoint-url http://localhost:9324 \
  --region us-east-1
```

### 4. Levantar servicios

```bash
# Instalar, migrar y levantar cada servicio
cd user-service && npm install && npm run migrate && npm run dev
cd wallet-service && npm install && npm run migrate && npm run dev
cd transaction-service && npm install && npm run migrate && npm run dev
cd qr-service && npm install && npm run migrate && npm run dev
cd notification-service && npm install && npm run dev
```

## Flujo de autenticación

```
1. POST /v1/usuarios/registro → crea usuario en BD + Keycloak
2. POST http://localhost:8080/realms/yapepay/protocol/openid-connect/token
   body: grant_type=password, client_id=yapepay-api, username, password
3. Usar access_token en header: Authorization: Bearer <token>
```

## Variables de entorno

Cada servicio requiere un archivo `.env`. Ver `.env.example` en cada carpeta.

| Variable | Descripción |
|----------|-------------|
| PORT | Puerto del servicio |
| DB_HOST | Host de PostgreSQL |
| DB_PORT | Puerto de PostgreSQL |
| DB_USER | Usuario de PostgreSQL |
| DB_PASSWORD | Contraseña de PostgreSQL |
| DB_NAME | Nombre de la base de datos |
| KEYCLOAK_URL | URL de Keycloak |
| KEYCLOAK_REALM | Realm de Keycloak |
| KEYCLOAK_CLIENT_ID | Client ID de Keycloak |
| USER_SERVICE_URL | URL del user-service (transaction-service) |
| WALLET_SERVICE_URL | URL del wallet-service (transaction-service) |
| SQS_ENDPOINT | URL del SQS endpoint |
| SQS_REGION | Región de SQS |
| SQS_QUEUE_URL | URL de la cola SQS |

## Stack tecnológico

- **Runtime:** Node.js 20 + TypeScript
- **Framework:** Express
- **API Contract:** Smithy 2.0 → TypeScript SSDK
- **Base de datos:** PostgreSQL 16
- **Cache/Idempotencia:** Redis (AWS ElastiCache en prod)
- **Mensajería:** AWS SQS
- **AuthN/AuthZ:** Keycloak 22 (OIDC + PKCE + RBAC)
- **Deploy:** AWS ECS Fargate + Lambda y otros
