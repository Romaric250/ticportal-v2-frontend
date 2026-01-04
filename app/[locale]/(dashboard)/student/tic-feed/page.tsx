"use client";

import { useState } from "react";
import { LocalizedLink } from "@/components/ui/LocalizedLink";
import {
  Image,
  Link2,
  Hash,
  Rocket,
  ThumbsUp,
  MessageCircle,
  Share2,
  FileText,
  Loader2,
  Send,
  Smile,
  Pin,
  Calendar,
  ArrowRight,
  Eye,
} from "lucide-react";

export default function TICFeedPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [postContent, setPostContent] = useState("");

  const tabs = [
    { id: "all", label: "All Posts" },
    { id: "announcements", label: "Official Announcements" },
    { id: "mentorship", label: "Mentorship" },
    { id: "updates", label: "Team Updates" },
  ];

  return (
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      {/* Main Content */}
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">TIC Feed</h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Stay updated with summit news, official posts, and mentorship announcements.
          </p>
        </div>

      {/* Post Creation */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
        <textarea
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          placeholder="Share an update, ask a question..."
          rows={3}
          className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#111827] focus:ring-1 focus:ring-[#111827]"
        />
        <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="cursor-pointer rounded-lg p-1.5 sm:p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
              <Image size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
            <button className="cursor-pointer rounded-lg p-1.5 sm:p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
              <Link2 size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
            <button className="cursor-pointer rounded-lg p-1.5 sm:p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
              <Hash size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>
          <button
            disabled={!postContent.trim()}
            className="cursor-pointer rounded-lg bg-[#111827] px-4 sm:px-6 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Post
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 sm:gap-2 border-b border-slate-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`cursor-pointer whitespace-nowrap px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition ${
              activeTab === tab.id
                ? "border-b-2 border-[#111827] text-[#111827]"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-6">
        <PostCard
          author="Sarah Connor"
          role="ADMIN"
          time="2 hours ago"
          category="Official"
          title="Welcome to TIC Summit V2!"
          titleIcon={<Rocket size={18} />}
          content="We are thrilled to launch the new portal for this year's summit. This platform will be your central hub for managing your teams, submitting deliverables, and connecting with mentors. Please check the 'Learning' tab for the updated curriculum."
          hasImage
          likes={42}
          comments={12}
          views={128}
        />

        <PostCard
          author="Dr. Emily Chen"
          role="MENTOR"
          time="5 hours ago"
          category="Mentorship"
          content="Heads up Team Alpha and Beta! I've uploaded the feedback for your initial prototypes. Overall great work on the user flow, but please revisit the accessibility guidelines we discussed last week. Let's sync up tomorrow at 10 AM EST."
          attachment={{
            name: "Prototype_Feedback_v1.pdf",
            size: "2.4 MB",
            type: "PDF Document",
          }}
          likes={8}
          comments={2}
          views={45}
          hasComments
        />
      </div>

        {/* Loading Indicator */}
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-slate-400" />
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="sticky top-4 sm:top-6 h-fit space-y-4 sm:space-y-6 order-first lg:order-last">
        {/* Pinned Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Pin size={18} className="text-[#111827]" />
            <h3 className="text-sm font-semibold text-slate-900">Pinned</h3>
          </div>
          <div className="space-y-3">
            <PinnedItem
              label="Rule Book"
              labelColor="text-[#111827]"
              title="Competition Guidelines V2.1"
              status="Updated yesterday"
            />
            <PinnedItem
              label="Event"
              labelColor="text-amber-600"
              title="Opening Ceremony Live Stream"
              status="Starts in 3 days"
            />
          </div>
        </div>

        {/* Upcoming Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-[#111827]" />
            <h3 className="text-sm font-semibold text-slate-900">Upcoming</h3>
          </div>
          <div className="space-y-3">
            <UpcomingItem
              date="OCT 24"
              event="Team Formation Close"
              detail="11:59 PM EST"
            />
            <UpcomingItem
              date="OCT 28"
              event="Idea Submission"
              detail="Required for Phase 1"
            />
          </div>
          <LocalizedLink
            href="#"
            className="cursor-pointer mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#111827] hover:underline"
          >
            View Full Calendar <ArrowRight size={14} />
          </LocalizedLink>
        </div>
      </div>
    </div>
  );
}

type PostCardProps = {
  author: string;
  role: "ADMIN" | "MENTOR" | "STUDENT";
  time: string;
  category: string;
  title?: string;
  titleIcon?: React.ReactNode;
  content: string;
  hasImage?: boolean;
  attachment?: {
    name: string;
    size: string;
    type: string;
  };
  likes: number;
  comments: number;
  views: number;
  hasComments?: boolean;
};

function PostCard({
  author,
  role,
  time,
  category,
  title,
  titleIcon,
  content,
  hasImage,
  attachment,
  likes,
  comments,
  views,
  hasComments,
}: PostCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
      {/* Author Header */}
      <div className="mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-slate-200 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">{author}</p>
            <span className="rounded-full bg-[#111827] px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold text-white flex-shrink-0">
              {role}
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-500 truncate">
            {time} • {category}
          </p>
        </div>
      </div>

      {/* Title */}
      {title && (
        <div className="mb-2 sm:mb-3 flex items-center gap-2">
          {titleIcon && <div className="text-[#111827] flex-shrink-0">{titleIcon}</div>}
          <h3 className="text-base sm:text-lg font-bold text-slate-900">{title}</h3>
        </div>
      )}

      {/* Content */}
      <p className="mb-3 sm:mb-4 text-xs sm:text-sm leading-relaxed text-slate-700">{content}</p>

      {/* Image */}
      {hasImage && (
        <div className="mb-3 sm:mb-4 h-48 sm:h-64 rounded-xl bg-gradient-to-br from-[#111827] to-slate-600" />
      )}

      {/* Attachment */}
      {attachment && (
        <div className="mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2 sm:p-3">
          <FileText size={18} className="sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">{attachment.name}</p>
            <p className="text-[10px] sm:text-xs text-slate-500">
              {attachment.size} • {attachment.type}
            </p>
          </div>
        </div>
      )}

      {/* Engagement */}
      <div className="mb-3 sm:mb-4 flex flex-wrap items-center gap-2 sm:gap-4 border-t border-slate-100 pt-3 sm:pt-4">
        <button className="cursor-pointer inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600 hover:text-[#111827]">
          <ThumbsUp size={14} className="sm:w-4 sm:h-4" />
          <span>{likes}</span>
        </button>
        <button className="cursor-pointer inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600 hover:text-[#111827]">
          <MessageCircle size={14} className="sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">{comments} Comments</span>
          <span className="sm:hidden">{comments}</span>
        </button>
        <div className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600">
          <Eye size={14} className="sm:w-4 sm:h-4" />
          <span>{views}</span>
        </div>
        <button className="cursor-pointer inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600 hover:text-[#111827]">
          <Share2 size={14} className="sm:w-4 sm:h-4" />
          <span>Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {hasComments && (
        <div className="space-y-3 border-t border-slate-100 pt-3 sm:pt-4">
          <Comment
            author="Michael Scott"
            content="Thanks Dr. Chen! We will review the accessibility section tonight."
            time="30m ago"
          />
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-slate-200 flex-shrink-0" />
            <input
              type="text"
              placeholder="Write a reply..."
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#111827] focus:ring-1 focus:ring-[#111827] min-w-0"
            />
            <button className="cursor-pointer rounded-lg bg-[#111827] p-1.5 sm:p-2 text-white hover:bg-[#1f2937] flex-shrink-0">
              <Send size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type CommentProps = {
  author: string;
  content: string;
  time: string;
};

function Comment({ author, content, time }: CommentProps) {
  return (
    <div className="flex gap-2 sm:gap-3">
      <div className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 rounded-full bg-slate-200" />
      <div className="flex-1 min-w-0">
        <div className="mb-1 flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <p className="text-xs sm:text-sm font-semibold text-slate-900">{author}</p>
          <p className="text-[10px] sm:text-xs text-slate-500">{time}</p>
        </div>
        <p className="text-xs sm:text-sm text-slate-700">{content}</p>
        <div className="mt-1.5 sm:mt-2 flex items-center gap-2 sm:gap-3">
          <button className="cursor-pointer text-[10px] sm:text-xs text-slate-500 hover:text-[#111827]">
            Like
          </button>
          <button className="cursor-pointer text-[10px] sm:text-xs text-slate-500 hover:text-[#111827]">
            Reply
          </button>
        </div>
      </div>
    </div>
  );
}

type PinnedItemProps = {
  label: string;
  labelColor: string;
  title: string;
  status: string;
};

function PinnedItem({ label, labelColor, title, status }: PinnedItemProps) {
  return (
    <div className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50 p-2.5 sm:p-3 transition hover:bg-slate-100">
      <p className={`mb-1 text-[10px] sm:text-xs font-semibold ${labelColor}`}>{label}</p>
      <p className="text-xs sm:text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-[10px] sm:text-xs text-slate-500">{status}</p>
    </div>
  );
}

type UpcomingItemProps = {
  date: string;
  event: string;
  detail: string;
};

function UpcomingItem({ date, event, detail }: UpcomingItemProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 sm:p-3">
      <p className="text-[10px] sm:text-xs font-bold text-[#111827]">{date}</p>
      <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-900">{event}</p>
      <p className="mt-0.5 text-[10px] sm:text-xs text-slate-500">{detail}</p>
    </div>
  );
}

