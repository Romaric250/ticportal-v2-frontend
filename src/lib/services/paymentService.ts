import { apiClient } from "../api-client";

export interface PaymentMethod {
  id: string;
  name: string;
  logo?: string;
  numberFormat?: string;
}

export interface PaymentMethodsResponse {
  methods: PaymentMethod[];
}

export interface DetectMethodRequest {
  phoneNumber: string;
}

export interface DetectMethodResponse {
  method: string;
  name: string;
}

export interface InitiatePaymentRequest {
  phoneNumber: string;
  amount: number;
  countryId: string;
  userId: string; // ID of the user being paid for (selected student or current user)
  referralCode?: string;
}

export interface InitiatePaymentResponse {
  paymentId: string;
  paymentReference: string;
  fapshiTransId?: string;
  paymentLink?: string;
  status: "PENDING" | "CONFIRMED" | "FAILED" | "REFUNDED";
  amount: number;
  currency: string;
  phoneNumber: string;
  externalTransactionId?: string;
  message: string;
}

export interface PaymentStatusResponse {
  paymentId: string;
  status: "PENDING" | "CONFIRMED" | "FAILED" | "REFUNDED";
  amount: number;
  currency: string;
  paymentReference: string;
  externalTransactionId?: string;
  paidAt?: string;
  commissions?: {
    affiliate?: { amount: number; status: string };
    regional?: { amount: number; status: string };
    national?: { amount: number; status: string };
  };
}

export interface PaymentHistoryItem {
  id: string;
  paymentReference: string;
  amount: number;
  status: "PENDING" | "CONFIRMED" | "FAILED" | "REFUNDED";
  createdAt: string;
  paidAt?: string;
}

export interface PaymentHistoryResponse {
  payments: PaymentHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const paymentService = {
  /**
   * Get supported payment methods
   * GET /api/payment/methods
   */
  async getPaymentMethods(): Promise<PaymentMethodsResponse> {
    const { data } = await apiClient.get<PaymentMethodsResponse>("/payment/methods");
    return data;
  },

  /**
   * Detect payment method from phone number
   * POST /api/payment/detect-method
   */
  async detectMethod(payload: DetectMethodRequest): Promise<DetectMethodResponse> {
    const { data } = await apiClient.post<DetectMethodResponse>("/payment/detect-method", payload);
    return data;
  },

  /**
   * Initiate payment
   * POST /api/payment/initiate
   */
  async initiatePayment(payload: InitiatePaymentRequest): Promise<InitiatePaymentResponse> {
    const { data } = await apiClient.post<InitiatePaymentResponse>("/payment/initiate", payload, {
      skipRefresh: true, // Skip automatic token refresh - let error handling handle 401
    });
    return data;
  },

  /**
   * Check payment status
   * GET /api/payment/:paymentId/status
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    const { data } = await apiClient.get<PaymentStatusResponse>(`/payment/${paymentId}/status`);
    return data;
  },

  /**
   * Check if current user has paid
   * GET /api/payment/status
   */
  async checkUserPaymentStatus(): Promise<{ hasPaid: boolean; isRequired: boolean }> {
    const { data } = await apiClient.get<{ hasPaid: boolean; isRequired: boolean }>("/payment/status");
    return data;
  },

  /**
   * Get payment history
   * GET /api/payment/history
   */
  async getPaymentHistory(params?: { page?: number; limit?: number }): Promise<PaymentHistoryResponse> {
    const { data } = await apiClient.get<PaymentHistoryResponse>("/payment/history", { params });
    return data;
  },

  /**
   * Confirm payment success (called after Fapshi redirect)
   * POST /api/payment/confirm-success
   */
  async confirmPaymentSuccess(payload: { transId: string; status: string }): Promise<{ success: boolean }> {
    const { data } = await apiClient.post<{ success: boolean }>("/payment/confirm-success", payload);
    return data;
  },
};
