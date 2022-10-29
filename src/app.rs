use crate::particle::Particle;
use egui::NumExt;

pub struct App {
    particles: Vec<Particle>,
    particle_radius: f32,
    time: f32,
    size: f32,
}

impl Default for App {
    fn default() -> Self {
        let box_size = 400.0;
        Self {
            particles: Particle::generate_particles(10, 10.0, box_size),
            particle_radius: 10.0,
            time: 0.0,
            size: box_size,
        }
    }
}

impl App {
    pub fn new(cc: &eframe::CreationContext<'_>) -> Self {
        // Customize the look and feel of the app
        // e.g.
        // cc.egui_ctx.set_visuals(egui::Visuals::dark());
        // cc.egui_ctx.set_fonts(egui::FontDefinitions::default());

        Default::default()
    }
}

impl eframe::App for App {
    fn update(&mut self, ctx: &egui::Context, _frame: &mut eframe::Frame) {
        egui::CentralPanel::default().show(ctx, |ui| {
            let dt = ui.input().unstable_dt.at_most(1.0 / 120.0);
            self.particles = Particle::update_particles(&mut self.particles, dt, self.size);

            self.particles.iter().for_each(|p| {
                ui.painter().circle_filled(
                    egui::Pos2::new(p.x, p.y),
                    self.particle_radius,
                    egui::Color32::RED,
                );
                ui.painter().text(
                    egui::Pos2::new(p.x, p.y),
                    egui::Align2::CENTER_CENTER,
                    format!("{:.2}, {:.2}", p.x, p.y),
                    egui::FontId::default(),
                    egui::Color32::WHITE,
                );
            });

            self.time += dt;
            ui.ctx().request_repaint();
        });
    }
}
