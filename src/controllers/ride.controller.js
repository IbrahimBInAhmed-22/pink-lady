const prisma = require('../lib/prisma');

exports.requestRide = async (req, res) => {
  const { pickup, drop } = req.body;
  const ride = await prisma.ride.create({
    data: { pickup, drop, status: 'REQUESTED', fare: 100 },
  });
  res.json(ride);
};