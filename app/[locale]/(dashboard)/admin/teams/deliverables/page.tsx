"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Download, Eye, CheckCircle, XCircle, Clock, Plus, Upload, Users, Edit2, Trash2, X } from "lucide-react";
import { adminService, type TeamDeliverable, type DeliverableTemplate } from "../../../../../../src/lib/services/adminService";
import { toast } from "sonner";

export default function AdminTeamDeliverablesPage() {
  const [deliverables, setDeliverables] = useState<TeamDeliverable[]>([]);
  const [templates, setTemplates] = useState<DeliverableTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [showEditTemplateModal, setShowEditTemplateModal] = useState(false);
  const [showDeleteTemplateModal, setShowDeleteTemplateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState<TeamDeliverable | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<DeliverableTemplate | null>(null);
  const [activeTab, setActiveTab] = useState<"templates" | "submissions">("templates");
  
  const [filters, setFilters] = useState({
    status: "All Statuses",
    hackathon: "All Hackathons",
    search: "",
  });

  const [templateForm, setTemplateForm] = useState({
    title: "",
    description: "",
    type: "PROPOSAL" as "PROPOSAL" | "PROTOTYPE" | "FINAL_SUBMISSION" | "DOCUMENTATION" | "CUSTOM",
    customType: "",
    contentType: "FILE" as "TEXT" | "FILE" | "URL",
    hackathonId: "",
    dueDate: "",
    required: true,
  });

  const [uploadForm, setUploadForm] = useState({
    teamId: "",
    templateId: "",
    file: null as File | null,
    content: "",
    contentType: "FILE" as "TEXT" | "FILE" | "URL",
    description: "",
  });
  const [teamSearch, setTeamSearch] = useState("");
  const [teamSearchResults, setTeamSearchResults] = useState<any[]>([]);
  const [searchingTeams, setSearchingTeams] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);

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
        customType: "",
        contentType: "FILE",
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
    if (!uploadForm.teamId || !uploadForm.templateId) {
      toast.error("Please select a team and template");
      return;
    }

    // Validate based on contentType
    if (uploadForm.contentType === "FILE" && !uploadForm.file) {
      toast.error("Please select a file");
      return;
    }
    if ((uploadForm.contentType === "TEXT" || uploadForm.contentType === "URL") && !uploadForm.content) {
      toast.error(`Please provide ${uploadForm.contentType === "TEXT" ? "text content" : "URL"}`);
      return;
    }

    try {
      setLoading(true);
      await adminService.uploadDeliverableForTeam(uploadForm.teamId, {
        templateId: uploadForm.templateId,
        contentType: uploadForm.contentType,
        file: uploadForm.contentType === "FILE" ? uploadForm.file : null,
        content: (uploadForm.contentType === "TEXT" || uploadForm.contentType === "URL") ? uploadForm.content : undefined,
        description: uploadForm.description,
      });
      toast.success("Deliverable uploaded successfully");
      setShowUploadModal(false);
      setUploadForm({
        teamId: "",
        templateId: "",
        file: null,
        content: "",
        contentType: "FILE",
        description: "",
      });
      setSelectedTeam(null);
      setTeamSearch("");
      setTeamSearchResults([]);
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

  const handleEditTemplate = (template: DeliverableTemplate) => {
    setSelectedTemplate(template);
    setTemplateForm({
      title: template.title,
      description: template.description,
      type: template.type,
      customType: template.customType || "",
      contentType: template.contentType || "FILE",
      hackathonId: template.hackathonId || "",
      dueDate: template.dueDate ? new Date(template.dueDate).toISOString().split("T")[0] : "",
      required: template.required,
    });
    setShowEditTemplateModal(true);
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      setLoading(true);
      await adminService.updateDeliverableTemplate(selectedTemplate.id, templateForm);
      toast.success("Template updated successfully");
      setShowEditTemplateModal(false);
      setSelectedTemplate(null);
      setTemplateForm({
        title: "",
        description: "",
        type: "PROPOSAL",
        customType: "",
        contentType: "FILE",
        hackathonId: "",
        dueDate: "",
        required: true,
      });
      loadData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update template");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = (template: DeliverableTemplate) => {
    setSelectedTemplate(template);
    setShowDeleteTemplateModal(true);
  };

  const confirmDeleteTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      setLoading(true);
      await adminService.deleteDeliverableTemplate(selectedTemplate.id);
      toast.success("Template deleted successfully");
      setShowDeleteTemplateModal(false);
      setSelectedTemplate(null);
      loadData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete template");
    } finally {
      setLoading(false);
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
                        <span>{template.customType || template.type}</span>
                        <span className="rounded bg-slate-100 px-2 py-0.5">
                          {template.contentType}
                        </span>
                        {template.dueDate && (
                          <span>Due: {new Date(template.dueDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="cursor-pointer rounded p-1 text-slate-600 hover:bg-slate-100"
                        title="Edit Template"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template)}
                        className="cursor-pointer rounded p-1 text-red-600 hover:bg-red-50"
                        title="Delete Template"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Create Deliverable Template</h2>
              <button
                onClick={() => {
                  setShowCreateTemplateModal(false);
                  setTemplateForm({
                    title: "",
                    description: "",
                    type: "PROPOSAL",
                    customType: "",
                    contentType: "FILE",
                    hackathonId: "",
                    dueDate: "",
                    required: true,
                  });
                }}
                className="cursor-pointer rounded p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
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
                  onChange={(e) => {
                    const newType = e.target.value as any;
                    setTemplateForm({
                      ...templateForm,
                      type: newType,
                      customType: newType !== "CUSTOM" ? "" : templateForm.customType,
                    });
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#111827] focus:outline-none"
                >
                  <option value="PROPOSAL">Proposal</option>
                  <option value="PROTOTYPE">Prototype</option>
                  <option value="FINAL_SUBMISSION">Final Submission</option>
                  <option value="DOCUMENTATION">Documentation</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>
              {templateForm.type === "CUSTOM" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">Custom Type Name</label>
                  <input
                    type="text"
                    value={templateForm.customType}
                    onChange={(e) => setTemplateForm({ ...templateForm, customType: e.target.value })}
                    placeholder="e.g., Project Description, Wireframes, etc."
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#111827] focus:outline-none"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700">Content Type</label>
                <select
                  value={templateForm.contentType}
                  onChange={(e) =>
                    setTemplateForm({ ...templateForm, contentType: e.target.value as "TEXT" | "FILE" | "URL" })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#111827] focus:outline-none"
                >
                  <option value="FILE">File Upload</option>
                  <option value="TEXT">Text Content</option>
                  <option value="URL">URL Link</option>
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
                  onClick={() => {
                    setShowCreateTemplateModal(false);
                    setTemplateForm({
                      title: "",
                      description: "",
                      type: "PROPOSAL",
                      customType: "",
                      contentType: "FILE",
                      hackathonId: "",
                      dueDate: "",
                      required: true,
                    });
                  }}
                  className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTemplate}
                  disabled={loading || !templateForm.title}
                  className="cursor-pointer rounded-lg bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-[#1f2937] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Template Modal */}
      {showEditTemplateModal && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Edit Deliverable Template</h2>
              <button
                onClick={() => {
                  setShowEditTemplateModal(false);
                  setSelectedTemplate(null);
                  setTemplateForm({
                    title: "",
                    description: "",
                    type: "PROPOSAL",
                    customType: "",
                    contentType: "FILE",
                    hackathonId: "",
                    dueDate: "",
                    required: true,
                  });
                }}
                className="cursor-pointer rounded p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
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
                  onChange={(e) => {
                    const newType = e.target.value as any;
                    setTemplateForm({
                      ...templateForm,
                      type: newType,
                      customType: newType !== "CUSTOM" ? "" : templateForm.customType,
                    });
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#111827] focus:outline-none"
                >
                  <option value="PROPOSAL">Proposal</option>
                  <option value="PROTOTYPE">Prototype</option>
                  <option value="FINAL_SUBMISSION">Final Submission</option>
                  <option value="DOCUMENTATION">Documentation</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>
              {templateForm.type === "CUSTOM" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">Custom Type Name</label>
                  <input
                    type="text"
                    value={templateForm.customType}
                    onChange={(e) => setTemplateForm({ ...templateForm, customType: e.target.value })}
                    placeholder="e.g., Project Description, Wireframes, etc."
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#111827] focus:outline-none"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700">Content Type</label>
                <select
                  value={templateForm.contentType}
                  onChange={(e) =>
                    setTemplateForm({ ...templateForm, contentType: e.target.value as "TEXT" | "FILE" | "URL" })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#111827] focus:outline-none"
                >
                  <option value="FILE">File Upload</option>
                  <option value="TEXT">Text Content</option>
                  <option value="URL">URL Link</option>
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
                  id="required-edit"
                  checked={templateForm.required}
                  onChange={(e) => setTemplateForm({ ...templateForm, required: e.target.checked })}
                  className="rounded border-slate-300"
                />
                <label htmlFor="required-edit" className="text-sm font-medium text-slate-700">
                  Required for all teams
                </label>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowEditTemplateModal(false);
                    setSelectedTemplate(null);
                    setTemplateForm({
                      title: "",
                      description: "",
                      type: "PROPOSAL",
                      customType: "",
                      contentType: "FILE",
                      hackathonId: "",
                      dueDate: "",
                      required: true,
                    });
                  }}
                  className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateTemplate}
                  disabled={loading || !templateForm.title}
                  className="cursor-pointer rounded-lg bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-[#1f2937] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Updating..." : "Update Template"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Template Confirmation Modal */}
      {showDeleteTemplateModal && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Delete Deliverable Template</h2>
              <button
                onClick={() => {
                  setShowDeleteTemplateModal(false);
                  setSelectedTemplate(null);
                }}
                className="cursor-pointer rounded p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <p className="mb-6 text-sm text-slate-600">
              Are you sure you want to delete <strong>{selectedTemplate.title}</strong>? This action
              cannot be undone and will remove this deliverable requirement for all teams.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteTemplateModal(false);
                  setSelectedTemplate(null);
                }}
                className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTemplate}
                disabled={loading}
                className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Deleting..." : "Delete Template"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload for Team Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Upload Deliverable for Team</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadForm({
                    teamId: "",
                    templateId: "",
                    file: null,
                    content: "",
                    contentType: "FILE",
                    description: "",
                  });
                  setSelectedTeam(null);
                  setTeamSearch("");
                  setTeamSearchResults([]);
                }}
                className="cursor-pointer rounded p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Search Team</label>
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={teamSearch}
                    onChange={async (e) => {
                      const query = e.target.value;
                      setTeamSearch(query);

                      if (query.length < 2) {
                        setTeamSearchResults([]);
                        return;
                      }

                      try {
                        setSearchingTeams(true);
                        const response = await adminService.getTeams(1, 10, {
                          search: query,
                        });
                        setTeamSearchResults(response.teams || []);
                      } catch (error) {
                        console.error("Error searching teams:", error);
                        setTeamSearchResults([]);
                      } finally {
                        setSearchingTeams(false);
                      }
                    }}
                    placeholder="Search by team name or project..."
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-[#111827] focus:outline-none"
                  />

                  {/* Team Search Results Dropdown */}
                  {teamSearch.length >= 2 && (
                    <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                      {searchingTeams ? (
                        <div className="p-4 text-center text-sm text-slate-500">Searching...</div>
                      ) : teamSearchResults.length === 0 ? (
                        <div className="p-4 text-center text-sm text-slate-500">No teams found</div>
                      ) : (
                        teamSearchResults.map((team) => (
                          <button
                            key={team.id}
                            onClick={() => {
                              setSelectedTeam(team);
                              setUploadForm({ ...uploadForm, teamId: team.id });
                              setTeamSearch(team.name);
                              setTeamSearchResults([]);
                            }}
                            className="w-full cursor-pointer px-4 py-3 text-left hover:bg-slate-50"
                          >
                            <div className="flex items-center gap-3">
                              {team.profileImage ? (
                                <img
                                  src={team.profileImage}
                                  alt={team.name}
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200">
                                  <Users size={14} className="text-slate-500" />
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="font-medium text-slate-900">{team.name}</div>
                                <div className="text-xs text-slate-500">{team.school}</div>
                                {team.projectTitle && (
                                  <div className="text-xs text-slate-400">{team.projectTitle}</div>
                                )}
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Team Display */}
                {selectedTeam && (
                  <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-900">{selectedTeam.name}</div>
                      <div className="text-xs text-slate-500">{selectedTeam.school}</div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedTeam(null);
                        setUploadForm({ ...uploadForm, teamId: "" });
                        setTeamSearch("");
                      }}
                      className="cursor-pointer rounded p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
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
                <label className="block text-sm font-medium text-slate-700">Content Type</label>
                <select
                  value={uploadForm.contentType}
                  onChange={(e) => {
                    const newContentType = e.target.value as "TEXT" | "FILE" | "URL";
                    setUploadForm({
                      ...uploadForm,
                      contentType: newContentType,
                      file: newContentType !== "FILE" ? null : uploadForm.file,
                      content: newContentType === "FILE" ? "" : uploadForm.content,
                    });
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#111827] focus:outline-none"
                >
                  <option value="FILE">File Upload</option>
                  <option value="TEXT">Text Content</option>
                  <option value="URL">URL Link</option>
                </select>
              </div>

              {uploadForm.contentType === "FILE" && (
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
              )}

              {uploadForm.contentType === "TEXT" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">Text Content</label>
                  <textarea
                    value={uploadForm.content}
                    onChange={(e) => setUploadForm({ ...uploadForm, content: e.target.value })}
                    rows={5}
                    placeholder="Enter text content..."
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#111827] focus:outline-none"
                  />
                </div>
              )}

              {uploadForm.contentType === "URL" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">URL</label>
                  <input
                    type="url"
                    value={uploadForm.content}
                    onChange={(e) => setUploadForm({ ...uploadForm, content: e.target.value })}
                    placeholder="https://example.com"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#111827] focus:outline-none"
                  />
                </div>
              )}
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
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadForm({
                      teamId: "",
                      templateId: "",
                      file: null,
                      content: "",
                      contentType: "FILE",
                      description: "",
                    });
                    setSelectedTeam(null);
                    setTeamSearch("");
                    setTeamSearchResults([]);
                  }}
                  className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadForTeam}
                  disabled={
                    loading ||
                    !uploadForm.teamId ||
                    !uploadForm.templateId ||
                    (uploadForm.contentType === "FILE" && !uploadForm.file) ||
                    ((uploadForm.contentType === "TEXT" || uploadForm.contentType === "URL") && !uploadForm.content)
                  }
                  className="cursor-pointer rounded-lg bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-[#1f2937] disabled:opacity-50 disabled:cursor-not-allowed"
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
