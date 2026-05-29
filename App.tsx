import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import Background from "./components/Background";
import HomeScreen from "./components/HomeScreen";

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar />
      <div className="flex-1 relative overflow-hidden">
        <Background />
        <TopBar />
        <main className="relative z-10 p-6">
          <HomeScreen />
        </main>
      </div>
    </div>
  );
}
