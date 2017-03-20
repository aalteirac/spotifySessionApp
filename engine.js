const enigma = require('enigma.js');
const qixSchema = require('./node_modules/enigma.js/schemas/qix/3.1/schema.json');
const WebSocket = require("ws");
const promise = require('q');
const configuration = require('./config');
const fs=require('fs');

function getConfig(cook,app){
    return {
        schema: qixSchema,
        session: {
            identity:"sessionapp",
            host: configuration.hostname,
			prefix:configuration.prefix,
            unsecure:true
        },
        createSocket: (url) => {
            return new WebSocket(url, {
                headers: {
                    Cookie: cook,
                }
            });
        }
    }
}
function unique(a) {
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i].qName === a[j].qName)
                a.splice(j--, 1);
        }
    }
    return a;
};

function getFields(options) {
    return new Promise(function (resolve, reject) {
        enigma.getService('qix', getConfig(options.cookie)).then((qix) => {
            const g = qix.global;
            var curApp;
            g.openDoc(options.appId).then(app => {
                    curApp = app;
                    return app.getTablesAndKeys({"qcx": 1000,"qcy": 1000},{"qcx": 0,"qcy": 0},30, false, false)
                }
            ).then(function(rep){
                    var fields=[];
                    rep.qtr.map(function(el){return fields=fields.concat(el.qFields)})
                    fields=unique(fields);
                    resolve(fields);
                }
            ).catch((err)=>{
                    console.log("ERROR on getfield", err);
                    reject(err);
                }
            )
        })
    });
}

function getApps(options) {
    return new Promise(function (resolve, reject) {
        enigma.getService('qix', getConfig(options.cookie)).then((qix) => {
            const g = qix.global;
            g.getDocList().then(lst => {
                    resolve(lst);
                }
            );
        }).catch((err)=>{
                console.log("ERROR on getapps", err);
                reject(err);
            }
        )
    });
}

function setSelection(options) {
    return new Promise(function (resolve, reject) {
        enigma.getService('qix', getConfig(options.cookie)).then((qix) => {
            const g = qix.global;
            var curApp;
            g.openDoc(options.appId).then(app => {
                    curApp = app;
                    return app.abortModal(true);
                }
            ).then(()=>{
                    curApp.clearAll();
                    return curApp.getField(options.fieldName);
                }
            ).then((field) => {
                    return field.select(options.value,false,true);
                }
            ).then(()=> {
                    curApp.session.close();
                    resolve();
                }
            ).catch((err)=>{
                    console.log("ERROR on selection", err);
                    reject(err);
                }
            );
        })
    });
}

function clearAll(options) {
    return new Promise(function (resolve, reject) {
        enigma.getService('qix', getConfig(options.cookie)).then((qix) => {
            const g = qix.global;
            var curApp;
            g.openDoc(options.appId).then(app => {
                    curApp = app;
                    return app.abortModal(true);
                }
            ).then(()=>{
                    return curApp.clearAll();
                }
            ).then(()=> {
                    curApp.session.close();
                    resolve();
                }
            ).catch((err)=>{
                    console.log("ERROR on clearall", err);
                    reject(err);
                }
            );
        })
    });
}

function createSessionApp(options){
    return new Promise(function (resolve, reject) {
        enigma.getService('qix', getConfig(options.cookie,options.template)).then((qix) => {
			return qix.global.createSessionAppFromApp(options.template).then((doc)=>{
				console.log("app creation");
				return doc;
			},()=>{
				console.log("existing App reuse");
				return qix.global.getActiveDoc();
			});
        }).then((doc)=>{
            return doc.setScript(options.script).then(
                ()=>{ return doc});
        }).then((doc)=>{
			return doc.doReload();
        }).then((result)=>{
            if(result)
                resolve({app:options.template,cookie:options.cookie});
            else
                reject("Reload Failed")
        }).catch((err)=>{
                console.log("ERROR on createSessionApp", err);
                reject(err);
            }
        );
    })
}

function createSessionAppFromScratch(options){
    return new Promise(function (resolve, reject) {
        enigma.getService('qix', getConfig(options.cookie,'engine')).then((qix) => {
			return qix.global.session.close().then(()=>{
				return enigma.getService('qix', getConfig(options.cookie,'engine')).then((qix) => {
					return qix.global.createSessionApp().then((doc)=>{
						return doc;
					},(doc)=>{
						return qix.global.getActiveDoc();
					});
				})
			})
        }).then((doc)=>{
			doc.setAppProperties({qTitle:options.appName});
            return doc.setScript(options.script).then(
                ()=>{ return doc});
        }).then((doc)=>{
			return doc.doReload();
        }).then((result)=>{
            if(result)
                resolve({app:options.template,cookie:options.cookie});
            else
                reject("Reload Failed")
        }).catch((err)=>{
                console.log("ERROR on createSessionApp", err);
                reject(err);
            }
        );
    })
}

module.exports = {
    setSelection: setSelection,
    getApps:getApps,
    getFields: getFields,
    clearAll: clearAll,
    createSessionApp:createSessionApp,
    createSessionAppFromScratch:createSessionAppFromScratch
};
