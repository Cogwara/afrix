import { PaymentProvider, PayoutProvider } from "./types";
import { MockPaymentProvider, MockPayoutProvider } from "./mock";

export * from "./types";
export * from "./mock";

export function getPaymentProvider(): PaymentProvider {
  // Can be swapped based on process.env.PAYMENT_PROVIDER
  return new MockPaymentProvider();
}

export function getPayoutProvider(): PayoutProvider {
  // Can be swapped based on process.env.PAYOUT_PROVIDER
  return new MockPayoutProvider();
}
