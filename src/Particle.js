export default class Particle {
  constructor(initialX, initialY, initialVx, initialVy, radius) {
    this.x = initialX;
    this.y = initialY;
    this.vx = initialVx;
    this.vy = initialVy;
    this.r = radius;
    this.ax = 0.0;
    this.ay = -0.5;
  }

  static random() {
    return new Particle(
      Math.random(),
      Math.random(),
      Math.random() - 0.5,
      Math.random() - 0.5,
      0.04
    );
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
