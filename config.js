var path = require('path')
var extend = require('extend')


//var certPath = path.join(__dirname, '.', 'certs');
var certPath = "C:\\ProgramData\\Qlik\\Sense\\Repository\\Exported Certificates\\.Local Certificates";
var config = extend(true, {
    //IMPORTANT if testing on desktop, turn it to true, this will set the port to 4848 and will ignore the authentication step.
    runDesktop:true,
    //SPOTIFY API KEYS, GO TO THE DEV WEB SITE TO GET THEM
    clientId: 'fb7a34fc55804a89981e98c96e6101e5',
    clientSecret: 'b8da5590ba5e4200b0cdeb4da59e2e9a',

    //IF RUNNING DESKTOP IGNORE THE FOLLOWING
	//SENSE VIRTUAL PROXY SETTINGS MUST BE SET ACCORDINGLY
	//Access-Control-Allow-Origin:*
	//Integration SESSION MODULE : http://localhost:3010/main  (ASSUMING THIS CODE RUN ON SENSE SERVER)
	//Seesion Cookie name aligned with the setting below


    //CHANGE ALSO THE IP IN THE FRONT-END IN spotify-session-app.js (line 31)

    emptyAppID:"82df6f83-a835-4587-ab8f-76c20155dbfc",
    hostname:'localhost',
    cookieName: 'X-sess',
    directory:'CUSTOM',
	prefix:'/ano/',

	
    certificates: {
        pfx:path.resolve(certPath, 'client.pfx'),
        client: path.resolve(certPath, 'client.pem'),
        root: path.resolve(certPath, 'root.pem'),
        client_key: path.resolve(certPath, 'client_key.pem'),
    }


});

module.exports = config;