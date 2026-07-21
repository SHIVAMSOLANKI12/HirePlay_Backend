import { ResumeScoringProvider } from "./ResumeScoringProvider.interface.js";

export class RuleBasedResumeScoringProvider extends ResumeScoringProvider {
  constructor() {
    super();
    this.providerName = "RuleBased";
    this.version = "1.0.0";
    
    // Configurable weights for a general "Resume Completeness/Quality" score
    this.weights = {
      skills: 25,       // Max 25 points if they have a good number of skills
      experience: 30,   // Max 30 points if they have detailed experience
      education: 20,    // Max 20 points for education presence
      projects: 15,     // Max 15 points for projects
      contactInfo: 10   // Max 10 points for having email + phone
    };
  }

  async score(parsedData, jobCriteria = null) {
    if (!parsedData) {
      return this._generateEmptyScore();
    }

    const breakdown = {
      skillsScore: this._scoreSkills(parsedData.skills),
      experienceScore: this._scoreExperience(parsedData.experience),
      educationScore: this._scoreEducation(parsedData.education),
      projectsScore: this._scoreProjects(parsedData.projects),
      contactInfoScore: this._scoreContactInfo(parsedData.email, parsedData.phone)
    };

    const totalScore = Math.min(
      100, 
      Math.round(
        breakdown.skillsScore + 
        breakdown.experienceScore + 
        breakdown.educationScore + 
        breakdown.projectsScore + 
        breakdown.contactInfoScore
      )
    );

    return {
      score: totalScore,
      breakdown,
      version: this.version,
      providerName: this.providerName
    };
  }

  _scoreSkills(skills) {
    if (!skills || !Array.isArray(skills) || skills.length === 0) return 0;
    // 5+ skills give max points, otherwise proportional
    const factor = Math.min(skills.length / 5, 1);
    return factor * this.weights.skills;
  }

  _scoreExperience(experience) {
    if (!experience) return 0;
    
    // In many parsing tools, experience could be an array of objects or a long string
    if (Array.isArray(experience)) {
      if (experience.length === 0) return 0;
      // 2+ roles give max points
      return Math.min(experience.length / 2, 1) * this.weights.experience;
    } else if (typeof experience === "string") {
      // Just check if it has substantial text (e.g. > 100 characters)
      return experience.length > 100 ? this.weights.experience : (experience.length / 100) * this.weights.experience;
    }
    
    return 0;
  }

  _scoreEducation(education) {
    if (!education) return 0;
    if (Array.isArray(education) && education.length > 0) return this.weights.education;
    if (typeof education === "string" && education.length > 20) return this.weights.education;
    return 0;
  }

  _scoreProjects(projects) {
    if (!projects) return 0;
    if (Array.isArray(projects) && projects.length > 0) return this.weights.projects;
    if (typeof projects === "string" && projects.length > 50) return this.weights.projects;
    return 0;
  }

  _scoreContactInfo(email, phone) {
    let score = 0;
    if (email) score += (this.weights.contactInfo / 2);
    if (phone) score += (this.weights.contactInfo / 2);
    return score;
  }

  _generateEmptyScore() {
    return {
      score: 0,
      breakdown: {
        skillsScore: 0,
        experienceScore: 0,
        educationScore: 0,
        projectsScore: 0,
        contactInfoScore: 0
      },
      version: this.version,
      providerName: this.providerName
    };
  }
}
