import '../css/style.css'
import { loadWorkoutDays } from './data.js'

const completedWorkouts = JSON.parse(localStorage.getItem('completedWorkouts')) || [];

const workoutDaysContainer = document.getElementById('workoutDays');

function getYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function renderWorkoutDays(workoutDays) {
  workoutDaysContainer.innerHTML = '';
  
  const hasWorkouts = workoutDays.some(day => day.exercises.length > 0);
  
  if (!hasWorkouts) {
    const emptyState = document.createElement('div');
    emptyState.className = 'bg-white rounded shadow-sm border border-gray-100 p-4 text-center';
    emptyState.innerHTML = `
      <p class="text-gray-500 mb-3">No workouts added yet</p>
    `;
    workoutDaysContainer.appendChild(emptyState);
    return;
  }

  workoutDays.forEach((day, dayIndex) => {
    if (day.exercises.length > 0) {
      const dayElement = document.createElement('div');
      dayElement.className = 'bg-white rounded shadow-sm border border-gray-100 mb-4 overflow-hidden';
      
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
          <a href="workout.html?day=${encodeURIComponent(day.slug)}" class="bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200 transition-colors text-sm whitespace-nowrap">
            View
          </a>
        </div>
      `;
      
      const content = document.createElement('div');
      content.className = 'border-t border-gray-100 hidden';
      const exercisesList = document.createElement('ul');
      exercisesList.className = 'p-4 space-y-3';
      
      day.exercises.forEach((exercise) => {
        const exerciseItem = document.createElement('li');
        exerciseItem.className = 'border border-gray-100 p-4 rounded bg-gray-50';
        
        let repsDisplay = '';
        if (exercise.minReps && exercise.maxReps) {
          repsDisplay = `${exercise.minReps}-${exercise.maxReps} reps`;
        } else if (exercise.reps) {
          repsDisplay = `${exercise.reps} reps`;
        }
        
        exerciseItem.innerHTML = `
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
        `;
        exercisesList.appendChild(exerciseItem);
      });
      
      content.appendChild(exercisesList);
      dayElement.appendChild(header);
      dayElement.appendChild(content);
      
      header.addEventListener('click', (e) => {
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

(async () => {
  const workoutDays = await loadWorkoutDays();
  renderWorkoutDays(workoutDays);
})();
