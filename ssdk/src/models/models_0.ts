// smithy-typescript generated code
import {
  ServiceException as __BaseException,
  CompositeCollectionValidator as __CompositeCollectionValidator,
  CompositeStructureValidator as __CompositeStructureValidator,
  CompositeValidator as __CompositeValidator,
  EnumValidator as __EnumValidator,
  LengthValidator as __LengthValidator,
  MultiConstraintValidator as __MultiConstraintValidator,
  NoOpValidator as __NoOpValidator,
  PatternValidator as __PatternValidator,
  RangeValidator as __RangeValidator,
  RequiredValidator as __RequiredValidator,
  ValidationFailure as __ValidationFailure,
} from "@aws-smithy/server-common";
import { ExceptionOptionType as __ExceptionOptionType } from "@smithy/smithy-client";

/**
 * @public
 */
export class ConflictException extends __BaseException {
  readonly name: "ConflictException" = "ConflictException";
  readonly $fault: "client" = "client";
  existingTxId?: string;
  constructor(opts: __ExceptionOptionType<ConflictException, __BaseException>) {
    super({
      name: "ConflictException",
      $fault: "client",
      ...opts
    });
    Object.setPrototypeOf(this, ConflictException.prototype);
    this.existingTxId = opts.existingTxId;
  }
}

/**
 * @public
 */
export interface CreateRechargeInput {
  bankAccountId: string | undefined;
  amount: string | undefined;
  idempotencyKey: string | undefined;
}

export namespace CreateRechargeInput {
  const memberValidators : {
    bankAccountId?: __MultiConstraintValidator<string>,
    amount?: __MultiConstraintValidator<string>,
    idempotencyKey?: __MultiConstraintValidator<string>,
  } = {};
  /**
   * @internal
   */
  export const validate = (obj: CreateRechargeInput, path: string = ""): __ValidationFailure[] => {
    function getMemberValidator<T extends keyof typeof memberValidators>(member: T): NonNullable<typeof memberValidators[T]> {
      if (memberValidators[member] === undefined) {
        switch (member) {
          case "bankAccountId": {
            memberValidators["bankAccountId"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
              new __PatternValidator("^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"),
            ]);
            break;
          }
          case "amount": {
            memberValidators["amount"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
              new __LengthValidator(1, 20),
              new __PatternValidator("^\\d{1,15}\\.\\d{2}$"),
            ]);
            break;
          }
          case "idempotencyKey": {
            memberValidators["idempotencyKey"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
              new __PatternValidator("^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"),
            ]);
            break;
          }
        }
      }
      return memberValidators[member]!!;
    }
    return [
      ...getMemberValidator("bankAccountId").validate(obj.bankAccountId, `${path}/bankAccountId`),
      ...getMemberValidator("amount").validate(obj.amount, `${path}/amount`),
      ...getMemberValidator("idempotencyKey").validate(obj.idempotencyKey, `${path}/idempotencyKey`),
    ];
  }
}

/**
 * @public
 * @enum
 */
export const TransactionStatus = {
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  PENDING: "PENDING",
  REVERSED: "REVERSED",
} as const
/**
 * @public
 */
export type TransactionStatus = typeof TransactionStatus[keyof typeof TransactionStatus]

/**
 * @public
 * @enum
 */
export const TransactionType = {
  P2P_TRANSFER: "P2P_TRANSFER",
  PAYMENT_QR: "PAYMENT_QR",
  RECHARGE: "RECHARGE",
  REVERSAL: "REVERSAL",
} as const
/**
 * @public
 */
export type TransactionType = typeof TransactionType[keyof typeof TransactionType]

/**
 * @public
 */
export interface Transaction {
  txId: string | undefined;
  senderId: string | undefined;
  receiverId: string | undefined;
  amount: string | undefined;
  currency: string | undefined;
  type: TransactionType | undefined;
  status: TransactionStatus | undefined;
  description?: string;
  createdAt: Date | undefined;
  completedAt?: Date;
}

export namespace Transaction {
  const memberValidators : {
    txId?: __MultiConstraintValidator<string>,
    senderId?: __MultiConstraintValidator<string>,
    receiverId?: __MultiConstraintValidator<string>,
    amount?: __MultiConstraintValidator<string>,
    currency?: __MultiConstraintValidator<string>,
    type?: __MultiConstraintValidator<string>,
    status?: __MultiConstraintValidator<string>,
    description?: __MultiConstraintValidator<string>,
    createdAt?: __MultiConstraintValidator<Date>,
    completedAt?: __MultiConstraintValidator<Date>,
  } = {};
  /**
   * @internal
   */
  export const validate = (obj: Transaction, path: string = ""): __ValidationFailure[] => {
    function getMemberValidator<T extends keyof typeof memberValidators>(member: T): NonNullable<typeof memberValidators[T]> {
      if (memberValidators[member] === undefined) {
        switch (member) {
          case "txId": {
            memberValidators["txId"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
              new __PatternValidator("^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"),
            ]);
            break;
          }
          case "senderId": {
            memberValidators["senderId"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
              new __PatternValidator("^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"),
            ]);
            break;
          }
          case "receiverId": {
            memberValidators["receiverId"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
              new __PatternValidator("^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"),
            ]);
            break;
          }
          case "amount": {
            memberValidators["amount"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
              new __LengthValidator(1, 20),
              new __PatternValidator("^\\d{1,15}\\.\\d{2}$"),
            ]);
            break;
          }
          case "currency": {
            memberValidators["currency"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
              new __LengthValidator(3, 3),
              new __PatternValidator("^[A-Z]{3}$"),
            ]);
            break;
          }
          case "type": {
            memberValidators["type"] = new __CompositeValidator<string>([
              new __EnumValidator([
                "P2P_TRANSFER",
                "RECHARGE",
                "PAYMENT_QR",
                "REVERSAL",
                ], [
                "P2P_TRANSFER",
                "RECHARGE",
                "PAYMENT_QR",
                "REVERSAL",
              ]),
              new __RequiredValidator(),
            ]);
            break;
          }
          case "status": {
            memberValidators["status"] = new __CompositeValidator<string>([
              new __EnumValidator([
                "PENDING",
                "COMPLETED",
                "FAILED",
                "REVERSED",
                ], [
                "PENDING",
                "COMPLETED",
                "FAILED",
                "REVERSED",
              ]),
              new __RequiredValidator(),
            ]);
            break;
          }
          case "description": {
            memberValidators["description"] = new __CompositeValidator<string>([
              new __LengthValidator(undefined, 200),
            ]);
            break;
          }
          case "createdAt": {
            memberValidators["createdAt"] = new __CompositeValidator<Date>([
              new __RequiredValidator(),
            ]);
            break;
          }
          case "completedAt": {
            memberValidators["completedAt"] = new __NoOpValidator();
            break;
          }
        }
      }
      return memberValidators[member]!!;
    }
    return [
      ...getMemberValidator("txId").validate(obj.txId, `${path}/txId`),
      ...getMemberValidator("senderId").validate(obj.senderId, `${path}/senderId`),
      ...getMemberValidator("receiverId").validate(obj.receiverId, `${path}/receiverId`),
      ...getMemberValidator("amount").validate(obj.amount, `${path}/amount`),
      ...getMemberValidator("currency").validate(obj.currency, `${path}/currency`),
      ...getMemberValidator("type").validate(obj.type, `${path}/type`),
      ...getMemberValidator("status").validate(obj.status, `${path}/status`),
      ...getMemberValidator("description").validate(obj.description, `${path}/description`),
      ...getMemberValidator("createdAt").validate(obj.createdAt, `${path}/createdAt`),
      ...getMemberValidator("completedAt").validate(obj.completedAt, `${path}/completedAt`),
    ];
  }
}

/**
 * @public
 */
export interface CreateRechargeOutput {
  transaction: Transaction | undefined;
  estimatedCreditSeconds: number | undefined;
}

export namespace CreateRechargeOutput {
  const memberValidators : {
    transaction?: __MultiConstraintValidator<Transaction>,
    estimatedCreditSeconds?: __MultiConstraintValidator<number>,
  } = {};
  /**
   * @internal
   */
  export const validate = (obj: CreateRechargeOutput, path: string = ""): __ValidationFailure[] => {
    function getMemberValidator<T extends keyof typeof memberValidators>(member: T): NonNullable<typeof memberValidators[T]> {
      if (memberValidators[member] === undefined) {
        switch (member) {
          case "transaction": {
            memberValidators["transaction"] = new __CompositeStructureValidator<Transaction>(
              new __CompositeValidator<Transaction>([
                new __RequiredValidator(),
              ]),
              Transaction.validate
            );
            break;
          }
          case "estimatedCreditSeconds": {
            memberValidators["estimatedCreditSeconds"] = new __CompositeValidator<number>([
              new __RequiredValidator(),
              new __RangeValidator(0, 3600),
            ]);
            break;
          }
        }
      }
      return memberValidators[member]!!;
    }
    return [
      ...getMemberValidator("transaction").validate(obj.transaction, `${path}/transaction`),
      ...getMemberValidator("estimatedCreditSeconds").validate(obj.estimatedCreditSeconds, `${path}/estimatedCreditSeconds`),
    ];
  }
}

/**
 * @public
 */
export class ForbiddenException extends __BaseException {
  readonly name: "ForbiddenException" = "ForbiddenException";
  readonly $fault: "client" = "client";
  requiredScope?: string;
  constructor(opts: __ExceptionOptionType<ForbiddenException, __BaseException>) {
    super({
      name: "ForbiddenException",
      $fault: "client",
      ...opts
    });
    Object.setPrototypeOf(this, ForbiddenException.prototype);
    this.requiredScope = opts.requiredScope;
  }
}

/**
 * @public
 */
export class InternalServerException extends __BaseException {
  readonly name: "InternalServerException" = "InternalServerException";
  readonly $fault: "server" = "server";
  traceId?: string;
  constructor(opts: __ExceptionOptionType<InternalServerException, __BaseException>) {
    super({
      name: "InternalServerException",
      $fault: "server",
      ...opts
    });
    Object.setPrototypeOf(this, InternalServerException.prototype);
    this.traceId = opts.traceId;
  }
}

/**
 * @public
 */
export class ResourceNotFoundException extends __BaseException {
  readonly name: "ResourceNotFoundException" = "ResourceNotFoundException";
  readonly $fault: "client" = "client";
  resourceType?: string;
  resourceId?: string;
  constructor(opts: __ExceptionOptionType<ResourceNotFoundException, __BaseException>) {
    super({
      name: "ResourceNotFoundException",
      $fault: "client",
      ...opts
    });
    Object.setPrototypeOf(this, ResourceNotFoundException.prototype);
    this.resourceType = opts.resourceType;
    this.resourceId = opts.resourceId;
  }
}

/**
 * @public
 */
export class UnauthorizedException extends __BaseException {
  readonly name: "UnauthorizedException" = "UnauthorizedException";
  readonly $fault: "client" = "client";
  constructor(opts: __ExceptionOptionType<UnauthorizedException, __BaseException>) {
    super({
      name: "UnauthorizedException",
      $fault: "client",
      ...opts
    });
    Object.setPrototypeOf(this, UnauthorizedException.prototype);
  }
}

/**
 * @public
 */
export interface FieldError {
  field: string | undefined;
  message: string | undefined;
}

export namespace FieldError {
  const memberValidators : {
    field?: __MultiConstraintValidator<string>,
    message?: __MultiConstraintValidator<string>,
  } = {};
  /**
   * @internal
   */
  export const validate = (obj: FieldError, path: string = ""): __ValidationFailure[] => {
    function getMemberValidator<T extends keyof typeof memberValidators>(member: T): NonNullable<typeof memberValidators[T]> {
      if (memberValidators[member] === undefined) {
        switch (member) {
          case "field": {
            memberValidators["field"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
            ]);
            break;
          }
          case "message": {
            memberValidators["message"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
            ]);
            break;
          }
        }
      }
      return memberValidators[member]!!;
    }
    return [
      ...getMemberValidator("field").validate(obj.field, `${path}/field`),
      ...getMemberValidator("message").validate(obj.message, `${path}/message`),
    ];
  }
}

/**
 * @public
 */
export class ValidationException extends __BaseException {
  readonly name: "ValidationException" = "ValidationException";
  readonly $fault: "client" = "client";
  fieldErrors?: (FieldError)[];
  constructor(opts: __ExceptionOptionType<ValidationException, __BaseException>) {
    super({
      name: "ValidationException",
      $fault: "client",
      ...opts
    });
    Object.setPrototypeOf(this, ValidationException.prototype);
    this.fieldErrors = opts.fieldErrors;
  }
}

/**
 * @public
 */
export interface CreateTransactionInput {
  receiverPhone: string | undefined;
  amount: string | undefined;
  currency?: string;
  description?: string;
  idempotencyKey: string | undefined;
}

export namespace CreateTransactionInput {
  const memberValidators : {
    receiverPhone?: __MultiConstraintValidator<string>,
    amount?: __MultiConstraintValidator<string>,
    currency?: __MultiConstraintValidator<string>,
    description?: __MultiConstraintValidator<string>,
    idempotencyKey?: __MultiConstraintValidator<string>,
  } = {};
  /**
   * @internal
   */
  export const validate = (obj: CreateTransactionInput, path: string = ""): __ValidationFailure[] => {
    function getMemberValidator<T extends keyof typeof memberValidators>(member: T): NonNullable<typeof memberValidators[T]> {
      if (memberValidators[member] === undefined) {
        switch (member) {
          case "receiverPhone": {
            memberValidators["receiverPhone"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
              new __LengthValidator(9, 12),
              new __PatternValidator("^(\\+51)?9[0-9]{8}$"),
            ]);
            break;
          }
          case "amount": {
            memberValidators["amount"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
              new __LengthValidator(1, 20),
              new __PatternValidator("^\\d{1,15}\\.\\d{2}$"),
            ]);
            break;
          }
          case "currency": {
            memberValidators["currency"] = new __CompositeValidator<string>([
              new __LengthValidator(3, 3),
              new __PatternValidator("^[A-Z]{3}$"),
            ]);
            break;
          }
          case "description": {
            memberValidators["description"] = new __CompositeValidator<string>([
              new __LengthValidator(undefined, 200),
            ]);
            break;
          }
          case "idempotencyKey": {
            memberValidators["idempotencyKey"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
              new __PatternValidator("^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"),
            ]);
            break;
          }
        }
      }
      return memberValidators[member]!!;
    }
    return [
      ...getMemberValidator("receiverPhone").validate(obj.receiverPhone, `${path}/receiverPhone`),
      ...getMemberValidator("amount").validate(obj.amount, `${path}/amount`),
      ...getMemberValidator("currency").validate(obj.currency, `${path}/currency`),
      ...getMemberValidator("description").validate(obj.description, `${path}/description`),
      ...getMemberValidator("idempotencyKey").validate(obj.idempotencyKey, `${path}/idempotencyKey`),
    ];
  }
}

/**
 * @public
 */
export interface CreateTransactionOutput {
  transaction: Transaction | undefined;
}

export namespace CreateTransactionOutput {
  const memberValidators : {
    transaction?: __MultiConstraintValidator<Transaction>,
  } = {};
  /**
   * @internal
   */
  export const validate = (obj: CreateTransactionOutput, path: string = ""): __ValidationFailure[] => {
    function getMemberValidator<T extends keyof typeof memberValidators>(member: T): NonNullable<typeof memberValidators[T]> {
      if (memberValidators[member] === undefined) {
        switch (member) {
          case "transaction": {
            memberValidators["transaction"] = new __CompositeStructureValidator<Transaction>(
              new __CompositeValidator<Transaction>([
                new __RequiredValidator(),
              ]),
              Transaction.validate
            );
            break;
          }
        }
      }
      return memberValidators[member]!!;
    }
    return [
      ...getMemberValidator("transaction").validate(obj.transaction, `${path}/transaction`),
    ];
  }
}

/**
 * @public
 */
export class InsufficientFundsException extends __BaseException {
  readonly name: "InsufficientFundsException" = "InsufficientFundsException";
  readonly $fault: "client" = "client";
  currentBalance?: string;
  requiredAmount?: string;
  constructor(opts: __ExceptionOptionType<InsufficientFundsException, __BaseException>) {
    super({
      name: "InsufficientFundsException",
      $fault: "client",
      ...opts
    });
    Object.setPrototypeOf(this, InsufficientFundsException.prototype);
    this.currentBalance = opts.currentBalance;
    this.requiredAmount = opts.requiredAmount;
  }
}

/**
 * @public
 */
export interface GenerateQRInput {
  amount?: string;
  currency?: string;
  description?: string;
  ttlMinutes?: number;
}

export namespace GenerateQRInput {
  const memberValidators : {
    amount?: __MultiConstraintValidator<string>,
    currency?: __MultiConstraintValidator<string>,
    description?: __MultiConstraintValidator<string>,
    ttlMinutes?: __MultiConstraintValidator<number>,
  } = {};
  /**
   * @internal
   */
  export const validate = (obj: GenerateQRInput, path: string = ""): __ValidationFailure[] => {
    function getMemberValidator<T extends keyof typeof memberValidators>(member: T): NonNullable<typeof memberValidators[T]> {
      if (memberValidators[member] === undefined) {
        switch (member) {
          case "amount": {
            memberValidators["amount"] = new __CompositeValidator<string>([
              new __LengthValidator(1, 20),
              new __PatternValidator("^\\d{1,15}\\.\\d{2}$"),
            ]);
            break;
          }
          case "currency": {
            memberValidators["currency"] = new __CompositeValidator<string>([
              new __LengthValidator(3, 3),
              new __PatternValidator("^[A-Z]{3}$"),
            ]);
            break;
          }
          case "description": {
            memberValidators["description"] = new __CompositeValidator<string>([
              new __LengthValidator(undefined, 200),
            ]);
            break;
          }
          case "ttlMinutes": {
            memberValidators["ttlMinutes"] = new __CompositeValidator<number>([
              new __RangeValidator(1, 1440),
            ]);
            break;
          }
        }
      }
      return memberValidators[member]!!;
    }
    return [
      ...getMemberValidator("amount").validate(obj.amount, `${path}/amount`),
      ...getMemberValidator("currency").validate(obj.currency, `${path}/currency`),
      ...getMemberValidator("description").validate(obj.description, `${path}/description`),
      ...getMemberValidator("ttlMinutes").validate(obj.ttlMinutes, `${path}/ttlMinutes`),
    ];
  }
}

/**
 * @public
 */
export interface QRCode {
  qrId: string | undefined;
  userId: string | undefined;
  amount?: string;
  currency?: string;
  description?: string;
  qrData: string | undefined;
  expiresAt: Date | undefined;
  used: boolean | undefined;
}

export namespace QRCode {
  const memberValidators : {
    qrId?: __MultiConstraintValidator<string>,
    userId?: __MultiConstraintValidator<string>,
    amount?: __MultiConstraintValidator<string>,
    currency?: __MultiConstraintValidator<string>,
    description?: __MultiConstraintValidator<string>,
    qrData?: __MultiConstraintValidator<string>,
    expiresAt?: __MultiConstraintValidator<Date>,
    used?: __MultiConstraintValidator<boolean>,
  } = {};
  /**
   * @internal
   */
  export const validate = (obj: QRCode, path: string = ""): __ValidationFailure[] => {
    function getMemberValidator<T extends keyof typeof memberValidators>(member: T): NonNullable<typeof memberValidators[T]> {
      if (memberValidators[member] === undefined) {
        switch (member) {
          case "qrId": {
            memberValidators["qrId"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
              new __PatternValidator("^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"),
            ]);
            break;
          }
          case "userId": {
            memberValidators["userId"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
              new __PatternValidator("^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"),
            ]);
            break;
          }
          case "amount": {
            memberValidators["amount"] = new __CompositeValidator<string>([
              new __LengthValidator(1, 20),
              new __PatternValidator("^\\d{1,15}\\.\\d{2}$"),
            ]);
            break;
          }
          case "currency": {
            memberValidators["currency"] = new __CompositeValidator<string>([
              new __LengthValidator(3, 3),
              new __PatternValidator("^[A-Z]{3}$"),
            ]);
            break;
          }
          case "description": {
            memberValidators["description"] = new __CompositeValidator<string>([
              new __LengthValidator(undefined, 200),
            ]);
            break;
          }
          case "qrData": {
            memberValidators["qrData"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
            ]);
            break;
          }
          case "expiresAt": {
            memberValidators["expiresAt"] = new __CompositeValidator<Date>([
              new __RequiredValidator(),
            ]);
            break;
          }
          case "used": {
            memberValidators["used"] = new __CompositeValidator<boolean>([
              new __RequiredValidator(),
            ]);
            break;
          }
        }
      }
      return memberValidators[member]!!;
    }
    return [
      ...getMemberValidator("qrId").validate(obj.qrId, `${path}/qrId`),
      ...getMemberValidator("userId").validate(obj.userId, `${path}/userId`),
      ...getMemberValidator("amount").validate(obj.amount, `${path}/amount`),
      ...getMemberValidator("currency").validate(obj.currency, `${path}/currency`),
      ...getMemberValidator("description").validate(obj.description, `${path}/description`),
      ...getMemberValidator("qrData").validate(obj.qrData, `${path}/qrData`),
      ...getMemberValidator("expiresAt").validate(obj.expiresAt, `${path}/expiresAt`),
      ...getMemberValidator("used").validate(obj.used, `${path}/used`),
    ];
  }
}

/**
 * @public
 */
export interface GenerateQROutput {
  qrCode: QRCode | undefined;
}

export namespace GenerateQROutput {
  const memberValidators : {
    qrCode?: __MultiConstraintValidator<QRCode>,
  } = {};
  /**
   * @internal
   */
  export const validate = (obj: GenerateQROutput, path: string = ""): __ValidationFailure[] => {
    function getMemberValidator<T extends keyof typeof memberValidators>(member: T): NonNullable<typeof memberValidators[T]> {
      if (memberValidators[member] === undefined) {
        switch (member) {
          case "qrCode": {
            memberValidators["qrCode"] = new __CompositeStructureValidator<QRCode>(
              new __CompositeValidator<QRCode>([
                new __RequiredValidator(),
              ]),
              QRCode.validate
            );
            break;
          }
        }
      }
      return memberValidators[member]!!;
    }
    return [
      ...getMemberValidator("qrCode").validate(obj.qrCode, `${path}/qrCode`),
    ];
  }
}

/**
 * @public
 * @enum
 */
export const KycStatus = {
  BASIC_VERIFIED: "BASIC_VERIFIED",
  FULL_VERIFIED: "FULL_VERIFIED",
  PENDING: "PENDING",
  REJECTED: "REJECTED",
} as const
/**
 * @public
 */
export type KycStatus = typeof KycStatus[keyof typeof KycStatus]

/**
 * @public
 */
export interface UserProfile {
  userId: string | undefined;
  phoneNumber: string | undefined;
  fullName: string | undefined;
  email: string | undefined;
  kycStatus: KycStatus | undefined;
  createdAt: Date | undefined;
}

export namespace UserProfile {
  const memberValidators : {
    userId?: __MultiConstraintValidator<string>,
    phoneNumber?: __MultiConstraintValidator<string>,
    fullName?: __MultiConstraintValidator<string>,
    email?: __MultiConstraintValidator<string>,
    kycStatus?: __MultiConstraintValidator<string>,
    createdAt?: __MultiConstraintValidator<Date>,
  } = {};
  /**
   * @internal
   */
  export const validate = (obj: UserProfile, path: string = ""): __ValidationFailure[] => {
    function getMemberValidator<T extends keyof typeof memberValidators>(member: T): NonNullable<typeof memberValidators[T]> {
      if (memberValidators[member] === undefined) {
        switch (member) {
          case "userId": {
            memberValidators["userId"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
              new __PatternValidator("^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"),
            ]);
            break;
          }
          case "phoneNumber": {
            memberValidators["phoneNumber"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
              new __LengthValidator(9, 12),
              new __PatternValidator("^(\\+51)?9[0-9]{8}$"),
            ]);
            break;
          }
          case "fullName": {
            memberValidators["fullName"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
              new __LengthValidator(2, 100),
            ]);
            break;
          }
          case "email": {
            memberValidators["email"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
            ]);
            break;
          }
          case "kycStatus": {
            memberValidators["kycStatus"] = new __CompositeValidator<string>([
              new __EnumValidator([
                "PENDING",
                "BASIC_VERIFIED",
                "FULL_VERIFIED",
                "REJECTED",
                ], [
                "PENDING",
                "BASIC_VERIFIED",
                "FULL_VERIFIED",
                "REJECTED",
              ]),
              new __RequiredValidator(),
            ]);
            break;
          }
          case "createdAt": {
            memberValidators["createdAt"] = new __CompositeValidator<Date>([
              new __RequiredValidator(),
            ]);
            break;
          }
        }
      }
      return memberValidators[member]!!;
    }
    return [
      ...getMemberValidator("userId").validate(obj.userId, `${path}/userId`),
      ...getMemberValidator("phoneNumber").validate(obj.phoneNumber, `${path}/phoneNumber`),
      ...getMemberValidator("fullName").validate(obj.fullName, `${path}/fullName`),
      ...getMemberValidator("email").validate(obj.email, `${path}/email`),
      ...getMemberValidator("kycStatus").validate(obj.kycStatus, `${path}/kycStatus`),
      ...getMemberValidator("createdAt").validate(obj.createdAt, `${path}/createdAt`),
    ];
  }
}

/**
 * @public
 */
export interface GetCurrentUserOutput {
  user: UserProfile | undefined;
}

export namespace GetCurrentUserOutput {
  const memberValidators : {
    user?: __MultiConstraintValidator<UserProfile>,
  } = {};
  /**
   * @internal
   */
  export const validate = (obj: GetCurrentUserOutput, path: string = ""): __ValidationFailure[] => {
    function getMemberValidator<T extends keyof typeof memberValidators>(member: T): NonNullable<typeof memberValidators[T]> {
      if (memberValidators[member] === undefined) {
        switch (member) {
          case "user": {
            memberValidators["user"] = new __CompositeStructureValidator<UserProfile>(
              new __CompositeValidator<UserProfile>([
                new __RequiredValidator(),
              ]),
              UserProfile.validate
            );
            break;
          }
        }
      }
      return memberValidators[member]!!;
    }
    return [
      ...getMemberValidator("user").validate(obj.user, `${path}/user`),
    ];
  }
}

/**
 * @public
 * @enum
 */
export const WalletStatus = {
  ACTIVE: "ACTIVE",
  CLOSED: "CLOSED",
  SUSPENDED: "SUSPENDED",
} as const
/**
 * @public
 */
export type WalletStatus = typeof WalletStatus[keyof typeof WalletStatus]

/**
 * @public
 */
export interface Wallet {
  walletId: string | undefined;
  userId: string | undefined;
  balance: string | undefined;
  currency: string | undefined;
  status: WalletStatus | undefined;
  updatedAt: Date | undefined;
}

export namespace Wallet {
  const memberValidators : {
    walletId?: __MultiConstraintValidator<string>,
    userId?: __MultiConstraintValidator<string>,
    balance?: __MultiConstraintValidator<string>,
    currency?: __MultiConstraintValidator<string>,
    status?: __MultiConstraintValidator<string>,
    updatedAt?: __MultiConstraintValidator<Date>,
  } = {};
  /**
   * @internal
   */
  export const validate = (obj: Wallet, path: string = ""): __ValidationFailure[] => {
    function getMemberValidator<T extends keyof typeof memberValidators>(member: T): NonNullable<typeof memberValidators[T]> {
      if (memberValidators[member] === undefined) {
        switch (member) {
          case "walletId": {
            memberValidators["walletId"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
              new __PatternValidator("^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"),
            ]);
            break;
          }
          case "userId": {
            memberValidators["userId"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
              new __PatternValidator("^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"),
            ]);
            break;
          }
          case "balance": {
            memberValidators["balance"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
              new __LengthValidator(1, 20),
              new __PatternValidator("^\\d{1,15}\\.\\d{2}$"),
            ]);
            break;
          }
          case "currency": {
            memberValidators["currency"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
              new __LengthValidator(3, 3),
              new __PatternValidator("^[A-Z]{3}$"),
            ]);
            break;
          }
          case "status": {
            memberValidators["status"] = new __CompositeValidator<string>([
              new __EnumValidator([
                "ACTIVE",
                "SUSPENDED",
                "CLOSED",
                ], [
                "ACTIVE",
                "SUSPENDED",
                "CLOSED",
              ]),
              new __RequiredValidator(),
            ]);
            break;
          }
          case "updatedAt": {
            memberValidators["updatedAt"] = new __CompositeValidator<Date>([
              new __RequiredValidator(),
            ]);
            break;
          }
        }
      }
      return memberValidators[member]!!;
    }
    return [
      ...getMemberValidator("walletId").validate(obj.walletId, `${path}/walletId`),
      ...getMemberValidator("userId").validate(obj.userId, `${path}/userId`),
      ...getMemberValidator("balance").validate(obj.balance, `${path}/balance`),
      ...getMemberValidator("currency").validate(obj.currency, `${path}/currency`),
      ...getMemberValidator("status").validate(obj.status, `${path}/status`),
      ...getMemberValidator("updatedAt").validate(obj.updatedAt, `${path}/updatedAt`),
    ];
  }
}

/**
 * @public
 */
export interface GetMyWalletOutput {
  wallet: Wallet | undefined;
}

export namespace GetMyWalletOutput {
  const memberValidators : {
    wallet?: __MultiConstraintValidator<Wallet>,
  } = {};
  /**
   * @internal
   */
  export const validate = (obj: GetMyWalletOutput, path: string = ""): __ValidationFailure[] => {
    function getMemberValidator<T extends keyof typeof memberValidators>(member: T): NonNullable<typeof memberValidators[T]> {
      if (memberValidators[member] === undefined) {
        switch (member) {
          case "wallet": {
            memberValidators["wallet"] = new __CompositeStructureValidator<Wallet>(
              new __CompositeValidator<Wallet>([
                new __RequiredValidator(),
              ]),
              Wallet.validate
            );
            break;
          }
        }
      }
      return memberValidators[member]!!;
    }
    return [
      ...getMemberValidator("wallet").validate(obj.wallet, `${path}/wallet`),
    ];
  }
}

/**
 * @public
 */
export interface GetTransactionInput {
  txId: string | undefined;
}

export namespace GetTransactionInput {
  const memberValidators : {
    txId?: __MultiConstraintValidator<string>,
  } = {};
  /**
   * @internal
   */
  export const validate = (obj: GetTransactionInput, path: string = ""): __ValidationFailure[] => {
    function getMemberValidator<T extends keyof typeof memberValidators>(member: T): NonNullable<typeof memberValidators[T]> {
      if (memberValidators[member] === undefined) {
        switch (member) {
          case "txId": {
            memberValidators["txId"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
              new __PatternValidator("^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"),
            ]);
            break;
          }
        }
      }
      return memberValidators[member]!!;
    }
    return [
      ...getMemberValidator("txId").validate(obj.txId, `${path}/txId`),
    ];
  }
}

/**
 * @public
 */
export interface GetTransactionOutput {
  transaction: Transaction | undefined;
}

export namespace GetTransactionOutput {
  const memberValidators : {
    transaction?: __MultiConstraintValidator<Transaction>,
  } = {};
  /**
   * @internal
   */
  export const validate = (obj: GetTransactionOutput, path: string = ""): __ValidationFailure[] => {
    function getMemberValidator<T extends keyof typeof memberValidators>(member: T): NonNullable<typeof memberValidators[T]> {
      if (memberValidators[member] === undefined) {
        switch (member) {
          case "transaction": {
            memberValidators["transaction"] = new __CompositeStructureValidator<Transaction>(
              new __CompositeValidator<Transaction>([
                new __RequiredValidator(),
              ]),
              Transaction.validate
            );
            break;
          }
        }
      }
      return memberValidators[member]!!;
    }
    return [
      ...getMemberValidator("transaction").validate(obj.transaction, `${path}/transaction`),
    ];
  }
}

/**
 * @public
 */
export interface ListTransactionsInput {
  cursor?: string;
  pageSize?: number;
  type?: TransactionType;
  status?: TransactionStatus;
  fromDate?: Date;
  toDate?: Date;
}

export namespace ListTransactionsInput {
  const memberValidators : {
    cursor?: __MultiConstraintValidator<string>,
    pageSize?: __MultiConstraintValidator<number>,
    type?: __MultiConstraintValidator<string>,
    status?: __MultiConstraintValidator<string>,
    fromDate?: __MultiConstraintValidator<Date>,
    toDate?: __MultiConstraintValidator<Date>,
  } = {};
  /**
   * @internal
   */
  export const validate = (obj: ListTransactionsInput, path: string = ""): __ValidationFailure[] => {
    function getMemberValidator<T extends keyof typeof memberValidators>(member: T): NonNullable<typeof memberValidators[T]> {
      if (memberValidators[member] === undefined) {
        switch (member) {
          case "cursor": {
            memberValidators["cursor"] = new __NoOpValidator();
            break;
          }
          case "pageSize": {
            memberValidators["pageSize"] = new __CompositeValidator<number>([
              new __RangeValidator(1, 50),
            ]);
            break;
          }
          case "type": {
            memberValidators["type"] = new __CompositeValidator<string>([
              new __EnumValidator([
                "P2P_TRANSFER",
                "RECHARGE",
                "PAYMENT_QR",
                "REVERSAL",
                ], [
                "P2P_TRANSFER",
                "RECHARGE",
                "PAYMENT_QR",
                "REVERSAL",
              ]),
            ]);
            break;
          }
          case "status": {
            memberValidators["status"] = new __CompositeValidator<string>([
              new __EnumValidator([
                "PENDING",
                "COMPLETED",
                "FAILED",
                "REVERSED",
                ], [
                "PENDING",
                "COMPLETED",
                "FAILED",
                "REVERSED",
              ]),
            ]);
            break;
          }
          case "fromDate": {
            memberValidators["fromDate"] = new __NoOpValidator();
            break;
          }
          case "toDate": {
            memberValidators["toDate"] = new __NoOpValidator();
            break;
          }
        }
      }
      return memberValidators[member]!!;
    }
    return [
      ...getMemberValidator("cursor").validate(obj.cursor, `${path}/cursor`),
      ...getMemberValidator("pageSize").validate(obj.pageSize, `${path}/pageSize`),
      ...getMemberValidator("type").validate(obj.type, `${path}/type`),
      ...getMemberValidator("status").validate(obj.status, `${path}/status`),
      ...getMemberValidator("fromDate").validate(obj.fromDate, `${path}/fromDate`),
      ...getMemberValidator("toDate").validate(obj.toDate, `${path}/toDate`),
    ];
  }
}

/**
 * @public
 */
export interface ListTransactionsOutput {
  transactions: (Transaction)[] | undefined;
  nextCursor?: string;
  total: number | undefined;
}

export namespace ListTransactionsOutput {
  const memberValidators : {
    transactions?: __MultiConstraintValidator<Iterable<Transaction>>,
    nextCursor?: __MultiConstraintValidator<string>,
    total?: __MultiConstraintValidator<number>,
  } = {};
  /**
   * @internal
   */
  export const validate = (obj: ListTransactionsOutput, path: string = ""): __ValidationFailure[] => {
    function getMemberValidator<T extends keyof typeof memberValidators>(member: T): NonNullable<typeof memberValidators[T]> {
      if (memberValidators[member] === undefined) {
        switch (member) {
          case "transactions": {
            memberValidators["transactions"] = new __CompositeCollectionValidator<Transaction>(
              new __CompositeValidator<(Transaction)[]>([
                new __RequiredValidator(),
              ]),
              new __CompositeStructureValidator<Transaction>(
                new __NoOpValidator(),
                Transaction.validate
              )
            );
            break;
          }
          case "nextCursor": {
            memberValidators["nextCursor"] = new __NoOpValidator();
            break;
          }
          case "total": {
            memberValidators["total"] = new __CompositeValidator<number>([
              new __RequiredValidator(),
            ]);
            break;
          }
        }
      }
      return memberValidators[member]!!;
    }
    return [
      ...getMemberValidator("transactions").validate(obj.transactions, `${path}/transactions`),
      ...getMemberValidator("nextCursor").validate(obj.nextCursor, `${path}/nextCursor`),
      ...getMemberValidator("total").validate(obj.total, `${path}/total`),
    ];
  }
}

/**
 * @public
 */
export interface LoginInput {
  phoneNumber: string | undefined;
  pinHash: string | undefined;
}

export namespace LoginInput {
  const memberValidators : {
    phoneNumber?: __MultiConstraintValidator<string>,
    pinHash?: __MultiConstraintValidator<string>,
  } = {};
  /**
   * @internal
   */
  export const validate = (obj: LoginInput, path: string = ""): __ValidationFailure[] => {
    function getMemberValidator<T extends keyof typeof memberValidators>(member: T): NonNullable<typeof memberValidators[T]> {
      if (memberValidators[member] === undefined) {
        switch (member) {
          case "phoneNumber": {
            memberValidators["phoneNumber"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
              new __LengthValidator(9, 12),
              new __PatternValidator("^(\\+51)?9[0-9]{8}$"),
            ]);
            break;
          }
          case "pinHash": {
            memberValidators["pinHash"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
              new __LengthValidator(64, 64),
              new __PatternValidator("^[0-9a-f]{64}$"),
            ]);
            break;
          }
        }
      }
      return memberValidators[member]!!;
    }
    return [
      ...getMemberValidator("phoneNumber").validate(obj.phoneNumber, `${path}/phoneNumber`),
      ...getMemberValidator("pinHash").validate(obj.pinHash, `${path}/pinHash`),
    ];
  }
}

/**
 * @public
 */
export interface LoginOutput {
  accessToken: string | undefined;
  refreshToken: string | undefined;
  expiresIn: number | undefined;
  tokenType: string | undefined;
}

export namespace LoginOutput {
  const memberValidators : {
    accessToken?: __MultiConstraintValidator<string>,
    refreshToken?: __MultiConstraintValidator<string>,
    expiresIn?: __MultiConstraintValidator<number>,
    tokenType?: __MultiConstraintValidator<string>,
  } = {};
  /**
   * @internal
   */
  export const validate = (obj: LoginOutput, path: string = ""): __ValidationFailure[] => {
    function getMemberValidator<T extends keyof typeof memberValidators>(member: T): NonNullable<typeof memberValidators[T]> {
      if (memberValidators[member] === undefined) {
        switch (member) {
          case "accessToken": {
            memberValidators["accessToken"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
            ]);
            break;
          }
          case "refreshToken": {
            memberValidators["refreshToken"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
            ]);
            break;
          }
          case "expiresIn": {
            memberValidators["expiresIn"] = new __CompositeValidator<number>([
              new __RequiredValidator(),
              new __RangeValidator(1, 86400),
            ]);
            break;
          }
          case "tokenType": {
            memberValidators["tokenType"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
            ]);
            break;
          }
        }
      }
      return memberValidators[member]!!;
    }
    return [
      ...getMemberValidator("accessToken").validate(obj.accessToken, `${path}/accessToken`),
      ...getMemberValidator("refreshToken").validate(obj.refreshToken, `${path}/refreshToken`),
      ...getMemberValidator("expiresIn").validate(obj.expiresIn, `${path}/expiresIn`),
      ...getMemberValidator("tokenType").validate(obj.tokenType, `${path}/tokenType`),
    ];
  }
}

/**
 * @public
 */
export interface RefreshTokenInput {
  refreshToken: string | undefined;
}

export namespace RefreshTokenInput {
  const memberValidators : {
    refreshToken?: __MultiConstraintValidator<string>,
  } = {};
  /**
   * @internal
   */
  export const validate = (obj: RefreshTokenInput, path: string = ""): __ValidationFailure[] => {
    function getMemberValidator<T extends keyof typeof memberValidators>(member: T): NonNullable<typeof memberValidators[T]> {
      if (memberValidators[member] === undefined) {
        switch (member) {
          case "refreshToken": {
            memberValidators["refreshToken"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
            ]);
            break;
          }
        }
      }
      return memberValidators[member]!!;
    }
    return [
      ...getMemberValidator("refreshToken").validate(obj.refreshToken, `${path}/refreshToken`),
    ];
  }
}

/**
 * @public
 */
export interface RefreshTokenOutput {
  accessToken: string | undefined;
  refreshToken: string | undefined;
  expiresIn: number | undefined;
}

export namespace RefreshTokenOutput {
  const memberValidators : {
    accessToken?: __MultiConstraintValidator<string>,
    refreshToken?: __MultiConstraintValidator<string>,
    expiresIn?: __MultiConstraintValidator<number>,
  } = {};
  /**
   * @internal
   */
  export const validate = (obj: RefreshTokenOutput, path: string = ""): __ValidationFailure[] => {
    function getMemberValidator<T extends keyof typeof memberValidators>(member: T): NonNullable<typeof memberValidators[T]> {
      if (memberValidators[member] === undefined) {
        switch (member) {
          case "accessToken": {
            memberValidators["accessToken"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
            ]);
            break;
          }
          case "refreshToken": {
            memberValidators["refreshToken"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
            ]);
            break;
          }
          case "expiresIn": {
            memberValidators["expiresIn"] = new __CompositeValidator<number>([
              new __RequiredValidator(),
              new __RangeValidator(1, 86400),
            ]);
            break;
          }
        }
      }
      return memberValidators[member]!!;
    }
    return [
      ...getMemberValidator("accessToken").validate(obj.accessToken, `${path}/accessToken`),
      ...getMemberValidator("refreshToken").validate(obj.refreshToken, `${path}/refreshToken`),
      ...getMemberValidator("expiresIn").validate(obj.expiresIn, `${path}/expiresIn`),
    ];
  }
}

/**
 * @public
 */
export interface UpdateUserPayload {
  fullName?: string;
  email?: string;
}

export namespace UpdateUserPayload {
  const memberValidators : {
    fullName?: __MultiConstraintValidator<string>,
    email?: __MultiConstraintValidator<string>,
  } = {};
  /**
   * @internal
   */
  export const validate = (obj: UpdateUserPayload, path: string = ""): __ValidationFailure[] => {
    function getMemberValidator<T extends keyof typeof memberValidators>(member: T): NonNullable<typeof memberValidators[T]> {
      if (memberValidators[member] === undefined) {
        switch (member) {
          case "fullName": {
            memberValidators["fullName"] = new __CompositeValidator<string>([
              new __LengthValidator(2, 100),
            ]);
            break;
          }
          case "email": {
            memberValidators["email"] = new __CompositeValidator<string>([
              new __PatternValidator("^[^@]+@[^@]+\\.[^@]+$"),
            ]);
            break;
          }
        }
      }
      return memberValidators[member]!!;
    }
    return [
      ...getMemberValidator("fullName").validate(obj.fullName, `${path}/fullName`),
      ...getMemberValidator("email").validate(obj.email, `${path}/email`),
    ];
  }
}

/**
 * @public
 */
export interface UpdateCurrentUserInput {
  updates: UpdateUserPayload | undefined;
}

export namespace UpdateCurrentUserInput {
  const memberValidators : {
    updates?: __MultiConstraintValidator<UpdateUserPayload>,
  } = {};
  /**
   * @internal
   */
  export const validate = (obj: UpdateCurrentUserInput, path: string = ""): __ValidationFailure[] => {
    function getMemberValidator<T extends keyof typeof memberValidators>(member: T): NonNullable<typeof memberValidators[T]> {
      if (memberValidators[member] === undefined) {
        switch (member) {
          case "updates": {
            memberValidators["updates"] = new __CompositeStructureValidator<UpdateUserPayload>(
              new __CompositeValidator<UpdateUserPayload>([
                new __RequiredValidator(),
              ]),
              UpdateUserPayload.validate
            );
            break;
          }
        }
      }
      return memberValidators[member]!!;
    }
    return [
      ...getMemberValidator("updates").validate(obj.updates, `${path}/updates`),
    ];
  }
}

/**
 * @public
 */
export interface UpdateCurrentUserOutput {
  user: UserProfile | undefined;
}

export namespace UpdateCurrentUserOutput {
  const memberValidators : {
    user?: __MultiConstraintValidator<UserProfile>,
  } = {};
  /**
   * @internal
   */
  export const validate = (obj: UpdateCurrentUserOutput, path: string = ""): __ValidationFailure[] => {
    function getMemberValidator<T extends keyof typeof memberValidators>(member: T): NonNullable<typeof memberValidators[T]> {
      if (memberValidators[member] === undefined) {
        switch (member) {
          case "user": {
            memberValidators["user"] = new __CompositeStructureValidator<UserProfile>(
              new __CompositeValidator<UserProfile>([
                new __RequiredValidator(),
              ]),
              UserProfile.validate
            );
            break;
          }
        }
      }
      return memberValidators[member]!!;
    }
    return [
      ...getMemberValidator("user").validate(obj.user, `${path}/user`),
    ];
  }
}
