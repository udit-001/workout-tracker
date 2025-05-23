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
const endWorkoutButton = document.getElementById('endWorkout');
const notesModal = document.getElementById('notesModal');
const closeNotesModal = document.getElementById('closeNotesModal');
const prevExerciseTimerButton = document.getElementById('prevExerciseTimer');
const nextExerciseTimerButton = document.getElementById('nextExerciseTimer');

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

// Function to show rest timer
function showRestTimer() {
  const preferences = loadPreferences();
  restSecondsRemaining = preferences.defaultRestDuration || 60;
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

  // If timer finished (not manually stopped), show restart button
  if (restSecondsRemaining === 0) {
    startRestTimerButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    `;
    startRestTimerButton.title = "Restart Rest Timer";
  }
}

// Function to restart rest timer
function restartRestTimer() {
  const preferences = loadPreferences();
  restSecondsRemaining = preferences.defaultRestDuration || 60;
  updateRestTimerDisplay();
  startRestTimer();
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

// Function to complete a set
function completeSet() {
  const exercise = workoutDays[currentDayIndex].exercises[currentExerciseIndex];

  const setDisplay = document.getElementById('setDisplay');
  
  if (currentSet < exercise.sets) {
    currentSet++;
    setDisplay.textContent = `Set ${currentSet} of ${exercise.sets}`;
    showRestTimer();
  } else {
    // Move to next exercise if all sets are complete
    if (currentExerciseIndex < workoutDays[currentDayIndex].exercises.length - 1) {
      currentExerciseIndex++;
      currentSet = 1;
      updateWorkoutView();
    }
  }
}

// Add event listeners
startRestTimerButton.addEventListener('click', () => {
  if (restSecondsRemaining === 0) {
    restartRestTimer();
  } else {
    startRestTimer();
  }
});

// Add event listeners for timer bar navigation
prevExerciseTimerButton.addEventListener('click', () => {
  if (currentExerciseIndex > 0) {
    currentExerciseIndex--;
    currentSet = 1;
    updateWorkoutView();
    stopRestTimer();
  }
});

nextExerciseTimerButton.addEventListener('click', () => {
  if (currentExerciseIndex < workoutDays[currentDayIndex].exercises.length - 1) {
    currentExerciseIndex++;
    currentSet = 1;
    updateWorkoutView();
    stopRestTimer();
  }
});

// Update timer bar navigation button visibility
function updateTimerBarNavigation() {
  prevExerciseTimerButton.style.visibility = currentExerciseIndex === 0 ? 'hidden' : 'visible';
  nextExerciseTimerButton.style.visibility = currentExerciseIndex === workoutDays[currentDayIndex].exercises.length - 1 ? 'hidden' : 'visible';
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
      <div class="flex items-center gap-2">
        ${exercise.notes ? `
          <button id="showNotes" class="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100" title="View Notes">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </button>
        ` : ''}
        <div class="flex items-center bg-gray-50 px-3 py-1 rounded-full">
          <svg class="w-4 h-4 text-gray-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span class="text-gray-600 font-medium">${currentExerciseIndex + 1} of ${day.exercises.length}</span>
        </div>
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
        <span class="text-green-600 font-medium" id="setDisplay">Set ${currentSet} of ${exercise.sets}</span>
      </div>
    </div>
    <div class="flex flex-col md:flex-row gap-4">
      ${exercise.video ? `
        <div class="aspect-video mb-4 md:mb-0 md:flex-1">
          <iframe class="w-full h-full" src="https://www.youtube-nocookie.com/embed/${getYouTubeId(exercise.video)}" frameborder="0" allow="encrypted-media" allowfullscreen></iframe>
        </div>
      ` : ''}
      <div class="flex md:flex-col justify-center items-center">
        <button id="completeSet" class="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-colors" title="Complete Set">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </div>
  `;
  
  // Add event listener for notes button if it exists
  const showNotesButton = document.getElementById('showNotes');
  if (showNotesButton) {
    showNotesButton.addEventListener('click', () => {
      const modalNotes = document.getElementById('modalNotes');
      modalNotes.textContent = exercise.notes;
      notesModal.classList.remove('hidden');
      notesModal.classList.add('fixed');

      // Add modal event listeners
      const closeNotesModal = document.getElementById('closeNotesModal');
      closeNotesModal.addEventListener('click', closeModal);
      notesModal.addEventListener('click', handleModalClick);
      document.addEventListener('keydown', handleEscapeKey);
    });
  }
  
  // Add event listener for complete set button
  const completeSetButton = document.getElementById('completeSet');
  if (completeSetButton) {
    completeSetButton.addEventListener('click', completeSet);
  }

  // Update timer bar navigation visibility
  updateTimerBarNavigation();
}

function getYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Function to close modal
function closeModal() {
  notesModal.classList.remove('fixed');
  notesModal.classList.add('hidden');
  
  // Remove modal event listeners
  const closeNotesModal = document.getElementById('closeNotesModal');
  closeNotesModal.removeEventListener('click', closeModal);
  notesModal.removeEventListener('click', handleModalClick);
  document.removeEventListener('keydown', handleEscapeKey);
}

// Function to handle modal click outside
function handleModalClick(e) {
  if (e.target === notesModal) {
    closeModal();
  }
}

// Function to handle escape key
function handleEscapeKey(e) {
  if (e.key === 'Escape' && !notesModal.classList.contains('hidden')) {
    closeModal();
  }
}

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