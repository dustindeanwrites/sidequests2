// Utility to get today's date string
function getTodayString() {
    return new Date().toISOString().split("T")[0];
}

// Voice input handling
function startVoiceInput() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.start();

    recognition.onresult = function (event) {
        document.getElementById('task-input').value = event.results[0][0].transcript;
    };

    recognition.onerror = function (event) {
        alert('Voice recognition error: ' + event.error);
    };
}

function addTask() {
    const taskInput = document.getElementById('task-input');
    const taskDateInput = document.getElementById('task-date');
    const taskText = taskInput.value.trim();
    const dueDate = taskDateInput.value;
    if (!taskText || !dueDate) return;

    const task = {
        text: taskText,
        dueDate,
        completed: false,
        first: false,
        id: Date.now()
    };

    saveTask(task);
    taskInput.value = '';
    taskDateInput.value = '';
}

function saveTask(task) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
}

function completeTask(id) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex > -1) {
        const completedTasks = JSON.parse(localStorage.getItem('completedTasks') || '[]');
        tasks[taskIndex].completed = true;
        tasks[taskIndex].completedAt = getTodayString();
        completedTasks.push(tasks[taskIndex]);
        tasks.splice(taskIndex, 1);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
    }
    renderTasks();
}

function deleteTask(id) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const completedTasks = JSON.parse(localStorage.getItem('completedTasks') || '[]');
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex > -1) {
        tasks[taskIndex].deleted = true;
        completedTasks.push(tasks[taskIndex]);
        tasks.splice(taskIndex, 1);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
    }
    renderTasks();
}

function toggleFirst(id) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.first = !task.first;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    }
}

function renderTasks() {
    const today = getTodayString();
    const now = new Date(today);
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const completedTasks = JSON.parse(localStorage.getItem('completedTasks') || '[]');
    const sections = {
        'first-tasks': [],
        'today-tasks': [],
        'week-tasks': [],
        'soon-tasks': []
    };

    tasks.forEach(task => {
        const taskDate = new Date(task.dueDate);
        const daysDiff = (taskDate - now) / (1000 * 60 * 60 * 24);

        if (task.first) {
            sections['first-tasks'].push(task);
        } else if (task.dueDate === today) {
            sections['today-tasks'].push(task);
        } else if (daysDiff <= 7) {
            sections['week-tasks'].push(task);
        } else {
            sections['soon-tasks'].push(task);
        }
    });

    for (const section in sections) {
        const ul = document.querySelector(`#${section} .task-list`);
        ul.innerHTML = '';
        sections[section].forEach(task => {
            const li = document.createElement('li');
            li.textContent = task.text + ' (' + task.dueDate + ')';
            li.innerHTML += ` <button onclick="completeTask(${task.id})">✅</button>`;
            li.innerHTML += ` <button onclick="toggleFirst(${task.id})">⭐</button>`;
            li.innerHTML += ` <button onclick="deleteTask(${task.id})">🗑️</button>`;
            ul.appendChild(li);
        });
    }

    const completedUl = document.getElementById('completed-tasks');
    completedUl.innerHTML = '';
    completedTasks.forEach(task => {
        const li = document.createElement('li');
        li.textContent = task.text + ' (' + task.dueDate + ')';
        completedUl.appendChild(li);
    });

    const completedTodayCount = completedTasks.filter(t => t.completedAt === today).length;
    document.getElementById('completed-today').textContent = completedTodayCount;
}

window.onload = renderTasks;