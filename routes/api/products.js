var router = require('express').Router();
var mongoose = require('mongoose');
var Product = mongoose.model('Product');
var Wishlist = mongoose.model('Wishlist');
var Bid = mongoose.model('Bid');
var multer = require('multer');
var auth = require('../auth');
var sizeOf = require('image-size');

router.post('/add', auth.required, function(req, res, next){
    var product = new Product();

    var storage = multer.diskStorage({
      destination: 'uploads/image',
      filename: function (req1, file, cb) {
        const ext = '.' + file.mimetype.substring(6)
        const timeStampInMs = Date.now().toString();
        cb(null, timeStampInMs + ext)
      }
    });
  
    var upload = multer({storage: storage}).any();
    upload(req, res, function (err) {
        product.name = req.body.name;
        product.description = req.body.description;
        product.image = (req.files.length > 0) ? req.files[0].path.substr(8) : "";
        if(req.files.length > 0) {
            var dimensions = sizeOf(req.files[0].path);
            product.image_width = dimensions.width;
            product.image_height = dimensions.height;
        } else {
            product.image_width = product.image_height = 0;
        }

        product.start_price = req.body.start_price;
        product.bid_cost = req.body.bid_cost;
        product.end_time = new Date(req.body.end_time);
        product.view_count = 0;
        product.bid_count = 0;
        product.winner_id = "";
        product.winner_name = "";
        product.winner_image = "";
        product.winner_price = 0;
        product.save().then(function(){
            return res.json({product: product.toJSONFor()});
        }).catch(next);
    });
});

router.get('/ending_soon', auth.required, function(req, res, next){
    var dt = new Date();
    Product.find({ 'end_time' : {'$gte': dt} }).sort({'end_time' : 1}).then(function(products){
        return res.json({
            products: products.map(function(product){
                return product.toJSONFor();
            })
        });
    }).catch(next);
});

router.get('/most_view', auth.required, function(req, res, next){
    var dt = new Date();
    Product.find({ 'end_time' : {'$gte': dt} }).sort({'view_count' : -1}).then(function(products){
        return res.json({
            products: products.map(function(product){
                return product.toJSONFor();
            })
        });
    }).catch(next);
});

router.get('/most_bid', auth.required, function(req, res, next){
    var dt = new Date();
    Product.find({ 'end_time' : {'$gte': dt} }).sort({'bid_count' : -1}).then(function(products){
        return res.json({
            products: products.map(function(product){
                return product.toJSONFor();
            })
        });
    }).catch(next);
});

router.get('/wishlist', auth.required, function(req, res, next){
    Wishlist.find({user_id: req.payload.id}).then(function(lists){
        let products = [];
        lists.map((list, idx) => {
            Product.findById(list.product_id).then(function(product){
                if (product) {
                    products.push(product.toJSONFor());
                    if (idx === lists.length - 1) {
                        return res.json({products: products})
                    }
                }
            });
        })
    });
});

router.get('/won_auctions', auth.required, function(req, res, next){
    var dt = new Date();
    Product.find({ 'end_time' : {'$lt': dt}, 'winner_id' : req.payload.id }).then(function(products){
        return res.json({
            products: products.map(function(product){
                return product.toJSONForWinner();
            })
        });
    }).catch(next);
});

router.get('/:id', auth.required, function(req, res, next){
    Product.findById(req.params.id).then(function(product){
        if(!product){ return res.sendStatus(401); }

        var response = product.toJSONFor();
        product.view_count++;
        product.save().then(function(){
            Wishlist.findOne({product_id: req.params.id, user_id: req.payload.id}).then(function(result){
                if(result)
                    response.wish = true;
                else
                    response.wish = false;
                return res.json({product : response});
            }).catch(next);
        }).catch(next);
    }).catch(next);
});

router.delete('/:id', function(req, res){
    Product.findById(req.params.id).then(function(product){
        if(!product){ return res.sendStatus(401); }

        Bid.find({product_id: req.params.id}).then(function(bids){
            bids.map(function(bid){
                return bid.remove();
            })
        });

        Wishlist.find({product_id: req.params.id}).then(function(lists){
            lists.map(function(list){
                return list.remove();
            })
        });
    
        return product.remove().then(function(){
            return res.sendStatus(204);
        });
    });
});

router.put('/:id', function(req, res){
    Product.findById(req.params.id).then(function(product){
        if(!product){ return res.sendStatus(401); }

        if(typeof req.body.product.end_time !== 'undefined'){
            product.end_time = req.body.product.end_time;
        }
      
        return product.save().then(function(){
            return res.json({product: product.toJSONFor()});
        });
    });
});

module.exports = router;  