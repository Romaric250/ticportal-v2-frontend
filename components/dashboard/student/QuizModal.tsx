"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { learningPathService } from "../../../src/lib/services/learningPathService";
import type { QuizQuestion } from "../../../src/lib/services/learningPathService";

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  pathId: string;
  moduleId: string;
  questions: QuizQuestion[];
  isCompleted?: boolean;
  onComplete?: (result: { quizScore: number; pointsAwarded: number; passed: boolean }) => void;
}

export const QuizModal = ({
  isOpen,
  onClose,
  pathId,
  moduleId,
  questions,
  isCompleted = false,
  onComplete,
}: QuizModalProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<{
    quizScore: number;
    pointsAwarded: number;
    passed: boolean;
  } | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      // Reset all state when modal closes
      setCurrentQuestion(0);
      setAnswers({});
      setSubmitted(false);
      setSubmitting(false);
      setQuizResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAnswerSelect = (optionIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: optionIndex,
    }));
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      toast.error("Please answer all questions before submitting");
      return;
    }

    if (submitted || submitting) {
      return; // Prevent double submission
    }

    // Calculate score before submitting to validate minimum requirement
    const answerArray = questions.map((_, index) => answers[index] ?? -1);
    const correctAnswers = questions.filter((q, index) => answers[index] === q.correctAnswer).length;
    const calculatedScore = questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0;
    
    // Validate minimum score requirement (50%)
    if (calculatedScore < 50) {
      toast.error(`Score too low! You need at least 50% to submit. Your current score is ${calculatedScore}%. Please review and try again.`);
      return;
    }

    try {
      setSubmitting(true);
      const result = await learningPathService.submitQuiz(pathId, moduleId, answerArray);
      
      console.log("📦 Quiz Result from API:", result);
      
      // Validate result structure
      if (!result || typeof result.passed === 'undefined') {
        console.error("❌ Invalid quiz result structure:", result);
        toast.error("Invalid response from server. Please try again.");
        return;
      }
      
      setQuizResult(result);
      setSubmitted(true);
      
      if (result.passed) {
        toast.success(`Quiz passed! You scored ${result.quizScore}% and earned ${result.pointsAwarded} points! 🎉`);
      } else {
        toast.info(`Quiz completed. You scored ${result.quizScore}%. You earned ${result.pointsAwarded} points.`);
      }
      
      // Call onComplete callback
      onComplete?.(result);
    } catch (error: any) {
      console.error("❌ Quiz submission error:", error);
      if (error?.response?.status === 409) {
        toast.info("Module already completed");
        // Still mark as submitted to show results
        setSubmitted(true);
        onComplete?.({ quizScore: 0, pointsAwarded: 0, passed: false });
      } else {
        toast.error(error?.response?.data?.message || error?.message || "Failed to submit quiz");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const question = questions[currentQuestion];
  const selectedAnswer = answers[currentQuestion];
  const isCorrect = selectedAnswer === question.correctAnswer;
  const showAnswer = submitted && quizResult;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <div className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-lg border border-slate-200 bg-white shadow-xl flex flex-col sm:m-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5 sm:p-4 flex-shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h2 className="text-base sm:text-xl font-bold text-slate-900">Quiz</h2>
              {isCompleted && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-emerald-700">
                  <CheckCircle2 size={10} className="sm:w-3 sm:h-3" />
                  <span className="hidden xs:inline">Complete</span>
                </span>
              )}
            </div>
            <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-slate-600">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 sm:p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 flex-shrink-0 ml-1.5 sm:ml-2"
            aria-label="Close"
          >
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="border-b border-slate-200 px-3 sm:px-4 py-1.5 sm:py-2 flex-shrink-0">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[#111827] transition-all"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 overflow-y-auto px-3 py-2.5 sm:p-4 min-h-0">
          {!submitted && !isCompleted ? (
            <>
              <div className="mb-3 sm:mb-4">
                <div className="mb-2 sm:mb-3 flex items-start gap-1.5 sm:gap-2">
                  <span className="flex-shrink-0 rounded-full bg-[#111827] px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-white">
                    {currentQuestion + 1}
                  </span>
                  <p className="text-sm sm:text-lg font-semibold text-slate-900 break-words">{question.question}</p>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-2.5">
                {question.options.map((option, oIndex) => {
                  const isSelected = selectedAnswer === oIndex;

                  return (
                    <button
                      key={oIndex}
                      type="button"
                      onClick={() => handleAnswerSelect(oIndex)}
                      className={`w-full rounded-lg border-2 p-2.5 sm:p-4 text-left text-xs sm:text-base transition-all ${
                        isSelected
                          ? "border-[#111827] bg-slate-50"
                          : "border-slate-200 bg-white hover:border-slate-300 active:bg-slate-50"
                      }`}
                    >
                      <span className="text-slate-900 break-words">{option}</span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : isCompleted ? (
            <>
              <div className="mb-3 sm:mb-4">
                <div className="mb-2 sm:mb-3 flex items-start gap-1.5 sm:gap-2">
                  <span className="flex-shrink-0 rounded-full bg-[#111827] px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-white">
                    {currentQuestion + 1}
                  </span>
                  <p className="text-sm sm:text-lg font-semibold text-slate-900 break-words">{question.question}</p>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-2.5">
                {question.options.map((option, oIndex) => {
                  const isCorrectOption = oIndex === question.correctAnswer;

                  return (
                    <div
                      key={oIndex}
                      className={`w-full rounded-lg border-2 p-2.5 sm:p-4 text-xs sm:text-base ${
                        isCorrectOption
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`break-words ${
                            isCorrectOption ? "text-emerald-700" : "text-slate-900"
                          }`}
                        >
                          {option}
                        </span>
                        {isCorrectOption && <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 sm:w-5 sm:h-5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className="mb-3 sm:mb-4">
                <div className="mb-2 sm:mb-3 flex items-start gap-1.5 sm:gap-2">
                  <span className="flex-shrink-0 rounded-full bg-[#111827] px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-white">
                    {currentQuestion + 1}
                  </span>
                  <p className="text-sm sm:text-lg font-semibold text-slate-900 break-words">{question.question}</p>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-2.5">
                {question.options.map((option, oIndex) => {
                  const isSelected = selectedAnswer === oIndex;
                  const isCorrectOption = oIndex === question.correctAnswer;
                  const showCorrect = isCorrectOption;
                  const showIncorrect = isSelected && !isCorrect;

                  return (
                    <div
                      key={oIndex}
                      className={`w-full rounded-lg border-2 p-2.5 sm:p-4 text-xs sm:text-base ${
                        showIncorrect
                          ? "border-red-500 bg-red-50"
                          : showCorrect
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`break-words ${
                            showIncorrect
                              ? "text-red-700"
                              : showCorrect
                              ? "text-emerald-700"
                              : "text-slate-900"
                          }`}
                        >
                          {option}
                        </span>
                        {showAnswer && (
                          <div className="flex-shrink-0">
                            {showCorrect && <CheckCircle2 size={16} className="text-emerald-600 sm:w-5 sm:h-5" />}
                            {showIncorrect && <XCircle size={16} className="text-red-600 sm:w-5 sm:h-5" />}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {quizResult && currentQuestion === questions.length - 1 && (
                <div
                  className={`mt-4 sm:mt-6 rounded-lg border-2 p-3 sm:p-4 ${
                    quizResult.passed
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                    <AlertCircle
                      size={16}
                      className={`${quizResult.passed ? "text-emerald-600" : "text-[#111827]"} sm:w-[18px] sm:h-[18px]`}
                    />
                    <p className="text-xs sm:text-sm font-semibold text-slate-900">Quiz Results</p>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700">
                    You scored{" "}
                    <span className="font-bold text-[#111827]">{quizResult.quizScore}%</span> (
                    {Math.round((quizResult.quizScore / 100) * questions.length)} out of {questions.length}{" "}
                    questions correct).
                  </p>
                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm font-semibold text-emerald-700">
                    🎉 You earned {quizResult.pointsAwarded} points!
                  </p>
                  <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-slate-600">
                    {quizResult.passed
                      ? "Congratulations! You passed the quiz! 🎉"
                      : "You didn't pass this time. Review the content and try again."}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-slate-200 px-3 py-2.5 sm:p-4 bg-white flex-shrink-0">
          {!submitted && !isCompleted ? (
            <div className="flex items-center justify-between gap-1.5 sm:gap-3">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="flex-1 text-center text-[10px] sm:text-xs text-slate-500 px-1 sm:px-2">
                {Object.keys(answers).length} / {questions.length}
              </div>

              {currentQuestion === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={Object.keys(answers).length < questions.length || submitting || submitted}
                  className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-[#1f2937] disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin sm:w-[18px] sm:h-[18px]" />
                      <span className="text-xs sm:text-sm">Submitting...</span>
                    </>
                  ) : (
                    <span className="text-xs sm:text-sm">Submit Quiz</span>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 rounded-lg bg-[#111827] px-2 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-[#1f2937] flex-shrink-0"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              )}
            </div>
          ) : isCompleted ? (
            <div className="flex items-center justify-between gap-1.5 sm:gap-3">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="flex-1 text-center text-[10px] sm:text-xs text-slate-500 px-1 sm:px-2">
                {currentQuestion + 1} / {questions.length}
              </div>

              {currentQuestion < questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 rounded-lg bg-[#111827] px-2 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-[#1f2937] flex-shrink-0"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-[#1f2937] flex-shrink-0"
                >
                  Close
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full rounded-lg bg-[#111827] px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-[#1f2937]"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
