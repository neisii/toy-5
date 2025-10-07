import { create } from "zustand";
import type { Todo, FilterType } from "../types/todo";
import { loadTodos, saveTodos } from "../utils/storage";

interface TodoStore {
  todos: Todo[];
  filter: FilterType;

  // Actions
  addTodo: (text: string) => void;
  deleteTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
  setFilter: (filter: FilterType) => void;

  // Computed
  getFilteredTodos: () => Todo[];
}

export const useTodoStore = create<TodoStore>((set, get) => ({
  todos: loadTodos(),
  filter: "all",

  addTodo: (text: string) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: Date.now(),
    };

    set((state) => {
      const newTodos = [...state.todos, newTodo];
      saveTodos(newTodos);
      return { todos: newTodos };
    });
  },

  deleteTodo: (id: string) => {
    set((state) => {
      const newTodos = state.todos.filter((todo) => todo.id !== id);
      saveTodos(newTodos);
      return { todos: newTodos };
    });
  },

  toggleTodo: (id: string) => {
    set((state) => {
      const newTodos = state.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      );
      saveTodos(newTodos);
      return { todos: newTodos };
    });
  },

  setFilter: (filter: FilterType) => {
    set({ filter });
  },

  getFilteredTodos: () => {
    const { todos, filter } = get();

    switch (filter) {
      case "active":
        return todos.filter((todo) => !todo.completed);
      case "completed":
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  },
}));
