use crate::*;
use std::f64::consts::PI;

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Particle {
    crate x: f64,
    crate y: f64,
    crate vx: f64,
    crate vy: f64,
    crate radius: f64,
    crate mass: f64,
    crate momemtum_transferred: f64,
}

impl Particle {
    pub fn random(rng: &mut dyn RngCore, radius: f64) -> Particle {
        let x = rng.gen::<f64>().min(1.0 - radius * 1.5).max(radius * 1.5);
        let y = rng.gen::<f64>().min(1.0 - radius * 1.5).max(radius * 1.5);
        let vx = rng.gen_range(-1.0..1.0);
        let vy = rng.gen_range(-1.0..1.0);
        let mass = PI * radius.powi(2);
        let momemtum_transferred = 0.0;
        Particle {
            x,
            y,
            vx,
            vy,
            radius,
            mass,
            momemtum_transferred,
        }
    }

    fn new(x: f64, y: f64, vx: f64, vy: f64, radius: f64) -> Particle {
        let mass = PI * radius.powi(2);
        let momemtum_transferred = 0.0;
        Particle {
            x,
            y,
            vx,
            vy,
            radius,
            mass,
            momemtum_transferred,
        }
    }

    pub fn generate_particles(num_particles: usize, radius: f64) -> Vec<Particle> {
        let mut rng = rand::thread_rng();
        (0..num_particles)
            .map(|_| Particle::random(&mut rng, radius))
            .collect()
    }

    pub fn generate_pairs(particles: Vec<Particle>) -> Vec<(Particle, Particle)> {
        // Uniform Grid Partition
        // Create a grid of particles
        let mut grid = Vec::new();
        let grid_size = (particles.len() as f64).sqrt().ceil() as usize;
        let grid_width = 1.0 / grid_size as f64;

        // Check for particles within each grid cell
        // If a particle is on the border between cells, it is added to both cells
        for i in 0..grid_size {
            for j in 0..grid_size {
                let x = i as f64 * grid_width;
                let y = j as f64 * grid_width;
                let mut particles_in_cell: Vec<Particle> = Vec::new();
                for particle in particles.iter() {
                    if particle.x + particle.radius >= x
                        && particle.x - particle.radius <= x + grid_width
                        && particle.y + particle.radius >= y
                        && particle.y - particle.radius <= y + grid_width
                    {
                        particles_in_cell.push(particle.clone());
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
        for particles_in_cell in filtered_grid.into_iter() {
            for i in 0..particles_in_cell.len() {
                for j in i + 1..particles_in_cell.len() {
                    pairs.push((particles_in_cell[i].clone(), particles_in_cell[j].clone()));
                }
            }
        }

        pairs
    }

    pub fn handle_particle_collisions(mut particle_pairs: Vec<(Particle, Particle)>) {
        for (particle_a, particle_b) in particle_pairs.iter_mut() {
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
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn get_matching_count(a: &Vec<(Particle, Particle)>, b: &Vec<(Particle, Particle)>) -> usize {
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
}