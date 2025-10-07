import { useTodoStore } from "../store/useTodoStore";
import { TodoItem } from "./TodoItem";
import type { FilterType } from "../types/todo";

export function TodoList() {
  const todos = useTodoStore((state) => state.todos);
  const filter = useTodoStore((state) => state.filter);
  const setFilter = useTodoStore((state) => state.setFilter);
  const getFilteredTodos = useTodoStore((state) => state.getFilteredTodos);

  const filteredTodos = getFilteredTodos();
  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  const filters: { label: string; value: FilterType }[] = [
    { label: "전체", value: "all" },
    { label: "진행중", value: "active" },
    { label: "완료", value: "completed" },
  ];

  return (
    <div>
      {/* Filter Buttons */}
      <div className="flex gap-2 mb-4">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === f.value
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Todo Items */}
      <div className="space-y-2 mb-4">
        {filteredTodos.length === 0 ? (
          <p className="text-center text-gray-400 py-8">
            {filter === "all" && "할 일이 없습니다"}
            {filter === "active" && "진행 중인 할 일이 없습니다"}
            {filter === "completed" && "완료된 할 일이 없습니다"}
          </p>
        ) : (
          filteredTodos.map((todo) => <TodoItem key={todo.id} todo={todo} />)
        )}
      </div>

      {/* Stats */}
      {todos.length > 0 && (
        <div className="text-sm text-gray-600 text-center">
          총 {todos.length}개 / 완료 {completedCount}개 / 진행중 {activeCount}개
        </div>
      )}
    </div>
  );
}
