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

const numParticles = 1000;
export default function Simulation() {
  const [isColorful, setIsColorful] = useState(false);
  const [colorProbability, setColorProbability] = useState(0.5);
  const [leftColor, setLeftColor] = useState("#39FF14");
  const [rightColor, setRightColor] = useState("#8B1412");
  const [particles, setParticles] = useState(() => {
    let particles = [];
    console.log(isColorful);
    for (let i = 0; i < numParticles; i++) {
      particles.push(
        isColorful ? Particle.random(colorProbability, leftColor, rightColor) : Particle.random()
      );
    }
    return particles;
  });
  const [running, setRunning] = useState(true);
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
          particle.color
          // "rgba(0,0,0,0.5)"
        );
      });
    };

    let requestId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(requestId);
  }, [particles, leftColor, rightColor, colorProbability]);

  // Handle running simulation
  const fps = 960;
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
      interval = setInterval(step, 1000 / (fps / 8));
    }
    return () => clearInterval(interval);
  }, [running, particles]);

  const handleReset = (forceColor) => {
    setParticles(() => {
      let particles = [];
      for (let i = 0; i < numParticles; i++) {
        particles.push(
          forceColor ?? isColorful
            ? Particle.random(colorProbability, leftColor, rightColor)
            : Particle.random()
        );
      }
      return particles;
    });
  };

  return (
    <div className="simulation">
      <h2>Particle Sim</h2>
      <canvas ref={canvasRef}></canvas>
      <button onClick={() => setRunning((prevRunning) => !prevRunning)}>
        {running ? "Stop" : "Start"}
      </button>
      <button onClick={handleReset}>Reset</button>
      <label>
        <span> Color: </span>
        <input
          type="checkbox"
          onChange={(e) => {
            setIsColorful(e.target.checked);
            handleReset(e.target.checked);
          }}
        />
      </label>
      {isColorful && (
        <div className="color-picker">
          <input
            type="color"
            value={leftColor}
            onChange={(e) => {
              setLeftColor(e.target.value);
              handleReset(e.target.value ?? undefined);
            }}
          />
          <input
            type="color"
            value={rightColor}
            onChange={(e) => {
              setRightColor(e.target.value);
              handleReset(e.target.value ?? undefined);
            }}
          />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={colorProbability}
            onChange={(e) => {
              setColorProbability(e.target.value);
              handleReset(e.target.value ?? undefined);
            }}
          />
        </div>
      )}
    </div>
  );
}
