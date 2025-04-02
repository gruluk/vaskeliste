'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import NavBar from '@/components/NavBar';

type Task = { id: string; name: string };
type User = { id: string; name: string };
type Tally = { user_id: string; task_id: string; count: number };

export default function ManageTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tallies, setTallies] = useState<Tally[]>([]);
  const [newTask, setNewTask] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedTaskName, setEditedTaskName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: tasks } = await supabase.from('tasks').select('*').order('name');
    const { data: users } = await supabase.from('users').select('*').order('name');
    const { data: tallies } = await supabase.from('task_tallies').select('*');
    setTasks(tasks || []);
    setUsers(users || []);
    setTallies(tallies || []);
  }

  async function addTask() {
    if (!newTask.trim()) return;
    await supabase.from('tasks').insert({ name: newTask });
    setNewTask('');
    fetchData();
  }

  async function deleteTask(id: string) {
    await supabase.from('tasks').delete().eq('id', id);
    fetchData();
  }

  async function updateTaskName() {
    if (!editedTaskName.trim() || !editingTaskId) return;
    await supabase.from('tasks').update({ name: editedTaskName }).eq('id', editingTaskId);
    setEditingTaskId(null);
    setEditedTaskName('');
    fetchData();
  }

  async function updateTally(userId: string, taskId: string, count: number) {
    await supabase.from('task_logs').delete().eq('user_id', userId).eq('task_id', taskId);
    const newLogs = Array(count).fill({ user_id: userId, task_id: taskId });
    if (count > 0) {
      await supabase.from('task_logs').insert(newLogs);
    }
    fetchData();
  }

  function getTally(userId: string, taskId: string) {
    return tallies.find(t => t.user_id === userId && t.task_id === taskId)?.count || 0;
  }

  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <main className="p-6 max-w-6xl mx-auto space-y-12">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl text-black font-bold">📋 Administrer oppgaver</h1>
        </div>

        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Ny oppgave"
            className="border px-3 text-black py-2 rounded w-full"
          />
          <button
            onClick={addTask}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 whitespace-nowrap"
          >
            Legg til
          </button>
        </div>

        {tasks.map((task) => (
          <div key={task.id} className="bg-white border rounded shadow-sm p-4 space-y-4">
            <div className="flex justify-between items-center">
              {editingTaskId === task.id ? (
                <div className="flex gap-2 w-full">
                  <input
                    value={editedTaskName}
                    onChange={(e) => setEditedTaskName(e.target.value)}
                    className="border text-black p-2 rounded w-full"
                  />
                  <button
                    onClick={updateTaskName}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Lagre
                  </button>
                  <button
                    onClick={() => setEditingTaskId(null)}
                    className="bg-gray-400 text-white px-3 py-1 rounded"
                  >
                    Avbryt
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-lg text-black font-semibold">{task.name}</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingTaskId(task.id);
                        setEditedTaskName(task.name);
                      }}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Rediger
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Slett
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {users.map((user) => {
                const current = getTally(user.id, task.id);
                return (
                  <div
                    key={user.id}
                    className="flex text-black items-center justify-between border px-3 py-2 rounded"
                  >
                    <span className="font-medium">{user.name}</span>
                    <input
                      type="number"
                      min={0}
                      value={current}
                      onChange={(e) =>
                        updateTally(user.id, task.id, Number(e.target.value))
                      }
                      className="border rounded px-2 py-1 w-20 text-right"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
