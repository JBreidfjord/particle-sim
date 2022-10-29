use rand::{Rng, RngCore};
use std::{f32::consts::PI, ops::Mul};

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Particle {
    pub x: f32,
    pub y: f32,
    vx: f32,
    vy: f32,
    radius: f32,
    mass: f32,
    momentum_transferred: f32,
    box_size: f32,
}

impl Particle {
    fn random(rng: &mut dyn RngCore, radius: f32, box_size: f32) -> Particle {
        let x = rng
            .gen::<f32>()
            .mul(box_size)
            .min(box_size - radius * 1.5)
            .max(radius * 1.5);
        let y = rng
            .gen::<f32>()
            .mul(box_size)
            .min(box_size - radius * 1.5)
            .max(radius * 1.5);
        let vx = rng.gen_range(-100.0..100.0);
        let vy = rng.gen_range(-100.0..100.0);
        let mass = PI * radius.powi(2);
        let momentum_transferred = 0.0;
        Particle {
            x,
            y,
            vx,
            vy,
            radius,
            mass,
            momentum_transferred,
            box_size,
        }
    }

    fn new(x: f32, y: f32, vx: f32, vy: f32, radius: f32, box_size: f32) -> Particle {
        let mass = PI * radius.powi(2);
        let momentum_transferred = 0.0;
        Particle {
            x,
            y,
            vx,
            vy,
            radius,
            mass,
            momentum_transferred,
            box_size,
        }
    }

    pub fn generate_particles(num_particles: usize, radius: f32, box_size: f32) -> Vec<Particle> {
        let mut rng = rand::thread_rng();
        (0..num_particles)
            .map(|_| Particle::random(&mut rng, radius, box_size))
            .collect()
    }

    pub fn generate_pairs(
        particles: &[Particle],
        box_size: f32,
    ) -> Vec<((usize, Particle), (usize, Particle))> {
        // Uniform Grid Partition
        // Create a grid of particles
        let mut grid = Vec::new();
        let grid_size = ((particles.len() as f32).log(1.6572725) - 3.8929327)
            .ceil()
            .max(2.0) as usize;
        let grid_width = box_size / grid_size as f32;

        // Check for particles within each grid cell
        // If a particle is on the border between cells, it is added to both cells
        for i in 0..grid_size {
            for j in 0..grid_size {
                let x = i as f32 * grid_width;
                let y = j as f32 * grid_width;
                let mut particles_in_cell = Vec::new();
                for (index, particle) in particles.iter().enumerate() {
                    if particle.x + particle.radius >= x
                        && particle.x - particle.radius <= x + grid_width
                        && particle.y + particle.radius >= y
                        && particle.y - particle.radius <= y + grid_width
                    {
                        particles_in_cell.push((index, *particle));
                    }
                }
                grid.push(particles_in_cell);
            }
        }

        // Filter cells with less than 2 particles
        let filtered_grid = grid
            .iter()
            .filter(|particles_in_cell| particles_in_cell.len() >= 2);

        // Iterate through grid cells and create pairs
        let mut pairs = Vec::new();
        for particles_in_cell in filtered_grid {
            for i in 0..particles_in_cell.len() {
                for j in i + 1..particles_in_cell.len() {
                    pairs.push((particles_in_cell[i], particles_in_cell[j]));
                }
            }
        }

        pairs
    }

    pub fn handle_particle_collisions(
        mut particle_pairs: Vec<((usize, Particle), (usize, Particle))>,
    ) -> Vec<((usize, Particle), (usize, Particle))> {
        for ((_, particle_a), (_, particle_b)) in particle_pairs.iter_mut() {
            // Set the differences in velocities and positions
            let dx = particle_b.x - particle_a.x;
            let dy = particle_b.y - particle_a.y;
            let dvx = particle_b.vx - particle_a.vx;
            let dvy = particle_b.vy - particle_a.vy;

            // Calculate the distance between particles
            let distance = (dx * dx + dy * dy).sqrt();
            if distance < particle_a.radius + particle_b.radius {
                // Conservation of momentum

                // Prevent overlap of particles
                if dvx * dx + dvy * dy >= 0.0 {
                    // Find angle between the particle at the point of collision
                    let angle = dy.atan2(dx);

                    // Calculate velocities along the plane of collision
                    let vix_a = particle_a.vx * angle.cos() - particle_a.vy * angle.sin();
                    let viy_a = particle_a.vx * angle.sin() + particle_a.vy * angle.cos();
                    let vix_b = particle_b.vx * angle.cos() - particle_b.vy * angle.sin();
                    let viy_b = particle_b.vx * angle.sin() + particle_b.vy * angle.cos();

                    // Use the 1D conservation of momentum (where all (m1-m2) goes to 0) to get final velocity
                    let vfx_a = vix_b;
                    let vfy_a = viy_a;
                    let vfx_b = vix_a;
                    let vfy_b = viy_b;

                    // Reset the angle to the original axis
                    let vx_a = vfx_a * (-angle).cos() - vfy_a * (-angle).sin();
                    let vy_a = vfx_a * (-angle).sin() + vfy_a * (-angle).cos();
                    let vx_b = vfx_b * (-angle).cos() - vfy_b * (-angle).sin();
                    let vy_b = vfx_b * (-angle).sin() + vfy_b * (-angle).cos();

                    // Update velocities
                    particle_a.vx = vx_a;
                    particle_a.vy = vy_a;
                    particle_b.vx = vx_b;
                    particle_b.vy = vy_b;
                }
            }
        }

        particle_pairs
    }

    pub fn update(&mut self, dt: f32) {
        // Update position
        self.x += self.vx * dt;
        self.y += self.vy * dt;

        self.handle_box_collision();
    }

    pub fn update_particles(particles: &mut [Particle], dt: f32, box_size: f32) -> Vec<Particle> {
        particles
            .iter_mut()
            .for_each(|particle| particle.update(dt));

        let mut pairs = Particle::generate_pairs(particles, box_size);
        pairs = Particle::handle_particle_collisions(pairs);

        pairs.iter().for_each(|((i1, p1), (i2, p2))| {
            println!("{} and {}", i1, i2);
            particles[*i1] = *p1;
            particles[*i2] = *p2;
        });

        particles.to_vec()
    }

    fn handle_box_collision(&mut self) {
        // Side | Particle | Box
        // Left | x - r | 0.0
        // Right | x + r | box_size
        // Top | y + r | box_size
        // Bottom | y - r | 0.0
        if self.x - self.radius <= 0.0 || self.x + self.radius >= self.box_size {
            // Track momentum transfer
            // Δp = 2mv⊥
            self.momentum_transferred += 2.0 * self.mass * self.vx.abs();

            // Reflect horizontal velocity
            self.vx = -self.vx;

            // Correct x position
            // x at the time of collision is either radius or box_size - radius
            let x_time_of_collision = if self.x - self.radius <= 0.0 {
                self.radius
            } else {
                self.box_size - self.radius
            };
            // Calculate change in x after collision occurs
            // dx = x(1) - x(tc)
            // dx is reflected about the vertical line at x(tc)
            // Calculate final corrected x value
            // x = x(tc) - dx = x(tc) - (x(1) - x(tc)) = 2x(tc) - x(1)
            self.x = 2.0 * x_time_of_collision - self.x;
        }

        if self.y - self.radius <= 0.0 || self.y + self.radius >= self.box_size {
            // Track momentum transfer
            // Δp = 2mv⊥
            self.momentum_transferred += 2.0 * self.mass * self.vy.abs();

            // Reflect vertical velocity
            self.vy = -self.vy;

            // Correct y position
            // y at the time of collision is either radius or box_size - radius
            let y_time_of_collision = if self.y - self.radius <= 0.0 {
                self.radius
            } else {
                self.box_size - self.radius
            };
            // Calculate change in y after collision occurs
            // dy = y(1) - y(tc)
            // dy is reflected about the horizontal line at y(tc)
            // Calculate final corrected y value
            // y = y(tc) - dy = y(tc) - (y(1) - y(tc)) = 2y(tc) - y(1)
            self.y = 2.0 * y_time_of_collision - self.y;
        }
    }

    fn get_velocity(&self) -> f32 {
        (self.vx * self.vx + self.vy * self.vy).sqrt()
    }

    fn get_kinetic_energy(&self) -> f32 {
        0.5 * self.mass * self.get_velocity().powi(2)
    }

    fn get_total_kinetic_energy(particles: &[Particle]) -> f32 {
        particles
            .iter()
            .fold(0.0, |acc, particle| acc + particle.get_kinetic_energy())
    }

    fn get_area(particles: &[Particle]) -> f32 {
        particles
            .iter()
            .fold(0.0, |acc, particle| acc + particle.radius.powi(2) * PI)
    }

    fn get_total_momentum_transferred(particles: &[Particle]) -> f32 {
        particles
            .iter()
            .fold(0.0, |acc, particle| acc + particle.momentum_transferred)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn get_matching_count(a: &[(Particle, Particle)], b: &[(Particle, Particle)]) -> usize {
        a.iter()
            .zip(b.iter())
            .filter(|&(a, b)| a.0 == b.0 && a.1 == b.1)
            .count()
    }

    #[test]
    fn test_generate_no_pairs() {
        let particles = vec![
            Particle::new(0.25, 0.25, 0.0, 0.0, 0.04), // Bottom left quadrant
            Particle::new(0.25, 0.75, 0.0, 0.0, 0.04), // Top left quadrant
            Particle::new(0.75, 0.75, 0.0, 0.0, 0.04), // Top right quadrant
            Particle::new(0.75, 0.25, 0.0, 0.0, 0.04), // Bottom right quadrant
        ];
        let pairs = Particle::generate_pairs(particles);
        let expected_pairs: Vec<(Particle, Particle)> = vec![];

        assert_eq!(pairs.len(), expected_pairs.len());
        let matching = get_matching_count(&pairs, &expected_pairs);
        assert!(matching == pairs.len() && matching == expected_pairs.len());
    }

    #[test]
    fn test_generate_pairs() {
        let particles = vec![
            Particle::new(0.1, 0.1, 0.0, 0.0, 0.04), // Bottom left quadrant
            Particle::new(0.25, 0.25, 0.0, 0.0, 0.04), // Bottom left quadrant
            Particle::new(0.9, 0.9, 0.0, 0.0, 0.04), // Top right quadrant
            Particle::new(0.8, 0.8, 0.0, 0.0, 0.04), // Top right quadrant
        ];
        let pairs = Particle::generate_pairs(particles);
        let expected_pairs = vec![
            (
                Particle::new(0.1, 0.1, 0.0, 0.0, 0.04),
                Particle::new(0.25, 0.25, 0.0, 0.0, 0.04),
            ),
            (
                Particle::new(0.9, 0.9, 0.0, 0.0, 0.04),
                Particle::new(0.8, 0.8, 0.0, 0.0, 0.04),
            ),
        ];

        assert_eq!(pairs.len(), expected_pairs.len());
        let matching = get_matching_count(&pairs, &expected_pairs);
        assert!(matching == pairs.len() && matching == expected_pairs.len());
    }

    #[test]
    fn test_generate_multiple_pairs_per_grid_cell() {
        let particles = vec![
            Particle::new(0.1, 0.1, 0.0, 0.0, 0.04), // Bottom left quadrant
            Particle::new(0.15, 0.15, 0.0, 0.0, 0.04), // Bottom left quadrant
            Particle::new(0.25, 0.25, 0.0, 0.0, 0.04), // Bottom left quadrant
            Particle::new(0.8, 0.8, 0.0, 0.0, 0.04), // Top right quadrant
        ];
        let pairs = Particle::generate_pairs(particles);
        let expected_pairs = vec![
            (
                Particle::new(0.1, 0.1, 0.0, 0.0, 0.04),
                Particle::new(0.15, 0.15, 0.0, 0.0, 0.04),
            ),
            (
                Particle::new(0.1, 0.1, 0.0, 0.0, 0.04),
                Particle::new(0.25, 0.25, 0.0, 0.0, 0.04),
            ),
            (
                Particle::new(0.15, 0.15, 0.0, 0.0, 0.04),
                Particle::new(0.25, 0.25, 0.0, 0.0, 0.04),
            ),
        ];

        assert_eq!(pairs.len(), expected_pairs.len());
        let matching = get_matching_count(&pairs, &expected_pairs);
        assert!(matching == pairs.len() && matching == expected_pairs.len());
    }

    #[test]
    fn test_generate_pairs_for_particles_on_cell_border() {
        let particles = vec![
            Particle::new(0.5, 0.5, 0.0, 0.0, 0.04),   // Center
            Particle::new(0.25, 0.25, 0.0, 0.0, 0.04), // Bottom left quadrant
            Particle::new(0.25, 0.75, 0.0, 0.0, 0.04), // Top left quadrant
            Particle::new(0.75, 0.75, 0.0, 0.0, 0.04), // Top right quadrant
        ];
        let pairs = Particle::generate_pairs(particles);
        let expected_pairs = vec![
            (
                Particle::new(0.5, 0.5, 0.0, 0.0, 0.04),
                Particle::new(0.25, 0.25, 0.0, 0.0, 0.04),
            ),
            (
                Particle::new(0.5, 0.5, 0.0, 0.0, 0.04),
                Particle::new(0.25, 0.75, 0.0, 0.0, 0.04),
            ),
            (
                Particle::new(0.5, 0.5, 0.0, 0.0, 0.04),
                Particle::new(0.75, 0.75, 0.0, 0.0, 0.04),
            ),
        ];

        assert_eq!(pairs.len(), expected_pairs.len());
        let matching = get_matching_count(&pairs, &expected_pairs);
        assert!(matching == pairs.len() && matching == expected_pairs.len());
    }

    #[test]
    fn test_generate_pairs_performance() {
        panic!("");
    }
}
