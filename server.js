const os = require('os')
const fs = require('fs')
const config = require('./config.json')
var crypto = require('crypto');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const server = require('http').Server(app);
const port = 3001;
//const redis = require('redis');
//const redisClient = redis.createClient();
const pgp = require('pg-promise')({});

const cn = config.postgres

const db = pgp(cn);
const cs = new pgp.helpers.ColumnSet(['url', 'method', 'requestheaders', 'mime_type', 'response_code', 'request_body'], {
    table: config.table
});

var whiteListed = []
var md5Array = fs.readFileSync('hashes.txt').toString().split("\n");

/*redisClient.on('connect', function() {
    console.log('Redis client connected');
});

redisClient.on('error', function(err) {
    console.log('Something went wrong ' + err);
});*/


app.use(express.json({
    inflate: true,
    strict: false,
    limit: '10mb',
    type: 'application/json'
}));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
    next();
});

//pre-flight requests
app.options('*', function(req, res) {
    res.send(200);
});

server.listen(port, "0.0.0.0", (err) => {
    if (err) {
        throw err;
    }
    /* eslint-disable no-console */
    console.log('Node Endpoints working :)');
});

app.all('/', (req, res) => {
    if (req.method === 'GET') {
        res.status(200);
        res.json({
            working: true
        });
        res.end();
    } else if (req.method === 'POST') {
        res.status(200);
        res.send('working');
        res.end();
    } else if (req.method === 'PUT') {
        res.status(403);
        res.send('Access Denied');
        res.end();
    }
});

function createUrlForHash(url, parameters) {

 					newUrl = url

                    if (parameters != undefined) {

                        firstSplit = parameters.split("&")

                        for (a = 0; a < firstSplit.length; a++) {

                            secondSplit = firstSplit[a].split("=")

                            firstSplit[a] = secondSplit[0]

                            newUrl += firstSplit[a]
                        }

                    }
                    return newUrl

}

function createHash(checkedUrl) {
	 let hash = crypto.createHash('md5').update(newUrl).digest("hex")
                    return hash
}

const  checkIfRedisKeyIsKnown = async (hash) =>   {

                   redisClient.mget('md5', function(error, result) {
                            if (error) {
                                console.log(error);
                                throw error;
                            } else {
                                if (result.includes(hash)) {
                                    console.log("duplicate hash found: " + hash)
                                 ///   continue
                                 return true
                                } else {
                                	return false
                                    console.log("new hash found: " + hash)
                                }
                            }
                            }) 
                    
                
}
app.post('/endpointdata', async (req, res) => {
            console.log("request received")
            var newUrl = ""

            for (i = 0; i < req.body.length; i++) {

                var justTheUrl = req.body[i].url.split("?")

                var re = /\.(jp(e)?g|png|gif|woff(2)?|mp4|wav|css)$/

                if (justTheUrl[0].match(re)) {
		continue
                } else {
                   	newUrl = createUrlForHash(justTheUrl[0], justTheUrl[1])
                  
                    }
                   	hash = createHash(newUrl)

				 if (md5Array.includes(hash)) {
                                continue
				  } else{
					console.log("added hash to array: " + hash)
					mime = req.body[i].mime
					if (mime == null | mime == undefined) {
					mime = "unknown"
					}
                                  whiteListed.push({
                                             'url': req.body[i].url,
                                             'method': req.body[i].method,
                                             'requestheaders': req.body[i].requestHeaders,
						'mime_type': mime,
						'response_code': req.body[i].status,
						'request_body': req.body[i].requestBody
                                     })
					md5Array.push(hash)
					
					  fs.appendFile('hashes.txt', hash + os.EOL , function (err) {
                          if (err) throw err;
                        });

                                      }
			}
	                console.log(whiteListed.length)
			
                	const query = pgp.helpers.insert(whiteListed, cs) + ' ON CONFLICT(url) DO NOTHING '
                	await db.none(query).then(console.log("done with inserting to postgres"));

            })


        module.exports = server;
