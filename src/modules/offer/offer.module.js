import offerRoutes from "./routes/offer.route.js";
import candidateOfferRoutes from "./routes/candidateOffer.route.js";

const offerModule = (app) => {
  app.use("/api/v1/offers", offerRoutes);
  app.use("/api/v1/candidate/offers", candidateOfferRoutes);
};

export default offerModule;
