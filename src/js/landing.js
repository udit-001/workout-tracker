// Load workout data from localStorage
const workoutDays = JSON.parse(localStorage.getItem('workoutDays')) || [];
const completedWorkouts = JSON.parse(localStorage.getItem('completedWorkouts')) || [];