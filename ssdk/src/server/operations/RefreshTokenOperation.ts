// smithy-typescript generated code
import {
  InternalServerException,
  RefreshTokenInput,
  RefreshTokenOutput,
  UnauthorizedException,
  ValidationException,
} from "../../models/models_0";
import {
  deserializeRefreshTokenOperationRequest,
  serializeFrameworkException,
  serializeInternalServerExceptionError,
  serializeRefreshTokenOperationResponse,
  serializeUnauthorizedExceptionError,
  serializeValidationExceptionError,
} from "../../protocols/Aws_restJson1";
import { YapePayServiceService } from "../YapePayServiceService";
import {
  RefreshTokenOperation,
  RefreshTokenOperationErrors,
  RefreshTokenOperationHandler,
  RefreshTokenOperationSerializer,
  RefreshTokenOperationServerInput,
  RefreshTokenOperationServerOutput,
} from "./RefreshTokenOperation";
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

export type RefreshTokenOperation<Context> = __Operation<RefreshTokenOperationServerInput, RefreshTokenOperationServerOutput, Context>

export interface RefreshTokenOperationServerInput extends RefreshTokenInput {}
export namespace RefreshTokenOperationServerInput {
  /**
   * @internal
   */
  export const validate: (obj: Parameters<typeof RefreshTokenInput.validate>[0]) => __ValidationFailure[] = RefreshTokenInput.validate;
}
export interface RefreshTokenOperationServerOutput extends RefreshTokenOutput {}

export type RefreshTokenOperationErrors = ValidationException | UnauthorizedException | InternalServerException

export class RefreshTokenOperationSerializer implements __OperationSerializer<YapePayServiceService<any>, "RefreshTokenOperation", RefreshTokenOperationErrors> {
  serialize = serializeRefreshTokenOperationResponse;
  deserialize = deserializeRefreshTokenOperationRequest;

  isOperationError(error: any): error is RefreshTokenOperationErrors {
    const names: RefreshTokenOperationErrors['name'][] = ["ValidationException", "UnauthorizedException", "InternalServerException"];
    return names.includes(error.name);
  };

  serializeError(error: RefreshTokenOperationErrors, ctx: ServerSerdeContext): Promise<__HttpResponse> {
    switch (error.name) {
      case "ValidationException": {
        return serializeValidationExceptionError(error, ctx);
      }
      case "UnauthorizedException": {
        return serializeUnauthorizedExceptionError(error, ctx);
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

export const getRefreshTokenOperationHandler = <Context>(operation: __Operation<RefreshTokenOperationServerInput, RefreshTokenOperationServerOutput, Context>, customizer: __ValidationCustomizer<"RefreshTokenOperation">): __ServiceHandler<Context, __HttpRequest, __HttpResponse> => {
  const mux = new httpbinding.HttpBindingMux<"YapePayService", "RefreshTokenOperation">([
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
  ]);
  return new RefreshTokenOperationHandler(operation, mux, new RefreshTokenOperationSerializer(), serializeFrameworkException, customizer);
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
export class RefreshTokenOperationHandler<Context> implements __ServiceHandler<Context> {
  private readonly operation: __Operation<RefreshTokenOperationServerInput, RefreshTokenOperationServerOutput, Context>;
  private readonly mux: __Mux<"YapePayService", "RefreshTokenOperation">;
  private readonly serializer: __OperationSerializer<YapePayServiceService<Context>, "RefreshTokenOperation", RefreshTokenOperationErrors>;
  private readonly serializeFrameworkException: (e: __SmithyFrameworkException, ctx: __ServerSerdeContext) => Promise<__HttpResponse>;
  private readonly validationCustomizer: __ValidationCustomizer<"RefreshTokenOperation">;
  /**
   * Construct a RefreshTokenOperation handler.
   * @param operation The {@link __Operation} implementation that supplies the business logic for RefreshTokenOperation
   * @param mux The {@link __Mux} that verifies which service and operation are being invoked by a given {@link __HttpRequest}
   * @param serializer An {@link __OperationSerializer} for RefreshTokenOperation that
   *                   handles deserialization of requests and serialization of responses
   * @param serializeFrameworkException A function that can serialize {@link __SmithyFrameworkException}s
   * @param validationCustomizer A {@link __ValidationCustomizer} for turning validation failures into {@link __SmithyFrameworkException}s
   */
  constructor(
    operation: __Operation<RefreshTokenOperationServerInput, RefreshTokenOperationServerOutput, Context>,
    mux: __Mux<"YapePayService", "RefreshTokenOperation">,
    serializer: __OperationSerializer<YapePayServiceService<Context>, "RefreshTokenOperation", RefreshTokenOperationErrors>,
    serializeFrameworkException: (e: __SmithyFrameworkException, ctx: __ServerSerdeContext) => Promise<__HttpResponse>,
    validationCustomizer: __ValidationCustomizer<"RefreshTokenOperation">
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
      console.log('Received a request that did not match com.yapepay.api#YapePayService.RefreshTokenOperation. This indicates a misconfiguration.');
      return this.serializeFrameworkException(new __InternalFailureException(), serdeContextBase);
    }
    return handle(request, context, "RefreshTokenOperation", this.serializer, this.operation, this.serializeFrameworkException, RefreshTokenOperationServerInput.validate, this.validationCustomizer);
  }
}
