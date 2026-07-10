class JobMapper {
  static toCreateData(payload, companyId, createdBy) {
    return {
      ...payload,
      companyId,
      createdBy,
      status: "DRAFT",
    };
  }
}

export default JobMapper;
