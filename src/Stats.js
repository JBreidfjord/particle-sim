import Particle from "./Particle";

export default function Stats({ particles, elapsed, numParticles }) {
  return (
    <div className="stats">
      {particles && elapsed > 0 && (
        <>
          <p>
            {/* P = F / A, F = Δp / Δt */}
            {/* A = 1 when container wall length = 1 */}
            Simulated Pressure:{" "}
            {(
              particles.reduce(
                (momentumTransferred, particle) =>
                  momentumTransferred + particle.momentumTransferred,
                0
              ) / elapsed
            ).toFixed(5)}
          </p>
          <p>Elapsed: {elapsed.toFixed(2)}s</p>
          <p>
            {/* P = (2N / 3V)(KEavg), where N is the number of particles */}
            {/* V = 1 when container wall length = 1 */}
            Calculated Pressure:{" "}
            {(
              ((2 * numParticles) / 3) *
              (particles.reduce(
                (kineticEnergy, particle) => kineticEnergy + Particle.kineticEnergy(particle),
                0
              ) /
                numParticles)
            ).toFixed(5)}
          </p>
        </>
      )}
    </div>
  );
}
