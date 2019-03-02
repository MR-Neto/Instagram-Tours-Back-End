const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const tourSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    users: {
      type: [
        {
          buyer: { type: ObjectId, ref: 'User' },
          numberOfTickets: { type: Number },
        },
      ],
      required: true,
    },
    places: [{ type: ObjectId, ref: 'Place' }],
    price: {
      type: Number,
    },
    isFull: { type: Boolean, default: false },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
