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
  referralCode?: string;
}

export interface InitiatePaymentResponse {
  paymentId: string;
  paymentReference: string;
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
    const { data } = await apiClient.post<InitiatePaymentResponse>("/payment/initiate", payload);
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
   * Get payment history
   * GET /api/payment/history
   */
  async getPaymentHistory(params?: { page?: number; limit?: number }): Promise<PaymentHistoryResponse> {
    const { data } = await apiClient.get<PaymentHistoryResponse>("/payment/history", { params });
    return data;
  },
};
