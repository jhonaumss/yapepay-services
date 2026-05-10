# YapePay — Architecture Diagrams

---

## 1. AWS Infrastructure

```mermaid
graph TD
    Internet((Internet))

    subgraph AWS["AWS — us-east-1"]
        subgraph VPC["VPC (public subnets — 2 AZs)"]
            ALB["Application Load Balancer\nyapepay-dev-alb"]

            subgraph ECS["ECS Fargate Cluster — yapepay-dev-cluster"]
                US["user-service\n:3000"]
                WS["wallet-service\n:3000"]
                TS["transaction-service\n:3000"]
            end

            subgraph Lambda["Lambda (VPC)"]
                QR["qr-handler\nARM64 · Node 22"]
                NH["notification-handler\nARM64 · Node 22"]
            end
        end

        subgraph Data["Data Layer"]
            RDS[("RDS PostgreSQL\nyapepay_users\nyapepay_wallets\nyapepay_transactions\nyapepay_qr")]
            SM["Secrets Manager\nDB credentials"]
        end

        subgraph Auth["Auth"]
            COG["Cognito User Pool\nregular_user · cashier_user"]
        end

        subgraph Messaging["Messaging"]
            SQS1["notificationsQueue\nStandard SQS"]
            SQS2["transactionEventsQueue\nFIFO — reserved"]
        end

        subgraph Registry["Container Registry"]
            ECR["ECR\nuser · wallet · transaction repos"]
        end

        subgraph VPCEndpoints["VPC Endpoints"]
            EP1["secretsmanager"]
            EP2["cognito-idp"]
        end
    end

    Internet --> ALB

    ALB -->|"/v1/usuarios* p=10"| US
    ALB -->|"/v1/billeteras* /v1/recargas* p=20"| WS
    ALB -->|"/v1/transacciones* p=30"| TS
    ALB -->|"/v1/qr* p=40"| QR

    US & WS & TS --> RDS
    QR --> RDS

    US --> COG
    QR --> COG

    TS --> SQS1
    SQS1 -->|"trigger batch=10"| NH

    SM --> US & WS & TS
    SM --> QR

    ECR --> US & WS & TS

    QR --> EP1
    QR --> EP2
```

---

## 2. Service Communication Map

```mermaid
graph LR
    Client(["Client\nBearer JWT"])

    subgraph Public["Public Endpoints (JWT required)"]
        REG["POST /v1/usuarios/registro"]
        LOGIN["POST /v1/usuarios/login"]
    end

    subgraph RegularUser["regular_user endpoints"]
        ME_USER["GET/PATCH /v1/usuarios/me"]
        ME_WAL["GET /v1/billeteras/me"]
        TXS["GET/POST /v1/transacciones"]
        QRS["GET/POST /v1/qr"]
    end

    subgraph CashierUser["cashier_user endpoints"]
        RECHARGE["POST /v1/recargas"]
    end

    subgraph Internal["Internal Endpoints (X-Internal-Key)"]
        CREATE_WAL["POST /v1/billeteras"]
        DEBIT["POST /v1/billeteras/debito"]
        CREDIT["POST /v1/billeteras/credito"]
        BY_PHONE["GET /v1/usuarios/portelefono"]
        USE_QR["PATCH /v1/qr/:qrId/use"]
    end

    Client --> REG & LOGIN
    Client --> ME_USER & ME_WAL & TXS & QRS
    Client --> RECHARGE

    REG -->|"internal key"| CREATE_WAL
    TXS -->|"internal key"| BY_PHONE
    TXS -->|"internal key"| DEBIT
    TXS -->|"internal key"| CREDIT
    TXS -->|"internal key"| USE_QR
```

---

## 3. User Registration Flow

```mermaid
sequenceDiagram
    actor Client
    participant US as user-service
    participant COG as Cognito
    participant DB as PostgreSQL<br/>(yapepay_users)
    participant WS as wallet-service

    Client->>US: POST /v1/usuarios/registro<br/>{phoneNumber, fullName, email, pin, role?}

    US->>COG: AdminCreateUser (SUPPRESS email)
    COG-->>US: userId (sub)
    US->>COG: AdminSetUserPassword (permanent)
    US->>COG: AdminAddUserToGroup (regular_user | cashier_user)

    US->>DB: BEGIN
    US->>DB: SELECT WHERE phoneNumber (duplicate check)
    DB-->>US: []
    US->>DB: INSERT usuario
    DB-->>US: user row
    US->>DB: COMMIT

    US->>WS: POST /v1/billeteras<br/>x-internal-key ✓
    WS->>DB: INSERT billetera (yapepay_wallets)
    DB-->>WS: wallet row
    WS-->>US: 201 wallet

    US-->>Client: 201 {user}
```

---

## 4. Login Flow

```mermaid
sequenceDiagram
    actor Client
    participant US as user-service
    participant COG as Cognito

    Client->>US: POST /v1/usuarios/login<br/>{email, pin}
    US->>COG: InitiateAuth (USER_PASSWORD_AUTH)
    COG-->>US: AccessToken · IdToken · RefreshToken · ExpiresIn
    US-->>Client: 200 {accessToken, idToken, refreshToken, expiresIn}

    Note over Client: Subsequent requests use<br/>Authorization: Bearer {accessToken}
```

---

## 5. P2P Transfer Flow

```mermaid
sequenceDiagram
    actor Sender
    participant TS as transaction-service
    participant US as user-service
    participant WS as wallet-service
    participant SQS as notificationsQueue

    Sender->>TS: POST /v1/transacciones<br/>{receiverPhone, amount, currency, idempotencyKey}<br/>Authorization: Bearer {accessToken}

    TS->>TS: Check role = regular_user
    TS->>TS: Idempotency check (transaccion table)

    TS->>US: GET /v1/usuarios/portelefono?numero=+591...<br/>x-internal-key ✓
    US-->>TS: {user: {userId: receiverId}}

    TS->>WS: POST /v1/billeteras/debito<br/>{userId: senderId, amount}<br/>x-internal-key ✓
    WS->>WS: BEGIN / FOR UPDATE<br/>Check balance ≥ amount<br/>Check daily limit ≤ 500 BOB
    WS-->>TS: 200 (debit ok)

    TS->>WS: POST /v1/billeteras/credito<br/>{userId: receiverId, amount}<br/>x-internal-key ✓
    WS-->>TS: 200 (credit ok)

    alt credit fails
        TS->>WS: POST /v1/billeteras/credito (rollback debit)<br/>{userId: senderId, amount}
    end

    TS->>TS: INSERT transaccion (P2P_TRANSFER · COMPLETED)
    TS->>SQS: publishTransactionCompleted

    TS-->>Sender: 201 {transaction}
```

---

## 6. QR Payment Flow

```mermaid
sequenceDiagram
    actor Receiver
    actor Sender
    participant QR as qr-service (Lambda)
    participant TS as transaction-service
    participant WS as wallet-service
    participant SQS as notificationsQueue

    Receiver->>QR: POST /v1/qr<br/>{amount?, currency, ttlMinutes?}<br/>Bearer {accessToken}
    QR->>QR: INSERT codigoqr (used=false, expiresAt=now+15m)
    QR-->>Receiver: 201 {qrCode: {qrId, qrData, expiresAt}}

    Note over Receiver,Sender: Receiver shares QR code with Sender

    Sender->>TS: POST /v1/transacciones/qr<br/>{qrId, idempotencyKey}<br/>Bearer {accessToken}
    TS->>TS: Check role = regular_user
    TS->>TS: Idempotency check

    TS->>QR: PATCH /v1/qr/{qrId}/use<br/>x-internal-key ✓
    QR->>QR: UPDATE codigoqr SET used=true<br/>WHERE used=false AND expiresAt>NOW()
    QR-->>TS: 200 {receiverUserId, amount, currency}

    TS->>WS: POST /v1/billeteras/debito (sender)<br/>x-internal-key ✓
    WS-->>TS: 200

    TS->>WS: POST /v1/billeteras/credito (receiver)<br/>x-internal-key ✓
    WS-->>TS: 200

    TS->>TS: INSERT transaccion (PAYMENT_QR · COMPLETED)
    TS->>SQS: publishTransactionCompleted

    TS-->>Sender: 201 {transaction}
```

---

## 7. Notification Flow

```mermaid
sequenceDiagram
    participant TS as transaction-service
    participant SQS as notificationsQueue
    participant NH as notification-handler (Lambda)

    TS->>SQS: SendMessage {txId, senderId, receiverId, amount, currency}

    SQS->>NH: Trigger (batch=10, reportBatchItemFailures)
    NH->>NH: Process each event<br/>(log / send push / email)
    NH-->>SQS: batchItemFailures: []
```

---

## 8. Role-Based Access Control

```mermaid
graph TD
    subgraph Cognito["Cognito User Pool"]
        RU["regular_user group"]
        CU["cashier_user group"]
    end

    subgraph JWT["JWT AccessToken"]
        CLAIM["cognito:groups claim"]
    end

    subgraph Middleware["Auth middleware chain"]
        AM["authMiddleware\nverify JWT · extract sub + groups\nset x-user-id · x-user-roles"]
        RM["requireRole(...)"]
        IK["requireInternalKey\nX-Internal-Key header"]
    end

    subgraph Routes["Protected Routes"]
        R1["GET/PATCH /v1/usuarios/me"]
        R2["GET /v1/billeteras/me"]
        R3["POST /v1/transacciones*"]
        R4["GET/POST /v1/qr*"]
        R5["POST /v1/recargas"]
        R6["POST /v1/billeteras\n/debito · /credito"]
        R7["GET /v1/usuarios/portelefono"]
        R8["PATCH /v1/qr/:id/use"]
    end

    RU --> CLAIM
    CU --> CLAIM
    CLAIM --> AM
    AM --> RM
    AM --> IK

    RM -->|"regular_user"| R1 & R2 & R3 & R4
    RM -->|"cashier_user"| R5
    IK -->|"service-to-service"| R6 & R7 & R8
```

---

## 9. Database Schema

```mermaid
erDiagram
    usuario {
        uuid userId PK
        varchar phoneNumber UK
        varchar fullName
        varchar email
        varchar pinHash
        varchar kycStatus
        timestamp createdAt
        timestamp updatedAt
    }

    billetera {
        uuid walletId PK
        uuid userId FK
        decimal balance
        varchar currency
        varchar status
        decimal dailySpent
        timestamp dailySpentResetAt
        timestamp updatedAt
    }

    recarga {
        uuid txId PK
        uuid userId FK
        varchar bankAccountId
        decimal amount
        varchar status
        varchar idempotencyKey UK
        timestamp createdAt
    }

    transaccion {
        uuid txId PK
        uuid senderId FK
        uuid receiverId FK
        decimal amount
        varchar currency
        varchar type
        varchar status
        text description
        varchar idempotencyKey UK
        timestamp createdAt
        timestamp completedAt
    }

    codigoqr {
        uuid qrId PK
        uuid userId FK
        decimal amount
        varchar currency
        text description
        jsonb qrData
        boolean used
        timestamp expiresAt
        timestamp createdAt
    }

    usuario ||--o{ billetera : owns
    usuario ||--o{ recarga : makes
    usuario ||--o{ transaccion : "sends"
    usuario ||--o{ transaccion : "receives"
    usuario ||--o{ codigoqr : generates
```

---

## 10. CI/CD Pipeline

```mermaid
flowchart TD
    PR["Pull Request → main"]
    PUSH["Push → main"]

    subgraph TestMatrix["test job (matrix: 4 services in parallel)"]
        T1["user-service\nnpm test"]
        T2["wallet-service\nnpm test"]
        T3["transaction-service\nnpm test"]
        T4["qr-service\nnpm test"]
    end

    subgraph Deploy["Deploy (push to main only)"]
        subgraph Fargate["fargate job (matrix)"]
            F1["docker build user-service\npush ECR → ECS update-service"]
            F2["docker build wallet-service\npush ECR → ECS update-service"]
            F3["docker build transaction-service\npush ECR → ECS update-service"]
        end
        subgraph LambdaJob["lambda job (matrix)"]
            L1["tsc + zip qr-service\nlambda update-function-code"]
            L2["tsc + zip notification-service\nlambda update-function-code"]
        end
    end

    PR --> TestMatrix
    PUSH --> TestMatrix
    TestMatrix -->|"all pass"| Deploy
    TestMatrix -->|"any fail"| BLOCKED["🚫 Deploy blocked"]
```
