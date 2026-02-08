import { apiClient } from "../api-client";

// ============================================================================
// Types
// ============================================================================

export type AffiliateSubRole =
  | "AFFILIATE"
  | "REGIONAL_COORDINATOR"
  | "ASSISTANT_REGIONAL_COORDINATOR"
  | "NATIONAL_COORDINATOR"
  | "ASSISTANT_NATIONAL_COORDINATOR";

export type AffiliateStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "TERMINATED";
export type AffiliateTier = "STANDARD" | "PREMIUM" | "VIP";
export type ReferralStatus = "PENDING" | "PAID" | "ACTIVATED" | "REFUNDED" | "FLAGGED";
export type CommissionStatus =
  | "PENDING"
  | "EARNED"
  | "LOCKED"
  | "APPROVED"
  | "PAID"
  | "REVOKED";
export type CommissionType = "AFFILIATE" | "REGIONAL" | "NATIONAL";
export type PaymentStatus = "PENDING" | "CONFIRMED" | "FAILED" | "REFUNDED";
export type CountryStatus = "ACTIVE" | "SUSPENDED" | "INACTIVE";
export type RegionStatus = "ACTIVE" | "SUSPENDED" | "INACTIVE";

export interface Country {
  id: string;
  name: string;
  code: string;
  currency?: string;
  status: CountryStatus;
  studentPrice: number;
  platformFee: number;
  affiliateCommissionRate: number;
  regionalCommissionRate: number;
  nationalCommissionRate: number;
  regions?: Region[];
  _count?: {
    affiliates: number;
    regionalCoordinators: number;
    nationalCoordinators: number;
  };
}

export interface Region {
  id: string;
  name: string;
  countryId: string;
  status: RegionStatus;
  country?: Country;
  _count?: {
    affiliates: number;
    regionalCoordinators: number;
  };
}

export interface AffiliateProfile {
  id: string;
  userId: string;
  subRole: AffiliateSubRole;
  referralCode: string;
  referralLink: string;
  status: AffiliateStatus;
  tier: AffiliateTier;
  commissionRate?: number;
  region: Region | null;
  country: Country | null;
  totalReferrals: number;
  activeReferrals: number;
  totalStudents: number;
  totalEarned: number;
  totalPaid: number;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  mobileMoneyNumber?: string;
  mobileMoneyProvider?: string;
  activatedAt?: string;
  assignedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Compatibility: map subRole to role
  role?: AffiliateSubRole;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface Payment {
  id: string;
  amount: number;
  status: PaymentStatus;
  verifiedAt?: string;
}

export interface Referral {
  id: string;
  student: Student;
  payment?: Payment;
  affiliate?: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
  registeredAt: string;
  status: ReferralStatus;
  commissionAmount?: number;
}

export interface Commission {
  id: string;
  type: CommissionType;
  baseAmount: number;
  percentage: number;
  commissionAmount: number;
  status: CommissionStatus;
  earnedAt: string;
  coolingPeriodEnds: string;
  approvedAt?: string;
  paidAt?: string;
  referral?: {
    student: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  affiliateProfile?: AffiliateProfile;
  payoutBatch?: unknown;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AffiliateDashboard {
  profile: {
    referralCode: string;
    referralLink: string;
    status: AffiliateStatus;
    tier: AffiliateTier;
    region: string;
  };
  stats: {
    totalReferrals: number;
    activeReferrals: number;
    pendingActivation: number;
    conversionRate: number;
  };
  earnings: {
    pending: number;
    earned: number;
    approved: number;
    paid: number;
    total: number;
  };
  recentReferrals: Array<{
    id: string;
    studentName: string;
    registeredAt: string;
    status: ReferralStatus;
    commissionAmount: number;
  }>;
}

export interface RegionalDashboard {
  profile: {
    region: string;
    status: AffiliateStatus;
    totalAffiliates: number;
    activeAffiliates: number;
  };
  stats: {
    totalReferrals: number;
    activeReferrals: number;
    conversionRate: number;
  };
  earnings: {
    pending: number;
    earned: number;
    approved: number;
    paid: number;
    total: number;
  };
  affiliates: Array<{
    id: string;
    name: string;
    email: string;
    status: AffiliateStatus;
    referralCode: string;
    totalReferrals: number;
  }>;
}

export interface NationalDashboard {
  profile: {
    country: string;
    status: AffiliateStatus;
    totalRegions: number;
    totalAffiliates: number;
    activeAffiliates: number;
    totalRegionalCoordinators: number;
  };
  stats: {
    totalReferrals: number;
    activeReferrals: number;
    conversionRate: number;
  };
  earnings: {
    pending: number;
    earned: number;
    approved: number;
    paid: number;
    total: number;
  };
  regions: Array<{
    id: string;
    name: string;
    affiliatesCount: number;
    activeAffiliatesCount: number;
    coordinatorsCount: number;
  }>;
}

export interface ReferralValidation {
  valid: boolean;
  affiliateId: string;
  affiliateName: string;
  regionId?: string;
  regionName: string;
}

// ============================================================================
// Request/Response Types
// ============================================================================

export interface CreateAffiliateRequest {
  userId: string;
  regionId: string;
  subRole?: AffiliateSubRole;
}

export interface CreateAffiliateResponse {
  id: string;
  userId: string;
  subRole: AffiliateSubRole;
  referralCode: string;
  referralLink: string;
  status: AffiliateStatus;
  region: Region;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface RegenerateCodeResponse {
  oldReferralCode: string;
  newReferralCode: string;
  newReferralLink: string;
}

export interface GetReferralsParams {
  status?: ReferralStatus;
  page?: number;
  limit?: number;
}

export interface GetReferralsResponse {
  referrals: Referral[];
  pagination: Pagination;
}

export interface GetCommissionsParams {
  status?: CommissionStatus;
  type?: CommissionType;
  page?: number;
  limit?: number;
}

export interface GetCommissionsResponse {
  commissions: Commission[];
  pagination: Pagination;
}

export interface CreateCountryRequest {
  code: string;
  name: string;
  currency?: string;
  studentPrice: number;
  platformFee: number;
  affiliateCommissionRate: number;
  regionalCommissionRate: number;
  nationalCommissionRate: number;
  status?: CountryStatus;
}

export interface CreateRegionRequest {
  countryId: string;
  name: string;
}

export interface UpdateUserRoleRequest {
  userId: string;
  newRole: "AFFILIATE" | "REGIONAL_COORDINATOR" | "NATIONAL_COORDINATOR" | "STUDENT" | "MENTOR" | "ADMIN";
  regionId?: string;
  countryId?: string;
}

export interface UpdateUserRoleResponse {
  success: boolean;
  oldRole: string;
  newRole: string;
}

export interface ActivateAffiliateRequest {
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  mobileMoneyNumber?: string;
  mobileMoneyProvider?: string;
}

export interface ListAffiliatesParams {
  page?: number;
  limit?: number;
  status?: AffiliateStatus;
  search?: string;
  regionId?: string;
  countryId?: string;
}

export interface ListAffiliatesResponse {
  affiliates: Array<AffiliateProfile & {
    user?: {
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
  pagination: Pagination;
}

export interface FinancialOverview {
  totalRevenue: number;
  commissionsOwed: number;
  commissionsPaid: number;
  ticNetFees: number;
}

export interface LedgerEntry {
  id: string;
  transactionId: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
  };
  payment: {
    id: string;
    amount: number;
    status: PaymentStatus;
  };
  affiliateCommission?: number;
  regionalCommission?: number;
  nationalCommission?: number;
  ticNet: number;
  status: "completed" | "error";
  createdAt: string;
}

export interface GetLedgerParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface GetLedgerResponse {
  entries: LedgerEntry[];
  pagination: Pagination;
}

export interface PayoutBatch {
  id: string;
  affiliateId?: string;
  affiliateCode?: string;
  affiliateName?: string;
  amount: number;
  status: "PENDING" | "PROCESSING" | "PAID" | "FAILED";
  createdAt: string;
  paidAt?: string;
  commissionCount: number;
}

export interface GetPayoutsParams {
  page?: number;
  limit?: number;
  status?: "PENDING" | "PROCESSING" | "PAID" | "FAILED";
}

export interface GetPayoutsResponse {
  payouts: PayoutBatch[];
  pagination: Pagination;
}

export interface FraudFlag {
  id: string;
  type: "HIGH_VELOCITY" | "TIER_DISCREPANCY" | "CHARGEBACK_RISK" | "DUPLICATE_REFERRAL" | "OTHER";
  severity: "CRITICAL" | "WARNING" | "INFO";
  title: string;
  description: string;
  affiliateId?: string;
  referralId?: string;
  transactionId?: string;
  createdAt: string;
  resolvedAt?: string;
  resolved: boolean;
}

export interface GetFraudFlagsParams {
  page?: number;
  limit?: number;
  severity?: "CRITICAL" | "WARNING" | "INFO";
  resolved?: boolean;
}

export interface GetFraudFlagsResponse {
  flags: FraudFlag[];
  pagination: Pagination;
}

export interface CommissionTierConfig {
  standard: {
    affiliateRate: number;
    regionalRate: number;
    nationalRate: number;
  };
}

export interface UpdateCommissionTierRequest {
  affiliateRate: number;
  regionalRate: number;
  nationalRate: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Maps subRole from API to role for compatibility
 */
function mapSubRoleToRole(profile: AffiliateProfile): AffiliateProfile {
  return {
    ...profile,
    role: profile.subRole,
  };
}

// ============================================================================
// Service
// ============================================================================

export const affiliateService = {
  /**
   * Get affiliate profile
   * GET /api/affiliate/profile
   */
  async getProfile(): Promise<AffiliateProfile> {
    const { data } = await apiClient.get<AffiliateProfile>("/affiliate/profile");
    return mapSubRoleToRole(data);
  },

  /**
   * Create affiliate profile (Admin only)
   * POST /api/affiliate/admin/affiliates
   */
  async createAffiliate(payload: CreateAffiliateRequest): Promise<CreateAffiliateResponse> {
    const { data } = await apiClient.post<CreateAffiliateResponse>(
      "/affiliate/admin/affiliates",
      payload
    );
    return data;
  },

  /**
   * Regenerate referral code
   * POST /api/affiliate/regenerate-code
   */
  async regenerateCode(): Promise<RegenerateCodeResponse> {
    const { data } = await apiClient.post<RegenerateCodeResponse>(
      "/affiliate/regenerate-code"
    );
    return data;
  },

  /**
   * Validate referral code (Public)
   * GET /api/affiliate/validate/:referralCode
   */
  async validateReferralCode(referralCode: string): Promise<ReferralValidation> {
    const { data } = await apiClient.get<ReferralValidation>(
      `/affiliate/validate/${referralCode}`
    );
    return data;
  },

  /**
   * Get affiliate dashboard
   * GET /api/affiliate/dashboard
   */
  async getDashboard(): Promise<AffiliateDashboard> {
    const { data } = await apiClient.get<AffiliateDashboard>("/affiliate/dashboard");
    return data;
  },

  /**
   * Get regional coordinator dashboard
   * GET /api/affiliate/regional/dashboard
   */
  async getRegionalDashboard(): Promise<RegionalDashboard> {
    const { data } = await apiClient.get<RegionalDashboard>("/affiliate/regional/dashboard");
    return data;
  },

  /**
   * Get national coordinator dashboard
   * GET /api/affiliate/national/dashboard
   */
  async getNationalDashboard(): Promise<NationalDashboard> {
    const { data } = await apiClient.get<NationalDashboard>("/affiliate/national/dashboard");
    return data;
  },

  /**
   * Get referrals
   * GET /api/affiliate/referrals
   */
  async getReferrals(params?: GetReferralsParams): Promise<GetReferralsResponse> {
    const { data } = await apiClient.get<GetReferralsResponse>("/affiliate/referrals", {
      params,
    });
    return data;
  },

  /**
   * Get commissions
   * GET /api/affiliate/commissions
   */
  async getCommissions(params?: GetCommissionsParams): Promise<GetCommissionsResponse> {
    const { data } = await apiClient.get<GetCommissionsResponse>("/affiliate/commissions", {
      params,
    });
    return data;
  },

  /**
   * Get countries (Public endpoint)
   * GET /api/affiliate/countries
   */
  async getCountries(): Promise<Country[]> {
    const { data } = await apiClient.get<Country[]>("/affiliate/countries");
    return data;
  },

  /**
   * Get regions by country
   * GET /api/affiliate/admin/countries/:countryId/regions
   */
  async getRegionsByCountry(countryId: string): Promise<Region[]> {
    const { data } = await apiClient.get<Region[]>(
      `/affiliate/admin/countries/${countryId}/regions`
    );
    return data;
  },

  /**
   * Create country (Admin only)
   * POST /api/affiliate/admin/countries
   */
  async createCountry(payload: CreateCountryRequest): Promise<Country> {
    const { data } = await apiClient.post<Country>("/affiliate/admin/countries", payload);
    return data;
  },

  /**
   * Create region (Admin/National Coordinator)
   * POST /api/affiliate/admin/regions
   */
  async createRegion(payload: CreateRegionRequest): Promise<Region> {
    const { data } = await apiClient.post<Region>("/affiliate/admin/regions", payload);
    return data;
  },

  /**
   * Update country (Admin only)
   * PUT /api/affiliate/admin/countries/:countryId
   */
  async updateCountry(countryId: string, payload: CreateCountryRequest): Promise<Country> {
    const { data } = await apiClient.put<Country>(`/affiliate/admin/countries/${countryId}`, payload);
    return data;
  },

  /**
   * Delete country (Admin only)
   * DELETE /api/affiliate/admin/countries/:countryId
   */
  async deleteCountry(countryId: string): Promise<void> {
    await apiClient.delete(`/affiliate/admin/countries/${countryId}`);
  },

  /**
   * Update region (Admin/National Coordinator)
   * PUT /api/affiliate/admin/regions/:regionId
   */
  async updateRegion(regionId: string, payload: { name: string }): Promise<Region> {
    const { data } = await apiClient.put<Region>(`/affiliate/admin/regions/${regionId}`, payload);
    return data;
  },

  /**
   * Delete region (Admin/National Coordinator)
   * DELETE /api/affiliate/admin/regions/:regionId
   */
  async deleteRegion(regionId: string): Promise<void> {
    await apiClient.delete(`/affiliate/admin/regions/${regionId}`);
  },

  /**
   * Update user role (Admin only)
   * PUT /api/affiliate/admin/users/role
   */
  async updateUserRole(payload: UpdateUserRoleRequest): Promise<UpdateUserRoleResponse> {
    const { data } = await apiClient.put<UpdateUserRoleResponse>(
      "/affiliate/admin/users/role",
      payload
    );
    return data;
  },

  /**
   * Activate affiliate
   * PATCH /api/affiliate/admin/affiliates/:affiliateId/activate
   */
  async activateAffiliate(
    affiliateId: string,
    payload: ActivateAffiliateRequest
  ): Promise<AffiliateProfile> {
    const { data } = await apiClient.patch<AffiliateProfile>(
      `/affiliate/admin/affiliates/${affiliateId}/activate`,
      payload
    );
    return mapSubRoleToRole(data);
  },

  // ============================================================================
  // Admin Endpoints
  // ============================================================================

  /**
   * List all affiliates (Admin only)
   * GET /api/affiliate/admin/affiliates
   */
  async listAffiliates(params?: ListAffiliatesParams): Promise<ListAffiliatesResponse> {
    const { data } = await apiClient.get<ListAffiliatesResponse>("/affiliate/admin/affiliates", {
      params,
    });
    return {
      ...data,
      affiliates: data.affiliates.map(mapSubRoleToRole),
    };
  },

  /**
   * Suspend affiliate (Admin only)
   * PATCH /api/affiliate/admin/affiliates/:affiliateId/suspend
   */
  async suspendAffiliate(affiliateId: string): Promise<AffiliateProfile> {
    const { data } = await apiClient.patch<AffiliateProfile>(
      `/affiliate/admin/affiliates/${affiliateId}/suspend`
    );
    return mapSubRoleToRole(data);
  },

  /**
   * Unsuspend affiliate (Admin only)
   * PATCH /api/affiliate/admin/affiliates/:affiliateId/unsuspend
   */
  async unsuspendAffiliate(affiliateId: string): Promise<AffiliateProfile> {
    const { data } = await apiClient.patch<AffiliateProfile>(
      `/affiliate/admin/affiliates/${affiliateId}/unsuspend`
    );
    return mapSubRoleToRole(data);
  },

  /**
   * Get financial overview (Admin only)
   * GET /api/affiliate/admin/financial-overview
   */
  async getFinancialOverview(): Promise<FinancialOverview> {
    const { data } = await apiClient.get<FinancialOverview>("/affiliate/admin/financial-overview");
    return data;
  },

  /**
   * Get system ledger (Admin only)
   * GET /api/affiliate/admin/system-ledger
   */
  async getSystemLedger(params?: GetLedgerParams): Promise<GetLedgerResponse> {
    const { data } = await apiClient.get<GetLedgerResponse>("/affiliate/admin/system-ledger", {
      params,
    });
    return data;
  },

  /**
   * Get payout batches (Admin only)
   * GET /api/affiliate/admin/payouts
   */
  async getPayouts(params?: GetPayoutsParams): Promise<GetPayoutsResponse> {
    const { data } = await apiClient.get<GetPayoutsResponse>("/affiliate/admin/payouts", {
      params,
    });
    return data;
  },

  /**
   * Get fraud flags (Admin only)
   * GET /api/affiliate/admin/fraud-flags
   */
  async getFraudFlags(params?: GetFraudFlagsParams): Promise<GetFraudFlagsResponse> {
    const { data } = await apiClient.get<GetFraudFlagsResponse>("/affiliate/admin/fraud-flags", {
      params,
    });
    return data;
  },

  /**
   * Get commission tier configuration (Admin only)
   * GET /api/affiliate/admin/commission-tiers
   */
  async getCommissionTiers(): Promise<CommissionTierConfig> {
    const { data } = await apiClient.get<CommissionTierConfig | { standard: { affiliateRate: number; regionalRate: number; nationalRate: number } }>("/affiliate/admin/commission-tiers");
    // Ensure the response has the standard property
    if (data && 'standard' in data) {
      return data as CommissionTierConfig;
    }
    // If response is flat, wrap it in standard (shouldn't happen, but defensive)
    if (data && 'affiliateRate' in data) {
      const flatData = data as any;
      return {
        standard: {
          affiliateRate: flatData.affiliateRate || 0.09,
          regionalRate: flatData.regionalRate || 0.06,
          nationalRate: flatData.nationalRate || 0.05,
        },
      };
    }
    // Default fallback
    return {
      standard: {
        affiliateRate: 0.09,
        regionalRate: 0.06,
        nationalRate: 0.05,
      },
    };
  },

  /**
   * Update commission tier configuration (Admin only)
   * PUT /api/affiliate/admin/commission-tiers
   */
  async updateCommissionTier(payload: UpdateCommissionTierRequest): Promise<CommissionTierConfig> {
    const { data } = await apiClient.put<{ affiliateRate: number; regionalRate: number; nationalRate: number }>(
      "/affiliate/admin/commission-tiers",
      payload
    );
    // Transform flat response to match CommissionTierConfig structure
    return {
      standard: {
        affiliateRate: data.affiliateRate,
        regionalRate: data.regionalRate,
        nationalRate: data.nationalRate,
      },
    };
  },
};
