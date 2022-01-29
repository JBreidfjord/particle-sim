import "./Simulation.css";

import { useEffect, useRef } from "react";

const getPixelRatio = (ctx) => {
  let backingStore =
    ctx.backingStorePixelRatio ||
    ctx.webkitBackingStorePixelRatio ||
    ctx.mozBackingStorePixelRatio ||
    ctx.msBackingStorePixelRatio ||
    ctx.oBackingStorePixelRatio ||
    1;

  return (window.devicePixelRatio || 1) / backingStore;
};

CanvasRenderingContext2D.prototype.drawCircle = function (x, y, radius, color) {
  const ctx = this;

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);

  ctx.fillStyle = color;
  ctx.fill();
};

export default function Simulation() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const setScale = () => {
      const ratio = getPixelRatio(ctx);
      const width = Math.round(window.innerWidth * 0.75);
      const height = Math.round(window.innerHeight * 0.75);

      const needResize = canvas.width !== width * ratio || canvas.height !== height * ratio;

      if (needResize) {
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
    };

    const render = () => {
      setScale();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const radius = 50;
      for (let i = 0; i < 10; i++) {
        ctx.drawCircle(
          radius + Math.random() * (canvas.width - radius * 2),
          radius + Math.random() * (canvas.height - radius * 2),
          radius,
          `hsl(${Math.random() * 360}, 100%, 50%)`
        );
      }
    };

    let requestId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(requestId);
  }, []);

  return (
    <div className="simulation">
      <h2>Particle Sim</h2>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
