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
        window.location.href = '/workouts';
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
function addExerciseHandler() {
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
}

// Add click event listener to the add exercise button
addExerciseButton.addEventListener('click', addExerciseHandler);

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

// Function to get YouTube video ID from URL
function getYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Function to clear the exercise form
function clearExerciseForm() {
  exerciseNameInput.value = '';
  exerciseRepsInput.value = '';
  exerciseSetsInput.value = '';
  exerciseVideoInput.value = '';
  exerciseNotesInput.value = '';
  
  // Reset video preview
  const previewIframe = document.getElementById('videoPreview');
  const placeholder = document.getElementById('videoPreviewPlaceholder');
  previewIframe.src = '';
  previewIframe.classList.add('hidden');
  placeholder.classList.remove('hidden');
} 