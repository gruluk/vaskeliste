'use client';

import { useState } from 'react';

type Props = {
  onClose: () => void;
  onSubmit: (taskName: string, status: 'done' | 'to do' | 'not done') => void;
};

const WEEKLY_TASK_NAMES = ['Kjøkken/stue', 'Bad 1', 'Bad 2'];

export default function ConfirmWeeklyModal({ onClose, onSubmit }: Props) {
  const [selectedTaskName, setSelectedTaskName] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'done' | 'to do' | 'not done'>('done');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
      <div className="bg-white p-6 rounded-lg w-full max-w-sm space-y-4">
        <h2 className="text-xl font-semibold text-black">Fullfør ukesoppgave</h2>

        <div>
          <label className="block mb-1 text-black">Hvilken oppgave har du gjort?</label>
          <select
            value={selectedTaskName}
            onChange={(e) => setSelectedTaskName(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Velg oppgave</option>
            {WEEKLY_TASK_NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-black">Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as 'done' | 'to do' | 'not done')}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="done">✅ Gjort</option>
            <option value="to do">🕒 Skal gjøres</option>
            <option value="not done">❌ Ikke gjort</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button onClick={onClose} className="text-gray-500">
            Avbryt
          </button>
          <button
            disabled={!selectedTaskName}
            onClick={() => onSubmit(selectedTaskName, selectedStatus)}
            className={`px-4 py-2 rounded ${
              selectedTaskName
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Bekreft
          </button>
        </div>
      </div>
    </div>
  );
}
