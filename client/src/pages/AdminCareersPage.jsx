import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  CheckCircle2,
  Sparkles,
  Layers,
  Search,
} from 'lucide-react';

export default function AdminCareersPage() {
  const { token: authToken } = useAuth();
  const [careers, setCareers] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState(null);
  const [deleteConfirmCareer, setDeleteConfirmCareer] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSkills, setFormSkills] = useState([]); // [{ skill: id, targetLevel: 80 }]
  const [submitting, setSubmitting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = authToken || localStorage.getItem('skillforge_token') || localStorage.getItem('token');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [careersRes, skillsRes] = await Promise.all([
        fetch(`${API_URL}/admin/careers`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/admin/skills`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const careersJson = await careersRes.json();
      const skillsJson = await skillsRes.json();

      if (careersRes.ok) setCareers(careersJson.data || []);
      if (skillsRes.ok) setAvailableSkills(skillsJson.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load career management data.');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormName('');
    setFormDescription('');
    setFormSkills([]);
    setError('');
    setSuccessMsg('');
    setIsCreateOpen(true);
  };

  const openEditModal = (c) => {
    setEditingCareer(c);
    setFormName(c.name);
    setFormDescription(c.description);
    setFormSkills(
      (c.requiredSkills || []).map((r) => ({
        skill: r.skill?._id || r.skill || r.id,
        name: r.skill?.name || '',
        targetLevel: r.targetLevel || 80,
      }))
    );
    setError('');
    setSuccessMsg('');
  };

  const handleAddSkillToForm = (skillId) => {
    if (!skillId) return;
    if (formSkills.some((s) => s.skill === skillId)) return;
    const skillObj = availableSkills.find((s) => s._id === skillId || s.id === skillId);
    setFormSkills([
      ...formSkills,
      { skill: skillId, name: skillObj ? skillObj.name : '', targetLevel: 80 },
    ]);
  };

  const handleRemoveSkillFromForm = (skillId) => {
    setFormSkills(formSkills.filter((s) => s.skill !== skillId));
  };

  const handleTargetLevelChange = (skillId, level) => {
    setFormSkills(
      formSkills.map((s) =>
        s.skill === skillId ? { ...s, targetLevel: Math.max(0, Math.min(100, parseInt(level, 10) || 0)) } : s
      )
    );
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formDescription.trim()) {
      setError('Please provide career name and description.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/admin/careers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formName.trim(),
          description: formDescription.trim(),
          requiredSkills: formSkills.map((s) => ({
            skill: s.skill,
            targetLevel: s.targetLevel,
          })),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to create career.');

      setSuccessMsg(`Career "${json.data.name}" created successfully!`);
      setIsCreateOpen(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingCareer) return;

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/admin/careers/${editingCareer._id || editingCareer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formName.trim(),
          description: formDescription.trim(),
          requiredSkills: formSkills.map((s) => ({
            skill: s.skill,
            targetLevel: s.targetLevel,
          })),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to update career.');

      setSuccessMsg(`Career "${json.data.name}" updated successfully!`);
      setEditingCareer(null);
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCareer = async () => {
    if (!deleteConfirmCareer) return;
    setDeleteError('');
    try {
      const res = await fetch(`${API_URL}/admin/careers/${deleteConfirmCareer._id || deleteConfirmCareer.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!res.ok) {
        setDeleteError(json.message || 'Cannot delete this career due to data dependencies.');
        return;
      }

      setSuccessMsg(json.message || 'Career deleted successfully.');
      setDeleteConfirmCareer(null);
      fetchData();
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete career.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Briefcase className="w-3.5 h-3.5" /> Career Tracks Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Career Library</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Define target career profiles, required competencies, and benchmark readiness standards.
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
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add New Career
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

      {/* Careers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading career specifications...
          </div>
        ) : careers.length > 0 ? (
          careers.map((career) => (
            <div
              key={career._id || career.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">{career.name}</h2>
                      <span className="text-[11px] text-indigo-400 font-medium">
                        {(career.requiredSkills || []).length} Required Skills
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(career)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
                      title="Edit Career"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteError('');
                        setDeleteConfirmCareer(career);
                      }}
                      className="p-1.5 bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-lg transition cursor-pointer"
                      title="Delete Career"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {career.description}
                </p>

                {/* Required Skills Badges */}
                <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Competencies & Benchmarks:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(career.requiredSkills || []).map((req, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs"
                      >
                        <span className="font-medium">{req.skill?.name || 'Skill'}</span>
                        <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-1 rounded">
                          {req.targetLevel}%
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>ID: {career._id || career.id}</span>
                <span>Active Track</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 py-16 text-center text-slate-500">
            No careers found. Click "Add New Career" to create one.
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {(isCreateOpen || editingCareer) && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-400" />
                {editingCareer ? `Edit Career: ${editingCareer.name}` : 'Create New Career Track'}
              </h2>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingCareer(null);
                }}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={editingCareer ? handleEditSubmit : handleCreateSubmit}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Career Title *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Cloud Security Architect"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Career Description *</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe role responsibilities and industry profile..."
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Skills Selector */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-300 font-semibold">
                    Required Skills & Target Proficiency
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {formSkills.length} selected
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    onChange={(e) => {
                      handleAddSkillToForm(e.target.value);
                      e.target.value = '';
                    }}
                    defaultValue=""
                    className="bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 flex-grow"
                  >
                    <option value="" disabled>
                      + Add a skill to this career track...
                    </option>
                    {availableSkills
                      .filter((sk) => !formSkills.some((s) => s.skill === (sk._id || sk.id)))
                      .map((sk) => (
                        <option key={sk._id || sk.id} value={sk._id || sk.id}>
                          {sk.name} ({sk.category})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Form Selected Skills list */}
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1 pt-1">
                  {formSkills.map((item) => (
                    <div
                      key={item.skill}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <span className="font-semibold text-white">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <label className="text-slate-400">Target Level:</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.targetLevel}
                          onChange={(e) => handleTargetLevelChange(item.skill, e.target.value)}
                          className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-center text-white font-bold"
                        />
                        <span className="text-slate-500">%</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkillFromForm(item.skill)}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded transition ml-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {formSkills.length === 0 && (
                    <p className="text-xs text-slate-500 italic py-2">
                      No skills added yet. Select from the dropdown above.
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingCareer(null);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-md shadow-indigo-600/20 disabled:opacity-50 transition cursor-pointer"
                >
                  {submitting ? 'Saving...' : editingCareer ? 'Save Changes' : 'Create Career'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (with Data Integrity Check feedback) */}
      {deleteConfirmCareer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h2 className="text-lg font-bold text-white">Delete Career Track</h2>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to delete career <strong>"{deleteConfirmCareer.name}"</strong>?
              This action cannot be undone.
            </p>

            {deleteError && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
                <p className="font-semibold text-rose-200">Data Integrity Protection:</p>
                <p className="mt-1 leading-relaxed">{deleteError}</p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmCareer(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCareer}
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
