export function applyFilters(tasks, filter, search, sort) {
  let filtered = [...tasks];

  if (filter === 'active') {
    filtered = filtered.filter((task) => !task.completed);
  } else if (filter === 'completed') {
    filtered = filtered.filter((task) => task.completed);
  }

  if (search.trim()) {
    const query = search.toLowerCase();
    filtered = filtered.filter((task) => {
      return [task.title, task.description, task.category]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }

  switch (sort) {
    case 'oldest':
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    case 'dueDate':
      filtered.sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
      break;
    case 'highPriority':
      filtered.sort((a, b) => priorityWeight(b.priority) - priorityWeight(a.priority));
      break;
    case 'lowPriority':
      filtered.sort((a, b) => priorityWeight(a.priority) - priorityWeight(b.priority));
      break;
    case 'alphabetical':
      filtered.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'newest':
    default:
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return filtered;
}

function priorityWeight(priority) {
  switch (priority) {
    case 'High':
      return 3;
    case 'Medium':
      return 2;
    default:
      return 1;
  }
}
