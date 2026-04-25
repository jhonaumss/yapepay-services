// smithy-typescript generated code
import {
  ForbiddenException,
  GetTransactionInput,
  GetTransactionOutput,
  InternalServerException,
  ResourceNotFoundException,
  UnauthorizedException,
} from "../../models/models_0";
import {
  deserializeGetTransactionOperationRequest,
  serializeForbiddenExceptionError,
  serializeFrameworkException,
  serializeGetTransactionOperationResponse,
  serializeInternalServerExceptionError,
  serializeResourceNotFoundExceptionError,
  serializeUnauthorizedExceptionError,
} from "../../protocols/Aws_restJson1";
import { YapePayServiceService } from "../YapePayServiceService";
import {
  GetTransactionOperation,
  GetTransactionOperationErrors,
  GetTransactionOperationHandler,
  GetTransactionOperationSerializer,
  GetTransactionOperationServerInput,
  GetTransactionOperationServerOutput,
} from "./GetTransactionOperation";
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

export type GetTransactionOperation<Context> = __Operation<GetTransactionOperationServerInput, GetTransactionOperationServerOutput, Context>

export interface GetTransactionOperationServerInput extends GetTransactionInput {}
export namespace GetTransactionOperationServerInput {
  /**
   * @internal
   */
  export const validate: (obj: Parameters<typeof GetTransactionInput.validate>[0]) => __ValidationFailure[] = GetTransactionInput.validate;
}
export interface GetTransactionOperationServerOutput extends GetTransactionOutput {}

export type GetTransactionOperationErrors = UnauthorizedException | ForbiddenException | ResourceNotFoundException | InternalServerException

export class GetTransactionOperationSerializer implements __OperationSerializer<YapePayServiceService<any>, "GetTransactionOperation", GetTransactionOperationErrors> {
  serialize = serializeGetTransactionOperationResponse;
  deserialize = deserializeGetTransactionOperationRequest;

  isOperationError(error: any): error is GetTransactionOperationErrors {
    const names: GetTransactionOperationErrors['name'][] = ["UnauthorizedException", "ForbiddenException", "ResourceNotFoundException", "InternalServerException"];
    return names.includes(error.name);
  };

  serializeError(error: GetTransactionOperationErrors, ctx: ServerSerdeContext): Promise<__HttpResponse> {
    switch (error.name) {
      case "UnauthorizedException": {
        return serializeUnauthorizedExceptionError(error, ctx);
      }
      case "ForbiddenException": {
        return serializeForbiddenExceptionError(error, ctx);
      }
      case "ResourceNotFoundException": {
        return serializeResourceNotFoundExceptionError(error, ctx);
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

export const getGetTransactionOperationHandler = <Context>(operation: __Operation<GetTransactionOperationServerInput, GetTransactionOperationServerOutput, Context>, customizer: __ValidationCustomizer<"GetTransactionOperation">): __ServiceHandler<Context, __HttpRequest, __HttpResponse> => {
  const mux = new httpbinding.HttpBindingMux<"YapePayService", "GetTransactionOperation">([
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
  ]);
  return new GetTransactionOperationHandler(operation, mux, new GetTransactionOperationSerializer(), serializeFrameworkException, customizer);
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
export class GetTransactionOperationHandler<Context> implements __ServiceHandler<Context> {
  private readonly operation: __Operation<GetTransactionOperationServerInput, GetTransactionOperationServerOutput, Context>;
  private readonly mux: __Mux<"YapePayService", "GetTransactionOperation">;
  private readonly serializer: __OperationSerializer<YapePayServiceService<Context>, "GetTransactionOperation", GetTransactionOperationErrors>;
  private readonly serializeFrameworkException: (e: __SmithyFrameworkException, ctx: __ServerSerdeContext) => Promise<__HttpResponse>;
  private readonly validationCustomizer: __ValidationCustomizer<"GetTransactionOperation">;
  /**
   * Construct a GetTransactionOperation handler.
   * @param operation The {@link __Operation} implementation that supplies the business logic for GetTransactionOperation
   * @param mux The {@link __Mux} that verifies which service and operation are being invoked by a given {@link __HttpRequest}
   * @param serializer An {@link __OperationSerializer} for GetTransactionOperation that
   *                   handles deserialization of requests and serialization of responses
   * @param serializeFrameworkException A function that can serialize {@link __SmithyFrameworkException}s
   * @param validationCustomizer A {@link __ValidationCustomizer} for turning validation failures into {@link __SmithyFrameworkException}s
   */
  constructor(
    operation: __Operation<GetTransactionOperationServerInput, GetTransactionOperationServerOutput, Context>,
    mux: __Mux<"YapePayService", "GetTransactionOperation">,
    serializer: __OperationSerializer<YapePayServiceService<Context>, "GetTransactionOperation", GetTransactionOperationErrors>,
    serializeFrameworkException: (e: __SmithyFrameworkException, ctx: __ServerSerdeContext) => Promise<__HttpResponse>,
    validationCustomizer: __ValidationCustomizer<"GetTransactionOperation">
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
      console.log('Received a request that did not match com.yapepay.api#YapePayService.GetTransactionOperation. This indicates a misconfiguration.');
      return this.serializeFrameworkException(new __InternalFailureException(), serdeContextBase);
    }
    return handle(request, context, "GetTransactionOperation", this.serializer, this.operation, this.serializeFrameworkException, GetTransactionOperationServerInput.validate, this.validationCustomizer);
  }
}
