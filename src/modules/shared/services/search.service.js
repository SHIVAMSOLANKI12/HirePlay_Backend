export const buildSearchCondition = (searchQuery, searchFields) => {
  if (!searchQuery || !searchFields || searchFields.length === 0) {
    return undefined;
  }

  return {
    OR: searchFields.map((field) => {
      const keys = field.split('.');
      let condition = { contains: searchQuery, mode: "insensitive" };
      for (let i = keys.length - 1; i >= 0; i--) {
        condition = { [keys[i]]: condition };
      }
      return condition;
    }),
  };
};
