import { createRequest, Request } from "./request";
import {
  BusinessCheckResult,
  CreateAccessTokenInput,
  CreateAccessTokenResult,
  CreateOrderInput,
  CreateOrderResult,
  CreatePaymentInput,
  GetOrderInput,
  CreatePaymentResult,
  GetOrderResult,
  GetOrdersResult,
  GetPaymentInput,
  GetPaymentResult,
  GetPaymentOrderResult,
  GetOrderPaymentsResult,
  BusinessCheckInput,
  GetDocumentsInput,
  GetDocumentsResult,
  CreateRefundsInput,
  CreateRefundsResult,
  GetBusinessStatusResult,
  GetBusinessTokenResult,
} from "./types";
import qs from "query-string";

export { createRequest };

export interface SendrefundsConfig {
  uri: string;
  authorizationBearer: string;
  isProduction?: boolean;
}

const API_ENDPOINT = {
  prod: "https://sendrefunds.io/v1",
  staging: "https://staging.sendrefunds.io/v1",
};

const FRONT_ENDPOINT = {
  prod: "htts://app.sendrefunds.com",
  staging: "https://app-staging.sendrefunds.com",
};

export class SendrefundsClient {
  private readonly config: SendrefundsConfig;
  private readonly request: Request;

  constructor(config: Partial<SendrefundsConfig>, request?: Request) {
    this.config = {
      uri:
        config.isProduction === true ? API_ENDPOINT.prod : API_ENDPOINT.staging,
      authorizationBearer: "",
      isProduction: false,
      ...config,
    };
    this.request = request || createRequest();
  }

  public async businessCheck(input: BusinessCheckInput) {
    return this.request<BusinessCheckResult>(
      `${this.config.uri}/business/check`,
      {
        method: "post",
        headers: {
          Authorization: `Bearer ${this.config.authorizationBearer}`,
        },
        json: input,
      },
    );
  }

  public async getBusinessToken(extId: string) {
    return this.request<GetBusinessTokenResult>(
      `${this.config.uri}/business/${extId}/auth`,
      {
        method: "get",
        headers: {
          Authorization: `Bearer ${this.config.authorizationBearer}`,
        },
      },
    );
  }

  public async getBusinessStatus(ext_id: string) {
    return this.request<GetBusinessStatusResult>(
      `${this.config.uri}/business/${ext_id}/status`,
      {
        method: "get",
        headers: {
          Authorization: `Bearer ${this.config.authorizationBearer}`,
        },
      },
    );
  }

  public async createAccessToken(data: CreateAccessTokenInput) {
    return this.request<CreateAccessTokenResult>(
      `${this.config.uri}/access-tokens`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.authorizationBearer}`,
        },
        json: data,
      },
    );
  }

  public async createAccessTokenFromExtId(
    extId: string,
    ttl: number = 60,
  ): Promise<string | undefined> {
    const sessionToken = (await this.getBusinessToken(extId))?.Result
      ?.SessionToken;
    if (!sessionToken) {
      return;
    }
    const accessToken = (
      await this.createAccessToken({ session_token: sessionToken, ttl })
    )?.Result?.AccessToken;
    if (!accessToken) {
      return;
    }
    return accessToken;
  }

  public async createOrder(data: CreateOrderInput) {
    return this.request<CreateOrderResult>(`${this.config.uri}/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.authorizationBearer}`,
      },
      json: data,
    });
  }

  public async createPayment(data: CreatePaymentInput) {
    return this.request<CreatePaymentResult>(`${this.config.uri}/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.authorizationBearer}`,
      },
      json: data,
    });
  }

  public async getOrder(data: GetOrderInput) {
    return this.request<GetOrderResult>(
      `${this.config.uri}/orders/${data.access_token}/${data.order_guid}`,
      {
        method: "get",
        headers: {
          Authorization: `Bearer ${this.config.authorizationBearer}`,
        },
      },
    );
  }

  public async generateFrontUrl(
    extId: string,
    ttl: number = 3600,
  ): Promise<string> {
    const accessToken = await this.createAccessTokenFromExtId(
      extId,
      ttl,
    );
    if (!accessToken) {
      return "";
    }
    return `${
      this.config.isProduction ? FRONT_ENDPOINT.prod : FRONT_ENDPOINT.staging
    }?access_token=${accessToken}`;
  }

  public async getOrderList(access_token: string) {
    return this.request<GetOrdersResult>(
      `${this.config.uri}/orders/${access_token}`,
      {
        method: "get",
        headers: {
          Authorization: `Bearer ${this.config.authorizationBearer}`,
        },
      },
    );
  }

  public async getPayment(data: GetPaymentInput) {
    return this.request<GetPaymentResult>(
      `${this.config.uri}/payments/${data.access_token}/${data.payment_reference}`,
      {
        method: "get",
        headers: {
          Authorization: `Bearer ${this.config.authorizationBearer}`,
        },
      },
    );
  }

  public async getPaymentOrder(data: GetPaymentInput) {
    return this.request<GetPaymentOrderResult>(
      `${this.config.uri}/orders/${data.access_token}/payments/${data.payment_reference}`,
      {
        method: "get",
        headers: {
          Authorization: `Bearer ${this.config.authorizationBearer}`,
        },
      },
    );
  }

  public async getOrderPayments(data: GetOrderInput) {
    return this.request<GetOrderPaymentsResult>(
      `${this.config.uri}/payments/${data.access_token}/orders/${data.order_guid}`,
      {
        method: "get",
        headers: {
          Authorization: `Bearer ${this.config.authorizationBearer}`,
        },
      },
    );
  }

  public async getDocuments({
    access_token,
    document_type,
    ...data
  }: GetDocumentsInput) {
    return this.request<GetDocumentsResult>(
      `${this.config.uri}/documents/${access_token}?${qs.stringify({
        ...data,
        document_type: Array.isArray(document_type)
          ? document_type.join(",")
          : document_type,
      })}`,
      {
        method: "get",
        headers: {
          Authorization: `Bearer ${this.config.authorizationBearer}`,
        },
      },
    );
  }

  public async createRefunds(data: CreateRefundsInput) {
    return this.request<CreateRefundsResult>(`${this.config.uri}/refunds`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.authorizationBearer}`,
      },
      json: data,
    });
  }
}

export default SendrefundsClient;
