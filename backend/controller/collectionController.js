var Y = require('yjs');
var document = require('../doc');
var DocumentModel = require('../models/document');
const {ObjectId} = require('mongodb');
var { fromUint8Array, toUint8Array } = require('js-base64');
var client = require('../app.js');

class collectionController {
    static async createDoc(req, res, next) {
        let name = req.body.name;
        // console.log("create doc", name);
        let ydoc = new Y.Doc();
        let docID = ydoc.clientID.toString();
        if(!document.doc[docID]){
            document.doc[docID] = ydoc;
            document.docNames[docID] = name;

            let index = document.topTen.indexOf(docID);
            // console.log("TYPE OF clientid", typeof docID);
            if (index > -1){
                document.topTen.splice(index, 1);
                document.topTen.unshift(docID);
            }else{ 
                document.topTen.unshift(docID);
            }

            while(document.topTen.length >50){
                document.topTen.pop();
            }

            // var newDoc = new DocumentModel({
            //     name, 
            //     id: document.doc[name].clientID,
            //     content: fromUint8Array(Y.encodeStateAsUpdate(document.doc[name])), 
            //     lastAccessed: new Date()
            // });
            // await newDoc.save(); 
            // docID = newDoc._id;
        }
        else{
            return res.status(200).json({ error: true, message: 'doc already exist' });
        }

        // await client.client.index({
        //     index: 'documents',
        //     id: docID,
        //     body: {
        //         name: name, 
        //         content: ""
        //     }
        // });

        // console.log(name + " doc has id " + docID);
        return res.status(200).json({status: 'OK', id: docID});
    }

    static async deleteDoc(req, res, next) {
        // let docID = new ObjectId(req.body.id);
        let docID = req.body.id;
        // console.log("docID delete", docID);

        // console.log("delete doc with id", docID);

        // await DocumentModel.deleteOne({_id: docID});

        await client.client.delete({
            index: 'documents',
            id: docID
        })

        if(document.doc[docID]){
            delete document.doc[docID];
            // document.doc.filter(d => d)
            delete document.docNames[docID];
        }

        let index = document.topTen.indexOf(docID);
        // console.log("index", index);
        if (index > -1){
            // console.log("delete from topten");
            document.topTen.splice(index, 1);
        }

        return res.status(200).json({status:'OK'});
    }

    static async listDocs(req, res, next) {
        let session = req.session.session;
        if (session === undefined){
            return res.status(200).json({ error: true, message: 'not logged in' });
        }
        session = session.id;
        // var docs = await DocumentModel.find({}).sort({lastAccessed: 'desc'}).limit(10);
        // console.log("TOP 10 DOCS", docs);
        // let returnJson = [];
        // docs.forEach(doc => {
        //     returnJson.push({id: doc["_id"].toString(), name: doc["name"]})
        // });
        let lst = [];
        let cnt = 10;
        if(document.topTen.length < 10){
            cnt = document.topTen.length
        }
        for(let i = 0; i< cnt; i++){
            let docID = document.topTen[i]
            lst.push({id: docID, name: document.docNames[docID]});
        }
        // document.topTen.forEach(name =>{
        //     lst.push(id: name, name: name);
        // });


        return res.status(200).json(lst);
        // return res.status(200).json(returnJson);
    }
};

module.exports = collectionController;