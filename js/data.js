import defaultPreferences from '../content/preferences.json';

const workoutModules = import.meta.glob('../content/workouts/*.json', { eager: true });
const bookendModules = import.meta.glob('../content/bookends/*.json', { eager: true });
const dayModules = import.meta.glob('../content/days/*.json', { eager: true });

let cachedWorkoutDays = null;
let cachedBookends = null;

export function loadWorkoutDays() {
  if (cachedWorkoutDays) return cachedWorkoutDays;
  const days = Object.values(dayModules).map((mod) => mod.default);
  cachedWorkoutDays = Object.values(workoutModules).map((mod) => {
    const workout = mod.default;
    const day = days.find((d) => d.name === workout.name);
    return { ...workout, slug: day?.slug || '' };
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
