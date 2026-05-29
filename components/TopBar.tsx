export default function TopBar() {
  return (
    <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="text-sm text-gray-400">Command Intelligence</div>
      <button className="bg-red-600 px-4 py-1 rounded-lg text-sm">
        Founder Mode
      </button>
    </div>
  );
}
