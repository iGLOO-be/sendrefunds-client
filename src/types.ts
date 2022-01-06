export type BusinessCheckResult = {
  Result: {
    SessionToken: string;
  };
};

export type SendInvitationInput = {
  email: string;
  country: string;
  business_id: string;
  language: string;
  ext_id: string;
  return_url: string;
};

export type SendInvitationResult = {
  Result: {
    Invitation: {
      Url: string;
    };
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
  reference: string;
  description?: string;
  quantity: number;
  price: number; // Unit price of the item in smallest currency unit (cents)
  discount_percentage: number; // cents
  discount_amount: number; // cents
  tax_percentage: number; // Tax percentage in smallest number (the percentage multiplied by 100. valid range 0-10000)
  tax_amount: number; // Unit Price item with tax in in smallest currency unit (cents)
  gitin_reference: string; // A valid gitin reference of the item
  purchase_price: number; // Unit purchase price of the item in smallest currency unit (cents)
  gross_sale_price: number; // Unit gross sale price of the item in smallest currency unit ({ price + (price*tax_percentage) } in cents)
};

export type CreateOrderInput = {
  access_token: string;
  order_date: string; // example: 04-10-2021
  order_number: string;
  currency: string; // example: eur
  total_amount_excluded_tax: number; // cents
  total_tax_amount: number; // cents
  total_amount_paid: number; // cents
  line_items: CreateOrderLineItemsInput[];
};

export type CreateOrderResult = {
  Result: {
    Payments: {
      TransactionGuid: string;
    };
  };
};

export type CreatePaymentInput = {
  access_token: string;
  payment_date: string; // example: 04-10-2021
  transaction_guid: string;
  currency: string; //  example: eur
  amount: number; // cents
  reference: string;
};

export type CreatePaymentResult = Record<string, unknown>;

export type GetOrderInput = {
  access_token: string;
  transaction_guid: string;
};

export type GetOrderResult = {
  Result: {
    Order: {
      Status: "SR01" | "SR02" | "SR03" | "SR04";
      InvoiceLink: string;
      Date: string;
      CreatedOn: string;
      Payments: {
        Reference: string;
        Amount: number;
        Status: "SRP1" | "SRP2";
        Date: string;
        CreatedOn: string;
      }[];
    };
  };
};
