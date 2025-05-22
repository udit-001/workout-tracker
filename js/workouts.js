import '../css/style.css'

// Load workout data from localStorage
const workoutDays = JSON.parse(localStorage.getItem('workoutDays')) || [];
const completedWorkouts = JSON.parse(localStorage.getItem('completedWorkouts')) || [];

// DOM Elements
const workoutDaysContainer = document.getElementById('workoutDays');

// Load workout days from localStorage on page load
window.addEventListener('DOMContentLoaded', () => {
  renderWorkoutDays();
});

// Save workout days to localStorage whenever they change
function saveWorkoutDays() {
  localStorage.setItem('workoutDays', JSON.stringify(workoutDays));
  localStorage.setItem('completedWorkouts', JSON.stringify(completedWorkouts));
}

// Extract YouTube video ID from URL
function getYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Render all workout days and their exercises
function renderWorkoutDays() {
  workoutDaysContainer.innerHTML = '';
  
  // Check if there are any workouts
  const hasWorkouts = workoutDays.some(day => day.exercises.length > 0);
  
  // Show/hide reset button based on data presence
  const resetButtonContainer = document.getElementById('resetButtonContainer');
  resetButtonContainer.classList.toggle('hidden', !hasWorkouts);
  
  if (!hasWorkouts) {
    const emptyState = document.createElement('div');
    emptyState.className = 'bg-white rounded shadow-sm border border-gray-100 p-4 text-center';
    emptyState.innerHTML = `
      <p class="text-gray-500 mb-3">No workouts added yet</p>
      <a href="add-exercise.html" class="text-blue-600 hover:text-blue-700 transition-colors">
        Add your first workout →
      </a>
    `;
    workoutDaysContainer.appendChild(emptyState);
    return;
  }

  workoutDays.forEach((day, dayIndex) => {
    if (day.exercises.length > 0) {
      const dayElement = document.createElement('div');
      dayElement.className = 'bg-white rounded shadow-sm border border-gray-100 mb-4 overflow-hidden';
      
      // Create the accordion header
      const header = document.createElement('div');
      header.className = 'flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors';
      header.innerHTML = `
        <div class="flex items-center mb-3 sm:mb-0">
          <svg class="w-5 h-5 mr-2 text-gray-500 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
          <h2 class="text-lg md:text-xl font-semibold text-gray-700">${day.name}</h2>
          <span class="ml-3 text-sm text-gray-500">${day.exercises.length} exercises</span>
        </div>
        <div class="flex items-center gap-2">
          <a href="add-exercise.html?day=${day.name}" class="bg-green-100 text-green-600 px-3 py-1 rounded hover:bg-green-200 transition-colors text-sm whitespace-nowrap">
            Add Exercise
          </a>
          <a href="workout.html?day=${dayIndex}" class="bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200 transition-colors text-sm whitespace-nowrap">
            View
          </a>
        </div>
      `;
      
      // Create the collapsible content
      const content = document.createElement('div');
      content.className = 'border-t border-gray-100 hidden';
      const exercisesList = document.createElement('ul');
      exercisesList.className = 'p-4 space-y-3';
      
      day.exercises.forEach((exercise, exerciseIndex) => {
        const exerciseItem = document.createElement('li');
        exerciseItem.className = 'border border-gray-100 p-4 rounded bg-gray-50';
        
        // Format reps display
        let repsDisplay = '';
        if (exercise.minReps && exercise.maxReps) {
          repsDisplay = `${exercise.minReps}-${exercise.maxReps} reps`;
        } else if (exercise.reps) {
          repsDisplay = `${exercise.reps} reps`;
        }
        
        exerciseItem.innerHTML = `
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div class="flex-1">
              <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                <h3 class="text-lg font-semibold text-gray-800">${exercise.name}</h3>
                <div class="flex flex-wrap gap-2">
                  ${repsDisplay ? `
                    <div class="flex items-center bg-blue-50 px-2.5 py-1 rounded-full">
                      <svg class="w-3.5 h-3.5 text-blue-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span class="text-sm text-blue-600 font-medium">${repsDisplay}</span>
                    </div>
                  ` : ''}
                  <div class="flex items-center bg-green-50 px-2.5 py-1 rounded-full">
                    <svg class="w-3.5 h-3.5 text-green-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span class="text-sm text-green-600 font-medium">${exercise.sets} sets</span>
                  </div>
                </div>
              </div>
              <div class="space-y-2">
                ${exercise.video ? `
                  <a href="${exercise.video}" target="_blank" 
                     class="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Watch Video
                  </a>
                ` : ''}
                ${exercise.notes ? `
                  <p class="text-gray-600 text-sm">
                    <span class="font-medium text-gray-700">Notes:</span> ${exercise.notes}
                  </p>
                ` : ''}
              </div>
            </div>
            <div class="flex gap-2 sm:ml-4">
              <a href="add-exercise.html?hash=${exercise.id}&day=${dayIndex}&exercise=${exerciseIndex}" 
                 class="edit-exercise-btn bg-gray-100 text-gray-600 p-2 rounded hover:bg-gray-200 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </a>
              <button onclick="deleteExercise(${dayIndex}, ${exerciseIndex})"
                      class="delete-exercise-btn bg-red-50 text-red-600 p-2 rounded hover:bg-red-100 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        `;
        exercisesList.appendChild(exerciseItem);
      });
      
      content.appendChild(exercisesList);
      dayElement.appendChild(header);
      dayElement.appendChild(content);
      
      // Add click handler for accordion functionality
      header.addEventListener('click', (e) => {
        // Don't toggle if clicking the "Start Workout" button
        if (e.target.closest('a')) return;
        
        const isExpanded = content.classList.contains('hidden');
        const arrow = header.querySelector('svg');
        
        if (isExpanded) {
          content.classList.remove('hidden');
          arrow.classList.add('rotate-180');
        } else {
          content.classList.add('hidden');
          arrow.classList.remove('rotate-180');
        }
      });
      
      workoutDaysContainer.appendChild(dayElement);
    }
  });
}

// Reset all data
function resetAllData() {
  if (confirm('Are you sure you want to reset all workout data? This action cannot be undone.')) {
    localStorage.removeItem('workoutDays');
    localStorage.removeItem('completedWorkouts');
    workoutDays.length = 0;
    renderWorkoutDays();
  }
}

// Add event listener for reset button
document.getElementById('resetData').addEventListener('click', resetAllData);

// Add delete exercise function
function deleteExercise(dayIndex, exerciseIndex) {
  if (confirm('Are you sure you want to delete this exercise? This action cannot be undone.')) {
    workoutDays[dayIndex].exercises.splice(exerciseIndex, 1);
    saveWorkoutDays();
    renderWorkoutDays();
  }
}

// Make deleteExercise available globally
window.deleteExercise = deleteExercise; 