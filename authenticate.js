const fs = require('fs');
const request = require('request-promise')
const config = require('./config');

module.exports = (user, sessionId) => {
    return request.post({
        url: `https://${config.hostname}:4243/qps/session?xrfkey=abcdefghijklmnop`,
        headers: {
            'x-qlik-xrfkey': 'abcdefghijklmnop',
            'content-type': 'application/json'
        },
        rejectUnauthorized: false,
        //pfx: fs.readFileSync(config.certificates.pfx),
        cert: fs.readFileSync(config.certificates.client),
        key: fs.readFileSync(config.certificates.client_key),
        body: JSON.stringify({
            "UserDirectory": user.directory,
            "UserId": user.id,
            "Attributes": [],
            "SessionId": sessionId
        })
    }).then((d)=>{return d})
}