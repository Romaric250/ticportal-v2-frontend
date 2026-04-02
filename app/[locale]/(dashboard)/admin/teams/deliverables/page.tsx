"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Upload, X, Search, Users, ShieldCheck, ShieldAlert, Loader2, ExternalLink, CheckCircle, XCircle, AlertTriangle, RefreshCw, FileDown } from "lucide-react";
import { adminService, type TeamDeliverable, type DeliverableTemplate, type GDriveAccessCheckResult, type GDriveAccessCheckItem } from "../../../../../../src/lib/services/adminService";
import { toast } from "sonner";
import { DeliverableTemplatesTab } from "../../../../../../components/dashboard/admin/DeliverableTemplatesTab";
import { DeliverableSubmissionsTab } from "../../../../../../components/dashboard/admin/DeliverableSubmissionsTab";
import { DeliverableViewModal } from "../../../../../../components/dashboard/admin/DeliverableViewModal";
import { exportInaccessibleDeliverablesPdf } from "../../../../../../src/utils/exportToPdf";

export default function AdminTeamDeliverablesPage() {
  const [deliverables, setDeliverables] = useState<TeamDeliverable[]>([]);
  const [templates, setTemplates] = useState<DeliverableTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [showEditTemplateModal, setShowEditTemplateModal] = useState(false);
  const [showDeleteTemplateModal, setShowDeleteTemplateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState<TeamDeliverable | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DeliverableTemplate | null>(null);
  const [activeTab, setActiveTab] = useState<"templates" | "submissions" | "access-check">("templates");

  // Access check state
  const [accessCheckResult, setAccessCheckResult] = useState<GDriveAccessCheckResult | null>(null);
  const [accessCheckLoading, setAccessCheckLoading] = useState(false);
  const [accessFilter, setAccessFilter] = useState<"all" | "accessible" | "not-accessible" | "failed">("all");
  const [rejectingIds, setRejectingIds] = useState<Set<string>>(new Set());
  const [accessTemplateFilter, setAccessTemplateFilter] = useState<string>("");
  
  const [filters, setFilters] = useState<{
    submissionStatus?: "NOT_SUBMITTED" | "SUBMITTED" | string;
    reviewStatus?: "PENDING" | "APPROVED" | "REJECTED" | string;
    status?: string;
    hackathon?: string;
    search?: string;
    templateId?: string;
  }>({
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
      } else if (activeTab === "submissions") {
        const data = await adminService.getTeamDeliverables({
          ...filters,
          submissionStatus: filters.submissionStatus as "NOT_SUBMITTED" | "SUBMITTED" | undefined,
          reviewStatus: filters.reviewStatus as "PENDING" | "APPROVED" | "REJECTED" | undefined,
          templateId: filters.templateId,
        });
        setDeliverables(data);
      }
      // Always load templates for the access-check template filter
      if (templates.length === 0) {
        const data = await adminService.getDeliverableTemplates();
        setTemplates(data);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const runAccessCheck = useCallback(async () => {
    try {
      setAccessCheckLoading(true);
      const result = await adminService.bulkCheckDeliverableAccess(
        accessTemplateFilter || undefined,
      );
      setAccessCheckResult(result);
    } catch (error: any) {
      toast.error(error?.message || "Failed to run access check");
    } finally {
      setAccessCheckLoading(false);
    }
  }, [accessTemplateFilter]);

  const handleRejectForAccess = async (deliverableId: string) => {
    try {
      setRejectingIds((prev) => new Set(prev).add(deliverableId));
      await adminService.rejectDeliverableForAccess(deliverableId);
      toast.success("Deliverable rejected — team notified via email");
      // Update local state
      if (accessCheckResult) {
        setAccessCheckResult({
          ...accessCheckResult,
          items: accessCheckResult.items.map((item) =>
            item.deliverableId === deliverableId
              ? { ...item, reviewStatus: "REJECTED", submissionStatus: "NOT_SUBMITTED" }
              : item,
          ),
        });
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to reject deliverable");
    } finally {
      setRejectingIds((prev) => {
        const next = new Set(prev);
        next.delete(deliverableId);
        return next;
      });
    }
  };

  const handleBulkRejectInaccessible = async () => {
    if (!accessCheckResult) return;
    const inaccessible = accessCheckResult.items.filter(
      (i) => i.accessResult.accessible === false && i.reviewStatus !== "REJECTED",
    );
    if (inaccessible.length === 0) {
      toast.info("No inaccessible deliverables to reject");
      return;
    }
    const confirmed = window.confirm(
      `This will reject ${inaccessible.length} deliverable(s) and email the teams. Continue?`,
    );
    if (!confirmed) return;
    let count = 0;
    for (const item of inaccessible) {
      try {
        await adminService.rejectDeliverableForAccess(item.deliverableId);
        count++;
      } catch (_) {}
    }
    toast.success(`Rejected ${count}/${inaccessible.length} deliverables`);
    runAccessCheck();
  };

  const filteredAccessItems = accessCheckResult?.items.filter((item) => {
    if (accessFilter === "accessible") return item.accessResult.accessible === true;
    if (accessFilter === "not-accessible") return item.accessResult.accessible === false;
    if (accessFilter === "failed") return item.accessResult.accessible === null;
    return true;
  }) ?? [];

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

  const handleDelete = async (id: string) => {
    try {
      await adminService.deleteDeliverable(id);
      toast.success("Submission deleted successfully");
      loadData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete submission");
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

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team Deliverables</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create deliverable requirements and manage team submissions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === "templates" && (
            <button
              onClick={() => setShowCreateTemplateModal(true)}
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              <Plus size={16} />
              Create Deliverable
            </button>
          )}
          {activeTab === "submissions" && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
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
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "templates"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Deliverable Templates
          </button>
          <button
            onClick={() => setActiveTab("submissions")}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "submissions"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Team Submissions
          </button>
          <button
            onClick={() => setActiveTab("access-check")}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "access-check"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck size={15} />
            Access Check
          </button>
        </div>
      </div>

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <DeliverableTemplatesTab
          templates={templates}
          loading={loading}
          onEdit={handleEditTemplate}
          onDelete={handleDeleteTemplate}
        />
      )}

      {/* Submissions Tab */}
      {activeTab === "submissions" && (
        <DeliverableSubmissionsTab
          deliverables={deliverables}
          loading={loading}
          templates={templates}
          filters={filters}
          onFilterChange={setFilters}
          onView={(deliverable) => {
            setSelectedDeliverable(deliverable);
            setShowViewModal(true);
          }}
          onApprove={handleApprove}
          onReject={handleReject}
          onDelete={handleDelete}
        />
      )}

      {/* Access Check Tab */}
      {activeTab === "access-check" && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <select
                value={accessTemplateFilter}
                onChange={(e) => setAccessTemplateFilter(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              >
                <option value="">All deliverables</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
              <button
                onClick={runAccessCheck}
                disabled={accessCheckLoading}
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
              >
                {accessCheckLoading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <RefreshCw size={15} />
                )}
                {accessCheckLoading ? "Checking..." : "Run Access Check"}
              </button>
            </div>
            <div className="flex items-center gap-2">
              {accessCheckResult && accessCheckResult.stats.notAccessible > 0 && (
                <>
                  <button
                    onClick={() => {
                      if (!accessCheckResult) return;
                      exportInaccessibleDeliverablesPdf(accessCheckResult.items);
                      toast.success("PDF exported");
                    }}
                    className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <FileDown size={15} />
                    Export PDF
                  </button>
                  <button
                    onClick={handleBulkRejectInaccessible}
                    className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                  >
                    <XCircle size={15} />
                    Reject All Inaccessible ({accessCheckResult.stats.notAccessible})
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats cards */}
          {accessCheckResult && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
                <div className="text-2xl font-bold text-slate-900">{accessCheckResult.stats.total}</div>
                <div className="text-xs text-slate-500">Total Submitted</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{accessCheckResult.stats.googleDriveLinks}</div>
                <div className="text-xs text-slate-500">Google Drive Links</div>
              </div>
              <button
                onClick={() => setAccessFilter("accessible")}
                className={`rounded-lg border p-3 text-center transition-colors ${accessFilter === "accessible" ? "border-green-400 bg-green-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
              >
                <div className="text-2xl font-bold text-green-600">{accessCheckResult.stats.accessible}</div>
                <div className="text-xs text-slate-500">Accessible</div>
              </button>
              <button
                onClick={() => setAccessFilter("not-accessible")}
                className={`rounded-lg border p-3 text-center transition-colors ${accessFilter === "not-accessible" ? "border-red-400 bg-red-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
              >
                <div className="text-2xl font-bold text-red-600">{accessCheckResult.stats.notAccessible}</div>
                <div className="text-xs text-slate-500">Not Accessible</div>
              </button>
              <button
                onClick={() => setAccessFilter("failed")}
                className={`rounded-lg border p-3 text-center transition-colors ${accessFilter === "failed" ? "border-amber-400 bg-amber-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
              >
                <div className="text-2xl font-bold text-amber-600">{accessCheckResult.stats.checkFailed}</div>
                <div className="text-xs text-slate-500">Check Failed</div>
              </button>
              <button
                onClick={() => setAccessFilter("all")}
                className={`rounded-lg border p-3 text-center transition-colors ${accessFilter === "all" ? "border-slate-400 bg-slate-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
              >
                <div className="text-2xl font-bold text-slate-600">{accessCheckResult.stats.nonGoogleDrive}</div>
                <div className="text-xs text-slate-500">Non-GDrive</div>
              </button>
            </div>
          )}

          {/* Results table */}
          {accessCheckLoading && !accessCheckResult && (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-slate-400" />
              <span className="ml-2 text-sm text-slate-500">Checking Google Drive access for all submissions...</span>
            </div>
          )}

          {!accessCheckResult && !accessCheckLoading && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 py-16">
              <ShieldAlert size={40} className="mb-3 text-slate-300" />
              <p className="text-sm font-medium text-slate-600">No access check results yet</p>
              <p className="mt-1 text-xs text-slate-400">Click "Run Access Check" to scan all Google Drive links</p>
            </div>
          )}

          {accessCheckResult && filteredAccessItems.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 py-12">
              <CheckCircle size={32} className="mb-2 text-green-400" />
              <p className="text-sm text-slate-500">No items match this filter</p>
            </div>
          )}

          {filteredAccessItems.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left">
                    <th className="px-4 py-3 font-medium text-slate-600">Team</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Region</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Members</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Deliverable</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Link</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Access</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAccessItems.map((item) => (
                    <tr key={item.deliverableId} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{item.teamName}</div>
                        {item.teamSchool && (
                          <div className="text-xs text-slate-400">{item.teamSchool}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">{item.teamRegion || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {item.members?.map((m, idx) => (
                            <span
                              key={idx}
                              className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700"
                              title={`${m.email}${m.phone ? ` · ${m.phone}` : ""} · ${m.school}`}
                            >
                              {m.name}
                              {m.role === "LEAD" && (
                                <span className="ml-0.5 text-amber-500">★</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{item.templateTitle}</td>
                      <td className="px-4 py-3">
                        <a
                          href={item.content}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                          <ExternalLink size={12} />
                          {item.accessResult.isFolder ? "Folder" : "File"}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        {item.reviewStatus === "REJECTED" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                            Rejected
                          </span>
                        ) : item.reviewStatus === "APPROVED" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {item.accessResult.accessible === true && (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <CheckCircle size={14} /> Public
                          </span>
                        )}
                        {item.accessResult.accessible === false && (
                          <span className="inline-flex items-center gap-1 text-red-600">
                            <XCircle size={14} /> No Access
                          </span>
                        )}
                        {item.accessResult.accessible === null && (
                          <span className="inline-flex items-center gap-1 text-amber-500">
                            <AlertTriangle size={14} /> Unknown
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {item.accessResult.accessible === false && item.reviewStatus !== "REJECTED" && (
                            <button
                              onClick={() => handleRejectForAccess(item.deliverableId)}
                              disabled={rejectingIds.has(item.deliverableId)}
                              className="flex items-center gap-1 rounded bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              {rejectingIds.has(item.deliverableId) ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <XCircle size={12} />
                              )}
                              Reject
                            </button>
                          )}
                          {item.reviewStatus === "APPROVED" && (
                            <button
                              onClick={() => handleRejectForAccess(item.deliverableId)}
                              disabled={rejectingIds.has(item.deliverableId)}
                              className="flex items-center gap-1 rounded border border-red-300 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              {rejectingIds.has(item.deliverableId) ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <XCircle size={12} />
                              )}
                              Revoke & Reject
                            </button>
                          )}
                          {item.accessResult.accessible === true && item.reviewStatus === "PENDING" && (
                            <button
                              onClick={() => handleApprove(item.deliverableId)}
                              className="flex items-center gap-1 rounded bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-700"
                            >
                              <CheckCircle size={12} />
                              Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
                  className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900">
                                  <Users size={14} className="text-white" />
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
                  className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Deliverable Modal */}
      {showViewModal && selectedDeliverable && (
        <DeliverableViewModal
          deliverable={selectedDeliverable}
          onClose={() => {
            setShowViewModal(false);
            setSelectedDeliverable(null);
          }}
        />
      )}
    </div>
  );
}
