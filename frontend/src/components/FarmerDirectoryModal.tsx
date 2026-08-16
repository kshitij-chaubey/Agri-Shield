'use client';

import React, { useState } from 'react';
import { 
  X, 
  Users, 
  UserPlus, 
  Search, 
  RotateCcw, 
  Edit2, 
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Farmer } from '../lib/types';
import { api } from '../lib/api';

interface FarmerDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmers: Farmer[];
  onRefresh: () => void;
  onSelectFarmerForAdvisory: (farmer: Farmer) => void;
}

export const FarmerDirectoryModal: React.FC<FarmerDirectoryModalProps> = ({
  isOpen,
  onClose,
  farmers,
  onRefresh,
  onSelectFarmerForAdvisory
}) => {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPhone, setEditPhone] = useState('');
  const [isAddingJudge, setIsAddingJudge] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [judgeForm, setJudgeForm] = useState({
    name: 'Evaluator / Judge Profile',
    phone: '+919876543210',
    district: 'Nashik',
    crop_type: 'Onion & Grapes',
    crop_stage: 'Harvest-Ready',
    soil_type: 'Black Cotton Soil',
    language: 'hi'
  });

  if (!isOpen) return null;

  const filteredFarmers = farmers.filter((f) => {
    return f.name.toLowerCase().includes(search.toLowerCase()) || 
           f.crop_type.toLowerCase().includes(search.toLowerCase()) ||
           f.district.toLowerCase().includes(search.toLowerCase()) ||
           f.phone.includes(search);
  });

  const handleStartEdit = (f: Farmer) => {
    setEditingId(f.id);
    setEditPhone(f.phone);
  };

  const handleSavePhone = async (id: number) => {
    try {
      await api.updateFarmer(id, { phone: editPhone });
      setEditingId(null);
      setFeedback({ type: 'success', message: 'Phone number updated successfully!' });
      setTimeout(() => setFeedback(null), 3000);
      onRefresh();
    } catch (e: any) {
      console.error(e);
      setFeedback({ type: 'error', message: 'Failed to update phone number.' });
    }
  };

  const handleAddJudgeProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    try {
      await api.createFarmer(judgeForm);
      setIsAddingJudge(false);
      setFeedback({ type: 'success', message: `Farmer "${judgeForm.name}" registered successfully!` });
      setTimeout(() => setFeedback(null), 3500);
      onRefresh();
    } catch (e: any) {
      console.error(e);
      setFeedback({ type: 'error', message: e?.message || 'Failed to add farmer profile.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSeeds = async () => {
    if (confirm('Reset database to default pan-regional agricultural seed farmers?')) {
      setIsSubmitting(true);
      try {
        const res = await api.resetSeedFarmers();
        setFeedback({ type: 'success', message: res.message || 'Seed farmers repopulated successfully!' });
        setTimeout(() => setFeedback(null), 3500);
        onRefresh();
      } catch (e: any) {
        console.error(e);
        setFeedback({ type: 'error', message: 'Failed to reset seed farmers.' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-6 flex flex-col max-h-[88vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <span>Registered Farm Holdings Database</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-mono">
                {farmers.length} Records
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Geo-mapped agricultural holdings across regional agro-climatic zones
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingJudge(!isAddingJudge)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isAddingJudge ? 'View Table' : '+ Onboard Test Phone'}</span>
            </button>

            <button
              onClick={handleResetSeeds}
              disabled={isSubmitting}
              className="p-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs flex items-center gap-1 cursor-pointer"
              title="Reset Seeds"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Reset Seeds</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {feedback && (
          <div className={`p-3 rounded-xl mb-3 text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Add Test Profile Form */}
        {isAddingJudge ? (
          <form onSubmit={handleAddJudgeProfile} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 mb-4 space-y-3">
            <h4 className="text-xs font-semibold text-emerald-400">
              Onboard Live Test Number (To receive physical SMS & Calls)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Name</label>
                <input
                  type="text"
                  value={judgeForm.name}
                  onChange={(e) => setJudgeForm({ ...judgeForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Phone Number (E.164)</label>
                <input
                  type="text"
                  value={judgeForm.phone}
                  onChange={(e) => setJudgeForm({ ...judgeForm, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  placeholder="+91..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Region</label>
                <select
                  value={judgeForm.district}
                  onChange={(e) => setJudgeForm({ ...judgeForm, district: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="Nashik">Nashik (Maharashtra)</option>
                  <option value="Ludhiana">Ludhiana (Punjab)</option>
                  <option value="Guntur">Guntur (Andhra Pradesh)</option>
                  <option value="Puri">Puri (Odisha)</option>
                  <option value="Thanjavur">Thanjavur (Tamil Nadu)</option>
                  <option value="Anand">Anand (Gujarat)</option>
                  <option value="Midnapore">Midnapore (West Bengal)</option>
                  <option value="Patna">Patna (Bihar)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Crop Type</label>
                <input
                  type="text"
                  value={judgeForm.crop_type}
                  onChange={(e) => setJudgeForm({ ...judgeForm, crop_type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Growth Stage</label>
                <select
                  value={judgeForm.crop_stage}
                  onChange={(e) => setJudgeForm({ ...judgeForm, crop_stage: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="Harvest-Ready">Harvest-Ready</option>
                  <option value="Flowering">Flowering</option>
                  <option value="Seedling">Seedling</option>
                  <option value="Tillering">Tillering</option>
                  <option value="Vegetative">Vegetative</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Preferred Language</label>
                <select
                  value={judgeForm.language}
                  onChange={(e) => setJudgeForm({ ...judgeForm, language: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="hi">हिंदी (Hindi)</option>
                  <option value="en">English</option>
                  <option value="or">ଓଡ଼ିଆ (Odia)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingJudge(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
              >
                {isSubmitting ? 'Saving...' : 'Save Test Profile'}
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Search */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search farmers by name, crop, region, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto border border-slate-800 rounded-xl">
              {filteredFarmers.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-3">
                  <p className="text-xs">No farmers found in the database.</p>
                  <button
                    onClick={handleResetSeeds}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all"
                  >
                    Seed Default 8 Regional Farmers
                  </button>
                </div>
              ) : (
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider sticky top-0 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Farmer</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Region</th>
                      <th className="p-3">Crop & Stage</th>
                      <th className="p-3">Language</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredFarmers.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-3 font-medium text-white">{f.name}</td>
                        <td className="p-3 font-mono">
                          {editingId === f.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={editPhone}
                                onChange={(e) => setEditPhone(e.target.value)}
                                className="w-32 bg-slate-900 border border-indigo-500 rounded px-2 py-0.5 text-xs text-white font-mono"
                              />
                              <button
                                onClick={() => handleSavePhone(f.id)}
                                className="p-1 rounded bg-indigo-600 text-white"
                              >
                                <Save className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <span
                              onClick={() => handleStartEdit(f)}
                              className="cursor-pointer hover:text-indigo-400 flex items-center gap-1 group"
                            >
                              <span>{f.phone}</span>
                              <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 text-slate-500" />
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-400">{f.district}</td>
                        <td className="p-3">
                          <span className="text-white font-medium">{f.crop_type}</span>
                          <span className="text-slate-400 block text-[10px]">{f.crop_stage}</span>
                        </td>
                        <td className="p-3 text-slate-400">{f.language.toUpperCase()}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              onSelectFarmerForAdvisory(f);
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 border border-slate-800 text-xs font-medium cursor-pointer"
                          >
                            Select
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
