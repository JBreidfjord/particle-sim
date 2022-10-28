use crate::app::App;
use crate::particle::Particle;
use std::time::SystemTime;

mod app;
mod particle;

fn main() {
    // generate_pairs_performance();

    let native_options = eframe::NativeOptions {
        initial_window_size: Some(egui::Vec2::new(800.0, 800.0)),
        ..Default::default()
    };
    eframe::run_native(
        "eframe template",
        native_options,
        Box::new(|cc| Box::new(App::new(cc))),
    );
}

fn generate_pairs_performance() {
    let num_particles = 100_000;
    let particles = Particle::generate_particles(num_particles, 0.0002);
    let start = SystemTime::now();
    let _pairs = Particle::generate_pairs(&particles);
    let end = SystemTime::now();
    let duration = end.duration_since(start).unwrap();
    println!("Time taken for {} particles: {:?}", num_particles, duration);
}
