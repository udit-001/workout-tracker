import './style.css'

// Initialize with prefilled days of the week
const workoutDays = JSON.parse(localStorage.getItem('workoutDays')) || [
  { name: 'Monday', exercises: [] },
  { name: 'Tuesday', exercises: [] },
  { name: 'Wednesday', exercises: [] },
  { name: 'Thursday', exercises: [] },
  { name: 'Friday', exercises: [] },
  { name: 'Saturday', exercises: [] },
  { name: 'Sunday', exercises: [] }
];

// Store completed workouts
const completedWorkouts = JSON.parse(localStorage.getItem('completedWorkouts')) || [];

// DOM Elements
const daySelect = document.getElementById('daySelect');
const exerciseNameInput = document.getElementById('exerciseName');
const exerciseRepsInput = document.getElementById('exerciseReps');
const exerciseSetsInput = document.getElementById('exerciseSets');
const exerciseVideoInput = document.getElementById('exerciseVideo');
const exerciseNotesInput = document.getElementById('exerciseNotes');
const addExerciseButton = document.getElementById('addExercise');
const workoutDaysContainer = document.getElementById('workoutDays');

// DOM Elements for Workout View
const workoutView = document.getElementById('workoutView');
const currentDay = document.getElementById('currentDay');
const currentExercise = document.getElementById('currentExercise');
const prevExerciseButton = document.getElementById('prevExercise');
const nextExerciseButton = document.getElementById('nextExercise');
const timerDisplay = document.getElementById('timer');
const endWorkoutButton = document.getElementById('endWorkout');

// Workout State
let currentDayIndex = 0;
let currentExerciseIndex = 0;
let timerInterval = null;
let secondsElapsed = 0;

// Load workout days from localStorage on page load
window.addEventListener('DOMContentLoaded', () => {
  updateDaySelect();
  renderWorkoutDays();
});

// Save workout days to localStorage whenever they change
function saveWorkoutDays() {
  localStorage.setItem('workoutDays', JSON.stringify(workoutDays));
  localStorage.setItem('completedWorkouts', JSON.stringify(completedWorkouts));
}

// Add a new exercise to a workout day
addExerciseButton.addEventListener('click', () => {
  const dayIndex = daySelect.selectedIndex - 1;
  if (dayIndex >= 0) {
    const exercise = {
      id: Date.now(),
      name: exerciseNameInput.value.trim(),
      reps: exerciseRepsInput.value,
      sets: exerciseSetsInput.value,
      video: exerciseVideoInput.value.trim(),
      notes: exerciseNotesInput.value.trim(),
      day: workoutDays[dayIndex].name,
      createdAt: Date.now()
    };
    workoutDays[dayIndex].exercises.push(exercise);
    renderWorkoutDays();
    saveWorkoutDays();
    // Clear inputs
    exerciseNameInput.value = '';
    exerciseRepsInput.value = '';
    exerciseSetsInput.value = '';
    exerciseVideoInput.value = '';
    exerciseNotesInput.value = '';
    const previewContainer = document.getElementById('videoPreviewContainer');
    if (previewContainer) previewContainer.remove();
  }
});

// Update the day select dropdown
function updateDaySelect() {
  daySelect.innerHTML = '<option value="">Select a day</option>';
  workoutDays.forEach((day, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = day.name;
    daySelect.appendChild(option);
  });
}

// Start a workout for a specific day
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('start-workout')) {
    currentDayIndex = parseInt(e.target.dataset.dayIndex);
    currentExerciseIndex = 0;
    startWorkout();
  }
});

// Start the workout
function startWorkout() {
  workoutView.classList.remove('hidden');
  document.getElementById('app').scrollIntoView({ behavior: 'smooth' });
  updateWorkoutView();
  startTimer();
}

// Update the workout view with current exercise
function updateWorkoutView() {
  const day = workoutDays[currentDayIndex];
  const exercise = day.exercises[currentExerciseIndex];
  
  currentDay.textContent = day.name;
  currentExercise.innerHTML = `
    <h3 class="text-2xl font-bold mb-2 text-gray-700">${exercise.name}</h3>
    <p class="text-lg mb-2 text-gray-600">Reps: ${exercise.reps} | Sets: ${exercise.sets}</p>
    ${exercise.video ? 
      `<div class="aspect-w-16 aspect-h-9 mb-4">
        <iframe class="w-full h-64" src="https://www.youtube-nocookie.com/embed/${getYouTubeId(exercise.video)}" frameborder="0" allowfullscreen></iframe>
      </div>` : ''}
    ${exercise.notes ? `<p class="text-gray-500 mb-4">Notes: ${exercise.notes}</p>` : ''}
  `;
  
  // Update button states
  prevExerciseButton.disabled = currentExerciseIndex === 0;
  nextExerciseButton.disabled = currentExerciseIndex === day.exercises.length - 1;
}

// Extract YouTube video ID from URL
function getYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Timer functions
function startTimer() {
  secondsElapsed = 0;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    secondsElapsed++;
    updateTimerDisplay();
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(secondsElapsed / 60);
  const seconds = secondsElapsed % 60;
  timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function stopTimer() {
  clearInterval(timerInterval);
}

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
  saveWorkoutDays();
  stopTimer();
  workoutView.classList.add('hidden');
});

// Render all workout days and their exercises
function renderWorkoutDays() {
  workoutDaysContainer.innerHTML = '';
  workoutDays.forEach((day, dayIndex) => {
    if (day.exercises.length > 0) {
      const dayElement = document.createElement('div');
      dayElement.className = 'bg-white p-4 rounded shadow mb-4 border border-gray-100';
      dayElement.innerHTML = `
        <div class="flex justify-between items-center mb-2">
          <h2 class="text-xl font-semibold text-gray-700">${day.name}</h2>
          <a href="workout.html?day=${dayIndex}" class="bg-blue-100 text-blue-600 p-2 rounded hover:bg-blue-200 transition-colors">View Workout</a>
        </div>
      `;
      
      const exercisesList = document.createElement('ul');
      exercisesList.className = 'space-y-2';
      day.exercises.forEach((exercise, exerciseIndex) => {
        const exerciseItem = document.createElement('li');
        exerciseItem.className = 'border border-gray-100 p-3 rounded bg-gray-50';
        exerciseItem.innerHTML = `
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-medium text-gray-700">${exercise.name}</h3>
              <p class="text-gray-600">Reps: ${exercise.reps} | Sets: ${exercise.sets}</p>
              ${exercise.video ? `<a href="${exercise.video}" target="_blank" class="text-blue-500 hover:text-blue-600 transition-colors">Watch Video</a>` : ''}
              ${exercise.notes ? `<p class="text-gray-500 mt-1">Notes: ${exercise.notes}</p>` : ''}
            </div>
            <button class="edit-exercise-btn bg-gray-100 text-gray-600 p-1 rounded hover:bg-gray-200 transition-colors" 
                    data-day-index="${dayIndex}" data-exercise-index="${exerciseIndex}">
              Edit
            </button>
          </div>
        `;
        exercisesList.appendChild(exerciseItem);
      });
      dayElement.appendChild(exercisesList);
      workoutDaysContainer.appendChild(dayElement);
    }
  });

  // Add event listeners to all edit buttons
  document.querySelectorAll('.edit-exercise-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const dayIndex = parseInt(e.target.dataset.dayIndex);
      const exerciseIndex = parseInt(e.target.dataset.exerciseIndex);
      editExercise(dayIndex, exerciseIndex);
    });
  });
}

// Edit an existing exercise
function editExercise(dayIndex, exerciseIndex) {
  const exercise = workoutDays[dayIndex].exercises[exerciseIndex];
  
  // Populate form with exercise data
  daySelect.selectedIndex = dayIndex + 1; // +1 because of the default option
  exerciseNameInput.value = exercise.name;
  exerciseRepsInput.value = exercise.reps;
  exerciseSetsInput.value = exercise.sets;
  exerciseVideoInput.value = exercise.video || '';
  exerciseNotesInput.value = exercise.notes || '';
  
  // Change add button to update button temporarily
  addExerciseButton.textContent = 'Update Exercise';
  addExerciseButton.onclick = () => {
    // Update exercise
    workoutDays[dayIndex].exercises[exerciseIndex] = {
      ...exercise,
      name: exerciseNameInput.value.trim(),
      reps: exerciseRepsInput.value,
      sets: exerciseSetsInput.value,
      video: exerciseVideoInput.value.trim(),
      notes: exerciseNotesInput.value.trim(),
      updatedAt: Date.now()
    };
    
    // Reset form and button
    addExerciseButton.textContent = 'Add Exercise';
    addExerciseButton.onclick = addExerciseHandler;
    clearExerciseForm();
    
    // Update display
    renderWorkoutDays();
    saveWorkoutDays();
    const previewContainer = document.getElementById('videoPreviewContainer');
    if (previewContainer) previewContainer.remove();
  };
}

// Original add exercise handler
const addExerciseHandler = addExerciseButton.onclick;

// Reset all data
function resetAllData() {
  localStorage.removeItem('workoutDays');
  localStorage.removeItem('completedWorkouts');
  workoutDays.length = 0;
  completedWorkouts.length = 0;
  updateDaySelect();
  renderWorkoutDays();
  alert('All data has been reset.');
}

// Add event listener for reset button
document.getElementById('resetData').addEventListener('click', resetAllData);

// Add event listener for video input to show preview
document.getElementById('exerciseVideo').addEventListener('input', (e) => {
  const videoUrl = e.target.value.trim();
  const previewContainer = document.getElementById('videoPreviewContainer');
  const previewIframe = document.getElementById('videoPreview');
  
  if (videoUrl) {
    const videoId = getYouTubeId(videoUrl);
    if (videoId) {
      previewIframe.src = `https://www.youtube-nocookie.com/embed/${videoId}`;
      previewContainer.classList.remove('hidden');
    } else {
      previewContainer.classList.add('hidden');
    }
  } else {
    previewContainer.classList.add('hidden');
  }
});

// Clear preview when form is cleared
function clearExerciseForm() {
  document.getElementById('videoPreviewContainer').classList.add('hidden');
  // ... rest of existing clear form code ...
}
