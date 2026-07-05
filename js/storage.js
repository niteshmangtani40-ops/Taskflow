const STORAGE_KEY = 'taskflow.tasks';
const THEME_KEY = 'taskflow.theme';

export function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Failed to load tasks', error);
    return [];
  }
}

export function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function loadTheme() {
  return localStorage.getItem(THEME_KEY) || 'light';
}

export function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

export function exportTasks(tasks) {
  const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'taskflow-tasks.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
