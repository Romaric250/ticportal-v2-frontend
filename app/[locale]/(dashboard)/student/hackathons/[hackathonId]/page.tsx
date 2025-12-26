"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  Users,
  UserPlus,
  Upload,
  Lock,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  FileText,
  Download,
  ExternalLink,
  Lightbulb,
  Code,
  Leaf,
  Mic,
  MapPin,
  DollarSign,
  Trophy,
  BookOpen,
  Folder,
  HelpCircle,
} from "lucide-react";

type HackathonDetailPageProps = {
  params: {
    hackathonId: string;
  };
};

export default function HackathonDetailPage({ params }: HackathonDetailPageProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const basePath = `/${locale}/student/hackathons`;

  // Mock data - replace with actual data fetching
  const hackathon = {
    id: params.hackathonId,
    name: "Riverdale High School: Innovation Challenge 2024",
    subtitle: "Develop a sustainable solution for your local community.",
    stage: "STAGE 1 SCHOOL QUALIFIERS",
    submissionDeadline: {
      days: 14,
      hours: 6,
      minutes: 30,
    },
    canSubmit: false,
    submissionOpens: "Nov 1st",
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "timeline", label: "Timeline" },
    { id: "rules", label: "Rules & Criteria" },
    { id: "prizes", label: "Prizes" },
  ];

  const judgingCriteria = [
    {
      title: "Innovation (30%)",
      icon: <Lightbulb size={24} className="text-purple-600" />,
      description: "Is the idea original? Does it approach the problem from a new angle?",
      percentage: 30,
    },
    {
      title: "Technical Execution (30%)",
      icon: <Code size={24} className="text-blue-600" />,
      description: "Does the prototype work? Is the code clean and the user interface intuitive?",
      percentage: 30,
    },
    {
      title: "Impact (20%)",
      icon: <Leaf size={24} className="text-green-600" />,
      description: "How significant is the potential positive effect on the environment?",
      percentage: 20,
    },
    {
      title: "Presentation (20%)",
      icon: <Mic size={24} className="text-red-600" />,
      description: "Clarity of the pitch deck and the team's ability to answer questions.",
      percentage: 20,
    },
  ];

  const keyDates = [
    {
      status: "completed",
      title: "Registration Opens",
      date: "Sep 15, 2024",
    },
    {
      status: "active",
      title: "Ideation Workshop",
      date: "Oct 12, 2024 - 3:00 PM",
      location: "Room 302 or Online",
    },
    {
      status: "upcoming",
      title: "Submission Deadline",
      date: "Nov 05, 2024 - 11:59 PM",
    },
    {
      status: "upcoming",
      title: "School Demo Day",
      date: "Nov 10, 2024",
    },
  ];

  const resources = [
    { name: "Rulebook PDF", icon: <FileText size={20} className="text-red-500" />, type: "download" },
    { name: "Design Assets", icon: <Folder size={20} className="text-blue-500" />, type: "download" },
    { name: "FAQ Page", icon: <HelpCircle size={20} className="text-slate-500" />, type: "link" },
  ];

  const mentors = [
    { name: "Ms. Sarah Jenkins", role: "Computer Science Dept.", avatar: "SJ" },
    { name: "Mr. David Chen", role: "Physics Dept.", avatar: "DC" },
    { name: "Emily Davis", role: "Alumni - Tech Lead", avatar: "ED" },
  ];

  return (
    <div className="space-y-6 text-slate-900">
      {/* Breadcrumbs */}
      <nav className="text-xs sm:text-sm text-slate-600">
        <Link href={`${basePath}`} className="hover:text-[#111827]">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href={`${basePath}`} className="hover:text-[#111827]">
          Hackathons
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900">School Qualifiers</span>
      </nav>

      {/* Header */}
      <div>
        <div className="mb-2 sm:mb-3 inline-block rounded-full bg-blue-100 px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold text-blue-700">
          • {hackathon.stage}
        </div>
        <h1 className="mb-2 text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">{hackathon.name}</h1>
        <p className="text-sm sm:text-base lg:text-lg text-slate-600">{hackathon.subtitle}</p>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_400px]">
        {/* Main Content */}
        <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
          {/* Action Cards */}
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
            {/* Form New Team */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
              <div className="mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-blue-100">
                <Users size={20} className="sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <h3 className="mb-2 text-sm sm:text-base font-bold text-slate-900">Form New Team</h3>
              <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-slate-600">Create a squad and invite your classmates.</p>
              <Link
                href={`/${locale}/student/team`}
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-blue-600 hover:underline"
              >
                Start <ArrowRight size={12} className="sm:w-3.5 sm:h-3.5" />
              </Link>
            </div>

            {/* Join Team */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
              <div className="mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-green-100">
                <UserPlus size={20} className="sm:w-6 sm:h-6 text-green-600" />
              </div>
              <h3 className="mb-2 text-sm sm:text-base font-bold text-slate-900">Join Team</h3>
              <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-slate-600">Browse teams looking for members.</p>
              <button className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-green-600 hover:underline">
                Browse <ArrowRight size={12} className="sm:w-3.5 sm:h-3.5" />
              </button>
            </div>

            {/* Submit Project */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
              <div className="mb-3 sm:mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-slate-100">
                  <Upload size={20} className="sm:w-6 sm:h-6 text-slate-600" />
                </div>
                <Lock size={14} className="sm:w-4 sm:h-4 text-slate-400" />
              </div>
              <h3 className="mb-2 text-sm sm:text-base font-bold text-slate-900">Submit Project</h3>
              <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-slate-600">Submissions open on {hackathon.submissionOpens}.</p>
              <button
                disabled
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-slate-400 cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 sm:gap-2 border-b border-slate-200 overflow-x-auto">
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

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="space-y-4 sm:space-y-6">
              {/* The Challenge */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 lg:p-6 shadow-sm">
                <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-slate-900">The Challenge</h2>
                <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm leading-relaxed text-slate-700">
                  <p>
                    Riverdale High School is proud to host the 2024 Innovation Challenge. This year,
                    we are focusing on <strong>Sustainability in our Community</strong>. Students are
                    tasked with identifying a local environmental issue—be it waste management,
                    energy consumption, or green spaces—and developing a tech-enabled solution to
                    address it.
                  </p>
                  <p>
                    Your solution can be a mobile app, a hardware prototype, or a web platform. The
                    goal is to create something feasible that could actually be implemented within
                    the school or town district.
                  </p>
                </div>
              </div>

              {/* Judging Criteria */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 lg:p-6 shadow-sm">
                <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-slate-900">Judging Criteria</h2>
                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                  {judgingCriteria.map((criterion, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4"
                    >
                      <div className="mb-2 sm:mb-3 flex items-center justify-between">
                        <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-white">
                          <div className="scale-75 sm:scale-100">{criterion.icon}</div>
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          {criterion.percentage}%
                        </span>
                      </div>
                      <h3 className="mb-1.5 sm:mb-2 text-sm sm:text-base font-bold text-slate-900">{criterion.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-600">{criterion.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 lg:p-6 shadow-sm">
              <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-slate-900">Timeline</h2>
              <div className="space-y-3 sm:space-y-4">
                {keyDates.map((date, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div
                      className={`mt-1 flex h-3 w-3 items-center justify-center rounded-full ${
                        date.status === "completed"
                          ? "bg-green-500"
                          : date.status === "active"
                          ? "bg-blue-500"
                          : "bg-slate-300"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-900">{date.title}</h3>
                        {date.status === "completed" && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                            COMPLETED
                          </span>
                        )}
                        {date.status === "active" && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{date.date}</p>
                      {date.location && <p className="mt-1 text-xs text-slate-500">{date.location}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "rules" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 lg:p-6 shadow-sm">
              <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-slate-900">Rules & Criteria</h2>
              <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-slate-700">
                <div>
                  <h3 className="mb-2 font-semibold text-slate-900">Team Requirements</h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li>Teams must consist of 3-5 members</li>
                    <li>All members must be enrolled students</li>
                    <li>One team member must be designated as team lead</li>
                  </ul>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-slate-900">Submission Guidelines</h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li>All submissions must be original work</li>
                    <li>Projects must include a working prototype or demo</li>
                    <li>Pitch deck must follow the provided template</li>
                    <li>Video presentation should not exceed 5 minutes</li>
                  </ul>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-slate-900">Code of Conduct</h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li>Respectful communication with judges and peers</li>
                    <li>No plagiarism or use of unauthorized resources</li>
                    <li>Fair play and sportsmanship throughout the competition</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === "prizes" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 lg:p-6 shadow-sm">
              <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-slate-900">Prizes & Awards</h2>
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 sm:p-5 text-center">
                  <Trophy size={24} className="sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3 text-amber-600" />
                  <h3 className="mb-1.5 sm:mb-2 text-sm sm:text-lg font-bold text-slate-900">1st Place</h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Scholarship + Laptop + Innovation Trophy
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 sm:p-5 text-center">
                  <Trophy size={24} className="sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3 text-slate-400" />
                  <h3 className="mb-1.5 sm:mb-2 text-sm sm:text-lg font-bold text-slate-900">2nd Place</h3>
                  <p className="text-xs sm:text-sm text-slate-600">Tablet + Gold Medal + Certificate</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 sm:p-5 text-center">
                  <Trophy size={24} className="sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3 text-slate-400" />
                  <h3 className="mb-1.5 sm:mb-2 text-sm sm:text-lg font-bold text-slate-900">3rd Place</h3>
                  <p className="text-xs sm:text-sm text-slate-600">Smartwatch + Medal + Certificate</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
          {/* Submission Deadline */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
            <h3 className="mb-3 sm:mb-4 text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500">
              SUBMISSION DEADLINE
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 sm:p-3 text-center">
                <p className="text-lg sm:text-xl font-bold text-[#111827]">{hackathon.submissionDeadline.days}</p>
                <p className="mt-1 text-[9px] sm:text-[10px] font-semibold text-slate-600">DAYS</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 sm:p-3 text-center">
                <p className="text-lg sm:text-xl font-bold text-[#111827]">{hackathon.submissionDeadline.hours}</p>
                <p className="mt-1 text-[9px] sm:text-[10px] font-semibold text-slate-600">HRS</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 sm:p-3 text-center">
                <p className="text-lg sm:text-xl font-bold text-[#111827]">{hackathon.submissionDeadline.minutes}</p>
                <p className="mt-1 text-[9px] sm:text-[10px] font-semibold text-slate-600">MIN</p>
              </div>
            </div>
          </div>

          {/* Key Dates */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
            <div className="mb-3 sm:mb-4 flex items-center gap-2">
              <Calendar size={16} className="sm:w-[18px] sm:h-[18px] text-[#111827]" />
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Key Dates</h3>
            </div>
            <div className="space-y-2.5 sm:space-y-3">
              {keyDates.map((date, index) => (
                <div key={index} className="flex items-start gap-2 sm:gap-3">
                  <div
                    className={`mt-1 flex h-2 w-2 flex-shrink-0 rounded-full ${
                      date.status === "completed"
                        ? "bg-green-500"
                        : date.status === "active"
                        ? "bg-blue-500"
                        : "bg-slate-300"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] sm:text-xs font-semibold text-slate-900">{date.title}</p>
                    <p className="text-[9px] sm:text-[10px] text-slate-500">{date.date}</p>
                    {date.location && (
                      <p className="mt-0.5 text-[9px] sm:text-[10px] text-slate-500">{date.location}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
            <h3 className="mb-3 sm:mb-4 text-xs sm:text-sm font-semibold text-slate-900">Resources</h3>
            <div className="space-y-2">
              {resources.map((resource, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-2.5 sm:p-3"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="flex-shrink-0">{resource.icon}</div>
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 truncate">{resource.name}</span>
                  </div>
                  {resource.type === "download" ? (
                    <button className="cursor-pointer text-slate-500 hover:text-[#111827] flex-shrink-0">
                      <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                  ) : (
                    <button className="cursor-pointer text-slate-500 hover:text-[#111827] flex-shrink-0">
                      <ExternalLink size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Local Mentors */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
            <div className="mb-3 sm:mb-4 flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Local Mentors</h3>
              <button className="text-[10px] sm:text-xs font-semibold text-[#111827] hover:underline">
                View All
              </button>
            </div>
            <div className="space-y-2.5 sm:space-y-3">
              {mentors.map((mentor, index) => (
                <div key={index} className="flex items-center gap-2 sm:gap-3">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-slate-200 text-[10px] sm:text-xs font-semibold text-slate-700 flex-shrink-0">
                    {mentor.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">{mentor.name}</p>
                    <p className="text-[10px] sm:text-xs text-slate-500 truncate">{mentor.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

