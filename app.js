require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const dbConnection = require('./database/dbConnection.js');
const userRouter = require('./routes/userRouter');



app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const session = require('express-session');
app.use(session({
    secret: process.env.SESSION_SECRET || 'car-hub-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true if using HTTPS
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));


// serve css and other static files
app.use(express.static(path.join(__dirname, 'public')));

// use router
app.use('/', userRouter);

const startServer = async () => {
    await dbConnection();

    const port = process.env.PORT || 3000;

    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
};

if (require.main === module) {
    startServer();
}

module.exports = app;
