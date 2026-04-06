const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
const difficultySelect = document.getElementById("difficultySelect");
const themeToggle = document.getElementById("themeToggle");

let todos = JSON.parse(localStorage.getItem("todos")) || [];

/* THEME */
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
});

/* ADD TODO */
todoForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const task = {
    text: todoInput.value,
    difficulty: difficultySelect.value,
    completed: false,
  };

  todos.push(task);
  saveTodos();
  render();

  todoInput.value = "";
});

/* RENDER */
function render() {
  todoList.innerHTML = "";

  todos.forEach((todo, index) => {
    const li = document.createElement("li");
    li.className = "todo-item";

    li.innerHTML = `
      <span style="text-decoration:${todo.completed ? "line-through" : "none"}">
        ${todo.text}
      </span>

      <span class="difficulty ${todo.difficulty}">
        ${todo.difficulty}
      </span>

      <button onclick="toggle(${index})">✔</button>
      <button onclick="removeTodo(${index})">❌</button>
    `;

    todoList.appendChild(li);
  });
}

/* TOGGLE */
function toggle(index) {
  todos[index].completed = !todos[index].completed;
  saveTodos();
  render();
}

/* DELETE */
function removeTodo(index) {
  todos.splice(index, 1);
  saveTodos();
  render();
}

/* SAVE */
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

render();
