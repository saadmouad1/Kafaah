import os

project_dir = r"d:\professional_practice_exam\kafaah"
lib_dir = os.path.join(project_dir, 'src', 'lib')
os.makedirs(lib_dir, exist_ok=True)

# 1. Local Mock Database
mock_db = """
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
  questions: [
    {
      id: 1,
      category: "medical",
      text: "أي من التالي يعتبر المؤشر الأهم لارتفاع ضغط الدم؟",
      options: ["الصداع المستمر", "قراءة الضغط فوق 140/90", "الدوخة", "نزيف الأنف"],
      correct_index: 1,
      explanation: "قراءة الضغط المستمرة فوق 140/90 ملم زئبقي تعتبر المعيار الطبي لتشخيص ارتفاع ضغط الدم."
    },
    {
      id: 2,
      category: "engineering",
      text: "في الهندسة المدنية، ما هو الغرض الرئيسي من حديد التسليح في الخرسانة؟",
      options: ["مقاومة قوى الضغط", "إعطاء لون للخرسانة", "مقاومة قوى الشد", "تقليل وزن المبنى"],
      correct_index: 2,
      explanation: "الخرسانة قوية في مقاومة الضغط لكنها ضعيفة في مقاومة الشد، لذلك يستخدم الحديد لمقاومة الشد."
    }
  ]
};
"""
with open(os.path.join(lib_dir, 'mockDb.js'), 'w', encoding='utf-8') as f:
    f.write(mock_db)

print("Mock database created.")
