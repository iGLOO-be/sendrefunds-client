import { SendrefundsClient } from "../src/index";

const TEST_AUTHORIZATION_BEARER = process.env.TEST_AUTHORIZATION_BEARER || "";
const TEST_SR_VALID_BUSINESS_ID = process.env.TEST_SR_VALID_BUSINESS_ID || "";
const TEST_SR_VALID_REGISTRED_BUSINESS_ID =
  process.env.TEST_SR_VALID_REGISTRED_BUSINESS_ID || "";

const describeActived = process.env.TEST_SR ? describe : describe.skip;

describeActived("SendRefunds", () => {
  describe("getBusinessToken", () => {
    it("Throw 400 error: Authentication information not found", async () => {
      const client = new SendrefundsClient({});
      await expect(() =>
        client.getBusinessToken("foo"),
      ).rejects.toMatchInlineSnapshot(
        `[HTTPError: Sendrefunds error: Bad Request Authentication information could not be identified]`,
      );
    });

    it("Throw 401 error: Authentication failed", async () => {
      const client = new SendrefundsClient({
        authorizationBearer: "abcd",
      });
      await expect(() =>
        client.getBusinessToken("foo"),
      ).rejects.toMatchInlineSnapshot(
        `[HTTPError: Sendrefunds error: Unauthorized Authentication failed]`,
      );
    });

    it("Throw 404 error: Business does not exist", async () => {
      const client = new SendrefundsClient({
        authorizationBearer: TEST_AUTHORIZATION_BEARER,
      });
      await expect(() =>
        client.getBusinessToken("foo"),
      ).rejects.toMatchInlineSnapshot(
        `[HTTPError: Sendrefunds error: Not Found Not a registered business or the business does not exist]`,
      );
    });

    it("Should get session token", async () => {
      const client = new SendrefundsClient({
        authorizationBearer: TEST_AUTHORIZATION_BEARER,
      });
      const result = await client.getBusinessToken(
        TEST_SR_VALID_REGISTRED_BUSINESS_ID,
      );
      expect(result?.Result).toMatchInlineSnapshot(
        {
          SessionToken: expect.any(String),
        },
        `
        Object {
          "SessionToken": Any<String>,
        }
      `,
      );
    });
  });

  describe("businessCheck", () => {
    // it("Throw 400 error : Partner resolving failure", async () => {
    //   const client = new SendrefundsClient({
    //     authorizationBearer: TEST_AUTHORIZATION_BEARER,
    //   });
    //   await expect(
    //     client.businessCheck({
    //       country: "fr",
    //       email: "novalid-user@muf.fr",
    //       language: "fr",
    //       ext_id: "novalid-extid",
    //       return_url: "https://fake.muf",
    //     }),
    //   ).rejects.toMatchInlineSnapshot(
    //     `[HTTPError: Sendrefunds error: Bad Request Error in resolving business information]`,
    //   );
    // });

    // it("Throw 400 error : Invitation already exists in another business", async () => {
    //   const client = new SendrefundsClient({
    //     authorizationBearer: TEST_AUTHORIZATION_BEARER,
    //   });
    //   await expect(
    //     client.businessCheck({
    //       country: "fr",
    //       email: "test@muf.fr",
    //       language: "fr",
    //       ext_id: "novalid-extid",
    //       return_url: "https://fake.muf",
    //     }),
    //   ).rejects.toMatchInlineSnapshot(
    //     `[HTTPError: Sendrefunds error: Bad Request Error in resolving business information]`,
    //   );
    // });

    // it("Should say error : Precondition Failed Email already used", async () => {
    //   const client = new SendrefundsClient({
    //     authorizationBearer: TEST_AUTHORIZATION_BEARER,
    //   });
    //   await expect(
    //     client.businessCheck({
    //       country: "fr",
    //       email: "test@muf.fr",
    //       language: "fr",
    //       ext_id: "TESTVETIN",
    //       return_url: "https://fake.muf",
    //     }),
    //   ).rejects.toMatchInlineSnapshot(
    //     `[HTTPError: Sendrefunds error: Precondition Failed Email already used]`,
    //   );
    // });

    it("Should send invitation", async () => {
      const client = new SendrefundsClient({
        authorizationBearer: TEST_AUTHORIZATION_BEARER,
      });
      const result = await client.businessCheck({
        country: "fr",
        email: "test2@muf.fr",
        language: "fr",
        ext_id: "TESTVETIN",
        return_url: "https://fake.muf",
      });
      expect(result).toMatchInlineSnapshot(
        {
          Result: {
            Invitation: {
              Url: expect.any(String),
            },
          },
        },
        `
        Object {
          "Result": Object {
            "Invitation": Object {
              "Url": Any<String>,
            },
          },
        }
      `,
      );
    });
  });

  describe("getBusinessStatus", () => {
    it("Throw 400 error : Bad Request Authentication information could not be identified", async () => {
      const client = new SendrefundsClient({
        authorizationBearer: TEST_AUTHORIZATION_BEARER,
      });
      await expect(() =>
        client.getBusinessStatus("foo"),
      ).rejects.toMatchInlineSnapshot(
        `[HTTPError: Sendrefunds error: Bad Request Invalid Business]`,
      );
    });

    it("Shoul return status", async () => {
      const client = new SendrefundsClient({
        authorizationBearer: TEST_AUTHORIZATION_BEARER,
      });
      expect(await client.getBusinessStatus("0000002")).toMatchInlineSnapshot(`
        Object {
          "Result": Object {
            "Business": Object {
              "IbanStatus": "SRBI_YES",
              "OnboardStatus": "SRBO_YES",
              "VatStatus": "SRBV_YES",
            },
          },
        }
      `);
    });
  });

  describe("createAccessToken", () => {
    it("Throw 400 error : Session token is  invalid", async () => {
      const client = new SendrefundsClient({
        authorizationBearer: TEST_AUTHORIZATION_BEARER,
      });
      await expect(
        client.createAccessToken({
          session_token: "abc",
          ttl: 60,
        }),
      ).rejects.toMatchInlineSnapshot(
        `[HTTPError: Sendrefunds error: Bad Request Session token is  invalid]`,
      );
    });

    it("Shoud get access token", async () => {
      const client = new SendrefundsClient({
        authorizationBearer: TEST_AUTHORIZATION_BEARER,
      });
      const token = (await client.getBusinessToken(TEST_SR_VALID_BUSINESS_ID))
        ?.Result.SessionToken;
      expect(token).toBeDefined();
      const accessToken = (
        await client.createAccessToken({
          session_token: token || "",
          ttl: 60,
        })
      )?.Result.AccessToken;
      expect(accessToken).toBeDefined();
    });

    it("Shoulg get access token from businessId", async () => {
      const { access_token } = await createValidClient();
      expect(access_token).toBeDefined();
    });
  });

  describe("createOrder", () => {
    it("Should create order", async () => {
      const { client, access_token } = await createValidClient();

      const result = await client.createOrder({
        access_token,
        order_date: "2021-10-02",
        order_number: "O22334645",
        currency: "eur",
        total_sale_amount_net: 8018,
        total_tax_amount: 400,
        total_sale_amount_gross: 8426,
        line_items: [
          {
            supplier: "MY SUPPLIER",
            sku_reference: "SKU998",
            gitin_reference: "GITIN-REF",
            sku_description: "test description",
            number_of_items: 2,
            sale_price_net: 200,
            purchase_price_net: 160,
            line_discount_percentage: 1000,
            line_total_discount_amount: 40,
            sale_tax_percentage: 1000,
            sale_price_gross: 220,
            line_total_tax_amount: 36,
            line_total_sale_amount_net: 360,
            line_total_sale_amount_gross: 396,
          },
        ],
        client_name: "Niro",
        client_address: "84/2, ABC rd",
        client_street_number: "345",
        client_postal_code: "21",
        client_city: "ABC",
        client_country: "BE",
        client_email: "abc@mail.com",
      });
      expect(result?.Result).toHaveProperty("Order");
      expect(result?.Result.Order).toHaveProperty("OrderGuid");
    });
  });

  describe("createPayment", () => {
    it("Throw 400 error : Invalid payment provider", async () => {
      const { client, access_token } = await createValidClient();
      await expect(
        client.createPayment({
          access_token,
          payment_date: "2021-11-01",
          provider: "bad-provider",
          order_guid: "ceda5069-2ebf-4313-86f6-a996b6f855c2",
          reference: "ipi_1JId3445ZvKYlo2Cfr8US8uB",
        }),
      ).rejects.toMatchInlineSnapshot(
        `[HTTPError: Sendrefunds error: Bad Request Invalid input]`,
      );
    });
    it("Throw 400 error : Bad Request Invalid Order guid provided", async () => {
      const { client, access_token } = await createValidClient();
      await expect(
        client.createPayment({
          access_token,
          payment_date: "2021-11-01",
          provider: "STRIPE",
          order_guid: "bad-guid",
          reference: "ipi_1JId3445ZvKYlo2Cfr8US8uB",
        }),
      ).rejects.toMatchInlineSnapshot(
        `[HTTPError: Sendrefunds error: Bad Request Invalid Order guid provided]`,
      );
    });
    it("Should create a payment", async () => {
      const { client, access_token } = await createValidClient();
      expect(
        await client.createPayment({
          access_token,
          payment_date: "2021-11-01",
          provider: "STRIPE",
          order_guid: "6a6b6a04-5a99-4921-87ed-5439c798dbc5",
          reference: `ipi_${new Date().getTime()}`,
        }),
      ).toMatchInlineSnapshot(
        {
          Result: {
            Payment: {
              PaymentGuid: expect.any(String),
            },
          },
        },
        `
        Object {
          "Result": Object {
            "Payment": Object {
              "PaymentGuid": Any<String>,
            },
          },
        }
      `,
      );
    });
  });

  describe("getOrder", () => {
    it("Throw 400 error : No order found", async () => {
      const { client, access_token } = await createValidClient();
      await expect(
        client.getOrder({
          access_token,
          order_guid: "sdfc08a83-46d9-10ec-8f44-068e4064e8536",
        }),
      ).rejects.toMatchInlineSnapshot(
        `[HTTPError: Sendrefunds error: Bad Request No order found]`,
      );
    });

    it("Should get order", async () => {
      const { client, access_token } = await createValidClient();
      expect(
        await client.getOrder({
          access_token,
          order_guid: "6a6b6a04-5a99-4921-87ed-5439c798dbc5",
        }),
      ).toMatchInlineSnapshot(
        {
          Result: {
            Order: {
              InvoiceLink: expect.any(String),
              Payments: expect.any(Array),
              CreatedOn: expect.any(String),
              Date: expect.any(String),
            },
          },
        },
        `
        Object {
          "Result": Object {
            "Order": Object {
              "Amount": 8426,
              "CreatedOn": Any<String>,
              "Currency": "EUR",
              "Date": Any<String>,
              "DueAmount": 8426,
              "IncomingPaymentStatus": "SROP1",
              "InvoiceLink": Any<String>,
              "OutgoingPaymentStatus": "SROPT1",
              "Payments": Any<Array>,
              "RefundStatus": "SRORF_NO",
              "Status": "SRO1",
            },
          },
        }
      `,
      );
    });
  });

  describe("generateFrontUrl", () => {
    it("Should return frontend url with access-token", async () => {
      const client = new SendrefundsClient({
        authorizationBearer: TEST_AUTHORIZATION_BEARER,
      });
      const target = await client.generateFrontUrl(TEST_SR_VALID_BUSINESS_ID);
      expect(target).toContain(
        "https://app-staging.sendrefunds.com?access_token=",
      );
    });
  });

  describe("getOrderList", () => {
    it("Should get orders", async () => {
      const { client, access_token } = await createValidClient();
      const result = await client.getOrderList(access_token);
      expect(result).toMatchInlineSnapshot(
        {
          Result: {
            Orders: expect.any(Array),
          },
        },
        `
        Object {
          "Result": Object {
            "Orders": Any<Array>,
          },
        }
      `,
      );
    });
  });

  describe("getPayment", () => {
    it("Should say: No payment found", async () => {
      const { client, access_token } = await createValidClient();
      await expect(
        client.getPayment({
          access_token,
          payment_reference: "payment-bad-ref",
        }),
      ).rejects.toMatchInlineSnapshot(
        `[HTTPError: Sendrefunds error: Bad Request No payment found]`,
      );
    });

    it("Should get payment", async () => {
      const { client, access_token } = await createValidClient();
      const result = await client.getPayment({
        access_token,
        payment_reference: "ipi_1683623000704",
      });
      expect(result).toMatchInlineSnapshot(
        {
          Result: {
            Payment: {
              CreatedOn: expect.any(String),
              Date: expect.any(String),
            },
          },
        },
        `
        Object {
          "Result": Object {
            "Payment": Object {
              "CreatedOn": Any<String>,
              "Date": Any<String>,
              "PaymentGatewayResult": Array [],
              "Provider": "STRIPE",
              "Reference": "ipi_1683623000704",
              "RefundStatus": "SRPRF_NO",
              "Status": "SRP3",
            },
          },
        }
      `,
      );
    });
  });

  describe("getPaymentOrder", () => {
    it("Should get order of payment", async () => {
      const { client, access_token } = await createValidClient();
      const result = await client.getPaymentOrder({
        access_token,
        payment_reference: "ipi_1683623000704",
      });
      expect(result).toMatchInlineSnapshot(
        {
          Result: {
            Order: expect.any(Object),
          },
        },
        `
        Object {
          "Result": Object {
            "Order": Any<Object>,
          },
        }
      `,
      );
    });
  });

  describe("getOrderPayments", () => {
    it("Should get payments", async () => {
      const { client, access_token } = await createValidClient();
      const result = await client.getOrderPayments({
        access_token,
        order_guid: "6a6b6a04-5a99-4921-87ed-5439c798dbc5",
      });
      expect(result).toMatchInlineSnapshot(
        {
          Result: {
            Payments: expect.any(Array),
          },
        },
        `
        Object {
          "Result": Object {
            "Payments": Any<Array>,
          },
        }
      `,
      );
    });
  });

  describe("getDocuments", () => {
    it("Should get documents", async () => {
      const { client, access_token } = await createValidClient();
      const result = await client.getDocuments({
        access_token,
      });
      expect(result).toMatchInlineSnapshot(
        {
          Result: {
            Documents: expect.any(Array),
            PageCount: expect.any(Number),
            TotalDocuments: expect.any(Number),
          },
        },
        `
        Object {
          "Result": Object {
            "Documents": Any<Array>,
            "Page": 1,
            "PageCount": Any<Number>,
            "TotalDocuments": Any<Number>,
          },
        }
      `,
      );
    });
    it("Should get documents with pagination", async () => {
      const { client, access_token } = await createValidClient();
      const result = await client.getDocuments({
        access_token,
        page: 3,
      });
      expect(result).toMatchInlineSnapshot(
        {
          Result: {
            Documents: expect.any(Array),
          },
        },
        `
        Object {
          "Result": Object {
            "Documents": Any<Array>,
            "Page": 3,
            "PageCount": 0,
            "TotalDocuments": 0,
          },
        }
      `,
      );
    });
  });
});

const createValidClient = async () => {
  const client = new SendrefundsClient({
    authorizationBearer: TEST_AUTHORIZATION_BEARER,
  });
  const access_token = await client.createAccessTokenFromExtId("0000002");
  if (!access_token) {
    throw new Error("No access_token");
  }
  return { client, access_token };
};
