var document = require('../doc');

class homeController {
    static async getHome(req, res, next) {
        console.log("GET REQ FOR HOME");
        let lst = [];
        let cnt = 10;
        if(document.topTen.length < 10){
            cnt = document.topTen.length
        }
        for(let i = 0; i< cnt; i++){
            let docID = document.topTen[i]
            lst.push({id: docID, name: document.docNames[docID]});
        }
        res.render('home', {docs: lst});
    }
};

module.exports = homeController;