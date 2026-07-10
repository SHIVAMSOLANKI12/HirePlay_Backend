class HRDTO {
  static toResponse(hr) {
    if (!hr) return null;

    return {
      id: hr.id,
      firstName: hr.firstName,
      lastName: hr.lastName,
      email: hr.email,
      phone: hr.phone,
      designation: hr.designation,
      role: hr.role,
      status: hr.status,
      avatar: hr.avatar,
      createdAt: hr.createdAt,
    };
  }
}

export default HRDTO;
