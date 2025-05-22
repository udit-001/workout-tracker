import "../css/style.css";

// DOM Elements
const preferencesForm = document.getElementById('preferencesForm');
const defaultRepsInput = document.getElementById('defaultReps');
const defaultMinRepsInput = document.getElementById('defaultMinReps');
const defaultMaxRepsInput = document.getElementById('defaultMaxReps');
const defaultSetsInput = document.getElementById('defaultSets');
const defaultRestDurationInput = document.getElementById('defaultRestDuration');
const restTimerSoundInput = document.getElementById('restTimerSound');

// Error message elements
const defaultRepsError = document.getElementById('defaultRepsError');
const defaultMinRepsError = document.getElementById('defaultMinRepsError');
const defaultMaxRepsError = document.getElementById('defaultMaxRepsError');
const defaultSetsError = document.getElementById('defaultSetsError');
const defaultRestDurationError = document.getElementById('defaultRestDurationError');

// Default preferences
const defaultPreferences = {
  defaultReps: 10,
  defaultMinReps: null,
  defaultMaxReps: null,
  defaultSets: 3,
  defaultRestDuration: 60,
  restTimerSound: true
};

// Validation functions
function validateReps(value) {
  if (!value) return '';
  const num = parseInt(value);
  if (isNaN(num)) return 'Please enter a valid number';
  if (num < 1) return 'Reps must be at least 1';
  if (num > 100) return 'Reps cannot exceed 100';
  return '';
}

function validateSets(value) {
  if (!value) return '';
  const num = parseInt(value);
  if (isNaN(num)) return 'Please enter a valid number';
  if (num < 1) return 'Sets must be at least 1';
  if (num > 20) return 'Sets cannot exceed 20';
  return '';
}

function validateRestDuration(value) {
  if (!value) return '';
  const num = parseInt(value);
  if (isNaN(num)) return 'Please enter a valid number';
  if (num < 0) return 'Duration cannot be negative';
  if (num > 300) return 'Duration cannot exceed 300 seconds';
  return '';
}

function validateRepRange(min, max) {
  if (!min && !max) return { min: '', max: '' };
  
  const minNum = parseInt(min);
  const maxNum = parseInt(max);
  
  const errors = {
    min: validateReps(min),
    max: validateReps(max)
  };

  if (!errors.min && !errors.max && minNum > maxNum) {
    errors.min = 'Minimum reps cannot be greater than maximum reps';
  }

  return errors;
}

// Show/hide error message
function showError(element, message) {
  element.textContent = message;
  element.style.visibility = message ? 'visible' : 'hidden';
}

// Load preferences from localStorage
function loadPreferences() {
  const savedPreferences = localStorage.getItem('preferences');
  return savedPreferences ? JSON.parse(savedPreferences) : defaultPreferences;
}

// Save preferences to localStorage
function savePreferences(preferences) {
  localStorage.setItem('preferences', JSON.stringify(preferences));
}

// Initialize form with saved preferences
function initializeForm() {
  const preferences = loadPreferences();
  defaultRepsInput.value = preferences.defaultReps || '';
  defaultMinRepsInput.value = preferences.defaultMinReps || '';
  defaultMaxRepsInput.value = preferences.defaultMaxReps || '';
  defaultSetsInput.value = preferences.defaultSets || '';
  defaultRestDurationInput.value = preferences.defaultRestDuration || '';
  restTimerSoundInput.checked = preferences.restTimerSound;
}

// Handle form submission
preferencesForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Validate all fields
  const repsError = validateReps(defaultRepsInput.value);
  const setsError = validateSets(defaultSetsInput.value);
  const restDurationError = validateRestDuration(defaultRestDurationInput.value);
  const repRangeErrors = validateRepRange(defaultMinRepsInput.value, defaultMaxRepsInput.value);

  // Show all errors
  showError(defaultRepsError, repsError);
  showError(defaultSetsError, setsError);
  showError(defaultRestDurationError, restDurationError);
  showError(defaultMinRepsError, repRangeErrors.min);
  showError(defaultMaxRepsError, repRangeErrors.max);

  // If any errors exist, don't submit
  if (repsError || setsError || restDurationError || repRangeErrors.min || repRangeErrors.max) {
    return;
  }

  const preferences = {
    defaultReps: defaultRepsInput.value ? parseInt(defaultRepsInput.value) : null,
    defaultMinReps: defaultMinRepsInput.value ? parseInt(defaultMinRepsInput.value) : null,
    defaultMaxReps: defaultMaxRepsInput.value ? parseInt(defaultMaxRepsInput.value) : null,
    defaultSets: parseInt(defaultSetsInput.value) || defaultPreferences.defaultSets,
    defaultRestDuration: parseInt(defaultRestDurationInput.value) || defaultPreferences.defaultRestDuration,
    restTimerSound: restTimerSoundInput.checked
  };

  // Clear other reps fields if one is filled
  if (preferences.defaultReps) {
    preferences.defaultMinReps = null;
    preferences.defaultMaxReps = null;
  } else if (preferences.defaultMinReps || preferences.defaultMaxReps) {
    preferences.defaultReps = null;
  }

  savePreferences(preferences);
  showToast();
});

// Add input event listeners for validation
defaultRepsInput.addEventListener('input', () => {
  showError(defaultRepsError, validateReps(defaultRepsInput.value));
  if (defaultRepsInput.value) {
    defaultMinRepsInput.value = '';
    defaultMaxRepsInput.value = '';
    showError(defaultMinRepsError, '');
    showError(defaultMaxRepsError, '');
  }
});

defaultMinRepsInput.addEventListener('input', () => {
  const errors = validateRepRange(defaultMinRepsInput.value, defaultMaxRepsInput.value);
  showError(defaultMinRepsError, errors.min);
  showError(defaultMaxRepsError, errors.max);
  if (defaultMinRepsInput.value) {
    defaultRepsInput.value = '';
    showError(defaultRepsError, '');
  }
});

defaultMaxRepsInput.addEventListener('input', () => {
  const errors = validateRepRange(defaultMinRepsInput.value, defaultMaxRepsInput.value);
  showError(defaultMinRepsError, errors.min);
  showError(defaultMaxRepsError, errors.max);
  if (defaultMaxRepsInput.value) {
    defaultRepsInput.value = '';
    showError(defaultRepsError, '');
  }
});

defaultSetsInput.addEventListener('input', () => {
  showError(defaultSetsError, validateSets(defaultSetsInput.value));
});

defaultRestDurationInput.addEventListener('input', () => {
  showError(defaultRestDurationError, validateRestDuration(defaultRestDurationInput.value));
});

// Function to show toast notification
function showToast() {
  const button = preferencesForm.querySelector('button[type="submit"]');
  const originalText = button.textContent;
  button.textContent = 'Saved!';
  button.classList.remove('bg-blue-500', 'hover:bg-blue-600');
  button.classList.add('bg-green-500', 'hover:bg-green-600');
  
  setTimeout(() => {
    button.textContent = originalText;
    button.classList.remove('bg-green-500', 'hover:bg-green-600');
    button.classList.add('bg-blue-500', 'hover:bg-blue-600');
  }, 2000);
}

// Initialize form when page loads
initializeForm(); 