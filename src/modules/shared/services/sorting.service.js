export const getSortingOptions = (sortBy, sortOrder, allowedFields = [], defaultField = "createdAt") => {
  const order = ["asc", "desc"].includes(sortOrder?.toLowerCase()) ? sortOrder.toLowerCase() : "desc";
  const field = allowedFields.includes(sortBy) ? sortBy : defaultField;
  
  return {
    [field]: order
  };
};
