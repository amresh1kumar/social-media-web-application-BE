// const mongoose = require("mongoose");
// const Conversation = require("../src/models/Conversation");
// const User = require("../src/models/User");
// require("dotenv").config();

// async function createTest() {
//    await mongoose.connect(process.env.MONGO_URI);

//    const users = await User.find().limit(2);
//    if (users.length < 2) {
//       console.log("Not enough users to create conversation");
//       process.exit(0);
//    }

//    const conv = await Conversation.create({
//       participants: [users[0]._id, users[1]._id],
//       messages: [
//          { sender: users[0]._id, text: "Hello!" },
//          { sender: users[1]._id, text: "Hi, how are you?" }
//       ]
//    });

//    console.log("Test conversation created:", conv);
//    mongoose.disconnect();
// }

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Conversation = require('../src/models/Conversation');

async function createTest() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const users = await User.find().limit(2);
    if (users.length < 2) {
        console.log("Need at least 2 users in DB");
        return;
    }

    const conv = new Conversation({
        participants: [users[0]._id, users[1]._id],
        messages: [{ sender: users[0]._id, text: "Hello!", createdAt: new Date() }],
    });

    await conv.save();
    console.log("Test conversation created");
    process.exit(0);
}

createTest();
