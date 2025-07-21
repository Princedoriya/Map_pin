import { connectToDatabase } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  const { db } = await connectToDatabase();

  switch (method) {
    case 'DELETE':
      try {
        const result = await db.collection('pins').deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 1) {
          res.status(200).json({ message: 'Pin deleted successfully' });
        } else {
          res.status(404).json({ message: 'Pin not found' });
        }
      } catch (error) {
        res.status(500).json({ message: 'Error deleting pin', error: error.message });
      }
      break;
    default:
      res.setHeader('Allow', ['DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
