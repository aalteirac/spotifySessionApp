var path = require('path')
var extend = require('extend')


//var certPath = path.join(__dirname, '.', 'certs');
var certPath = "C:\\ProgramData\\Qlik\\Sense\\Repository\\Exported Certificates\\.Local Certificates";
var config = extend(true, {
	
	//SENSE VIRTUAL PROXY SETTINGS MUST BE SET ACCORDINGLY
	//Access-Control-Allow-Origin:*
	//Integration SESSION MODULE : http://localhost:3002/main  (ASSUMING THIS CODE RUN ON SENSE SERVER)
	//Seesion Cookie name aligned with the setting below
    hostname:'localhost',
    cookieName: 'X-sess',
    directory:'CUSTOM',
	emptyAppID:"82df6f83-a835-4587-ab8f-76c20155dbfc",
	prefix:'/ano/',
	//SPOTIFY API KEYS, GO TO THE DEV WEB SITE TO GET THEM
	clientId: 'XXXXXXX',
    clientSecret: 'XXXXXXX',
	
    certificates: {
        pfx:path.resolve(certPath, 'client.pfx'),
        client: path.resolve(certPath, 'client.pem'),
        root: path.resolve(certPath, 'root.pem'),
        client_key: path.resolve(certPath, 'client_key.pem'),
    }


});

module.exports = config;