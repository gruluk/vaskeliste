'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import TaskList from '@/components/TaskList';
import AddTaskModal from '@/components/AddTaskModal';
import WeeklyResponsibility from '@/components/WeeklyResponsibility';
import PurchaseOverview from '@/components/PurchaseOverview';
import NavBar from '@/components/NavBar';

type User = { id: string; name: string };
type Task = { id: string; name: string };
type Tally = { user_id: string; task_id: string; count: number };
type TaskLastDone = { task_id: string; last_done: string };

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tallies, setTallies] = useState<Tally[]>([]);
  const [taskLastDone, setTaskLastDone] = useState<TaskLastDone[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [activeTab, setActiveTab] = useState<'tally' | 'weekly' | 'purchases'>('tally');

  useEffect(() => {
    async function fetchData() {
      const { data: users } = await supabase.from('users').select('*');
      const { data: tasks } = await supabase.from('tasks').select('*');
      const { data: tallies } = await supabase.from('task_tallies').select('*');
      const { data: lastDone } = await supabase.from('task_last_done').select('*');
      setUsers(users || []);
      setTasks(tasks || []);
      setTallies(tallies || []);
      setTaskLastDone(lastDone || []);
    }

    fetchData();
  }, []);

  async function handleAdd(userId: string, taskId: string) {
    await supabase.from('task_logs').insert({ user_id: userId, task_id: taskId });

    const { data: newTallies } = await supabase.from('task_tallies').select('*');
    const { data: newLastDone } = await supabase.from('task_last_done').select('*');
    setTallies(newTallies || []);
    setTaskLastDone(newLastDone || []);
  }

  async function handleSubmit() {
    if (selectedUser && selectedTask) {
      await handleAdd(selectedUser, selectedTask);
      setSelectedUser('');
      setSelectedTask('');
      setShowModal(false);
    }
  }

  return (
    <div className="bg-white min-h-screen">
        <NavBar />
        <main className="p-6 max-w-3xl mx-auto relative">
        {/* Tabs */}
        <div className="mb-6 flex gap-4">
            <button
            onClick={() => setActiveTab('tally')}
            className={`px-4 py-2 rounded ${activeTab === 'tally' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'}`}
            >
            Telling
            </button>
            <button
            onClick={() => setActiveTab('weekly')}
            className={`px-4 py-2 rounded ${activeTab === 'weekly' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'}`}
            >
            Ukesansvar
            </button>
            <button
            onClick={() => setActiveTab('purchases')}
            className={`px-4 py-2 rounded ${activeTab === 'purchases' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'}`}
            >
            Innkjøp
            </button>
        </div>

        {/* Content */}
        {activeTab === 'tally' && (
            <>
            <TaskList
                users={users}
                tasks={tasks}
                tallies={tallies}
                taskLastDone={taskLastDone}
            />

            {/* Floating + button */}
            <button
                onClick={() => setShowModal(true)}
                className="fixed bottom-6 right-6 bg-blue-600 text-white w-14 h-14 rounded-full text-3xl shadow-lg hover:bg-blue-700"
            >
                +
            </button>

            {showModal && (
                <AddTaskModal
                users={users}
                tasks={tasks}
                selectedUser={selectedUser}
                selectedTask={selectedTask}
                onUserChange={setSelectedUser}
                onTaskChange={setSelectedTask}
                onClose={() => setShowModal(false)}
                onSubmit={handleSubmit}
                />
            )}
            </>
        )}

        {activeTab === 'weekly' && <WeeklyResponsibility />}
        {activeTab === 'purchases' && <PurchaseOverview />}
        </main>
    </div>
  );
}
