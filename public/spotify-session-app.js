function getUrlVars () {
	var vars = [], hash;
	var hashes = window.location.href.slice( window.location.href.indexOf( '?' ) + 1 ).split( '&' );
	for ( var i = 0; i < hashes.length; i++ ) {
		hash = hashes[i].split( '=' );
		vars.push( hash[0] );
		vars[hash[0]] = hash[1];
	}
	return vars;
}

function updateKpi ( value ) {
	$( ".mainstream-value" ).text( value );
	$( ".bar" ).css( "height", "calc(" + value + "% - 2px)" );

	if ( value < 17 ) {
		$( ".mainstream-icon" ).attr( "src", "images/tape-icon.png" );
		$( ".mainstream-label" ).text( "Not at all mainstream" );
	} else if ( value < 34 ) {
		$( ".mainstream-icon" ).attr( "src", "images/cow-icon.png" );
		$( ".mainstream-label" ).text( "Not really mainstream" );
	} else if ( value < 51 ) {
		$( ".mainstream-icon" ).attr( "src", "images/rap-icon.png" );
		$( ".mainstream-label" ).text( "Somewhat mainstream" );
	} else if ( value < 68 ) {
		$( ".mainstream-icon" ).attr( "src", "images/headset-icon.png" );
		$( ".mainstream-label" ).text( "Just right mainstream" );
	} else if ( value < 85 ) {
		$( ".mainstream-icon" ).attr( "src", "images/fire-icon.png" );
		$( ".mainstream-label" ).text( "Very mainstream" );
	} else if ( value >= 85 ) {
		$( ".mainstream-icon" ).attr( "src", "images/star.gif-c200" );
		$( ".mainstream-label" ).text( "Super mainstream" );
	}
}

//Turn it to false if running all local with Qlik Sense Desktop
runDesktop = true;
$.post( 'main', {auth: true, code: getUrlVars().code}, function ( data ) {
	if ( data.redirect ) {
		window.location = "/";
		return;
	}
	if ( data.user ) {
		$( "#user-name" ).text( data.user.id );
		//todo: @add change profile image (data.user.images (might happen that there is no profile image. we need a default one.)
	}
	var sessionApp;

	$( ".send-score" ).click( function () {
		$( ".toaster" ).addClass( 'show' );
		$( '.toaster' ).fadeIn( 1000 );
		setTimeout( function () {
			$( '.toaster' ).fadeOut( 1000 );
			setTimeout( function () { $( ".toaster" ).removeClass( 'show' ); }, 1000 );
		}, 4000 );
	} );

	$( ".high-score" ).click( function () {
		// open highscore page
	} );

	var config;
	if ( runDesktop ) {
		config = {

			host: 'localhost',
			prefix: '/',
			port: 4848,
			isSecure: false
		}
	} else {
		config = {
			//Change to Qlik Server IP or hostname
			host: '10.76.224.67',
			prefix: '/ano/',
			port: 80,
			isSecure: false
		}
	}

	require.config( {
		baseUrl: (config.isSecure ? "https://" : "http://" ) + config.host + (config.port ? ":" + config.port : "" ) + config.prefix + "resources"
	} );

	$( ".dis" ).click( () => {
		var allcookies = document.cookie;

		localStorage.clear();
		localStorage.removeItem( "connect.sid" );

		document.cookie.split( ";" ).forEach( function ( c ) {
			if ( c.name == 'connect.sid' ) {
				document.cookie = c.replace( /^ +/, "" ).replace( /=.*/, "=;expires=" + new Date().toUTCString() + ";path=/" );
			}
		} );
	} );

	require( ["js/qlik"], function ( qlik ) {

		function post ( dt ) {
			var url = 'main';
			$.post( url, dt, function ( data ) {
				if ( !data.app ) {
					alert( "Spotify API has a rate limit, error could related (or not :-) ) : " + JSON.stringify( data ) );
					return;
				}
				var allOb = [];

				sessionApp = qlik.sessionAppFromApp( "engineData", config );
				sessionApp.getAppLayout( function ( layout ) {
					$( "#title" ).html( "<b>Analyse playlists for " + layout.qTitle + "</b> (Max 20)" );
				} )
				$( ".content" ).css( 'overflow', 'hidden' );
				$( ".loaded" ).css( 'display', 'flex' );

				//Update KPI
				sessionApp.visualization.create( "table", [{
					"qDef": {
						qFieldDefs: ["artistName"],
						qFallbackTitle: "Artist"
					}
				}], {} ).then( ( table ) => {
					table.show( "QV01" );
				} );
				sessionApp.visualization.create( "kpi", [{
					"qDef": {
						qDef: "=Avg(popularity)"
					}
				}], {} ).then( function ( reply ) {
					updateKpi( reply.model.layout.qHyperCube.qDataPages[0].qMatrix[0][0].qNum );
				} );

				// allOb.push(sessionApp.visualization.create("table", [{
				//     "qDef": {
				//         qFieldDefs: ["playName"],
				//         qFallbackTitle: "Playlist"
				//     }
				// }], {}).then((table)=> {
				//     table.show("QV01");
				// }))
				//
				// allOb.push(sessionApp.visualization.create("table", [{
				//     "qDef": {
				//         qFieldDefs: ["genre"],
				//         qFallbackTitle: "Genre"
				//     }
				// }], {}).then((table)=> {
				//     table.show("QV02");
				// }));
				// allOb.push(sessionApp.visualization.create("kpi", [{
				//     "qDef": {
				//         qDef: "=FirstSortedValue(distinct artistName,-Aggr(count(trackName),artistName,playName,genre))",
				//         qFallbackTitle: 'Your Prefered Artist',
				//         fontSize: "S",
				//         textAlign: "right"
				//     }
				// }], {}).then((table)=> {
				//     table.show("QV03");
				// }));
				// allOb.push(sessionApp.visualization.create("kpi", [{
				//     "qDef": {
				//         qDef: "=Count(trackName)",
				//         qFallbackTitle: 'Total Tracks'
				//     }, fontSize: "S", textAlign: "right"
				// }], {}).then((table)=> {
				//     table.show("QV03b");
				// }));
				// allOb.push(sessionApp.visualization.create('linechart',
				//     ["artistName", {"qDef": {qDef: "=Avg(popularity)", qFallbackTitle: 'Avg Popularity'}}],
				//     {
				//         "title": "Artists popularity",
				//         "dataPoint": {
				//             "show": true,
				//             "showLabels": true
				//         },
				//         "color": {
				//             "auto": false,
				//             "paletteColor": {
				//                 "index": 2
				//             }
				//         }
				//     }
				// )
				//     .then((table) => {
				//         table.show("QV02");
				//     }));
				// allOb.push(sessionApp.visualization.create(
				//     "barchart", [{
				//         "qDef": {
				//             qFieldDefs: ["artistName"],
				//             qFallbackTitle: "Artist"
				//         }
				//     }, {"qDef": {qDef: "Count( distinct trackName)", qFallbackTitle: '# of Tracks'}}],
				//     {
				//         "color": {
				//             "auto": false,
				//             "paletteColor": {
				//                 "index": 2
				//             }
				//         }
				//     }
				// )
				//     .then((table) => {
				//         table.show("QV05");
				//     }));

				// allOb.push(sessionApp.visualization.create(
				//     "table", [{
				//         qDef: {
				//             qFieldDefs: ["artistName"],
				//             qFallbackTitle: "Artist"
				//         }
				//     },
				//         {
				//             qDef: {
				//                 qFieldDefs: ["trackName"],
				//                 qFallbackTitle: "Track"
				//             }
				//         }
				//         ,
				//         {
				//             qDef: {
				//                 qFieldDefs: ["url"],
				//                 qFallbackTitle: "",
				//                 representation: {type: "url", urlLabel: "OPEN"}
				//             }
				//         }],
				//     {
				//         "title": {qStringExpression: {qExpr: "='Tracks for selected playlist (' & Count(distinct playName) & ')'"}}
				//     }
				// )
				//     .then((table)=> {
				//         table.show("QV06");
				//     }));
				// Promise.all(allOb).then(()=> {
				//     $(".spin").remove();
				//     $(".content").css('overflow', 'auto');
				//     $(".loaded").animate({
				//         opacity: 1
				//     }, 2000, function () {
				//     });
				// })
			} ).fail( function ( e ) {
				alert( JSON.stringify( e ) );
			} )
		}

		//var global = qlik.getGlobal(config);
		//global.getAuthenticatedUser(function(reply){
		//	global.session.close()
		//var user=reply.qReturn.split(';')[1].split('=')[1];
		post( {code: getUrlVars().code} );
		//});
		$( "[data-qcmd]" ).on( 'click', function () {
			var $element = $( this );
			switch ( $element.data( 'qcmd' ) ) {
				//app level commands
				case 'clearAll':
					sessionApp.clearAll();
					break;
				case 'back':
					sessionApp.back();
					break;
				case 'forward':
					sessionApp.forward();
					break;
			}
		} );
		$( ".dis" ).click( () => {

			var app = qlik.currApp();
			if ( app ) {
				app.global.session.close();
			}
			window.location = "/";
			return;
		} )

	} );
} );


