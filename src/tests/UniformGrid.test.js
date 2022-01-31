import Particle from "../Particle";

test("generates no pairs of particles", () => {
  const particles = [
    new Particle(0.25, 0.25, 0, 0, 0.04), // Bottom left quadrant
    new Particle(0.25, 0.75, 0, 0, 0.04), // Top left quadrant
    new Particle(0.75, 0.75, 0, 0, 0.04), // Top right quadrant
    new Particle(0.75, 0.25, 0, 0, 0.04), // Bottom right quadrant
  ];
  expect(Particle.generatePairs(particles)).toEqual([]);
});

test("generates pairs of particles", () => {
  const particles = [
    new Particle(0.1, 0.1, 0, 0, 0.04), // Bottom left quadrant
    new Particle(0.25, 0.25, 0, 0, 0.04), // Bottom left quadrant
    new Particle(0.9, 0.9, 0, 0, 0.04), // Top right quadrant
    new Particle(0.8, 0.8, 0, 0, 0.04), // Top right quadrant
  ];
  expect(Particle.generatePairs(particles)).toEqual([
    [
      { x: 0.1, y: 0.1, vx: 0, vy: 0, r: 0.04, ax: 0, ay: 0 },
      { x: 0.25, y: 0.25, vx: 0, vy: 0, r: 0.04, ax: 0, ay: 0 },
    ],
    [
      { x: 0.9, y: 0.9, vx: 0, vy: 0, r: 0.04, ax: 0, ay: 0 },
      { x: 0.8, y: 0.8, vx: 0, vy: 0, r: 0.04, ax: 0, ay: 0 },
    ],
  ]);
});

test("generates multiple pairs per grid cell", () => {
  const particles = [
    new Particle(0.1, 0.1, 0, 0, 0.04), // Bottom left quadrant
    new Particle(0.15, 0.15, 0, 0, 0.04), // Bottom left quadrant
    new Particle(0.25, 0.25, 0, 0, 0.04), // Bottom left quadrant
    new Particle(0.8, 0.8, 0, 0, 0.04), // Top right quadrant
  ];
  expect(Particle.generatePairs(particles)).toEqual([
    [
      { x: 0.1, y: 0.1, vx: 0, vy: 0, r: 0.04, ax: 0, ay: 0 },
      { x: 0.15, y: 0.15, vx: 0, vy: 0, r: 0.04, ax: 0, ay: 0 },
    ],
    [
      { x: 0.1, y: 0.1, vx: 0, vy: 0, r: 0.04, ax: 0, ay: 0 },
      { x: 0.25, y: 0.25, vx: 0, vy: 0, r: 0.04, ax: 0, ay: 0 },
    ],
    [
      { x: 0.15, y: 0.15, vx: 0, vy: 0, r: 0.04, ax: 0, ay: 0 },
      { x: 0.25, y: 0.25, vx: 0, vy: 0, r: 0.04, ax: 0, ay: 0 },
    ],
  ]);
});

test("generates pairs for particles on cell border", () => {
  const particles = [
    new Particle(0.5, 0.5, 0, 0, 0.04), // Center
    new Particle(0.25, 0.25, 0, 0, 0.04), // Bottom left quadrant
    new Particle(0.25, 0.75, 0, 0, 0.04), // Top left quadrant
    new Particle(0.75, 0.75, 0, 0, 0.04), // Top right quadrant
  ];
  expect(Particle.generatePairs(particles)).toEqual([
    [
      { x: 0.5, y: 0.5, vx: 0, vy: 0, r: 0.04, ax: 0, ay: 0 },
      { x: 0.25, y: 0.25, vx: 0, vy: 0, r: 0.04, ax: 0, ay: 0 },
    ],
    [
      { x: 0.5, y: 0.5, vx: 0, vy: 0, r: 0.04, ax: 0, ay: 0 },
      { x: 0.25, y: 0.75, vx: 0, vy: 0, r: 0.04, ax: 0, ay: 0 },
    ],
    [
      { x: 0.5, y: 0.5, vx: 0, vy: 0, r: 0.04, ax: 0, ay: 0 },
      { x: 0.75, y: 0.75, vx: 0, vy: 0, r: 0.04, ax: 0, ay: 0 },
    ],
  ]);
});
