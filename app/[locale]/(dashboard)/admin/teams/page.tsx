"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Eye, Edit2, Trash2, Users, FileText, Plus, X, Save } from "lucide-react";
import { adminService, type Team, type TeamsResponse } from "../../../../../src/lib/services/adminService";
import { toast } from "sonner";
import { useLocale } from "next-intl";
import Link from "next/link";

export default function AdminTeamsPage() {
  const locale = useLocale();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    school: "All Schools",
    status: "All Statuses",
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    projectTitle: "",
    description: "",
  });

  useEffect(() => {
    loadTeams();
  }, [pagination.page, filters]);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.search) {
        params.append("search", filters.search);
      }
      if (filters.school && filters.school !== "All Schools") {
        params.append("school", filters.school);
      }
      if (filters.status && filters.status !== "All Statuses") {
        params.append("status", filters.status);
      }

      const response = await adminService.getTeams(pagination.page, pagination.limit, {
        search: filters.search || undefined,
        school: filters.school !== "All Schools" ? filters.school : undefined,
        status: filters.status !== "All Statuses" ? filters.status : undefined,
      });

      setTeams(response.teams);
      setPagination(response.pagination);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load teams");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (team: Team) => {
    setSelectedTeam(team);
    setEditForm({
      name: team.name,
      projectTitle: team.projectTitle || "",
      description: team.description || "",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedTeam) return;

    try {
      setLoading(true);
      await adminService.updateTeam(selectedTeam.id, editForm);
      toast.success("Team updated successfully");
      setShowEditModal(false);
      setSelectedTeam(null);
      loadTeams();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update team");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (team: Team) => {
    setSelectedTeam(team);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedTeam) return;

    try {
      setLoading(true);
      await adminService.deleteTeam(selectedTeam.id);
      toast.success("Team deleted successfully");
      setShowDeleteModal(false);
      setSelectedTeam(null);
      loadTeams();
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete team");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (teamId: string) => {
    try {
      const team = await adminService.getTeam(teamId);
      // For now, just show a toast with team info
      // You can create a detailed view modal if needed
      toast.info(`Team: ${team.name} - ${team.members?.length || 0} members`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load team details");
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Teams Management</h1>
          <p className="mt-1 text-sm text-slate-600">
            View all teams, manage team members, and oversee team activities.
          </p>
        </div>
        <Link
          href={`/${locale}/admin/teams/deliverables`}
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <FileText size={16} />
          Deliverables
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by team name or project title..."
            value={filters.search}
            onChange={(e) => {
              setFilters({ ...filters, search: e.target.value });
              setPagination({ ...pagination, page: 1 });
            }}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-[#111827] focus:outline-none"
          />
        </div>
        <select
          value={filters.school}
          onChange={(e) => {
            setFilters({ ...filters, school: e.target.value });
            setPagination({ ...pagination, page: 1 });
          }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#111827] focus:outline-none"
        >
          <option>All Schools</option>
          {/* TODO: Populate from API */}
        </select>
        <select
          value={filters.status}
          onChange={(e) => {
            setFilters({ ...filters, status: e.target.value });
            setPagination({ ...pagination, page: 1 });
          }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#111827] focus:outline-none"
        >
          <option>All Statuses</option>
          <option>ACTIVE</option>
          <option>INACTIVE</option>
        </select>
      </div>

      {/* Teams Table */}
      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  School
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Members
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#111827] border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : teams.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                    No teams found
                  </td>
                </tr>
              ) : (
                teams.map((team) => (
                  <tr key={team.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {team.profileImage ? (
                          <img
                            src={team.profileImage}
                            alt={team.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200">
                            <Users size={16} className="text-slate-500" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-slate-900">{team.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{team.school}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {team.projectTitle || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-slate-400" />
                        <span className="text-sm text-slate-700">{team.members?.length || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(team.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(team.id)}
                          className="cursor-pointer rounded p-1 text-slate-600 hover:bg-slate-100"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(team)}
                          className="cursor-pointer rounded p-1 text-slate-600 hover:bg-slate-100"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(team)}
                          className="cursor-pointer rounded p-1 text-red-600 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="border-t border-slate-200 bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                {pagination.total} teams
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page >= pagination.totalPages}
                  className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Edit Team</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedTeam(null);
                }}
                className="cursor-pointer rounded p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Team Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#111827] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Project Title</label>
                <input
                  type="text"
                  value={editForm.projectTitle}
                  onChange={(e) => setEditForm({ ...editForm, projectTitle: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#111827] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#111827] focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedTeam(null);
                  }}
                  className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={loading || !editForm.name}
                  className="cursor-pointer rounded-lg bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-[#1f2937] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Delete Team</h2>
            <p className="mb-6 text-sm text-slate-600">
              Are you sure you want to delete <strong>{selectedTeam.name}</strong>? This action
              cannot be undone and will remove all team data, members, and submissions.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedTeam(null);
                }}
                className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Deleting..." : "Delete Team"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
