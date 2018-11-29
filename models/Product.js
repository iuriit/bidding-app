var mongoose = require('mongoose');

var SchemaTypes = mongoose.Schema.Types;
var ProductSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  image_width: SchemaTypes.Number,
  image_height: SchemaTypes.Number,
  start_price: SchemaTypes.Number,
  bid_cost: SchemaTypes.Number,
  end_time: SchemaTypes.Date,
  view_count: SchemaTypes.Number,
  bid_count: SchemaTypes.Number,
  winner_id: String,
  winner_price: SchemaTypes.Number,
  winner_name: String,
  winner_image: String,
}, {timestamps: true});

ProductSchema.methods.toJSONForWinner = function(){
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    image: this.image,
    image_width: this.image_width,
    image_height: this.image_height,
    start_price: this.start_price,
    bid_cost: this.bid_cost,
    end_time: this.end_time,
    view_count: this.view_count,
    bid_count: this.bid_count,
    winner_id: this.winner_id,
    winner_price: this.winner_price,
    winner_name: this.winner_name,
    winner_image: this.winner_image,
  };
};

ProductSchema.methods.toJSONFor = function(){
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    image: this.image,
    image_width: this.image_width,
    image_height: this.image_height,
    start_price: this.start_price,
    bid_cost: this.bid_cost,
    end_time: this.end_time,
    view_count: this.view_count,
    bid_count: this.bid_count,
    winner_id: this.winner_id,
    winner_name: this.winner_name,
    winner_image: this.winner_image,
  };
};

mongoose.model('Product', ProductSchema);