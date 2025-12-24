"use client";

import { useState } from "react";
import { TeamHeader } from "../../../../../components/dashboard/team/TeamHeader";
import { TeamMetrics } from "../../../../../components/dashboard/team/TeamMetrics";
import { TeamDeliverables } from "../../../../../components/dashboard/team/TeamDeliverables";
import { TeamMembers } from "../../../../../components/dashboard/team/TeamMembers";
import { PendingRequests } from "../../../../../components/dashboard/team/PendingRequests";
import { AssignedMentor } from "../../../../../components/dashboard/team/AssignedMentor";
import { TeamChatModal } from "../../../../../components/dashboard/team/TeamChatModal";
import { RequestMentorshipModal } from "../../../../../components/dashboard/team/RequestMentorshipModal";
import { AddMemberModal } from "../../../../../components/dashboard/team/AddMemberModal";

export default function TeamPage() {
  const [showMentorshipModal, setShowMentorshipModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  return (
    <div className="space-y-6 text-slate-900">
      <TeamHeader 
        onRequestMentorship={() => setShowMentorshipModal(true)}
        onOpenChat={() => setShowChatModal(true)}
      />
      <TeamMetrics />
      
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* Left Column */}
        <div className="space-y-6">
          <TeamDeliverables />
          <TeamMembers onAddMember={() => setShowAddMemberModal(true)} />
          <PendingRequests />
        </div>

        {/* Right Column */}
        <div>
          <AssignedMentor />
        </div>
      </div>

      {/* Modals */}
      {showMentorshipModal && (
        <RequestMentorshipModal onClose={() => setShowMentorshipModal(false)} />
      )}
      {showAddMemberModal && (
        <AddMemberModal onClose={() => setShowAddMemberModal(false)} />
      )}
      {showChatModal && (
        <TeamChatModal onClose={() => setShowChatModal(false)} />
      )}
    </div>
  );
}

