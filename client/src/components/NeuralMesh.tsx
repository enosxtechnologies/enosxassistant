/*
 * Neural Mesh Component
 * Reactive background mesh that responds to AI processing complexity
 * Creates a "living" neural network visualization
 */

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface NeuralMeshProps {
  isActive: boolean;
  complexity?: number; // 0-1 scale
  color?: string;
}

export default function NeuralMesh({
  isActive,
  complexity = 0.5,
  color = "rgba(0, 242, 255, 0.15)",
}: NeuralMeshProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Array<{ x: number; y: number; vx: number; vy: number }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Initialize nodes
    const nodeCount = Math.floor(8 + complexity * 12);
    const newNodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
    }));
    setNodes(newNodes);

    const animate = () => {
      if (!isActive) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw nodes
      newNodes.forEach((node, i) => {
        node.x += node.vx * (0.5 + complexity);
        node.y += node.vy * (0.5 + complexity);

        // Bounce off walls
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        // Keep in bounds
        node.x = Math.max(0, Math.min(canvas.width, node.x));
        node.y = Math.max(0, Math.min(canvas.height, node.y));

        // Draw node
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 3);
        gradient.addColorStop(0, color.replace("0.15", "0.6"));
        gradient.addColorStop(1, color.replace("0.15", "0.1"));
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw connections
        newNodes.forEach((other, j) => {
          if (i >= j) return;

          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = 150 + complexity * 100;

          if (distance < maxDistance) {
            ctx.strokeStyle = color.replace(
              "0.15",
              String(0.1 * (1 - distance / maxDistance))
            );
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, [isActive, complexity, color]);

  if (!isActive) return null;

  return (
    <motion.canvas
      ref={canvasRef}
      width={typeof window !== "undefined" ? window.innerWidth : 1920}
      height={typeof window !== "undefined" ? window.innerHeight : 1080}
      className="fixed inset-0 pointer-events-none z-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        mixBlendMode: "screen",
      }}
    />
  );
}
