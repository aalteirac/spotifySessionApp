var express = require('express');
var router = express.Router();
var engine = require('../engine');
var authenticate = require('../authenticate')
var generateID = require('../generateSession')
const config = require('../config');
var spot = require('../spotify');
const mcache = require('memory-cache');

function log(m, req) {
    console.log(req.connection.remoteAddress, m);
}
router.get('/session/*', function (req, res, next) {
	var sessionId=req.path.substr(req.path.indexOf('/session/')+9,req.path.length);
	var userId=mcache.get(sessionId);
	authenticate({id: userId, directory: config.directory}, sessionId).then((d)=> {
		res.status(200).send(d);
	})
})
router.post('/', function (req, res, next) {
    if (req.body.template && req.session.token) {
			spot.getBasic(req.session.token).then((data)=>{
				var uid = req.body.userid;
				var script = data.script;
				if(req.session.sessionID){
					engine.createSessionAppFromScratch({
							cookie: config.cookieName + "=" + req.session.sessionID + '; Path=/; HttpOnly; Secure',
							template:config.emptyAppID,
							script: script,
							appName:data.name
						}).then((result)=> {
						req.session.currentApp=result;
						res.status(200).send(result)
					}).catch((err)=> {
							console.log(err)
							res.status(500).send(err)
						}
					)
				}
			},(e)=>{
				console.log(e);
				res.status(200).send({error:"Error in Spotify communication",stack:e.error})
			}).catch((e)=>{res.status(500).send(err)});
    }
	else if (req.body.auth) {
		req.session.token=req.body.auth;
		spot.getUser(req.session.token).then((data)=>{
			console.log("Logged:",data);
			req.session.sessionID=generateID();
			mcache.put(req.session.sessionID,data);
			req.session.userId=data;
			res.cookie(config.cookieName, req.session.sessionID, {expires: 0, httpOnly: true});
			res.status(200).send(req.session.token);
		},(e)=>{
			//res.redirect(307,'/login.html');
			res.status(200).send({redirect:'/',error:"Error getting user info",stack:e})
		})
	}
    else {
        log("NADA", req);
        res.status(200).send({})
    }
});

module.exports = router;
