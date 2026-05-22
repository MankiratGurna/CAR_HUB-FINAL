const ServiceBooking = require('../models/ServiceBooking');

exports.bookService = async (req, res) => {
    try {
        const { serviceType, date, location, washType } = req.body;
        const newBooking = new ServiceBooking({
            serviceType,
            date,
            location,
            washType,
            userId: req.session.userId
        });
        await newBooking.save();
        console.log("Service booked successfully:", serviceType);
        res.status(201).json({ message: "Service booked successfully" });
    } catch (err) {
        console.error('Error during service booking:', err);
        res.status(500).json({ message: "Server Error" });
    }
};
