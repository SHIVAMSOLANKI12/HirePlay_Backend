import applicationRoutes from "./routes/application.route.js";
import applicationNoteRoutes from "./routes/applicationNote.route.js";

const applicationModule = (app) => {
  app.use("/api/v1/applications", applicationRoutes);
  app.use("/api/v1/application-notes", applicationNoteRoutes);
};

export default applicationModule;
