"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, CheckCircle, XCircle, Clock, Download, AlertCircle } from "lucide-react";
import { teamService, type TeamDeliverable, type DeliverableTemplate } from "../../../../../../src/lib/services/teamService";
import { toast } from "sonner";

export default function StudentTeamDeliverablesPage() {
  const [deliverables, setDeliverables] = useState<TeamDeliverable[]>([]);
  const [templates, setTemplates] = useState<DeliverableTemplate[]>([]);
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DeliverableTemplate | null>(null);
  const [uploadData, setUploadData] = useState({
    templateId: "",
    file: null as File | null,
    description: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const myTeams = await teamService.getMyTeams();
      if (myTeams.length > 0) {
        setTeam(myTeams[0]);
        const [teamDeliverables, availableTemplates] = await Promise.all([
          teamService.getTeamDeliverables(myTeams[0].id),
          teamService.getAvailableDeliverableTemplates(),
        ]);
        setDeliverables(teamDeliverables);
        setTemplates(availableTemplates);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to load deliverables");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadData.file || !team || !uploadData.templateId) return;

    try {
      setLoading(true);
      await teamService.uploadDeliverable(team.id, {
        templateId: uploadData.templateId,
        file: uploadData.file,
        description: uploadData.description,
      });
      toast.success("Deliverable uploaded successfully");
      setShowUploadModal(false);
      setUploadData({ templateId: "", file: null, description: "" });
      setSelectedTemplate(null);
      loadData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to upload deliverable");
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

  const getTemplateStatus = (templateId: string) => {
    const submission = deliverables.find((d) => d.templateId === templateId);
    return submission ? submission.status : "NOT_SUBMITTED";
  };

  if (!team) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-slate-500">You must be in a team to view deliverables</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Team Deliverables</h1>
        <p className="mt-1 text-sm text-slate-600">
          View required deliverables and submit your team's work.
        </p>
      </div>

      {/* Required Deliverables */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Required Deliverables</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="text-center text-slate-500">Loading...</div>
          ) : templates.length === 0 ? (
            <div className="col-span-full rounded-lg border border-slate-200 bg-white p-8 text-center">
              <FileText size={48} className="mx-auto text-slate-300" />
              <p className="mt-4 text-sm text-slate-500">No deliverables assigned yet</p>
            </div>
          ) : (
            templates.map((template) => {
              const status = getTemplateStatus(template.id);
              const submission = deliverables.find((d) => d.templateId === template.id);

              return (
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
                      {template.dueDate && (
                        <p className="mt-2 text-xs text-slate-500">
                          Due: {new Date(template.dueDate).toLocaleDateString()}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-2">
                        {status === "NOT_SUBMITTED" && (
                          <span className="flex items-center gap-1 text-xs text-amber-600">
                            <AlertCircle size={12} />
                            Not submitted
                          </span>
                        )}
                        {status === "PENDING" && (
                          <span className="flex items-center gap-1 text-xs text-amber-600">
                            <Clock size={12} />
                            Pending review
                          </span>
                        )}
                        {status === "APPROVED" && (
                          <span className="flex items-center gap-1 text-xs text-emerald-600">
                            <CheckCircle size={12} />
                            Approved
                          </span>
                        )}
                        {status === "REJECTED" && (
                          <span className="flex items-center gap-1 text-xs text-red-600">
                            <XCircle size={12} />
                            Rejected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    {status === "NOT_SUBMITTED" && (
                      <button
                        onClick={() => {
                          setSelectedTemplate(template);
                          setUploadData({ ...uploadData, templateId: template.id });
                          setShowUploadModal(true);
                        }}
                        className="flex-1 rounded-lg bg-[#111827] px-3 py-2 text-sm font-medium text-white hover:bg-[#1f2937]"
                      >
                        <Upload size={14} className="mr-1 inline" />
                        Submit
                      </button>
                    )}
                    {submission && (
                      <a
                        href={submission.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Download size={14} className="mr-1 inline" />
                        View
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Submitted Deliverables */}
      {deliverables.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Submitted Deliverables</h2>
          <div className="space-y-4">
            {deliverables.map((deliverable) => (
              <div
                key={deliverable.id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="text-slate-400" />
                      <div>
                        <h3 className="font-semibold text-slate-900">{deliverable.type}</h3>
                        {deliverable.description && (
                          <p className="mt-1 text-sm text-slate-600">{deliverable.description}</p>
                        )}
                        <p className="mt-1 text-xs text-slate-500">
                          Submitted: {new Date(deliverable.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(deliverable.status)}
                      <span className="text-sm text-slate-700">{deliverable.status}</span>
                    </div>
                    {deliverable.fileUrl && (
                      <a
                        href={deliverable.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded p-1 text-slate-600 hover:bg-slate-100"
                      >
                        <Download size={16} />
                      </a>
                    )}
                  </div>
                </div>
                {deliverable.feedback && (
                  <div className="mt-3 rounded-lg bg-slate-50 p-3">
                    <p className="text-xs font-medium text-slate-700">Feedback:</p>
                    <p className="mt-1 text-sm text-slate-600">{deliverable.feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Submit: {selectedTemplate.title}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">File</label>
                <input
                  type="file"
                  onChange={(e) =>
                    setUploadData({ ...uploadData, file: e.target.files?.[0] || null })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#111827] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Description (Optional)</label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#111827] focus:outline-none"
                />
              </div>
              {selectedTemplate.dueDate && (
                <div className="rounded-lg bg-amber-50 p-3">
                  <p className="text-xs font-medium text-amber-800">
                    Due Date: {new Date(selectedTemplate.dueDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedTemplate(null);
                    setUploadData({ templateId: "", file: null, description: "" });
                  }}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={loading || !uploadData.file}
                  className="rounded-lg bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-[#1f2937] disabled:opacity-50"
                >
                  {loading ? "Uploading..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
