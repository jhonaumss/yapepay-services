// smithy-typescript generated code
import {
  ConflictException,
  CreateTransactionInput,
  CreateTransactionOutput,
  ForbiddenException,
  InsufficientFundsException,
  InternalServerException,
  ResourceNotFoundException,
  UnauthorizedException,
  ValidationException,
} from "../../models/models_0";
import {
  deserializeCreateTransactionOperationRequest,
  serializeConflictExceptionError,
  serializeCreateTransactionOperationResponse,
  serializeForbiddenExceptionError,
  serializeFrameworkException,
  serializeInsufficientFundsExceptionError,
  serializeInternalServerExceptionError,
  serializeResourceNotFoundExceptionError,
  serializeUnauthorizedExceptionError,
  serializeValidationExceptionError,
} from "../../protocols/Aws_restJson1";
import { YapePayServiceService } from "../YapePayServiceService";
import {
  CreateTransactionOperation,
  CreateTransactionOperationErrors,
  CreateTransactionOperationHandler,
  CreateTransactionOperationSerializer,
  CreateTransactionOperationServerInput,
  CreateTransactionOperationServerOutput,
} from "./CreateTransactionOperation";
import {
  ServerSerdeContext,
  ServiceException as __BaseException,
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

export type CreateTransactionOperation<Context> = __Operation<CreateTransactionOperationServerInput, CreateTransactionOperationServerOutput, Context>

export interface CreateTransactionOperationServerInput extends CreateTransactionInput {}
export namespace CreateTransactionOperationServerInput {
  /**
   * @internal
   */
  export const validate: (obj: Parameters<typeof CreateTransactionInput.validate>[0]) => __ValidationFailure[] = CreateTransactionInput.validate;
}
export interface CreateTransactionOperationServerOutput extends CreateTransactionOutput {}

export type CreateTransactionOperationErrors = ValidationException | UnauthorizedException | ForbiddenException | ResourceNotFoundException | InsufficientFundsException | ConflictException | InternalServerException

export class CreateTransactionOperationSerializer implements __OperationSerializer<YapePayServiceService<any>, "CreateTransactionOperation", CreateTransactionOperationErrors> {
  serialize = serializeCreateTransactionOperationResponse;
  deserialize = deserializeCreateTransactionOperationRequest;

  isOperationError(error: any): error is CreateTransactionOperationErrors {
    const names: CreateTransactionOperationErrors['name'][] = ["ValidationException", "UnauthorizedException", "ForbiddenException", "ResourceNotFoundException", "InsufficientFundsException", "ConflictException", "InternalServerException"];
    return names.includes(error.name);
  };

  serializeError(error: CreateTransactionOperationErrors, ctx: ServerSerdeContext): Promise<__HttpResponse> {
    switch (error.name) {
      case "ValidationException": {
        return serializeValidationExceptionError(error, ctx);
      }
      case "UnauthorizedException": {
        return serializeUnauthorizedExceptionError(error, ctx);
      }
      case "ForbiddenException": {
        return serializeForbiddenExceptionError(error, ctx);
      }
      case "ResourceNotFoundException": {
        return serializeResourceNotFoundExceptionError(error, ctx);
      }
      case "InsufficientFundsException": {
        return serializeInsufficientFundsExceptionError(error, ctx);
      }
      case "ConflictException": {
        return serializeConflictExceptionError(error, ctx);
      }
      case "InternalServerException": {
        return serializeInternalServerExceptionError(error, ctx);
      }
      default: {
        throw error;
      }
    }
  }

}

export const getCreateTransactionOperationHandler = <Context>(operation: __Operation<CreateTransactionOperationServerInput, CreateTransactionOperationServerOutput, Context>, customizer: __ValidationCustomizer<"CreateTransactionOperation">): __ServiceHandler<Context, __HttpRequest, __HttpResponse> => {
  const mux = new httpbinding.HttpBindingMux<"YapePayService", "CreateTransactionOperation">([
    new httpbinding.UriSpec<"YapePayService", "CreateTransactionOperation">(
      'POST',
      [
        { type: 'path_literal', value: "v1" },
        { type: 'path_literal', value: "transacciones" },
      ],
      [
      ],
      { service: "YapePayService", operation: "CreateTransactionOperation" }),
  ]);
  return new CreateTransactionOperationHandler(operation, mux, new CreateTransactionOperationSerializer(), serializeFrameworkException, customizer);
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
export class CreateTransactionOperationHandler<Context> implements __ServiceHandler<Context> {
  private readonly operation: __Operation<CreateTransactionOperationServerInput, CreateTransactionOperationServerOutput, Context>;
  private readonly mux: __Mux<"YapePayService", "CreateTransactionOperation">;
  private readonly serializer: __OperationSerializer<YapePayServiceService<Context>, "CreateTransactionOperation", CreateTransactionOperationErrors>;
  private readonly serializeFrameworkException: (e: __SmithyFrameworkException, ctx: __ServerSerdeContext) => Promise<__HttpResponse>;
  private readonly validationCustomizer: __ValidationCustomizer<"CreateTransactionOperation">;
  /**
   * Construct a CreateTransactionOperation handler.
   * @param operation The {@link __Operation} implementation that supplies the business logic for CreateTransactionOperation
   * @param mux The {@link __Mux} that verifies which service and operation are being invoked by a given {@link __HttpRequest}
   * @param serializer An {@link __OperationSerializer} for CreateTransactionOperation that
   *                   handles deserialization of requests and serialization of responses
   * @param serializeFrameworkException A function that can serialize {@link __SmithyFrameworkException}s
   * @param validationCustomizer A {@link __ValidationCustomizer} for turning validation failures into {@link __SmithyFrameworkException}s
   */
  constructor(
    operation: __Operation<CreateTransactionOperationServerInput, CreateTransactionOperationServerOutput, Context>,
    mux: __Mux<"YapePayService", "CreateTransactionOperation">,
    serializer: __OperationSerializer<YapePayServiceService<Context>, "CreateTransactionOperation", CreateTransactionOperationErrors>,
    serializeFrameworkException: (e: __SmithyFrameworkException, ctx: __ServerSerdeContext) => Promise<__HttpResponse>,
    validationCustomizer: __ValidationCustomizer<"CreateTransactionOperation">
  ) {
    this.operation = operation;
    this.mux = mux;
    this.serializer = serializer;
    this.serializeFrameworkException = serializeFrameworkException;
    this.validationCustomizer = validationCustomizer;
  }
  async handle(request: __HttpRequest, context: Context): Promise<__HttpResponse> {
    const target = this.mux.match(request);
    if (target === undefined) {
      console.log('Received a request that did not match com.yapepay.api#YapePayService.CreateTransactionOperation. This indicates a misconfiguration.');
      return this.serializeFrameworkException(new __InternalFailureException(), serdeContextBase);
    }
    return handle(request, context, "CreateTransactionOperation", this.serializer, this.operation, this.serializeFrameworkException, CreateTransactionOperationServerInput.validate, this.validationCustomizer);
  }
}
