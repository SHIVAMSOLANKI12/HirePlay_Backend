export const toHRProfileDTO = (hr) => {
  return {
    id: hr.id,
    name: `${hr.firstName} ${hr.lastName}`.trim(),
    email: hr.email,
    role: hr.role,
    companyId: hr.companyId,
    phone: hr.phone,
    designation: hr.designation,
    status: hr.status,
    isActive: hr.isActive,
    avatar: hr.avatar,
    lastLoginAt: hr.lastLoginAt,
    createdAt: hr.createdAt,
    updatedAt: hr.updatedAt,
  };
};

export const toLoginResponseDTO = (hr, accessToken, refreshToken) => {
  return {
    accessToken,
    refreshToken,
    expiresIn: 900,
    user: {
      id: hr.id,
      name: `${hr.firstName} ${hr.lastName}`.trim(),
      email: hr.email,
      role: hr.role,
      companyId: hr.companyId,
    },
  };
};

export const toRefreshTokenResponseDTO = (accessToken, refreshToken) => {
  return {
    accessToken,
    refreshToken,
    expiresIn: 900,
  };
};
