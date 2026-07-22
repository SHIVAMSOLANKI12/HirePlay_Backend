import { QuestionBankMapper } from "./questionBank.mapper.js";

export class InterviewTemplateMapper {
  static toDto(template) {
    if (!template) return null;

    return {
      id: template.id,
      companyId: template.companyId,
      createdById: template.createdById,
      creatorName: template.createdBy ? template.createdBy.name : null,
      title: template.title,
      description: template.description,
      status: template.status,
      isDefault: template.isDefault,
      rounds: template.rounds ? template.rounds.map(r => InterviewTemplateMapper.toRoundDto(r)) : [],
      criteria: template.criteria ? template.criteria.map(c => InterviewTemplateMapper.toCriteriaDto(c)) : [],
      questions: template.templateQuestions 
        ? template.templateQuestions.map(tq => QuestionBankMapper.toDto(tq.question))
        : [],
      createdAt: template.createdAt,
      updatedAt: template.updatedAt
    };
  }

  static toRoundDto(round) {
    if (!round) return null;
    return {
      id: round.id,
      roundName: round.roundName,
      roundType: round.roundType,
      sequence: round.sequence,
      expectedDurationMinutes: round.expectedDurationMinutes,
      questionCount: round.questionCount,
      passingScore: round.passingScore
    };
  }

  static toCriteriaDto(criteria) {
    if (!criteria) return null;
    return {
      id: criteria.id,
      name: criteria.name,
      description: criteria.description,
      weight: criteria.weight,
      maxScore: criteria.maxScore
    };
  }
}
