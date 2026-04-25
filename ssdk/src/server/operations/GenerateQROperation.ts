// smithy-typescript generated code
import {
  GenerateQRInput,
  GenerateQROutput,
  InternalServerException,
  UnauthorizedException,
  ValidationException,
} from "../../models/models_0";
import {
  deserializeGenerateQROperationRequest,
  serializeFrameworkException,
  serializeGenerateQROperationResponse,
  serializeInternalServerExceptionError,
  serializeUnauthorizedExceptionError,
  serializeValidationExceptionError,
} from "../../protocols/Aws_restJson1";
import { YapePayServiceService } from "../YapePayServiceService";
import {
  GenerateQROperation,
  GenerateQROperationErrors,
  GenerateQROperationHandler,
  GenerateQROperationSerializer,
  GenerateQROperationServerInput,
  GenerateQROperationServerOutput,
} from "./GenerateQROperation";
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

export type GenerateQROperation<Context> = __Operation<GenerateQROperationServerInput, GenerateQROperationServerOutput, Context>

export interface GenerateQROperationServerInput extends GenerateQRInput {}
export namespace GenerateQROperationServerInput {
  /**
   * @internal
   */
  export const validate: (obj: Parameters<typeof GenerateQRInput.validate>[0]) => __ValidationFailure[] = GenerateQRInput.validate;
}
export interface GenerateQROperationServerOutput extends GenerateQROutput {}

export type GenerateQROperationErrors = ValidationException | UnauthorizedException | InternalServerException

export class GenerateQROperationSerializer implements __OperationSerializer<YapePayServiceService<any>, "GenerateQROperation", GenerateQROperationErrors> {
  serialize = serializeGenerateQROperationResponse;
  deserialize = deserializeGenerateQROperationRequest;

  isOperationError(error: any): error is GenerateQROperationErrors {
    const names: GenerateQROperationErrors['name'][] = ["ValidationException", "UnauthorizedException", "InternalServerException"];
    return names.includes(error.name);
  };

  serializeError(error: GenerateQROperationErrors, ctx: ServerSerdeContext): Promise<__HttpResponse> {
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

export const getGenerateQROperationHandler = <Context>(operation: __Operation<GenerateQROperationServerInput, GenerateQROperationServerOutput, Context>, customizer: __ValidationCustomizer<"GenerateQROperation">): __ServiceHandler<Context, __HttpRequest, __HttpResponse> => {
  const mux = new httpbinding.HttpBindingMux<"YapePayService", "GenerateQROperation">([
    new httpbinding.UriSpec<"YapePayService", "GenerateQROperation">(
      'POST',
      [
        { type: 'path_literal', value: "v1" },
        { type: 'path_literal', value: "qr" },
      ],
      [
      ],
      { service: "YapePayService", operation: "GenerateQROperation" }),
  ]);
  return new GenerateQROperationHandler(operation, mux, new GenerateQROperationSerializer(), serializeFrameworkException, customizer);
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
export class GenerateQROperationHandler<Context> implements __ServiceHandler<Context> {
  private readonly operation: __Operation<GenerateQROperationServerInput, GenerateQROperationServerOutput, Context>;
  private readonly mux: __Mux<"YapePayService", "GenerateQROperation">;
  private readonly serializer: __OperationSerializer<YapePayServiceService<Context>, "GenerateQROperation", GenerateQROperationErrors>;
  private readonly serializeFrameworkException: (e: __SmithyFrameworkException, ctx: __ServerSerdeContext) => Promise<__HttpResponse>;
  private readonly validationCustomizer: __ValidationCustomizer<"GenerateQROperation">;
  /**
   * Construct a GenerateQROperation handler.
   * @param operation The {@link __Operation} implementation that supplies the business logic for GenerateQROperation
   * @param mux The {@link __Mux} that verifies which service and operation are being invoked by a given {@link __HttpRequest}
   * @param serializer An {@link __OperationSerializer} for GenerateQROperation that
   *                   handles deserialization of requests and serialization of responses
   * @param serializeFrameworkException A function that can serialize {@link __SmithyFrameworkException}s
   * @param validationCustomizer A {@link __ValidationCustomizer} for turning validation failures into {@link __SmithyFrameworkException}s
   */
  constructor(
    operation: __Operation<GenerateQROperationServerInput, GenerateQROperationServerOutput, Context>,
    mux: __Mux<"YapePayService", "GenerateQROperation">,
    serializer: __OperationSerializer<YapePayServiceService<Context>, "GenerateQROperation", GenerateQROperationErrors>,
    serializeFrameworkException: (e: __SmithyFrameworkException, ctx: __ServerSerdeContext) => Promise<__HttpResponse>,
    validationCustomizer: __ValidationCustomizer<"GenerateQROperation">
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
      console.log('Received a request that did not match com.yapepay.api#YapePayService.GenerateQROperation. This indicates a misconfiguration.');
      return this.serializeFrameworkException(new __InternalFailureException(), serdeContextBase);
    }
    return handle(request, context, "GenerateQROperation", this.serializer, this.operation, this.serializeFrameworkException, GenerateQROperationServerInput.validate, this.validationCustomizer);
  }
}
