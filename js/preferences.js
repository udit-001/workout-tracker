import "../css/style.css";

// DOM Elements
const preferencesForm = document.getElementById('preferencesForm');
const defaultRepsInput = document.getElementById('defaultReps');
const defaultMinRepsInput = document.getElementById('defaultMinReps');
const defaultMaxRepsInput = document.getElementById('defaultMaxReps');
const defaultSetsInput = document.getElementById('defaultSets');
const defaultRestDurationInput = document.getElementById('defaultRestDuration');
const restTimerSoundInput = document.getElementById('restTimerSound');

// Default preferences
const defaultPreferences = {
  defaultReps: 10,
  defaultMinReps: null,
  defaultMaxReps: null,
  defaultSets: 3,
  defaultRestDuration: 60,
  restTimerSound: true
};

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
  
  const preferences = {
    defaultReps: defaultRepsInput.value ? parseInt(defaultRepsInput.value) : null,
    defaultMinReps: defaultMinRepsInput.value ? parseInt(defaultMinRepsInput.value) : null,
    defaultMaxReps: defaultMaxRepsInput.value ? parseInt(defaultMaxRepsInput.value) : null,
    defaultSets: parseInt(defaultSetsInput.value) || defaultPreferences.defaultSets,
    defaultRestDuration: parseInt(defaultRestDurationInput.value) || defaultPreferences.defaultRestDuration,
    restTimerSound: restTimerSoundInput.checked
  };

  // Validate rep range if provided
  if (preferences.defaultMinReps && preferences.defaultMaxReps) {
    if (preferences.defaultMinReps > preferences.defaultMaxReps) {
      alert('Minimum reps cannot be greater than maximum reps');
      return;
    }
  }

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
  if (defaultRepsInput.value) {
    defaultMinRepsInput.value = '';
    defaultMaxRepsInput.value = '';
  }
});

defaultMinRepsInput.addEventListener('input', () => {
  if (defaultMinRepsInput.value) {
    defaultRepsInput.value = '';
  }
});

defaultMaxRepsInput.addEventListener('input', () => {
  if (defaultMaxRepsInput.value) {
    defaultRepsInput.value = '';
  }
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