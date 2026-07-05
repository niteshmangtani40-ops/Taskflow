export function createToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 2200);
}

export function renderStats(tasks) {
  const statsGrid = document.getElementById('statsGrid');
  const completed = tasks.filter((task) => task.completed).length;
  const pending = tasks.length - completed;
  const percentage = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  statsGrid.innerHTML = `
    <article class="stat-card">
      <div class="stat-top"><span>Total Tasks</span><span>📋</span></div>
      <div class="stat-value">${tasks.length}</div>
      <div class="progress-track"><div class="progress-bar" style="width:${percentage}%"></div></div>
    </article>
    <article class="stat-card">
      <div class="stat-top"><span>Completed</span><span>✅</span></div>
      <div class="stat-value">${completed}</div>
      <div class="progress-track"><div class="progress-bar" style="width:${percentage}%"></div></div>
    </article>
    <article class="stat-card">
      <div class="stat-top"><span>Pending</span><span>⏳</span></div>
      <div class="stat-value">${pending}</div>
      <div class="progress-track"><div class="progress-bar" style="width:${100 - percentage}%"></div></div>
    </article>
    <article class="stat-card">
      <div class="stat-top"><span>Completion</span><span>📈</span></div>
      <div class="stat-value">${percentage}%</div>
      <div class="progress-track"><div class="progress-bar" style="width:${percentage}%"></div></div>
    </article>
  `;
}

export function renderFilters(activeFilter, onFilterChange) {
  const filters = document.getElementById('filters');
  const options = ['all', 'active', 'completed'];
  filters.innerHTML = options
    .map((value) => {
      const label = value.charAt(0).toUpperCase() + value.slice(1);
      const activeClass = activeFilter === value ? 'active' : '';
      return `<button class="filter-btn ${activeClass}" data-filter="${value}" type="button">${label}</button>`;
    })
    .join('');

  filters.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => onFilterChange(button.dataset.filter));
  });
}

export function renderTaskList(tasks, onToggle, onEdit, onDelete) {
  const list = document.getElementById('tasksList');
  const count = document.getElementById('taskCount');
  count.textContent = `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`;

  if (!tasks.length) {
    list.innerHTML = `
      <div class="empty-state">
        <span class="emoji">🌿</span>
        <h4>No tasks yet</h4>
        <p>Capture your next focus and keep the momentum going.</p>
      </div>
    `;
    return;
  }

  list.innerHTML = tasks
    .map((task) => {
      const dueDate = task.dueDate ? new Date(task.dueDate + 'T00:00:00').toLocaleDateString() : 'No due date';
      const priorityClass = `priority-${task.priority.toLowerCase()}`;
      const overdue = task.dueDate && !task.completed && new Date(task.dueDate + 'T00:00:00') < new Date(new Date().toDateString());
      const cardClass = `task-card ${task.completed ? 'completed' : ''} ${overdue ? 'overdue' : ''}`;
      return `
        <article class="${cardClass}" data-id="${task.id}">
          <div class="task-header">
            <div>
              <div class="task-title-row">
                <span class="task-title">${task.title}</span>
                ${task.completed ? '<span>✅</span>' : ''}
              </div>
              <p class="task-meta">${task.description || 'No description added.'}</p>
            </div>
            <div class="badge-row">
              <span class="priority-badge ${priorityClass}">${task.priority}</span>
              <span class="category-badge">${task.category}</span>
              <span class="status-badge ${task.completed ? 'completed' : ''}">${task.completed ? 'Completed' : 'Active'}</span>
            </div>
          </div>
          <div class="task-meta">📅 ${dueDate}</div>
          <div class="task-actions">
            <label class="checkbox-pill">
              <input type="checkbox" ${task.completed ? 'checked' : ''} data-action="toggle" />
              <span>${task.completed ? 'Completed' : 'Mark complete'}</span>
            </label>
            <div class="action-group">
              <button class="icon-btn" data-action="edit" type="button">✎</button>
              <button class="icon-btn danger" data-action="delete" type="button">🗑</button>
            </div>
          </div>
        </article>
      `;
    })
    .join('');

  list.querySelectorAll('[data-action]').forEach((element) => {
    element.addEventListener('click', (event) => {
      const card = event.target.closest('.task-card');
      const id = Number(card?.dataset.id);
      const action = event.target.dataset.action || element.dataset.action;
      if (action === 'toggle') {
        onToggle(id);
      } else if (action === 'edit') {
        onEdit(id);
      } else if (action === 'delete') {
        onDelete(id);
      }
    });
  });
}

export function openModal(task = null) {
  const overlay = document.getElementById('taskModal');
  const modalTitle = document.getElementById('modalTitle');
  const taskId = document.getElementById('modalTaskId');
  const titleInput = document.getElementById('modalTitleInput');
  const descriptionInput = document.getElementById('modalDescriptionInput');
  const dueDateInput = document.getElementById('modalDueDateInput');
  const priorityInput = document.getElementById('modalPriorityInput');
  const categoryInput = document.getElementById('modalCategoryInput');

  modalTitle.textContent = task ? 'Edit task' : 'Create task';
  taskId.value = task?.id || '';
  titleInput.value = task?.title || '';
  descriptionInput.value = task?.description || '';
  dueDateInput.value = task?.dueDate || '';
  priorityInput.value = task?.priority || 'Medium';
  categoryInput.value = task?.category || 'Study';
  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden', 'false');
  titleInput.focus();
}

export function closeModal() {
  const overlay = document.getElementById('taskModal');
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
  document.getElementById('modalTaskForm').reset();
}
