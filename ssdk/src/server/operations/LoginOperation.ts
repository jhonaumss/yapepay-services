// smithy-typescript generated code
import {
  InternalServerException,
  LoginInput,
  LoginOutput,
  UnauthorizedException,
  ValidationException,
} from "../../models/models_0";
import {
  deserializeLoginOperationRequest,
  serializeFrameworkException,
  serializeInternalServerExceptionError,
  serializeLoginOperationResponse,
  serializeUnauthorizedExceptionError,
  serializeValidationExceptionError,
} from "../../protocols/Aws_restJson1";
import { YapePayServiceService } from "../YapePayServiceService";
import {
  LoginOperation,
  LoginOperationErrors,
  LoginOperationHandler,
  LoginOperationSerializer,
  LoginOperationServerInput,
  LoginOperationServerOutput,
} from "./LoginOperation";
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

export type LoginOperation<Context> = __Operation<LoginOperationServerInput, LoginOperationServerOutput, Context>

export interface LoginOperationServerInput extends LoginInput {}
export namespace LoginOperationServerInput {
  /**
   * @internal
   */
  export const validate: (obj: Parameters<typeof LoginInput.validate>[0]) => __ValidationFailure[] = LoginInput.validate;
}
export interface LoginOperationServerOutput extends LoginOutput {}

export type LoginOperationErrors = ValidationException | UnauthorizedException | InternalServerException

export class LoginOperationSerializer implements __OperationSerializer<YapePayServiceService<any>, "LoginOperation", LoginOperationErrors> {
  serialize = serializeLoginOperationResponse;
  deserialize = deserializeLoginOperationRequest;

  isOperationError(error: any): error is LoginOperationErrors {
    const names: LoginOperationErrors['name'][] = ["ValidationException", "UnauthorizedException", "InternalServerException"];
    return names.includes(error.name);
  };

  serializeError(error: LoginOperationErrors, ctx: ServerSerdeContext): Promise<__HttpResponse> {
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

export const getLoginOperationHandler = <Context>(operation: __Operation<LoginOperationServerInput, LoginOperationServerOutput, Context>, customizer: __ValidationCustomizer<"LoginOperation">): __ServiceHandler<Context, __HttpRequest, __HttpResponse> => {
  const mux = new httpbinding.HttpBindingMux<"YapePayService", "LoginOperation">([
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
  ]);
  return new LoginOperationHandler(operation, mux, new LoginOperationSerializer(), serializeFrameworkException, customizer);
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
export class LoginOperationHandler<Context> implements __ServiceHandler<Context> {
  private readonly operation: __Operation<LoginOperationServerInput, LoginOperationServerOutput, Context>;
  private readonly mux: __Mux<"YapePayService", "LoginOperation">;
  private readonly serializer: __OperationSerializer<YapePayServiceService<Context>, "LoginOperation", LoginOperationErrors>;
  private readonly serializeFrameworkException: (e: __SmithyFrameworkException, ctx: __ServerSerdeContext) => Promise<__HttpResponse>;
  private readonly validationCustomizer: __ValidationCustomizer<"LoginOperation">;
  /**
   * Construct a LoginOperation handler.
   * @param operation The {@link __Operation} implementation that supplies the business logic for LoginOperation
   * @param mux The {@link __Mux} that verifies which service and operation are being invoked by a given {@link __HttpRequest}
   * @param serializer An {@link __OperationSerializer} for LoginOperation that
   *                   handles deserialization of requests and serialization of responses
   * @param serializeFrameworkException A function that can serialize {@link __SmithyFrameworkException}s
   * @param validationCustomizer A {@link __ValidationCustomizer} for turning validation failures into {@link __SmithyFrameworkException}s
   */
  constructor(
    operation: __Operation<LoginOperationServerInput, LoginOperationServerOutput, Context>,
    mux: __Mux<"YapePayService", "LoginOperation">,
    serializer: __OperationSerializer<YapePayServiceService<Context>, "LoginOperation", LoginOperationErrors>,
    serializeFrameworkException: (e: __SmithyFrameworkException, ctx: __ServerSerdeContext) => Promise<__HttpResponse>,
    validationCustomizer: __ValidationCustomizer<"LoginOperation">
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
      console.log('Received a request that did not match com.yapepay.api#YapePayService.LoginOperation. This indicates a misconfiguration.');
      return this.serializeFrameworkException(new __InternalFailureException(), serdeContextBase);
    }
    return handle(request, context, "LoginOperation", this.serializer, this.operation, this.serializeFrameworkException, LoginOperationServerInput.validate, this.validationCustomizer);
  }
}
