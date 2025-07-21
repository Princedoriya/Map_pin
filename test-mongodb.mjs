import clientPromise from './lib/mongodb.js';

async function testDb() {
  try {
    const client = await clientPromise;
    const db = client.db('my-app-db');
    const pins = await db.collection('pins').find({}).toArray();
    console.log('Pins in DB:', pins);
    await client.close();
  } catch (error) {
    console.error('DB test error:', error);
  }
}

testDb();
