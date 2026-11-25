import { useEffect, useRef } from "react";

export default function BrushTrail({ disabled = false, paper = false }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (
      disabled ||
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      matchMedia("(pointer: coarse)").matches
    )
      return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    let points = [];
    let frame;
    let lastPoint;
    const resize = () => {
      canvas.width = innerWidth;
      canvas.height = innerHeight;
      points = [];
    };
    const move = (event) => {
      if (
        event.target.closest(
          "button, a, input, textarea, dialog, .gallery-controls",
        )
      )
        return;
      const now = performance.now();
      const distance = lastPoint
        ? Math.hypot(event.clientX - lastPoint.x, event.clientY - lastPoint.y)
        : 0;
      const radius = Math.min(65, 20 + distance * 0.45);
      points.push({ x: event.clientX, y: event.clientY, time: now, radius });
      lastPoint = points[points.length - 1];
    };
    const draw = (now) => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      points = points.filter((point) => now - point.time < 1250);
      for (let i = 1; i < points.length; i++) {
        const point = points[i];
        const previous = points[i - 1];
        if (point.time - previous.time > 100) continue;
        const life = Math.max(0, 1 - (now - point.time) / 1250);
        context.globalAlpha = Math.min(1, life * 2.2);
        context.strokeStyle = paper ? "#d4cdb4" : "#292827";
        context.lineCap = "round";
        context.lineJoin = "round";
        context.lineWidth = point.radius * 2 * Math.min(1, life * 3);
        context.beginPath();
        context.moveTo(previous.x, previous.y);
        context.lineTo(point.x, point.y);
        context.stroke();
        if (i % 2 === 0) {
          context.globalAlpha = life * 0.8;
          context.fillStyle = paper ? "#696759" : "#d1cebc";
          for (let particle = 0; particle < 65; particle++) {
            const angle = particle * 2.39996 + i;
            const radius = point.radius * (0.72 + ((particle * 17) % 29) / 100);
            const x = point.x + Math.cos(angle) * radius;
            const y = point.y + Math.sin(angle) * radius;
            context.fillRect(x, y, 1, 1);
          }
        }
      }
      context.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    };
    resize();
    addEventListener("resize", resize);
    addEventListener("pointermove", move, { passive: true });
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("resize", resize);
      removeEventListener("pointermove", move);
    };
  }, [disabled, paper]);
  return <canvas ref={canvasRef} className="brush-trail" aria-hidden="true" />;
}
