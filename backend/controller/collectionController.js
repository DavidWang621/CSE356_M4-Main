var Y = require('yjs');
var document = require('../doc');
var DocumentModel = require('../models/document');
const {ObjectId} = require('mongodb');
var { fromUint8Array, toUint8Array } = require('js-base64');
var client = require('../elastic_client');

class collectionController {
    static async createDoc(req, res, next) {
        let name = req.body.name;
        let ydoc = new Y.Doc();
        let docID = ydoc.clientID.toString();
        if(!document.doc[docID]){
            document.doc[docID] = ydoc;
            document.docNames[docID] = name;

            // let index = document.topTen.indexOf(docID);
            // if (index > -1){
            //     document.topTen.splice(index, 1);
            //     document.topTen.unshift(docID);
            // }else{ 
            //     document.topTen.unshift(docID);
            // }

            // while(document.topTen.length >50){
            //     document.topTen.pop();
            // }
            await client.CreateUpdateDocument('documents', docID, name, "");
        }
        else{
            return res.status(200).json({ error: true, message: 'doc already exist' });
        }

        return res.status(200).json({status: 'OK', id: docID});
    }

    static async deleteDoc(req, res, next) {
        let docID = req.body.id;
        await client.deleteDocument('documents, docID');

        // if(document.doc[docID]){
        //     delete document.doc[docID];
        //     delete document.docNames[docID];
        // }

        // let index = document.topTen.indexOf(docID);
        // if (index > -1){
        //     document.topTen.splice(index, 1);
        // }

        return res.status(200).json({status:'OK'});
    }

    static async listDocs(req, res, next) {
        console.log("ACTUALLY LISTING DOCS");
        let session = req.session.session;
        if (session === undefined){
            return res.status(200).json({ error: true, message: 'not logged in' });
        }
        session = session.id;

        let lst = [];
        let cnt = 10;
        if(document.topTen.length < 10){
            cnt = document.topTen.length
        }
        for(let i = 0; i< cnt; i++){
            let docID = document.topTen[i]
            lst.push({id: docID, name: document.docNames[docID]});
        }

        return res.status(200).json(lst);
    }
};

module.exports = collectionController;