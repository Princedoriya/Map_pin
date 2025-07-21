import mongoose from 'mongoose';

const PinSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  remark: { type: String, default: '' },
  address: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const Pin = mongoose.models.Pin || mongoose.model('Pin', PinSchema);

export default Pin;
