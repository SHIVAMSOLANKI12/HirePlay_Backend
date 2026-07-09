import storageService from "../../../shared/storage/index.js";

class CompanyDTO {
  static toResponse(company) {
    if (!company) return null;

    return {
      id: company.id,
      name: company.name,
      slug: company.slug,
      email: company.email,
      phone: company.phone,
      website: company.website,
      industry: company.industry,
      companySize: company.companySize,
      logo: company.logo ? storageService.getPublicUrl(company.logo) : null,
      description: company.description,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };
  }

  static toSettingsResponse(company) {
    if (!company) return null;

    return {
      timezone: company.timezone,
      language: company.language,
      currency: company.currency,
      dateFormat: company.dateFormat,
      timeFormat: company.timeFormat,
      emailNotifications: company.emailNotifications,
      smsNotifications: company.smsNotifications,
      careerPagePublic: company.careerPagePublic,
      defaultHiringStage: company.defaultHiringStage,
    };
  }
}

export default CompanyDTO;