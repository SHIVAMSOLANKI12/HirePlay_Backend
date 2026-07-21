export class ResumeExtractor {
  /**
   * Extract structured data from raw resume text
   * @param {string} text - Raw text from the resume parser
   * @returns {Object} Extracted data
   */
  extract(text) {
    if (!text || typeof text !== "string") {
      return {};
    }

    const normalizedText = text.replace(/\r\n/g, "\n");

    return {
      email: this.extractEmail(normalizedText),
      phone: this.extractPhone(normalizedText),
      skills: this.extractSkills(normalizedText),
      education: this.extractEducation(normalizedText),
      experience: this.extractExperience(normalizedText),
      projects: this.extractProjects(normalizedText),
      rawTextLength: normalizedText.length,
    };
  }

  extractEmail(text) {
    // Basic email regex
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const match = text.match(emailRegex);
    return match ? match[0] : null;
  }

  extractPhone(text) {
    // Basic phone regex (handles formats like +1-123-456-7890, (123) 456-7890, etc.)
    const phoneRegex = /(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?/i;
    // Another simpler fallback phone regex
    const simplePhoneRegex = /(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;
    
    let match = text.match(simplePhoneRegex);
    if (!match) match = text.match(phoneRegex);
    
    return match ? match[0].trim() : null;
  }

  extractSkills(text) {
    // In a real OCR/ML system, this would use NER.
    // Here we use a dictionary heuristic approach.
    const commonSkills = [
      "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Ruby", "Go", "Rust", "Swift", "Kotlin",
      "React", "Angular", "Vue", "Node.js", "Express", "Django", "Flask", "Spring", "Ruby on Rails",
      "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "ElasticSearch", "AWS", "Azure", "GCP",
      "Docker", "Kubernetes", "CI/CD", "Git", "Machine Learning", "Data Science", "HTML", "CSS", "Tailwind"
    ];

    const foundSkills = [];
    const lowerText = text.toLowerCase();

    for (const skill of commonSkills) {
      // Use word boundaries for accurate matching
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(lowerText)) {
        foundSkills.push(skill);
      }
    }

    return foundSkills;
  }

  extractEducation(text) {
    // Heuristic: Look for sections titled Education
    const educationRegex = /(?:Education|Academic Background)[\s\S]*?(?:Experience|Projects|Skills|Certifications|$)/i;
    const match = text.match(educationRegex);
    if (match) {
      // Return a snippet (trimmed to max 500 chars to avoid junk)
      const snippet = match[0].replace(/(?:Experience|Projects|Skills|Certifications)$/i, "").trim();
      return snippet.substring(0, 500) + (snippet.length > 500 ? "..." : "");
    }
    return null;
  }

  extractExperience(text) {
    // Heuristic: Look for sections titled Experience
    const experienceRegex = /(?:Experience|Work History|Employment)[\s\S]*?(?:Education|Projects|Skills|Certifications|$)/i;
    const match = text.match(experienceRegex);
    if (match) {
      const snippet = match[0].replace(/(?:Education|Projects|Skills|Certifications)$/i, "").trim();
      return snippet.substring(0, 1000) + (snippet.length > 1000 ? "..." : "");
    }
    return null;
  }

  extractProjects(text) {
    // Heuristic: Look for sections titled Projects
    const projectsRegex = /(?:Projects|Personal Projects)[\s\S]*?(?:Education|Experience|Skills|Certifications|$)/i;
    const match = text.match(projectsRegex);
    if (match) {
      const snippet = match[0].replace(/(?:Education|Experience|Skills|Certifications)$/i, "").trim();
      return snippet.substring(0, 500) + (snippet.length > 500 ? "..." : "");
    }
    return null;
  }
}
