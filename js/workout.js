import '../css/style.css'

// Workout Session Logic
const workoutDays = JSON.parse(localStorage.getItem('workoutDays')) || [];
const completedWorkouts = JSON.parse(localStorage.getItem('completedWorkouts')) || [];

// DOM Elements
const workoutView = document.getElementById('workoutView');
const workoutComplete = document.getElementById('workoutComplete');
const currentDay = document.getElementById('currentDay');
const desktopCurrentDay = document.getElementById('desktopCurrentDay');
const currentExercise = document.getElementById('currentExercise');
const prevExerciseButton = document.getElementById('prevExercise');
const nextExerciseButton = document.getElementById('nextExercise');
const timerBar = document.getElementById('timerBar');
const restTimerDisplay = document.getElementById('restTimerDisplay');
const startRestTimerButton = document.getElementById('startRestTimer');
const skipRestButton = document.getElementById('skipRest');
const endWorkoutButton = document.getElementById('endWorkout');

// Workout State
let currentDayIndex = 0;
let currentExerciseIndex = 0;
let currentSet = 1;
let restTimerInterval = null;
let restSecondsRemaining = 0;
let isRestTimerRunning = false;

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
}

// Update the workout view with current exercise
function updateWorkoutView() {
  const day = workoutDays[currentDayIndex];
  const exercise = day.exercises[currentExerciseIndex];
  
  currentDay.textContent = day.name;
  desktopCurrentDay.textContent = day.name;
  
  // Format reps display
  let repsDisplay = '';
  if (exercise.minReps && exercise.maxReps) {
    repsDisplay = `${exercise.minReps}-${exercise.maxReps} reps`;
  } else if (exercise.reps) {
    repsDisplay = `${exercise.reps} reps`;
  }
  
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
      ${repsDisplay ? `
        <div class="flex items-center bg-blue-50 px-3 py-1 rounded-full">
          <svg class="w-4 h-4 text-blue-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span class="text-blue-600 font-medium">${repsDisplay}</span>
        </div>
      ` : ''}
      <div class="flex items-center bg-green-50 px-3 py-1 rounded-full">
        <svg class="w-4 h-4 text-green-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span class="text-green-600 font-medium">Set ${currentSet} of ${exercise.sets}</span>
      </div>
    </div>
    ${exercise.video ? `
      <div class="aspect-video mb-4">
        <iframe class="w-full h-full" src="https://www.youtube-nocookie.com/embed/${getYouTubeId(exercise.video)}" frameborder="0" allow="encrypted-media" allowfullscreen></iframe>
      </div>
    ` : ''}
    ${exercise.notes ? `<p class="text-gray-500 mb-4">Notes: ${exercise.notes}</p>` : ''}
  `;
  
  // Update navigation container with complete set button
  const navigationContainer = document.querySelector('#navigation-container');
  navigationContainer.innerHTML = `
    <button id="prevExercise" class="bg-gray-100 text-gray-600 px-4 py-2 rounded hover:bg-gray-200 transition-colors">Previous</button>
    <button id="completeSet" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
      Complete Set
    </button>
    <button id="nextExercise" class="bg-blue-100 text-blue-600 px-4 py-2 rounded hover:bg-blue-200 transition-colors">Next</button>
  `;
  
  // Add event listeners
  const completeSetButton = document.getElementById('completeSet');
  const prevExerciseButton = document.getElementById('prevExercise');
  const nextExerciseButton = document.getElementById('nextExercise');
  
  if (completeSetButton) {
    completeSetButton.addEventListener('click', completeSet);
  }
  
  if (prevExerciseButton) {
    prevExerciseButton.addEventListener('click', () => {
      if (currentExerciseIndex > 0) {
        currentExerciseIndex--;
        currentSet = 1;
        updateWorkoutView();
      }
    });
  }
  
  if (nextExerciseButton) {
    nextExerciseButton.addEventListener('click', () => {
      if (currentExerciseIndex < workoutDays[currentDayIndex].exercises.length - 1) {
        currentExerciseIndex++;
        currentSet = 1;
        updateWorkoutView();
      }
    });
  }
  
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

// Function to complete a set
function completeSet() {
  const exercise = workoutDays[currentDayIndex].exercises[currentExerciseIndex];
  if (currentSet < exercise.sets) {
    currentSet++;
    // Show rest timer after completing a set
    const timerBar = document.getElementById('timerBar');
    timerBar.classList.remove('hidden');
    showRestTimer();
    updateWorkoutView();
  } else {
    // Move to next exercise if all sets are complete
    if (currentExerciseIndex < workoutDays[currentDayIndex].exercises.length - 1) {
      currentExerciseIndex++;
      currentSet = 1;
      updateWorkoutView();
    }
  }
}

// Load preferences
function loadPreferences() {
  const savedPreferences = localStorage.getItem('preferences');
  return savedPreferences ? JSON.parse(savedPreferences) : {
    defaultReps: 10,
    defaultSets: 3,
    defaultRestDuration: 60,
    restTimerSound: true
  };
}

// Function to show rest timer
function showRestTimer() {
  const timerBar = document.getElementById('timerBar');
  const mainContent = document.querySelector('.container');
  
  timerBar.classList.remove('hidden');
  mainContent.classList.add('md:pt-16'); // Add top padding on desktop for the timer bar
  
  const preferences = loadPreferences();
  restSecondsRemaining = preferences.defaultRestDuration || 60; // Fallback to 60 if not set
  updateRestTimerDisplay();
}

// Function to start rest timer
function startRestTimer() {
  if (!isRestTimerRunning) {
    isRestTimerRunning = true;
    startRestTimerButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
      </svg>
    `;
    startRestTimerButton.title = "Pause Rest Timer";
    startRestTimerButton.classList.remove('bg-purple-500', 'hover:bg-purple-600');
    startRestTimerButton.classList.add('bg-yellow-500', 'hover:bg-yellow-600');
    
    restTimerInterval = setInterval(() => {
      if (restSecondsRemaining > 0) {
        restSecondsRemaining--;
        updateRestTimerDisplay();
      } else {
        stopRestTimer();
        // Play sound only if enabled in preferences
        const preferences = loadPreferences();
        if (preferences.restTimerSound) {
          new Audio('/sounds/bell.wav').play();
        }
      }
    }, 1000);
  } else {
    stopRestTimer();
  }
}

// Function to update rest timer display
function updateRestTimerDisplay() {
  const minutes = Math.floor(restSecondsRemaining / 60);
  const seconds = restSecondsRemaining % 60;
  restTimerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Function to stop rest timer
function stopRestTimer() {
  isRestTimerRunning = false;
  clearInterval(restTimerInterval);
  startRestTimerButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
    </svg>
  `;
  startRestTimerButton.title = "Start Rest Timer";
  startRestTimerButton.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
  startRestTimerButton.classList.add('bg-purple-500', 'hover:bg-purple-600');
}

// Function to skip rest
function skipRest() {
  stopRestTimer();
  const timerBar = document.getElementById('timerBar');
  const mainContent = document.querySelector('.container');
  
  timerBar.classList.add('hidden');
  mainContent.classList.remove('md:pt-16'); // Remove top padding on desktop
}

// Add event listeners
startRestTimerButton.addEventListener('click', startRestTimer);
skipRestButton.addEventListener('click', skipRest);

// End workout
endWorkoutButton.addEventListener('click', () => {
  const completedWorkout = {
    id: Date.now(),
    day: workoutDays[currentDayIndex].name,
    exercises: workoutDays[currentDayIndex].exercises.map(exercise => ({
      ...exercise,
      completedAt: Date.now()
    })),
    completedAt: Date.now()
  };
  completedWorkouts.push(completedWorkout);
  localStorage.setItem('completedWorkouts', JSON.stringify(completedWorkouts));
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