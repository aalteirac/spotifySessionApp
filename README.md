# spotifySessionApp
Qlik Session App sample, based on Spotify information

Requires a Qlik Sense Enterprise Server or Qlik Sense Desktop >=3.2, virtual proxy minimal settings provided in the code (config.js)

In config.js you'll find information to run it, try first with Qlik Sense Desktop, will help you to understand the flow and will be easier to setup sense server next if needed.

then 
    runDesktop:true,
    //SPOTIFY API KEYS, GO TO THE DEV WEB SITE TO GET THEM
    clientId: 'XXXXXXX',
    clientSecret: 'XXXXXXX',

it's enough to run it on Qlik Sense Desktop

You'll need to  setup a spotify developer account to get your SPOTIFY API SECRETS : https://developer.spotify.com/web-api/

Setup a new application on that site, only required thing is the REDIRECT URIs white list: http://localhost:3002/spotify-session-app.html (change 'localhost' to you Qlik Sense server if not running Sense Desktop)

Nodejs and npm install needed

Thanks to José.F and Ann-Louise.A for original idea and implementation ! WTK rocks !

![alt text](https://raw.githubusercontent.com/aalteirac/spotifySessionApp/27201dacd1ce35f144ba318e17303729d1921036/thumb.png "screen-shot")
