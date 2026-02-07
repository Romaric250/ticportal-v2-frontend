"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { X, CheckCircle, Loader2, Phone, Lock, Search, User, Users } from "lucide-react";
import { toast } from "sonner";
import { paymentService, type PaymentMethod } from "@/src/lib/services/paymentService";
import { affiliateService, type Country } from "@/src/lib/services/affiliateService";
import { useAuthStore } from "@/src/state/auth-store";
import { userService, type SearchUserResult } from "@/src/lib/services/userService";
import { tokenStorage } from "@/src/lib/api-client";

const THEME = "#111827";

function formatXAF(value: number): string {
  return value.toLocaleString("fr-FR") + " XAF";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface ReferralInfo {
  valid: boolean;
  affiliateId: string;
  affiliateName: string;
  regionId?: string;
  regionName: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const { user, accessToken, initialize, initialized, setUser } = useAuthStore();
  
  const referralCode = searchParams.get("ref") || undefined;
  
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [detectedMethod, setDetectedMethod] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  
  // Student search for paying for different student
  const [payingForDifferent, setPayingForDifferent] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [studentSearchResults, setStudentSearchResults] = useState<SearchUserResult[]>([]);
  const [searchingStudents, setSearchingStudents] = useState(false);
  const [showStudentSuggestions, setShowStudentSuggestions] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<SearchUserResult | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const studentSearchRef = useRef<HTMLDivElement>(null);
  const studentInputRef = useRef<HTMLInputElement>(null);
  
  // Calculate amounts
  const platformFee = selectedCountry?.platformFee || 300;
  const registrationBase = selectedCountry?.studentPrice || 5000;
  const totalAmount = platformFee + registrationBase;
  const tpCredit = 100;
  const originalFee = 25000;
  const discountAmount = originalFee - registrationBase;
  const discountPercentage = Math.round((discountAmount / originalFee) * 100);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Initialize auth store
  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialize, initialized]);

  // Check authentication and load user if token exists
  useEffect(() => {
    const checkAuth = async () => {
      if (!initialized) return;
      
      setCheckingAuth(true);
      
      // Check if we have a token
      const hasToken = accessToken || (typeof window !== "undefined" && tokenStorage.getAccessToken());
      
      if (!hasToken) {
        setCheckingAuth(false);
        return;
      }
      
      // If we have a token but no user object, try to validate and load user
      if (hasToken && !user) {
        try {
          const profile = await userService.getProfile();
          setCurrentUserProfile(profile);
          setUser({
            id: profile.id,
            name: `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || profile.email,
            email: profile.email,
            role: null,
            firstName: profile.firstName,
            lastName: profile.lastName,
          });
        } catch (error: any) {
          console.warn("Auth check:", error?.response?.status === 401 ? "Token invalid" : "Auth check failed");
        }
      } else if (hasToken && user) {
        // Load current user profile
        try {
          const profile = await userService.getProfile();
          setCurrentUserProfile(profile);
        } catch (error) {
          console.warn("Failed to load user profile:", error);
        }
      }
      
      setCheckingAuth(false);
    };

    checkAuth();
  }, [initialized, accessToken, user, setUser]);

  // Load payment data once auth is checked
  useEffect(() => {
    if (!checkingAuth && initialized) {
      loadData();
    }
  }, [checkingAuth, initialized]);

  // Search students when query changes
  useEffect(() => {
    if (!payingForDifferent || !studentSearchQuery.trim() || studentSearchQuery.trim().length < 2) {
      setStudentSearchResults([]);
      setShowStudentSuggestions(false);
      return;
    }

    let isCancelled = false;

    const searchStudents = async () => {
      try {
        setSearchingStudents(true);
        const results = await userService.searchUsers(studentSearchQuery);
        
        if (isCancelled) return;
        
        setStudentSearchResults(results);
        setShowStudentSuggestions(true);
      } catch (error) {
        console.error("Error searching students:", error);
        if (!isCancelled) {
          setStudentSearchResults([]);
          setShowStudentSuggestions(false);
        }
      } finally {
        if (!isCancelled) {
          setSearchingStudents(false);
        }
      }
    };

    const debounceTimer = setTimeout(searchStudents, 300);
    return () => {
      isCancelled = true;
      clearTimeout(debounceTimer);
    };
  }, [studentSearchQuery, payingForDifferent]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        studentSearchRef.current &&
        !studentSearchRef.current.contains(event.target as Node) &&
        studentInputRef.current &&
        !studentInputRef.current.contains(event.target as Node)
      ) {
        setShowStudentSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (phoneNumber.length === 12 && phoneNumber.startsWith("237")) {
      detectPaymentMethod();
    } else {
      setDetectedMethod(null);
    }
  }, [phoneNumber]);

  useEffect(() => {
    if (referralCode) {
      validateReferralCode();
    }
  }, [referralCode]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [countriesData, methodsData] = await Promise.all([
        affiliateService.getCountries(),
        paymentService.getPaymentMethods(),
      ]);
      
      const activeCountries = countriesData.filter((c) => c.status === "ACTIVE");
      setCountries(activeCountries);
      setPaymentMethods(methodsData.methods);
      
      // Default to Cameroon
      const cameroon = activeCountries.find((c) => c.code === "CM");
      if (cameroon) {
        setSelectedCountry(cameroon);
      } else if (activeCountries.length > 0) {
        setSelectedCountry(activeCountries[0]);
      }
    } catch (error: any) {
      console.error("Failed to load data:", error);
      toast.error(error?.message || "Failed to load payment data");
    } finally {
      setLoading(false);
    }
  };

  const validateReferralCode = async () => {
    if (!referralCode) return;
    try {
      const info = await affiliateService.validateReferralCode(referralCode);
      if (info.valid) {
        setReferralInfo({
          valid: info.valid,
          affiliateId: info.affiliateId,
          affiliateName: info.affiliateName,
          regionId: info.regionId,
          regionName: info.regionName,
        });
      }
    } catch (error) {
      console.warn("Referral code validation failed:", error);
    }
  };

  const detectPaymentMethod = async () => {
    try {
      const result = await paymentService.detectMethod({ phoneNumber });
      setDetectedMethod(result.method);
      if (!selectedMethod) {
        setSelectedMethod(result.method);
      }
    } catch (error) {
      console.error("Failed to detect payment method:", error);
    }
  };

  const handleSelectStudent = (student: SearchUserResult) => {
    setSelectedStudent(student);
    setStudentSearchQuery(`${student.firstName} ${student.lastName} (${student.email})`);
    setShowStudentSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !accessToken) {
      toast.error("Please log in to continue with payment");
      router.push(`/${locale}/login?redirect=/pay${referralCode ? `?ref=${referralCode}` : ""}`);
      return;
    }
    
    if (!selectedCountry) {
      toast.error("Please select a country");
      return;
    }
    
    if (!phoneNumber || phoneNumber.length !== 12 || !phoneNumber.startsWith("237")) {
      toast.error("Please enter a valid phone number (237XXXXXXXXX)");
      return;
    }
    
    if (!selectedMethod) {
      toast.error("Please select a payment method");
      return;
    }

    // Note: Backend will use the authenticated user's ID from token
    // If paying for different student, that would need backend support
    setSubmitting(true);
    try {
      const result = await paymentService.initiatePayment({
        phoneNumber,
        amount: totalAmount,
        countryId: selectedCountry.id,
        referralCode: referralCode || undefined,
      });
      
      toast.success(result.message || "Payment initiated. Please check your phone and enter your PIN.");
      
      pollPaymentStatus(result.paymentId);
    } catch (error: any) {
      console.error("Failed to initiate payment:", error);
      toast.error(error?.message || "Failed to initiate payment");
      setSubmitting(false);
    }
  };

  const pollPaymentStatus = async (paymentId: string) => {
    const maxAttempts = 30;
    let attempts = 0;
    
    const poll = async () => {
      try {
        const status = await paymentService.getPaymentStatus(paymentId);
        
        if (status.status === "CONFIRMED") {
          toast.success("Payment confirmed successfully!");
          setSubmitting(false);
          router.push(`/${locale}/student`);
          return;
        }
        
        if (status.status === "FAILED") {
          toast.error("Payment failed. Please try again.");
          setSubmitting(false);
          return;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          toast.info("Payment is still processing. We'll notify you when it's confirmed.");
          setSubmitting(false);
        }
      } catch (error) {
        console.error("Error polling payment status:", error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          setSubmitting(false);
        }
      }
    };
    
    poll();
  };

  const handleClose = () => {
    router.push(`/${locale}/student`);
  };

  if (loading || checkingAuth) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          <Loader2 className="animate-spin text-slate-400" size={32} />
        </div>
      </div>
    );
  }

  const payingForUser = selectedStudent || (currentUserProfile ? {
    id: currentUserProfile.id,
    firstName: currentUserProfile.firstName,
    lastName: currentUserProfile.lastName,
    email: currentUserProfile.email,
    profilePhoto: currentUserProfile.profilePhoto,
  } : null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ overflow: "hidden" }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden
      />
      
      {/* Modal - Fixed height, no scrolling */}
      <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl ring-1 ring-slate-900/5 max-h-[95vh] flex flex-col overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 z-20 rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="grid lg:grid-cols-2 gap-0 flex-1 overflow-hidden">
          {/* Left Column - Benefits */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 sm:p-8 lg:p-10 lg:rounded-l-2xl rounded-t-2xl lg:rounded-tr-none flex flex-col">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Why Invest in TiC Summit?</h2>
            
            <div className="space-y-3 mb-4 flex-1">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Accumulate Lifetime TIC Points (TP)</p>
                  <p className="text-xs text-slate-600 mt-0.5">Build your TP balance that grows with every achievement and never expires</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Access to Global Alumni Network</p>
                  <p className="text-xs text-slate-600 mt-0.5">Connect with professionals worldwide and discover remote opportunities</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Exclusive TiC Scholarships</p>
                  <p className="text-xs text-slate-600 mt-0.5">Eligibility for special scholarships and educational funding programs</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Direct Industry Mentorship</p>
                  <p className="text-xs text-slate-600 mt-0.5">Get personalized guidance from experienced professionals in your field</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Career Development Resources</p>
                  <p className="text-xs text-slate-600 mt-0.5">Access workshops, webinars, and resources to advance your career</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Certification & Recognition</p>
                  <p className="text-xs text-slate-600 mt-0.5">Earn verified certificates and badges recognized by industry leaders</p>
                </div>
              </div>
            </div>

            {/* Logic Section - Back on left side */}
            <div className="bg-white/80 rounded-xl p-4 border border-slate-200 mt-auto">
              <p className="text-xs font-semibold text-slate-900 mb-2">Logic:</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                This payment of {formatXAF(totalAmount)} activates your account, unlocks Stage 1: History of TiC Foundation, and initiates your lifelong TP accumulation.
              </p>
            </div>
          </div>

          {/* Right Column - Payment Form */}
          <div className="p-6 sm:p-8 lg:p-10 lg:rounded-r-2xl rounded-b-2xl lg:rounded-bl-none overflow-y-auto">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Activation & Fee Payment</h1>
            <p className="text-sm text-slate-600 mb-6">Complete your TiC Summit registration</p>

            {/* Referral Banner */}
            {referralInfo?.valid && (
              <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-emerald-900">Payment via referral</p>
                    <p className="text-xs text-emerald-700 mt-1">
                      Referred by: {referralInfo.affiliateName} ({referralInfo.regionName})
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current User Display / Student Selection */}
              {user && accessToken && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-slate-700">
                      Paying For
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setPayingForDifferent(!payingForDifferent);
                        if (!payingForDifferent) {
                          setSelectedStudent(null);
                          setStudentSearchQuery("");
                        }
                      }}
                      className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1"
                    >
                      {payingForDifferent ? (
                        <>
                          <User size={14} />
                          Pay for myself
                        </>
                      ) : (
                        <>
                          <Users size={14} />
                          Pay for different student
                        </>
                      )}
                    </button>
                  </div>
                  
                  {payingForDifferent ? (
                    <div className="relative" ref={studentSearchRef}>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          ref={studentInputRef}
                          type="text"
                          value={studentSearchQuery}
                          onChange={(e) => {
                            setStudentSearchQuery(e.target.value);
                            setSelectedStudent(null);
                            if (e.target.value.length >= 2) {
                              setShowStudentSuggestions(true);
                            }
                          }}
                          onFocus={() => {
                            if (studentSearchQuery.trim().length >= 2 && studentSearchResults.length > 0) {
                              setShowStudentSuggestions(true);
                            }
                          }}
                          placeholder="Search student by name or email..."
                          className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        />
                        {searchingStudents && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400" size={16} />
                        )}
                      </div>
                      
                      {/* Student Suggestions */}
                      {showStudentSuggestions && studentSearchQuery.trim().length >= 2 && (
                        <div className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                          {studentSearchResults.length > 0 ? (
                            studentSearchResults.map((student) => (
                              <button
                                key={student.id}
                                type="button"
                                onClick={() => handleSelectStudent(student)}
                                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                              >
                                {student.profilePhoto ? (
                                  <img
                                    src={student.profilePhoto}
                                    alt={`${student.firstName} ${student.lastName}`}
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-400 to-slate-600 text-xs font-semibold text-white">
                                    {getInitials(`${student.firstName} ${student.lastName}`)}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-slate-900 truncate">
                                    {student.firstName} {student.lastName}
                                  </div>
                                  <div className="text-xs text-slate-500 truncate">{student.email}</div>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="p-3 text-sm text-slate-500 text-center">
                              No students found
                            </div>
                          )}
                        </div>
                      )}
                      
                      {selectedStudent && (
                        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                          <div className="flex items-center gap-2">
                            {selectedStudent.profilePhoto ? (
                              <img
                                src={selectedStudent.profilePhoto}
                                alt={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-xs font-semibold text-white">
                                {getInitials(`${selectedStudent.firstName} ${selectedStudent.lastName}`)}
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="text-xs font-medium text-emerald-900">
                                {selectedStudent.firstName} {selectedStudent.lastName}
                              </div>
                              <div className="text-xs text-emerald-700">{selectedStudent.email}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedStudent(null);
                                setStudentSearchQuery("");
                              }}
                              className="rounded p-1 text-emerald-600 hover:bg-emerald-100"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    payingForUser && (
                      <div className="flex items-center gap-3">
                        {payingForUser.profilePhoto ? (
                          <img
                            src={payingForUser.profilePhoto}
                            alt={`${payingForUser.firstName} ${payingForUser.lastName}`}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-400 to-slate-600 text-xs font-semibold text-white">
                            {getInitials(`${payingForUser.firstName} ${payingForUser.lastName}`)}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {payingForUser.firstName} {payingForUser.lastName}
                          </div>
                          <div className="text-xs text-slate-500">{payingForUser.email}</div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Country Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCountry?.id || ""}
                  onChange={(e) => {
                    const country = countries.find((c) => c.id === e.target.value);
                    setSelectedCountry(country || null);
                  }}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="">Select a country</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name} ({country.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone Number Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mobile Money Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 12) {
                        setPhoneNumber(value);
                      }
                    }}
                    placeholder="237XXXXXXXXX"
                    required
                    maxLength={12}
                    className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>
                {phoneNumber && phoneNumber.length !== 12 && (
                  <p className="mt-1 text-xs text-slate-500">
                    Enter 12 digits starting with 237
                  </p>
                )}
                {detectedMethod && (
                  <p className="mt-1 text-xs text-emerald-600">
                    Detected: {detectedMethod === "MTN" ? "MTN Mobile Money" : detectedMethod === "ORANGE" ? "Orange Money" : "Unknown"}
                  </p>
                )}
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Payment Method <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethod(method.id)}
                      className={`flex items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                        selectedMethod === method.id
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className={`h-10 w-10 shrink-0 rounded-lg flex items-center justify-center ${
                        selectedMethod === method.id ? "bg-emerald-500" : "bg-slate-100"
                      }`}>
                        <Phone className={`h-5 w-5 ${
                          selectedMethod === method.id ? "text-white" : "text-slate-600"
                        }`} />
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <p className={`text-sm font-medium truncate ${
                          selectedMethod === method.id ? "text-emerald-900" : "text-slate-900"
                        }`}>
                          {method.name}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Transaction Summary */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Transaction Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Account Activation:</span>
                    <span className="font-medium text-slate-900">Stage 1 Access</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Initial TP Credit:</span>
                    <span className="font-medium text-slate-900">+{tpCredit} TP</span>
                  </div>
                  
                  {/* Pricing Breakdown */}
                  <div className="pt-2 mt-2 border-t border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Original Fee:</span>
                      <span className="font-medium text-slate-500 line-through">{formatXAF(originalFee)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Discount ({discountPercentage}%):</span>
                      <span className="font-medium text-emerald-600">-{formatXAF(discountAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Registration Fee:</span>
                      <span className="font-medium text-slate-900">{formatXAF(registrationBase)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Processing Fee:</span>
                      <span className="font-medium text-slate-900">{formatXAF(platformFee)}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between items-center">
                    <span className="font-semibold text-slate-900">Total Amount:</span>
                    <span className="font-bold text-lg text-slate-900">{formatXAF(totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Authentication Notice */}
              {(!user || !accessToken) && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-medium text-amber-900 mb-2">
                    Authentication Required
                  </p>
                  <p className="text-xs text-amber-700 mb-3">
                    Please log in to complete your payment.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push(`/${locale}/login?redirect=/pay${referralCode ? `?ref=${referralCode}` : ""}`)}
                    className="w-full rounded-lg px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: THEME }}
                  >
                    Log In to Continue
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !user || !accessToken || !selectedCountry || !phoneNumber || !selectedMethod}
                className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: THEME }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    Confirm & Pay {formatXAF(totalAmount)}
                  </>
                )}
              </button>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 border-t border-slate-200 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Lock size={12} />
                  <span>Secure SSL Encrypted Transaction</span>
                </div>
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                  <a href="#" className="hover:text-slate-700">Privacy Policy</a>
                  <a href="#" className="hover:text-slate-700">Terms of Service</a>
                  <a href="#" className="hover:text-slate-700">Refund Policy</a>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
