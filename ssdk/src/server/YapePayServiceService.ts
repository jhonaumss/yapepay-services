// smithy-typescript generated code
import { serializeFrameworkException } from "../protocols/Aws_restJson1";
import {
  YapePayServiceService,
  YapePayServiceServiceHandler,
  YapePayServiceServiceOperations,
} from "./YapePayServiceService";
import {
  CreateRechargeOperation,
  CreateRechargeOperationSerializer,
  CreateRechargeOperationServerInput,
} from "./operations/CreateRechargeOperation";
import {
  CreateTransactionOperation,
  CreateTransactionOperationSerializer,
  CreateTransactionOperationServerInput,
} from "./operations/CreateTransactionOperation";
import {
  GenerateQROperation,
  GenerateQROperationSerializer,
  GenerateQROperationServerInput,
} from "./operations/GenerateQROperation";
import {
  GetCurrentUserOperation,
  GetCurrentUserOperationSerializer,
  GetCurrentUserOperationServerInput,
} from "./operations/GetCurrentUserOperation";
import {
  GetMyWalletOperation,
  GetMyWalletOperationSerializer,
  GetMyWalletOperationServerInput,
} from "./operations/GetMyWalletOperation";
import {
  GetQROperation,
  GetQROperationSerializer,
  GetQROperationServerInput,
} from "./operations/GetQROperation";
import {
  GetTransactionOperation,
  GetTransactionOperationSerializer,
  GetTransactionOperationServerInput,
} from "./operations/GetTransactionOperation";
import {
  ListTransactionsOperation,
  ListTransactionsOperationSerializer,
  ListTransactionsOperationServerInput,
} from "./operations/ListTransactionsOperation";
import {
  LoginOperation,
  LoginOperationSerializer,
  LoginOperationServerInput,
} from "./operations/LoginOperation";
import {
  RefreshTokenOperation,
  RefreshTokenOperationSerializer,
  RefreshTokenOperationServerInput,
} from "./operations/RefreshTokenOperation";
import {
  UpdateCurrentUserOperation,
  UpdateCurrentUserOperationSerializer,
  UpdateCurrentUserOperationServerInput,
} from "./operations/UpdateCurrentUserOperation";
import {
  InternalFailureException as __InternalFailureException,
  Mux as __Mux,
  Operation as __Operation,
  OperationInput as __OperationInput,
  OperationOutput as __OperationOutput,
  OperationSerializer as __OperationSerializer,
  SerializationException as __SerializationException,
  ServerSerdeContext as __ServerSerdeContext,
  ServiceException as __ServiceException,
  ServiceHandler as __ServiceHandler,
  SmithyFrameworkException as __SmithyFrameworkException,
  UnknownOperationException as __UnknownOperationException,
  ValidationCustomizer as __ValidationCustomizer,
  ValidationFailure as __ValidationFailure,
  isFrameworkException as __isFrameworkException,
  httpbinding,
} from "@aws-smithy/server-common";
import {
  NodeHttpHandler,
  streamCollector,
} from "@smithy/node-http-handler";
import {
  HttpRequest as __HttpRequest,
  HttpResponse as __HttpResponse,
} from "@smithy/protocol-http";
import {
  fromBase64,
  toBase64,
} from "@smithy/util-base64";
import {
  fromUtf8,
  toUtf8,
} from "@smithy/util-utf8";

export type YapePayServiceServiceOperations = "CreateRechargeOperation" | "CreateTransactionOperation" | "GenerateQROperation" | "GetCurrentUserOperation" | "GetMyWalletOperation" | "GetQROperation" | "GetTransactionOperation" | "ListTransactionsOperation" | "LoginOperation" | "RefreshTokenOperation" | "UpdateCurrentUserOperation";
export interface YapePayServiceService<Context> {
  CreateRechargeOperation: CreateRechargeOperation<Context>
  CreateTransactionOperation: CreateTransactionOperation<Context>
  GenerateQROperation: GenerateQROperation<Context>
  GetCurrentUserOperation: GetCurrentUserOperation<Context>
  GetMyWalletOperation: GetMyWalletOperation<Context>
  GetQROperation: GetQROperation<Context>
  GetTransactionOperation: GetTransactionOperation<Context>
  ListTransactionsOperation: ListTransactionsOperation<Context>
  LoginOperation: LoginOperation<Context>
  RefreshTokenOperation: RefreshTokenOperation<Context>
  UpdateCurrentUserOperation: UpdateCurrentUserOperation<Context>
}
const serdeContextBase = {
  base64Encoder: toBase64,
  base64Decoder: fromBase64,
  utf8Encoder: toUtf8,
  utf8Decoder: fromUtf8,
  streamCollector: streamCollector,
  requestHandler: new NodeHttpHandler(),
  disableHostPrefix: true
};
async function handle<S, O extends keyof S & string, Context>(
  request: __HttpRequest,
  context: Context,
  operationName: O,
  serializer: __OperationSerializer<S, O, __ServiceException>,
  operation: __Operation<__OperationInput<S[O]>, __OperationOutput<S[O]>, Context>,
  serializeFrameworkException: (e: __SmithyFrameworkException, ctx: __ServerSerdeContext) => Promise<__HttpResponse>,
  validationFn: (input: __OperationInput<S[O]>) => __ValidationFailure[],
  validationCustomizer: __ValidationCustomizer<O>
): Promise<__HttpResponse> {
  let input;
  try {
    input = await serializer.deserialize(request, {
      endpoint: () => Promise.resolve(request), ...serdeContextBase
    });
  } catch (error: unknown) {
    if (__isFrameworkException(error)) {
      return serializeFrameworkException(error, serdeContextBase);
    };
    return serializeFrameworkException(new __SerializationException(), serdeContextBase);
  }
  try {
    let validationFailures = validationFn(input);
    if (validationFailures && validationFailures.length > 0) {
      let validationException = validationCustomizer({ operation: operationName }, validationFailures);
      if (validationException) {
        return serializer.serializeError(validationException, serdeContextBase);
      }
    }
    let output = await operation(input, context);
    return serializer.serialize(output, serdeContextBase);
  } catch(error: unknown) {
    if (serializer.isOperationError(error)) {
      return serializer.serializeError(error, serdeContextBase);
    }
    console.log('Received an unexpected error', error);
    return serializeFrameworkException(new __InternalFailureException(), serdeContextBase);
  }
}
export class YapePayServiceServiceHandler<Context> implements __ServiceHandler<Context> {
  private readonly service: YapePayServiceService<Context>;
  private readonly mux: __Mux<"YapePayService", YapePayServiceServiceOperations>;
  private readonly serializerFactory: <T extends YapePayServiceServiceOperations>(operation: T) => __OperationSerializer<YapePayServiceService<Context>, T, __ServiceException>;
  private readonly serializeFrameworkException: (e: __SmithyFrameworkException, ctx: __ServerSerdeContext) => Promise<__HttpResponse>;
  private readonly validationCustomizer: __ValidationCustomizer<YapePayServiceServiceOperations>;
  /**
   * Construct a YapePayServiceService handler.
   * @param service The {@link YapePayServiceService} implementation that supplies the business logic for YapePayServiceService
   * @param mux The {@link __Mux} that determines which service and operation are being invoked by a given {@link __HttpRequest}
   * @param serializerFactory A factory for an {@link __OperationSerializer} for each operation in YapePayServiceService that
   *                          handles deserialization of requests and serialization of responses
   * @param serializeFrameworkException A function that can serialize {@link __SmithyFrameworkException}s
   * @param validationCustomizer A {@link __ValidationCustomizer} for turning validation failures into {@link __SmithyFrameworkException}s
   */
  constructor(
    service: YapePayServiceService<Context>,
    mux: __Mux<"YapePayService", YapePayServiceServiceOperations>,
    serializerFactory:<T extends YapePayServiceServiceOperations>(op: T) => __OperationSerializer<YapePayServiceService<Context>, T, __ServiceException>,
    serializeFrameworkException: (e: __SmithyFrameworkException, ctx: __ServerSerdeContext) => Promise<__HttpResponse>,
    validationCustomizer: __ValidationCustomizer<YapePayServiceServiceOperations>
  ) {
    this.service = service;
    this.mux = mux;
    this.serializerFactory = serializerFactory;
    this.serializeFrameworkException = serializeFrameworkException;
    this.validationCustomizer = validationCustomizer;
  }
  async handle(request: __HttpRequest, context: Context): Promise<__HttpResponse> {
    const target = this.mux.match(request);
    if (target === undefined) {
      return this.serializeFrameworkException(new __UnknownOperationException(), serdeContextBase);
    }
    switch (target.operation) {
      case "CreateRechargeOperation" : {
        return handle(request, context, "CreateRechargeOperation", this.serializerFactory("CreateRechargeOperation"), this.service.CreateRechargeOperation, this.serializeFrameworkException, CreateRechargeOperationServerInput.validate, this.validationCustomizer);
      }
      case "CreateTransactionOperation" : {
        return handle(request, context, "CreateTransactionOperation", this.serializerFactory("CreateTransactionOperation"), this.service.CreateTransactionOperation, this.serializeFrameworkException, CreateTransactionOperationServerInput.validate, this.validationCustomizer);
      }
      case "GenerateQROperation" : {
        return handle(request, context, "GenerateQROperation", this.serializerFactory("GenerateQROperation"), this.service.GenerateQROperation, this.serializeFrameworkException, GenerateQROperationServerInput.validate, this.validationCustomizer);
      }
      case "GetCurrentUserOperation" : {
        return handle(request, context, "GetCurrentUserOperation", this.serializerFactory("GetCurrentUserOperation"), this.service.GetCurrentUserOperation, this.serializeFrameworkException, GetCurrentUserOperationServerInput.validate, this.validationCustomizer);
      }
      case "GetMyWalletOperation" : {
        return handle(request, context, "GetMyWalletOperation", this.serializerFactory("GetMyWalletOperation"), this.service.GetMyWalletOperation, this.serializeFrameworkException, GetMyWalletOperationServerInput.validate, this.validationCustomizer);
      }
      case "GetQROperation" : {
        return handle(request, context, "GetQROperation", this.serializerFactory("GetQROperation"), this.service.GetQROperation, this.serializeFrameworkException, GetQROperationServerInput.validate, this.validationCustomizer);
      }
      case "GetTransactionOperation" : {
        return handle(request, context, "GetTransactionOperation", this.serializerFactory("GetTransactionOperation"), this.service.GetTransactionOperation, this.serializeFrameworkException, GetTransactionOperationServerInput.validate, this.validationCustomizer);
      }
      case "ListTransactionsOperation" : {
        return handle(request, context, "ListTransactionsOperation", this.serializerFactory("ListTransactionsOperation"), this.service.ListTransactionsOperation, this.serializeFrameworkException, ListTransactionsOperationServerInput.validate, this.validationCustomizer);
      }
      case "LoginOperation" : {
        return handle(request, context, "LoginOperation", this.serializerFactory("LoginOperation"), this.service.LoginOperation, this.serializeFrameworkException, LoginOperationServerInput.validate, this.validationCustomizer);
      }
      case "RefreshTokenOperation" : {
        return handle(request, context, "RefreshTokenOperation", this.serializerFactory("RefreshTokenOperation"), this.service.RefreshTokenOperation, this.serializeFrameworkException, RefreshTokenOperationServerInput.validate, this.validationCustomizer);
      }
      case "UpdateCurrentUserOperation" : {
        return handle(request, context, "UpdateCurrentUserOperation", this.serializerFactory("UpdateCurrentUserOperation"), this.service.UpdateCurrentUserOperation, this.serializeFrameworkException, UpdateCurrentUserOperationServerInput.validate, this.validationCustomizer);
      }
    }
  }
}

export const getYapePayServiceServiceHandler = <Context>(service: YapePayServiceService<Context>, customizer: __ValidationCustomizer<YapePayServiceServiceOperations>): __ServiceHandler<Context, __HttpRequest, __HttpResponse> => {
  const mux = new httpbinding.HttpBindingMux<"YapePayService", keyof YapePayServiceService<Context>>([
    new httpbinding.UriSpec<"YapePayService", "CreateRechargeOperation">(
      'POST',
      [
        { type: 'path_literal', value: "v1" },
        { type: 'path_literal', value: "recargas" },
      ],
      [
      ],
      { service: "YapePayService", operation: "CreateRechargeOperation" }),
    new httpbinding.UriSpec<"YapePayService", "CreateTransactionOperation">(
      'POST',
      [
        { type: 'path_literal', value: "v1" },
        { type: 'path_literal', value: "transacciones" },
      ],
      [
      ],
      { service: "YapePayService", operation: "CreateTransactionOperation" }),
    new httpbinding.UriSpec<"YapePayService", "GenerateQROperation">(
      'POST',
      [
        { type: 'path_literal', value: "v1" },
        { type: 'path_literal', value: "qr" },
      ],
      [
      ],
      { service: "YapePayService", operation: "GenerateQROperation" }),
    new httpbinding.UriSpec<"YapePayService", "GetCurrentUserOperation">(
      'GET',
      [
        { type: 'path_literal', value: "v1" },
        { type: 'path_literal', value: "usuarios" },
        { type: 'path_literal', value: "me" },
      ],
      [
      ],
      { service: "YapePayService", operation: "GetCurrentUserOperation" }),
    new httpbinding.UriSpec<"YapePayService", "GetMyWalletOperation">(
      'GET',
      [
        { type: 'path_literal', value: "v1" },
        { type: 'path_literal', value: "billeteras" },
        { type: 'path_literal', value: "me" },
      ],
      [
      ],
      { service: "YapePayService", operation: "GetMyWalletOperation" }),
    new httpbinding.UriSpec<"YapePayService", "GetQROperation">(
      'GET',
      [
        { type: 'path_literal', value: "v1" },
        { type: 'path_literal', value: "qr" },
        { type: 'path' },
      ],
      [
      ],
      { service: "YapePayService", operation: "GetQROperation" }),
    new httpbinding.UriSpec<"YapePayService", "GetTransactionOperation">(
      'GET',
      [
        { type: 'path_literal', value: "v1" },
        { type: 'path_literal', value: "transacciones" },
        { type: 'path' },
      ],
      [
      ],
      { service: "YapePayService", operation: "GetTransactionOperation" }),
    new httpbinding.UriSpec<"YapePayService", "ListTransactionsOperation">(
      'GET',
      [
        { type: 'path_literal', value: "v1" },
        { type: 'path_literal', value: "transacciones" },
      ],
      [
      ],
      { service: "YapePayService", operation: "ListTransactionsOperation" }),
    new httpbinding.UriSpec<"YapePayService", "LoginOperation">(
      'POST',
      [
        { type: 'path_literal', value: "v1" },
        { type: 'path_literal', value: "auth" },
        { type: 'path_literal', value: "login" },
      ],
      [
      ],
      { service: "YapePayService", operation: "LoginOperation" }),
    new httpbinding.UriSpec<"YapePayService", "RefreshTokenOperation">(
      'POST',
      [
        { type: 'path_literal', value: "v1" },
        { type: 'path_literal', value: "auth" },
        { type: 'path_literal', value: "refresh" },
      ],
      [
      ],
      { service: "YapePayService", operation: "RefreshTokenOperation" }),
    new httpbinding.UriSpec<"YapePayService", "UpdateCurrentUserOperation">(
      'PATCH',
      [
        { type: 'path_literal', value: "v1" },
        { type: 'path_literal', value: "usuarios" },
        { type: 'path_literal', value: "me" },
      ],
      [
      ],
      { service: "YapePayService", operation: "UpdateCurrentUserOperation" }),
  ]);
  const serFn: (op: YapePayServiceServiceOperations) => __OperationSerializer<YapePayServiceService<Context>, YapePayServiceServiceOperations, __ServiceException> = (op) => {
    switch (op) {
      case "CreateRechargeOperation": return new CreateRechargeOperationSerializer();
      case "CreateTransactionOperation": return new CreateTransactionOperationSerializer();
      case "GenerateQROperation": return new GenerateQROperationSerializer();
      case "GetCurrentUserOperation": return new GetCurrentUserOperationSerializer();
      case "GetMyWalletOperation": return new GetMyWalletOperationSerializer();
      case "GetQROperation": return new GetQROperationSerializer();
      case "GetTransactionOperation": return new GetTransactionOperationSerializer();
      case "ListTransactionsOperation": return new ListTransactionsOperationSerializer();
      case "LoginOperation": return new LoginOperationSerializer();
      case "RefreshTokenOperation": return new RefreshTokenOperationSerializer();
      case "UpdateCurrentUserOperation": return new UpdateCurrentUserOperationSerializer();
    }
  };
  return new YapePayServiceServiceHandler(service, mux, serFn, serializeFrameworkException, customizer);
}
