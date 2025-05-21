import '../css/style.css'

// Workout Session Logic
const workoutDays = JSON.parse(localStorage.getItem('workoutDays')) || [];
const completedWorkouts = JSON.parse(localStorage.getItem('completedWorkouts')) || [];

// DOM Elements
const workoutView = document.getElementById('workoutView');
const workoutComplete = document.getElementById('workoutComplete');
const currentDay = document.getElementById('currentDay');
const currentExercise = document.getElementById('currentExercise');
const prevExerciseButton = document.getElementById('prevExercise');
const nextExerciseButton = document.getElementById('nextExercise');
const timerDisplay = document.getElementById('timer');
const endWorkoutButton = document.getElementById('endWorkout');
const startTimerButton = document.getElementById('startTimer');

// Workout State
let currentDayIndex = 0;
let currentExerciseIndex = 0;
let timerInterval = null;
let secondsElapsed = 0;
let isTimerRunning = false;

// Get day index from URL
const urlParams = new URLSearchParams(window.location.search);
const dayIndex = parseInt(urlParams.get('day'));

// Initialize workout if day index is valid
if (dayIndex >= 0 && dayIndex < workoutDays.length && workoutDays[dayIndex].exercises.length > 0) {
  currentDayIndex = dayIndex;
  startWorkout();
} else {
  window.location.href = 'workouts.html';
}

// Start the workout
function startWorkout() {
  updateWorkoutView();
  // Don't start timer automatically
  updateTimerDisplay();
}

// Update the workout view with current exercise
function updateWorkoutView() {
  const day = workoutDays[currentDayIndex];
  const exercise = day.exercises[currentExerciseIndex];
  
  currentDay.textContent = day.name;
  currentExercise.innerHTML = `
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-2xl font-bold text-gray-700">${exercise.name}</h3>
      <div class="flex items-center bg-gray-50 px-3 py-1 rounded-full">
        <svg class="w-4 h-4 text-gray-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <span class="text-gray-600 font-medium">${currentExerciseIndex + 1} of ${day.exercises.length}</span>
      </div>
    </div>
    <div class="flex gap-4 mb-4">
      <div class="flex items-center bg-blue-50 px-3 py-1 rounded-full">
        <svg class="w-4 h-4 text-blue-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <span class="text-blue-600 font-medium">${exercise.reps} reps</span>
      </div>
      <div class="flex items-center bg-green-50 px-3 py-1 rounded-full">
        <svg class="w-4 h-4 text-green-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span class="text-green-600 font-medium">${exercise.sets} sets</span>
      </div>
    </div>
    ${exercise.video ? 
      `<div class="aspect-w-16 aspect-h-9 mb-4">
        <iframe class="w-full h-64" src="https://www.youtube-nocookie.com/embed/${getYouTubeId(exercise.video)}" frameborder="0" allowfullscreen></iframe>
      </div>` : ''}
    ${exercise.notes ? `<p class="text-gray-500 mb-4">Notes: ${exercise.notes}</p>` : ''}
  `;
  
  // Update button visibility based on position
  if (currentExerciseIndex === 0) {
    prevExerciseButton.classList.add('invisible');
  } else {
    prevExerciseButton.classList.remove('invisible');
  }
  
  if (currentExerciseIndex === day.exercises.length - 1) {
    nextExerciseButton.classList.add('invisible');
  } else {
    nextExerciseButton.classList.remove('invisible');
  }

  const navigationContainer = document.querySelector('#navigation-container');
  if (prevExerciseButton.classList.contains('invisible') && nextExerciseButton.classList.contains('invisible')) {
    navigationContainer.classList.add('hidden');
  } else {
    navigationContainer.classList.remove('hidden');
  }
}

function getYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function startTimer() {
  if (!isTimerRunning) {
    isTimerRunning = true;
    startTimerButton.textContent = 'Pause';
    startTimerButton.classList.remove('bg-green-100', 'text-green-600', 'hover:bg-green-200');
    startTimerButton.classList.add('bg-yellow-100', 'text-yellow-600', 'hover:bg-yellow-200');
    timerInterval = setInterval(() => {
      secondsElapsed++;
      updateTimerDisplay();
    }, 1000);
  } else {
    pauseTimer();
  }
}

function pauseTimer() {
  isTimerRunning = false;
  startTimerButton.textContent = 'Resume';
  startTimerButton.classList.remove('bg-yellow-100', 'text-yellow-600', 'hover:bg-yellow-200');
  startTimerButton.classList.add('bg-green-100', 'text-green-600', 'hover:bg-green-200');
  clearInterval(timerInterval);
}

function updateTimerDisplay() {
  const minutes = Math.floor(secondsElapsed / 60);
  const seconds = secondsElapsed % 60;
  timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function stopTimer() {
  isTimerRunning = false;
  clearInterval(timerInterval);
  startTimerButton.textContent = 'Start';
  startTimerButton.classList.remove('bg-yellow-100', 'text-yellow-600', 'hover:bg-yellow-200');
  startTimerButton.classList.add('bg-green-100', 'text-green-600', 'hover:bg-green-200');
}

// Add click handler for start timer button
startTimerButton.addEventListener('click', startTimer);

// Navigation between exercises
prevExerciseButton.addEventListener('click', () => {
  if (currentExerciseIndex > 0) {
    currentExerciseIndex--;
    updateWorkoutView();
  }
});

nextExerciseButton.addEventListener('click', () => {
  if (currentExerciseIndex < workoutDays[currentDayIndex].exercises.length - 1) {
    currentExerciseIndex++;
    updateWorkoutView();
  }
});

// End workout
endWorkoutButton.addEventListener('click', () => {
  const completedWorkout = {
    id: Date.now(),
    day: workoutDays[currentDayIndex].name,
    exercises: workoutDays[currentDayIndex].exercises.map(exercise => ({
      ...exercise,
      completedAt: Date.now()
    })),
    duration: secondsElapsed,
    completedAt: Date.now()
  };
  completedWorkouts.push(completedWorkout);
  localStorage.setItem('completedWorkouts', JSON.stringify(completedWorkouts));
  stopTimer();
  workoutView.classList.add('hidden');
  workoutComplete.classList.remove('hidden');
});

// Function to save workout data with a unique ID
function saveWorkout(workout) {
  workout.id = Date.now();
  workoutDays.push(workout);
  localStorage.setItem('workoutDays', JSON.stringify(workoutDays));
}

// Example of how to use saveWorkout
// saveWorkout({
//   name: "Workout Name",
//   exercises: [
//     { name: "Exercise 1", reps: 10, sets: 3, video: "https://youtube.com/...", notes: "Some notes" },
//     { name: "Exercise 2", reps: 12, sets: 4, video: "https://youtube.com/...", notes: "More notes" }
//   ]
// }); 