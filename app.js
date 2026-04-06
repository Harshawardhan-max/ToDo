const STORAGE_KEY = "focusflow-todos";

const state = {
  todos: loadTodos(),
  filter: "all",
  search: "",
};

const elements = {
  todoForm: document.getElementById("todoForm"),
  todoInput: document.getElementById("todoInput"),
  searchInput: document.getElementById("searchInput"),
  todoList: document.getElementById("todoList"),
  emptyState: document.getElementById("emptyState"),
  totalCount: document.getElementById("totalCount"),
  completedCount: document.getElementById("completedCount"),
  statusCopy: document.getElementById("statusCopy"),
  todayLabel: document.getElementById("todayLabel"),
  clearCompletedButton: document.getElementById("clearCompletedButton"),
  template: document.getElementById("todoItemTemplate"),
  filterButtons: Array.from(document.querySelectorAll("[data-filter]")),
};

initializeApp();

function initializeApp() {
  elements.todayLabel.textContent = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());

  elements.todoForm.addEventListener("submit", handleAddTodo);
  elements.searchInput.addEventListener("input", handleSearch);
  elements.clearCompletedButton.addEventListener("click", clearCompleted);

  elements.filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      syncFilterButtons();
      render();
    });
  });

  syncFilterButtons();
  render();
}

function loadTodos() {
  const stored = localStorage.getItem(STORAGE_KEY);
  const starterTodos = buildStarterTodos();

  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(starterTodos));
    return starterTodos;
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : starterTodos;
  } catch (error) {
    console.error("Failed to parse todos from storage:", error);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(starterTodos));
    return starterTodos;
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.todos));
}

function handleAddTodo(event) {
  event.preventDefault();
  const text = elements.todoInput.value.trim();

  if (!text) {
    elements.todoInput.focus();
    return;
  }

  state.todos.unshift({
    id: createId(),
    text,
    completed: false,
    createdAt: new Date().toISOString(),
  });

  elements.todoInput.value = "";
  saveTodos();
  render();
}

function handleSearch(event) {
  state.search = event.target.value.trim().toLowerCase();
  render();
}

function toggleTodo(id) {
  state.todos = state.todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  saveTodos();
  render();
}

function deleteTodo(id) {
  state.todos = state.todos.filter((todo) => todo.id !== id);
  saveTodos();
  render();
}

function editTodo(id) {
  const todo = state.todos.find((item) => item.id === id);

  if (!todo) {
    return;
  }

  const nextText = window.prompt("Edit your task:", todo.text);

  if (nextText === null) {
    return;
  }

  const trimmed = nextText.trim();

  if (!trimmed) {
    deleteTodo(id);
    return;
  }

  state.todos = state.todos.map((item) =>
    item.id === id ? { ...item, text: trimmed } : item
  );
  saveTodos();
  render();
}

function clearCompleted() {
  const hasCompleted = state.todos.some((todo) => todo.completed);

  if (!hasCompleted) {
    return;
  }

  state.todos = state.todos.filter((todo) => !todo.completed);
  saveTodos();
  render();
}

function getVisibleTodos() {
  return state.todos.filter((todo) => {
    const matchesFilter =
      state.filter === "all" ||
      (state.filter === "active" && !todo.completed) ||
      (state.filter === "completed" && todo.completed);

    const matchesSearch = todo.text.toLowerCase().includes(state.search);
    return matchesFilter && matchesSearch;
  });
}

function syncFilterButtons() {
  elements.filterButtons.forEach((button) => {
    const active = button.dataset.filter === state.filter;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });
}

function render() {
  const visibleTodos = getVisibleTodos();
  const completedCount = state.todos.filter((todo) => todo.completed).length;
  const activeCount = state.todos.length - completedCount;

  elements.totalCount.textContent = String(state.todos.length);
  elements.completedCount.textContent = String(completedCount);
  elements.statusCopy.textContent =
    activeCount === 1
      ? "1 task left to finish."
      : `${activeCount} tasks left to finish.`;
  elements.clearCompletedButton.disabled = completedCount === 0;
  elements.todoList.innerHTML = "";

  if (visibleTodos.length === 0) {
    elements.emptyState.hidden = false;
    return;
  }

  elements.emptyState.hidden = true;

  visibleTodos.forEach((todo) => {
    const fragment = elements.template.content.cloneNode(true);
    const item = fragment.querySelector(".todo-item");
    const toggle = fragment.querySelector(".todo-toggle");
    const text = fragment.querySelector(".todo-text");
    const meta = fragment.querySelector(".todo-meta");
    const editButton = fragment.querySelector(".edit-button");
    const deleteButton = fragment.querySelector(".delete-button");

    item.dataset.id = todo.id;
    item.classList.toggle("is-complete", todo.completed);
    toggle.checked = todo.completed;
    text.textContent = todo.text;
    meta.textContent = todo.completed
      ? `Completed | ${formatTimestamp(todo.createdAt)}`
      : `Added | ${formatTimestamp(todo.createdAt)}`;

    toggle.addEventListener("change", () => toggleTodo(todo.id));
    editButton.addEventListener("click", () => editTodo(todo.id));
    deleteButton.addEventListener("click", () => deleteTodo(todo.id));

    elements.todoList.appendChild(fragment);
  });
}

function formatTimestamp(isoString) {
  const date = new Date(isoString);

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function buildStarterTodos() {
  return [
    {
      id: createId(),
      text: "Plan the top 3 priorities for today",
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: createId(),
      text: "Reply to important messages",
      completed: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
    {
      id: createId(),
      text: "Review tomorrow's schedule",
      completed: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    },
  ];
}

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `todo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
