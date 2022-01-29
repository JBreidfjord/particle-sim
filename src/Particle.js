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
    const r = 0.04;
    return new Particle(
      Math.max(Math.min(Math.random(), 1.0 - r), r),
      Math.max(Math.min(Math.random(), 1.0 - r), r),
      Math.random() - 0.5,
      Math.random() - 0.5,
      r
    );
  }

  static handleParticleCollisions(particles) {
    particles.forEach((particle1, i) => {
      particles.forEach((particle2, j) => {
        // Skip previous and same particles to avoid duplicate collision detection
        if (j < i) {
          // Calculate distance between particles
          const distanceBetween = Math.hypot(particle1.x - particle2.x, particle1.y - particle2.y);

          if (distanceBetween < particle1.r + particle2.r) {
            // Set momentum and velocity calculations using the conservation of momentum

            // Placeholder to recognize if particles collided
            particle1.vx = -particle1.vx;
            particle1.vy = -particle1.vy;
            particle2.vx = -particle2.vx;
            particle2.vy = -particle2.vy;
          }
        }
      });
    });
  }

  update(dt) {
    // Update velocity
    this.vx += this.ax * dt;
    this.vy += this.ay * dt;

    // Update position
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.handleBoxCollision();
  }

  handleBoxCollision() {
    // Side | Particle | Box
    // Left | x - r | 0.0
    // Right | x + r | 1.0
    // Bottom | y - r | 0.0
    // Top | y + r | 1.0
    if (this.x - this.r <= 0.0 || this.x + this.r >= 1.0) {
      this.vx = -this.vx;
    }
    if (this.y - this.r <= 0.0 || this.y + this.r >= 1.0) {
      this.vy = -this.vy;
    }
  }
}
