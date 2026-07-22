export class QuestionBankMapper {
  static toDto(question) {
    if (!question) return null;

    return {
      id: question.id,
      companyId: question.companyId,
      categoryId: question.categoryId,
      categoryName: question.category ? question.category.name : null,
      title: question.title,
      questionText: question.questionText,
      type: question.type,
      difficulty: question.difficulty,
      sampleAnswer: question.sampleAnswer,
      scoringRubric: question.scoringRubric,
      tags: question.tags || [],
      createdAt: question.createdAt,
      updatedAt: question.updatedAt
    };
  }
}
