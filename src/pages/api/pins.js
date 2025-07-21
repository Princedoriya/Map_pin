import mongoose from 'mongoose';
import Pin from '../../../models/Pin';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  return mongoose.connect(MONGODB_URI);
}

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method === 'GET') {
    try {
      const pins = await Pin.find({});
      console.log('GET /api/pins - fetched pins:', pins);
      res.status(200).json(pins);
    } catch (error) {
      console.error('GET /api/pins error:', error);
      res.status(500).json({ error: 'Failed to fetch pins' });
    }
  } else if (req.method === 'POST') {
    try {
      const { lat, lng, remark, address } = req.body;
      if (!lat || !lng) {
        res.status(400).json({ error: 'Missing lat or lng' });
        return;
      }
      const newPin = new Pin({
        lat,
        lng,
        remark: remark || '',
        address: address || '',
      });
      const savedPin = await newPin.save();
      console.log('POST /api/pins - saved pin:', savedPin);
      res.status(201).json(savedPin);
    } catch (error) {
      console.error('POST /api/pins error:', error);
      res.status(500).json({ error: 'Failed to save pin' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
