const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: [true, "enter the name please"]
    },
    role: {
        type: String,
        required: [true, 'role is needed'],
        enum: ['scientist', 'admin']
    },
    email: {
        type: String,
        required: [true, 'email is needed']
    },
    password: {
        type: String,
        required: true
    },
    verificationKey: { 
        type: String, 
        required:true 
    },
    emailVerified: { 
        type: Boolean, 
        required:true, 
        default: false 
    },
    
},
    { timestamps: true }
);

module.exports = User = mongoose.model('users', UserSchema);