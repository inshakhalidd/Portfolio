import { useEffect, useMemo, useState } from 'react';
import { loadState, saveState } from './lib/storage.js';
import { detectCategory, generateSubtasks } from './lib/taskTemplates.js';
import TaskInput from './components/TaskInput.jsx';
import TaskList from './components/TaskList.jsx';
import TaskDetail from './components/TaskDetail.jsx';
import Dashboard from './components/Dashboard.jsx';
import UploadTab from './components/UploadTab.jsx';
import Gallery from './components/Gallery.jsx';

const TABS = ['Tasks', 'Dashboard', 'Upload', 'Gallery'];

function taskId() {
  return `t_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

function uploadId() {
  return `u_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

export default function App() {
  const persisted = loadState();
  const [tasks, setTasks] = useState(persisted?.tasks ?? []);
  const [uploads, setUploads] = useState(persisted?.uploads ?? []);
  const [tab, setTab] = useState('Tasks');
  const [selectedTaskId, setSelectedTaskId] = useState(persisted?.tasks?.[0]?.id ?? null);

  useEffect(() => {
    saveState({ tasks, uploads });
  }, [tasks, uploads]);

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) || null,
    [tasks, selectedTaskId]
  );

  function createTask(title, tags) {
    const category = detectCategory(title);
    const task = {
      id: taskId(),
      title,
      category,
      tags,
      subtasks: generateSubtasks(category),
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    setTasks((prev) => [task, ...prev]);
    setSelectedTaskId(task.id);
    setTab('Tasks');
  }

  function updateTask(id, patch) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const next = { ...t, ...(typeof patch === 'function' ? patch(t) : patch) };
        const allDone = next.subtasks.length > 0 && next.subtasks.every((s) => s.done);
        next.completedAt = allDone ? next.completedAt || new Date().toISOString() : null;
        return next;
      })
    );
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (selectedTaskId === id) setSelectedTaskId(null);
  }

  function addUpload(upload) {
    const record = { id: uploadId(), createdAt: new Date().toISOString(), ...upload };
    setUploads((prev) => [record, ...prev]);
    return record.id;
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">Studio Tracker</div>
        <nav className="tabs">
          {TABS.map((t) => (
            <button
              key={t}
              className={`tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </nav>
      </header>

      <main className="main">
        {tab === 'Tasks' && (
          <div className="tasks-layout">
            <div className="tasks-sidebar">
              <TaskInput onCreate={createTask} />
              <TaskList
                tasks={tasks}
                selectedId={selectedTaskId}
                onSelect={setSelectedTaskId}
                onDelete={deleteTask}
              />
            </div>
            <div className="tasks-content">
              {selectedTask ? (
                <TaskDetail task={selectedTask} onUpdate={updateTask} />
              ) : (
                <div className="empty-state">Select or create a task to see its checklist.</div>
              )}
            </div>
          </div>
        )}

        {tab === 'Dashboard' && <Dashboard tasks={tasks} uploads={uploads} />}

        {tab === 'Upload' && <UploadTab tasks={tasks} onAddUpload={addUpload} />}

        {tab === 'Gallery' && <Gallery tasks={tasks} uploads={uploads} />}
      </main>
    </div>
  );
}
