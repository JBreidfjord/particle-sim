import Particle from "./Particle";

const k = 1.38064852 * Math.pow(10, -23); // Boltzmann constant

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
            {/* P = (NkT)/A, where N is the number of particles and k is the Boltzmann constant */}
            {/* A = 1 when container wall length = 1 */}
            Calculated Pressure: {(numParticles * k * Particle.temperature(particles)).toFixed(5)}
          </p>
        </>
      )}
    </div>
  );
}
