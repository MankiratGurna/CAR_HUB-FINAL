const bcrypt = require('bcryptjs');
const User = require('../models/user');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            console.log('Login attempt with missing credentials');
            return res.status(400).json({ error: 'Wrong credential' });
        }

        console.log('Login attempt for:', username);

        // Find user by email or fullname
        const user = await User.findOne({
            $or: [
                { email: username },
                { fullname: username }
            ]
        });
        
        if (user) {
            console.log('User found, checking password...');
            const isMatch = await bcrypt.compare(password, user.password);
            
            if (isMatch) {
                console.log('Login successful for user:', username);
                if (req.session) {
                    req.session.userId = user._id;
                    res.redirect('/home');
                } else {
                    console.error('Session middleware not initialized');
                    res.status(500).send('Session error');
                }
            } else {
                console.log('Login failed: Invalid password for', username);
                res.status(401).json({ error: 'Wrong credential' });
            }
        } else {
            console.log('Login failed: User not found', username);
            res.status(401).json({ error: 'Wrong credential' });
        }
    } catch (err) {
        console.error('CRITICAL ERROR DURING LOGIN:', err);
        res.status(500).send(`Internal Server Error: ${err.message}`);
    }
};

exports.signup = async (req, res) => {
    try {
        const { fullname, email, password } = req.body;

        const existingUser = await User.findOne({ email: email });
        
        if (existingUser) {
            console.log('User already exists:', email);
            return res.status(400).send('User already exists');
        }

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, async (err, hash) => {
                try {
                    const newUser = new User({
                        fullname: fullname,
                        email: email,
                        password: hash
                    });

                    await newUser.save();
                    console.log("User saved successfully");
                    res.redirect('/login');
                } catch (saveErr) {
                    console.error('Error saving user:', saveErr);
                    res.status(500).send('Server Error');
                }
            });
        });

    } catch (err) {
        console.error('Error during signup:', err);
        res.status(500).send('Server Error');
    }
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/home');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login?logout=true');
    });
};
