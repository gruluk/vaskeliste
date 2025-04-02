'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Purchase = {
  item: 'Toalettpapir' | 'Såpe';
  user_id: string;
  created_at: string;
  bathroom: 'Bad 1' | 'Bad 2';
};

type User = { id: string; name: string };

export default function PurchaseOverview() {
  const [users, setUsers] = useState<User[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data: users } = await supabase.from('users').select('*');
      const { data: purchases } = await supabase
        .from('purchases')
        .select('*')
        .order('created_at', { ascending: false });

      setUsers(users || []);
      setPurchases(purchases || []);
    }

    fetchData();
  }, []);

  const getUserName = (userId: string) =>
    users.find((u) => u.id === userId)?.name || 'Ukjent';

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);

    if (days === 0 && hours === 0) return 'i dag';
    if (days === 0) return `${hours}t siden`;
    return `${days}d${hours > 0 ? ` ${hours}t` : ''} siden`;
  };

  const bathrooms: ('Bad 1' | 'Bad 2')[] = ['Bad 1', 'Bad 2'];
  const items: ('Toalettpapir' | 'Såpe')[] = ['Toalettpapir', 'Såpe'];

  return (
    <div className="space-y-8">
      {bathrooms.map((bathroom) => (
        <div key={bathroom}>
          <h2 className="text-xl font-bold mb-2 text-black">{bathroom}</h2>
          <div className="space-y-4">
            {items.map((item) => {
              const last = purchases.find(
                (p) => p.bathroom === bathroom && p.item === item
              );

              return (
                <div key={item} className="border border-black p-4 rounded">
                  <h3 className="font-semibold text-black text-lg">{item}</h3>
                  {last ? (
                    <p className="text-sm text-black">
                      Sist kjøpt av <strong>{getUserName(last.user_id)}</strong> ({formatTimeAgo(last.created_at)})
                    </p>
                  ) : (
                    <p className="text-sm text-black">Ingen registrerte kjøp ennå</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
