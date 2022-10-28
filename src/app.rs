use crate::particle::Particle;
use egui::NumExt;

pub struct App {
    particles: Vec<Particle>,
    particle_radius: f32,
    time: f32,
}

impl Default for App {
    fn default() -> Self {
        let particle_radius = 0.02;
        Self {
            particles: Particle::generate_particles(10, particle_radius),
            particle_radius,
            time: 0.0,
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
            let dt = ui.input().unstable_dt.at_most(1.0 / 30.0);
            update_and_draw_particles(ui, &mut self.particles, 1.0 / 120.0, self.particle_radius);
            self.time += dt;
            ui.ctx().request_repaint();
        });
    }
}

fn update_and_draw_particles(ui: &mut egui::Ui, particles: &mut [Particle], dt: f32, r: f32) {
    particles.iter_mut().for_each(|p| {
        p.update(dt);
        ui.painter().circle_filled(
            egui::Pos2::new(p.x * 800.0, p.y * 800.0),
            r * 800.0,
            egui::Color32::RED,
        );
    });
}
