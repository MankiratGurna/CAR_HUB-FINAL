const path = require('path');

exports.getHomePage = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'home.html'));
};

exports.getContactPage = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'contact.html'));
};

exports.getLoginPage = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'login.html'));
};

exports.getSignupPage = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'signup.html'));
};

exports.getServicesPage = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'services.html'));
};

exports.getWashingPage = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'washing.html'));
};

exports.getServicingPage = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'servicing.html'));
};

exports.getModificationPage = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'modification.html'));
};

exports.getStockPage = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'stock.html'));
};

exports.getSellPage = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'sell.html'));
};

exports.getProfilePage = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'profile.html'));
};
