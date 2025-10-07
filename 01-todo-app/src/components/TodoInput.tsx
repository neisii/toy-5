import { useState, FormEvent } from 'react';
import { useTodoStore } from '../store/useTodoStore';

export function TodoInput() {
  const [input, setInput] = useState('');
  const addTodo = useTodoStore((state) => state.addTodo);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const trimmedInput = input.trim();
    if (trimmedInput === '') return;

    addTodo(trimmedInput);
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex gap-2">
        <input
          type="text"
          name="todo"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="할 일을 입력하세요..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          추가
        </button>
      </div>
    </form>
  );
}
