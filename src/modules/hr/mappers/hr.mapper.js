class HRMapper {
  static toCreateData(payload, companyId, hashedPassword) {
    return {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      designation: payload.designation,
      password: hashedPassword,
      companyId: companyId,
    };
  }
}

export default HRMapper;
