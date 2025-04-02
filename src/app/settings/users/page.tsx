'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import NavBar from '@/components/NavBar';

type User = {
  id: string;
  name: string;
};

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [newName, setNewName] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editedName, setEditedName] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const { data } = await supabase.from('users').select('*').order('name');
    setUsers(data || []);
  }

  async function addUser() {
    if (!newName.trim()) return;
    await supabase.from('users').insert({ name: newName });
    setNewName('');
    fetchUsers();
  }

  async function deleteUser(id: string) {
    await supabase.from('users').delete().eq('id', id);
    fetchUsers();
  }

  async function updateUserName() {
    if (!editingUser || !editedName.trim()) return;
    await supabase.from('users').update({ name: editedName }).eq('id', editingUser.id);
    setEditingUser(null);
    setEditedName('');
    fetchUsers();
  }

  return (
    <>
    <NavBar />
    <div className="bg-white min-h-screen">
      <main className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">👤 Administrer brukere</h1>
        </div>

        {/* Add user */}
        <div className="mb-8 flex items-center gap-2">
            <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nytt navn"
                className="border p-2 rounded flex-grow shadow-sm text-black"
            />
            <button
                onClick={addUser}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200 whitespace-nowrap"
            >
                Legg til
            </button>
        </div>

        {/* User list */}
        <ul className="space-y-3">
          {users.map((user) => (
            <li key={user.id} className="flex items-center justify-between border p-3 rounded shadow-sm">
              {editingUser?.id === user.id ? (
                <>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="border p-1 rounded w-full mr-2 text-black"
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={updateUserName}
                      className="text-sm bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition"
                    >
                      Lagre
                    </button>
                    <button
                      onClick={() => setEditingUser(null)}
                      className="text-sm bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500 transition"
                    >
                      Avbryt
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className="text-gray-800">{user.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingUser(user);
                        setEditedName(user.name);
                      }}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Rediger
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Slett
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </main>
    </div>
    </>
  );
}
