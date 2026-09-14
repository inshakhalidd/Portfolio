import { useEffect, useMemo, useState } from 'react';
import { supabase, supabaseConfigured } from './lib/supabaseClient.js';
import {
  fetchTasks,
  fetchUploads,
  insertTask,
  updateTaskRemote,
  deleteTaskRemote,
  insertUpload,
} from './lib/db.js';
import { generateSubtasks } from './lib/taskTemplates.js';
import { mergePackIntoResearchData } from './lib/researchPack.js';
import Auth from './components/Auth.jsx';
import Sidebar from './components/Sidebar.jsx';
import Home from './components/Home.jsx';
import TopBar from './components/TopBar.jsx';
import Modal from './components/Modal.jsx';
import TaskInput from './components/TaskInput.jsx';
import TaskList from './components/TaskList.jsx';
import TaskDetail from './components/TaskDetail.jsx';
import Dashboard from './components/Dashboard.jsx';
import ResearchTab from './components/ResearchTab.jsx';
import UploadTab from './components/UploadTab.jsx';
import Gallery from './components/Gallery.jsx';

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = not checked yet, null = signed out
  const [tasks, setTasks] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [tab, setTab] = useState('Home');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [taskSearch, setTaskSearch] = useState('');
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  // Never persisted on purpose — every reload resets to dark, per spec.
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    if (!supabaseConfigured) {
      setSession(null);
      return;
    }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    setDataLoading(true);
    Promise.all([fetchTasks(), fetchUploads()])
      .then(([t, u]) => {
        setTasks(t);
        setUploads(u);
        setSelectedTaskId((prev) => prev ?? t[0]?.id ?? null);
      })
      .catch((err) => showToast(`Couldn't load your data: ${err.message}`))
      .finally(() => setDataLoading(false));
  }, [session]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) || null,
    [tasks, selectedTaskId]
  );

  const visibleTasks = useMemo(() => {
    const q = taskSearch.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter((t) => t.title.toLowerCase().includes(q));
  }, [tasks, taskSearch]);

  const activeTaskCount = tasks.filter((t) => !t.completedAt).length;
  const totalSteps = tasks.reduce((sum, t) => sum + t.subtasks.length, 0);
  const doneSteps = tasks.reduce((sum, t) => sum + t.subtasks.filter((s) => s.done).length, 0);
  const completionRate = totalSteps ? Math.round((doneSteps / totalSteps) * 100) : 0;

  async function persistNewTask(task) {
    try {
      const saved = await insertTask(task);
      setTasks((prev) => [saved, ...prev]);
      setSelectedTaskId(saved.id);
      return saved;
    } catch (err) {
      showToast(`Couldn't save the task: ${err.message}`);
      return null;
    }
  }

  function createTask(title, tags, category) {
    persistNewTask({
      title,
      category,
      tags,
      subtasks: generateSubtasks(category),
    }).then((saved) => {
      if (saved) {
        setTab('Tasks');
        setAddTaskOpen(false);
      }
    });
  }

  function updateTask(id, patch) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const next = { ...t, ...(typeof patch === 'function' ? patch(t) : patch) };
        const allDone = next.subtasks.length > 0 && next.subtasks.every((s) => s.done);
        next.completedAt = allDone ? next.completedAt || new Date().toISOString() : null;
        updateTaskRemote(id, { subtasks: next.subtasks, completedAt: next.completedAt }).catch((err) =>
          showToast(`Couldn't save your change: ${err.message}`)
        );
        return next;
      })
    );
  }

  function createTaskFromResearch(title, category, tags, pack) {
    const subtasks = generateSubtasks(category);
    const researchIdx = subtasks.findIndex((s) => s.type === 'research');
    if (researchIdx >= 0 && pack) {
      subtasks[researchIdx] = {
        ...subtasks[researchIdx],
        data: mergePackIntoResearchData(subtasks[researchIdx].data, pack),
      };
    }
    persistNewTask({ title, category, tags, subtasks });
  }

  function attachResearchToTask(id, pack) {
    if (!pack) return;
    updateTask(id, (t) => ({
      subtasks: t.subtasks.map((s) =>
        s.type === 'research' ? { ...s, data: mergePackIntoResearchData(s.data, pack) } : s
      ),
    }));
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (selectedTaskId === id) setSelectedTaskId(null);
    deleteTaskRemote(id).catch((err) => showToast(`Couldn't delete the task: ${err.message}`));
  }

  async function addUpload(upload, file) {
    try {
      const saved = await insertUpload(upload, file, session.user.id);
      setUploads((prev) => [saved, ...prev]);
      return saved.id;
    } catch (err) {
      showToast(`Couldn't save the upload: ${err.message}`);
      return null;
    }
  }

  function goToTask(id) {
    setSelectedTaskId(id);
    setTab('Tasks');
  }

  if (session === undefined) {
    return null; // checking auth state
  }
  if (!session) {
    return <Auth />;
  }

  return (
    <div className="app-shell" data-theme={theme}>
      <Sidebar
        active={tab}
        onSelect={setTab}
        activeTaskCount={activeTaskCount}
        galleryCount={uploads.length}
        completionRate={completionRate}
        onSignOut={() => supabase.auth.signOut()}
      />

      <div className="app-content">
        <TopBar
          tab={tab}
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          onAddTask={() => setAddTaskOpen(true)}
        />

        <main className="main">
          {dataLoading ? (
            <div className="empty-state">Loading your studio…</div>
          ) : (
            <>
              {tab === 'Home' && (
                <Home
                  tasks={tasks}
                  uploads={uploads}
                  onOpenTask={goToTask}
                  onGoTasks={() => setTab('Tasks')}
                  onNewMoodboard={() => setTab('Research')}
                  onAddTask={() => setAddTaskOpen(true)}
                  onGoUpload={() => setTab('Upload')}
                />
              )}

              {tab === 'Tasks' && (
                <div className="tasks-layout animate-in">
                  <div className="panel-card task-sidebar-panel">
                    <TaskList
                      tasks={visibleTasks}
                      selectedId={selectedTaskId}
                      onSelect={setSelectedTaskId}
                      onDelete={deleteTask}
                      search={taskSearch}
                      onSearchChange={setTaskSearch}
                    />
                  </div>
                  <div className="panel-card task-detail-panel">
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
              )}

              {tab === 'Research' && (
                <ResearchTab
                  tasks={tasks}
                  onCreateTask={createTaskFromResearch}
                  onAttachToTask={attachResearchToTask}
                />
              )}

              {tab === 'Dashboard' && <Dashboard tasks={tasks} uploads={uploads} />}

              {tab === 'Upload' && <UploadTab tasks={tasks} onAddUpload={addUpload} />}

              {tab === 'Gallery' && <Gallery tasks={tasks} uploads={uploads} onGoToTask={goToTask} />}
            </>
          )}
        </main>
      </div>

      {addTaskOpen && (
        <Modal title="New task" onClose={() => setAddTaskOpen(false)}>
          <TaskInput onCreate={createTask} />
        </Modal>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
