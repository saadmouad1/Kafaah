const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Read JSON data
    const sectorsPath = path.join(__dirname, '../src/data/sectors.json');
    const questionsPath = path.join(__dirname, '../src/data/questions.json');
    
    const sectorsRaw = JSON.parse(fs.readFileSync(sectorsPath, 'utf8'));
    const sectorsData = sectorsRaw.sectors || sectorsRaw;
    const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

    // 2. Clear existing data in correct order
    console.log('Clearing existing data...');
    await prisma.savedQuestion.deleteMany();
    await prisma.testResult.deleteMany();
    await prisma.question.deleteMany();
    await prisma.specialization.deleteMany();
    await prisma.sector.deleteMany();
    await prisma.user.deleteMany();

    // 3. Create Default Admin User
    console.log('Creating Admin user...');
    await prisma.user.create({
      data: {
        id: 'admin_user_001',
        name: 'Saad Admin',
        email: 'saadmouad2004@gmail.com',
        role: 'admin',
        subscription: 'premium'
      }
    });

    // 4. Seed Sectors and Specializations
    console.log(`Seeding ${sectorsData.length} sectors...`);
    for (const s of sectorsData) {
      await prisma.sector.create({
        data: {
          id: s.id,
          label: s.label,
          icon: s.icon,
          color: s.color,
          specializations: {
            create: s.specializations.map(spec => ({
              id: spec.id,
              label: spec.label,
              country: spec.country || 'Global'
            }))
          }
        }
      });
    }

    // 5. Seed Questions
    console.log(`Seeding ${questionsData.length} questions...`);
    // Batch inserts for questions to speed it up
    await prisma.question.createMany({
      data: questionsData.map(q => {
        let defaultSpec = 'medical_general';
        if (q.category === 'engineering') defaultSpec = 'eng_general';
        else if (q.category === 'law') defaultSpec = 'law_general';
        else if (q.category === 'finance') defaultSpec = 'fin_general';
        else if (q.category === 'education') defaultSpec = 'edu_general';
        
        return {
          id: q.id,
          sectorId: q.category || 'medical',
          specializationId: defaultSpec,
          text: q.text || 'سؤال بدون نص',
          options: q.options || [],
          correctIndex: q.correctIndex !== undefined ? q.correctIndex : (q.correct_index || 0),
          explanation: q.explanation || null,
          status: q.status || 'active'
        };
      }).filter(q => q.text && q.options.length > 0),
      skipDuplicates: true
    });

    console.log('✅ Seeding completed successfully!');
  } catch (e) {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
