import "../css/style.css"

// Initialize with prefilled days of the week
const workoutDays = JSON.parse(localStorage.getItem('workoutDays')) || [];

// DOM Elements
const daySelect = document.getElementById('daySelect');
const exerciseNameInput = document.getElementById('exerciseName');
const exerciseRepsInput = document.getElementById('exerciseReps');
const exerciseSetsInput = document.getElementById('exerciseSets');
const exerciseVideoInput = document.getElementById('exerciseVideo');
const exerciseNotesInput = document.getElementById('exerciseNotes');
const addExerciseButton = document.getElementById('addExercise');
const toast = document.getElementById('toast');
const formContainer = document.querySelector('.bg-white.p-4');
const useRepRange = document.getElementById('useRepRange');
const singleRepInput = document.getElementById('singleRepInput');
const repRangeInputs = document.getElementById('repRangeInputs');
const minRepsInput = document.getElementById('minReps');
const maxRepsInput = document.getElementById('maxReps');

// Check if there are any workout days
if (workoutDays.length === 0) {
  formContainer.innerHTML = `
    <div class="text-center py-8">
      <p class="text-gray-600 mb-4">No workout days available. Please add a workout day first.</p>
      <a href="/manage-days.html" class="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
        Add Workout Day
      </a>
    </div>
  `;
} else {
  // Function to update the day select dropdown
  function updateDaySelect(selectedDay = '') {
    daySelect.innerHTML = '<option value="">Select a day</option>';
    workoutDays.forEach((day) => {
      const option = document.createElement('option');
      option.value = day.name;
      option.textContent = day.name;
      if (selectedDay && day.name === selectedDay) option.selected = true;
      daySelect.appendChild(option);
    });

    // If there's only one workout day, select it automatically
    if (workoutDays.length === 1 && !selectedDay) {
      daySelect.value = workoutDays[0].name;
      validateForm();
    }
  }

  // Toggle between single reps and rep range
  useRepRange.addEventListener('change', () => {
    if (useRepRange.checked) {
      singleRepInput.classList.add('hidden');
      repRangeInputs.classList.remove('hidden');
      exerciseRepsInput.value = '';
    } else {
      singleRepInput.classList.remove('hidden');
      repRangeInputs.classList.add('hidden');
      minRepsInput.value = '';
      maxRepsInput.value = '';
    }
    validateForm();
  });

  // Function to validate number input
  function validateNumberInput(input, errorId, fieldName) {
    const value = input.value;
    if (value === '') {
      showFieldError(errorId, `Please enter ${fieldName}`);
      return false;
    }
    if (parseInt(value) < 0) {
      input.value = Math.abs(parseInt(value));
      showFieldError(errorId, `Negative values are not allowed. Converted to positive value.`);
      return false;
    }
    hideFieldError(errorId);
    return true;
  }

  // Function to hide error message for a specific field
  function hideFieldError(fieldId) {
    const errorElement = document.getElementById(fieldId);
    errorElement.classList.add('hidden');
    errorElement.textContent = '';
  }

  // Function to check if all required fields are filled
  function validateForm(showErrors = false) {
    const isDaySelected = daySelect.value !== '';
    const isNameFilled = exerciseNameInput.value.trim() !== '';
    let isSetsValid = true;
    let isRepsValid = true;
    
    // Reset all error messages
    hideAllErrors();
    
    // Only show errors if showErrors is true
    if (showErrors) {
      // Validate day selection
      if (!isDaySelected) {
        showFieldError('dayError', 'Please select a workout day');
      }
      
      // Validate exercise name
      if (!isNameFilled) {
        showFieldError('nameError', 'Please enter an exercise name');
      }
      
      // Validate sets
      isSetsValid = validateNumberInput(exerciseSetsInput, 'setsError', 'number of sets');
      
      // Validate reps
      if (useRepRange.checked) {
        const minReps = minRepsInput.value;
        const maxReps = maxRepsInput.value;
        // Only validate if either min or max is filled
        if (minReps || maxReps) {
          const isMinValid = validateNumberInput(minRepsInput, 'repRangeError', 'minimum reps');
          const isMaxValid = validateNumberInput(maxRepsInput, 'repRangeError', 'maximum reps');
          
          if (isMinValid && isMaxValid && parseInt(minReps) > parseInt(maxReps)) {
            showFieldError('repRangeError', 'Minimum reps cannot be greater than maximum reps');
            isRepsValid = false;
          } else if (!isMinValid || !isMaxValid) {
            isRepsValid = false;
          }
        }
      } else if (exerciseRepsInput.value) {
        // Only validate if reps value is provided
        isRepsValid = validateNumberInput(exerciseRepsInput, 'repsError', 'number of reps');
      }
    } else {
      // Even if not showing errors, we still need to validate for button state
      isSetsValid = exerciseSetsInput.value !== '';
    }
    
    // Check if we're in edit mode
    const isEditMode = addExerciseButton.textContent === 'Update Exercise';
    
    // In edit mode, enable button if any field is changed
    if (isEditMode) {
      const urlParams = new URLSearchParams(window.location.search);
      const dayIndex = parseInt(urlParams.get('day'));
      const exerciseIndex = parseInt(urlParams.get('exercise'));
      
      if (dayIndex >= 0 && exerciseIndex >= 0) {
        const originalExercise = workoutDays[dayIndex].exercises[exerciseIndex];
        const hasChanges = 
          originalExercise.name !== exerciseNameInput.value.trim() ||
          originalExercise.sets !== exerciseSetsInput.value ||
          originalExercise.video !== exerciseVideoInput.value.trim() ||
          originalExercise.notes !== exerciseNotesInput.value.trim() ||
          originalExercise.day !== daySelect.value ||
          (useRepRange.checked ? 
            (originalExercise.minReps !== minRepsInput.value || originalExercise.maxReps !== maxRepsInput.value) :
            originalExercise.reps !== exerciseRepsInput.value);
        
        addExerciseButton.disabled = !hasChanges;
        addExerciseButton.classList.toggle('opacity-50', !hasChanges);
        addExerciseButton.classList.toggle('cursor-not-allowed', !hasChanges);
        return;
      }
    }
    
    // For new exercise mode, require all fields except reps
    const isValid = isDaySelected && isNameFilled && isSetsValid && isRepsValid;
    
    addExerciseButton.disabled = !isValid;
    addExerciseButton.classList.toggle('opacity-50', !isValid);
    addExerciseButton.classList.toggle('cursor-not-allowed', !isValid);
  }

  // Function to show error message for a specific field
  function showFieldError(fieldId, message) {
    const errorElement = document.getElementById(fieldId);
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
  }

  // Function to hide all error messages
  function hideAllErrors() {
    const errorFields = ['dayError', 'nameError', 'setsError', 'repsError', 'repRangeError'];
    errorFields.forEach(fieldId => {
      const errorElement = document.getElementById(fieldId);
      errorElement.classList.add('hidden');
      errorElement.textContent = '';
    });
  }

  // Add input event listeners for validation
  function addValidationListeners() {
    daySelect.addEventListener('change', () => validateForm(true));
    exerciseNameInput.addEventListener('input', () => validateForm(true));
    exerciseSetsInput.addEventListener('change', () => validateForm(true));
    exerciseRepsInput.addEventListener('change', () => validateForm(true));
    minRepsInput.addEventListener('change', () => validateForm(true));
    maxRepsInput.addEventListener('change', () => validateForm(true));
    exerciseVideoInput.addEventListener('input', () => validateForm(true));
    exerciseNotesInput.addEventListener('input', () => validateForm(true));
  }

  // Add event listener for video preview
  exerciseVideoInput.addEventListener('input', () => {
    const videoUrl = exerciseVideoInput.value.trim();
    const videoId = getYouTubeId(videoUrl);
    const previewIframe = document.getElementById('videoPreview');
    const placeholder = document.getElementById('videoPreviewPlaceholder');
    
    if (videoId) {
      previewIframe.src = `https://www.youtube-nocookie.com/embed/${videoId}`;
      previewIframe.classList.remove('hidden');
      placeholder.classList.add('hidden');
    } else {
      previewIframe.src = '';
      previewIframe.classList.add('hidden');
      placeholder.classList.remove('hidden');
    }
  });

  // Load workout days from localStorage on page load
  window.addEventListener('DOMContentLoaded', () => {
    // Check for day parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const selectedDay = urlParams.get('day');
    
    updateDaySelect(selectedDay);
    
    // Check for edit parameters in URL
    const exerciseHash = urlParams.get('hash');
    const dayIndex = parseInt(urlParams.get('day'));
    const exerciseIndex = parseInt(urlParams.get('exercise'));
    
    const isEditMode = !!(exerciseHash && dayIndex >= 0 && exerciseIndex >= 0);
    
    // Update navbar title based on mode
    const navbarTitle = document.querySelector('nav h1');
    if (navbarTitle) {
      navbarTitle.textContent = isEditMode ? 'Edit Exercise' : 'Add Exercise';
    }
    
    // Always add validation listeners
    addValidationListeners();
    
    if (isEditMode) {
      // In edit mode, we'll handle validation differently
      addExerciseButton.textContent = 'Update Exercise';
    } else {
      validateForm(false); // Don't show errors on initial load
    }
    
    if (exerciseHash && dayIndex >= 0 && exerciseIndex >= 0) {
      const exercise = workoutDays[dayIndex].exercises[exerciseIndex];
      if (exercise && exercise.id === exerciseHash) {
        // Populate form with exercise data
        daySelect.value = exercise.day;
        exerciseNameInput.value = exercise.name;
        exerciseSetsInput.value = exercise.sets;
        exerciseVideoInput.value = exercise.video || '';
        exerciseNotesInput.value = exercise.notes || '';
        
        // Handle reps based on whether it's a range or single value
        if (exercise.minReps && exercise.maxReps) {
          useRepRange.checked = true;
          singleRepInput.classList.add('hidden');
          repRangeInputs.classList.remove('hidden');
          minRepsInput.value = exercise.minReps;
          maxRepsInput.value = exercise.maxReps;
        } else if (exercise.reps) {
          useRepRange.checked = false;
          singleRepInput.classList.remove('hidden');
          repRangeInputs.classList.add('hidden');
          exerciseRepsInput.value = exercise.reps;
        }
        
        console.log('Populated form values:', {
          day: daySelect.value,
          name: exerciseNameInput.value,
          reps: exerciseRepsInput.value,
          minReps: minRepsInput.value,
          maxReps: maxRepsInput.value,
          sets: exerciseSetsInput.value,
          video: exerciseVideoInput.value,
          notes: exerciseNotesInput.value
        });
        
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
        // Remove the add handler
        addExerciseButton.removeEventListener('click', addExerciseHandler);
        
        addExerciseButton.onclick = () => {
          // Create updated exercise object
          console.log('Original exercise:', exercise);
          console.log('Form values:', {
            name: exerciseNameInput.value,
            reps: exerciseRepsInput.value,
            sets: exerciseSetsInput.value,
            video: exerciseVideoInput.value,
            notes: exerciseNotesInput.value,
            day: daySelect.value
          });
          
          const updatedExercise = {
            ...exercise,
            name: exerciseNameInput.value.trim(),
            sets: exerciseSetsInput.value,
            video: exerciseVideoInput.value.trim(),
            notes: exerciseNotesInput.value.trim(),
            day: daySelect.value,
            updatedAt: Date.now()
          };

          // Add reps based on whether range is used
          if (useRepRange.checked) {
            updatedExercise.minReps = minRepsInput.value;
            updatedExercise.maxReps = maxRepsInput.value;
          } else {
            updatedExercise.reps = exerciseRepsInput.value;
          }

          console.log('Updated exercise:', updatedExercise);

          // Update the exercise ID
          updatedExercise.id = createExerciseHash(updatedExercise);
          console.log('New exercise ID:', updatedExercise.id);

          // Find the correct day index for the updated exercise
          const newDayIndex = workoutDays.findIndex(d => d.name === daySelect.value);
          console.log('Current day index:', dayIndex);
          console.log('New day index:', newDayIndex);
          
          if (newDayIndex === -1) {
            console.error('Invalid workout day selected');
            showError('Invalid workout day selected');
            return;
          }

          // Check for duplicates (excluding the current exercise)
          const isDuplicate = workoutDays[newDayIndex].exercises.some((ex, idx) => 
            idx !== exerciseIndex && ex.id === updatedExercise.id
          );
          console.log('Is duplicate:', isDuplicate);

          if (isDuplicate) {
            console.error('Duplicate exercise found');
            showError('This exercise already exists for this day!');
            return;
          }

          // If the day has changed, remove from old day and add to new day
          if (dayIndex !== newDayIndex) {
            console.log('Moving exercise to different day');
            console.log('Exercises in old day before:', workoutDays[dayIndex].exercises);
            workoutDays[dayIndex].exercises.splice(exerciseIndex, 1);
            console.log('Exercises in old day after:', workoutDays[dayIndex].exercises);
            console.log('Exercises in new day before:', workoutDays[newDayIndex].exercises);
            workoutDays[newDayIndex].exercises.push(updatedExercise);
            console.log('Exercises in new day after:', workoutDays[newDayIndex].exercises);
          } else {
            // Update in place if same day
            console.log('Updating exercise in same day');
            console.log('Exercises before update:', workoutDays[dayIndex].exercises);
            workoutDays[dayIndex].exercises[exerciseIndex] = updatedExercise;
            console.log('Exercises after update:', workoutDays[dayIndex].exercises);
          }
          
          // Reset form and button
          addExerciseButton.textContent = 'Update Exercise';
          // Remove the update handler
          addExerciseButton.onclick = null;
          // Add back the add handler
          addExerciseButton.addEventListener('click', addExerciseHandler);
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
    } else {
      // Set default values from preferences for new exercises
      const preferences = loadPreferences();
      
      // Handle default reps (single or range)
      if (preferences.defaultMinReps && preferences.defaultMaxReps) {
        useRepRange.checked = true;
        singleRepInput.classList.add('hidden');
        repRangeInputs.classList.remove('hidden');
        minRepsInput.value = preferences.defaultMinReps;
        maxRepsInput.value = preferences.defaultMaxReps;
      } else if (preferences.defaultReps) {
        useRepRange.checked = false;
        singleRepInput.classList.remove('hidden');
        repRangeInputs.classList.add('hidden');
        exerciseRepsInput.value = preferences.defaultReps;
      } else {
        // No default reps set, show single reps input by default
        useRepRange.checked = false;
        singleRepInput.classList.remove('hidden');
        repRangeInputs.classList.add('hidden');
        exerciseRepsInput.value = '';
      }
      
      exerciseSetsInput.value = preferences.defaultSets || '';
      
      // If a day was specified in the URL, select it
      if (selectedDay) {
        daySelect.value = selectedDay;
        validateForm();
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
    const repValue = exercise.minReps ? `${exercise.minReps}-${exercise.maxReps}` : exercise.reps;
    return `${exercise.name.toLowerCase()}_${repValue}_${exercise.sets}_${exercise.day.toLowerCase()}`;
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
    const dayName = daySelect.value;
    if (dayName) {
      const exercise = {
        name: exerciseNameInput.value.trim(),
        sets: exerciseSetsInput.value,
        video: exerciseVideoInput.value.trim(),
        notes: exerciseNotesInput.value.trim(),
        day: dayName,
        createdAt: Date.now()
      };

      // Add reps only if provided
      if (useRepRange.checked) {
        if (minRepsInput.value && maxRepsInput.value) {
          exercise.minReps = minRepsInput.value;
          exercise.maxReps = maxRepsInput.value;
        }
      } else if (exerciseRepsInput.value) {
        exercise.reps = exerciseRepsInput.value;
      }

      exercise.id = createExerciseHash(exercise);
      let dayIndex = workoutDays.findIndex(d => d.name === dayName);
      if (dayIndex === -1) {
        workoutDays.push({ name: dayName, exercises: [] });
        dayIndex = workoutDays.length - 1;
      }
      if (isDuplicateExercise(exercise, dayIndex)) {
        showError('This exercise already exists for this day!');
        return;
      }
      workoutDays[dayIndex].exercises.push(exercise);
      saveWorkoutDays();
      clearExerciseForm();
      updateDaySelect();
      validateForm();
      hideError();

      // Show success message with next steps
      const successMessage = document.createElement('div');
      successMessage.className = 'mt-4 p-4 bg-green-50 border border-green-100 rounded-lg';
      successMessage.innerHTML = `
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-green-700 font-medium">Exercise added successfully!</p>
            <p class="text-green-600 mt-1">Ready to start your workout? Head to <a href="/workouts" class="text-green-700 underline">My Workouts</a> to begin.</p>
          </div>
        </div>
      `;
      formContainer.appendChild(successMessage);

      // Remove success message after 5 seconds
      setTimeout(() => {
        successMessage.remove();
      }, 5000);

      // Show success state on button
      const addButton = document.getElementById('addExercise');
      const originalText = addButton.textContent;
      
      addButton.textContent = 'Added!';
      addButton.classList.remove('bg-blue-500', 'hover:bg-blue-600', 'text-white');
      addButton.classList.add('bg-green-500', 'hover:bg-green-600', 'text-green-50');
      
      // Reset button after 2 seconds
      setTimeout(() => {
        addButton.textContent = originalText;
        addButton.classList.remove('bg-green-500', 'hover:bg-green-600', 'text-green-50');
        addButton.classList.add('bg-blue-500', 'hover:bg-blue-600', 'text-white');
      }, 2000);
    }
  }

  // Add click event listener to the add exercise button
  addExerciseButton.addEventListener('click', addExerciseHandler);

  // Function to get YouTube video ID from URL
  function getYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  // Function to clear the exercise form
  function clearExerciseForm() {
    daySelect.value = '';
    exerciseNameInput.value = '';
    exerciseRepsInput.value = '';
    minRepsInput.value = '';
    maxRepsInput.value = '';
    exerciseSetsInput.value = '';
    exerciseVideoInput.value = '';
    exerciseNotesInput.value = '';
    useRepRange.checked = false;
    singleRepInput.classList.remove('hidden');
    repRangeInputs.classList.add('hidden');
    
    // Reset video preview
    const previewIframe = document.getElementById('videoPreview');
    const placeholder = document.getElementById('videoPreviewPlaceholder');
    previewIframe.src = '';
    previewIframe.classList.add('hidden');
    placeholder.classList.remove('hidden');
  }

  // Load preferences
  function loadPreferences() {
    const defaultPreferences = {
      defaultReps: 10,
      defaultSets: 3,
      defaultRestDuration: 60,
      restTimerSound: true
    };
    
    const savedPreferences = localStorage.getItem('preferences');
    return savedPreferences ? JSON.parse(savedPreferences) : defaultPreferences;
  }
} 