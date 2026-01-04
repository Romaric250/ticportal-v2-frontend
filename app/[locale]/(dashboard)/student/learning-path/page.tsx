"use client";

import { LocalizedLink } from "@/components/ui/LocalizedLink";
import { Check, Play, Lock, BookOpen, Lightbulb, Users, Trophy, ArrowRight, Bookmark } from "lucide-react";

export default function LearningPathPage() {
  return (
    <div className="space-y-8 text-slate-900">
      {/* Header Section */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            CURRICULUM 2024
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Your Learning Journey
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Keep going! You&apos;re <span className="font-semibold text-[#111827]">40%</span> of the way to the finals.
          </p>
        </div>

        {/* Overall Progress Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:w-64">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
            Overall Progress
          </h2>
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-900">40%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-2/5 rounded-full bg-[#111827]" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main Content - Path to Finals */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">Path to Finals</h2>

          {/* Stage 1: Purpose - Completed */}
          <StageCard
            stageNumber={1}
            title="Stage 1: Purpose"
            description="Define your 'why' and understand the problem statement."
            status="completed"
            lessons={5}
            duration="2h 15m"
          />

          {/* Stage 2: Ideation - Completed */}
          <StageCard
            stageNumber={2}
            title="Stage 2: Ideation"
            description="Brainstorm solutions and select the best concept."
            status="completed"
            lessons={5}
            duration="4h 30m"
          />

          {/* Stage 3: Business Model Canvas - In Progress */}
          <StageCard
            stageNumber={3}
            title="Stage 3: Business Model Canvas"
            description="Structure your idea into a viable business model. Learn about value propositions, customer segments, and revenue streams."
            status="in-progress"
            lessons={6}
            currentLesson={2}
            progress={32}
            hasContinueButton
          />

          {/* Stage 4: Prototyping - Locked */}
          <StageCard
            stageNumber={4}
            title="Stage 4: Prototyping"
            description="Bring your idea to life with low-fidelity and high-fidelity mockups."
            status="locked"
          />

          {/* Stage 5: Pitching - Locked */}
          <StageCard
            stageNumber={5}
            title="Stage 5: Pitching"
            description="Learn how to present your solution convincingly to judges."
            status="locked"
          />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* UP NEXT Card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Play size={14} className="text-[#111827]" />
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                UP NEXT
              </h2>
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              Value Propositions 101
            </h3>
            <p className="mt-2 text-xs text-slate-600">
              Learn how to articulate why a customer would choose your product over a competitor.
            </p>
            <LocalizedLink
              href="/student/course/value-propositions-101"
              className="cursor-pointer mt-4 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-center text-xs font-semibold text-[#111827] hover:border-[#111827]"
            >
              Start Lesson
            </Link>
          </div>

          {/* Recent Badges */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
              Recent Badges
            </h2>
            <div className="mt-4 flex gap-3">
              <BadgeIcon icon={<Lightbulb size={20} />} label="Problem Solver" color="yellow" />
              <BadgeIcon icon={<Users size={20} />} label="Team Player" color="blue" />
              <BadgeIcon icon={<Lock size={20} />} label="Locked" color="gray" locked />
            </div>
          </div>

          {/* Need Help? Card */}
          <div className="rounded-2xl border border-slate-200 bg-[#111827] p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-white">Need Help?</h2>
            <p className="mt-2 text-xs text-slate-300">
              Connect with a mentor to get feedback on your BMC.
            </p>
            <button className="cursor-pointer mt-4 inline-flex items-center gap-1 text-xs font-semibold text-white hover:underline">
              Find a Mentor <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Expand Your Knowledge Section */}
      <div className="mt-12 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Expand Your Knowledge
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Supplementary materials to help you ace the hackathon
            </p>
          </div>
          <button className="cursor-pointer inline-flex items-center gap-1 text-xs font-semibold text-[#111827] hover:underline">
            View All Resources <ArrowRight size={12} />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CourseCard
            image="/api/placeholder/300/200"
            duration="15 min"
            category="TECH SKILLS"
            title="Coding Basics for Non-Coders"
            description="Get started with programming fundamentals without any prior experience."
            instructor="Sarah L."
          />
          <CourseCard
            image="/api/placeholder/300/200"
            duration="45 min"
            category="DESIGN THINKING"
            title="Empathy Mapping Workshop"
            description="Learn how to understand your users' needs and pain points through empathy mapping."
            instructor="David K."
          />
          <CourseCard
            image="/api/placeholder/300/200"
            duration="20 min"
            category="SOFT SKILLS"
            title="Public Speaking Tips"
            description="Master the art of presenting your ideas confidently and persuasively."
            instructor="Elleno R."
          />
        </div>
      </div>
    </div>
  );
}

type StageCardProps = {
  stageNumber: number;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "locked";
  lessons?: number;
  duration?: string;
  currentLesson?: number;
  progress?: number;
  hasContinueButton?: boolean;
};

function StageCard({
  stageNumber,
  title,
  description,
  status,
  lessons,
  duration,
  currentLesson,
  progress,
  hasContinueButton,
}: StageCardProps) {
  const isCompleted = status === "completed";
  const isInProgress = status === "in-progress";
  const isLocked = status === "locked";

  return (
    <div
      className={`relative rounded-2xl border border-slate-200 p-5 shadow-sm ${
        isInProgress ? "bg-slate-50" : "bg-white"
      }`}
    >
      {/* Background icon for in-progress stage */}
      {isInProgress && (
        <div className="absolute right-4 top-4 opacity-5 text-[#111827]">
          <Trophy size={80} />
        </div>
      )}

      <div className="relative flex items-start gap-4">
        {/* Timeline indicator */}
        <div className="flex flex-col items-center">
          {isCompleted ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111827] text-white">
              <Check size={16} />
            </div>
          ) : isInProgress ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#111827] bg-white">
              <Play size={14} className="text-[#111827]" fill="#111827" />
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-300 bg-white">
              <Lock size={16} className="text-slate-400" />
            </div>
          )}
          {stageNumber < 5 && (
            <div className="mt-2 h-16 w-px bg-slate-200" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {isCompleted && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-[#111827]">
                  COMPLETED
                </span>
              )}
              {isInProgress && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-[#111827]">
                  IN PROGRESS
                </span>
              )}
              {isLocked && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
                  LOCKED
                </span>
              )}
            </div>
            {duration && (
              <span className="text-xs text-slate-500">{duration}</span>
            )}
          </div>

          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-600">{description}</p>

          {lessons && (
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <BookOpen size={14} />
              <span>{lessons} Lessons</span>
            </div>
          )}

          {/* Progress bar for in-progress stage */}
          {isInProgress && currentLesson && progress !== undefined && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  Progress: Lesson {currentLesson} of {lessons}
                </span>
                <span className="font-semibold text-[#111827]">{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-[#111827]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Continue Learning Button */}
          {hasContinueButton && (
            <LocalizedLink
              href="/student/course/stage-3"
              className="cursor-pointer mt-4 inline-flex items-center gap-1 rounded-lg bg-[#111827] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#1f2937]"
            >
              Continue Learning <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

type BadgeIconProps = {
  icon: React.ReactNode;
  label: string;
  color: "yellow" | "blue" | "gray";
  locked?: boolean;
};

function BadgeIcon({ icon, label, color, locked }: BadgeIconProps) {
  const bgColors = {
    yellow: "bg-yellow-50",
    blue: "bg-blue-50",
    gray: "bg-slate-50",
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full ${bgColors[color]}`}
      >
        <div className={locked ? "text-slate-400" : "text-slate-700"}>
          {icon}
        </div>
      </div>
      <span className={`text-[10px] ${locked ? "text-slate-400" : "text-slate-700"}`}>
        {label}
      </span>
    </div>
  );
}

type CourseCardProps = {
  image: string;
  duration: string;
  category: string;
  title: string;
  description: string;
  instructor: string;
};

function CourseCard({
  image,
  duration,
  category,
  title,
  description,
  instructor,
}: CourseCardProps) {
  return (
    <LocalizedLink
      href="/student/course/coding-basics"
      className="group relative block rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative h-40 overflow-hidden rounded-t-2xl bg-slate-100">
        <div className="absolute right-3 top-3 rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-slate-700 shadow-sm">
          {duration}
        </div>
      </div>
      <div className="p-4">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          {category}
        </span>
        <h3 className="mt-2 text-sm font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-xs text-slate-600 line-clamp-2">{description}</p>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-slate-200" />
          <span className="text-xs text-slate-600">{instructor}</span>
        </div>
      </div>
      <button className="cursor-pointer absolute bottom-4 right-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
        <Bookmark size={16} />
      </button>
    </Link>
  );
}

