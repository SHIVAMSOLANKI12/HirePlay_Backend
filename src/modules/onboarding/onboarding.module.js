import onboardingRoutes from "./routes/onboarding.route.js";
import employeeRoutes from "./routes/employee.route.js";

const onboardingModule = (app) => {
  app.use("/api/v1/onboarding", onboardingRoutes);
  app.use("/api/v1/employees", employeeRoutes);
};

export default onboardingModule;
