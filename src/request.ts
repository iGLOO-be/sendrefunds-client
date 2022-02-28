import { badGateway } from "boom";
import got, { Options, RequestError, Response } from "got";

export interface IRequestHooks {
  onSuccess?: (d: {
    uri: string;
    options: IRequestOptions;
    response?: ReturnType<typeof responseToJSON>;
    body: any;
    error?: any;
  }) => Promise<void>;
  onError?: (d: {
    uri: string;
    options: IRequestOptions;
    error: any;
    response?: ReturnType<typeof responseToJSON>;
  }) => Promise<void>;
  onStartRequest?: (d: {
    uri: string;
    options: IRequestOptions;
  }) => Promise<void>;
  ignoreError?: (err: any) => boolean;
}

export type IRequestOptions = Pick<
  Options,
  | "method"
  | "username"
  | "password"
  | "json"
  | "parseJson"
  | "headers"
  | "timeout"
  | "searchParams"
> & {
  body?: string;
  bodyForLog?: any;
};

const requestRaw = async (uri: string, options: IRequestOptions) => {
  return got(uri, {
    ...options,
    timeout: 30 * 1000,
    headers: {
      Accept: "application/json",
      ...options.headers,
    },
  });
};

const tryParseJson = (value: any) => {
  try {
    return JSON.parse(value);
  } catch {
    return;
  }
};

const baseRequest = async <T = any>(
  uri: string,
  options: IRequestOptions,
  hooks: IRequestHooks = {},
) => {
  const { onStartRequest, onError, onSuccess, ignoreError } = hooks;

  if (onStartRequest) {
    await onStartRequest({
      uri,
      options,
    });
  }

  let response;
  try {
    response = await requestRaw(uri, options);
  } catch (error) {
    const response =
      (error instanceof RequestError && error.response) || undefined;
    if (onError) {
      await onError({
        uri,
        options,
        error: response?.body || error,
        response: response && responseToJSON(response),
      });
    }
    if (error instanceof Error && response) {
      const body = tryParseJson(response.body);
      if (body && body.title && body.detail) {
        error.message = `Sendrefunds error: ${body.title} ${body.detail}`;
      }
    }
    throw error;
  }

  let body;
  if (response) {
    try {
      body = response.body ? JSON.parse(response.body) : undefined;
    } catch (err) {
      if (ignoreError && ignoreError(err)) {
        if (onSuccess) {
          await onSuccess({
            uri,
            options,
            body,
            error: err,
          });
        }
        return;
      }
      if (onError)
        await onError({
          uri,
          options,
          error: err,
          response: responseToJSON(response),
        });
      if (process.env.NODE_ENV === "production") {
        throw badGateway();
      } else {
        throw err;
      }
    }
  }
  if (onSuccess) {
    await onSuccess({
      uri,
      options,
      body,
      response: responseToJSON(response),
    });
  }

  return (body as any) as T;
};

export type Request = <T = any>(
  uri: string,
  options: IRequestOptions,
) => Promise<T | undefined>;

export const createRequest = ({
  hooks,
}: { hooks?: IRequestHooks } = {}): Request => <T = any>(
  uri: string,
  options: IRequestOptions,
) => baseRequest<T>(uri, options, hooks);

const responseToJSON = (response: Response<any>) => ({
  headers: response.headers,
  ip: response.ip,
  retryCount: response.retryCount,
  statusCode: response.statusCode,
  statusMessage: response.statusMessage,
  method: response.method,
  url: response.url,
  timingTotal: response.timings.phases.total,
});
