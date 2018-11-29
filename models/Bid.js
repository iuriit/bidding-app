var mongoose = require('mongoose');

var SchemaTypes = mongoose.Schema.Types;
var BidSchema = new mongoose.Schema({
    product_id: String,
    user_id: String,
    price: SchemaTypes.Number,
}, {timestamps: true});

BidSchema.methods.toJSONFor = function(){
    return {
        id: this._id,
        product_id: this.product_id,
        user_id: this.user_id,
        price: this.price,
    };
};

mongoose.model('Bid', BidSchema);