const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VendorSchema = new Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: false
    },

    
},
    { timestamps: true }
);

module.exports = User = mongoose.model('vendors', VendorSchema);