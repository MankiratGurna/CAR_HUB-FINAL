require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const dbConnection = require('./database/dbConnection.js');
const userRouter = require('./routes/userRouter');
const PgSessionStore = require('./database/sessionStore');



app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const session = require('express-session');
app.set('trust proxy', 1);
app.use(session({
    store: new PgSessionStore(),
    secret: process.env.SESSION_SECRET || 'car-hub-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24
    }
}));


// serve css and other static files
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', async (req, res) => {
    try {
        await dbConnection({ exitOnFail: false });
        res.json({ status: 'ok', database: 'connected' });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            database: 'disconnected',
            message: 'Check database environment variables on the server'
        });
    }
});

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
