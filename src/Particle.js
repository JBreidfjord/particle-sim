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
    return new Particle(Math.random(), Math.random(), Math.random() - 0.5, Math.random() - 0.5, 50);
  }

  update(dt) {
    // Update velocity
    this.vx += this.ax * dt;
    this.vy += this.ay * dt;

    // Update position
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }
}
