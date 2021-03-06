function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while (e = r.exec(q)) {
        hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
}
//Turn it to false if running all local with Qlik Sense Desktop
runDesktop = true;
$.post('main', {auth: getHashParams().access_token}, function (data) {
    if (data.redirect) {
        window.location = "/";
        return;
    }
    var sessionApp;

    var config;
    if (runDesktop) {
        config = {

            host: 'localhost',
            prefix: '/',
            port: 4848,
            isSecure: false
        }
    }else{
        config = {
            //Change to Qlik Server IP or hostname
            host: 'xxx.xxx.xxx.xxx',
            prefix: '/ano/',
            port: 80,
            isSecure: false
        }
    }

    require.config({
        baseUrl: (config.isSecure ? "https://" : "http://" ) + config.host + (config.port ? ":" + config.port : "" ) + config.prefix + "resources"
    });


    require(["js/qlik"], function (qlik) {

        function post(dt) {
            var url = 'main';
            $.post(url, dt, function (data) {
                if (!data.app) {
                    alert("Spotify API has a rate limit, error could related (or not :-) ) : " + JSON.stringify(data));
                    return;
                }
                var allOb = [];


                sessionApp = qlik.sessionAppFromApp("engineData", config);
                sessionApp.getAppLayout(function (layout) {
                    $("#title").html("<b>Analyse playlists for " + layout.qTitle + "</b> (Max 20)");
                })
                $(".content").css('overflow', 'hidden');
                $(".loaded").css('display', 'flex');

                allOb.push(sessionApp.visualization.create("table", [{
                    "qDef": {
                        qFieldDefs: ["playName"],
                        qFallbackTitle: "Playlist"
                    }
                }], {}).then((table)=> {
                    table.show("QV01");
                }))

                allOb.push(sessionApp.visualization.create("table", [{
                    "qDef": {
                        qFieldDefs: ["genre"],
                        qFallbackTitle: "Genre"
                    }
                }], {}).then((table)=> {
                    table.show("QV02");
                }));
                allOb.push(sessionApp.visualization.create("kpi", [{
                    "qDef": {
                        qDef: "=FirstSortedValue(distinct artistName,-Aggr(count(trackName),artistName,playName,genre))",
                        qFallbackTitle: 'Your Prefered Artist',
                        fontSize: "S",
                        textAlign: "right"
                    }
                }], {}).then((table)=> {
                    table.show("QV03");
                }));
                allOb.push(sessionApp.visualization.create("kpi", [{
                    "qDef": {
                        qDef: "=Count(trackName)",
                        qFallbackTitle: 'Total Tracks'
                    }, fontSize: "S", textAlign: "right"
                }], {}).then((table)=> {
                    table.show("QV03b");
                }));
                allOb.push(sessionApp.visualization.create('linechart',
                    ["artistName", {"qDef": {qDef: "=Avg(popularity)", qFallbackTitle: 'Avg Popularity'}}],
                    {
                        "title": "Artists popularity",
                        "dataPoint": {
                            "show": true,
                            "showLabels": true
                        },
                        "color": {
                            "auto": false,
                            "paletteColor": {
                                "index": 2
                            }
                        }
                    }
                )
                    .then((table) => {
                        table.show("QV04");
                    }));
                allOb.push(sessionApp.visualization.create(
                    "barchart", [{
                        "qDef": {
                            qFieldDefs: ["artistName"],
                            qFallbackTitle: "Artist"
                        }
                    }, {"qDef": {qDef: "Count( distinct trackName)", qFallbackTitle: '# of Tracks'}}],
                    {
                        "color": {
                            "auto": false,
                            "paletteColor": {
                                "index": 2
                            }
                        }
                    }
                )
                    .then((table) => {
                        table.show("QV05");
                    }));

                allOb.push(sessionApp.visualization.create(
                    "table", [{
                        qDef: {
                            qFieldDefs: ["artistName"],
                            qFallbackTitle: "Artist"
                        }
                    },
                        {
                            qDef: {
                                qFieldDefs: ["trackName"],
                                qFallbackTitle: "Track"
                            }
                        }
                        ,
                        {
                            qDef: {
                                qFieldDefs: ["url"],
                                qFallbackTitle: "",
                                representation: {type: "url", urlLabel: "OPEN"}
                            }
                        }],
                    {
                        "title": {qStringExpression: {qExpr: "='Tracks for selected playlist (' & Count(distinct playName) & ')'"}}
                    }
                )
                    .then((table)=> {
                        table.show("QV06");
                    }));
                Promise.all(allOb).then(()=> {
                    $(".spin").remove();
                    $(".content").css('overflow', 'auto');
                    $(".loaded").animate({
                        opacity: 1
                    }, 2000, function () {
                    });
                })
            }).fail(function (e) {
                alert(JSON.stringify(e));
            })
        }

        //var global = qlik.getGlobal(config);
        //global.getAuthenticatedUser(function(reply){
        //	global.session.close()
        //var user=reply.qReturn.split(';')[1].split('=')[1];
        post({template: "new"});
        //});
        $("[data-qcmd]").on('click', function () {
            var $element = $(this);
            switch ($element.data('qcmd')) {
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
        });
        $('.dis').click(()=> {
            var app = qlik.currApp();
            if (app) app.global.session.close();
        })

    });
})


