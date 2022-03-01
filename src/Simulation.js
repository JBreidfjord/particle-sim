import "./Simulation.css";

import { useEffect, useRef, useState } from "react";

import Particle from "./Particle";
import Controls from "./Controls";
import Stats from "./Stats";

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
  const [numParticles, setNumParticles] = useState(10);
  const [temperature, setTemperature] = useState(273);
  const [radius, setRadius] = useState(0.04);
  const [speedMult, setSpeedMult] = useState(1);
  const [particles, setParticles] = useState(() =>
    Particle.generateParticles(numParticles, radius)
  );
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const canvasRef = useRef(null);

  // Handle canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Handle resizing
    const setScale = () => {
      const ratio = getPixelRatio(ctx);
      // const width = Math.round(window.innerWidth * 0.75);
      // const height = Math.round(window.innerHeight * 0.75);
      const width = 600;
      const height = 600;

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
      ctx.beginPath();
      ctx.rect(0, 0, canvas.width, canvas.height);
      ctx.stroke();

      particles.forEach((particle) => {
        ctx.drawCircle(
          particle.x * canvas.width,
          canvas.height - particle.y * canvas.height,
          particle.r * canvas.height,
          "rgba(0, 0, 0, 0.5)"
        );
      });
    };

    let requestId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(requestId);
  }, [particles]);

  // Handle running simulation
  const fps = 120;
  useEffect(() => {
    const step = () => {
      setParticles((prevParticles) => {
        return prevParticles.map((particle) => {
          particle.update(1 / fps);
          return particle;
        });
      });
      const pairs = Particle.generatePairs(particles);
      Particle.handleParticleCollisions(pairs);
      setElapsed((prevElapsed) => prevElapsed + 1 / fps);
    };

    let interval;
    if (running) {
      interval = setInterval(step, 1000 / (fps * speedMult));
    }
    return () => clearInterval(interval);
  }, [running, particles, speedMult]);

  return (
    <div className="container">
      <h2>Particle Sim</h2>
      <div className="simulation">
        <Controls
          numParticles={numParticles}
          setNumParticles={setNumParticles}
          radius={radius}
          setRadius={setRadius}
          speedMult={speedMult}
          setSpeedMult={setSpeedMult}
          running={running}
          setRunning={setRunning}
          setParticles={setParticles}
          temperature={temperature}
          setTemperature={setTemperature}
        />
        <canvas ref={canvasRef}></canvas>
        <Stats particles={particles} elapsed={elapsed} numParticles={numParticles} />
      </div>
    </div>
  );
}
