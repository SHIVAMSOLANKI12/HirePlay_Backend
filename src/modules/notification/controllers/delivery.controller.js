import { executeGetDeliveryStatus } from "../workflows/getDeliveryStatus.workflow.js";

export const getDeliveryStatus = async (req, res, next) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;
    // Assuming companyId is either in req.user or req.query/req.body based on your setup.
    // Let's use req.user.companyId if available, or we might just fetch without it if it's admin.
    // For safety, let's pass req.user.companyId
    const companyId = req.user.companyId;

    const deliveryStatus = await executeGetDeliveryStatus(notificationId, userId, companyId);
    
    res.status(200).json({
      success: true,
      message: "Delivery status fetched successfully",
      data: deliveryStatus
    });
  } catch (error) {
    next(error);
  }
};
