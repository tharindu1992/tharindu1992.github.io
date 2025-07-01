document.addEventListener('DOMContentLoaded', () => {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');

  checkboxes.forEach(chk => {
    // ——— Load & save the checkbox state ———
    const savedCheck = localStorage.getItem(chk.id);
    if (savedCheck === 'true') chk.checked = true;
    chk.addEventListener('change', () => {
      localStorage.setItem(chk.id, chk.checked);
    });

    // ——— Create & insert the weight input ———
    const li = chk.closest('li');
    const weightInput = document.createElement('input');
    weightInput.type = 'number';
    weightInput.step = '0.5';
    weightInput.placeholder = 'Weight (kg)';
    weightInput.id = `${chk.id}-weight`;

    // Load saved weight if any
    const savedWeight = localStorage.getItem(weightInput.id);
    if (savedWeight !== null) weightInput.value = savedWeight;

    // Save on user input
    weightInput.addEventListener('input', () => {
      localStorage.setItem(weightInput.id, weightInput.value);
    });

    // Append right after the checkbox
    li.appendChild(weightInput);
  });
});
