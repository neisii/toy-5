import type { Todo } from "../types/todo";
import { useTodoStore } from "../store/useTodoStore";

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  const toggleTodo = useTodoStore((state) => state.toggleTodo);
  const deleteTodo = useTodoStore((state) => state.deleteTodo);

  return (
    <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => toggleTodo(todo.id)}
        className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
      />
      <span
        className={`flex-1 ${
          todo.completed ? "line-through text-gray-400" : "text-gray-800"
        }`}
      >
        {todo.text}
      </span>
      <button
        onClick={() => deleteTodo(todo.id)}
        aria-label="삭제"
        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
      >
        삭제
      </button>
    </div>
  );
}
