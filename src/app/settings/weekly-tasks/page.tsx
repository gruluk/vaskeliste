'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import NavBar from '@/components/NavBar';

type User = { id: string; name: string; bathroom: 'Bad 1' | 'Bad 2' | null };
type CustomAssignment = { week_number: number; task_name: string; user_id: string };
type SkippedWeek = { week_number: number; task_name: string };
type WeeklyLog = {
  week_number: number;
  year: number;
  task_name: string;
  status: 'to do' | 'done' | 'not done';
};

const TASK_NAMES = ['Kjøkken/stue', 'Bad 1', 'Bad 2'];

export default function ManageWeeklyTasksPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<CustomAssignment[]>([]);
  const [skippedWeeks, setSkippedWeeks] = useState<SkippedWeek[]>([]);
  const [logs, setLogs] = useState<WeeklyLog[]>([]);

  const getWeekNumber = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.ceil((days + start.getDay() + 1) / 7);
  };

  const currentYear = new Date().getFullYear();
  const weeksToShow = Array.from({ length: 7 }, (_, i) => getWeekNumber() - 3 + i);

  useEffect(() => {
    async function fetchData() {
      const { data: users } = await supabase.from('users').select('id, name, bathroom');
      const { data: custom } = await supabase.from('weekly_assignments_custom').select('*');
      const { data: skipped } = await supabase.from('weekly_skipped_weeks').select('*');
      const { data: logs } = await supabase
        .from('weekly_logs')
        .select('task_name, week_number, year, status');

      setUsers(users || []);
      setAssignments(custom || []);
      setSkippedWeeks(skipped || []);
      setLogs(logs || []);
    }

    fetchData();
  }, []);

  const handleAssign = async (week: number, task: string, userId: string) => {
    await supabase.from('weekly_assignments_custom').upsert(
      { week_number: week, task_name: task, user_id: userId },
      { onConflict: 'week_number,task_name' }
    );

    setAssignments((prev) =>
      [...prev.filter(a => !(a.week_number === week && a.task_name === task)), { week_number: week, task_name: task, user_id: userId }]
    );
  };

  const toggleSkipWeek = async (week: number, task: string) => {
    const isSkipped = skippedWeeks.some(w => w.week_number === week && w.task_name === task);
    if (isSkipped) {
      await supabase.from('weekly_skipped_weeks').delete().match({ week_number: week, task_name: task });
      setSkippedWeeks(prev => prev.filter(w => !(w.week_number === week && w.task_name === task)));
    } else {
      await supabase.from('weekly_skipped_weeks').insert({ week_number: week, task_name: task });
      setSkippedWeeks(prev => [...prev, { week_number: week, task_name: task }]);
    }
  };

  const updateStatus = async (
    week: number,
    task: string,
    statusValue: WeeklyLog['status']
  ) => {
    const existing = logs.find(
      (l) => l.week_number === week && l.task_name === task && l.year === currentYear
    );

    if (existing) {
      await supabase
        .from('weekly_logs')
        .update({ status: statusValue })
        .match({ week_number: week, task_name: task, year: currentYear });
    } else {
      await supabase
        .from('weekly_logs')
        .insert({ week_number: week, task_name: task, status: statusValue, year: currentYear });
    }

    const { data: updatedLogs } = await supabase
      .from('weekly_logs')
      .select('task_name, week_number, year, status');
    setLogs(updatedLogs || []);
  };

  const getStatus = (week: number, task: string): WeeklyLog['status'] =>
    logs.find((log) => log.week_number === week && log.task_name === task && log.year === currentYear)?.status || 'to do';

  const isSkipped = (week: number, task: string) =>
    skippedWeeks.some((s) => s.week_number === week && s.task_name === task);

  const getAssignedUserId = (week: number, task: string): string => {
    const custom = assignments.find((a) => a.week_number === week && a.task_name === task);
    if (custom) return custom.user_id;

    if (isSkipped(week, task)) return '';

    const eligibleUsers =
      task === 'Bad 1' || task === 'Bad 2'
        ? users.filter((u) => u.bathroom === task)
        : users;

    if (eligibleUsers.length === 0) return '';

    const hash = (str: string) => Array.from(str).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = (week + hash(task)) % eligibleUsers.length;
    return eligibleUsers[index]?.id || '';
  };

  return (
    <>
      <NavBar />
      <div className="bg-white text-black min-h-screen">
        <main className="p-6 max-w-6xl mx-auto space-y-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">🧽 Administrer ukesoppgaver</h1>

          {TASK_NAMES.map((task) => (
            <div key={task}>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">{task}</h2>

              <div className="overflow-x-auto">
                <table className="table-auto border-collapse w-full min-w-[700px] border">
                  <thead>
                    <tr>
                      <th className="border px-4 py-2 bg-gray-100 text-left">Uke</th>
                      <th className="border px-4 py-2 bg-gray-100 text-left">Bruker</th>
                      <th className="border px-4 py-2 bg-gray-100 text-left">Hopp over?</th>
                      <th className="border px-4 py-2 bg-gray-100 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeksToShow.map((week) => {
                      const selectedUserId = getAssignedUserId(week, task);
                      const status = getStatus(week, task);

                      return (
                        <tr key={week}>
                          <td className="border px-4 py-2">Uke {week}</td>
                          <td className="border px-4 py-2">
                            <select
                              value={selectedUserId}
                              onChange={(e) => handleAssign(week, task, e.target.value)}
                              className="border rounded px-3 py-2 shadow-sm text-black"
                            >
                              <option value="">Velg bruker</option>
                              {users
                                .filter((u) => task === 'Kjøkken/stue' || u.bathroom === task)
                                .map((user) => (
                                  <option key={user.id} value={user.id}>
                                    {user.name}
                                  </option>
                                ))}
                            </select>
                          </td>
                          <td className="border px-4 py-2 text-center">
                            <button
                              onClick={() => toggleSkipWeek(week, task)}
                              className={`px-4 py-2 rounded text-sm font-medium shadow-sm transition ${
                                isSkipped(week, task)
                                  ? 'bg-red-500 text-white hover:bg-red-600'
                                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                              }`}
                            >
                              {isSkipped(week, task) ? '❌ Hoppet over' : 'Hopp over'}
                            </button>
                          </td>
                          <td className="border px-4 py-2">
                            <select
                              value={status}
                              onChange={(e) =>
                                updateStatus(week, task, e.target.value as WeeklyLog['status'])
                              }
                              className="border rounded px-3 py-2 shadow-sm text-black"
                            >
                              <option value="to do">🕒 Skal gjøres</option>
                              <option value="done">✅ Gjort</option>
                              <option value="not done">❌ Ikke gjort</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </main>
      </div>
    </>
  );
}
