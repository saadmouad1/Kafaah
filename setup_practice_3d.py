import os

project_dir = r"d:\professional_practice_exam\kafaah"
practice_dir = os.path.join(project_dir, 'src', 'app', 'dashboard', 'practice')
os.makedirs(practice_dir, exist_ok=True)

page_content = """'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { localDB } from '../../../lib/mockDb';
import { CheckCircle2, XCircle, ChevronRight, HelpCircle } from 'lucide-react';

export default function Practice() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const question = localDB.questions[currentIdx];

  const handleOptionClick = (idx) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    setTimeout(() => setFlipped(true), 1000);
  };

  const handleNext = () => {
    setFlipped(false);
    setSelectedOption(null);
    if (currentIdx < localDB.questions.length - 1) {
      setTimeout(() => setCurrentIdx(currentIdx + 1), 300);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', perspective: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--navy)' }}>التدريب الذكي 🧠</h1>
        <div style={{ background: 'var(--mint)', color: 'var(--blue)', padding: '0.5rem 1rem', borderRadius: '99px', fontWeight: 'bold' }}>
          سؤال {currentIdx + 1} من {localDB.questions.length}
        </div>
      </div>

      {/* 3D Flipping Card */}
      <motion.div 
        style={{ width: '100%', height: '500px', position: 'relative', transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 60, damping: 12 }}
      >
        {/* Front of Card (Question) */}
        <div style={{ 
          position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', 
          background: 'white', borderRadius: '24px', padding: '3rem', 
          boxShadow: 'var(--shadow-float)', border: '1px solid var(--line)',
          display: 'flex', flexDirection: 'column'
        }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--navy-deep)', marginBottom: '2rem', lineHeight: '1.6' }}>
            {question.text}
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
            {question.options.map((opt, idx) => (
              <motion.button 
                key={idx}
                whileHover={{ scale: selectedOption === null ? 1.02 : 1 }}
                whileTap={{ scale: selectedOption === null ? 0.98 : 1 }}
                onClick={() => handleOptionClick(idx)}
                style={{
                  padding: '1.2rem', textAlign: 'right', fontSize: '1.1rem', borderRadius: '16px',
                  background: selectedOption === idx ? 'var(--blue)' : 'var(--bg)',
                  color: selectedOption === idx ? 'white' : 'var(--text-main)',
                  border: `2px solid ${selectedOption === idx ? 'var(--blue)' : 'transparent'}`,
                  cursor: selectedOption === null ? 'pointer' : 'default',
                  transition: 'background 0.3s'
                }}
              >
                {opt}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Back of Card (Explanation) */}
        <div style={{ 
          position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', 
          background: 'linear-gradient(135deg, var(--navy-deep), var(--navy))', 
          borderRadius: '24px', padding: '3rem', color: 'white',
          boxShadow: 'var(--shadow-glow)',
          transform: 'rotateY(180deg)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center'
        }}>
          {selectedOption === question.correct_index ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }}>
              <CheckCircle2 size={80} color="#4ade80" style={{ marginBottom: '1rem' }} />
              <h2 style={{ color: '#4ade80', marginBottom: '1rem' }}>إجابة صحيحة!</h2>
            </motion.div>
          ) : (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }}>
              <XCircle size={80} color="#f87171" style={{ marginBottom: '1rem' }} />
              <h2 style={{ color: '#f87171', marginBottom: '1rem' }}>إجابة خاطئة</h2>
            </motion.div>
          )}
          
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '16px', marginTop: '1rem', backdropFilter: 'blur(10px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--cyan)' }}>
              <HelpCircle size={20} /> التفسير العلمي:
            </div>
            <p style={{ lineHeight: '1.8', fontSize: '1.1rem' }}>{question.explanation}</p>
          </div>

          <button onClick={handleNext} style={{ marginTop: 'auto', background: 'var(--blue)', color: 'white', padding: '1rem 3rem', borderRadius: '99px', border: 'none', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            السؤال التالي <ChevronRight size={20} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
"""
with open(os.path.join(practice_dir, 'page.js'), 'w', encoding='utf-8') as f:
    f.write(page_content)

print("3D Practice Page created.")
