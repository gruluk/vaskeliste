'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type User = { id: string; name: string };
type Task = { id: string; name: string };
type Tally = { user_id: string; task_id: string; count: number };

export default function TasksPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tallies, setTallies] = useState<Tally[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data: users } = await supabase.from('users').select('*');
      const { data: tasks } = await supabase.from('tasks').select('*');
      const { data: tallies } = await supabase.from('task_tallies').select('*');
      setUsers(users || []);
      setTasks(tasks || []);
      setTallies(tallies || []);
    }

    fetchData();
  }, []);

  async function handleAdd(userId: string, taskId: string) {
    await supabase.from('task_logs').insert({ user_id: userId, task_id: taskId });

    // Refresh data (you could do a better optimistic update)
    const { data: newTallies } = await supabase.from('task_tallies').select('*');
    setTallies(newTallies || []);
  }

  function getTally(userId: string, taskId: string) {
    return tallies.find(t => t.user_id === userId && t.task_id === taskId)?.count || 0;
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🧼 Vaskeliste – Telling</h1>

      {tasks.length === 0 ? (
        <p className="text-gray-500">Ingen oppgaver funnet.</p>
      ) : (
        tasks.map((task) => (
          <div key={task.id} className="mb-8">
            <h2 className="text-xl font-semibold mb-2">{task.name}</h2>
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={`${user.id}-${task.id}`}
                  className="flex items-center justify-between border p-3 rounded"
                >
                  <span>{user.name}</span>
                  <span className="font-mono text-sm">
                    {'|'.repeat(getTally(user.id, task.id))}
                  </span>
                  <button
                    onClick={() => handleAdd(user.id, task.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    +1
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </main>
  );
}
