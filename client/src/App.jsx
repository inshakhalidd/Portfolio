import { useEffect, useMemo, useState } from 'react';
import { loadState, saveState } from './lib/storage.js';
import { detectCategory, generateSubtasks } from './lib/taskTemplates.js';
import Sidebar from './components/Sidebar.jsx';
import Home from './components/Home.jsx';
import TopBar from './components/TopBar.jsx';
import Modal from './components/Modal.jsx';
import TaskInput from './components/TaskInput.jsx';
import TaskList from './components/TaskList.jsx';
import TaskDetail from './components/TaskDetail.jsx';
import Dashboard from './components/Dashboard.jsx';
import UploadTab from './components/UploadTab.jsx';
import Gallery from './components/Gallery.jsx';

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
  const [tab, setTab] = useState('Home');
  const [selectedTaskId, setSelectedTaskId] = useState(persisted?.tasks?.[0]?.id ?? null);
  const [taskSearch, setTaskSearch] = useState('');
  const [addTaskOpen, setAddTaskOpen] = useState(false);

  useEffect(() => {
    saveState({ tasks, uploads });
  }, [tasks, uploads]);

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) || null,
    [tasks, selectedTaskId]
  );

  const visibleTasks = useMemo(() => {
    const q = taskSearch.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter((t) => t.title.toLowerCase().includes(q));
  }, [tasks, taskSearch]);

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
    setAddTaskOpen(false);
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
    <div className="app-shell">
      <Sidebar active={tab} onSelect={setTab} />

      <div className="app-content">
        <TopBar
          search={taskSearch}
          onSearchChange={setTaskSearch}
          onAddTask={() => setAddTaskOpen(true)}
        />

        <main className="main">
          {tab === 'Home' && (
            <Home
              tasks={tasks}
              uploads={uploads}
              onOpenTask={(id) => {
                setSelectedTaskId(id);
                setTab('Tasks');
              }}
              onViewGallery={() => setTab('Gallery')}
            />
          )}

          {tab === 'Tasks' && (
            <>
              <h1 className="page-title">Tasks</h1>
              <div className="tasks-layout">
                <div className="tasks-sidebar">
                  <TaskList
                    tasks={visibleTasks}
                    selectedId={selectedTaskId}
                    onSelect={setSelectedTaskId}
                    onDelete={deleteTask}
                  />
                </div>
                <div className="tasks-content">
                  {selectedTask ? (
                    <TaskDetail task={selectedTask} onUpdate={updateTask} />
                  ) : (
                    <div className="empty-state">
                      {tasks.length === 0
                        ? 'Add a task to generate its checklist.'
                        : 'Select a task to see its checklist.'}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {tab === 'Dashboard' && <Dashboard tasks={tasks} uploads={uploads} />}

          {tab === 'Upload' && <UploadTab tasks={tasks} onAddUpload={addUpload} />}

          {tab === 'Gallery' && <Gallery tasks={tasks} uploads={uploads} />}
        </main>
      </div>

      {addTaskOpen && (
        <Modal title="New task" onClose={() => setAddTaskOpen(false)}>
          <TaskInput onCreate={createTask} />
        </Modal>
      )}
    </div>
  );
}
