/**
 * Mapper for Company Module
 * Transforms incoming request payloads into database-ready objects.
 */
class CompanyMapper {
  /**
   * Maps validated request data into a database-ready object for creation.
   * Only allows whitelisted fields.
   *
   * @param {Object} payload - The validated request payload
   * @param {string} slug - The generated unique slug
   * @param {string} ownerId - The ID of the owner
   * @returns {Object} Database-ready object
   */
  static toCreateData(payload, slug, ownerId) {
    return {
      name: payload.name,
      slug,
      email: payload.email,
      phone: payload.phone,
      website: payload.website,
      industry: payload.industry,
      companySize: payload.companySize,
      logo: payload.logo,
      description: payload.description,
      ownerId,
    };
  }

  /**
   * Maps validated request data into a database-ready object for updates.
   * Only returns allowed update fields and ignores everything else.
   *
   * @param {Object} payload - The validated request payload
   * @returns {Object} Database-ready object for update
   */
  static toUpdateData(payload) {
    const data = {};

    if (payload.name !== undefined) data.name = payload.name;
    if (payload.email !== undefined) data.email = payload.email;
    if (payload.phone !== undefined) data.phone = payload.phone;
    if (payload.website !== undefined) data.website = payload.website;
    if (payload.industry !== undefined) data.industry = payload.industry;
    if (payload.companySize !== undefined) data.companySize = payload.companySize;
    if (payload.logo !== undefined) data.logo = payload.logo;
    if (payload.description !== undefined) data.description = payload.description;

    return data;
  }
}

export default CompanyMapper;
