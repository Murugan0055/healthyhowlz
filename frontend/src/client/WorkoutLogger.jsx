import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Flame, 
  Trophy, 
  Clock, 
  Plus, 
  Minus, 
  CheckCircle2, 
  ChevronRight, 
  TrendingUp, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw,
  Zap,
  Target
} from 'lucide-react';
import { api } from '../services/api';
import { useMemberAuth } from './MemberAuthContext';

export default function WorkoutLogger() {
  const { member } = useMemberAuth();
  const [routine, setRoutine] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active Logging Drawer State
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [setNumber, setSetNumber] = useState(1);
  const [weightKg, setWeightKg] = useState(30);
  const [reps, setReps] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastPrNotice, setLastPrNotice] = useState(null);

  // In-Gym Rest Timer State
  const [restDuration, setRestDuration] = useState(75);
  const [restRemaining, setRestRemaining] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const fetchWorkoutData = async () => {
    if (!member) return;
    try {
      setIsLoading(true);
      const data = await api.getClientWorkout(member.id);
      setRoutine(data.routine);
      setExercises(data.exercises || []);
      setRecentLogs(data.recentLogs || []);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch workout:', err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkoutData();
  }, [member?.id]);

  // Rest Timer loop
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && restRemaining > 0) {
      interval = setInterval(() => {
        setRestRemaining((prev) => prev - 1);
      }, 1000);
    } else if (restRemaining === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, restRemaining]);

  const startRestTimer = (seconds) => {
    setRestDuration(seconds);
    setRestRemaining(seconds);
    setIsTimerRunning(true);
  };

  const handleOpenLogModal = (exercise) => {
    setSelectedExercise(exercise);
    // Determine next set number from recent logs
    const loggedSets = recentLogs.filter(l => l.exercise_name === exercise.exercise_name);
    const nextSet = loggedSets.length + 1;
    setSetNumber(nextSet > 4 ? 4 : nextSet);

    // Initial weight parsed from PR or default
    if (exercise.previous_pr && exercise.previous_pr.includes('kg')) {
      const parsed = parseFloat(exercise.previous_pr.match(/\d+/)?.[0] || '30');
      setWeightKg(parsed);
    } else {
      setWeightKg(30);
    }
    setReps(10);
    setLastPrNotice(null);
  };

  const handleSubmitSet = async () => {
    if (!selectedExercise || !member) return;
    setIsSubmitting(true);
    try {
      const res = await api.logWorkoutSet({
        memberId: member.id,
        exerciseName: selectedExercise.exercise_name,
        setNumber,
        weightKg,
        reps
      });

      if (res.isPr) {
        setLastPrNotice({
          exercise: selectedExercise.exercise_name,
          weight: weightKg,
          reps
        });
      }

      // Add to recent logs state
      const newEntry = {
        id: res.logId,
        exercise_name: selectedExercise.exercise_name,
        set_number: setNumber,
        weight_kg: weightKg,
        reps,
        is_pr: res.isPr ? 1 : 0,
        logged_at: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };
      setRecentLogs([newEntry, ...recentLogs]);

      // Automatically trigger Rest Timer
      startRestTimer(selectedExercise.rest_seconds || 75);

      // Advance to next set or close modal
      if (setNumber < selectedExercise.target_sets) {
        setSetNumber(setNumber + 1);
      } else {
        setSelectedExercise(null);
      }
      setIsSubmitting(false);
    } catch (err) {
      alert('Failed to log set: ' + err.message);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-400">
        <Dumbbell className="w-8 h-8 mx-auto animate-bounce text-emerald-400 mb-2" />
        <p className="text-xs">Loading today's training split...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Today's Workout Split Banner */}
      <div className="bg-gradient-to-br from-[#162130] via-[#101826] to-[#0d131f] border border-emerald-500/30 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <Flame className="w-3 h-3 text-emerald-400" />
            {routine?.day_name || 'Today • Push Session'}
          </span>
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            ~{routine?.estimated_duration_min || 55} Mins
          </span>
        </div>

        <h2 className="text-lg font-black text-white brand-font tracking-wide">
          {routine?.routine_title || 'Chest, Shoulders & Triceps Hypertrophy'}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Designed by <strong className="text-emerald-400 font-semibold">{routine?.assigned_by_trainer || 'Coach Murugan S'}</strong>
        </p>

        {/* Muscle Focus Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {(routine?.target_muscle_groups || 'Pectorals, Anterior Delts, Triceps').split(',').map((tag, idx) => (
            <span key={idx} className="text-[10px] font-medium bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/60">
              {tag.trim()}
            </span>
          ))}
        </div>
      </div>

      {/* Floating Rest Timer Widget */}
      {restRemaining > 0 && (
        <div className="bg-slate-900/95 border-2 border-emerald-500/60 rounded-2xl p-3.5 shadow-2xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-sm font-mono">
              {restRemaining}s
            </div>
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" /> Rest Timer Running
              </p>
              <p className="text-[10px] text-slate-400">Catch your breath before next set</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setRestRemaining(0)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* PR Celebration Alert Banner */}
      {lastPrNotice && (
        <div className="bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-teal-500/20 border-2 border-amber-500/40 rounded-2xl p-4 shadow-xl text-center animate-fadeIn">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase mb-1">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> NEW PERSONAL RECORD!
          </div>
          <h4 className="text-sm font-black text-white mt-1">
            {lastPrNotice.exercise}
          </h4>
          <p className="text-xs text-amber-200 mt-0.5">
            Heavy lift logged: <strong className="text-white text-sm">{lastPrNotice.weight} kg</strong> for {lastPrNotice.reps} reps 🔥
          </p>
        </div>
      )}

      {/* Target Exercises List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-400" /> Assigned Exercises ({exercises.length})
          </h3>
          <span className="text-[10px] text-slate-500">Tap exercise to log set</span>
        </div>

        {exercises.map((ex, idx) => {
          const setsLogged = recentLogs.filter(l => l.exercise_name === ex.exercise_name).length;
          const isComplete = setsLogged >= ex.target_sets;

          return (
            <div
              key={ex.id || idx}
              onClick={() => handleOpenLogModal(ex)}
              className={`p-4 rounded-2xl border transition cursor-pointer select-none ${
                isComplete
                  ? 'bg-slate-900/60 border-emerald-500/30'
                  : 'bg-[#121926] hover:bg-[#162132] border-slate-800'
              } flex items-center justify-between gap-3 shadow-md active:scale-98`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                  isComplete
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {isComplete ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">
                    {ex.exercise_name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <span className="text-slate-300 font-medium">{ex.target_sets} Sets × {ex.target_reps}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-mono">Rest: {ex.rest_seconds || 60}s</span>
                  </div>
                  {ex.previous_pr && (
                    <div className="flex items-center gap-1 text-[10px] text-amber-300 mt-1">
                      <Trophy className="w-3 h-3 text-amber-400" />
                      <span>Best PR: {ex.previous_pr}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {setsLogged}/{ex.target_sets}
                  </span>
                  <p className="text-[9px] text-slate-500 uppercase">Sets Done</p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Set Logger Modal / Drawer */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-[#121927] border border-slate-700/80 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Log In-Gym Set</span>
                <h3 className="text-base font-black text-white">{selectedExercise.exercise_name}</h3>
              </div>
              <button
                onClick={() => setSelectedExercise(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Set Selector Tabs */}
            <div className="flex items-center justify-between gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              {[1, 2, 3, 4].map((s) => (
                <button
                  key={s}
                  onClick={() => setSetNumber(s)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    setNumber === s
                      ? 'bg-emerald-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Set {s}
                </button>
              ))}
            </div>

            {/* Weight Adjustment Stepper */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-semibold">Weight Lifted (KG)</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setWeightKg(Math.max(0, weightKg - 2.5))}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                  >
                    -2.5
                  </button>
                  <button
                    onClick={() => setWeightKg(weightKg + 2.5)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                  >
                    +2.5
                  </button>
                  <button
                    onClick={() => setWeightKg(weightKg + 5)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                  >
                    +5
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => setWeightKg(Math.max(0, weightKg - 1))}
                  className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-lg active:scale-95"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <div className="text-center flex-1">
                  <span className="text-3xl font-black text-white font-mono">{weightKg}</span>
                  <span className="text-xs text-slate-400 font-bold ml-1">kg</span>
                </div>
                <button
                  onClick={() => setWeightKg(weightKg + 1)}
                  className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-lg active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Reps Adjustment Stepper */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5">
              <span className="text-xs text-slate-400 font-semibold block mb-2">Reps Completed</span>
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => setReps(Math.max(1, reps - 1))}
                  className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-lg active:scale-95"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <div className="text-center flex-1">
                  <span className="text-3xl font-black text-white font-mono">{reps}</span>
                  <span className="text-xs text-slate-400 font-bold ml-1">reps</span>
                </div>
                <button
                  onClick={() => setReps(reps + 1)}
                  className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-lg active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Submit Set Button */}
            <button
              onClick={handleSubmitSet}
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition"
            >
              <Zap className="w-4 h-4 fill-current" />
              {isSubmitting ? 'Logging...' : `Log Set ${setNumber} (${weightKg}kg × ${reps} reps)`}
            </button>
          </div>
        </div>
      )}

      {/* Recent Logs Activity Feed */}
      {recentLogs.length > 0 && (
        <div className="space-y-2 mt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Today's Logged Sets
          </h3>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl divide-y divide-slate-800/80">
            {recentLogs.slice(0, 5).map((log, idx) => (
              <div key={log.id || idx} className="p-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{log.exercise_name}</span>
                    {log.is_pr === 1 && (
                      <span className="text-[9px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/40">
                        PR
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">Set {log.set_number}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-400">{log.weight_kg}kg × {log.reps} reps</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

