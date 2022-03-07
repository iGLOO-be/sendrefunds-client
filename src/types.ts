export type BusinessCheckInput = {
  /**
   * Primary email of the Business and the contact . It is allowed to edit this email during the onboarding process. Maximum length is 100 characters.
   * example: test@test.com
   */
  email: string;
  /**
   * A valid country code. Maximum length is 5 characters
   * example: fr
   */
  country: string;
  /**
   * Valid code of the language. Maximum length is 5 characters
   * example: fr
   */
  language: string;
  /**
   * The ext Id of the partner. Maximun length is 45 characters
   * example: ext001
   */
  ext_id: string;
  /**
   * A url to return once the registration completed. Maximum length is 200 characters
   * example: hhtp://testing123.com
   */
  return_url: string;
};

export type BusinessCheckResult = {
  Result: {
    SessionToken?: string;
    Invitation?: {
      Url: string;
    };
  };
};

export type GetBusinessTokenResult = {
  Result: {
    SessionToken: string;
  };
};

export type CreateAccessTokenInput = {
  session_token: string;
  ttl: number; // seconds
};

export type CreateAccessTokenResult = {
  Result: {
    AccessToken: string;
  };
};

type CreateOrderLineItemsInput = {
  supplier?: string;
  sku_reference: string;
  gitin_reference: string; // A valid gitin reference of the item
  sku_description?: string;
  number_of_items: number;
  sale_price_net: number; // Unit price of the item in smallest currency unit (cents)
  purchase_price_net: number; // Unit purchase price of the item in smallest currency unit (cents)
  line_discount_percentage: number; // Discount percentage should be indicated by an integer. In above example 10.00% is represented by 1000 (the percentage multiplied by 100. valid range 0-10000)
  line_total_discount_amount: number; // Total discount amount of the line ( unit discount amount * number of items) in smallest currency unit (cents)
  sale_tax_percentage: number; // Tax percentage should be indicated by an integer. In above example 10.00% is represented by 1000 (the percentage multiplied by 100. valid range 0-10000)
  sale_price_gross: number; // Unit gross sale price of the item in smallest currency unit ( in cents)
  line_total_tax_amount: number; // Total tax amount of the line ( unit tax amount * number of items) in in smallest currency unit (cents)
  line_total_sale_amount_net: number; // Total amount net of the line ( multiplied by the number of items) in in smallest currency unit (cents)
  line_total_sale_amount_gross: number; // Total amount gross of the line ( multiplied by the number of items) in in smallest currency unit (cents)
};

export type CreateOrderInput = {
  access_token: string;
  order_date: string; // example: 04-10-2021
  order_number: string;
  currency: string; // example: eur
  total_sale_amount_net: number; // Total sale amount net in smallest currency unit (cents)
  total_tax_amount: number; // Total tax amount in smallest currency unit (cents)
  total_sale_amount_gross: number; // Total sale amount gross in smallest currency unit (cents)
  line_items: CreateOrderLineItemsInput[];
  client_name: string;
  client_address: string;
  client_street_number: string;
  client_postal_code: string;
  client_city: string;
  client_country: string;
  client_email: string;
};

export type CreateOrderResult = {
  Result: {
    Order: {
      OrderGuid: string;
    };
  };
};

export type CreatePaymentInput = {
  access_token: string;
  payment_date: string; // example: 2021-10-04
  provider?: string;
  order_guid: string;
  reference: string;
};

export type CreatePaymentResult = {
  Result: {
    Payment: {
      PaymentGuid: string;
    };
  };
};

export type GetOrderInput = {
  access_token: string;
  order_guid: string;
};

type Payment = {
  Reference: string;
  Status: "SRP1" | "SRP2" | "SRP3";
  Provider: string;
  Date: string;
  CreatedOn: string;
  PaymentGatewayResult: {
    Amount: number;
    Fee: number;
    NetAmount: number;
    Description: string;
    Status: string;
  };
};

export type GetOrderResult = {
  Result: {
    Order: {
      Status: "SR01" | "SR02";
      IncomingPaymentStatus: "SROP1" | "SROP2" | "SROP3";
      OutgoingPaymentStatus: "SROP1" | "SROP2" | "SROP3" | "SROP4";
      InvoiceLink: string;
      Currency: string;
      Amount: number;
      DueAmount: number;
      Date: string;
      CreatedOn: string;
      Payments: {
        Result: Payment;
      }[];
    };
  };
};

export type GetOrdersResult = {
  Result: {
    Orders: GetOrderResult["Result"]["Order"][];
  };
};

export type GetPaymentInput = {
  access_token: string;
  payment_reference: string;
};

export type GetPaymentResult = {
  Result: {
    Payment: Payment;
  };
};

export type GetPaymentOrderResult = {
  Result: {
    Order: GetOrderResult["Result"]["Order"];
  };
};

export type GetOrderPaymentsResult = {
  Result: {
    Payments: {
      Result: Payment;
    }[];
  };
};
