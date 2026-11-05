import React, { useState, useEffect } from 'react';
import { 
  UtensilsCrossed, 
  CheckCircle2, 
  Circle, 
  Flame, 
  Droplets, 
  Sparkles, 
  Clock, 
  Plus, 
  Minus,
  Apple,
  Award
} from 'lucide-react';
import { api } from '../services/api';
import { useMemberAuth } from './MemberAuthContext';

export default function DietMealTracker() {
  const { member } = useMemberAuth();
  const [dietPlan, setDietPlan] = useState(null);
  const [meals, setMeals] = useState([]);
  const [consumed, setConsumed] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });
  const [waterGlasses, setWaterGlasses] = useState(8); // 8 glasses * 250ml = 2.0L
  const [isLoading, setIsLoading] = useState(true);

  const fetchDietData = async () => {
    if (!member) return;
    try {
      setIsLoading(true);
      const data = await api.getClientDiet(member.id);
      setDietPlan(data.dietPlan);
      setMeals(data.meals || []);
      setConsumed(data.consumed || { calories: 0, protein: 0, carbs: 0, fats: 0 });
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch diet:', err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDietData();
  }, [member?.id]);

  const handleToggleMeal = async (meal) => {
    const nextState = meal.is_eaten === 1 ? 0 : 1;
    // Optimistic UI update
    const updatedMeals = meals.map(m => m.id === meal.id ? { ...m, is_eaten: nextState } : m);
    setMeals(updatedMeals);

    // Recalculate consumed macros
    const eaten = updatedMeals.filter(m => m.is_eaten === 1);
    setConsumed({
      calories: eaten.reduce((s, m) => s + m.calories, 0),
      protein: eaten.reduce((s, m) => s + m.protein_grams, 0),
      carbs: eaten.reduce((s, m) => s + m.carbs_grams, 0),
      fats: eaten.reduce((s, m) => s + m.fats_grams, 0)
    });

    try {
      await api.toggleMealEaten(meal.id, nextState);
    } catch (err) {
      console.error('Failed to update meal status:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-400">
        <UtensilsCrossed className="w-8 h-8 mx-auto animate-bounce text-emerald-400 mb-2" />
        <p className="text-xs">Loading nutrition targets & meal schedule...</p>
      </div>
    );
  }

  const calorieTarget = dietPlan?.daily_calories || 2400;
  const proteinTarget = dietPlan?.protein_grams || 160;
  const carbsTarget = dietPlan?.carbs_grams || 260;
  const fatsTarget = dietPlan?.fats_grams || 65;

  const calPercent = Math.min(100, Math.round((consumed.calories / calorieTarget) * 100));
  const proteinPercent = Math.min(100, Math.round((consumed.protein / proteinTarget) * 100));
  const carbsPercent = Math.min(100, Math.round((consumed.carbs / carbsTarget) * 100));
  const fatsPercent = Math.min(100, Math.round((consumed.fats / fatsTarget) * 100));

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Plan Header Card */}
      <div className="bg-gradient-to-br from-[#162130] via-[#101826] to-[#0d131f] border border-emerald-500/30 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {dietPlan?.diet_type || 'Gudiyatham High-Protein Plan'}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Daily Goal
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-3">
          <div>
            <h2 className="text-3xl font-black text-white font-mono tracking-tight">
              {consumed.calories} <span className="text-sm font-normal text-slate-400">/ {calorieTarget} kcal</span>
            </h2>
            <p className="text-xs text-emerald-400 font-semibold mt-0.5">{calPercent}% of daily energy target met</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-300 font-mono">
              {meals.filter(m => m.is_eaten === 1).length} / {meals.length}
            </span>
            <p className="text-[10px] text-slate-400 uppercase">Meals Eaten</p>
          </div>
        </div>

        {/* Calorie Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-2.5 mt-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${calPercent}%` }}
          />
        </div>
      </div>

      {/* Macro Split Progress Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Protein */}
        <div className="bg-[#121926] border border-slate-800 rounded-2xl p-3 text-center shadow-md">
          <span className="text-[10px] font-bold uppercase text-emerald-400">Protein</span>
          <p className="text-base font-black text-white font-mono mt-0.5">
            {consumed.protein}g
          </p>
          <p className="text-[10px] text-slate-400">Target: {proteinTarget}g</p>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${proteinPercent}%` }} />
          </div>
          <span className="text-[9px] text-emerald-400 font-bold block mt-1">{proteinPercent}%</span>
        </div>

        {/* Carbs */}
        <div className="bg-[#121926] border border-slate-800 rounded-2xl p-3 text-center shadow-md">
          <span className="text-[10px] font-bold uppercase text-amber-400">Carbs</span>
          <p className="text-base font-black text-white font-mono mt-0.5">
            {consumed.carbs}g
          </p>
          <p className="text-[10px] text-slate-400">Target: {carbsTarget}g</p>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${carbsPercent}%` }} />
          </div>
          <span className="text-[9px] text-amber-400 font-bold block mt-1">{carbsPercent}%</span>
        </div>

        {/* Fats */}
        <div className="bg-[#121926] border border-slate-800 rounded-2xl p-3 text-center shadow-md">
          <span className="text-[10px] font-bold uppercase text-rose-400">Fats</span>
          <p className="text-base font-black text-white font-mono mt-0.5">
            {consumed.fats}g
          </p>
          <p className="text-[10px] text-slate-400">Target: {fatsTarget}g</p>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: `${fatsPercent}%` }} />
          </div>
          <span className="text-[9px] text-rose-400 font-bold block mt-1">{fatsPercent}%</span>
        </div>
      </div>

      {/* Hydration Tracker */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              Water Intake: {(waterGlasses * 0.25).toFixed(1)}L <span className="text-slate-400 font-normal">/ {dietPlan?.water_liters || 3.5}L</span>
            </h4>
            <p className="text-[10px] text-slate-400">{waterGlasses} of 14 glasses completed</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setWaterGlasses(Math.max(0, waterGlasses - 1))}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center active:scale-95"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setWaterGlasses(waterGlasses + 1)}
            className="w-8 h-8 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 flex items-center justify-center border border-cyan-500/30 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scheduled Meal Timeline */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" /> Today's Meal Plan ({meals.length})
          </h3>
          <span className="text-[10px] text-slate-500">Tap check to log meal</span>
        </div>

        {meals.map((meal) => {
          const isEaten = meal.is_eaten === 1;

          return (
            <div
              key={meal.id}
              onClick={() => handleToggleMeal(meal)}
              className={`p-4 rounded-2xl border transition cursor-pointer select-none ${
                isEaten
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-[#121926] hover:bg-[#162132] border-slate-800'
              } flex items-start justify-between gap-3 shadow-md active:scale-98`}
            >
              <div className="flex items-start gap-3">
                <button
                  className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center transition ${
                    isEaten
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'border-2 border-slate-600 hover:border-emerald-400 text-transparent'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 fill-current" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-bold ${isEaten ? 'text-emerald-300 line-through' : 'text-white'}`}>
                      {meal.meal_name}
                    </h4>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {meal.time_hint}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {meal.food_items}
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-slate-400">
                    <span className="text-emerald-400 font-bold">{meal.calories} kcal</span>
                    <span>P: {meal.protein_grams}g</span>
                    <span>C: {meal.carbs_grams}g</span>
                    <span>F: {meal.fats_grams}g</span>
                  </div>
                </div>
              </div>

              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                isEaten
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {isEaten ? 'Done' : 'Pending'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

