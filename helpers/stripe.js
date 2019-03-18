const stripe = require('stripe')(process.env.STRIPE_SECRET);

async function makePayment(amount, token) {
  const charge = await stripe.charges.create({
    amount,
    currency: 'eur',
    description: 'Instagram Tour',
    source: token,
  });
  return charge;
}

module.exports = makePayment;
