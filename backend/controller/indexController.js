var client = require('../elastic_client');

class indexController {
    static async search(req, res, next) {
        let searchTerms = req.query.q;
        // console.log(searchTerms);

        let results = await client.searchDocument("documents", searchTerms);

        // console.log("SEARCH WORD RESULTS", results);
        let output = []
        // console.log(results);
        results.hits.hits.forEach((doc, index, snippet) => {
            let snip = "";
            if (doc.highlight) {
                if (doc.highlight.content) {
                    snip = doc.highlight.content[0];
                }
                if (doc.highlight.name) {
                    snip = doc.highlight.name[0];
                }
            }
            output.push({
                docid: doc._id,
                name: doc._source.name,
                snippet: snip
            })
        })
        return res.status(200).send(output);
    }

    static async suggest(req, res, next) {
        let suggestTerm = req.query.q;
        let returnLen = suggestTerm.length + 1;
        // console.log("COUNT TO RETURN", returnLen);
        if (suggestTerm.length < 4) {
            return res.status(200).send({error: true, message: "Suggest term length too small"});
        }

        // let results = await client.search({
        //     index: 'documents', 
        //     suggest: {
        //         suggestion: {
        //             text: suggestTerm,
        //             term: { 
        //                 field: 'content'
        //             }
        //         }
        //     }
        // })
        let results = await client.suggestDocument("documents", suggestTerm);
        // let output = [];
        // results = results.suggest.suggestion[0].options;
        // for (let i in results) {
        //     if (results[i].text.length >= returnLen) {
        //         output.push(results[i].text);
        //     }
        // }
        return res.status(200).json(results);
    }
};

module.exports = indexController;