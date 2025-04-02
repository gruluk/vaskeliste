type Props = {
  users: { id: string; name: string }[];
  tasks: { id: string; name: string }[];
  selectedUser: string;
  selectedTask: string;
  onUserChange: (id: string) => void;
  onTaskChange: (id: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export default function AddTaskModal({
  users,
  tasks,
  selectedUser,
  selectedTask,
  onUserChange,
  onTaskChange,
  onClose,
  onSubmit,
}: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
      <div className="bg-white p-6 rounded-lg w-full max-w-sm space-y-4">
        <h2 className="text-xl font-semibold text-black">Hva har du gjort?</h2>

        <div>
          <label className="block mb-1 text-black">Hvem er du?</label>
          <select
            value={selectedUser}
            onChange={(e) => onUserChange(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Velg navn</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-black">Hva gjorde du?</label>
          <select
            value={selectedTask}
            onChange={(e) => onTaskChange(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Velg oppgave</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button onClick={onClose} className="text-gray-500">
            Avbryt
          </button>
          <button
            onClick={onSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Legg til
          </button>
        </div>
      </div>
    </div>
  );
}
