const promise = require('q');
const SpotifyWebApi = require('spotify-web-api-node');
const Halyard=require('./lib/halyard');
const sampleData=require('./lib/spotSampleData');
const conf = require('./config');


var credentials = {
    clientId: conf.clientId,
    clientSecret: conf.clientSecret
};

function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function getUser(tk){
	return new Promise( function ( resolve, reject ) {
		var spotifyApi = new SpotifyWebApi( credentials );
		spotifyApi.setAccessToken( tk);
		spotifyApi.getMe().then(function (data) {
			resolve(userID=data.body.id);
		},(e)=>{
			reject (e);
		})
	})
}

function getTracks(spotifyApi,userId,playlistId,offset,res){
    return new Promise( function ( resolve, reject ) {
			spotifyApi.getPlaylistTracks(userId, playlistId, {offset: offset}).then(function (data) {
				res = res.concat(data.body.items);
				if (data.body.next != null) {
					resolve([res, getParameterByName('offset', data.body.next)])
				}
				else {
					resolve([res]);
				}
			}, (e)=> {
				reject(e);
			})
    }).then((result)=>{
            if(result[1]){
                return getTracks(spotifyApi,userId,playlistId,result[1],result[0]);
            }
            else{
                return res;
            }
        })
}

function getBasic(tk){
	return new Promise( function ( resolve, reject ) {
		var spotifyApi = new SpotifyWebApi( credentials );
		var userID,playlistName;
		spotifyApi.setAccessToken( tk);
		spotifyApi.getMe().then(function (data) {
			userID=data.body.id;
			var userName=data.body.display_name==null?data.body.id:data.body.display_name;
			spotifyApi.getUserPlaylists(userID).then( function ( data ) {
				if (data.body.items.length==0) {
					reject({error:"no public playlist found, create one or turn an existing to public"})}
				else{
					//Can reach the Spotify API rate limit very quickly :-(
					var allPlaylist=[]
					var allP=data.body.items.map( function ( pl ) {
						return spotifyApi.getPlaylist( pl.owner.id, pl.id )
					})
					var tracks=[];
					var allPtracks=[]
					Promise.all(allP).then((allData)=>{
						var artistsList = [];
						allData.forEach( function ( play ) {
									
							if(play.body.tracks.next){
								var curP=getTracks(spotifyApi,play.body.owner.id,play.body.id,getParameterByName('offset',play.body.tracks.next),play.body.tracks.items);
								allPtracks.push(curP);
								curP.then((d)=>{
									//console.log(play.body.name,d.length);
									artistsList.push.apply(artistsList,
										d.map( function ( el ) {
											allPlaylist.push({playName:play.body?play.body.name:'-',trackName:el.track?el.track.name:'-'})
											if(el.track){
												tracks.push({trackName:el.track.name,artistName:el.track.artists.length>0? el.track.artists[0].name:'-',url:el.track.external_urls.spotify})
												return el.track.artists[0].id;
											}
											} )
									)
								})
							}
							else{
								artistsList.push.apply(artistsList,
									play.body.tracks.items.map( function ( el ) {
										allPlaylist.push({playName:play.body?play.body.name:'-',trackName:el.track?el.track.name:'-'})
										if(el.track){
											tracks.push({trackName:el.track.name,artistName:el.track.artists.length>0? el.track.artists[0].name:'-',url:el.track.external_urls.spotify})
											return el.track.artists[0].id;
										}
										} )
								)
							}
						})
						Promise.all(allPtracks).then(()=>{
							artistsList=artistsList.filter( function ( elem, index, self ) {
									return index === self.findIndex( function ( x ) { return x === elem } );
							} );
							artistsList=artistsList.filter( function ( elem ) {
									return typeof(elem)!='undefined';
							} );
							//console.log("#tracks",tracks.length);
							getArtistsData( spotifyApi, artistsList ).then( function ( artists ) {
								var halyard = new Halyard();
								halyard.addTable( allPlaylist, "Playlist" );
								halyard.addTable( tracks, "Tracks" );
								halyard.addTable( artists, "Artist" );
								resolve( {name:userName,script:halyard.getScript(),user:userID} );
							},(e)=>{
								reject ({error:"Error getting artist data",stack:e});
							});
						})
					},(e)=>{
					reject ({error:"Error getting the playlists"});
					})
					//simplified version, only the first public playlist
					/* playlistName=data.body.items[0].name;
					spotifyApi.getPlaylist( data.body.items[0].owner.id, data.body.items[0].id ).then((data)=>{
						var artistsList = data.body.tracks.items.map( function ( el ) {
							return el.track.artists[0].id;
						} ).filter( function ( elem, index, self ) {
							return index === self.findIndex( function ( x ) { return x === elem } );
						} );
						getArtistsData( spotifyApi, artistsList ).then( function ( artists ) {
							getAllArtistAlbums( spotifyApi, artistsList ).then( function ( albums ) {
								var halyard = new Halyard();
								halyard.addTable( albums, "Album" );
								halyard.addTable( artists, "Artist" );
								resolve( {name:playlistName,script:halyard.getScript(),user:userID} );
							} );
						} );
					},(e)=>{
					reject ({error:"Error getting the first playlist"});
					}) */
					
				}	
			},(e)=>{
				reject ({error:"Error getting user playlist"});
			});
		},(e)=>{
			reject ({error:"Error getting user information"});
		})
	});
}


function reflect(promise){
    return promise.then(function(v){ return {v:v, status: "resolved" }},
                        function(e){ return {e:e, status: "rejected" }});
}

function getArtistsData ( api, list ) {
	return new Promise( function ( resolve , reject ) {
		var i,j,temparray,chunk = 50;
		var artists=[];
		var allP=[];
		for (i=0,j=list.length; i<j; i+=chunk) {
			temparray = list.slice(i,i+chunk);
			allP.push(api.getArtists(temparray))
		}
		
		Promise.all(allP.map(reflect)).then((data)=>{
			var success = data.filter(x => x.status === "resolved");
			var failed = data.filter(x => x.status === "rejected");
			success.forEach( function ( artist ) {
				artists = artists.concat( artist.v.body.artists);
			} );
			var allArtists = artists.map( function ( el ) {
				return {
					artistId: el.id,
					artistName: el.name,
					genre: el.genres[0],
					image: el.images[0],
					popularity: el.popularity
				}
			} );
			
			resolve( allArtists );
		},(e)=>{
			reject (e);
		})
	})
}

function getAllArtistAlbums ( api, list ) {
	return new Promise( function ( resolve ,reject ) {
		var defList = list.map( function ( el ) {
				return api.getArtistAlbums( el, {album_type: "album",limit:50} )
		} );
		Promise.all( defList ).then( function ( data ) {
			var albums = [];
			data.forEach( function ( artist ) {
				albums = albums.concat( artist.body.items );
			} );
			albums = albums.map( function ( el ) {
				return {
					albumId: el.id,
					albumName: el.name,
					artistId: el.artists[0].id,
					artistName: el.artists[0].name,
					url:el.external_urls.spotify,
					imageUrl: el.images[0]?el.images[0].url:""
				}
			} );
			resolve( albums );
		} ,(e)=>{
			reject (e);
		});
	} );
}

function search(q){
    return new Promise( function ( resolve, reject ) {
        var spotifyApi = new SpotifyWebApi(credentials);
        spotifyApi.search(encodeURIComponent(q).replace(/%20/g, "+"),["album"],{ limit : 50}).then( function ( data ) {
            var albums = data.body.albums.items.map( function ( el ) {
                return {
                    id: el.id,
                    name: el.name,
                    image: el.images[0].url,
                    url: el.external_urls.spotify,
                    artist: el.artists[0].name
                }
            } );
            resolve( generateScript( albums ) );
        } ).catch( function ( err ) {
            reject( err );
        } );
    } );
}
function getNewReleases(){
    return new Promise( function ( resolve, reject ) {
        var spotifyApi = new SpotifyWebApi(credentials);
        spotifyApi.getNewReleases( ).then( function ( data ) {
            var albums = data.body.albums.map( function ( el ) {
                return {
                    id: el.id,
                    name: el.name,
                    popularity: el.popularity,
                    release_date: el.release_date,
                    artist: el.artists[0].id
                }
            } );
            resolve( generateScript( albums ) );
        } ).catch( function ( err ) {
            reject( err );
        } );
    } );
}
function getAlbums () {
    return new Promise( function ( resolve, reject ) {
        var spotifyApi = new SpotifyWebApi(credentials);
        spotifyApi.getAlbums( sampleData.data ).then( function ( data ) {
            var albums = data.body.albums.map( function ( el ) {
                return {
                    id: el.id,
                    name: el.name,
                    popularity: el.popularity,
                    release_date: el.release_date,
                    artist: el.artists[0].id
                }
            } );
            resolve( generateScript( albums ) );
        } ).catch( function ( err ) {
            reject( err );
        } );
    } );
}

function generateScript ( data ) {
    var table = new Halyard.Table( data, "Album" );
    return table.getScript();
}

module.exports = {
    getAlbums:getAlbums,
    getNewReleases:getNewReleases,
    search:search,
	getBasic:getBasic,
	getUser:getUser,
};

