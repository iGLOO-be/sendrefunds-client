# Sendrefunds Client

Doc API: https://app.swaggerhub.com/apis-docs/sendrefunds/Sales.Sendrefunds/1.4.1

## Usage

```ts
import { SendrefundsClient } from "sendrefunds-client";

const client = new SendrefundsClient({
  uri: "...",
  authorizationBearer: "xxx",
  isProduction: true | false
});
```

### Methods

- businessCheck
- getBusinessToken
- createAccessToken
- createAccessTokenFromBusinessId
- createOrder
- createPayment
- getOrder
- generateFrontUrl
- getOrderList
- getPayment
- getPaymentOrder
- getOrderPayments

### Test

#### Env

File `.env`
```sh
TEST_AUTHORIZATION_BEARER=...
TEST_SR_VALID_BUSINESS_ID=43341091700028
TEST_SR_VALID_REGISTRED_BUSINESS_ID=45061992900018
```

#### Run on API

```sh
TEST_SR=1 yarn test
```
