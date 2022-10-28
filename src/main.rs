use crate::particle::Particle;
use std::time::SystemTime;

mod particle;

fn main() {
    generate_pairs_performance();
}

fn generate_pairs_performance() {
    let num_particles = 100_000;
    let particles = Particle::generate_particles(num_particles, 0.0002);
    let start = SystemTime::now();
    let _pairs = Particle::generate_pairs(particles);
    let end = SystemTime::now();
    let duration = end.duration_since(start).unwrap();
    println!("Time taken for {} particles: {:?}", num_particles, duration);
}
