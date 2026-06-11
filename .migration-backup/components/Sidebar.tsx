export default function Sidebar() {
  return (
    <div className="w-64 bg-black/80 backdrop-blur-xl border-r border-white/10 p-4 flex flex-col justify-between">
      <div>
        <h1 className="text-2xl font-bold text-red-500 mb-6">EX</h1>
        <nav className="space-y-2">
          <div className="text-red-500 bg-white/5 px-3 py-2 rounded-lg">Home</div>
          <div className="hover:bg-white/5 px-3 py-2 rounded-lg">Commands</div>
          <div className="hover:bg-white/5 px-3 py-2 rounded-lg">Projects</div>
          <div className="hover:bg-white/5 px-3 py-2 rounded-lg">AI Tools</div>
        </nav>
      </div>
      <div className="text-xs text-gray-500">
        ENOSX v2.0 <br />
        Built by Enosx
      </div>
    </div>
  );
}
