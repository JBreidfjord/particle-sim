import Particle from "./Particle";

export default function Controls({
  numParticles,
  setNumParticles,
  speedMult,
  setSpeedMult,
  radius,
  setRadius,
  running,
  setRunning,
  setParticles,
}) {
  return (
    <div className="controls">
      <label>
        Number of Particles
        <input
          type="number"
          onChange={(numParticles) => setNumParticles(parseFloat(numParticles.target.value))}
          value={numParticles}
          min="1"
          step="1"
        />
      </label>
      <label>
        Speed Multiplier
        <input
          type="range"
          onChange={(speedMult) => setSpeedMult(parseFloat(speedMult.target.value))}
          value={speedMult}
          min="0.1"
          max="10"
          step="0.1"
        />
      </label>
      <label>
        Particle Radius
        <input
          type="range"
          onChange={(radius) => setRadius(parseFloat(radius.target.value))}
          value={radius}
          min="0.002"
          max="0.1"
          step="0.00002"
        />
      </label>
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
    </div>
  );
}
