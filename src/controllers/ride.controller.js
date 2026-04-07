const prisma = require('../lib/prisma');
const logger = require('../lib/logger');

exports.requestRide = async (req, res) => {
  try {
    const { pickup, drop } = req.body;
    const ride = await prisma.ride.create({
      data: { pickup, drop, status: 'REQUESTED', fare: 100 },
    });
    res.json(ride);
  } catch (error) {
    logger.error('ride.requestRide', 'Failed to create ride', error);
    res.status(500).json({ error: error.message });
  }
};
