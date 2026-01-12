"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { learningPathService } from "../../../src/lib/services/learningPathService";
import type { QuizQuestion } from "../../../src/lib/services/learningPathService";

interface ModuleQuizProps {
  pathId: string;
  moduleId: string;
  questions: QuizQuestion[];
  onComplete?: (result: { quizScore: number; pointsAwarded: number; passed: boolean }) => void;
}

export const ModuleQuiz = ({ pathId, moduleId, questions, onComplete }: ModuleQuizProps) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<{
    quizScore: number;
    pointsAwarded: number;
    passed: boolean;
  } | null>(null);

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      toast.error("Please answer all questions before submitting");
      return;
    }

    try {
      setSubmitting(true);
      const answerArray = questions.map((_, index) => answers[index] ?? -1);
      const result = await learningPathService.submitQuiz(pathId, moduleId, answerArray);
      
      setQuizResult(result);
      setSubmitted(true);
      setShowResults(true);
      
      // Show toast with points message
      if (result.passed) {
        toast.success(`Quiz passed! You scored ${result.quizScore}% and earned ${result.pointsAwarded} points! 🎉`);
      } else {
        toast.info(`Quiz completed. You scored ${result.quizScore}%. You earned ${result.pointsAwarded} points.`);
      }
      
      onComplete?.(result);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const getScore = () => {
    if (quizResult) {
      return {
        correct: Math.round((quizResult.quizScore / 100) * questions.length),
        total: questions.length,
        percentage: quizResult.quizScore,
      };
    }
    let correct = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return { correct, total: questions.length, percentage: Math.round((correct / questions.length) * 100) };
  };

  const score = getScore();

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-bold text-slate-900">Quiz</h3>

        {questions.map((question, qIndex) => {
          const selectedAnswer = answers[qIndex];
          const isCorrect = selectedAnswer === question.correctAnswer;
          const showAnswer = showResults;

          return (
            <div key={qIndex} className="mb-6 last:mb-0">
              <div className="mb-3 flex items-start gap-2">
                <span className="flex-shrink-0 rounded-full bg-[#111827] px-2.5 py-1 text-xs font-semibold text-white">
                  {qIndex + 1}
                </span>
                <p className="text-sm font-semibold text-slate-900">{question.question}</p>
              </div>

              <div className="space-y-2">
                {question.options.map((option, oIndex) => {
                  const isSelected = selectedAnswer === oIndex;
                  const isCorrectOption = oIndex === question.correctAnswer;
                  const showCorrect = showAnswer && isCorrectOption;
                  const showIncorrect = showAnswer && isSelected && !isCorrect;

                  return (
                    <button
                      key={oIndex}
                      type="button"
                      onClick={() => handleAnswerSelect(qIndex, oIndex)}
                      disabled={submitted}
                      className={`w-full rounded-lg border-2 p-3 text-left text-sm transition-all ${
                        isSelected
                          ? showIncorrect
                            ? "border-red-500 bg-red-50"
                            : "border-[#111827] bg-slate-50"
                          : showCorrect
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      } ${submitted ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={showIncorrect ? "text-red-700" : showCorrect ? "text-emerald-700" : "text-slate-900"}>
                          {option}
                        </span>
                        {showAnswer && (
                          <div>
                            {showCorrect && (
                              <CheckCircle2 size={18} className="text-emerald-600" />
                            )}
                            {showIncorrect && (
                              <XCircle size={18} className="text-red-600" />
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {!submitted && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < questions.length || submitting}
            className="mt-6 w-full rounded-lg bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1f2937] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Quiz"
            )}
          </button>
        )}

        {showResults && quizResult && (
          <div className={`mt-6 rounded-lg border-2 p-4 ${
            quizResult.passed 
              ? "border-emerald-200 bg-emerald-50" 
              : "border-slate-200 bg-slate-50"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={18} className={quizResult.passed ? "text-emerald-600" : "text-[#111827]"} />
              <p className="text-sm font-semibold text-slate-900">Quiz Results</p>
            </div>
            <p className="text-sm text-slate-700">
              You scored <span className="font-bold text-[#111827]">{quizResult.quizScore}%</span> ({score.correct} out of {score.total} questions correct).
            </p>
            <p className="mt-2 text-sm font-semibold text-emerald-700">
              🎉 You earned {quizResult.pointsAwarded} points!
            </p>
            <p className="mt-2 text-xs text-slate-600">
              {quizResult.passed
                ? "Congratulations! You passed the quiz! 🎉"
                : "You didn't pass this time. Review the content and try again."}
            </p>
          </div>
        )}

        {!submitted && Object.keys(answers).length < questions.length && (
          <p className="mt-4 text-xs text-slate-500 text-center">
            Please answer all questions before submitting.
          </p>
        )}
      </div>
    </div>
  );
};

