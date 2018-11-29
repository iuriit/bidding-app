var mongoose = require('mongoose');

var WishlistSchema = new mongoose.Schema({
    product_id: String,
    user_id: String,
}, {timestamps: true});

WishlistSchema.methods.toJSONFor = function(){
    return {
        id: this._id,
        product_id: this.product_id,
        user_id: this.user_id,
    };
};

mongoose.model('Wishlist', WishlistSchema);