import '../css/style.css'

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

// DOM Elements
const daySelect = document.getElementById('daySelect');
const exerciseNameInput = document.getElementById('exerciseName');
const exerciseRepsInput = document.getElementById('exerciseReps');
const exerciseSetsInput = document.getElementById('exerciseSets');
const exerciseVideoInput = document.getElementById('exerciseVideo');
const exerciseNotesInput = document.getElementById('exerciseNotes');
const addExerciseButton = document.getElementById('addExercise');
const toast = document.getElementById('toast');

// Function to check if all required fields are filled
function validateForm() {
  const isDaySelected = daySelect.value !== '';
  const isNameFilled = exerciseNameInput.value.trim() !== '';
  const isRepsFilled = exerciseRepsInput.value !== '';
  const isSetsFilled = exerciseSetsInput.value !== '';
  
  const isValid = isDaySelected && isNameFilled && isRepsFilled && isSetsFilled;
  addExerciseButton.disabled = !isValid;
  addExerciseButton.classList.toggle('opacity-50', !isValid);
  addExerciseButton.classList.toggle('cursor-not-allowed', !isValid);
}

// Add input event listeners for validation
daySelect.addEventListener('change', validateForm);
exerciseNameInput.addEventListener('input', validateForm);
exerciseRepsInput.addEventListener('input', validateForm);
exerciseSetsInput.addEventListener('input', validateForm);

// Initialize button state
validateForm();

// Load workout days from localStorage on page load
window.addEventListener('DOMContentLoaded', () => {
  updateDaySelect();
  validateForm();
  
  // Check for edit parameters in URL
  const urlParams = new URLSearchParams(window.location.search);
  const exerciseHash = urlParams.get('hash');
  const dayIndex = parseInt(urlParams.get('day'));
  const exerciseIndex = parseInt(urlParams.get('exercise'));
  
  if (exerciseHash && dayIndex >= 0 && exerciseIndex >= 0) {
    const exercise = workoutDays[dayIndex].exercises[exerciseIndex];
    if (exercise && exercise.id === exerciseHash) {
      // Populate form with exercise data
      daySelect.selectedIndex = dayIndex + 1; // +1 because of the default option
      exerciseNameInput.value = exercise.name;
      exerciseRepsInput.value = exercise.reps;
      exerciseSetsInput.value = exercise.sets;
      exerciseVideoInput.value = exercise.video || '';
      exerciseNotesInput.value = exercise.notes || '';
      
      // Update video preview if there's a video
      if (exercise.video) {
        const videoId = getYouTubeId(exercise.video);
        if (videoId) {
          const previewIframe = document.getElementById('videoPreview');
          const placeholder = document.getElementById('videoPreviewPlaceholder');
          previewIframe.src = `https://www.youtube-nocookie.com/embed/${videoId}`;
          previewIframe.classList.remove('hidden');
          placeholder.classList.add('hidden');
        }
      }
      
      // Change add button to update button
      addExerciseButton.textContent = 'Update Exercise';
      addExerciseButton.onclick = () => {
        // Create updated exercise object
        const updatedExercise = {
          ...exercise,
          name: exerciseNameInput.value.trim(),
          reps: exerciseRepsInput.value,
          sets: exerciseSetsInput.value,
          video: exerciseVideoInput.value.trim(),
          notes: exerciseNotesInput.value.trim(),
          updatedAt: Date.now()
        };

        // Update the exercise
        workoutDays[dayIndex].exercises[exerciseIndex] = updatedExercise;
        
        // Reset form and button
        addExerciseButton.textContent = 'Add Exercise';
        addExerciseButton.onclick = addExerciseHandler;
        clearExerciseForm();
        validateForm();
        hideError();
        showToast();
        
        // Update display and save
        saveWorkoutDays();
        
        // Redirect back to workouts page
        window.location.href = 'workouts.html';
      };
    }
  }
});

// Save workout days to localStorage whenever they change
function saveWorkoutDays() {
  localStorage.setItem('workoutDays', JSON.stringify(workoutDays));
}

// Function to show toast notification
function showToast() {
  // Remove any existing timeout to prevent multiple toasts
  if (window.toastTimeout) {
    clearTimeout(window.toastTimeout);
  }
  
  // Show the toast
  toast.classList.remove('hidden');
  toast.classList.add('fixed');
  
  // Hide the toast after 3 seconds
  window.toastTimeout = setTimeout(() => {
    toast.classList.add('translate-y-full', 'opacity-0');
  }, 3000);
}

// Function to create a hash of exercise values
function createExerciseHash(exercise) {
  return `${exercise.name.toLowerCase()}_${exercise.reps}_${exercise.sets}_${exercise.day.toLowerCase()}`;
}

// Function to check if exercise is a duplicate
function isDuplicateExercise(exercise, dayIndex) {
  return workoutDays[dayIndex].exercises.some(ex => ex.id === exercise.id);
}

// Function to show error message
function showError(message) {
  const errorMessage = document.getElementById('errorMessage');
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
}

// Function to hide error message
function hideError() {
  const errorMessage = document.getElementById('errorMessage');
  errorMessage.classList.add('hidden');
  errorMessage.textContent = '';
}

// Add a new exercise to a workout day
addExerciseButton.addEventListener('click', () => {
  const dayIndex = daySelect.selectedIndex - 1;
  if (dayIndex >= 0) {
    const exercise = {
      name: exerciseNameInput.value.trim(),
      reps: exerciseRepsInput.value,
      sets: exerciseSetsInput.value,
      video: exerciseVideoInput.value.trim(),
      notes: exerciseNotesInput.value.trim(),
      day: workoutDays[dayIndex].name,
      createdAt: Date.now()
    };

    // Create and store the hash
    exercise.id = createExerciseHash(exercise);

    console.log(exercise.id)

    // Check for duplicates
    if (isDuplicateExercise(exercise, dayIndex)) {
      showError('This exercise already exists for this day!');
      return;
    }

    workoutDays[dayIndex].exercises.push(exercise);
    saveWorkoutDays();
    clearExerciseForm();
    validateForm(); // Re-validate form after clearing
    hideError(); // Hide any existing error
    showToast(); // Show success message
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

// Render all workout days and their exercises
function renderWorkoutDays() {
  workoutDaysContainer.innerHTML = '';
  workoutDays.forEach((day, dayIndex) => {
    if (day.exercises.length > 0) {
      const dayElement = document.createElement('div');
      dayElement.className = 'bg-white p-4 rounded shadow-sm border border-gray-100 mb-4';
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
    // Create updated exercise object
    const updatedExercise = {
      ...exercise,
      name: exerciseNameInput.value.trim(),
      reps: exerciseRepsInput.value,
      sets: exerciseSetsInput.value,
      video: exerciseVideoInput.value.trim(),
      notes: exerciseNotesInput.value.trim(),
      updatedAt: Date.now()
    };

    // Update the hash
    updatedExercise.hash = createExerciseHash(updatedExercise);

    // Check for duplicates (excluding the current exercise)
    const isDuplicate = workoutDays[dayIndex].exercises.some((ex, idx) => 
      idx !== exerciseIndex && ex.hash === updatedExercise.hash
    );

    if (isDuplicate) {
      showError('This exercise already exists for this day!');
      return;
    }
    
    // Update exercise
    workoutDays[dayIndex].exercises[exerciseIndex] = updatedExercise;
    
    // Reset form and button
    addExerciseButton.textContent = 'Add Exercise';
    addExerciseButton.onclick = addExerciseHandler;
    clearExerciseForm();
    validateForm(); // Re-validate form after clearing
    hideError(); // Hide any existing error
    showToast(); // Show success message
    
    // Update display
    saveWorkoutDays();
  };
}

// Original add exercise handler
const addExerciseHandler = addExerciseButton.onclick;

// Add event listener for video input to show preview
document.getElementById('exerciseVideo').addEventListener('input', (e) => {
  const videoUrl = e.target.value.trim();
  const previewContainer = document.getElementById('videoPreviewContainer');
  const previewIframe = document.getElementById('videoPreview');
  const placeholder = document.getElementById('videoPreviewPlaceholder');
  
  if (videoUrl) {
    const videoId = getYouTubeId(videoUrl);
    if (videoId) {
      previewIframe.src = `https://www.youtube-nocookie.com/embed/${videoId}`;
      previewIframe.classList.remove('hidden');
      placeholder.classList.add('hidden');
    } else {
      previewIframe.classList.add('hidden');
      placeholder.classList.remove('hidden');
    }
  } else {
    previewIframe.classList.add('hidden');
    placeholder.classList.remove('hidden');
  }
});

// Extract YouTube video ID from URL
function getYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Clear form and preview
function clearExerciseForm() {
  exerciseNameInput.value = '';
  exerciseRepsInput.value = '';
  exerciseSetsInput.value = '';
  exerciseVideoInput.value = '';
  exerciseNotesInput.value = '';
  document.getElementById('videoPreview').classList.add('hidden');
  document.getElementById('videoPreviewPlaceholder').classList.remove('hidden');
} 