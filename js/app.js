import { loadTasks, saveTasks, loadTheme, saveTheme, exportTasks } from './storage.js';
import { createToast, renderStats, renderFilters, renderTaskList, openModal, closeModal } from './ui.js';
import { applyFilters } from './filters.js';

let tasks = loadTasks();
let activeFilter = 'all';
let searchQuery = '';
let sortOrder = 'newest';
let editingTaskId = null;

const form = document.getElementById('taskForm');
const modalForm = document.getElementById('modalTaskForm');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const themeToggle = document.getElementById('themeToggle');
const openModalButton = document.getElementById('openTaskModal');
const closeModalButton = document.getElementById('closeModal');
const cancelModalButton = document.getElementById('cancelModal');
const modalOverlay = document.getElementById('taskModal');
const resetFormButton = document.getElementById('resetForm');
const exportButton = document.getElementById('exportTasks');
const importButton = document.getElementById('importTasks');
const importFileInput = document.getElementById('importFile');

function initializeTheme() {
  const theme = loadTheme();
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function persistAndRender() {
  saveTasks(tasks);
  renderStats(tasks);
  const visibleTasks = applyFilters(tasks, activeFilter, searchQuery, sortOrder);
  renderTaskList(visibleTasks, handleToggleTask, handleEditTask, handleDeleteTask);
}

function createTaskFromForm(formData) {
  const title = formData.get('title')?.trim();
  if (!title) {
    createToast('Title is required.', 'error');
    return null;
  }

  return {
    id: Date.now(),
    title,
    description: formData.get('description')?.trim() || '',
    dueDate: formData.get('dueDate')?.trim() || '',
    priority: formData.get('priority') || 'Medium',
    category: formData.get('category') || 'Study',
    completed: false,
    createdAt: new Date().toISOString()
  };
}

function resetForm() {
  form.reset();
  editingTaskId = null;
}

function handleSubmit(event) {
  event.preventDefault();
  const formData = new FormData(form);
  const newTask = createTaskFromForm(formData);
  if (!newTask) return;

  tasks = [newTask, ...tasks];
  createToast('Task created successfully.', 'success');
  resetForm();
  persistAndRender();
}

function handleToggleTask(id) {
  tasks = tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task));
  createToast('Task updated.', 'info');
  persistAndRender();
}

function handleEditTask(id) {
  const task = tasks.find((item) => item.id === id);
  if (!task) return;
  editingTaskId = id;
  openModal(task);
}

function handleDeleteTask(id) {
  const task = tasks.find((item) => item.id === id);
  if (!task) return;
  const confirmed = confirm(`Delete "${task.title}"?`);
  if (!confirmed) return;
  tasks = tasks.filter((item) => item.id !== id);
  createToast('Task deleted.', 'error');
  persistAndRender();
}

function handleModalSubmit(event) {
  event.preventDefault();
  const formData = new FormData(modalForm);
  const title = formData.get('title')?.trim();
  if (!title) {
    createToast('Title is required.', 'error');
    return;
  }

  tasks = tasks.map((task) => {
    if (task.id !== editingTaskId) return task;
    return {
      ...task,
      title,
      description: formData.get('description')?.trim() || '',
      dueDate: formData.get('dueDate')?.trim() || '',
      priority: formData.get('priority') || task.priority,
      category: formData.get('category') || task.category
    };
  });

  createToast('Task updated.', 'success');
  closeModal();
  editingTaskId = null;
  persistAndRender();
}

function updateFilter(filter) {
  activeFilter = filter;
  renderFilters(activeFilter, updateFilter);
  persistAndRender();
}

function bindEvents() {
  form.addEventListener('submit', handleSubmit);
  resetFormButton.addEventListener('click', resetForm);
  searchInput.addEventListener('input', (event) => {
    searchQuery = event.target.value;
    persistAndRender();
  });
  sortSelect.addEventListener('change', (event) => {
    sortOrder = event.target.value;
    persistAndRender();
  });
  themeToggle.addEventListener('click', () => {
    const nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    saveTheme(nextTheme);
    themeToggle.textContent = nextTheme === 'dark' ? '☀️' : '🌙';
    createToast(`Theme switched to ${nextTheme}.`, 'info');
  });
  openModalButton.addEventListener('click', () => {
    editingTaskId = null;
    openModal();
  });
  closeModalButton.addEventListener('click', closeModal);
  cancelModalButton.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (event) => {
    if (event.target === modalOverlay) closeModal();
  });
  modalForm.addEventListener('submit', handleModalSubmit);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA')) {
      if (document.activeElement?.id === 'searchInput') return;
      if (modalOverlay.classList.contains('show')) return;
      form.requestSubmit();
    }
  });
  exportButton.addEventListener('click', () => exportTasks(tasks));
  importButton.addEventListener('click', () => importFileInput.click());
  importFileInput.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        if (Array.isArray(imported)) {
          tasks = imported;
          saveTasks(tasks);
          persistAndRender();
          createToast('Tasks imported successfully.', 'success');
        } else {
          createToast('Invalid JSON import.', 'error');
        }
      } catch (error) {
        createToast('Could not import file.', 'error');
      }
    };
    reader.readAsText(file);
  });
}

function init() {
  initializeTheme();
  renderFilters(activeFilter, updateFilter);
  bindEvents();
  persistAndRender();
}

init();
