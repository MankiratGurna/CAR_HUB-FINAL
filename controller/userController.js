const ServiceBooking = require('../models/ServiceBooking');
const SellCar = require('../models/SellCar');
const Purchase = require('../models/Purchase');

exports.getMyRegistrations = async (req, res) => {
    try {
        const userId = req.session.userId;
        const bookings = await ServiceBooking.find({ userId });
        const sales = await SellCar.find({ userId });
        const purchases = await Purchase.find({ userId });

        res.json({
            bookings,
            sales,
            purchases
        });
    } catch (err) {
        console.error("Error fetching registrations:", err);
        res.status(500).json({ error: "Server Error" });
    }
};
