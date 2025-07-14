import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ToastProvider from "./components/ToastProvider";
import Room from "./pages/Room";

function App() {
  return (
    <ToastProvider>
    <Router>
      <Routes>
        {/* Route for collaborative room */}
        <Route path="/room/:roomId" element={<Room />} />

        {/* Optional: Homepage with link to create/join a room */}
        <Route
          path="/"
          element={
            <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white gap-4">
              <h1 className="text-3xl font-bold">Realtime Code Editor</h1>
              <a
                href={`/room/${crypto.randomUUID().slice(0, 8)}`}
                className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                ➕ Create New Room
              </a>
            </div>
          }
        />
      </Routes>
    </Router>
    </ToastProvider>
  );
}

export default App;