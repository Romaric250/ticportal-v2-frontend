"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Download, Eye, CheckCircle, XCircle, Clock, Plus, Upload, Users } from "lucide-react";
import { adminService, type TeamDeliverable, type DeliverableTemplate } from "../../../../../../src/lib/services/adminService";
import { toast } from "sonner";

export default function AdminTeamDeliverablesPage() {
  const [deliverables, setDeliverables] = useState<TeamDeliverable[]>([]);
  const [templates, setTemplates] = useState<DeliverableTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState<TeamDeliverable | null>(null);
  const [activeTab, setActiveTab] = useState<"templates" | "submissions">("templates");
  
  const [filters, setFilters] = useState({
    status: "All Statuses",
    hackathon: "All Hackathons",
    search: "",
  });

  const [templateForm, setTemplateForm] = useState({
    title: "",
    description: "",
    type: "PROPOSAL" as "PROPOSAL" | "PROTOTYPE" | "FINAL_SUBMISSION" | "DOCUMENTATION",
    hackathonId: "",
    dueDate: "",
    required: true,
  });

  const [uploadForm, setUploadForm] = useState({
    teamId: "",
    templateId: "",
    file: null as File | null,
    description: "",
  });

  useEffect(() => {
    loadData();
  }, [filters, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === "templates") {
        const data = await adminService.getDeliverableTemplates();
        setTemplates(data);
      } else {
        const data = await adminService.getTeamDeliverables(filters);
        setDeliverables(data);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      setLoading(true);
      await adminService.createDeliverableTemplate(templateForm);
      toast.success("Deliverable template created successfully");
      setShowCreateTemplateModal(false);
      setTemplateForm({
        title: "",
        description: "",
        type: "PROPOSAL",
        hackathonId: "",
        dueDate: "",
        required: true,
      });
      loadData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to create template");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadForTeam = async () => {
    if (!uploadForm.file || !uploadForm.teamId || !uploadForm.templateId) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      await adminService.uploadDeliverableForTeam(uploadForm.teamId, {
        templateId: uploadForm.templateId,
        file: uploadForm.file,
        description: uploadForm.description,
      });
      toast.success("Deliverable uploaded successfully");
      setShowUploadModal(false);
      setUploadForm({ teamId: "", templateId: "", file: null, description: "" });
      loadData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to upload deliverable");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await adminService.approveDeliverable(id);
      toast.success("Deliverable approved");
      loadData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to approve deliverable");
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      await adminService.rejectDeliverable(id, reason);
      toast.success("Deliverable rejected");
      loadData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to reject deliverable");
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this deliverable template?")) return;

    try {
      await adminService.deleteDeliverableTemplate(id);
      toast.success("Template deleted");
      loadData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete template");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle size={16} className="text-emerald-500" />;
      case "REJECTED":
        return <XCircle size={16} className="text-red-500" />;
      case "PENDING":
        return <Clock size={16} className="text-amber-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team Deliverables</h1>
          <p className="mt-1 text-sm text-slate-600">
            Create deliverable requirements and manage team submissions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === "templates" && (
            <button
              onClick={() => setShowCreateTemplateModal(true)}
              className="flex items-center gap-2 rounded-lg bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-[#1f2937]"
            >
              <Plus size={16} />
              Create Deliverable
            </button>
          )}
          {activeTab === "submissions" && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Upload size={16} />
              Upload for Team
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("templates")}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition ${
              activeTab === "templates"
                ? "border-[#111827] text-[#111827]"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Deliverable Templates
          </button>
          <button
            onClick={() => setActiveTab("submissions")}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition ${
              activeTab === "submissions"
                ? "border-[#111827] text-[#111827]"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Team Submissions
          </button>
        </div>
      </div>

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-slate-500">Loading...</div>
          ) : templates.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
              <p className="text-slate-500">No deliverable templates yet. Create one to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{template.title}</h3>
                        {template.required && (
                          <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{template.description}</p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                        <span>{template.type}</span>
                        {template.dueDate && (
                          <span>Due: {new Date(template.dueDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="rounded p-1 text-red-500 hover:bg-red-50"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Submissions Tab */}
      {activeTab === "submissions" && (
        <>
          {/* Filters */}
          <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by team name, project title..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-[#111827] focus:outline-none"
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#111827] focus:outline-none"
            >
              <option>All Statuses</option>
              <option>PENDING</option>
              <option>APPROVED</option>
              <option>REJECTED</option>
            </select>
            <select
              value={filters.hackathon}
              onChange={(e) => setFilters({ ...filters, hackathon: e.target.value })}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#111827] focus:outline-none"
            >
              <option>All Hackathons</option>
            </select>
          </div>

          {/* Deliverables Table */}
          <div className="rounded-lg border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Team
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Deliverable
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <p className="text-slate-400">Loading...</p>
                      </td>
                    </tr>
                  ) : deliverables.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                        No submissions found
                      </td>
                    </tr>
                  ) : (
                    deliverables.map((deliverable) => (
                      <tr key={deliverable.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{deliverable.teamName}</div>
                          <div className="text-xs text-slate-500">{deliverable.projectTitle}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {deliverable.type}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(deliverable.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(deliverable.status)}
                            <span className="text-sm text-slate-700">{deliverable.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => window.open(deliverable.fileUrl, "_blank")}
                              className="rounded p-1 text-slate-600 hover:bg-slate-100"
                              title="View"
                            >
                              <Eye size={16} />
                            </button>
                            {deliverable.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() => handleApprove(deliverable.id)}
                                  className="rounded bg-emerald-500 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-600"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = prompt("Rejection reason:");
                                    if (reason) handleReject(deliverable.id, reason);
                                  }}
                                  className="rounded bg-red-500 px-2 py-1 text-xs font-medium text-white hover:bg-red-600"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Create Template Modal */}
      {showCreateTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Create Deliverable Template</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Title</label>
                <input
                  type="text"
                  value={templateForm.title}
                  onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#111827] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#111827] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Type</label>
                <select
                  value={templateForm.type}
                  onChange={(e) => setTemplateForm({ ...templateForm, type: e.target.value as any })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#111827] focus:outline-none"
                >
                  <option value="PROPOSAL">Proposal</option>
                  <option value="PROTOTYPE">Prototype</option>
                  <option value="FINAL_SUBMISSION">Final Submission</option>
                  <option value="DOCUMENTATION">Documentation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Due Date (Optional)</label>
                <input
                  type="date"
                  value={templateForm.dueDate}
                  onChange={(e) => setTemplateForm({ ...templateForm, dueDate: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#111827] focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={templateForm.required}
                  onChange={(e) => setTemplateForm({ ...templateForm, required: e.target.checked })}
                  className="rounded border-slate-300"
                />
                <label htmlFor="required" className="text-sm font-medium text-slate-700">
                  Required for all teams
                </label>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateTemplateModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTemplate}
                  disabled={loading || !templateForm.title}
                  className="rounded-lg bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-[#1f2937] disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload for Team Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Upload Deliverable for Team</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Team ID</label>
                <input
                  type="text"
                  value={uploadForm.teamId}
                  onChange={(e) => setUploadForm({ ...uploadForm, teamId: e.target.value })}
                  placeholder="Enter team ID"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#111827] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Deliverable Template</label>
                <select
                  value={uploadForm.templateId}
                  onChange={(e) => setUploadForm({ ...uploadForm, templateId: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#111827] focus:outline-none"
                >
                  <option value="">Select template...</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">File</label>
                <input
                  type="file"
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#111827] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Description (Optional)</label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#111827] focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadForTeam}
                  disabled={loading || !uploadForm.file || !uploadForm.teamId || !uploadForm.templateId}
                  className="rounded-lg bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-[#1f2937] disabled:opacity-50"
                >
                  {loading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
