var router = require('express').Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Product = mongoose.model('Product');
var Wishlist = mongoose.model('Wishlist');
var auth = require('../auth');

router.post('/:id', auth.required, function(req, res, next){
    Wishlist.findOne({product_id: req.params.id, user_id: req.payload.id}).then(function(result){
        if(result){ return res.sendStatus(404); }

        var item = new Wishlist();
        item.product_id = req.params.id;
        item.user_id = req.payload.id;

        item.save().then(function(){
            Product.findById(req.params.id).then(function(product){
                if(!product){ return res.sendStatus(401); }        
                var response = product.toJSONFor();
                response.wish = true;
                return res.json({product : response});
            }).catch(next);
        }).catch(next);
    }).catch(next);
});

router.delete('/:id', auth.required, function(req, res, next){
    Wishlist.findOne({product_id: req.params.id, user_id: req.payload.id}).then(function(result){
        if(!result){ return res.sendStatus(404); }

        result.remove().then(function(){
            Product.findById(req.params.id).then(function(product){
                if(!product){ return res.sendStatus(401); }        
                var response = product.toJSONFor();
                response.wish = false;
                return res.json({product : response});
            }).catch(next);
        }).catch(next);
    }).catch(next);
});

module.exports = router;