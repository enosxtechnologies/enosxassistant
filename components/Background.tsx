export default function Background() {
  return (
    <div className="fixed inset-0 -z-10 bg-black overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, rgba(255,0,0,0.2), transparent 60%)",
        }}
      />
      {Array.from({ length: 40 }).map((_, i) => (
        <span
          key={i}
          className="absolute w-1 h-1 bg-red-500 rounded-full animate-pulse"
          style={{
            top: Math.random() * 100 + "%",
            left: Math.random() * 100 + "%",
            opacity: Math.random(),
          }}
        />
      ))}
    </div>
  );
}
