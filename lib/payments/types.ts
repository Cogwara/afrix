export type SupportedCurrency = "USD" | "NGN" | "USDT" | "USDC";

export interface CampaignFundingRequest {
  campaignId: string;
  businessId: string;
  amount: number;
  currency: SupportedCurrency;
  description: string;
  returnUrl?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  checkoutUrl?: string;
  metadata?: Record<string, unknown>;
  error?: string;
}

export interface PayoutRequest {
  withdrawalId: string;
  userId: string;
  amount: number;
  fee: number;
  netAmount: number;
  currency: SupportedCurrency;
  method: "BANK" | "MOBILE_MONEY" | "STABLECOIN" | "OTHER";
  destination: {
    accountNumber?: string;
    bankCode?: string;
    accountName?: string;
    mobileNumber?: string;
    mobileNetwork?: string;
    walletAddress?: string;
    network?: string; // e.g. "TRC20" | "ERC20" | "Polygon"
    [key: string]: unknown;
  };
}

export interface PayoutResult {
  success: boolean;
  providerReference: string;
  status: "REQUESTED" | "PROCESSING" | "COMPLETED" | "FAILED";
  feeDeducted?: number;
  estimatedSettlement?: string;
  error?: string;
}

export interface WebhookEvent {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  signature: string;
}

export interface PaymentProvider {
  name: string;
  initiateCampaignFunding(request: CampaignFundingRequest): Promise<PaymentResult>;
  verifyPayment(transactionId: string): Promise<PaymentResult>;
  verifyWebhookSignature(payload: string, signature: string): boolean;
}

export interface PayoutProvider {
  name: string;
  processPayout(request: PayoutRequest): Promise<PayoutResult>;
  verifyPayoutStatus(providerReference: string): Promise<PayoutResult>;
}
