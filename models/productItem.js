
const mongoose = require('mongoose')

const Schema = mongoose.Schema
const productItemSchema = new Schema({
    productName: {
        type: String, 
        required: true
    },
    pictureLink: {
        type: String, 
        required: false
    },
    promo: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    shopLink: {
        type: String,
        required: false
    }
}, {timestamps: true})
const ProductItem = mongoose.model('DBProduct', productItemSchema)

module.exports = ProductItem