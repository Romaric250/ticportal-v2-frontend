"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { CheckCircle, Lock, Star, Rocket, Download, Loader2 } from "lucide-react";
import Link from "next/link";
import { paymentService } from "@/src/lib/services/paymentService";
import { toast } from "sonner";

interface ProcessingStep {
  id: string;
  label: string;
  completed: boolean;
}

export default function PaymentSuccessfulPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);
  const [processing, setProcessing] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  const transId = searchParams.get("transId");
  const status = searchParams.get("status");

  const processingSteps: ProcessingStep[] = [
    { id: "account", label: "Activating your account", completed: false },
    { id: "stages", label: "Unlocking Stage 1: History of TiC Foundation", completed: false },
    { id: "points", label: "Setting up your Lifetime TIC Points", completed: false },
    { id: "portfolio", label: "Preparing your student portfolio", completed: false },
    { id: "complete", label: "Finalizing your TiC Summit journey", completed: false },
  ];

  useEffect(() => {
    setMounted(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    if (!mounted || !transId || status !== "SUCCESSFUL") return;

    const processPaymentSuccess = async () => {
      try {
        // Send request to backend to process payment success
        await paymentService.confirmPaymentSuccess({
          transId: transId!,
          status: status!,
        });

        // Simulate step-by-step processing (30 seconds total)
        for (let i = 0; i < processingSteps.length; i++) {
          setCurrentStep(i);
          // Wait 6 seconds per step (30 seconds total for 5 steps)
          await new Promise((resolve) => setTimeout(resolve, 6000));
        }

        // Processing complete
        setProcessing(false);
      } catch (error: any) {
        console.error("Error processing payment success:", error);
        toast.error("Failed to process payment. Please contact support.");
        // Still show success page even if API call fails
        // Skip processing steps and show success content immediately
        setProcessing(false);
      }
    };

    processPaymentSuccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, transId, status]);

  if (!mounted) {
    return null;
  }

  const handleClose = () => {
    router.push(`/${locale}/affiliate`);
  };

  // Only show success modal if status is SUCCESSFUL
  if (status !== "SUCCESSFUL") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        {/* Backdrop - Not clickable */}
        <div
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          aria-hidden
        />
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center relative">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Status Unknown</h1>
          <p className="text-slate-600 mb-4">Unable to verify payment status.</p>
          <button
            onClick={handleClose}
            className="w-full px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      {/* Backdrop - Not clickable */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        aria-hidden
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl ring-1 ring-slate-900/5">
        {/* Processing State */}
        {processing ? (
          <div className="p-8 sm:p-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <Loader2 className="w-10 h-10 text-slate-900 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Setting Up Your TiC Summit Journey</h1>
              <p className="text-sm text-slate-600">Please wait while we activate your account...</p>
            </div>

            {/* Processing Steps */}
            <div className="space-y-4">
              {processingSteps.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;

                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                      isActive
                        ? "bg-slate-50 border-2 border-slate-900"
                        : isCompleted
                        ? "bg-slate-50 border border-slate-200"
                        : "bg-slate-50 border border-slate-200 opacity-50"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isCompleted
                          ? "bg-slate-900"
                          : isActive
                          ? "bg-slate-900"
                          : "bg-slate-300"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : isActive ? (
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          isActive || isCompleted ? "text-slate-900" : "text-slate-500"
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Success Content */
          <div className="p-6 sm:p-8 overflow-hidden">
          {/* Header Section */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-3">
              <CheckCircle className="w-10 h-10 text-slate-900" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Payment Confirmed</h1>
            <p className="text-base text-slate-600">
              Your transaction was successful. Welcome to the summit!
            </p>
          </div>

          {/* Content Cards Section */}
          <div className="space-y-3 mb-6">
            {/* Card 1: Account Activated */}
            <div className="bg-slate-50 rounded-xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-slate-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Account Activated</h3>
                <p className="text-sm text-slate-600">
                  Your student status is now officially verified and active.
                </p>
              </div>
            </div>

            {/* Card 2: Stage 1 Unlocked */}
            <div className="bg-slate-50 rounded-xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-slate-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Stage 1 Unlocked</h3>
                <p className="text-sm text-slate-600">
                  You now have full access to{" "}
                  <Link
                    href={`/${locale}/student/stages/stage-1`}
                    className="text-blue-600 hover:text-blue-700 underline font-medium"
                  >
                    History of TiC Foundation.
                  </Link>
                </p>
              </div>
            </div>

            {/* Card 3: Initial Lifetime TIC Points */}
            <div className="bg-slate-50 rounded-xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 text-slate-900" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                      Initial Lifetime TIC Points (TP)
                    </h3>
                    <p className="text-sm text-slate-600">
                      TP is a permanent part of your student portfolio for future rewards and milestone recognition.
                    </p>
                  </div>
                  <div className="bg-slate-900 text-white px-3 py-1 rounded-full text-sm font-semibold shrink-0">
                    +500 TP
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Section */}
          <div className="text-center space-y-4">
            <button
              onClick={() => router.push(`/${locale}/affiliate`)}
              className="w-full bg-slate-900 text-white font-bold py-4 px-6 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <span>Start Your Journey</span>
              <Rocket className="w-5 h-5" />
            </button>

            <Link
              href={`/${locale}/api/payment/receipt?transId=${transId}`}
              className="inline-block text-sm text-slate-600 hover:text-slate-900 transition-colors flex items-center justify-center gap-1"
            >
              <Download className="w-4 h-4" />
              Download Payment Receipt (PDF)
            </Link>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
