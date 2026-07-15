import offerRoutes from "./routes/offer.route.js";

const offerModule = (app) => {
  app.use("/api/v1/offers", offerRoutes);
};

export default offerModule;
