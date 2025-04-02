'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ConfirmWeeklyModal from './ConfirmWeeklyModal';

type User = {
  id: string;
  name: string;
  bathroom: 'Bad 1' | 'Bad 2' | null;
};

type WeeklyLog = {
  task_name: string;
  week_number: number;
  year: number;
  status: 'to do' | 'done' | 'not done';
};

export default function WeeklyResponsibility() {
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<WeeklyLog[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [skippedWeeks, setSkippedWeeks] = useState<{ week_number: number; task_name: string }[]>([]);
  const [assignments, setAssignments] = useState<{ week_number: number; task_name: string; user_id: string }[]>([]);

  useEffect(() => {
    async function fetchData() {
        const { data: users } = await supabase.from('users').select('id, name, bathroom');
        const { data: logs } = await supabase
            .from('weekly_logs')
            .select('task_name, week_number, year, status');
        const { data: assignments } = await supabase.from('weekly_assignments_custom').select('*');
        const { data: skipped } = await supabase.from('weekly_skipped_weeks').select('*');

        setUsers(users || []);
        setLogs(logs || []);
        setAssignments(assignments || []);
        setSkippedWeeks(skipped || []);
    }

    fetchData();
  }, []);

  const taskNames = ['Kjøkken/stue', 'Bad 1', 'Bad 2'];

  const getCurrentWeek = () => {
    const now = new Date();
    const firstJan = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - firstJan.getTime()) / (1000 * 60 * 60 * 24));
    return Math.ceil((days + firstJan.getDay() + 1) / 7);
  };

  const currentWeek = getCurrentWeek();
  const weeksToShow = Array.from({ length: 7 }, (_, i) => currentWeek - 3 + i);

  const hash = (str: string) =>
    Array.from(str).reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const getUserForWeek = (week: number, task: string) => {
    const skipped = skippedWeeks.some(w => w.week_number === week && w.task_name === task);
    if (skipped) return null;

    const custom = assignments.find(a => a.week_number === week && a.task_name === task);
    if (custom) return users.find((u) => u.id === custom.user_id) || null;

    const eligibleUsers = task === 'Bad 1' || task === 'Bad 2'
        ? users.filter((u) => u.bathroom === task)
        : users;

    if (eligibleUsers.length === 0) return null;

    const index = (week + hash(task)) % eligibleUsers.length;
    return eligibleUsers[index];
  };

  const getStatusForTask = (task: string, week: number): WeeklyLog['status'] | null => {
    const currentYear = new Date().getFullYear();
    const entry = logs.find(
        (log) =>
        log.task_name === task &&
        log.week_number === week &&
        log.year === currentYear
    );
    return entry?.status || null;
  };

  return (
    <div className="space-y-12">
      {taskNames.map((taskName) => (
        <div key={taskName}>
          <h2 className="text-xl font-bold text-black">{taskName}</h2>

          <p className="mb-4 text-black">
            {(() => {
                const user = getUserForWeek(currentWeek, taskName);
                return user ? (
                <>
                    Denne uken er det{' '}
                    <span className="font-semibold text-blue-600">{user.name}</span> sin tur 🧽
                </>
                ) : (
                'Ingen brukere tilgjengelig'
                );
            })()}
          </p>

          <div className="overflow-auto border rounded">
            <table className="table-auto border-collapse w-full min-w-[600px]">
              <thead>
                <tr>
                  <th className="border px-4 py-2 text-left text-black bg-gray-100">Uke</th>
                  {(taskName === 'Bad 1' || taskName === 'Bad 2'
                    ? users.filter((u) => u.bathroom === taskName)
                    : users
                  ).map((user) => (
                    <th key={user.id} className="border px-4 py-2 text-black bg-gray-100 text-sm">
                      {user.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeksToShow.map((week) => {
                  const filteredUsers =
                    taskName === 'Bad 1' || taskName === 'Bad 2'
                      ? users.filter((u) => u.bathroom === taskName)
                      : users;

                  return (
                    <tr key={week}>
                      <td
                        className={`border border-black text-black px-4 py-2 font-semibold ${
                          week === getCurrentWeek() ? 'bg-yellow-300 text-black font-bold' : ''
                        }`}
                      >
                        Uke {week}
                      </td>
                      {filteredUsers.map((user) => {
                        const assigned = getUserForWeek(week, taskName);
                        const isAssigned = assigned?.id === user.id;
                        const status = isAssigned ? getStatusForTask(taskName, week) : null;

                        return (
                            <td
                                key={user.id}
                                className={`border border-black px-4 py-2 text-center ${
                                week === getCurrentWeek() ? 'bg-yellow-300 text-black font-bold' : ''
                                }`}
                            >
                                {status === 'done'
                                ? '✅'
                                : status === 'not done'
                                ? '❌'
                                : isAssigned
                                ? '🕒'
                                : ''}
                            </td>
                          );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <button
        onClick={() => setShowConfirmModal(true)}
        className="fixed bottom-6 right-6 bg-green-600 text-white w-14 h-14 rounded-full text-3xl shadow-lg hover:bg-green-700"
      >
        ✅
      </button>

      {showConfirmModal && (
        <ConfirmWeeklyModal
            onClose={() => setShowConfirmModal(false)}
            onSubmit={async (taskName, status) => {
                const now = new Date();
                const week = getCurrentWeek();
                const year = now.getFullYear();

                const existing = logs.find(
                    (log) => log.task_name === taskName && log.week_number === week && log.year === year
                );

                if (existing) {
                    await supabase
                    .from('weekly_logs')
                    .update({ status })
                    .match({ task_name: taskName, week_number: week, year });
                } else {
                    await supabase
                    .from('weekly_logs')
                    .insert({ task_name: taskName, week_number: week, year, status });
                }

                const { data: updatedLogs } = await supabase
                    .from('weekly_logs')
                    .select('task_name, week_number, year, status');

                setLogs(updatedLogs || []);
                setShowConfirmModal(false);
            }}
        />
      )}
    </div>
  );
}
