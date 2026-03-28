import { PrismaClient } from '@prisma/client';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

/**
 * Seed data from quiz.json to database
 * Run with: npm run db:seed
 */
async function seed() {
  console.log('Starting seed process...\n');

  // Load quiz data from frontend
  const quizJsonPath = resolve(__dirname, '../../quiz-client/public/quiz.json');

  let quizData;
  if (!existsSync(quizJsonPath)) {
    console.warn('quiz.json not found in quiz-client/public/, skipping quiz data seed');
    quizData = [];
  } else {
    const rawData = readFileSync(quizJsonPath, 'utf-8');
    quizData = JSON.parse(rawData);
  }

  // 1. Create default category for web development quizzes
  console.log('Creating default categories...');
  const category = await prisma.category.upsert({
    where: { id: 'cat-web-development' },
    update: {},
    create: {
      id: 'cat-web-development',
      name: 'Web Development',
      description: 'Test your knowledge of web development fundamentals including HTML, CSS, JavaScript, and modern frameworks.',
      icon: 'code',
      isActive: true,
      order: 1,
    },
  });
  console.log(`  - Category "${category.name}" created/verified\n`);

  // 2. Create admin user (placeholder - replace with actual Clerk ID)
  console.log('Creating admin user...');
  const adminUser = await prisma.user.upsert({
    where: { clerkId: 'admin-placeholder' },
    update: {},
    create: {
      clerkId: 'admin-placeholder',
      email: 'admin@quizguard.local',
      username: 'admin',
      role: 'ADMIN',
    },
  });
  console.log(`  - Admin user "${adminUser.username}" created/verified\n`);

  // 3. Create quiz
  console.log('Creating quiz...');
  const quiz = await prisma.quiz.upsert({
    where: { id: 'quiz-web-fundamentals' },
    update: {},
    create: {
      id: 'quiz-web-fundamentals',
      title: 'Web Development Fundamentals',
      description: 'Test your knowledge of essential web development concepts including HTML, CSS, JavaScript frameworks, and modern web technologies.',
      categoryId: category.id,
      timer: 600, // 10 minutes
      difficulty: 'MEDIUM',
      isPublished: true,
      createdBy: adminUser.id,
    },
  });
  console.log(`  - Quiz "${quiz.title}" created/verified\n`);

  // 4. Create questions and answer options
  if (quizData.length > 0) {
    console.log(`Creating ${quizData.length} questions...`);

    for (const [index, item] of quizData.entries()) {
      // Find correct option index
      const correctIndex = item.options.findIndex((opt) => opt === item.answer);
      const order = index + 1;

      // Create question
      const question = await prisma.question.upsert({
        where: { id: `q-web-fund-${order}` },
        update: {
          text: item.question,
          order,
        },
        create: {
          id: `q-web-fund-${order}`,
          quizId: quiz.id,
          text: item.question,
          order,
        },
      });

      // Create answer options
      for (const [optIndex, optionText] of item.options.entries()) {
        await prisma.answerOption.upsert({
          where: { id: `opt-${question.id}-${optIndex + 1}` },
          update: {
            text: optionText,
            isCorrect: optIndex === correctIndex,
            order: optIndex,
          },
          create: {
            id: `opt-${question.id}-${optIndex + 1}`,
            questionId: question.id,
            text: optionText,
            isCorrect: optIndex === correctIndex,
            order: optIndex,
          },
        });
      }

      console.log(`  - Question ${order}: "${item.question.substring(0, 50)}..."`);
    }
    console.log('');
  }

  // 5. Create additional sample categories
  console.log('Creating additional sample categories...');
  const additionalCategories = [
    {
      name: 'JavaScript',
      description: 'Questions about JavaScript programming language, ES6+, and Node.js',
      icon: 'node-js',
      order: 2,
    },
    {
      name: 'React',
      description: 'Test your React knowledge including hooks, components, and best practices',
      icon: 'atom',
      order: 3,
    },
    {
      name: 'CSS',
      description: 'CSS styling, flexbox, grid, animations, and responsive design',
      icon: 'palette',
      order: 4,
    },
  ];

  for (const catData of additionalCategories) {
    const existingCat = await prisma.category.findFirst({
      where: { name: catData.name },
    });

    if (!existingCat) {
      await prisma.category.create({
        data: {
          ...catData,
          isActive: true,
        },
      });
      console.log(`  - Category "${catData.name}" created`);
    } else {
      console.log(`  - Category "${catData.name}" already exists, skipping`);
    }
  }

  console.log('\nSeed completed successfully!');
  console.log(`
Summary:
  - 1 Web Development category created/verified
  - 1 Admin user created (note: update clerkId with real value)
  - 1 Quiz "Web Development Fundamentals" created
  - ${quizData.length} questions migrated from quiz.json
  - ${additionalCategories.length} additional categories created

Next steps:
  1. Update admin user's clerkId with your Clerk user ID
  2. Run 'npm run db:push' to sync schema with database
  3. Start server with 'npm run dev'
  `);
}

// Run seed
seed()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
