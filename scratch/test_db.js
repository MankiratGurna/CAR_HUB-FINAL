const mongoose = require('mongoose');
const User = require('../models/User');

const test = async () => {
    try {
        await mongoose.connect("mongodb://mankiratgurna2595_db_user:mankirat123@ac-qgrl5oa-shard-00-00.cpwa8rk.mongodb.net:27017,ac-qgrl5oa-shard-00-01.cpwa8rk.mongodb.net:27017,ac-qgrl5oa-shard-00-02.cpwa8rk.mongodb.net:27017/?authSource=admin&replicaSet=atlas-12p4b0-shard-0&ssl=true");
        console.log("Connected");
        const user = await User.findOne();
        console.log("User found:", user);
        
        const bcrypt = require('bcryptjs');
        try {
            const isMatch = await bcrypt.compare('0000000000', user.password);
            console.log("Match:", isMatch);
        } catch (bcryptErr) {
            console.error("Bcrypt comparison failed:", bcryptErr);
        }
        
        process.exit(0);
    } catch (err) {
        console.error("Test failed:", err);
        process.exit(1);
    }
};

test();
