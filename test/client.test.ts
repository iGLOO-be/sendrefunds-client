import { SendrefundsClient } from "../src/index";

const TEST_AUTHORIZATION_BEARER = process.env.TEST_AUTHORIZATION_BEARER || "";
const TEST_SR_VALID_BUSINESS_ID = process.env.TEST_SR_VALID_BUSINESS_ID || "";
const TEST_SR_VALID_REGISTRED_BUSINESS_ID =
  process.env.TEST_SR_VALID_REGISTRED_BUSINESS_ID || "";

const describeActived = process.env.TEST_SR ? describe : describe.skip;

describeActived("SendRefunds", () => {
  describe("businessCheck", () => {
    it("Throw 400 error: Authentication information not found", async () => {
      const client = new SendrefundsClient({});
      await expect(() => client.businessCheck("foo")).rejects
        .toMatchInlineSnapshot(`
              [HTTPError: {
                  "title": "Bad Request",
                  "type": "https://httpstatus.es/400",
                  "status": 400,
                  "detail": "Authentication information could not be identified"
              }]
            `);
    });

    it("Throw 401 error: Authentication failed", async () => {
      const client = new SendrefundsClient({
        authorizationBearer: "abcd",
      });
      await expect(() => client.businessCheck("foo")).rejects
        .toMatchInlineSnapshot(`
              [HTTPError: {
                  "title": "Unauthorized",
                  "type": "https://httpstatus.es/401",
                  "status": 401,
                  "detail": "Authentication failed"
              }]
            `);
    });

    it("Throw 404 error: Business does not exist", async () => {
      const client = new SendrefundsClient({
        authorizationBearer: TEST_AUTHORIZATION_BEARER,
      });
      await expect(() => client.businessCheck("foo")).rejects
        .toMatchInlineSnapshot(`
              [HTTPError: {
                  "error": "Not a registered business",
                  "title": "Not Found",
                  "type": "https://httpstatus.es/404",
                  "status": 404,
                  "detail": "Business does not exist"
              }]
            `);
    });

    it("Should get session token", async () => {
      const client = new SendrefundsClient({
        authorizationBearer: TEST_AUTHORIZATION_BEARER,
      });
      const result = await client.businessCheck(
        TEST_SR_VALID_REGISTRED_BUSINESS_ID,
      );
      expect(result?.Result).toHaveProperty("SessionToken");
    });
  });

  describe("invitations", () => {
    it("Throw 400 error : Partner resolving failure", async () => {
      const client = new SendrefundsClient({
        authorizationBearer: TEST_AUTHORIZATION_BEARER,
      });
      await expect(
        client.sendInvitation({
          country: "fr",
          email: "novalid-user@muf.fr",
          language: "fr",
          business_id: "no-valid-id",
          ext_id: "novalid-extid",
          return_url: "https://fake.muf",
        }),
      ).rejects.toMatchInlineSnapshot(`
              [HTTPError: {
                  "error": "Partner resolving failure",
                  "title": "Bad Request",
                  "type": "https://httpstatus.es/400",
                  "status": 400,
                  "detail": "Partner not found"
              }]
            `);
    });

    it("Throw 400 error : Invitation already exists in another business", async () => {
      const client = new SendrefundsClient({
        authorizationBearer: TEST_AUTHORIZATION_BEARER,
      });
      await expect(
        client.sendInvitation({
          country: "fr",
          email: "test@muf.fr",
          language: "fr",
          business_id: "no-valid-id",
          ext_id: "novalid-extid",
          return_url: "https://fake.muf",
        }),
      ).rejects.toMatchInlineSnapshot(`
              [HTTPError: {
                  "error": "Invitation already exists in another business",
                  "title": "Bad Request",
                  "type": "https://httpstatus.es/400",
                  "status": 400,
                  "detail": "The user is already invited in another business"
              }]
            `);
    });

    it("Should send invitation", async () => {
      const client = new SendrefundsClient({
        authorizationBearer: TEST_AUTHORIZATION_BEARER,
      });
      const result = await client.sendInvitation({
        country: "fr",
        email: "test@muf.fr",
        language: "fr",
        business_id: TEST_SR_VALID_BUSINESS_ID,
        ext_id: "TESTVETIN",
        return_url: "https://fake.muf",
      });
      expect(result?.Result.Invitation).toHaveProperty("Url");
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
      ).rejects.toMatchInlineSnapshot(`
              [HTTPError: {
                  "title": "Bad Request",
                  "type": "https://httpstatus.es/400",
                  "status": 400,
                  "detail": "Session token is  invalid"
              }]
            `);
    });

    it("Shoud get access token", async () => {
      const client = new SendrefundsClient({
        authorizationBearer: TEST_AUTHORIZATION_BEARER,
      });
      const token = (await client.businessCheck(TEST_SR_VALID_BUSINESS_ID))
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
  });

  describe("createOrder", () => {
    it("Should create order", async () => {
      const client = new SendrefundsClient({
        authorizationBearer: TEST_AUTHORIZATION_BEARER,
      });
      const sessionToken = (
        await client.businessCheck(TEST_SR_VALID_BUSINESS_ID)
      )?.Result.SessionToken;

      const accessToken = (
        await client.createAccessToken({
          session_token: sessionToken || "",
          ttl: 60,
        })
      )?.Result.AccessToken;

      const result = await client.createOrder({
        access_token: accessToken || "",
        order_date: "2021-10-02",
        order_number: "O22334645",
        currency: "eur",
        total_amount_excluded_tax: 8018,
        total_tax_amount: 400,
        total_amount_paid: 8426,
        line_items: [
          {
            supplier: "TEST002",
            reference: "SKU998",
            description: "test description",
            quantity: 2,
            price: 4543,
            discount_percentage: 10,
            discount_amount: 8018,
            tax_percentage: 5,
            tax_amount: 8426,
            gitin_reference: "GITIN-REF",
            gross_sale_price: 4543,
            purchase_price: 4543,
          },
        ],
      });
      expect(result?.Result).toHaveProperty("Payments");
      expect(result?.Result.Payments).toHaveProperty("TransactionGuid");
    });
  });

  describe("createPayment", () => {
    it("Throw 400 error : Payment already exists for the reference", async () => {
      const client = new SendrefundsClient({
        authorizationBearer: TEST_AUTHORIZATION_BEARER,
      });
      const sessionToken = (
        await client.businessCheck(TEST_SR_VALID_BUSINESS_ID)
      )?.Result.SessionToken;

      const accessToken = (
        await client.createAccessToken({
          session_token: sessionToken || "",
          ttl: 60,
        })
      )?.Result.AccessToken;

      await expect(
        client.createPayment({
          access_token: accessToken || "",
          amount: 1,
          currency: "eur",
          payment_date: "2021-11-01",
          reference: "ipi_1JId3445ZvKYlo2Cfr8US8uB",
          transaction_guid: "sdfc08a83-46d9-10ec-8f44-068e4064e8536",
        }),
      ).rejects.toMatchInlineSnapshot(`
              [HTTPError: {
                  "error": "Payment already exists",
                  "title": "Bad Request",
                  "type": "https://httpstatus.es/400",
                  "status": 400,
                  "detail": "Payment already exists for the reference"
              }]
            `);
    });
  });

  describe("getOrder", () => {
    it("Throw 400 error : Payment already exists for the reference", async () => {
      const client = new SendrefundsClient({
        authorizationBearer: TEST_AUTHORIZATION_BEARER,
      });
      const sessionToken = (
        await client.businessCheck(TEST_SR_VALID_BUSINESS_ID)
      )?.Result.SessionToken;

      const accessToken = (
        await client.createAccessToken({
          session_token: sessionToken || "",
          ttl: 60,
        })
      )?.Result.AccessToken;

      await expect(
        client.getOrder({
          access_token: accessToken || "",
          transaction_guid: "sdfc08a83-46d9-10ec-8f44-068e4064e8536",
        }),
      ).rejects.toMatchInlineSnapshot(`
              [HTTPError: {
                  "title": "Bad Request",
                  "type": "https://httpstatus.es/400",
                  "status": 400,
                  "detail": "No order found"
              }]
            `);
    });

    it("Should get order", async () => {
      const client = new SendrefundsClient({
        authorizationBearer: TEST_AUTHORIZATION_BEARER,
      });
      const sessionToken = (
        await client.businessCheck(TEST_SR_VALID_BUSINESS_ID)
      )?.Result.SessionToken;

      const accessToken = (
        await client.createAccessToken({
          session_token: sessionToken || "",
          ttl: 60,
        })
      )?.Result.AccessToken;

      expect(
        await client.getOrder({
          access_token: accessToken || "",
          transaction_guid: "ceda5069-2ebf-4313-86f6-a996b6f855c2",
        }),
      ).toMatchInlineSnapshot(
        {
          Result: {
            Order: {
              InvoiceLink: expect.any(String),
            },
          },
        },
        `
        Object {
          "Result": Object {
            "Order": Object {
              "CreatedOn": "2021-11-29 13:56:42",
              "Date": "2021-10-02 00:00:00",
              "InvoiceLink": Any<String>,
              "Payments": Array [],
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
      expect(target).toBeDefined();
    });
  });
});
