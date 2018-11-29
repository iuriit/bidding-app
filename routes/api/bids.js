var router = require('express').Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Product = mongoose.model('Product');
var Bid = mongoose.model('Bid');
var auth = require('../auth');

router.post('/add', auth.required, function(req, res, next){

    Product.findById(req.body.product_id).then(function(product){
        if(!product){ return res.sendStatus(401); }

        if(product.end_time < Date.now()) {
            return res.json({error: "Bid for this product is finished"});
        } else if(product.start_price > req.body.price) {
            return res.json({error: "Price is less than the start price"});
        } else {
            User.findById(req.payload.id).then(function(user){
                if(!user){ return res.sendStatus(401); }
                if(product.bid_cost > user.token_count) {
                    return res.json({error: "Your number of tokens is less than the required tokens"});
                }

                Bid.findOne({product_id: req.body.product_id, user_id: user.id}, function(err, result) {
                    if (err) throw err;
                    if(result) {
                        return res.json({error: "is already taken"});
                    } else {
                        // Save Bid
                        var bid = new Bid();
                        bid.product_id = req.body.product_id;
                        bid.user_id = user.id;
                        bid.price = req.body.price;
                        bid.save().then(function(){
                            // return res.json({bid: bid.toJSONFor()});
                        }).catch(next);

                        // Update Winner
                        Bid.find({product_id: req.body.product_id}).sort({price: 1}).then(function(results) {
                            if(results.length > 0) {
                                var isDetermined = false;
                                var min_price = 0;
                                var winner_id = "";
                                results.map(function(result){
                                    if(!isDetermined) {
                                        if(winner_id == "") {
                                            if(min_price < result.price) {
                                                min_price = result.price;
                                                winner_id = result.user_id;
                                            }
                                        } else {
                                            if(min_price < result.price) {
                                                isDetermined = true;
                                            } else if(min_price == result.price) {
                                                winner_id = "";
                                            }
                                        }
                                    }
                                });


                                user.bid_count++;
                                user.token_count -= product.bid_cost;
                                user.save().then(function(){
                                    product.bid_count++;
                                    if(winner_id == "") {
                                        product.winner_id = product.winner_name = product.winner_image = "";
                                        product.winner_price = 0;
                                        product.save().then(function(){
                                            return res.json({user: user.toAuthJSON()});
                                        }).catch(next);
                                    } else {
                                        User.findById(winner_id).then(function(win_user){
                                            product.winner_id = win_user.id;
                                            product.winner_name = win_user.name;
                                            product.winner_image = win_user.image;
                                            product.winner_price = min_price;
                                            product.save().then(function(){
                                                return res.json({user: user.toAuthJSON()});
                                            }).catch(next);
                                        });
                                    }
                                }).catch(next);
                            }
                        });
                    }
                });
            }).catch(next);
        }
    }).catch(next);
});

module.exports = router;