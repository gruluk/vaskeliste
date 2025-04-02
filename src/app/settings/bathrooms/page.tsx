'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import NavBar from '@/components/NavBar';

type User = {
  id: string;
  name: string;
  bathroom: 'Bad 1' | 'Bad 2' | null;
};

export default function BathroomAssignmentPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const { data } = await supabase.from('users').select('*').order('name');
    setUsers(data || []);
  }

  async function handleChange(userId: string, bathroom: 'Bad 1' | 'Bad 2') {
    await supabase.from('users').update({ bathroom }).eq('id', userId);
    fetchUsers();
  }

  return (
    <>
      <NavBar />
      <div className="bg-white min-h-screen">
        <main className="p-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800">🚿 Administrer bad-fordeling</h1>
          </div>

          <ul className="space-y-4">
            {users.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between border p-3 rounded shadow-sm"
              >
                <span className="text-gray-800">{user.name}</span>
                <select
                  value={user.bathroom || ''}
                  onChange={(e) =>
                    handleChange(user.id, e.target.value as 'Bad 1' | 'Bad 2')
                  }
                  className="border px-3 py-1 rounded text-black shadow-sm"
                >
                  <option value="Bad 1">Stort bad</option>
                  <option value="Bad 2">Lite bad</option>
                </select>
              </li>
            ))}
          </ul>
        </main>
      </div>
    </>
  );
}
