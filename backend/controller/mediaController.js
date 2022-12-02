var multer = require('multer');
var path = require('path');
var document = require('../doc');

var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, path.join(__dirname,'../images'));
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});

var upload = multer({storage: storage, 
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !=='.gif') {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    }
}).single("file");

class mediaController {
    static async uploadMedia(req, res, next) {
        let session = req.session.session;
        if (session === undefined){
            return res.status(200).json({ error: true, message: 'not logged in' });
        }
        session = session.id;

        upload(req, res, (err) => {
            if (err) {
                return res.status(200).json({ error: true, message: err });
            }
            let mediaid = makeKey();
            document.images[mediaid] = {filename: req.file.originalname, mimetype: req.file.mimetype};
            return res.status(200).json({status: "OK", mediaid: mediaid});
        })
    }

    static async getMedia(req, res, next) {
        let session = req.session.session;
        if (session === undefined){
            return res.status(200).json({ error: true, message: 'not logged in' });
        }
        session = session.id;
        
        let mediaid = req.params.mediaid;
        if(!document.images[mediaid]){
            return res.status(200).json({ error: true, message: 'image does not exist' });
        }
        var options = {
            root: path.join(__dirname, '../images')
        };
        res.sendFile(document.images[mediaid].filename, options, function (err) {
            if (err) {
                return res.status(200).json({ error: true, message: err });
            }
        });
    }
};

function makeKey() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < 20; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
}

module.exports = mediaController;