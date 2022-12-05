var EventSource = require("eventsource");
var document = require('../doc');
var Y = require('yjs');
var { fromUint8Array, toUint8Array } = require('js-base64');
// var UserModel = require('../models/userInfo');
var DocumentModel = require('../models/document');
var es_client = require('../elastic_client');
// var queue = require('../queue');

var list = new Set();

setInterval(() => {
    // if(Object.keys(list).length > 0){
    //     CreateUpdateDocument(list);
    //     list.clear();
    // }
    if (list.size > 0) {
        CreateUpdateDocument(list);
        list.clear();
    }
}, 1000);

class apiController {
    static async makeDoc(req, res, next) {
        // console.log("API/CONNECT", req.params.id);
        let session = req.cookies.values;
        // let session = req.cookies.session;
        if (session === undefined){
            console.log("no session in api/connect");
            return res.status(200).json({ error: true, message: 'not logged in' });
        }
        session = session.id;

        let docID = req.params.id;
        if(!document.doc[docID]){
            let ydoc = new Y.Doc();
            document.doc[docID] = ydoc;
            let doc = await DocumentModel.findOne({ id: docID });
            document.docNames[docID] = doc.name;
            // return res.status(200).json({ error: true, message: 'document does not exist' });
        }
        const headers = {
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache', 
            'X-Accel-Buffering': 'no',
            'X-CSE356': '6306bd832988c22186b271fa'
        };
        res.writeHead(200, headers);
        res.flushHeaders();
        
        let uniqueClientID = session;

        let data = fromUint8Array(Y.encodeStateAsUpdate(document.doc[docID]));
        
        const syncEvent = `event: sync\ndata: ${data}\nid: ${session}\n\n`;
        res.write(syncEvent);

        if(document.clients[docID]){
            document.clients[docID].push([res, session]);
        }
        else{
            document.clients[docID] = [[res, session]];
        };

        res.on('close', () =>{
            document.clients[docID] = document.clients[docID].filter(respond => respond[1] !== session);
        })
    }

    static async updateDoc(req, res, next) {
        // console.log("POST req for ", req.body.id);
        let session = req.cookies.values;
        // let session = req.cookies.session;
        if (session === undefined){
            console.log("no session in api/op");
            return res.status(200).json({ error: true, message: 'not logged in' });
        }
        // session = session.id;

        let docID = req.params.id;
        // console.log("docID OP", docID);
        let op = req.body.data;

        Y.applyUpdate(document.doc[docID], toUint8Array(op));

        // var msg = JSON.stringify({index: 'documents', id: docID, name: document.docNames[docID], content: document.doc[docID].getText("quill")});
        // var msg = {id: docID};
        // // queue.sendToChannel('update', msg);

        // list[msg.id] = msg;
        list.add(docID);

        // let index = document.topTen.indexOf(docID);
        // if (index > 0){
        //     document.topTen.splice(index, 1);
        //     document.topTen.unshift(docID);
        // }else if(index < 0){
        //     document.topTen.unshift(docID);
        // }
        // while(document.topTen.length >50){
        //     document.topTen.pop();
        // }

        let clients = document.clients[docID];
        if (clients != undefined) {
            // clients.filter(c => c[1] != session) 
            clients.forEach(client => {
                client[0].write(`event: update\ndata: ${op}\n\n`);
            });
        }
        return res.status(200).send({status: 'OK'});
    }

    static async insertPresenceInDoc(req, res, next) {
        // console.log("PRESENCE CALL");
        let session = req.cookies.values;
        // let session = req.cookies.session;
        // console.log("POST presence req for", req.params.id, "data is", payload);
        if (session === undefined){
            return res.status(200).json({ error: true, message: 'not logged in' });
        }
        session = session.id;
        
        let payload = req.body;

        document.presences[session] = {index: payload.index, length: payload.length}

        let docID = req.params.id;

        let clients = document.clients[docID];

        let clientID = payload.clientID;

        let data = {
            session_id: session, 
            name: req.cookies.values.name,
            cursor: document.presences[session]
        }
        if (clients != undefined) {
            clients.forEach(client => {
                client[0].write(`event: presence\ndata: ${JSON.stringify(data)}\n\n`);
            });
        }
        return res.status(200).send({status: 'OK'});
    }
};

async function CreateUpdateDocument() {
    let lst = [];
    // Object.entries(list).forEach(([key, json])=> {
    //     lst.push({update: {_id: key, _index: 'documents'}}, { doc: {name: document.docNames[json.id], content: document.doc[json.id].getText("quill")}});
    // });
    list.forEach(id => {
        lst.push({update: {_id: id, _index: 'documents'}}, { doc: {name: document.docNames[id], content: document.doc[id].getText("quill")}});
    })

    es_client.bulkUpdate(lst);
};

module.exports = apiController;