export default function CommandBar() {
  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="bg-white/5 backdrop-blur-xl border border-red-500/30 rounded-2xl p-4 flex items-center shadow-[0_0_30px_rgba(255,0,0,0.2)]">
        <input
          className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
          placeholder="Enter your command..."
        />
        <button className="ml-3 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl">
          ➤
        </button>
      </div>
    </div>
  );
}
