const express = require('express');
const router = express.Router();
const upload = require('../multer/upload');
const { ensureDatabase } = require('../database/dbConnection');

// Import Controllers
const viewController = require('../controller/viewController');
const authController = require('../controller/authController');
const serviceController = require('../controller/serviceController');
const carController = require('../controller/carController');
const userController = require('../controller/userController');

// Authentication middleware
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/login');
};

const uploadCarFiles = (req, res, next) => {
    upload.fields([
        { name: 'documentPhoto', maxCount: 1 },
        { name: 'carPhotos', maxCount: 10 }
    ])(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
};

// View Routes
router.get('/home', viewController.getHomePage);
router.get('/', viewController.getHomePage);
router.get('/contact', viewController.getContactPage);
router.get('/login', viewController.getLoginPage);
router.get('/signup', viewController.getSignupPage);
router.get("/services", isAuthenticated, viewController.getServicesPage);
router.get("/washing", isAuthenticated, viewController.getWashingPage);
router.get("/servicing", isAuthenticated, viewController.getServicingPage);
router.get("/modification", isAuthenticated, viewController.getModificationPage);
router.get("/stock", isAuthenticated, viewController.getStockPage);
router.get("/sell", isAuthenticated, viewController.getSellPage);
router.get('/profile', isAuthenticated, viewController.getProfilePage);

// Auth Routes
router.post('/login', ensureDatabase, authController.login);
router.post('/signup', ensureDatabase, authController.signup);
router.get('/logout', authController.logout);

// Service Routes
router.post("/book-service", isAuthenticated, ensureDatabase, serviceController.bookService);

// Car Routes
router.post("/sell-car", isAuthenticated, ensureDatabase, uploadCarFiles, carController.sellCar);
router.get("/api/cars-for-sale", ensureDatabase, carController.getCarsForSale);
router.post("/api/buy-car/:id", isAuthenticated, ensureDatabase, carController.buyCar);

// User Routes
router.get('/api/my-registrations', isAuthenticated, ensureDatabase, userController.getMyRegistrations);

module.exports = router;
