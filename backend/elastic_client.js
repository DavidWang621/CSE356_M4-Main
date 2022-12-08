const { Client } = require("@elastic/elasticsearch");
const word_list = require("./word_list");
const common_bulk = require("./common_bulk");
const animal_bulk = require("./animal_bulk");
var fs = require('fs');
var env = require('dotenv');
env.config();

const client = new Client({
    node: process.env.elastic_ip,
    auth: {
        username: process.env.elastic_username,
        password: process.env.elastic_password
    },
    tls: {
        ca: fs.readFileSync('./http_ca.crt'),
        rejectUnauthorized: false
    }
});

async function deleteIndex(index) {
    console.log("deleting documents");
    await client.indices.delete({ index: index });
}
exports.deleteIndex = deleteIndex;

async function createIndex(del) {
    const exists = await client.indices.exists({ index: 'documents' });
    
    if (!exists) {
        console.log("Creating Index documents");
        client.indices.create({
            index: 'documents',
            "settings": {
                "analysis": {
                    "analyzer": {
                        "my_analyzer": {
                            "tokenizer": "standard",
                            "filter": ["lowercase", "stop"]
                        }
                    }
                }
            }
        });
    }
}
exports.createIndex = createIndex;

async function CreateUpdateDocument(index, docID, name, content) {
    const res = await client.index({
        index: index,
        id: docID,
        body: {
            name: name, 
            content: content
        }
    });
    return res;
}
exports.CreateUpdateDocument = CreateUpdateDocument;

async function bulkUpdate(lst) {
    client.bulk({
        body: lst
    });
}
exports.bulkUpdate = bulkUpdate;

async function deleteDocument(index, id) {
    try {
        await client.client.delete({
            index: index,
            id: id
        })
    } catch {
        return null;
    }
}
exports.deleteDocument = deleteDocument;