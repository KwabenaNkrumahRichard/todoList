"use strict";
import { CURRENT_DATE, minDate, now } from "./config.js";

let addNewProjectForm = document.querySelector("#add-project-form");
let addNewTodoForm = document.querySelector("#add-todo");
let todayTodoBtn = document.querySelector(".today-todo");
let addNewProjectBtn = document.querySelector(".new-project");
let projectContainer = document.querySelector(".projects");
let displayDate = document.querySelector(".heading-date");
let todoListContainer = document.querySelector(".display-todo");
let addNewTodoBtn = document.querySelector(".add-todo");
let inputProjectName = document.querySelector("#project-name");
let todoTitle = document.querySelector("#todo-title");
let todoDescription = document.querySelector("#todo-description");
let todoDate = document.querySelector("#todo-date");
let todoPriority = document.querySelector("#todo-priority");
let errorMessageTodo = document.querySelector(".display-error");
let errorMessageProject = document.querySelector(".display-projectError");
let closeProjectFormBtn = document.querySelector(".close-project-form");
let closeTodoFormBtn = document.querySelector(".close-todo-form");

let projectName;
let projects = [];
let todoList = [];

displayDate.textContent = CURRENT_DATE;
todoDate.setAttribute("min", minDate());

class ToDo {
  constructor(title, description, dueDate, priority, projectName) {
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.priority = priority;
    this.projectName = projectName;
    this.done = false;
  }
}

//////////////////////////////////////////////////////////////
const deleteProject = function (e) {
  let clicked = e.target.closest(".project-item");
  projectName = clicked.querySelector(".project-item-text").textContent;

  let todolistFiltered = todoList.filter((e) => e.projectName === projectName);

  todoList = todoList.filter((item) => !todolistFiltered.includes(item));

  formDisableOrAble(clicked, 0, "none");

  let index = projects.findIndex((item) => item === projectName);

  projects.splice(index, 1);

  projectName = "";

  todoListContainer.textContent = "";

  removeActiveClass();
  setLocalstorage();
};

/////////////////////////////////////////////////////////////
const addTodo = function (e) {
  e.preventDefault();

  if (!projectName)
    return (errorMessageTodo.textContent =
      "Please choose the project you are adding this todo to");

  let titleExist = todoList.some(
    (item) =>
      item.title.toLowerCase() === todoTitle.value.toLowerCase() &&
      projectName === item.projectName
  );

  if (titleExist)
    return (errorMessageTodo.textContent =
      "Todo title already exist in this project");

  if (
    !todoTitle.value ||
    !todoDescription.value ||
    !todoDate.value ||
    todoPriority.value === "------"
  )
    return (errorMessageTodo.textContent = "All field is required");

  let newTodo = new ToDo(
    todoTitle.value,
    todoDescription.value,
    todoDate.value,
    todoPriority.value,
    projectName
  );

  todoList.push(newTodo);
  calcDaysLeft();

  addTodoCard(projectName);

  todoTitle.value = todoDescription.value = todoDate.value = "";
  todoPriority.value = "------";

  formDisableOrAble(addNewTodoForm, 0, "none");

  setLocalstorage();
};

//////////////////////////////////////////////////////////////
const deleteTodo = function (e) {
  let card = e.target.closest(".todo-item");
  let btnClickedText = card.querySelector(".todo-title").textContent;

  let deletedItem = todoList.filter((item) => item.title === btnClickedText);

  todoList = todoList.filter((item) => !deletedItem.includes(item));
  formDisableOrAble(card, 0, "none");

  let someExist = todoList.some((item) => item.projectName === projectName);

  if (!someExist) ifProjectIsEmpty(someExist);
  setLocalstorage();
};

/////////////////////////////////////////////////////
const markDone = function (e) {
  let card = e.target.closest(".todo-item");
  let btnClickedText = card.querySelector(".todo-title").textContent;

  let [doneItem] = todoList.filter((item) => item.title === btnClickedText);

  todoList = todoList.filter((item) => item !== doneItem);
  doneItem.done = doneItem.done ? false : true;

  todoList.push(doneItem);

  addTodoCard(projectName);
  setLocalstorage();
};

///////////////////////////////////////////////////////////////
const removeActiveClass = function () {
  let projectBtns = document.querySelectorAll(".project-item");

  projectBtns.forEach((e) => e.classList.remove("active"));
};

//////////////////////////////////////////////////////////////
let ifProjectIsEmpty = function (arrayOfTodo, todayClicked = false) {
  if (!arrayOfTodo || arrayOfTodo.length === 0)
    todoListContainer.innerHTML = `<div class="empty-project">
                                              <p>There is NO</p>
                                              <p>${
                                                !todayClicked
                                                  ? "TODO"
                                                  : "TODO FOR TODAY"
                                              }.</p>
                                              <p>ADD SOME</p>
                                            </div>`;
};

/////////////////////////////////////////////////////////////
let HTMLtodocard = function (arrayOfTodolist, todayClicked = false) {
  todoListContainer.textContent = "";

  const doneOrnot = function (item) {
    return item.done
      ? 'style="opacity:0.5; text-decoration: line-through"'
      : "none";
  };

  ifProjectIsEmpty(arrayOfTodolist, todayClicked);

  arrayOfTodolist.forEach((todoItem) => {
    let html = `<div class="todo-item" ${doneOrnot(todoItem)}>
                  <h3 class="todo todo-title">${todoItem.title}</h3>
                  <p class="todo todo-desc">${todoItem.description}</p>
                  <p class="todo todo-date">Due date:${
                    todoItem.done ? todoItem.dueDate : todoItem.daysLeft
                  }</p>
                  <p class="todo todo-priority">${todoItem.priority}</p>
                  <div class="todo todo-buttons">
                    <button class="delete-todo">Remove</button>
                    <button class="mark-done">${
                      todoItem.done ? "Undone" : "Done"
                    }</button>
                  </div>
                  <div class="project-name"><i>${
                    todoItem.projectName
                  }</i>#</div>
                </div>`;

    todoListContainer.insertAdjacentHTML(
      todoItem.done ? "beforeend" : "afterbegin",
      html
    );
  });
};

////////////////////////////////////////////////////////////////
const addTodoCard = function (proName) {
  let todolistFiltered = todoList
    .filter((e) => e.projectName === proName)
    .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));

  HTMLtodocard(todolistFiltered);
};

/////////////////////////////////////////////////////////////////
let projectHTML = function (name) {
  let html = `<div class="project-item active">
  <div class="project-item-text">${name}</div>
  <span>X</span>
  </div>`;

  projectContainer.insertAdjacentHTML("afterbegin", html);
};
////////////////////////////////////////////////////////////////
const addProject = function (e) {
  e.preventDefault();
  if (!inputProjectName.value)
    return (errorMessageProject.textContent =
      "Please enter project name to continue");

  let projectExist = projects.some(
    (item) => item.toLowerCase() === inputProjectName.value.toLowerCase()
  );

  if (projectExist)
    return (errorMessageProject.textContent = "Project name already Exist");

  formDisableOrAble(addNewProjectForm, 0, "none");

  removeActiveClass();
  projectHTML(inputProjectName.value);

  projects.push(inputProjectName.value);

  projectName = inputProjectName.value;
  inputProjectName.value = "";
  errorMessageProject.textContent = "";

  ifProjectIsEmpty();

  setLocalstorage();
};

//////////////////////////////////////////////////////////////
const formDisableOrAble = function (form, opacity, display) {
  form.style.opacity = opacity;
  form.style.display = display;
};

///////////////////////////////////////////////////////////////
const calcDaysLeft = function () {
  todoList.forEach((item) => {
    let todoDate = new Date(item.dueDate);
    let daysLeft = Math.round((todoDate - now) / (1000 * 60 * 60 * 24));
    if (daysLeft === -1) item.daysLeft = "Today";
    if (daysLeft === 0) item.daysLeft = "Tomorrow";
    if (daysLeft === 1) item.daysLeft = "2 days Left";
    if (daysLeft === 2) item.daysLeft = "3 days Left";
    if (daysLeft === 3) item.daysLeft = "4 days Left";
    if (daysLeft === 4) item.daysLeft = "5 days Left";
    if (daysLeft === 5) item.daysLeft = "6 days Left";
    if (daysLeft === 6) item.daysLeft = "7 days Left";
    if (daysLeft >= 7) item.daysLeft = item.dueDate;

    if (daysLeft < -1) {
      item.done = true;
      item.daysLeft = item.dueDate;
    }
  });
};

//////////////////////////////////////////////////////////////
function todayList() {
  let todayTodo = todoList.filter((item) => item.daysLeft === "Today");

  removeActiveClass();
  HTMLtodocard(todayTodo, true);
  projectName = "";
}

/////////////////////////////////////////////////////////////
let setLocalstorage = function () {
  localStorage.setItem("todoList", JSON.stringify(todoList));
  localStorage.setItem("projects", JSON.stringify(projects));
};

/////////////////////////////////////////////////////////////////
let getLocalStorage = function () {
  let todoListData = [...new Set(JSON.parse(localStorage.getItem("todoList")))];
  let projectData = [...new Set(JSON.parse(localStorage.getItem("projects")))];

  if (!projectData || projectData.length === 0) return;

  todoList = todoListData;
  projects = projectData;
  projectName = projects[projects.length - 1];
  projects.forEach((project) => projectHTML(project));
  removeActiveClass();

  let filtered = todoList.filter((item) => item.projectName === projectName);
  HTMLtodocard(filtered);
  ifProjectIsEmpty(filtered);

  projectContainer.querySelector(".project-item").classList.add("active");
};

getLocalStorage();

let clearLocalStorage = function () {
  localStorage.removeItem("todoList");
  localStorage.removeItem("projects");
};

///////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////
/////////////////////////////////////////////
////////////////////////////////////////////////////////////

todoListContainer.addEventListener("click", function (e) {
  if (!e.target.closest(".todo-buttons")) return;

  if (e.target.classList.contains("delete-todo")) {
    deleteTodo(e);
  }
  if (e.target.classList.contains("mark-done")) {
    markDone(e);
  }
});

closeProjectFormBtn.addEventListener("click", function () {
  formDisableOrAble(addNewProjectForm, 0, "none");

  inputProjectName.value = "";

  errorMessageProject.textContent = "";
});

closeTodoFormBtn.addEventListener("click", function () {
  formDisableOrAble(addNewTodoForm, 0, "none");
  todoTitle.value = todoDescription.value = todoDate.value = "";
  todoPriority.value = "------";
  errorMessageTodo.textContent = "";
});

// Adding event listener to new project button
addNewProjectBtn.addEventListener("click", function () {
  formDisableOrAble(addNewProjectForm, 1, "block");
  inputProjectName.focus();
});

// Adding event listener to new project form
addNewProjectForm.addEventListener(
  "submit",
  addProject.bind(addNewProjectForm)
);

// Adding event listener to new Todo button
addNewTodoBtn.addEventListener("click", function () {
  formDisableOrAble(addNewTodoForm, 1, "block");
  todoTitle.focus();
  errorMessageTodo.textContent = "";
});

// Adding event listener to new todo form
addNewTodoForm.addEventListener("submit", addTodo.bind(addNewTodoForm));

// Adding event listener to project container
projectContainer.addEventListener("click", function (e) {
  if (e.target.textContent === "X") return deleteProject(e);

  let clicked = e.target.closest(".project-item");
  if (!clicked) return;

  removeActiveClass();
  clicked.classList.add("active");

  projectName = clicked.querySelector(".project-item-text").textContent;

  addTodoCard(projectName);
});

todayTodoBtn.addEventListener("click", todayList);
