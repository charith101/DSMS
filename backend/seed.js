const mongoose = require('mongoose');
const MockQuestion = require('./models/MockQuestion'); // Adjust path to your MockQuestion model

const mongoURI = 'mongodb+srv://admin:xXZWFcwvTQjrqdJv@cluster0.sjyibwg.mongodb.net/ITP'; // Replace with your MongoDB URI

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Clear existing data in MockQuestion collection
    await MockQuestion.deleteMany({});
    console.log('Existing MockQuestion data cleared');

    // Insert MockQuestions (3 per level: Beginner, Intermediate, Expert)
    const mockQuestions = [
      // Beginner Level
      {
        question: 'What does a red traffic light indicate?',
        options: ['Stop', 'Go', 'Slow down', 'Turn'],
        correctAnswer: 'Stop',
        level: 'Beginner',
      },
      {
        question: 'What is the purpose of a seatbelt?',
        options: ['To enhance comfort', 'To protect in a crash', 'To adjust seat position', 'To hold luggage'],
        correctAnswer: 'To protect in a crash',
        level: 'Beginner',
      },
      {
        question: 'What should you do at a yield sign?',
        options: ['Stop completely', 'Give way to other traffic', 'Speed up', 'Ignore it'],
        correctAnswer: 'Give way to other traffic',
        level: 'Beginner',
      },
      // Intermediate Level
      {
        question: 'When should you use your turn signal?',
        options: ['Only at night', 'When changing lanes or turning', 'Only when parking', 'Never'],
        correctAnswer: 'When changing lanes or turning',
        level: 'Intermediate',
      },
      {
        question: 'What is the correct hand position on the steering wheel?',
        options: ['12 and 6 o’clock', '10 and 2 o’clock', '8 and 4 o’clock', 'One hand only'],
        correctAnswer: '8 and 4 o’clock',
        level: 'Intermediate',
      },
      {
        question: 'What does a solid white line on the road mean?',
        options: ['Passing is allowed', 'No passing', 'Parking zone', 'Bicycle lane'],
        correctAnswer: 'No passing',
        level: 'Intermediate',
      },
      // Expert Level
      {
        question: 'What should you do if your vehicle starts to skid on a wet road?',
        options: [
          'Slam on the brakes',
          'Steer in the direction of the skid',
          'Accelerate quickly',
          'Turn off the engine',
        ],
        correctAnswer: 'Steer in the direction of the skid',
        level: 'Expert',
      },
      {
        question: 'What is the minimum following distance on a highway at 60 mph?',
        options: ['1 second', '2 seconds', '3 seconds', '5 seconds'],
        correctAnswer: '3 seconds',
        level: 'Expert',
      },
      {
        question: 'When merging onto a highway, you should:',
        options: [
          'Stop and wait for a gap',
          'Match the speed of traffic and merge smoothly',
          'Signal after merging',
          'Use the shoulder',
        ],
        correctAnswer: 'Match the speed of traffic and merge smoothly',
        level: 'Expert',
      },
    ];
    await MockQuestion.insertMany(mockQuestions);
    console.log('MockQuestions inserted');

    console.log('Database seeding complete!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
  }
}

seedDatabase();