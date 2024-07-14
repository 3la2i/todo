// استيراد المكتبات اللازمة من Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import {
  getDatabase,
  ref,
  push,
  set,
  update,
  remove,
  get,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


const firebaseConfig = {
  apiKey: "AIzaSyASf-6QO0uG3P6VoABwCz63iiBMB_ImVk0",
  authDomain: "todolist-9fe43.firebaseapp.com", 
  databaseURL: "https://todolist-9fe43-default-rtdb.firebaseio.com",  
  projectId: "todolist-9fe43",
  storageBucket: "todolist-9fe43.appspot.com",
  messagingSenderId: "463706579138",
  appId: "1:463706579138:web:3e990d47c300b949c19b5b",
  measurementId: "G-YC4FQ8T0J4",
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

// التعامل مع إرسال نموذج إنشاء قائمة جديدة
document.getElementById("create-list-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const listNameInput = document.getElementById("list-name-input").value; // الحصول على اسم القائمة من الإدخال
  const listRef = push(ref(database, "lists")); // إنشاء مرجع لقائمة جديدة في قاعدة البيانات
  await set(listRef, { name: listNameInput }); // تعيين اسم القائمة في قاعدة البيانات
  alert("List created!");
  fetchLists();
});

// التعامل مع زر إضافة مهمة جديدة
document.getElementById("add-task-button").addEventListener("click", async () => {
  const listSelect = document.getElementById("list-select"); // الحصول على عنصر التحديد للقوائم
  const selectedListId = listSelect.value;
  const taskNameInput = document.getElementById("task-name-input").value;
  const taskPrioritySelect = document.getElementById("task-priority-select").value;
  const taskDateInput = document.getElementById("task-date-input").value; 
  const taskRef = push(ref(database, `lists/${selectedListId}/tasks`)); // إنشاء مرجع لمهمة جديدة في القائمة المحددة
  await set(taskRef, {
    name: taskNameInput, // تعيين اسم المهمة
    priority: taskPrioritySelect,   
    dueDate: taskDateInput,
    completed: false,
  });
  alert("Task added!"); 
  fetchTasks(selectedListId); // تحديث المهام المعروضة للقائمة المحددة
});

// تحميل القوائم
const fetchLists = async () => {
  const listSelect = document.createElement("select");
  listSelect.id = "list-select";
  const listsRef = ref(database, "lists");
  const snapshot = await get(listsRef);
  const lists = snapshot.val(); // استخراج القوائم من البيانات المسترجعة

  listSelect.innerHTML = "";
  for (const id in lists) { // تكرار على جميع القوائم
    const option = document.createElement("option"); // إنشاء عنصر خيار جديد لكل قائمة
    option.value = id; 
    option.textContent = lists[id].name; // تعيين نص الخيار كاسم القائمة
    listSelect.appendChild(option); // إضافة الخيار إلى عنصر التحديد
  }

  document.querySelector(".task-controls").prepend(listSelect);
  listSelect.addEventListener("change", () => fetchTasks(listSelect.value));
};

// تحميل المهام
const fetchTasks = async (listId) => {
  const tasksContainer = document.getElementById("tasks-container");
  const tasksRef = ref(database, `lists/${listId}/tasks`); // إنشاء مرجع للمهام في القائمة المحددة
  const snapshot = await get(tasksRef); // الحصول على بيانات المهام
  const tasks = snapshot.val();
  const priorityFilter = document.getElementById("priority-filter").value;
  const dateFilter = document.getElementById("date-filter").value; // الحصول على فلتر التاريخ

  tasksContainer.innerHTML = ""; // تفريغ حاوية المهام
  for (const id in tasks) { // تكرار على جميع المهام
    const task = tasks[id]; // الحصول على المهمة الحالية
    const matchesPriority = !priorityFilter || task.priority === priorityFilter; // التحقق من تطابق الفلتر
    const matchesDate = !dateFilter || task.dueDate === dateFilter; // التحقق من تطابق الفلتر

    if (matchesPriority && matchesDate) { // إذا كانت المهمة تتطابق مع الفلاتر
      const taskCard = document.createElement("div"); // إنشاء عنصر بطاقة جديدة للمهمة
      taskCard.className = `task-card ${task.priority} ${task.completed ? "completed" : ""}`; // تعيين الفئات للبطاقة بناءً على الأولوية والحالة
      taskCard.innerHTML = `
        <h3>${task.name}</h3>
        <p>Priority: ${task.priority}</p>
        <p>Due Date: ${task.dueDate}</p>
        <button class="complete-task" data-id="${id}">${task.completed ? "Uncomplete" : "Complete"}</button>
        <button class="edit-task" data-id="${id}">Edit</button>
        <button class="delete-task" data-id="${id}">Delete</button>
      `; // تعيين محتوى البطاقة
      tasksContainer.appendChild(taskCard); // إضافة البطاقة إلى حاوية المهام
    }
  }

  addTaskEventListeners(listId); // إضافة مستمعين للأحداث للمهام
};

const addTaskEventListeners = (listId) => {
  // التعامل مع زر إكمال المهمة
  document.querySelectorAll(".complete-task").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const taskId = e.target.dataset.id; // الحصول على معرف المهمة
      const taskRef = ref(database, `lists/${listId}/tasks/${taskId}`); // إنشاء مرجع للمهمة في القائمة المحددة
      const snapshot = await get(taskRef); // الحصول على بيانات المهمة
      const task = snapshot.val(); // استخراج المهمة من البيانات المسترجعة
      await update(taskRef, { completed: !task.completed }); // تحديث حالة إكمال المهمة
      fetchTasks(listId);
    });
  });

  // التعامل مع زر تعديل المهمة
  document.querySelectorAll(".edit-task").forEach((button) => {
    button.addEventListener("click", (e) => {
      const taskId = e.target.dataset.id; // الحصول على معرف المهمة
      editTask(listId, taskId); // تعديل المهمة
    });
  });

  // التعامل مع زر حذف المهمة
  document.querySelectorAll(".delete-task").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const taskId = e.target.dataset.id; // الحصول على معرف المهمة
      await remove(ref(database, `lists/${listId}/tasks/${taskId}`)); // حذف المهمة من قاعدة البيانات
      alert("Task deleted!"); // إظهار رسالة تأكيد
      fetchTasks(listId); // تحديث المهام المعروضة
    });
  });
};

// تعديل مهمة
const editTask = async (listId, taskId) => {
  const taskRef = ref(database, `lists/${listId}/tasks/${taskId}`); // إنشاء مرجع للمهمة في القائمة المحددة
  const snapshot = await get(taskRef); // الحصول على بيانات المهمة
  const task = snapshot.val(); // استخراج المهمة من البيانات المسترجعة

  document.getElementById("task-name-input").value = task.name; // تعيين اسم المهمة في الإدخال
  document.getElementById("task-priority-select").value = task.priority; // تعيين أولوية المهمة
  document.getElementById("task-date-input").value = task.dueDate; // تعيين تاريخ استحقاق المهمة

  const saveTaskBtn = document.createElement("button");
  saveTaskBtn.textContent = "Save Changes"; // تعيين نص الزر
  saveTaskBtn.id = "save-task-button";
  document.querySelector(".task-controls").appendChild(saveTaskBtn); // إضافة الزر إلى صفحة التحكم في المهام

  saveTaskBtn.addEventListener("click", async () => {
    const updatedTask = {
      name: document.getElementById("task-name-input").value, // الحصول على اسم المهمة المحدث
      priority: document.getElementById("task-priority-select").value, // الحصول على أولوية المهمة المحدثة
      dueDate: document.getElementById("task-date-input").value, // الحصول على تاريخ استحقاق المهمة المحدث
    };
    await update(taskRef, updatedTask); // تحديث بيانات المهمة في قاعدة البيانات
    alert("Task updated!"); // إظهار رسالة تأكيد
    fetchTasks(listId); // تحديث المهام المعروضة
    saveTaskBtn.remove(); // إزالة زر حفظ التعديلات
  });
};

// تصفية المهام حسب الأولوية
document.getElementById("priority-filter").addEventListener("change", () => {
  const listSelect = document.getElementById("list-select"); // الحصول على عنصر التحديد للقوائم
  if (listSelect.value) fetchTasks(listSelect.value); // تحديث المهام إذا كانت هناك قائمة محددة
});

// تصفية المهام حسب التاريخ
document.getElementById("date-filter").addEventListener("change", () => {
  const listSelect = document.getElementById("list-select"); // الحصول على عنصر التحديد للقوائم
  if (listSelect.value) fetchTasks(listSelect.value); // تحديث المهام إذا كانت هناك قائمة محددة
});

// تحميل القوائم عند بدء التشغيل
fetchLists(); // استدعاء دالة تحميل القوائم
