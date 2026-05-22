const SellCar = require('../models/SellCar');
const Purchase = require('../models/Purchase');

const getUploadedFileUrl = (file) => file.path || `/uploads/${file.filename}`;

exports.sellCar = async (req, res) => {
    try {
        const { carName, model, fuelType, bodyType, rate } = req.body;
        
        const documentPhotoPath = req.files['documentPhoto'] ? getUploadedFileUrl(req.files['documentPhoto'][0]) : '';
        const carPhotosPaths = req.files['carPhotos'] ? req.files['carPhotos'].map(getUploadedFileUrl) : [];

        const newSellCar = new SellCar({
            carName,
            model,
            fuelType,
            bodyType,
            rate,
            documentPhoto: documentPhotoPath,
            carPhotos: carPhotosPaths,
            userId: req.session.userId
        });

        await newSellCar.save();
        console.log("Car listed for sale successfully:", carName);
        res.status(201).json({ message: "Car listed successfully" });
    } catch (err) {
        console.error('Error listing car:', err);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.getCarsForSale = async (req, res) => {
    try {
        const cars = await SellCar.find({});
        res.json(cars);
    } catch (err) {
        console.error("Error fetching cars:", err);
        res.status(500).json({ error: "Server Error" });
    }
};

exports.buyCar = async (req, res) => {
    try {
        const carId = req.params.id;
        const { fullname, email, bankAccount, paymentMethod } = req.body;

        const car = await SellCar.findById(carId);
        if (!car) {
            return res.status(404).json({ error: "Car not found or already sold" });
        }

        const newPurchase = new Purchase({
            fullname,
            email,
            bankAccount,
            paymentMethod,
            carDetails: car.toObject(),
            userId: req.session.userId
        });
        await newPurchase.save();

        await SellCar.markAsSold(carId);

        res.status(200).json({ message: "Car purchased successfully!" });
    } catch (err) {
        console.error("Error buying car:", err);
        res.status(500).json({ error: "Server Error" });
    }
};
