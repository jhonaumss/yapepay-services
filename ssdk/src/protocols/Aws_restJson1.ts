// smithy-typescript generated code
import {
  ConflictException,
  FieldError,
  ForbiddenException,
  InsufficientFundsException,
  InternalServerException,
  QRCode,
  ResourceNotFoundException,
  Transaction,
  UnauthorizedException,
  UpdateUserPayload,
  UserProfile,
  ValidationException,
  Wallet,
} from "../models/models_0";
import {
  CreateRechargeOperationServerInput,
  CreateRechargeOperationServerOutput,
} from "../server/operations/CreateRechargeOperation";
import {
  CreateTransactionOperationServerInput,
  CreateTransactionOperationServerOutput,
} from "../server/operations/CreateTransactionOperation";
import {
  GenerateQROperationServerInput,
  GenerateQROperationServerOutput,
} from "../server/operations/GenerateQROperation";
import {
  GetCurrentUserOperationServerInput,
  GetCurrentUserOperationServerOutput,
} from "../server/operations/GetCurrentUserOperation";
import {
  GetMyWalletOperationServerInput,
  GetMyWalletOperationServerOutput,
} from "../server/operations/GetMyWalletOperation";
import {
  GetTransactionOperationServerInput,
  GetTransactionOperationServerOutput,
} from "../server/operations/GetTransactionOperation";
import {
  ListTransactionsOperationServerInput,
  ListTransactionsOperationServerOutput,
} from "../server/operations/ListTransactionsOperation";
import {
  LoginOperationServerInput,
  LoginOperationServerOutput,
} from "../server/operations/LoginOperation";
import {
  RefreshTokenOperationServerInput,
  RefreshTokenOperationServerOutput,
} from "../server/operations/RefreshTokenOperation";
import {
  UpdateCurrentUserOperationServerInput,
  UpdateCurrentUserOperationServerOutput,
} from "../server/operations/UpdateCurrentUserOperation";
import {
  loadRestJsonErrorCode,
  parseJsonBody as parseBody,
  parseJsonErrorBody as parseErrorBody,
} from "@aws-sdk/core";
import {
  ServerSerdeContext,
  ServiceException as __BaseException,
  NotAcceptableException as __NotAcceptableException,
  SerializationException as __SerializationException,
  SmithyFrameworkException as __SmithyFrameworkException,
  UnsupportedMediaTypeException as __UnsupportedMediaTypeException,
  acceptMatches as __acceptMatches,
} from "@aws-smithy/server-common";
import {
  HttpRequest as __HttpRequest,
  HttpResponse as __HttpResponse,
} from "@smithy/protocol-http";
import {
  expectInt32 as __expectInt32,
  expectNonNull as __expectNonNull,
  expectObject as __expectObject,
  expectString as __expectString,
  parseRfc3339DateTime as __parseRfc3339DateTime,
  strictParseInt32 as __strictParseInt32,
  _json,
  collectBody,
  map,
  take,
} from "@smithy/smithy-client";
import {
  Endpoint as __Endpoint,
  ResponseMetadata as __ResponseMetadata,
  SerdeContext as __SerdeContext,
} from "@smithy/types";
import { calculateBodyLength } from "@smithy/util-body-length-node";

export const deserializeCreateRechargeOperationRequest = async(
  output: __HttpRequest,
  context: __SerdeContext
): Promise<CreateRechargeOperationServerInput> => {
  const contentTypeHeaderKey: string | undefined = Object.keys(output.headers).find(key => key.toLowerCase() === 'content-type');
  if (contentTypeHeaderKey != null) {
    const contentType = output.headers[contentTypeHeaderKey];
    if (contentType !== undefined && contentType !== "application/json") {
      throw new __UnsupportedMediaTypeException();
    };
  };
  const acceptHeaderKey: string | undefined = Object.keys(output.headers).find(key => key.toLowerCase() === 'accept');
  if (acceptHeaderKey != null) {
    const accept = output.headers[acceptHeaderKey];
    if (!__acceptMatches(accept, "application/json")) {
      throw new __NotAcceptableException();
    };
  };
  const contents: any = map({
  });
  const data: Record<string, any> = __expectNonNull((__expectObject(await parseBody(output.body, context))), "body");
  const doc = take(data, {
    'amount': __expectString,
    'bankAccountId': __expectString,
    'idempotencyKey': __expectString,
  });
  Object.assign(contents, doc);
  return contents;
}

export const deserializeCreateTransactionOperationRequest = async(
  output: __HttpRequest,
  context: __SerdeContext
): Promise<CreateTransactionOperationServerInput> => {
  const contentTypeHeaderKey: string | undefined = Object.keys(output.headers).find(key => key.toLowerCase() === 'content-type');
  if (contentTypeHeaderKey != null) {
    const contentType = output.headers[contentTypeHeaderKey];
    if (contentType !== undefined && contentType !== "application/json") {
      throw new __UnsupportedMediaTypeException();
    };
  };
  const acceptHeaderKey: string | undefined = Object.keys(output.headers).find(key => key.toLowerCase() === 'accept');
  if (acceptHeaderKey != null) {
    const accept = output.headers[acceptHeaderKey];
    if (!__acceptMatches(accept, "application/json")) {
      throw new __NotAcceptableException();
    };
  };
  const contents: any = map({
  });
  const data: Record<string, any> = __expectNonNull((__expectObject(await parseBody(output.body, context))), "body");
  const doc = take(data, {
    'amount': __expectString,
    'currency': __expectString,
    'description': __expectString,
    'idempotencyKey': __expectString,
    'receiverPhone': __expectString,
  });
  Object.assign(contents, doc);
  return contents;
}

export const deserializeGenerateQROperationRequest = async(
  output: __HttpRequest,
  context: __SerdeContext
): Promise<GenerateQROperationServerInput> => {
  const contentTypeHeaderKey: string | undefined = Object.keys(output.headers).find(key => key.toLowerCase() === 'content-type');
  if (contentTypeHeaderKey != null) {
    const contentType = output.headers[contentTypeHeaderKey];
    if (contentType !== undefined && contentType !== "application/json") {
      throw new __UnsupportedMediaTypeException();
    };
  };
  const acceptHeaderKey: string | undefined = Object.keys(output.headers).find(key => key.toLowerCase() === 'accept');
  if (acceptHeaderKey != null) {
    const accept = output.headers[acceptHeaderKey];
    if (!__acceptMatches(accept, "application/json")) {
      throw new __NotAcceptableException();
    };
  };
  const contents: any = map({
  });
  const data: Record<string, any> = __expectNonNull((__expectObject(await parseBody(output.body, context))), "body");
  const doc = take(data, {
    'amount': __expectString,
    'currency': __expectString,
    'description': __expectString,
    'ttlMinutes': __expectInt32,
  });
  Object.assign(contents, doc);
  return contents;
}

export const deserializeGetCurrentUserOperationRequest = async(
  output: __HttpRequest,
  context: __SerdeContext
): Promise<GetCurrentUserOperationServerInput> => {
  const contentTypeHeaderKey: string | undefined = Object.keys(output.headers).find(key => key.toLowerCase() === 'content-type');
  if (contentTypeHeaderKey != null) {
    const contentType = output.headers[contentTypeHeaderKey];
    if (contentType !== undefined) {
      throw new __UnsupportedMediaTypeException();
    };
  };
  const acceptHeaderKey: string | undefined = Object.keys(output.headers).find(key => key.toLowerCase() === 'accept');
  if (acceptHeaderKey != null) {
    const accept = output.headers[acceptHeaderKey];
    if (!__acceptMatches(accept, "application/json")) {
      throw new __NotAcceptableException();
    };
  };
  const contents: any = map({
  });
  await collectBody(output.body, context);
  return contents;
}

export const deserializeGetMyWalletOperationRequest = async(
  output: __HttpRequest,
  context: __SerdeContext
): Promise<GetMyWalletOperationServerInput> => {
  const contentTypeHeaderKey: string | undefined = Object.keys(output.headers).find(key => key.toLowerCase() === 'content-type');
  if (contentTypeHeaderKey != null) {
    const contentType = output.headers[contentTypeHeaderKey];
    if (contentType !== undefined) {
      throw new __UnsupportedMediaTypeException();
    };
  };
  const acceptHeaderKey: string | undefined = Object.keys(output.headers).find(key => key.toLowerCase() === 'accept');
  if (acceptHeaderKey != null) {
    const accept = output.headers[acceptHeaderKey];
    if (!__acceptMatches(accept, "application/json")) {
      throw new __NotAcceptableException();
    };
  };
  const contents: any = map({
  });
  await collectBody(output.body, context);
  return contents;
}

export const deserializeGetTransactionOperationRequest = async(
  output: __HttpRequest,
  context: __SerdeContext
): Promise<GetTransactionOperationServerInput> => {
  const contentTypeHeaderKey: string | undefined = Object.keys(output.headers).find(key => key.toLowerCase() === 'content-type');
  if (contentTypeHeaderKey != null) {
    const contentType = output.headers[contentTypeHeaderKey];
    if (contentType !== undefined && contentType !== "application/json") {
      throw new __UnsupportedMediaTypeException();
    };
  };
  const acceptHeaderKey: string | undefined = Object.keys(output.headers).find(key => key.toLowerCase() === 'accept');
  if (acceptHeaderKey != null) {
    const accept = output.headers[acceptHeaderKey];
    if (!__acceptMatches(accept, "application/json")) {
      throw new __NotAcceptableException();
    };
  };
  const contents: any = map({
  });
  const pathRegex = new RegExp("/v1/transacciones/(?<txId>[^/]+)");
  const parsedPath = output.path.match(pathRegex);
  if (parsedPath?.groups !== undefined) {
    contents.txId = decodeURIComponent(parsedPath.groups.txId);
  }
  await collectBody(output.body, context);
  return contents;
}

export const deserializeListTransactionsOperationRequest = async(
  output: __HttpRequest,
  context: __SerdeContext
): Promise<ListTransactionsOperationServerInput> => {
  const contentTypeHeaderKey: string | undefined = Object.keys(output.headers).find(key => key.toLowerCase() === 'content-type');
  if (contentTypeHeaderKey != null) {
    const contentType = output.headers[contentTypeHeaderKey];
    if (contentType !== undefined && contentType !== "application/json") {
      throw new __UnsupportedMediaTypeException();
    };
  };
  const acceptHeaderKey: string | undefined = Object.keys(output.headers).find(key => key.toLowerCase() === 'accept');
  if (acceptHeaderKey != null) {
    const accept = output.headers[acceptHeaderKey];
    if (!__acceptMatches(accept, "application/json")) {
      throw new __NotAcceptableException();
    };
  };
  const contents: any = map({
  });
  const query = output.query
  if (query != null) {
    if (query["cursor"] !== undefined) {
      let queryValue: string;
      if (Array.isArray(query["cursor"])) {
        if (query["cursor"].length === 1) {
          queryValue = query["cursor"][0];
        }
        else {
          throw new __SerializationException();
        }
      }
      else {
        queryValue = query["cursor"] as string;
      }
      contents.cursor = queryValue;
    }
    if (query["pageSize"] !== undefined) {
      let queryValue: string;
      if (Array.isArray(query["pageSize"])) {
        if (query["pageSize"].length === 1) {
          queryValue = query["pageSize"][0];
        }
        else {
          throw new __SerializationException();
        }
      }
      else {
        queryValue = query["pageSize"] as string;
      }
      contents.pageSize = __strictParseInt32(queryValue);
    }
    if (query["type"] !== undefined) {
      let queryValue: string;
      if (Array.isArray(query["type"])) {
        if (query["type"].length === 1) {
          queryValue = query["type"][0];
        }
        else {
          throw new __SerializationException();
        }
      }
      else {
        queryValue = query["type"] as string;
      }
      contents.type = queryValue;
    }
    if (query["status"] !== undefined) {
      let queryValue: string;
      if (Array.isArray(query["status"])) {
        if (query["status"].length === 1) {
          queryValue = query["status"][0];
        }
        else {
          throw new __SerializationException();
        }
      }
      else {
        queryValue = query["status"] as string;
      }
      contents.status = queryValue;
    }
    if (query["fromDate"] !== undefined) {
      let queryValue: string;
      if (Array.isArray(query["fromDate"])) {
        if (query["fromDate"].length === 1) {
          queryValue = query["fromDate"][0];
        }
        else {
          throw new __SerializationException();
        }
      }
      else {
        queryValue = query["fromDate"] as string;
      }
      contents.fromDate = __expectNonNull(__parseRfc3339DateTime(queryValue));
    }
    if (query["toDate"] !== undefined) {
      let queryValue: string;
      if (Array.isArray(query["toDate"])) {
        if (query["toDate"].length === 1) {
          queryValue = query["toDate"][0];
        }
        else {
          throw new __SerializationException();
        }
      }
      else {
        queryValue = query["toDate"] as string;
      }
      contents.toDate = __expectNonNull(__parseRfc3339DateTime(queryValue));
    }
  }
  await collectBody(output.body, context);
  return contents;
}

export const deserializeLoginOperationRequest = async(
  output: __HttpRequest,
  context: __SerdeContext
): Promise<LoginOperationServerInput> => {
  const contentTypeHeaderKey: string | undefined = Object.keys(output.headers).find(key => key.toLowerCase() === 'content-type');
  if (contentTypeHeaderKey != null) {
    const contentType = output.headers[contentTypeHeaderKey];
    if (contentType !== undefined && contentType !== "application/json") {
      throw new __UnsupportedMediaTypeException();
    };
  };
  const acceptHeaderKey: string | undefined = Object.keys(output.headers).find(key => key.toLowerCase() === 'accept');
  if (acceptHeaderKey != null) {
    const accept = output.headers[acceptHeaderKey];
    if (!__acceptMatches(accept, "application/json")) {
      throw new __NotAcceptableException();
    };
  };
  const contents: any = map({
  });
  const data: Record<string, any> = __expectNonNull((__expectObject(await parseBody(output.body, context))), "body");
  const doc = take(data, {
    'phoneNumber': __expectString,
    'pinHash': __expectString,
  });
  Object.assign(contents, doc);
  return contents;
}

export const deserializeRefreshTokenOperationRequest = async(
  output: __HttpRequest,
  context: __SerdeContext
): Promise<RefreshTokenOperationServerInput> => {
  const contentTypeHeaderKey: string | undefined = Object.keys(output.headers).find(key => key.toLowerCase() === 'content-type');
  if (contentTypeHeaderKey != null) {
    const contentType = output.headers[contentTypeHeaderKey];
    if (contentType !== undefined && contentType !== "application/json") {
      throw new __UnsupportedMediaTypeException();
    };
  };
  const acceptHeaderKey: string | undefined = Object.keys(output.headers).find(key => key.toLowerCase() === 'accept');
  if (acceptHeaderKey != null) {
    const accept = output.headers[acceptHeaderKey];
    if (!__acceptMatches(accept, "application/json")) {
      throw new __NotAcceptableException();
    };
  };
  const contents: any = map({
  });
  const data: Record<string, any> = __expectNonNull((__expectObject(await parseBody(output.body, context))), "body");
  const doc = take(data, {
    'refreshToken': __expectString,
  });
  Object.assign(contents, doc);
  return contents;
}

export const deserializeUpdateCurrentUserOperationRequest = async(
  output: __HttpRequest,
  context: __SerdeContext
): Promise<UpdateCurrentUserOperationServerInput> => {
  const contentTypeHeaderKey: string | undefined = Object.keys(output.headers).find(key => key.toLowerCase() === 'content-type');
  if (contentTypeHeaderKey != null) {
    const contentType = output.headers[contentTypeHeaderKey];
    if (contentType !== undefined && contentType !== "application/json") {
      throw new __UnsupportedMediaTypeException();
    };
  };
  const acceptHeaderKey: string | undefined = Object.keys(output.headers).find(key => key.toLowerCase() === 'accept');
  if (acceptHeaderKey != null) {
    const accept = output.headers[acceptHeaderKey];
    if (!__acceptMatches(accept, "application/json")) {
      throw new __NotAcceptableException();
    };
  };
  const contents: any = map({
  });
  const data: Record<string, any> = __expectNonNull((__expectObject(await parseBody(output.body, context))), "body");
  const doc = take(data, {
    'updates': _ => de_UpdateUserPayload(_, context),
  });
  Object.assign(contents, doc);
  return contents;
}

export const serializeCreateRechargeOperationResponse = async(
  input: CreateRechargeOperationServerOutput,
  ctx: ServerSerdeContext
): Promise<__HttpResponse> => {
  const context: __SerdeContext = {
    ...ctx,
    endpoint: () => Promise.resolve({
      protocol: '',
      hostname: '',
      path: '',
    }),
  }
  let statusCode: number = 201
  let headers: any = map({}, isSerializableHeaderValue, {
    'content-type': 'application/json',
  });
  let body: any;
  body = JSON.stringify(take(input, {
    'estimatedCreditSeconds': [],
    'transaction': _ => se_Transaction(_, context),
  }));
  if (body && Object.keys(headers).map((str) => str.toLowerCase()).indexOf('content-length') === -1) {
    const length = calculateBodyLength(body);
    if (length !== undefined) {
      headers = { ...headers, 'content-length': String(length) };
    }
  }
  return new __HttpResponse({
    headers,
    body,
    statusCode,
  });
}

export const serializeCreateTransactionOperationResponse = async(
  input: CreateTransactionOperationServerOutput,
  ctx: ServerSerdeContext
): Promise<__HttpResponse> => {
  const context: __SerdeContext = {
    ...ctx,
    endpoint: () => Promise.resolve({
      protocol: '',
      hostname: '',
      path: '',
    }),
  }
  let statusCode: number = 201
  let headers: any = map({}, isSerializableHeaderValue, {
    'content-type': 'application/json',
  });
  let body: any;
  body = JSON.stringify(take(input, {
    'transaction': _ => se_Transaction(_, context),
  }));
  if (body && Object.keys(headers).map((str) => str.toLowerCase()).indexOf('content-length') === -1) {
    const length = calculateBodyLength(body);
    if (length !== undefined) {
      headers = { ...headers, 'content-length': String(length) };
    }
  }
  return new __HttpResponse({
    headers,
    body,
    statusCode,
  });
}

export const serializeGenerateQROperationResponse = async(
  input: GenerateQROperationServerOutput,
  ctx: ServerSerdeContext
): Promise<__HttpResponse> => {
  const context: __SerdeContext = {
    ...ctx,
    endpoint: () => Promise.resolve({
      protocol: '',
      hostname: '',
      path: '',
    }),
  }
  let statusCode: number = 201
  let headers: any = map({}, isSerializableHeaderValue, {
    'content-type': 'application/json',
  });
  let body: any;
  body = JSON.stringify(take(input, {
    'qrCode': _ => se_QRCode(_, context),
  }));
  if (body && Object.keys(headers).map((str) => str.toLowerCase()).indexOf('content-length') === -1) {
    const length = calculateBodyLength(body);
    if (length !== undefined) {
      headers = { ...headers, 'content-length': String(length) };
    }
  }
  return new __HttpResponse({
    headers,
    body,
    statusCode,
  });
}

export const serializeGetCurrentUserOperationResponse = async(
  input: GetCurrentUserOperationServerOutput,
  ctx: ServerSerdeContext
): Promise<__HttpResponse> => {
  const context: __SerdeContext = {
    ...ctx,
    endpoint: () => Promise.resolve({
      protocol: '',
      hostname: '',
      path: '',
    }),
  }
  let statusCode: number = 200
  let headers: any = map({}, isSerializableHeaderValue, {
    'content-type': 'application/json',
  });
  let body: any;
  body = JSON.stringify(take(input, {
    'user': _ => se_UserProfile(_, context),
  }));
  if (body && Object.keys(headers).map((str) => str.toLowerCase()).indexOf('content-length') === -1) {
    const length = calculateBodyLength(body);
    if (length !== undefined) {
      headers = { ...headers, 'content-length': String(length) };
    }
  }
  return new __HttpResponse({
    headers,
    body,
    statusCode,
  });
}

export const serializeGetMyWalletOperationResponse = async(
  input: GetMyWalletOperationServerOutput,
  ctx: ServerSerdeContext
): Promise<__HttpResponse> => {
  const context: __SerdeContext = {
    ...ctx,
    endpoint: () => Promise.resolve({
      protocol: '',
      hostname: '',
      path: '',
    }),
  }
  let statusCode: number = 200
  let headers: any = map({}, isSerializableHeaderValue, {
    'content-type': 'application/json',
  });
  let body: any;
  body = JSON.stringify(take(input, {
    'wallet': _ => se_Wallet(_, context),
  }));
  if (body && Object.keys(headers).map((str) => str.toLowerCase()).indexOf('content-length') === -1) {
    const length = calculateBodyLength(body);
    if (length !== undefined) {
      headers = { ...headers, 'content-length': String(length) };
    }
  }
  return new __HttpResponse({
    headers,
    body,
    statusCode,
  });
}

export const serializeGetTransactionOperationResponse = async(
  input: GetTransactionOperationServerOutput,
  ctx: ServerSerdeContext
): Promise<__HttpResponse> => {
  const context: __SerdeContext = {
    ...ctx,
    endpoint: () => Promise.resolve({
      protocol: '',
      hostname: '',
      path: '',
    }),
  }
  let statusCode: number = 200
  let headers: any = map({}, isSerializableHeaderValue, {
    'content-type': 'application/json',
  });
  let body: any;
  body = JSON.stringify(take(input, {
    'transaction': _ => se_Transaction(_, context),
  }));
  if (body && Object.keys(headers).map((str) => str.toLowerCase()).indexOf('content-length') === -1) {
    const length = calculateBodyLength(body);
    if (length !== undefined) {
      headers = { ...headers, 'content-length': String(length) };
    }
  }
  return new __HttpResponse({
    headers,
    body,
    statusCode,
  });
}

export const serializeListTransactionsOperationResponse = async(
  input: ListTransactionsOperationServerOutput,
  ctx: ServerSerdeContext
): Promise<__HttpResponse> => {
  const context: __SerdeContext = {
    ...ctx,
    endpoint: () => Promise.resolve({
      protocol: '',
      hostname: '',
      path: '',
    }),
  }
  let statusCode: number = 200
  let headers: any = map({}, isSerializableHeaderValue, {
    'content-type': 'application/json',
  });
  let body: any;
  body = JSON.stringify(take(input, {
    'nextCursor': [],
    'total': [],
    'transactions': _ => se_TransactionList(_, context),
  }));
  if (body && Object.keys(headers).map((str) => str.toLowerCase()).indexOf('content-length') === -1) {
    const length = calculateBodyLength(body);
    if (length !== undefined) {
      headers = { ...headers, 'content-length': String(length) };
    }
  }
  return new __HttpResponse({
    headers,
    body,
    statusCode,
  });
}

export const serializeLoginOperationResponse = async(
  input: LoginOperationServerOutput,
  ctx: ServerSerdeContext
): Promise<__HttpResponse> => {
  const context: __SerdeContext = {
    ...ctx,
    endpoint: () => Promise.resolve({
      protocol: '',
      hostname: '',
      path: '',
    }),
  }
  let statusCode: number = 200
  let headers: any = map({}, isSerializableHeaderValue, {
    'content-type': 'application/json',
  });
  let body: any;
  body = JSON.stringify(take(input, {
    'accessToken': [],
    'expiresIn': [],
    'refreshToken': [],
    'tokenType': [],
  }));
  if (body && Object.keys(headers).map((str) => str.toLowerCase()).indexOf('content-length') === -1) {
    const length = calculateBodyLength(body);
    if (length !== undefined) {
      headers = { ...headers, 'content-length': String(length) };
    }
  }
  return new __HttpResponse({
    headers,
    body,
    statusCode,
  });
}

export const serializeRefreshTokenOperationResponse = async(
  input: RefreshTokenOperationServerOutput,
  ctx: ServerSerdeContext
): Promise<__HttpResponse> => {
  const context: __SerdeContext = {
    ...ctx,
    endpoint: () => Promise.resolve({
      protocol: '',
      hostname: '',
      path: '',
    }),
  }
  let statusCode: number = 200
  let headers: any = map({}, isSerializableHeaderValue, {
    'content-type': 'application/json',
  });
  let body: any;
  body = JSON.stringify(take(input, {
    'accessToken': [],
    'expiresIn': [],
    'refreshToken': [],
  }));
  if (body && Object.keys(headers).map((str) => str.toLowerCase()).indexOf('content-length') === -1) {
    const length = calculateBodyLength(body);
    if (length !== undefined) {
      headers = { ...headers, 'content-length': String(length) };
    }
  }
  return new __HttpResponse({
    headers,
    body,
    statusCode,
  });
}

export const serializeUpdateCurrentUserOperationResponse = async(
  input: UpdateCurrentUserOperationServerOutput,
  ctx: ServerSerdeContext
): Promise<__HttpResponse> => {
  const context: __SerdeContext = {
    ...ctx,
    endpoint: () => Promise.resolve({
      protocol: '',
      hostname: '',
      path: '',
    }),
  }
  let statusCode: number = 200
  let headers: any = map({}, isSerializableHeaderValue, {
    'content-type': 'application/json',
  });
  let body: any;
  body = JSON.stringify(take(input, {
    'user': _ => se_UserProfile(_, context),
  }));
  if (body && Object.keys(headers).map((str) => str.toLowerCase()).indexOf('content-length') === -1) {
    const length = calculateBodyLength(body);
    if (length !== undefined) {
      headers = { ...headers, 'content-length': String(length) };
    }
  }
  return new __HttpResponse({
    headers,
    body,
    statusCode,
  });
}

export const serializeFrameworkException = async(
  input: __SmithyFrameworkException,
  ctx: ServerSerdeContext
): Promise<__HttpResponse> => {
  const context: __SerdeContext = {
    ...ctx,
    endpoint: () => Promise.resolve({
      protocol: '',
      hostname: '',
      path: '',
    }),
  }
  switch (input.name) {
    case "InternalFailure": {
      const statusCode: number = 500
      let headers: any = map({}, isSerializableHeaderValue, {
        'x-amzn-errortype': "InternalFailure",
        'content-type': 'application/json',
      });
      let body: any;
      body = "{}";
      return new __HttpResponse({
        headers,
        body,
        statusCode,
      });
    }
    case "NotAcceptableException": {
      const statusCode: number = 406
      let headers: any = map({}, isSerializableHeaderValue, {
        'x-amzn-errortype': "NotAcceptableException",
        'content-type': 'application/json',
      });
      let body: any;
      body = "{}";
      return new __HttpResponse({
        headers,
        body,
        statusCode,
      });
    }
    case "SerializationException": {
      const statusCode: number = 400
      let headers: any = map({}, isSerializableHeaderValue, {
        'x-amzn-errortype': "SerializationException",
        'content-type': 'application/json',
      });
      let body: any;
      body = "{}";
      return new __HttpResponse({
        headers,
        body,
        statusCode,
      });
    }
    case "UnknownOperationException": {
      const statusCode: number = 404
      let headers: any = map({}, isSerializableHeaderValue, {
        'x-amzn-errortype': "UnknownOperationException",
        'content-type': 'application/json',
      });
      let body: any;
      body = "{}";
      return new __HttpResponse({
        headers,
        body,
        statusCode,
      });
    }
    case "UnsupportedMediaTypeException": {
      const statusCode: number = 415
      let headers: any = map({}, isSerializableHeaderValue, {
        'x-amzn-errortype': "UnsupportedMediaTypeException",
        'content-type': 'application/json',
      });
      let body: any;
      body = "{}";
      return new __HttpResponse({
        headers,
        body,
        statusCode,
      });
    }
  }
}

export const serializeConflictExceptionError = async(
  input: ConflictException,
  ctx: ServerSerdeContext
): Promise<__HttpResponse> => {
  const context: __SerdeContext = {
    ...ctx,
    endpoint: () => Promise.resolve({
      protocol: '',
      hostname: '',
      path: '',
    }),
  }
  const statusCode: number = 409
  let headers: any = map({}, isSerializableHeaderValue, {
    'x-amzn-errortype': "ConflictException",
    'content-type': 'application/json',
  });
  let body: any;
  body = JSON.stringify(take(input, {
    'existingTxId': [],
    'message': [],
  }));
  return new __HttpResponse({
    headers,
    body,
    statusCode,
  });
}

export const serializeForbiddenExceptionError = async(
  input: ForbiddenException,
  ctx: ServerSerdeContext
): Promise<__HttpResponse> => {
  const context: __SerdeContext = {
    ...ctx,
    endpoint: () => Promise.resolve({
      protocol: '',
      hostname: '',
      path: '',
    }),
  }
  const statusCode: number = 403
  let headers: any = map({}, isSerializableHeaderValue, {
    'x-amzn-errortype': "ForbiddenException",
    'content-type': 'application/json',
  });
  let body: any;
  body = JSON.stringify(take(input, {
    'message': [],
    'requiredScope': [],
  }));
  return new __HttpResponse({
    headers,
    body,
    statusCode,
  });
}

export const serializeInsufficientFundsExceptionError = async(
  input: InsufficientFundsException,
  ctx: ServerSerdeContext
): Promise<__HttpResponse> => {
  const context: __SerdeContext = {
    ...ctx,
    endpoint: () => Promise.resolve({
      protocol: '',
      hostname: '',
      path: '',
    }),
  }
  const statusCode: number = 422
  let headers: any = map({}, isSerializableHeaderValue, {
    'x-amzn-errortype': "InsufficientFundsException",
    'content-type': 'application/json',
  });
  let body: any;
  body = JSON.stringify(take(input, {
    'currentBalance': [],
    'message': [],
    'requiredAmount': [],
  }));
  return new __HttpResponse({
    headers,
    body,
    statusCode,
  });
}

export const serializeInternalServerExceptionError = async(
  input: InternalServerException,
  ctx: ServerSerdeContext
): Promise<__HttpResponse> => {
  const context: __SerdeContext = {
    ...ctx,
    endpoint: () => Promise.resolve({
      protocol: '',
      hostname: '',
      path: '',
    }),
  }
  const statusCode: number = 500
  let headers: any = map({}, isSerializableHeaderValue, {
    'x-amzn-errortype': "InternalServerException",
    'content-type': 'application/json',
  });
  let body: any;
  body = JSON.stringify(take(input, {
    'message': [],
    'traceId': [],
  }));
  return new __HttpResponse({
    headers,
    body,
    statusCode,
  });
}

export const serializeResourceNotFoundExceptionError = async(
  input: ResourceNotFoundException,
  ctx: ServerSerdeContext
): Promise<__HttpResponse> => {
  const context: __SerdeContext = {
    ...ctx,
    endpoint: () => Promise.resolve({
      protocol: '',
      hostname: '',
      path: '',
    }),
  }
  const statusCode: number = 404
  let headers: any = map({}, isSerializableHeaderValue, {
    'x-amzn-errortype': "ResourceNotFoundException",
    'content-type': 'application/json',
  });
  let body: any;
  body = JSON.stringify(take(input, {
    'message': [],
    'resourceId': [],
    'resourceType': [],
  }));
  return new __HttpResponse({
    headers,
    body,
    statusCode,
  });
}

export const serializeUnauthorizedExceptionError = async(
  input: UnauthorizedException,
  ctx: ServerSerdeContext
): Promise<__HttpResponse> => {
  const context: __SerdeContext = {
    ...ctx,
    endpoint: () => Promise.resolve({
      protocol: '',
      hostname: '',
      path: '',
    }),
  }
  const statusCode: number = 401
  let headers: any = map({}, isSerializableHeaderValue, {
    'x-amzn-errortype': "UnauthorizedException",
    'content-type': 'application/json',
  });
  let body: any;
  body = JSON.stringify(take(input, {
    'message': [],
  }));
  return new __HttpResponse({
    headers,
    body,
    statusCode,
  });
}

export const serializeValidationExceptionError = async(
  input: ValidationException,
  ctx: ServerSerdeContext
): Promise<__HttpResponse> => {
  const context: __SerdeContext = {
    ...ctx,
    endpoint: () => Promise.resolve({
      protocol: '',
      hostname: '',
      path: '',
    }),
  }
  const statusCode: number = 400
  let headers: any = map({}, isSerializableHeaderValue, {
    'x-amzn-errortype': "ValidationException",
    'content-type': 'application/json',
  });
  let body: any;
  body = JSON.stringify(take(input, {
    'fieldErrors': _ => se_FieldErrorList(_, context),
    'message': [],
  }));
  return new __HttpResponse({
    headers,
    body,
    statusCode,
  });
}

/**
 * serializeAws_restJson1FieldError
 */
const se_FieldError = (
  input: FieldError,
  context: __SerdeContext
): any => {
  return take(input, {
    'field': [],
    'message': [],
  });
}

/**
 * serializeAws_restJson1FieldErrorList
 */
const se_FieldErrorList = (
  input: (FieldError)[],
  context: __SerdeContext
): any => {
  return input.filter((e: any) => e != null).map(entry => {
    return se_FieldError(entry, context);
  });
}

/**
 * serializeAws_restJson1QRCode
 */
const se_QRCode = (
  input: QRCode,
  context: __SerdeContext
): any => {
  return take(input, {
    'amount': [],
    'currency': [],
    'description': [],
    'expiresAt': _ => (_.getTime() / 1_000),
    'qrData': [],
    'qrId': [],
    'used': [],
    'userId': [],
  });
}

/**
 * serializeAws_restJson1Transaction
 */
const se_Transaction = (
  input: Transaction,
  context: __SerdeContext
): any => {
  return take(input, {
    'amount': [],
    'completedAt': _ => (_.getTime() / 1_000),
    'createdAt': _ => (_.getTime() / 1_000),
    'currency': [],
    'description': [],
    'receiverId': [],
    'senderId': [],
    'status': [],
    'txId': [],
    'type': [],
  });
}

/**
 * serializeAws_restJson1TransactionList
 */
const se_TransactionList = (
  input: (Transaction)[],
  context: __SerdeContext
): any => {
  return input.filter((e: any) => e != null).map(entry => {
    return se_Transaction(entry, context);
  });
}

/**
 * serializeAws_restJson1UserProfile
 */
const se_UserProfile = (
  input: UserProfile,
  context: __SerdeContext
): any => {
  return take(input, {
    'createdAt': _ => (_.getTime() / 1_000),
    'email': [],
    'fullName': [],
    'kycStatus': [],
    'phoneNumber': [],
    'userId': [],
  });
}

/**
 * serializeAws_restJson1Wallet
 */
const se_Wallet = (
  input: Wallet,
  context: __SerdeContext
): any => {
  return take(input, {
    'balance': [],
    'currency': [],
    'status': [],
    'updatedAt': _ => (_.getTime() / 1_000),
    'userId': [],
    'walletId': [],
  });
}

/**
 * deserializeAws_restJson1UpdateUserPayload
 */
const de_UpdateUserPayload = (
  output: any,
  context: __SerdeContext
): UpdateUserPayload => {
  return take(output, {
    'email': __expectString,
    'fullName': __expectString,
  }) as any;
}

const deserializeMetadata = (output: __HttpResponse): __ResponseMetadata => ({
  httpStatusCode: output.statusCode,
  requestId: output.headers["x-amzn-requestid"] ?? output.headers["x-amzn-request-id"] ?? output.headers["x-amz-request-id"],
  extendedRequestId: output.headers["x-amz-id-2"],
  cfId: output.headers["x-amz-cf-id"],
});

// Encode Uint8Array data into string with utf-8.
const collectBodyString = (streamBody: any, context: __SerdeContext): Promise<string> => collectBody(streamBody, context).then(body => context.utf8Encoder(body))

const isSerializableHeaderValue = (value: any): boolean =>
  value !== undefined &&
  value !== null &&
  value !== "" &&
  (!Object.getOwnPropertyNames(value).includes("length") ||
    value.length != 0) &&
  (!Object.getOwnPropertyNames(value).includes("size") || value.size != 0);
