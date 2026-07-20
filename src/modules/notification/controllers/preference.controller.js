export const getPreferences = async (req, res, next) => {
  try {
    const { getPreferencesWorkflow } = await import("../workflows/getPreferences.workflow.js");
    const preferences = await getPreferencesWorkflow(req.user);
    
    res.status(200).json({
      success: true,
      data: preferences
    });
  } catch (error) {
    next(error);
  }
};

export const updatePreferences = async (req, res, next) => {
  try {
    const { updatePreferencesWorkflow } = await import("../workflows/updatePreferences.workflow.js");
    const preferences = await updatePreferencesWorkflow(req.user, req.body);
    
    res.status(200).json({
      success: true,
      message: "Notification preferences updated successfully",
      data: preferences
    });
  } catch (error) {
    next(error);
  }
};
