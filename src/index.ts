import { createRequest, Request } from "./request";
import {
  BusinessCheckResult,
  CreateAccessTokenInput,
  CreateAccessTokenResult,
  SendInvitationInput,
  SendInvitationResult,
  CreateOrderInput,
  CreateOrderResult,
  CreatePaymentInput,
  GetOrderInput,
  CreatePaymentResult,
  GetOrderResult,
} from "./types";

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

  public async businessCheck(businessId: string) {
    return this.request<BusinessCheckResult>(
      `${this.config.uri}/business/${businessId}/check`,
      {
        method: "get",
        headers: {
          Authorization: `Bearer ${this.config.authorizationBearer}`,
        },
      },
    );
  }

  public async sendInvitation(data: SendInvitationInput) {
    return this.request<SendInvitationResult>(
      `${this.config.uri}/invitations`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.authorizationBearer}`,
        },
        json: data,
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
      `${this.config.uri}/orders/${data.access_token}/${data.transaction_guid}`,
      {
        method: "get",
        headers: {
          Authorization: `Bearer ${this.config.authorizationBearer}`,
        },
      },
    );
  }

  public async generateFrontUrl(businessId: string): Promise<string> {
    const sessionToken = (await this.businessCheck(businessId))?.Result
      ?.SessionToken;
    if (!sessionToken) {
      return "";
    }
    const accessToken = (
      await this.createAccessToken({ session_token: sessionToken, ttl: 3600 })
    )?.Result?.AccessToken;
    if (!accessToken) {
      return "";
    }
    return `${
      this.config.isProduction ? FRONT_ENDPOINT.prod : FRONT_ENDPOINT.staging
    }?access_token=${accessToken}`;
  }
}

export default SendrefundsClient;
