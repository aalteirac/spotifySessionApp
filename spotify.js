const promise = require( 'q' );
const SpotifyWebApi = require( 'spotify-web-api-node' );
const Halyard = require( './lib/halyard' );
const sampleData = require( './lib/spotSampleData' );
const conf = require( './config' );

var credentials = {
	clientId: conf.clientId,
	clientSecret: conf.clientSecret,
	redirectUri: (conf.runDesktop) ? "http://localhost:3010/spotify-session-app.html" : "http://10.76.224.67:3010/spotify-session-app.html"
};

let spotifyApi;
let userData;

function getParameterByName ( name, url ) {
	if ( !url ) {
		url = window.location.href;
	}
	name = name.replace( /[\[\]]/g, "\\$&" );
	var regex = new RegExp( "[?&]" + name + "(=([^&#]*)|&|#|$)" ),
		results = regex.exec( url );
	if ( !results ) {
		return null;
	}
	if ( !results[2] ) {
		return '';
	}
	return decodeURIComponent( results[2].replace( /\+/g, " " ) );
}

function getUser ( code ) {
	return new Promise( function ( resolve, reject ) {
		spotifyApi = new SpotifyWebApi( credentials );
		spotifyApi.authorizationCodeGrant( code ).then( function ( data ) {
			spotifyApi.setAccessToken( data.body['access_token'] );
			spotifyApi.getMe().then( function ( reply ) {
				userData = reply.body;
				resolve( reply.body );
			}, ( e ) => {
				reject( e );
			} )
		} );
	} )
}

// function getTracks ( spotifyApi, userId, playlistId, offset, res ) {
// 	return new Promise( function ( resolve, reject ) {
// 		spotifyApi.getPlaylistTracks( userId, playlistId, {offset: offset} ).then( function ( data ) {
// 			res = res.concat( data.body.items );
// 			if ( data.body.next != null ) {
// 				resolve( [res, getParameterByName( 'offset', data.body.next )] )
// 			}
// 			else {
// 				resolve( [res] );
// 			}
// 		}, ( e ) => {
// 			reject( e );
// 		} )
// 	} ).then( ( result ) => {
// 		if ( result[1] ) {
// 			return getTracks( spotifyApi, userId, playlistId, result[1], result[0] );
// 		}
// 		else {
// 			return res;
// 		}
// 	} )
// }

function getBasic ( tk, code ) {
	return new Promise( function ( resolve, reject ) {
		spotifyApi.getFollowedArtists()
			.then( function ( data ) {
					let artists = data.body.artists.items;
					if ( artists.length > 0 ) {
						let artists = data.body.artists.items.map( function ( el ) {
							return {
								artistId: el.id,
								artistName: el.name,
								genres: el.genres[0], //todo: consider to take more than one genre
								image: el.images[0], //todo: consider to take more than one image
								popularity: el.popularity,
								followers: el.followers.total
							}
						} );
						let halyard = new Halyard();
						halyard.addTable( artists, "Artist" );
						resolve( {artists: artists, script: halyard.getScript(), user: userData} );
					} else {
						//If no artists we take popularity index by first public playlist
						spotifyApi.getUserPlaylists().then( function ( data ) {
							let firstPlaylist ={
								id: data.body.items[0].id,
								owner: data.body.items[0].owner.id
							};

							spotifyApi.getPlaylist( firstPlaylist.owner, firstPlaylist.id ).then( function ( data ) {
								let artistsList = data.body.tracks.items.map( function ( el ) {
									return el.track.artists[0].id;
								} ).filter( function ( elem, index, self ) {
									return index === self.findIndex( function ( x ) { return x === elem } );
								} );
								getArtistsData( spotifyApi, artistsList ).then( function ( artists ) {
									var halyard = new Halyard();
									halyard.addTable( artists, "Artist" );
									resolve( {artists: artists, script: halyard.getScript(), user: userData} );
								} )
							},(err)=>{
								console.log(err)
							} );
						} );
					}
				}
				,
				function ( err ) {
					console.error( err );
					reject( err );
				}
			)
		;
	} )
		;
}

function reflect ( promise ) {
	return promise.then( function ( v ) { return {v: v, status: "resolved"}},
		function ( e ) { return {e: e, status: "rejected"}} );
}

function getArtistsData ( api, list ) {
	return new Promise( function ( resolve, reject ) {
		var i, j, temparray, chunk = 50;
		var artists = [];
		var allP = [];
		for ( i = 0, j = list.length; i < j; i += chunk ) {
			temparray = list.slice( i, i + chunk );
			allP.push( api.getArtists( temparray ) )
		}

		Promise.all( allP.map( reflect ) ).then( ( data ) => {
			var success = data.filter( x => x.status === "resolved" );
			var failed = data.filter( x => x.status === "rejected" );
			success.forEach( function ( artist ) {
				artists = artists.concat( artist.v.body.artists );
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
		}, ( e ) => {
			reject( e );
		} )
	} )
}

// function getAllArtistAlbums ( api, list ) {
// 	return new Promise( function ( resolve, reject ) {
// 		var defList = list.map( function ( el ) {
// 			return api.getArtistAlbums( el, {album_type: "album", limit: 50} )
// 		} );
// 		Promise.all( defList ).then( function ( data ) {
// 			var albums = [];
// 			data.forEach( function ( artist ) {
// 				albums = albums.concat( artist.body.items );
// 			} );
// 			albums = albums.map( function ( el ) {
// 				return {
// 					albumId: el.id,
// 					albumName: el.name,
// 					artistId: el.artists[0].id,
// 					artistName: el.artists[0].name,
// 					url: el.external_urls.spotify,
// 					imageUrl: el.images[0] ? el.images[0].url : ""
// 				}
// 			} );
// 			resolve( albums );
// 		}, ( e ) => {
// 			reject( e );
// 		} );
// 	} );
// }

function search ( q ) {
	return new Promise( function ( resolve, reject ) {
		var spotifyApi = new SpotifyWebApi( credentials );
		spotifyApi.search( encodeURIComponent( q ).replace( /%20/g, "+" ), ["album"], {limit: 50} ).then( function ( data ) {
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
function getNewReleases () {
	return new Promise( function ( resolve, reject ) {
		var spotifyApi = new SpotifyWebApi( credentials );
		spotifyApi.getNewReleases().then( function ( data ) {
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
		var spotifyApi = new SpotifyWebApi( credentials );
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
	getAlbums: getAlbums,
	getNewReleases: getNewReleases,
	search: search,
	getBasic: getBasic,
	getUser: getUser,
};

