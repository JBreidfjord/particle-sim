export default class Particle {
  constructor(initialX, initialY, initialVx, initialVy, radius) {
    this.x = initialX;
    this.y = initialY;
    this.vx = initialVx;
    this.vy = initialVy;
    this.r = radius;
    this.ax = 0.0;
    this.ay = 0.0;
  }

  static random() {
    const r = 0.015;

    return new Particle(
      Math.max(Math.min(Math.random(), 1.0 - r * 1.5), r * 1.5),
      Math.max(Math.min(Math.random(), 1.0 - r * 1.5), r * 1.5),
      Math.random() - 0.5,
      Math.random() - 0.5,
      r
    );
  }

  static generatePairs(particles) {
    // Uniform Grid Partition
    // Create a grid of particles
    let grid = [];
    const gridSize = Math.ceil(Math.sqrt(particles.length));
    const gridWidth = 1.0 / gridSize;

    // Check for particles within each grid cell
    // If a particle is on the border between cells, it is added to both cells
    particles.forEach((particle) => {
      const minX = Math.floor((particle.x - particle.r) / gridWidth);
      const maxX = Math.floor((particle.x + particle.r) / gridWidth);
      const minY = Math.floor((particle.y - particle.r) / gridWidth);
      const maxY = Math.floor((particle.y + particle.r) / gridWidth);

      for (let i = minX; i <= maxX; i++) {
        for (let j = minY; j <= maxY; j++) {
          const gridIndex = i + j * gridSize;
          // Check if array at index already exists
          if (!grid[gridIndex]) {
            grid[gridIndex] = [];
          }
          grid[gridIndex].push(particle);
        }
      }
    });

    // Filter cells with less than 2 particles
    grid = grid.filter((cell) => cell && cell.length > 1);

    // Iterate through grid cells and create pairs
    return grid.reduce((pairs, cell) => {
      cell.forEach((particle1, i) => {
        cell.forEach((particle2, j) => {
          if (j > i) {
            pairs.push([particle1, particle2]);
          }
        });
      });
      return pairs;
    }, []);
  }

  static handleParticleCollisions(particlePairs) {
    particlePairs.forEach(([particle1, particle2]) => {
      // Set the differences in velocities and positions
      const vxDiff = particle1.vx - particle2.vx;
      const vyDiff = particle1.vy - particle2.vy;
      const xDiff = particle2.x - particle1.x;
      const yDiff = particle2.y - particle1.y;

      // Calculate distance between particles
      const distanceBetween = Math.hypot(xDiff, yDiff);

      if (distanceBetween < particle1.r + particle2.r) {
        // Set momentum and velocity calculations using the conservation of momentum

        // Prevent overlap of particles
        if (vxDiff * xDiff + vyDiff * yDiff >= 0) {
          // Find angle between the particles at the point of collision
          const angleBetween = -Math.atan2(yDiff, xDiff);

          // Calculate the velocities along the plane of collision
          const initialVelocity1 = {
            x: particle1.vx * Math.cos(angleBetween) - particle1.vy * Math.sin(angleBetween),
            y: particle1.vx * Math.sin(angleBetween) + particle1.vy * Math.cos(angleBetween),
          };
          const initialVelocity2 = {
            x: particle2.vx * Math.cos(angleBetween) - particle2.vy * Math.sin(angleBetween),
            y: particle2.vx * Math.sin(angleBetween) + particle2.vy * Math.cos(angleBetween),
          };

          // Use the 1D conservation of momentum (all (m1 - m2) goes to 0) to get the final velocity
          const finalVelocity1 = { x: initialVelocity2.x, y: initialVelocity1.y };
          const finalVelocity2 = { x: initialVelocity1.x, y: initialVelocity2.y };

          // Reset the angle to the original axis
          const finalVector1 = {
            x:
              finalVelocity1.x * Math.cos(-angleBetween) -
              finalVelocity1.y * Math.sin(-angleBetween),
            y:
              finalVelocity1.x * Math.sin(-angleBetween) +
              finalVelocity1.y * Math.cos(-angleBetween),
          };
          const finalVector2 = {
            x:
              finalVelocity2.x * Math.cos(-angleBetween) -
              finalVelocity2.y * Math.sin(-angleBetween),
            y:
              finalVelocity2.x * Math.sin(-angleBetween) +
              finalVelocity2.y * Math.cos(-angleBetween),
          };

          // Convert the vectors to the particle velocities
          particle1.vx = finalVector1.x;
          particle1.vy = finalVector1.y;
          particle2.vx = finalVector2.x;
          particle2.vy = finalVector2.y;
        }
      }
    });
  }

  update(dt) {
    // Store old velocity to update velocity and position simultaneously
    const vx = this.vx;
    const vy = this.vy;

    // Update velocity
    this.vx += this.ax * dt;
    this.vy += this.ay * dt;

    // Update position
    this.x += vx * dt;
    this.y += vy * dt;

    this.handleBoxCollision();
  }

  handleBoxCollision() {
    // Side | Particle | Box
    // Left | x - r | 0.0
    // Right | x + r | 1.0
    // Bottom | y - r | 0.0
    // Top | y + r | 1.0
    if (this.x - this.r <= 0.0 || this.x + this.r >= 1.0) {
      // Flip horizontal velocity
      this.vx = -this.vx;

      // Correct x position
      // x at the time of collision is either radius or 1 - radius
      const xtc = this.x - this.r <= 0.0 ? this.r : 1 - this.r;
      // Calculate change in x after collision occurs
      // dx = x(1) - x(tc)
      // dx is reflected about the vertical line at x(tc)
      // Calculate final corrected x value
      // x = x(tc) - dx = x(tc) - (x(1) - x(tc)) = 2x(tc) - x(1)
      this.x = 2 * xtc - this.x;
    }
    if (this.y - this.r <= 0.0 || this.y + this.r >= 1.0) {
      // Flip vertical velocity
      this.vy = -this.vy;

      // Correct y position
      // y at the time of collision is either radius or 1 - radius
      const ytc = this.y - this.r <= 0.0 ? this.r : 1 - this.r;
      // Calculate change in y after collision occurs
      // dy = y(1) - y(tc)
      // dy is reflected about the horizontal line at y(tc)
      // Calculate final corrected y value
      // y = y(tc) - dy = y(tc) - (y(1) - y(tc)) = 2y(tc) - y(1)
      this.y = 2 * ytc - this.y;
    }
  }
}
