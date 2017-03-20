var spot=require('./spotify');

spot.getAlbums().then((data)=>{
    console.log("TEST",data);
});
