const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;


const tourSchema = new Schema({
  date: {
    type: Date,
    required: true,
  },
  users: [{
    owner: { type: ObjectId, ref: 'User' },
    numberPeople: { type: Number },
  }],
  places: [{ type: ObjectId, ref: 'Place' }],
  price: {
    type: Number,
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
