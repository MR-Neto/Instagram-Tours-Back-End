const stripe = require('stripe')(process.env.STRIPE_SECRET);
const Tour = require('../models/tour');

const FULL_CAPACITY = 4;

async function makePayment(amount, token) {
  const charge = await stripe.charges.create({
    amount,
    currency: 'eur',
    description: 'Instagram Tour',
    source: token,
  });
  return charge;
}

async function createNewTour(booking, price) {
  const { token } = booking;
  const { date, user, places } = booking.details;
  const { buyer, numberOfTickets } = user;
  const isFull = numberOfTickets >= FULL_CAPACITY;
  try {
    const charge = await makePayment(price, token);
    const createdTour = await Tour.create({
      date,
      users: [{
        buyer,
        numberOfTickets,
      }],
      places,
      price,
      isFull,
    });
    return {
      status: 200,
      json: {
        code: 'successful booking',
        tour: createdTour,
        payment: charge,
      },
    };
  } catch (error) {
    return error;
  }
}

async function updateExistingTour(foundTour, booking, price) {
  const { token } = booking;
  const { date, user } = booking.details;
  const { numberOfTickets } = user;
  const availableSeats = FULL_CAPACITY - foundTour[0].users.reduce(
    (acc, currentUser) => acc + Number(currentUser.numberOfTickets),
    0,
  );
  const isFull = availableSeats - numberOfTickets <= 0;
  try {
    if (availableSeats >= numberOfTickets) {
      const charge = await makePayment(price, token);
      const updatedTour = await Tour.findOneAndUpdate(
        { date },
        {
          $push: { users: user },
          isFull,
        },
        { new: true },
      );
      return {
        status: 200,
        json: {
          code: 'successful booking',
          tour: updatedTour,
          payment: charge,
        },
      };
    }
    return {
      status: 401,
      json: {
        code: 'Not enough seats',
        tour: foundTour,
      },
    };
  } catch (error) {
    return error;
  }
}

module.exports = {
  createNewTour,
  updateExistingTour,
};
