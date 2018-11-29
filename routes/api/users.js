var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');
var User = mongoose.model('User');
var auth = require('../auth');
var multer = require('multer');

router.post('/login', function(req, res, next){
  if(!req.body.user.email){
    return res.status(422).json({errors: {email: "can't be blank"}});
  }

  if(!req.body.user.password){
    return res.status(422).json({errors: {password: "can't be blank"}});
  }

  // req.body.user.email = req.body.user.email.toLowercase();

  passport.authenticate('local', {session: false}, function(err, user, info){
    if(err){ return next(err); }

    if(user){
      user.token = user.generateJWT();
      return res.json({user: user.toAuthJSON()});
    } else {
      return res.status(422).json(info);
    }
  })(req, res, next);
});

router.post('/register', function(req, res, next){
  var user = new User();

  var storage = multer.diskStorage({
    destination: 'uploads/photo',
    filename: function (req1, file, cb) {
      const ext = '.' + file.mimetype.substring(6)
      const timeStampInMs = Date.now().toString();
      cb(null, timeStampInMs + ext)
    }
  });

  var upload = multer({storage: storage}).any();
  upload(req, res, function (err) {
    user.username = req.body.username;
    user.email = req.body.email;
    user.setPassword(req.body.password);
    user.image = (req.files.length > 0) ? req.files[0].path.substr(8) : "";
    user.name = req.body.name;
    user.surname = req.body.surname;
    user.address = req.body.address;
    user.phone = req.body.phone;
    user.token_count = 10000;
    user.bid_count = 0;
    user.save().then(function(){
      return res.json({user: user.toAuthJSON()});
    }).catch(next);
  });
});

router.get('/user', auth.required, function(req, res, next){
  User.findById(req.payload.id).then(function(user){
    if(!user){ return res.sendStatus(401); }

    return res.json({user: user.toAuthJSON()});
  }).catch(next);
});

router.get('/user/:id', auth.required, function(req, res, next){
  User.findById(req.params.id).then(function(user){
    if(!user){ return res.sendStatus(401); }

    return res.json({user: user.toProfileJSONFor()});
  }).catch(next);
});

router.put('/user', auth.required, function(req, res, next){
  User.findById(req.payload.id).then(function(user){
    if(!user){ return res.sendStatus(401); }

    // only update fields that were actually passed...
    if(typeof req.body.user.username !== 'undefined'){
      user.username = req.body.user.username;
    }
    if(typeof req.body.user.email !== 'undefined'){
      user.email = req.body.user.email;
    }
    if(typeof req.body.user.password !== 'undefined'){
      user.setPassword(req.body.user.password);
    }
    if(typeof req.body.user.image !== 'undefined'){
      user.image = req.body.user.image;
    }
    if(typeof req.body.user.name !== 'undefined'){
      user.name = req.body.user.name;
    }
    if(typeof req.body.user.surname !== 'undefined'){
      user.surname = req.body.user.surname;
    }
    if(typeof req.body.user.address !== 'undefined'){
      user.address = req.body.user.address;
    }
    if(typeof req.body.user.phone !== 'undefined'){
      user.phone = req.body.user.phone;
    }
    if(typeof req.body.user.token_count !== 'undefined'){
      user.token_count = req.body.user.token_count;
    }

    return user.save().then(function(){
      return res.json({user: user.toAuthJSON()});
    });
  }).catch(next);
});

module.exports = router;
