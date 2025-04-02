import UserTally from './UserTally';

type User = { id: string; name: string };
type Task = { id: string; name: string };
type Tally = { user_id: string; task_id: string; count: number };
type TaskLastDone = { task_id: string; last_done: string };

type Props = {
  users: User[];
  tasks: Task[];
  tallies: Tally[];
  taskLastDone: TaskLastDone[];
};

export default function TaskList({ users, tasks, tallies, taskLastDone }: Props) {
  function getTally(userId: string, taskId: string) {
    return tallies.find((t) => t.user_id === userId && t.task_id === taskId)?.count || 0;
  }

  function getTaskLastDone(taskId: string) {
    const match = taskLastDone.find((t) => t.task_id === taskId);
    if (!match?.last_done) return 'Ingen har gjort dette ennå';

    const date = new Date(match.last_done);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);

    let result = 'for ';
    if (diffDays > 0) result += `${diffDays} dag${diffDays > 1 ? 'er' : ''}`;
    if (diffDays > 0 && diffHours > 0) result += ' og ';
    if (diffDays === 0 || diffHours > 0) result += `${diffHours} time${diffHours !== 1 ? 'r' : ''}`;
    result += ' siden';

    return `Sist gjort: ${result}`;
  }

  return (
    <>
      {tasks.map((task) => {
        const sortedUsers = [...users].sort(
          (a, b) => getTally(b.id, task.id) - getTally(a.id, task.id)
        );

        return (
          <div key={task.id} className="mb-8">
            <h2 className="text-xl font-semibold text-black mb-1">{task.name}</h2>
            <p className="text-sm text-gray-500 mb-2">{getTaskLastDone(task.id)}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {sortedUsers.map((user, index) => (
                <UserTally
                  key={`${user.id}-${task.id}`}
                  userName={user.name}
                  tallyCount={getTally(user.id, task.id)}
                  highlight={index === 0}
                />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}
