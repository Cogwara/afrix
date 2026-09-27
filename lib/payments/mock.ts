import {
  PaymentProvider,
  PayoutProvider,
  CampaignFundingRequest,
  PaymentResult,
  PayoutRequest,
  PayoutResult,
} from "./types";

export class MockPaymentProvider implements PaymentProvider {
  name = "MockPaymentProvider";

  async initiateCampaignFunding(request: CampaignFundingRequest): Promise<PaymentResult> {
    const transactionId = `mock_pay_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    return {
      success: true,
      transactionId,
      status: "COMPLETED",
      checkoutUrl: `https://checkout.afrix.work/mock/${transactionId}`,
      metadata: {
        campaignId: request.campaignId,
        businessId: request.businessId,
        amount: request.amount,
        currency: request.currency,
      },
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentResult> {
    return {
      success: true,
      transactionId,
      status: "COMPLETED",
    };
  }

  verifyWebhookSignature(_payload: string, signature: string): boolean {
    return signature === "mock_valid_signature" || process.env.NODE_ENV !== "production";
  }
}

export class MockPayoutProvider implements PayoutProvider {
  name = "MockPayoutProvider";

  async processPayout(request: PayoutRequest): Promise<PayoutResult> {
    const providerReference = `mock_payout_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // In mock mode, immediately complete or simulate fast processing
    return {
      success: true,
      providerReference,
      status: "COMPLETED",
      feeDeducted: request.fee,
      estimatedSettlement: "Instant (Mock Dev Payout)",
    };
  }

  async verifyPayoutStatus(providerReference: string): Promise<PayoutResult> {
    return {
      success: true,
      providerReference,
      status: "COMPLETED",
    };
  }
}
