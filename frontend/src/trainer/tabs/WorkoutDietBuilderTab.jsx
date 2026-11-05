import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function WorkoutDietBuilderTab({ trainer }) {
  const [roster, setRoster] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [templates, setTemplates] = useState({ workoutTemplates: [], dietTemplates: [] });
  const [activeSubTab, setActiveSubTab] = useState('predefined'); // 'predefined' | 'custom' | 'active_program' | 'diet'
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [notification, setNotification] = useState(null);

  // Active program of selected client
  const [activeClientProgram, setActiveClientProgram] = useState(null);
  const [loadingActiveProgram, setLoadingActiveProgram] = useState(false);

  // Custom Program Editor State
  const [customWorkout, setCustomWorkout] = useState({
    title: 'Custom Hypertrophy Split',
    category: 'Hypertrophy / Muscle Building',
    targetDays: 4,
    estimatedDuration: 60,
    coachingNotes: '',
    exercises: [
      { name: 'Incline Dumbbell Bench Press', category: 'Chest', target_sets: 4, target_reps: '8-10 reps', rest_seconds: 75, form_cues: 'Retract scapula, slow 3s eccentric' },
      { name: 'Flat Barbell Bench Press', category: 'Chest', target_sets: 4, target_reps: '6-8 reps', rest_seconds: 90, form_cues: 'Drive feet into floor, bar touches lower sternum' },
      { name: 'Chest-Supported Machine Row', category: 'Upper Back', target_sets: 4, target_reps: '10-12 reps', rest_seconds: 60, form_cues: 'Zero lumbar swing, squeeze scapula' }
    ]
  });

  // Load clients and master templates
  useEffect(() => {
    async function loadData() {
      if (!trainer?.id) return;
      try {
        const [rosterRes, templatesRes] = await Promise.all([
          api.getTrainerRoster(trainer.id),
          api.getTemplates()
        ]);
        setRoster(rosterRes.roster || []);
        if (rosterRes.roster?.length > 0) {
          setSelectedMemberId(rosterRes.roster[0].id);
        }
        setTemplates(templatesRes);
        if (templatesRes.workoutTemplates?.length > 0) {
          setSelectedTemplateId(templatesRes.workoutTemplates[0].id);
        }
      } catch (err) {
        console.error('Failed to load builder templates:', err);
      }
    }
    loadData();
  }, [trainer?.id]);

  // Load active program whenever selected member changes
  useEffect(() => {
    async function loadClientProgram() {
      if (!selectedMemberId) return;
      setLoadingActiveProgram(true);
      try {
        const data = await api.getMemberActiveProgram(selectedMemberId);
        setActiveClientProgram(data);
      } catch (err) {
        console.error('Failed to load active program:', err);
      } finally {
        setLoadingActiveProgram(false);
      }
    }
    loadClientProgram();
  }, [selectedMemberId]);

  const selectedMember = roster.find((m) => m.id === selectedMemberId);

  // Active predefined template
  const activeTemplate = templates.workoutTemplates.find((t) => t.id === selectedTemplateId);
  const activeDietTemplate = templates.dietTemplates.find((t) => t.id === selectedTemplateId) || templates.dietTemplates[0];

  // 1-Click Fast Clone of Predefined Template
  const handleFastClone = async (template) => {
    if (!selectedMemberId) {
      alert('Please select an assigned client first.');
      return;
    }
    setIsAssigning(true);
    setNotification(null);
    try {
      const res = await api.assignWorkoutTemplate({
        trainerId: trainer.id,
        memberId: selectedMemberId,
        templateId: template.id,
        customNotes: `Cloned verbatim from master template "${template.title}"`
      });
      setNotification({
        type: 'success',
        message: res.message || `Predefined program "${template.title}" cloned to ${selectedMember.name}!`
      });
      // Refresh active program
      const updated = await api.getMemberActiveProgram(selectedMemberId);
      setActiveClientProgram(updated);
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to clone program.' });
    } finally {
      setIsAssigning(false);
    }
  };

  // Clone into Editor for Customization
  const handleCloneAndCustomize = (template) => {
    setCustomWorkout({
      title: `${template.title} (Tailored for ${selectedMember?.name?.split(' ')[0] || 'Client'})`,
      category: template.category,
      targetDays: template.target_days || 4,
      estimatedDuration: 60,
      coachingNotes: template.description || '',
      exercises: template.exercises.map((ex) => ({
        name: ex.name,
        category: ex.category || template.category,
        target_sets: ex.target_sets || 4,
        target_reps: ex.target_reps || '8-12 reps',
        rest_seconds: ex.rest_seconds || 60,
        form_cues: ex.form_cues || 'Strict form'
      }))
    });
    setActiveSubTab('custom');
    setNotification({
      type: 'info',
      message: `Template "${template.title}" loaded into editor! Adjust exercises, sets, reps, or cues below, then save.`
    });
  };

  // Start from scratch
  const handleStartFromScratch = () => {
    setCustomWorkout({
      title: `Custom Routine for ${selectedMember?.name?.split(' ')[0] || 'Client'}`,
      category: 'Hypertrophy / Strength',
      targetDays: 4,
      estimatedDuration: 60,
      coachingNotes: '',
      exercises: [
        { name: 'Barbell Flat Bench Press', category: 'Chest', target_sets: 4, target_reps: '8-10 reps', rest_seconds: 90, form_cues: 'Retract scapula, 3-point contact' },
        { name: 'Incline Dumbbell Press', category: 'Chest', target_sets: 3, target_reps: '10-12 reps', rest_seconds: 75, form_cues: 'Full stretch at bottom' }
      ]
    });
    setActiveSubTab('custom');
  };

  // Exercise table handlers in custom editor
  const handleAddExerciseRow = () => {
    setCustomWorkout((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          name: 'New Exercise',
          category: prev.category || 'General',
          target_sets: 3,
          target_reps: '10-12 reps',
          rest_seconds: 60,
          form_cues: 'Controlled tempo'
        }
      ]
    }));
  };

  const handleUpdateExerciseRow = (index, field, value) => {
    setCustomWorkout((prev) => {
      const updated = [...prev.exercises];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, exercises: updated };
    });
  };

  const handleDeleteExerciseRow = (index) => {
    setCustomWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, idx) => idx !== index)
    }));
  };

  // Save Custom Workout Program
  const handleSaveCustomWorkout = async () => {
    if (!selectedMemberId) {
      alert('Please select an assigned client.');
      return;
    }
    if (!customWorkout.title) {
      alert('Please provide a Program Title.');
      return;
    }
    if (customWorkout.exercises.length === 0) {
      alert('Please add at least one exercise to the routine.');
      return;
    }

    setIsAssigning(true);
    setNotification(null);
    try {
      const res = await api.saveCustomWorkoutProgram({
        trainerId: trainer.id,
        memberId: selectedMemberId,
        programTitle: customWorkout.title,
        splitCategory: customWorkout.category,
        targetDays: customWorkout.targetDays,
        estimatedDuration: customWorkout.estimatedDuration,
        coachingNotes: customWorkout.coachingNotes,
        exercises: customWorkout.exercises
      });

      setNotification({
        type: 'success',
        message: res.message || `Custom program saved & assigned to ${selectedMember.name}!`
      });

      // Refresh active program
      const updated = await api.getMemberActiveProgram(selectedMemberId);
      setActiveClientProgram(updated);
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to save custom program.' });
    } finally {
      setIsAssigning(false);
    }
  };

  // Clone Diet Template
  const handleAssignDiet = async (template) => {
    if (!selectedMemberId) {
      alert('Please select an assigned client first.');
      return;
    }
    setIsAssigning(true);
    setNotification(null);
    try {
      const res = await api.assignDietTemplate({
        trainerId: trainer.id,
        memberId: selectedMemberId,
        templateId: template.id,
        customNotes: `Assigned blueprint ${template.title}`
      });
      setNotification({
        type: 'success',
        message: res.message || `Diet blueprint assigned to ${selectedMember.name}!`
      });
      // Refresh active program
      const updated = await api.getMemberActiveProgram(selectedMemberId);
      setActiveClientProgram(updated);
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to assign diet blueprint.' });
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-[#101726] border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3 sm:gap-3.5 w-full md:w-auto">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 font-black text-xl sm:text-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            🏋️
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                Client Workout & Diet Program Hub
              </h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-lg font-mono font-bold uppercase tracking-wider border border-emerald-500/30 whitespace-nowrap inline-flex items-center shrink-0">
                Floor Coach Mode
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Choose from pre-defined master programs, customize them, or build personalized training splits from scratch.
            </p>
          </div>
        </div>

        {/* 4 Mode Buttons */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 bg-slate-950/90 p-1.5 rounded-2xl border border-slate-800 w-full md:w-auto">
          <button
            onClick={() => { setActiveSubTab('predefined'); setNotification(null); }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-center justify-center flex items-center gap-1.5 ${
              activeSubTab === 'predefined'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>📚</span>
            <span>Predefined Splits</span>
          </button>

          <button
            onClick={() => { setActiveSubTab('custom'); setNotification(null); }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-center justify-center flex items-center gap-1.5 ${
              activeSubTab === 'custom'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>✏️</span>
            <span>Custom Editor</span>
          </button>

          <button
            onClick={() => { setActiveSubTab('active_program'); setNotification(null); }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-center justify-center flex items-center gap-1.5 ${
              activeSubTab === 'active_program'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>🎯</span>
            <span>Active Routine</span>
          </button>

          <button
            onClick={() => { setActiveSubTab('diet'); setNotification(null); }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-center justify-center flex items-center gap-1.5 ${
              activeSubTab === 'diet'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>🥗</span>
            <span>Nutrition Plans</span>
          </button>
        </div>
      </div>

      {/* Target Assigned Client Selector Bar */}
      <div className="bg-[#101726] border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div className="flex-1 w-full md:w-auto">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <span>👤 Select Assigned Client to Assign / Customize Program:</span>
          </label>
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white font-bold focus:outline-none focus:border-emerald-500 transition-all"
          >
            {roster.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.member_code}) — {m.fitness_goals || 'General Fitness'} — PT Balance: {m.pt_sessions_remaining || 0}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Client Overview Chip */}
        {selectedMember && (
          <div className="w-full md:w-auto p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs flex flex-col gap-1 min-w-[280px]">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">Goal:</span>
              <span className="font-bold text-white">{selectedMember.fitness_goals}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">Health Status:</span>
              <span className={`font-bold ${selectedMember.medical_flags?.toLowerCase() !== 'none' ? 'text-amber-400' : 'text-emerald-400'}`}>
                {selectedMember.medical_flags?.toLowerCase() !== 'none' ? `⚠️ ${selectedMember.medical_flags}` : '✅ Cleared for Progressive Load'}
              </span>
            </div>
            {activeClientProgram?.routine && (
              <div className="text-[10px] text-cyan-300 font-mono pt-1 border-t border-slate-800">
                Active: "{activeClientProgram.routine.routine_title}" ({activeClientProgram.routine.exercises?.length || 0} exercises)
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between gap-2 shadow-lg animate-fadeIn ${
            notification.type === 'success'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : notification.type === 'info'
              ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
              : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{notification.type === 'success' ? '🎉' : notification.type === 'info' ? 'ℹ️' : '⚠️'}</span>
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 1: PREDEFINED MASTER PROGRAMS */}
      {/* ========================================================================= */}
      {activeSubTab === 'predefined' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>📚 Predefined Master Training Programs</span>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20 whitespace-nowrap shrink-0">
                  {templates.workoutTemplates.length} Splits
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Standard periodized splits curated for muscle building, strength foundation, and fat loss circuits.
              </p>
            </div>

            <button
              onClick={handleStartFromScratch}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0"
            >
              <span>➕</span>
              <span>Create Custom from Scratch</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.workoutTemplates.map((t) => {
              const isSelected = selectedTemplateId === t.id;
              return (
                <div
                  key={t.id}
                  className={`bg-[#101726] border rounded-3xl p-5 flex flex-col justify-between transition-all ${
                    isSelected ? 'border-emerald-500/60 shadow-xl shadow-emerald-500/10' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-sm text-white flex items-center gap-2">
                          <span>{t.title}</span>
                        </h4>
                        <span className="text-[10px] font-mono font-bold text-cyan-300 mt-0.5 block">
                          {t.category} • {t.difficulty}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20 whitespace-nowrap">
                        {t.target_days} Days / Wk
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      {t.description}
                    </p>

                    {/* Exercise Preview List */}
                    <div className="mt-3.5 space-y-1.5 bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80">
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between mb-1">
                        <span>Movement Lineup:</span>
                        <span className="text-emerald-400 font-mono">{t.exercises?.length} exercises</span>
                      </div>
                      {t.exercises?.slice(0, 4).map((ex, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-slate-300">
                          <span className="truncate max-w-[200px]">{idx + 1}. {ex.name}</span>
                          <span className="font-mono text-cyan-400 text-[11px] shrink-0">{ex.target_sets} × {ex.target_reps}</span>
                        </div>
                      ))}
                      {t.exercises?.length > 4 && (
                        <p className="text-[10px] text-slate-500 pt-1 italic">
                          + {t.exercises.length - 4} more exercises (view in editor)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Dual Action Buttons (Mobile Stacked, Tablet/Desktop Side-by-Side) */}
                  <div className="mt-4 pt-3.5 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    {/* 1. Fast 1-Click Clone Button */}
                    <button
                      type="button"
                      disabled={isAssigning}
                      onClick={() => handleFastClone(t)}
                      className="flex-1 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                      title="Instantly clones and assigns this template verbatim to the client"
                    >
                      <span>⚡</span>
                      <span>1-Click Assign to {selectedMember?.name?.split(' ')[0] || 'Client'}</span>
                    </button>

                    {/* 2. Clone & Customize Button */}
                    <button
                      type="button"
                      onClick={() => handleCloneAndCustomize(t)}
                      className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
                      title="Load into visual editor to adjust exercises, sets, reps, and form cues"
                    >
                      <span>✏️</span>
                      <span>Clone & Customize</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: CUSTOM SPLIT EDITOR (CLONE OR FROM SCRATCH) */}
      {/* ========================================================================= */}
      {activeSubTab === 'custom' && (
        <div className="bg-[#101726] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  ✏️ Interactive Program Customizer & Builder
                </h3>
                <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-lg border border-cyan-500/30 whitespace-nowrap shrink-0">
                  Target: {selectedMember?.name || 'Selected Client'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Add, remove, and adjust exercises, sets, reps, rest intervals, and coaching form cues before assigning.
              </p>
            </div>

            <button
              onClick={() => setActiveSubTab('predefined')}
              className="text-xs text-slate-400 hover:text-emerald-400 underline font-semibold"
            >
              ← Back to Predefined Programs
            </button>
          </div>

          {/* Program Header Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Program Title *
              </label>
              <input
                type="text"
                value={customWorkout.title}
                onChange={(e) => setCustomWorkout({ ...customWorkout, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Split Category
              </label>
              <input
                type="text"
                value={customWorkout.category}
                onChange={(e) => setCustomWorkout({ ...customWorkout, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Frequency (Days / Wk)
              </label>
              <input
                type="number"
                min={1}
                max={7}
                value={customWorkout.targetDays}
                onChange={(e) => setCustomWorkout({ ...customWorkout, targetDays: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Estimated Duration
              </label>
              <input
                type="number"
                value={customWorkout.estimatedDuration}
                onChange={(e) => setCustomWorkout({ ...customWorkout, estimatedDuration: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Coach Special Instructions */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Coaching Notes & Client Form Directives
            </label>
            <input
              type="text"
              value={customWorkout.coachingNotes}
              onChange={(e) => setCustomWorkout({ ...customWorkout, coachingNotes: e.target.value })}
              placeholder="E.g., Client has L4-L5 lumbar sensitivity: maintain braced core, do not round back on rows."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Exercises Interactive Cards List (Mobile & Tablet First) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <span>📋 Exercise Routine Lineup ({customWorkout.exercises.length} Movements)</span>
                </h4>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Adjust sets, reps, rest seconds, and technique form cues for each movement.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddExerciseRow}
                className="px-3.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <span>➕</span>
                <span>Add Movement</span>
              </button>
            </div>

            {/* Exercise Cards Stack */}
            <div className="space-y-3">
              {customWorkout.exercises.map((ex, index) => (
                <div
                  key={index}
                  className="p-3.5 sm:p-4 rounded-2xl bg-[#0b101c] border border-slate-800/90 hover:border-slate-700 transition-all shadow-md space-y-3"
                >
                  {/* Card Top: Exercise Number, Name Input, Delete Button */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-black text-xs flex items-center justify-center shrink-0">
                        #{index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={ex.name}
                          onChange={(e) => handleUpdateExerciseRow(index, 'name', e.target.value)}
                          placeholder="Exercise Name (e.g. Incline DB Bench Press)"
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-bold focus:outline-none focus:border-emerald-500 transition-all placeholder-slate-600"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteExerciseRow(index)}
                      className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/60 transition shrink-0 cursor-pointer"
                      title="Remove Exercise"
                    >
                      🗑️
                    </button>
                  </div>

                  {/* Card Middle: Target Muscle & Scheme Inputs (Sets, Reps, Rest) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* Muscle */}
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Target Muscle
                      </label>
                      <input
                        type="text"
                        value={ex.category}
                        onChange={(e) => handleUpdateExerciseRow(index, 'category', e.target.value)}
                        placeholder="e.g. Chest / Back / Quads"
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Sets */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Target Sets
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={ex.target_sets}
                        onChange={(e) => handleUpdateExerciseRow(index, 'target_sets', Number(e.target.value))}
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono text-center font-bold focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Reps */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Target Reps
                      </label>
                      <input
                        type="text"
                        value={ex.target_reps}
                        onChange={(e) => handleUpdateExerciseRow(index, 'target_reps', e.target.value)}
                        placeholder="8-10 reps"
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-cyan-300 font-mono text-center font-bold focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Rest */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Rest (Seconds)
                      </label>
                      <input
                        type="number"
                        step={15}
                        min={0}
                        value={ex.rest_seconds}
                        onChange={(e) => handleUpdateExerciseRow(index, 'rest_seconds', Number(e.target.value))}
                        placeholder="60"
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 font-mono text-center focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Card Bottom: Form Cues & Coaching Advice */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Coaching Form Cue & Safety Directives
                    </label>
                    <input
                      type="text"
                      value={ex.form_cues}
                      onChange={(e) => handleUpdateExerciseRow(index, 'form_cues', e.target.value)}
                      placeholder="e.g. Scapular retraction, slow 3s eccentric cadence, avoid full lockout"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-emerald-300/90 italic focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Add Movement Button at bottom of cards list */}
            <button
              type="button"
              onClick={handleAddExerciseRow}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-800 hover:border-emerald-500/40 text-slate-400 hover:text-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-2 bg-slate-950/40 hover:bg-emerald-500/5 cursor-pointer"
            >
              <span>➕ Add Another Movement to Split</span>
            </button>
          </div>

          {/* Action Bar */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-400">
              💡 When saved, {selectedMember?.name || 'the client'} will see this program updated immediately in App 2.
            </p>

            <button
              type="button"
              disabled={isAssigning}
              onClick={handleSaveCustomWorkout}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isAssigning ? 'Saving Program...' : `💾 Save & Assign Program to ${selectedMember?.name || 'Client'}`}</span>
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: CLIENT'S ACTIVE PROGRAM VIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'active_program' && (
        <div className="bg-[#101726] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>🎯 Current Active Routine for {selectedMember?.name || 'Client'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Live routine currently visible to the member in App 2
              </p>
            </div>

            {activeClientProgram?.routine && (
              <button
                onClick={() => {
                  setCustomWorkout({
                    title: activeClientProgram.routine.routine_title,
                    category: activeClientProgram.routine.target_muscle_groups || 'General',
                    targetDays: 4,
                    estimatedDuration: activeClientProgram.routine.estimated_duration_min || 60,
                    coachingNotes: '',
                    exercises: (activeClientProgram.routine.exercises || []).map((ex) => ({
                      name: ex.exercise_name,
                      category: ex.category,
                      target_sets: ex.target_sets,
                      target_reps: ex.target_reps,
                      rest_seconds: ex.rest_seconds,
                      form_cues: ex.previous_pr || 'Strict form'
                    }))
                  });
                  setActiveSubTab('custom');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all"
              >
                <span>✏️</span>
                <span>Edit This Active Routine in Editor</span>
              </button>
            )}
          </div>

          {loadingActiveProgram ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading active client program...</div>
          ) : !activeClientProgram?.routine ? (
            <div className="py-8 text-center text-xs text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800">
              No active workout routine currently assigned to {selectedMember?.name}. Choose a Predefined Program above to assign one!
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-base font-bold text-white">{activeClientProgram.routine.routine_title}</h4>
                  <p className="text-xs text-emerald-400 font-medium mt-0.5">
                    Assigned by: {activeClientProgram.routine.assigned_by_trainer || 'Coach'} • Focus: {activeClientProgram.routine.target_muscle_groups}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-300 bg-slate-800 px-3 py-1 rounded-xl border border-slate-700 shrink-0">
                  {activeClientProgram.routine.estimated_duration_min} mins
                </span>
              </div>

              <div className="space-y-2.5">
                {activeClientProgram.routine.exercises?.map((ex, idx) => (
                  <div
                    key={ex.id || idx}
                    className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs hover:border-slate-700 transition-all"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-white text-sm">{ex.exercise_name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-medium">
                          {ex.category}
                        </span>
                      </div>
                      {ex.previous_pr && (
                        <div className="text-[11px] text-emerald-300 italic pl-8">
                          💡 Form Cue: {ex.previous_pr}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center font-mono">
                      <span className="px-2.5 py-1 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold text-xs">
                        {ex.target_sets} sets × {ex.target_reps}
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-slate-900 text-slate-400 border border-slate-800 text-xs">
                        {ex.rest_seconds}s rest
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 4: NUTRITION & DIET BLUEPRINTS */}
      {/* ========================================================================= */}
      {activeSubTab === 'diet' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>🥗 South Indian Nutrition Master Blueprints</span>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20 whitespace-nowrap shrink-0">
                  {templates.dietTemplates.length} Master Diets
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Calibrated macronutrient plans with authentic South Indian high-protein foods (eggs, chicken, curd, sundal, paneer, whey).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.dietTemplates.map((d) => (
              <div
                key={d.id}
                className="bg-[#101726] border border-slate-800 rounded-3xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-white">{d.title}</h4>
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-xl border border-amber-500/20">
                      {d.calories} kcal
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                    {d.description}
                  </p>

                  {/* Macro Pills */}
                  <div className="grid grid-cols-3 gap-1.5 my-3 text-center text-[10px] font-mono">
                    <div className="bg-slate-900 p-1.5 rounded-lg border border-cyan-500/20">
                      <span className="text-cyan-400 font-bold block">{d.protein}g</span>
                      <span className="text-slate-500">Protein</span>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded-lg border border-amber-500/20">
                      <span className="text-amber-400 font-bold block">{d.carbs}g</span>
                      <span className="text-slate-500">Carbs</span>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded-lg border border-rose-500/20">
                      <span className="text-rose-400 font-bold block">{d.fats}g</span>
                      <span className="text-slate-500">Fats</span>
                    </div>
                  </div>

                  {/* Meals Schedule Preview */}
                  <div className="space-y-1 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-[11px]">
                    {d.meals?.slice(0, 3).map((m, idx) => (
                      <div key={idx} className="flex items-center justify-between text-slate-300">
                        <span className="truncate max-w-[140px] font-medium">{m.name}</span>
                        <span className="text-emerald-400 font-mono text-[10px]">{m.time}</span>
                      </div>
                    ))}
                    {d.meals?.length > 3 && (
                      <p className="text-[10px] text-slate-500 italic pt-0.5">+ {d.meals.length - 3} more meals</p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isAssigning}
                  onClick={() => handleAssignDiet(d)}
                  className="mt-4 w-full py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <span>🥗</span>
                  <span>1-Click Assign Diet to {selectedMember?.name?.split(' ')[0] || 'Client'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
