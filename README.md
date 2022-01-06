# Sendrefunds Client

Doc API: https://app.swaggerhub.com/apis-docs/sendrefunds/Sales.Sendrefunds/1.2.1

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
- sendInvitation
- createAccessToken
- createOrder
- createPayment
- getOrder
- generateFrontUrl
