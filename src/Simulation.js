import "./Simulation.css";

import { useEffect, useRef, useState } from "react";

import Particle from "./Particle";

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
  const [radius, setRadius] = useState(0.04);
  const [speedMult, setSpeedMult] = useState(1);
  const [particles, setParticles] = useState(() => {
    let particles = [];
    for (let i = 0; i < numParticles; i++) {
      particles.push(Particle.random(radius));
    }
    return particles;
  });
  const [running, setRunning] = useState(false);
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
    };

    let interval;
    if (running) {
      interval = setInterval(step, 1000 / (fps * speedMult));
    }
    return () => clearInterval(interval);
  }, [running, particles, speedMult]);

  return (
    <div className="simulation">
      <h2>Particle Sim</h2>
      <canvas ref={canvasRef}></canvas>
      <button onClick={() => setRunning((prevRunning) => !prevRunning)}>
        {running ? "Stop" : "Start"}
      </button>
      <button
        onClick={() =>
          setParticles(() => {
            let particles = [];
            for (let i = 0; i < numParticles; i++) {
              particles.push(Particle.random(radius));
            }
            return particles;
          })
        }
      >
        Reset
      </button>
      <p>Number of Particles</p>
      <input
        type='number'
        onChange={(numParticles) => setNumParticles(parseFloat(numParticles.target.value))}
        value={numParticles}
        min='1'
        step='1'
        />
      <p>Speed Multiplier</p>
      <input
        type='number'
        onChange={(speedMult) => setSpeedMult(parseFloat(speedMult.target.value))}
        value={speedMult}
        min='0.1'
        max='10'
        step='0.1'
      />
      <p>Particle Radius:</p>
      <input
        type="range"
        onChange={(radius) => setRadius(parseFloat(radius.target.value))}
        value={radius}
        min="0.005"
        max="0.1"
        step="0.005"
      />
    </div>
  );
}
