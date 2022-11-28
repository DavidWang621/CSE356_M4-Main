class editController {
    static async getDocWithId(req, res, next) {
        let docID = req.params.id;
        console.log("GETTING TEXT EDITOR FOR", docID);
        return res.render('textEditor', {docID: docID});
    }
};

module.exports = editController;