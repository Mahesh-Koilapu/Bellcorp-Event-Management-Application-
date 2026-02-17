
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Event = require('./models/Event');
const Registration = require('./models/Registration');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Event.deleteMany({});
    await Registration.deleteMany({});
    console.log('Cleared existing data');

    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@bellcorp.com',
      password: hashedPassword,
      role: 'admin'
    });

    const organizer = await User.create({
      name: 'John Organizer',
      email: 'organizer@bellcorp.com',
      password: hashedPassword,
      role: 'organizer'
    });

    const user1 = await User.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: hashedPassword,
      role: 'user'
    });

    const user2 = await User.create({
      name: 'Bob Smith',
      email: 'bob@example.com',
      password: hashedPassword,
      role: 'user'
    });

    console.log('Created users:', { admin, organizer, user1, user2 });

    const events = await Event.insertMany([
      {
        title: 'Tech Conference 2024',
        description: 'Annual technology conference featuring the latest innovations in AI, cloud computing, and software development. Join industry leaders and experts for three days of learning and networking.',
        date: new Date('2024-06-15'),
        time: '09:00 AM',
        location: 'San Francisco',
        venue: 'Moscone Convention Center',
        category: 'conference',
        capacity: 500,
        organizer: organizer._id,
        price: 199,
        isPublished: true,
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'
      },
      {
        title: 'Web Development Workshop',
        description: 'Hands-on workshop covering modern web development technologies including React, Node.js, and cloud deployment.',
        date: new Date('2024-06-20'),
        time: '10:00 AM',
        location: 'Online',
        venue: 'Virtual Event',
        category: 'workshop',
        capacity: 100,
        organizer: organizer._id,
        price: 49,
        isPublished: true,
        image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80'
      },
      {
        title: 'Startup Meetup',
        description: 'Network with fellow entrepreneurs, investors, and startup enthusiasts. Great opportunity to find co-founders and pitch your ideas.',
        date: new Date('2024-07-01'),
        time: '06:00 PM',
        location: 'New York',
        venue: 'WeWork Times Square',
        category: 'meetup',
        capacity: 200,
        organizer: organizer._id,
        price: 0,
        isPublished: true,
        image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80'
      },
      {
        title: 'Digital Marketing Seminar',
        description: 'Learn the latest digital marketing strategies including SEO, social media marketing, and content marketing from industry experts.',
        date: new Date('2024-07-10'),
        time: '02:00 PM',
        location: 'Chicago',
        venue: 'Innovation Center',
        category: 'seminar',
        capacity: 150,
        organizer: organizer._id,
        price: 79,
        isPublished: true,
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80'
      },
      {
        title: 'Music Festival',
        description: 'Annual outdoor music festival featuring top artists from various genres. Food, drinks, and entertainment for the whole family.',
        date: new Date('2024-07-20'),
        time: '12:00 PM',
        location: 'Los Angeles',
        venue: 'Hollywood Bowl',
        category: 'concert',
        capacity: 1000,
        organizer: organizer._id,
        price: 150,
        isPublished: true,
        image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80'
      },
      {
        title: 'Art Exhibition',
        description: 'Contemporary art exhibition featuring works from emerging artists around the world.',
        date: new Date('2024-08-05'),
        time: '10:00 AM',
        location: 'New York',
        venue: 'Modern Art Gallery',
        category: 'exhibition',
        capacity: 300,
        organizer: organizer._id,
        price: 25,
        isPublished: true,
        image: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800&q=80'
      }
    ]);

    console.log('Created events:', events.length);

    await Registration.insertMany([
      {
        user: user1._id,
        event: events[0]._id,
        status: 'confirmed'
      },
      {
        user: user2._id,
        event: events[0]._id,
        status: 'confirmed'
      },
      {
        user: user1._id,
        event: events[2]._id,
        status: 'confirmed'
      }
    ]);

    events[0].registeredCount = 2;
    events[2].registeredCount = 1;
    await events[0].save();
    await events[2].save();

    console.log('Created registrations');

    console.log('\n Seed data created successfully!');
    console.log('\nTest Accounts:');
    console.log('Admin: admin@bellcorp.com / password123');
    console.log('Organizer: organizer@bellcorp.com / password123');
    console.log('User: jane@example.com / password123');
    console.log('User: bob@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
