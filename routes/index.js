var router = require('express').Router();

router.use('/api', require('./api'));

// Upload Image
router.get('/image/:uid', (req, res) => {
    const uid = req.params.uid;
    res.sendFile(uid, {root: './uploads/image'});
});  

router.get('/photo/:uid', (req, res) => {
    const uid = req.params.uid;
    res.sendFile(uid, {root: './uploads/photo'});
});  

module.exports = router;
