class loadController {
    static async display(req, res, next) {
        res.render('login');
    }
};

module.exports = loadController;