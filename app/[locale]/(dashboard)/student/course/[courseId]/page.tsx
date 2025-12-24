"use client";

import { useState, use } from "react";
import Link from "next/link";
import {
  Play,
  Check,
  FileText,
  Video,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
} from "lucide-react";

export default function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const [currentSection, setCurrentSection] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Mock course data - replace with API call
  const course = {
    id: courseId,
    title: "Stage 3: Business Model Canvas",
    description: "Structure your idea into a viable business model. Learn about value propositions, customer segments, and revenue streams.",
    instructor: "Dr. Sarah Chen",
    duration: "4h 30m",
    progress: 60,
    sections: [
      {
        id: 1,
        title: "Introduction to Business Model Canvas",
        type: "video",
        duration: "15 min",
        completed: true,
        content: {
          videoUrl: "#",
          description: "Learn the fundamentals of the Business Model Canvas framework and why it's essential for startups.",
        },
      },
      {
        id: 2,
        title: "Value Propositions",
        type: "video",
        duration: "20 min",
        completed: true,
        content: {
          videoUrl: "#",
          description: "Understand how to identify and articulate your unique value proposition to customers.",
        },
      },
      {
        id: 3,
        title: "Customer Segments",
        type: "document",
        duration: "25 min",
        completed: false,
        content: {
          documentUrl: "#",
          description: "Deep dive into identifying and understanding your target customer segments.",
        },
      },
      {
        id: 4,
        title: "Revenue Streams",
        type: "video",
        duration: "18 min",
        completed: false,
        content: {
          videoUrl: "#",
          description: "Explore different revenue models and how to choose the right one for your business.",
        },
      },
      {
        id: 5,
        title: "Key Resources & Activities",
        type: "document",
        duration: "30 min",
        completed: false,
        content: {
          documentUrl: "#",
          description: "Learn about the key resources and activities needed to deliver your value proposition.",
        },
      },
    ],
    quiz: {
      id: "quiz-1",
      title: "Business Model Canvas Quiz",
      passingScore: 70,
      questions: [
        {
          id: 1,
          question: "What is the primary purpose of the Business Model Canvas?",
          options: [
            "To create a detailed financial forecast",
            "To visualize and describe a business model on a single page",
            "To write a business plan",
            "To design a marketing strategy",
          ],
          correctAnswer: 1,
        },
        {
          id: 2,
          question: "Which of the following is NOT one of the nine building blocks of the BMC?",
          options: [
            "Value Propositions",
            "Customer Segments",
            "Pricing Strategy",
            "Key Resources",
          ],
          correctAnswer: 2,
        },
        {
          id: 3,
          question: "What does a Value Proposition describe?",
          options: [
            "The price of your product",
            "The bundle of products and services that create value for a specific Customer Segment",
            "Your company's mission statement",
            "Your target market size",
          ],
          correctAnswer: 1,
        },
        {
          id: 4,
          question: "Customer Segments represent:",
          options: [
            "All potential customers",
            "The groups of people or organizations you aim to reach and serve",
            "Your competitors' customers",
            "Your marketing channels",
          ],
          correctAnswer: 1,
        },
        {
          id: 5,
          question: "Revenue Streams represent:",
          options: [
            "The cash a company generates from each Customer Segment",
            "The costs of running the business",
            "The marketing budget",
            "The number of customers",
          ],
          correctAnswer: 0,
        },
      ],
    },
  };

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex.toString(),
    }));
  };

  const handleSubmitQuiz = () => {
    let correct = 0;
    course.quiz.questions.forEach((q) => {
      if (quizAnswers[q.id] === q.correctAnswer.toString()) {
        correct++;
      }
    });
    const score = Math.round((correct / course.quiz.questions.length) * 100);
    setQuizScore(score);
    setShowQuizResults(true);
  };

  const isQuizComplete = course.quiz.questions.every((q) => quizAnswers[q.id] !== undefined);
  const isPassing = quizScore !== null && quizScore >= course.quiz.passingScore;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/student/learning-path"
          className="cursor-pointer rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{course.title}</h1>
          <p className="mt-1 text-sm text-slate-600">{course.description}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-900">Course Progress</span>
          <span className="font-semibold text-[#111827]">{course.progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-[#111827]"
            style={{ width: `${course.progress}%` }}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Course Sections */}
          {!showQuizResults && (
            <>
              {/* Current Section Content */}
              {course.sections[currentSection] && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {course.sections[currentSection].title}
                      </h3>
                      <div className="mt-2 flex items-center gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {course.sections[currentSection].duration}
                        </span>
                        {course.sections[currentSection].type === "video" && (
                          <span className="flex items-center gap-1">
                            <Video size={14} />
                            Video
                          </span>
                        )}
                        {course.sections[currentSection].type === "document" && (
                          <span className="flex items-center gap-1">
                            <FileText size={14} />
                            Document
                          </span>
                        )}
                      </div>
                    </div>
                    {course.sections[currentSection].completed && (
                      <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-700">Completed</span>
                      </div>
                    )}
                  </div>

                  <p className="mb-6 text-sm text-slate-700">
                    {course.sections[currentSection].content.description}
                  </p>

                  {course.sections[currentSection].type === "video" && (
                    <div className="mb-6 aspect-video rounded-xl bg-gradient-to-br from-[#111827] to-slate-600 flex items-center justify-center">
                      <Play size={48} className="text-white" />
                    </div>
                  )}

                  {course.sections[currentSection].type === "document" && (
                    <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
                      <FileText size={48} className="mx-auto text-slate-400" />
                      <p className="mt-4 text-sm text-slate-600">Document content will be displayed here</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                    <button
                      onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                      disabled={currentSection === 0}
                      className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ArrowLeft size={16} />
                      Previous
                    </button>
                    <button
                      onClick={() => {
                        if (currentSection < course.sections.length - 1) {
                          setCurrentSection(currentSection + 1);
                        }
                      }}
                      className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#111827] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1f2937]"
                    >
                      {currentSection < course.sections.length - 1 ? (
                        <>
                          Next <ArrowRight size={16} />
                        </>
                      ) : (
                        <>
                          Mark Complete <CheckCircle2 size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Quiz Section */}
          {!showQuizResults && course.sections.every((s) => s.completed) && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <div className="mb-2 flex items-center gap-2">
                  <BookOpen size={20} className="text-[#111827]" />
                  <h2 className="text-lg font-semibold text-slate-900">{course.quiz.title}</h2>
                </div>
                <p className="text-sm text-slate-600">
                  Answer all questions to complete the course. Passing score: {course.quiz.passingScore}%
                </p>
              </div>

              <div className="space-y-6">
                {course.quiz.questions.map((question, index) => (
                  <div key={question.id} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#111827] text-xs font-semibold text-white">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">{question.question}</p>
                        <div className="mt-3 space-y-2">
                          {question.options.map((option, optIndex) => (
                            <label
                              key={optIndex}
                              className={`cursor-pointer flex items-center gap-3 rounded-lg border p-3 transition ${
                                quizAnswers[question.id] === optIndex.toString()
                                  ? "border-[#111827] bg-slate-50"
                                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={optIndex}
                                checked={quizAnswers[question.id] === optIndex.toString()}
                                onChange={() => handleAnswerSelect(question.id, optIndex)}
                                className="h-4 w-4 border-slate-300 text-[#111827] focus:ring-[#111827]"
                              />
                              <span className="text-sm text-slate-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSubmitQuiz}
                  disabled={!isQuizComplete}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#111827] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Submit Quiz <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Quiz Results */}
          {showQuizResults && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-center">
                {isPassing ? (
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                      <CheckCircle2 size={32} className="text-emerald-600" />
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                      <XCircle size={32} className="text-red-600" />
                    </div>
                  </div>
                )}

                <h2 className="text-xl font-bold text-slate-900">
                  {isPassing ? "Congratulations!" : "Keep Learning"}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  You scored <span className="font-semibold text-[#111827]">{quizScore}%</span>
                </p>

                {isPassing ? (
                  <div className="mt-6 rounded-lg bg-emerald-50 p-4">
                    <p className="text-sm text-emerald-800">
                      You&apos;ve successfully completed this course! You can now proceed to the next stage.
                    </p>
                  </div>
                ) : (
                  <div className="mt-6 rounded-lg bg-red-50 p-4">
                    <p className="text-sm text-red-800">
                      You need to score at least {course.quiz.passingScore}% to pass. Review the course content and try again.
                    </p>
                  </div>
                )}

                <div className="mt-6 flex items-center justify-center gap-4">
                  {!isPassing && (
                    <button
                      onClick={() => {
                        setShowQuizResults(false);
                        setQuizAnswers({});
                        setQuizScore(null);
                      }}
                      className="cursor-pointer rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Retake Quiz
                    </button>
                  )}
                  <Link
                    href="/student/learning-path"
                    className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#111827] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1f2937]"
                  >
                    {isPassing ? (
                      <>
                        <Award size={16} />
                        Continue Learning
                      </>
                    ) : (
                      "Back to Learning Path"
                    )}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="sticky top-6 h-fit space-y-6">
          {/* Course Info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Course Information</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Clock size={16} />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <BookOpen size={16} />
                <span>{course.sections.length} Lessons</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Award size={16} />
                <span>Certificate Available</span>
              </div>
            </div>
          </div>

          {/* Course Outline */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Course Outline</h3>
            <div className="mt-4 space-y-2">
              {course.sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(index)}
                  className={`cursor-pointer w-full text-left rounded-lg p-2.5 text-xs transition ${
                    currentSection === index
                      ? "bg-[#111827] text-white"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{section.title}</span>
                    {section.completed && (
                      <CheckCircle2 size={14} className={currentSection === index ? "text-white" : "text-emerald-600"} />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


