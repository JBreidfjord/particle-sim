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
              const angleBetween = -Math.atan2((yDiff), (xDiff));

              // Calculate the velocities along the plane of collision
              const initialVelocity1 = {
                x: (particle1.vx * Math.cos(angleBetween)) - (particle1.vy * Math.sin(angleBetween)),
                y: (particle1.vx * Math.sin(angleBetween)) + (particle1.vy * Math.cos(angleBetween))
              };
              const initialVelocity2 = {
                x: (particle2.vx * Math.cos(angleBetween)) - (particle2.vy * Math.sin(angleBetween)),
                y: (particle2.vx * Math.sin(angleBetween)) + (particle2.vy * Math.cos(angleBetween))
              };

              // Use the 1D conservation of momentum (all (m1 - m2) goes to 0) to get the final velocity
              const finalVelocity1 = {x: initialVelocity2.x, y: initialVelocity1.y};
              const finalVelocity2 = {x: initialVelocity1.x, y: initialVelocity2.y};

              // Reset the angle to the original axis
              const finalVector1 = {
                x: (finalVelocity1.x * Math.cos(-angleBetween)) - (finalVelocity1.y * Math.sin(-angleBetween)),
                y: (finalVelocity1.x * Math.sin(-angleBetween)) + (finalVelocity1.y * Math.cos(-angleBetween))
              };
              const finalVector2 = {
                x: (finalVelocity2.x * Math.cos(-angleBetween)) - (finalVelocity2.y * Math.sin(-angleBetween)),
                y: (finalVelocity2.x * Math.sin(-angleBetween)) + (finalVelocity2.y * Math.cos(-angleBetween))
              };

              // Convert the vectors to the particle velocities
              particle1.vx = finalVector1.x;
              particle1.vy = finalVector1.y;
              particle2.vx = finalVector2.x;
              particle2.vy = finalVector2.y;

            }
           
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
