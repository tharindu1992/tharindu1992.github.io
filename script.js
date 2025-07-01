document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'workoutProgress';
  
  // Enhanced data structure for better organization
  function getWorkoutData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  }
  
  function saveWorkoutData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
  
  function updateExercise(exerciseId, field, value) {
    const data = getWorkoutData();
    if (!data[exerciseId]) data[exerciseId] = {};
    data[exerciseId][field] = value;
    data[exerciseId].lastUpdated = new Date().toISOString();
    saveWorkoutData(data);
  }

  const checkboxes = document.querySelectorAll('input[type="checkbox"]');

  checkboxes.forEach(chk => {
    const exerciseId = chk.id;
    const workoutData = getWorkoutData();
    const exerciseData = workoutData[exerciseId] || {};

    // ——— Load & save the checkbox state ———
    if (exerciseData.completed === true) chk.checked = true;
    
    chk.addEventListener('change', () => {
      updateExercise(exerciseId, 'completed', chk.checked);
      updateProgressStats();
    });

    // ——— Create & insert the weight input ———
    const li = chk.closest('li');
    const weightInput = document.createElement('input');
    weightInput.type = 'number';
    weightInput.step = '0.5';
    weightInput.placeholder = 'Weight (kg)';
    weightInput.id = `${exerciseId}-weight`;
    weightInput.className = 'weight-input';

    // Load saved weight if any
    if (exerciseData.weight !== undefined) {
      weightInput.value = exerciseData.weight;
    }

    // Save on user input with debouncing
    let weightTimeout;
    weightInput.addEventListener('input', () => {
      clearTimeout(weightTimeout);
      weightTimeout = setTimeout(() => {
        updateExercise(exerciseId, 'weight', weightInput.value);
      }, 500);
    });

    // Create a wrapper for better styling
    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'input-wrapper';
    inputWrapper.appendChild(weightInput);
    
    // Add reps input for tracking actual reps completed
    const repsInput = document.createElement('input');
    repsInput.type = 'number';
    repsInput.placeholder = 'Reps';
    repsInput.id = `${exerciseId}-reps`;
    repsInput.className = 'reps-input';
    
    if (exerciseData.reps !== undefined) {
      repsInput.value = exerciseData.reps;
    }
    
    let repsTimeout;
    repsInput.addEventListener('input', () => {
      clearTimeout(repsTimeout);
      repsTimeout = setTimeout(() => {
        updateExercise(exerciseId, 'reps', repsInput.value);
      }, 500);
    });
    
    inputWrapper.appendChild(repsInput);
    li.appendChild(inputWrapper);
  });

  // Progress tracking function
  function updateProgressStats() {
    const data = getWorkoutData();
    const stats = calculateStats(data);
    displayStats(stats);
  }

  function calculateStats(data) {
    const weeks = {1: 0, 2: 0, 3: 0, 4: 0};
    const weekTotals = {1: 0, 2: 0, 3: 0, 4: 0};
    
    Object.keys(data).forEach(exerciseId => {
      if (data[exerciseId].completed) {
        const week = parseInt(exerciseId.charAt(1));
        if (weeks[week] !== undefined) weeks[week]++;
      }
    });
    
    // Count total exercises per week
    document.querySelectorAll('.week').forEach(weekEl => {
      const weekNum = parseInt(weekEl.id.replace('week', ''));
      weekTotals[weekNum] = weekEl.querySelectorAll('input[type="checkbox"]').length;
    });
    
    return {weeks, weekTotals};
  }

  function displayStats(stats) {
    Object.keys(stats.weeks).forEach(week => {
      const weekEl = document.getElementById(`week${week}`);
      if (weekEl) {
        let progressEl = weekEl.querySelector('.week-progress');
        if (!progressEl) {
          progressEl = document.createElement('div');
          progressEl.className = 'week-progress';
          weekEl.querySelector('h2').insertAdjacentElement('afterend', progressEl);
        }
        
        const completed = stats.weeks[week];
        const total = stats.weekTotals[week];
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        progressEl.innerHTML = `Progress: ${completed}/${total} exercises (${percentage}%)`;
      }
    });
  }

  // Export data function
  window.exportWorkoutData = function() {
    const data = getWorkoutData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workout-progress-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import data function
  window.importWorkoutData = function(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = JSON.parse(e.target.result);
        saveWorkoutData(data);
        location.reload(); // Reload to show imported data
      } catch (error) {
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  // Initialize progress display
  updateProgressStats();
});
