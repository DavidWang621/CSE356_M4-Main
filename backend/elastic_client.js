const { Client } = require("@elastic/elasticsearch");
const word_list = require("./word_list");
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

client.indices.create({
    index: 'documents',
    "settings": {
        "analysis": {
            "analyzer": {
                "stem": {
                    "tokenizer": "standard",
                    "filter": [
                        "lowercase",
                        "dictionary_decompound",
                        "stop", 
                        "unique"
                    ]
                }
            }, 
            "filter": {
                "dictionary_decompound": {
                    "type": "dictionary_decompounder",
                    "word_list": word_list, 
                    "min_subword_size": 4
                }
            }
        }
    }
});

module.exports = client;