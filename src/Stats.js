import Particle from "./Particle";

export default function Stats({ particles, elapsed }) {
  return (
    <div className="stats">
      {particles && elapsed > 0 && (
        <>
          <p>
            {/* P = F / A, F = Δp / Δt */}
            {/* A = 1 when container wall length = 1 */}
            Simulated Pressure:{" "}
            {(Particle.momentumTransferred(particles) / elapsed / 4 / 1000).toExponential(3)} kPa
          </p>
          <p>Elapsed: {elapsed.toFixed(2)}s</p>
          <p>
            {/* P = K/A, where K is the total kinetic energy of the particles */}
            {/* A = 1 when container wall length = 1 */}
            Calculated Pressure:{" "}
            {(
              Particle.totalKineticEnergy(particles) /
              (1 - Particle.area(particles)) /
              1000
            ).toExponential(3)}{" "}
            kPa
          </p>
        </>
      )}
    </div>
  );
}
