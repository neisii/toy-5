import { TodoInput } from "./components/TodoInput";
import { TodoList } from "./components/TodoList";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          할 일 관리 앱
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <TodoInput />
          <TodoList />
        </div>
      </div>
    </div>
  );
}

export default App;
