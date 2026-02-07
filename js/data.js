import defaultPreferences from '../content/preferences.json';

const workoutModules = import.meta.glob('../content/workouts/*.json', { eager: true });
const bookendModules = import.meta.glob('../content/bookends/*.json', { eager: true });
const dayModules = import.meta.glob('../content/days/*.json', { eager: true });

let cachedWorkoutDays = null;
let cachedBookends = null;

export function loadWorkoutDays() {
  if (cachedWorkoutDays) return cachedWorkoutDays;

  const days = Object.values(dayModules).map((mod) => mod.default);

  cachedWorkoutDays = Object.values(workoutModules)
    .map((mod) => {
      const workout = mod.default;
      const day = days.find((d) => d.name === workout.name);
      const order = Number.isFinite(day?.order) ? day.order : workout.order;
      return { ...workout, slug: day?.slug || '', order };
    })
    .sort((a, b) => {
      const ao = Number.isFinite(a.order) ? a.order : Number.POSITIVE_INFINITY;
      const bo = Number.isFinite(b.order) ? b.order : Number.POSITIVE_INFINITY;
      if (ao !== bo) return ao - bo;
      return String(a.name || '').localeCompare(String(b.name || ''));
    });

  return cachedWorkoutDays;
}

export function loadBookends() {
  if (cachedBookends) return cachedBookends;
  cachedBookends = Object.values(bookendModules).map((mod) => mod.default);
  return cachedBookends;
}

export function loadBookendByName(name) {
  return loadBookends().find((b) => b.name === name) || null;
}

export function loadPreferences() {
  return { ...defaultPreferences };
}

export function loadCompletedWorkouts() {
  return JSON.parse(localStorage.getItem('completedWorkouts')) || [];
}
