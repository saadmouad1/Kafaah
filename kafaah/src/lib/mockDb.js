
import questionsData from '../data/questions.json';
import sectorsData from '../data/sectors.json';

export const localDB = {
  // No fake user — user will be authenticated via Supabase Auth in production
  currentUser: null,

  questions: questionsData,
  sectors: sectorsData.sectors,

  // Helper: get questions for a specific sector
  getQuestionsBySector(sectorId) {
    return questionsData.filter(q => q.category === sectorId || q.sector === sectorId);
  },

  // Helper: get questions for a specific specialization
  getQuestionsBySpec(specId) {
    return questionsData.filter(q => q.specialty === specId || q.specialization === specId);
  },

  // Summary stats
  stats: {
    totalQuestions: questionsData.length,
    totalSectors: sectorsData.sectors.length,
    totalSpecializations: sectorsData.sectors.reduce((s, c) => s + c.specializations.length, 0),
  }
};
