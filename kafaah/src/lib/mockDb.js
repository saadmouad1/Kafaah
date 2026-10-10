import questionsData from '../data/questions.json';

export const localDB = {
  currentUser: {
    name: "الطالب المتميز",
    role: "student",
    subscription: "مجاني (انطلاق)",
    stats: {
      medical: { total: 100, correct: 80 },
      engineering: { total: 0, correct: 0 },
    }
  },
  questions: questionsData
};
