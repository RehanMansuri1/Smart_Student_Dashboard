// script.js (debug-friendly version)
// Paste & replace your existing script.js with this, then reload the page
(function () {
  'use strict';
  console.log('[SSD] script.js loaded');

  // Safe selectors
  const $ = (sel) => document.querySelector(sel);

  // DOM refs (may be null if wrong ids)
  const taskInput = $('#task-input');
  const addTaskBtn = $('#add-task-btn');
  const taskList = $('#task-list');

  // local state
  let tasks = JSON.parse(localStorage.getItem('ssd_tasks_v1') || 'null');
  if (!Array.isArray(tasks)) {
    tasks = [
      { id: Date.now() + 1, text: 'Learn JavaScript', completed: false },
      { id: Date.now() + 2, text: 'Complete assignment', completed: false },
    ];
    console.log('[SSD] initialized demo tasks', tasks);
  }

  // helpers
  const storageSet = (k, v) => {
    try { localStorage.setItem(k, JSON.stringify(v)); }
    catch (e) { console.error('[SSD] storageSet error', e); }
  };

  function renderTasks() {
    if (!taskList) {
      console.warn('[SSD] renderTasks: #task-list not found in DOM');
      return;
    }
    taskList.innerHTML = '';
    // newest first
    tasks.slice().reverse().forEach(t => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.dataset.id = t.id;

      const left = document.createElement('div');
      left.className = 'd-flex align-items-center gap-2';

      const toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.className = 'btn btn-sm btn-outline-light task-toggle-btn';
      toggleBtn.textContent = t.completed ? '✓' : '☐';
      toggleBtn.style.minWidth = '34px';

      const span = document.createElement('span');
      span.textContent = t.text;
      if (t.completed) {
        span.style.textDecoration = 'line-through';
        span.style.opacity = '0.7';
      }

      left.appendChild(toggleBtn);
      left.appendChild(span);

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'btn btn-sm btn-outline-danger task-delete-btn';
      del.textContent = 'Delete';

      li.appendChild(left);
      li.appendChild(del);

      taskList.appendChild(li);
    });

    // update counts if present
    const updateEl = (sel, val) => {
      const el = document.querySelector(sel);
      if (el) el.textContent = String(val);
    };
    updateEl('#total-tasks', tasks.length);
    updateEl('#completed-tasks', tasks.filter(t => t.completed).length);
    updateEl('#pending-tasks', tasks.filter(t => !t.completed).length);

    storageSet('ssd_tasks_v1', tasks);
  }

  function addTask(text) {
    const t = (text || '').trim();
    if (!t) return false;
    const newTask = { id: Date.now() + Math.floor(Math.random()*1000), text: t, completed: false };
    tasks.push(newTask);
    renderTasks();
    return true;
  }

  function toggleTaskById(id) {
    const idx = tasks.findIndex(x => String(x.id) === String(id));
    if (idx === -1) return;
    tasks[idx].completed = !tasks[idx].completed;
    renderTasks();
  }

  function deleteTaskById(id) {
    tasks = tasks.filter(x => String(x.id) !== String(id));
    renderTasks();
  }

  // Ensure DOM is ready: if elements not yet present, wait for DOMContentLoaded
  function initEventHandlers() {
    console.log('[SSD] attaching handlers', { taskInput: !!taskInput, addTaskBtn: !!addTaskBtn, taskList: !!taskList });

    if (addTaskBtn && taskInput) {
      addTaskBtn.addEventListener('click', function () {
        console.log('[SSD] addTaskBtn click, input=', taskInput.value);
        const ok = addTask(taskInput.value);
        if (ok) {
          taskInput.value = '';
          taskInput.focus();
        } else {
          // visual feedback
          taskInput.classList.add('is-invalid');
          setTimeout(() => taskInput.classList.remove('is-invalid'), 900);
        }
      });
    } else {
      if (!addTaskBtn) console.warn('[SSD] #add-task-btn not found');
      if (!taskInput) console.warn('[SSD] #task-input not found');
    }

    if (taskInput) {
      taskInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          console.log('[SSD] Enter pressed in taskInput');
          const ok = addTask(taskInput.value);
          if (ok) taskInput.value = '';
        }
      });
    }

    if (taskList) {
      taskList.addEventListener('click', function (e) {
        const li = e.target.closest('li[data-id]');
        if (!li) return;
        const id = li.dataset.id;
        if (e.target.closest('.task-toggle-btn')) {
          console.log('[SSD] toggle clicked', id);
          toggleTaskById(id);
          return;
        }
        if (e.target.closest('.task-delete-btn')) {
          console.log('[SSD] delete clicked', id);
          if (confirm('Delete this task?')) deleteTaskById(id);
          return;
        }
      });
    }
  }

  // If DOM already loaded, init immediately, otherwise wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      console.log('[SSD] DOMContentLoaded');
      // requery elements because they might not have existed at top-level
      // (use fresh references)
      initEventHandlers();
      renderTasks();
    });
  } else {
    initEventHandlers();
    renderTasks();
  }

})();
