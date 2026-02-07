import "../css/style.css"
import { loadWorkoutDays, loadCompletedWorkouts } from './data.js'

const workoutDays = await loadWorkoutDays();
const completedWorkouts = loadCompletedWorkouts();
