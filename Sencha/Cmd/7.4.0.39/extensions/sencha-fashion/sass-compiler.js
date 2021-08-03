/*
 * Copyright (c) 2012-2015. Sencha Inc.
 */

var SassBuilder = {
    styleEl: undefined,

    // an id provided by the Sass responder to indicate that this client
    // is only monitoring the set of update messages and not part of the build mechanism.
    // used by browsers for live-update monitoring of the sass build page
    updateClientId: undefined,

    captureWidgetManifest: window['captureWidgetManifest'],
    capturePageImage: window['capturePageImage'],
    isPhantomJs: /phantomjs/.test(window.location),

    logs: [],

    exception: null,
    invalidates: 0,
    saveFileUpdated: false,
    skipNextBuild: 0,

    getBuilder: function(){
        if(!this.builder) {
            var manifest = (Ext.manifest && Ext.manifest.fashion) || {};
            this.builder = new Fashion.Builder({
                context: Fashion.merge({
                    libraries: {
                        compass: "/~cmd/extensions/sencha-fashion/lib/compass/stylesheets/",
                        blueprint: "/~cmd/extensions/sencha-fashion/lib/blueprint/stylesheets/"
                    }
                }, manifest)
            });
        }
        return this.builder;
    },

    resolveUrl: function(url) {
        var a = document.createElement('a');
        a.href = url;
        return a.href;
    },

    doRequest: function (options) {
        var url = options.url,
            method = options.method || 'GET',
            data = options.data || null,
            async = options.async !== false,
            onComplete = options.onComplete,
            onError = options.onError,
            scope = options.scope || this,
            params = options.params,
            queryParams = [],
            queryParamStr, xhr, content;

        if (params) {
            for (var name in params) {
                queryParams.push(name + "=" + encodeURIComponent(params[name]));
            }

            queryParamStr = queryParams.join('&');

            if (queryParamStr !== '') {
                url = url + '?' + queryParamStr;
            }
        }

        if (typeof XMLHttpRequest !== 'undefined') {
            xhr = new XMLHttpRequest();
        } else {
            xhr = new ActiveXObject('Microsoft.XMLHTTP');
        }

        //console.log("requesting url : " + url);

        xhr.open(method, url, async);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                try {
                    if (xhr.status === 200) {
                        if (onComplete) {
                            onComplete.apply(scope, [options, xhr]);
                        }
                    } else {
                        if (onError) {
                            onError.apply(scope, [options, xhr]);
                        }
                    }
                } finally {
                    //advanceRequestQueue();
                }
            }
        };

        xhr.onerror = onError;

        if (typeof data === "function") {
            data = data();
        }

        if (typeof data !== 'string') {
            data = JSON.stringify(data);
        }

        xhr.send(data);

        if (!async) {
            content = xhr.responseText;
            return content;
        }
    },

    onBuildSassFile: function(update){
        var path = update.path,
            basePath = update.outputPath,
            builder = SassBuilder.getBuilder();

        if (SassBuilder.invalidates) {
            SassBuilder.saveFileUpdated = false;
            SassBuilder.skipNextBuild = 0;
        }

        if (SassBuilder.skipNextBuild) {
            Fashion.log("Skipping rebuild.");
            SassBuilder.skipNextBuild = SassBuilder.skipNextBuild - 1;
            Fashion.onAfterBuild(false);
            return false;
        }

        if (SassBuilder.saveFileUpdated) {
            Fashion.log("Applying save file updates.");
            SassBuilder.saveFileUpdated = false;
            Fashion.setVariables(Fashion.getSavedVariables(), null, false, true);
            Fashion.onAfterBuild(false);
            return false;
        }

        Fashion.log("Running sass build.");
        SassBuilder.saveFileUpdated = false;
        SassBuilder.invalidates = 0;
        if (basePath && (basePath.indexOf('\\') > -1)) {
            basePath = basePath.replace(/\\/g, '/');
        }

        // get rid of any trailing / chars
        if (basePath.charAt(basePath.length - 1) === '/') {
            basePath = basePath.substring(0, basePath.lastIndexOf('/'));
        }

        basePath = basePath.substring(0, basePath.lastIndexOf('/'));
        Fashion.Env.isBrowser = true;
        builder.getContext().basePath = basePath;
        builder.varSavePath = update.saveFilePath;
        builder.srcSavePath = update.uiPath;
        builder.sassNamespace = update.sassNamespace;
        
        builder.build(update, function(css, err, exportFn){
            if(SassBuilder.isBuildClient()) {
                console.log("saving generated css");
                var data = css;
                if(!data) {
                    data = ["/* */"]
                }

                data = {
                    content: data,
                    logs: SassBuilder.logs,
                    exception: SassBuilder.exception || err
                };

                SassBuilder.logs = [];
                SassBuilder.exception = undefined;

                SassBuilder.doRequest({
                    data: data,
                    params: {
                        clientId: SassBuilder.updateClientId
                    },
                    url: '/~sass/save',
                    method: 'POST'
                });
            }
            console.log("loading generated css");
            builder.injectCss(update.outputPath || path, css);
            console.log("css build complete");

            if(!SassBuilder.unblocked) {
                SassBuilder.unblocked = true;
                var unblocker = function(){
                    if (window['Ext'] && Ext.env && Ext.env.Ready) {
                        Ext.env.Ready.unblock();
                    } else {
                        setTimeout(unblocker, 1);
                    }
                };
                unblocker();
            }

            if (exportFn) {
                Fashion.css.reset();
                eval(exportFn);
            }

            Fashion.onAfterBuild();
        });
    },

    onInvalidateSassFile: function(update){
        var builder = SassBuilder.getBuilder(),
            path = builder.getSassFilePath(update.path),
            sassFile = builder.scripts[path];
        if(sassFile) {
            Fashion.info("invalidating sass file " + path);
            sassFile.invalidate();
            if (!update.isSaveFile) {
                SassBuilder.invalidates++;
            }
            else  {
                SassBuilder.saveFileUpdated = true;
            }
        } else {
            Fashion.info("SassFile not found for path " + path);
        }
    },

    onCaptureWidgetManifest: function(update) {
        if(SassBuilder.isBuildClient()) {
            var theFn = function(){
                var imageFile = update.imageFile,
                    manifestFile = update.manifestFile,
                    exception;
                try {
                    console.log("saving image file to " + imageFile);
                    SassBuilder.capturePageImage(imageFile);
                    console.log("saving widget data to " + manifestFile);
                    SassBuilder.captureWidgetManifest(manifestFile);
                } catch (err) {
                    exception = err + '';
                }

                var params = {
                    id: update.id
                };

                if(exception) {
                    params.err = exception;
                }

                SassBuilder.doRequest({
                    url: '/~sass/manifest',
                    method: 'POST',
                    params: params
                });
            };
            theFn();
            //SassBuilder.waitFor(function(){
            //    !!(window['widgetsReady'])
            //}, theFn);
        }
    },
    
    onClientShutdown: function(update) {},

    saveUis: function(uis) {
        SassBuilder.doRequest({
            data: uis,
            url: "/~sass/save-uis",
            method: 'POST'
        });
    },

    saveVariables: function(vars) {
        SassBuilder.doRequest({
            data: vars,
            url: "/~sass/save-variables",
            method: 'POST'
        });
    },

    getSavedVariables: function() {
        var saved = SassBuilder.doRequest({
            url: "/~sass/save-variables",
            method: 'GET',
            async: false
        });

        return saved;
    },

    processUpdates: function(updates) {
        if(typeof updates == 'string') {
            updates = JSON.parse(updates);
        }
        for(var i = 0; i < updates.length; i++) {
            var update = updates[i],
                type = update && update['$type'],
                handler;
            try {
                if(type) {
                    type = type.substring(type.lastIndexOf(".") + 1);
                    console.log("processing update type : " + type);
                    handler = SassBuilder['on' + type];
                    if(handler) {
                        handler.call(SassBuilder, update);
                    }
                }
            } catch (e) {
                Fashion.error(e);
            }
        }
        SassBuilder.requestUpdates();
    },
    
    requestUpdates: function() {
        //console.log("requesting updates...");
        var obj = {
            url: '/~sass/updates',
            method: 'GET',
            onComplete: function(opts, xhr) {
                // reset the request counter
                var data = xhr.responseText;
                SassBuilder.requestStart = null;
                SassBuilder.processUpdates(data);
            },
            onError: function(opts, xhr) {
                var current = new Date().getTime(),
                    start = SassBuilder.requestStart || (SassBuilder.requestStart = current);
                console.log("error encountered getting updates");
                if(xhr) {
                    console.log(xhr.status);
                }

                // retry until timeout
                if ((current - start) < 15 * 1000) {
                    SassBuilder.requestUpdates();
                } else {
                    SassBuilder.onClientShutdown();
                }
            }
        };
        if(SassBuilder.updateClientId) {
            //console.log("getting updates for ID " + SassBuilder.updateClientId);
            obj.params = {
                clientId: SassBuilder.updateClientId
            };
        }
        SassBuilder.doRequest(obj);
    },

    beginLiveUpdateMonitor: function() {
        var me = this,
            requestFn = function(){
                SassBuilder.doRequest({
                    url: "/~sass/register",
                    params: {
                        location: window.location,
                        phantomjs: SassBuilder.isPhantomJs
                    },
                    onComplete: function(opts, xhr) {
                        var clientId = JSON.parse(xhr.responseText);
                        SassBuilder.updateClientId = clientId;
                        SassBuilder.requestUpdates();
                    }
                });
            };
        if(window['Fashion'] && Fashion.Env) {
            requestFn();
        } else {
            setTimeout(function(){
                me.beginLiveUpdateMonitor();
            }, 1)
        }
    },

    isBuildClient: function() {
        return SassBuilder.isPhantomJs;
    },

    waitFor: function(test, ready, timeout) {
        var maxtimeOutMillis = timeout ? timeout : 30 * 1000,
            start = new Date().getTime(),
            condition = false,
            interval = setInterval(function() {
                if ((new Date().getTime() - start < maxtimeOutMillis) && !condition) {
                    condition = test();
                } else {
                    clearInterval(interval);
                    if (!condition) {
                        console.log('timeout exceeded');
                    } else {
                        ready();
                    }
                }
            }, 100);
    }
};

// detect if the phantomjs query param is set, if so, allow the phantomjs layer to
// launch the message request process
if(!SassBuilder.isPhantomJs) {
    SassBuilder.beginLiveUpdateMonitor();
}

var Ext = Ext || {};

if (Ext && Ext.env && Ext.env.Ready) {
    Ext.env.Ready.block();
} else {
    var readyHandlerWas = Ext._beforereadyhandler;
    Ext._beforereadyhandler = function(){
        if(!SassBuilder.loaded) {
            SassBuilder.loaded = true;
            Ext.env.Ready.block();
            if(readyHandlerWas) {
                readyHandlerWas();
            }
        }
    };
}


(function(){

    function decorate(fn, level) {
        return function(message, data){
            var msg = Fashion.createMessage(message, data);
            SassBuilder.logs.push({
                level: level,
                message: msg + ''
            });
            fn.call(Fashion, message, data);
        };
    }

    if (SassBuilder.isBuildClient()) {
        Fashion.debug = decorate(Fashion.debug, 'fine');
        Fashion.log = decorate(Fashion.log, 'info');
        Fashion.info = decorate(Fashion.info, 'info');
        Fashion.warn = decorate(Fashion.warn, 'warning');
        Fashion.error = decorate(Fashion.error, 'severe');

        var raiseWas = Fashion.raise;
        Fashion.raise = function(ex){
            SassBuilder.exception = ex;
            raiseWas.call(this, ex);
        };
    }

    Fashion.apply(Fashion, {

        onAfterBuild: Function.prototype,

        getVariables: function (currGlobals) {
            var out = {},
                builder = Fashion.lastBuilder,
                context = builder.getContext(),
                runtime = context.runtime,
                variables = context.getVariables();

            currGlobals = currGlobals || runtime.getGlobalScope().getEntries();

            for(var name in currGlobals) {
                var variable = variables[name],
                    global = currGlobals[name];

                if (variable && variable.dynamic && !variable.elevationCause) {
                    if(global && global.$isWrapper) {
                        global = global.value;
                    }

                    if(global && global.$isFashionType) {
                        out[name] = global.toString();
                    } else {
                        out[name] = global;
                    }
                }
            }
            return out;
        },

        getNodeValue: function(node) {
            var text = node.valueText && node.valueText.trim(),
                dynamicRx = /dynamic\((.*)\)(;?)$/g,
                oldRx = /(.*?)!dynamic(;?)$/g;
            if (dynamicRx.test(text)) {
                text = text.replace(dynamicRx, "$1$2");
            } else if (oldRx.test(text)) {
                text = text.replace(oldRx, "$1$2")
            }
            text = text.replace(/;$/g, '');
            text = text.trim();
            return text;
        },

        getVariableSources: function() {
            var variables = Fashion.getVariables(),
                varMap = Fashion.lastBuilder.getContext().getVariables(),
                sources = {};
            for (var name in variables) {
                if (name in varMap) {
                    var text = this.getNodeValue(varMap[name].node);
                    if (text) {
                        sources[name] = text;
                    }
                }
            }
            return sources;
        },

        getSavedVariables: function() {
            var savedVariables = SassBuilder && SassBuilder.getSavedVariables && JSON.parse(SassBuilder.getSavedVariables());
            return savedVariables || {};
        },

        createVariables: function (vars, skipSave) {
            var builder = Fashion.lastBuilder;

            if(!skipSave &&
                typeof SassBuilder !== 'undefined' &&
                SassBuilder.saveVariables) {
                SassBuilder.saveVariables(vars);
            }

            return builder.createVarsScope(vars);
        },

        reExecute: function (vars, callback, skipReload) {
            var builder = Fashion.lastBuilder,
                context = builder.context,
                func = context.getFunc(),
                ex = null,
                css, cssCode, exportFnCode;

            function complete() {
                callback && callback(css, ex, exportFnCode);
            }

            // now, re-executed the cached fn using the provided setters
            // as initial state
            try {
                css = func(null, vars, context.dynamicsMap);
                css.getText(function(c, f) {
                    if (!skipReload) {
                        builder.injectCss(builder.lastCssPath, c);
                    }
                    cssCode = c;
                    exportFnCode = f;
                    complete();
                }, true);
            }
            catch (err) {
                ex = err;
                complete();
            }
        },

        setVariables: function (vars, callback, skipReload, skipSave) {
            SassBuilder.skipNextBuild = (SassBuilder.skipNextBuild || 0) + 1;
            vars = Fashion.createVariables(vars, skipSave);
            Fashion.reExecute(vars, callback, skipReload);
        },

        getMixins: function () {
            var mixins = {},
                builder = Fashion.lastBuilder,
                files = builder.scripts,
                file;

            for (var name in files) {
                file = files[name];
                if (file.isUiFile) {
                    Fashion.apply(mixins, file.getCustomUIs());
                }
            }
            return mixins;
        },

        saveMixins: function(mixins) {
            var currMixins = this.getMixins();
            
            for (var name in currMixins) {
                if (!mixins.hasOwnProperty(name)) {
                    mixins[name] = false;
                }
            }
            
            SassBuilder.skipNextBuild = 0;
            
            SassBuilder.saveUis(mixins);
        },

        getMixinDefinitions: function() {
            var mixins = {},
                builder =  Fashion.lastBuilder,
                preprocessor, names, mixDefs, name, def, meta,
                params, param, i, n;

            if (builder) {
                preprocessor = builder.context.preprocessor,
                mixDefs = preprocessor.mixinDeclarations,
                names = Object.keys(mixDefs);

                for (n = 0; n < names.length; n++) {
                    name = names[n];
                    def = mixDefs[name];
                    meta = {
                        parameters: []
                    };

                    mixins[name] = meta;
                    params = def.parameters;
                    for (i = 0; i < params.length; i++) {
                        param = params[i];
                        meta.parameters.push({
                            name: param.name,
                            'default': param.default
                        });
                    }
                }
            }
            return mixins;
        },

        // override this to be notified when a build is complete
        onAfterBuild: Function.prototype
    });


})();

Fashion.version = "7.4.0.7.4.0.39";