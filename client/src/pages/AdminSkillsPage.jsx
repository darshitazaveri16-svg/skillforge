import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../services/api';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  X,
  Briefcase,
} from 'lucide-react';

const CATEGORIES = [
  'Frontend',
  'Backend',
  'Database',
  'Data Analysis',
  'Security',
  'Core',
  'DevOps',
  'Testing',
];

export default function AdminSkillsPage() {
  const { token: authToken } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [deleteConfirmSkill, setDeleteConfirmSkill] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  // Form
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Core');
  const [formDescription, setFormDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const token = authToken || localStorage.getItem('skillforge_token') || localStorage.getItem('token');

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/admin/skills`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to load skills.');

      setSkills(json.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load skills catalog.');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormName('');
    setFormCategory('Core');
    setFormDescription('');
    setError('');
    setSuccessMsg('');
    setIsCreateOpen(true);
  };

  const openEditModal = (sk) => {
    setEditingSkill(sk);
    setFormName(sk.name);
    setFormCategory(sk.category);
    setFormDescription(sk.description || '');
    setError('');
    setSuccessMsg('');
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formCategory) {
      setError('Please provide skill name and category.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/admin/skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formName.trim(),
          category: formCategory,
          description: formDescription.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to create skill.');

      setSuccessMsg(`Skill "${json.data.name}" added successfully!`);
      setIsCreateOpen(false);
      fetchSkills();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingSkill) return;

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/admin/skills/${editingSkill._id || editingSkill.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formName.trim(),
          category: formCategory,
          description: formDescription.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to update skill.');

      setSuccessMsg(`Skill "${json.data.name}" updated successfully!`);
      setEditingSkill(null);
      fetchSkills();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSkill = async () => {
    if (!deleteConfirmSkill) return;
    setDeleteError('');
    try {
      const res = await fetch(`${API_URL}/admin/skills/${deleteConfirmSkill._id || deleteConfirmSkill.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!res.ok) {
        setDeleteError(json.message || 'Cannot delete this skill due to active career or question dependencies.');
        return;
      }

      setSuccessMsg(json.message || 'Skill deleted successfully.');
      setDeleteConfirmSkill(null);
      fetchSkills();
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete skill.');
    }
  };

  // Filter skills
  const filteredSkills = skills.filter((sk) => {
    const matchesSearch =
      sk.name.toLowerCase().includes(search.toLowerCase()) ||
      sk.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || sk.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5" /> Technical Competencies
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Skills Catalog</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Maintain technical skills, categorize proficiencies, and review career associations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            ← Admin Dashboard
          </Link>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-violet-600/20 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add New Skill
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skills by name..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-400 whitespace-nowrap">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-violet-500 w-full sm:w-52"
          >
            <option value="all">All Categories ({skills.length})</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Skills Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 uppercase bg-slate-950/60 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Skill Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Associated Careers</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading skills catalog...
                  </td>
                </tr>
              ) : filteredSkills.length > 0 ? (
                filteredSkills.map((sk) => (
                  <tr key={sk._id || sk.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4 font-bold text-white whitespace-nowrap">
                      {sk.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20">
                        {sk.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300 max-w-xs truncate">
                      {sk.description || <span className="text-slate-600 italic">No description</span>}
                    </td>
                    <td className="px-6 py-4">
                      {sk.associatedCareers && sk.associatedCareers.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {sk.associatedCareers.map((car, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300"
                            >
                              {car}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">Unlinked</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(sk)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
                          title="Edit Skill"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteError('');
                            setDeleteConfirmSkill(sk);
                          }}
                          className="p-1.5 bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-lg transition cursor-pointer"
                          title="Delete Skill"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                    No skills match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {(isCreateOpen || editingSkill) && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-violet-400" />
                {editingSkill ? `Edit Skill: ${editingSkill.name}` : 'Add New Skill'}
              </h2>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingSkill(null);
                }}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingSkill ? handleEditSubmit : handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Skill Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Kubernetes, TypeScript, PySpark"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category *</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-violet-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  placeholder="Brief summary of this technical skill..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingSkill(null);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl shadow-md shadow-violet-600/20 disabled:opacity-50 transition cursor-pointer"
                >
                  {submitting ? 'Saving...' : editingSkill ? 'Save Changes' : 'Create Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmSkill && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h2 className="text-lg font-bold text-white">Delete Skill</h2>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to delete skill <strong>"{deleteConfirmSkill.name}"</strong>?
            </p>

            {deleteError && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
                <p className="font-semibold text-rose-200">Integrity Protection:</p>
                <p className="mt-1 leading-relaxed">{deleteError}</p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmSkill(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSkill}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
