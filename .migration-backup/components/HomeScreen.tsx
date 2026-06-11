import CommandBar from "./CommandBar";

export default function HomeScreen() {
  return (
    <div className="text-center mt-20">
      <h1 className="text-6xl font-bold tracking-wide">
        ENOSX <span className="text-red-500">AI</span>
      </h1>

      <p className="text-gray-400 tracking-widest mt-2">
        COMMAND INTELLIGENCE
      </p>

      <p className="mt-4 text-gray-500">
        Ask. Build. Control.
      </p>

      <CommandBar />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 max-w-5xl mx-auto">
        <Card title="Build Website" />
        <Card title="Create AI" />
        <Card title="Cyber Tools" />
        <Card title="Code Help" />
      </div>
    </div>
  );
}

function Card({ title }: { title: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 hover:border-red-500/50 transition hover:shadow-[0_0_20px_rgba(255,0,0,0.2)]">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-gray-400 mt-1">Execute instantly</p>
    </div>
  );
}
