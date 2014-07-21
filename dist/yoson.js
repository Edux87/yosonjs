


    if(typeof yOSON === "undefined"){
        var yOSON = {};
    }

    yOSON.Components = {};

     (function(namespace){

    /**
     * Class dealer of an url and indicates if ready or not
     * @class Dependency
     * @constructor
     * @param {String} url Setting the url to request
     * @example
     *      var url = "http://misite.com/mylib.js";
     *      //create and object setting the url to call
     *      var objDependency = new yOSON.Dependency(url);
     *      //request the url
     *      objDependency.request({
     *          onRequest: function(){
     *              //when request
     *          },
     *          onReady: function(){
     *              //when ready
     *          },
     *          onError: function(){
     *              //when occurs an error
     *          },
     *      });
     */
    var Dependency = function(url){
        this.url = url;
        this.status = "request";
        this.message = "";
        this.events = {};
    };
    /**
     * Return the status of the request
     * @method getStatus
     * @return {String} status of the request "request" | "ready" | "error"
     */
    Dependency.prototype.getStatus = function(){
        return this.status;
    };
    /**
     * Call the request of the script
     * @method request
     * @param {Object} events Settings the callbacks
     */
    Dependency.prototype.request = function(events){
        var that = this;

        if(typeof events !== "undefined"){
            that.events = events;
        }

        that.onRequest();
        var newScript = that.createNewScript(that.url);
        that.requestIE(newScript, function(){
            newScript.onload = function(){
                that.onReadyRequest();
            };
            newScript.onerror = function(){
                that.onErrorRequest();
            };
        });
        document.getElementsByTagName("head")[0].appendChild(newScript);
    };

    Dependency.prototype.createNewScript = function(urlSource){
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = urlSource;
        return script;
    };

    /**
     * Trigger when the request its started
     * @method onRequest
     */
    Dependency.prototype.onRequest = function(){
        this.requestCallBackEvent('onRequest');
    };

    /**
     * Trigger when the request its successfully
     * @method onReadyRequest
     */
    Dependency.prototype.onReadyRequest = function(){
        this.status = "ready";
        this.requestCallBackEvent('onReady');
    };
    /**
     * Trigger when the request have an error in the load of the script
     * @method onErrorRequest
     */
    Dependency.prototype.onErrorRequest = function(){
        this.status = "error";
        this.requestCallBackEvent('onError');
    };

    Dependency.prototype.requestCallBackEvent = function(eventName){
        var eventSelf = this.events[eventName];
        if(typeof eventSelf === "function"){
            eventSelf.call(this);
        }
    };
    /**
     * Call the request of the script for IE browser
     * @method requestIE
     * @param {Object} src the newScript created in the method request
     * @param {Object} events Settings the callbacks
     */
    Dependency.prototype.requestIE = function(scriptElement, onNoIEBrowser){
        var that = this;
        if(scriptElement.readyState){
            scriptElement.onreadystatechange = function(){
                if(scriptElement.readyState=="loaded" || scriptElement.readyState=="complete"){
                    scriptElement.onreadystatechange=null;
                    that.onReadyRequest();
                } else {
                    that.onErrorRequest();
                }
            };
        } else {
            onNoIEBrowser.call(that);
        }
    };

    yOSON.Components.Dependency = Dependency;
    

    /**
     * Class manager of one or many requests
     * @class DependencyManager
     * @requires Dependency
     * @constructor
     * @example
     *      //create and object setting the class
     *      var objDependencyManager = new yOSON.DependencyManager();
     *      //example of setting the static host
     *      objdependencymanager.setStaticHost("http://static.host/");
     *      //example of setting the static host
     *      objdependencymanager.setVersionUrl("?v=0.1");
     *      //request the url
     *      objDependency.ready(['url1'], function(){
     *          //when ready execute here
     *      });
     */
    var DependencyManager = function(){
        this.data = {};
        this.loaded = {};
        this.config = {
            staticHost: "",
            versionUrl: ""
        };
    };

    /**
     * Setting the host of the static elements
     * @method setStaticHost
     * @param {String} hostName the host of the static elements,
     * like a CDN url
     * @example
     *      objDependencyManager.setStaticHost("http://cdnjs.com");
     */
    DependencyManager.prototype.setStaticHost = function(hostName){
        this.config.staticHost = hostName;
    };

    /**
     * Get the host saved
     * @method getStaticHost
     * @return {String} Get the host saved with the method setStaticHost
     * @example
     *      //if setting "http://cdnjs.com" return that
     *      objDependencyManager.getStaticHost();
     */
    DependencyManager.prototype.getStaticHost = function(){
        return this.config.staticHost;
    };

    /**
     * Setting the suffix for the url, ideally when working with elements versioned
     * @method setVersionUrl
     * @param {String} versionNumber the suffix or number for concatenate in the url
     * @example
     *      objDependencyManager.setVersionUrl("?v=0.1");
     */
    DependencyManager.prototype.setVersionUrl = function(versionNumber){
        this.config.versionUrl = versionNumber;
    };

    /**
     * Get the suffix saved
     * @method getVersionUrl
     * @return {String} Get the suffix saved with the method setVersionUrl
     * @example
     *      //if setting "?v=0.1" return that
     *      objDependencyManager.getVersionUrl();
     */
    DependencyManager.prototype.getVersionUrl = function(){
        var result = "";
        if(this.config.versionUrl !== ""){
            result = this.config.versionUrl;
        }
        return result;
    };

    /**
     * method what transform the url to request
     * @method transformUrl
     * @param {String} url the url self to transform and ready for request
     * @return {String} the url transformed
     */
    DependencyManager.prototype.transformUrl = function(url){
        var urlResult = "",
        regularExpresion = /((http?|https):\/\/)(www)?([\w-]+\.\w+)+(\/[\w-]+)+\.\w+/g;
        if(regularExpresion.test(url)){
            urlResult = url;
        } else {
            urlResult = this.config.staticHost + url + this.getVersionUrl();
        }
        return urlResult;
    };

    /**
     * method what use the url and generateid the id for the manager
     * @method generateId
     * @param {String} url the url self to generate your id
     */
    DependencyManager.prototype.generateId = function(url){
        return (url.indexOf('//')!=-1)?url.split('//')[1].split('?')[0].replace(/[/.:]/g,'_'):url.split('?')[0].replace(/[/.:]/g,'_');
    };

    /**
     * method what receive an url to the manager
     * @method addScript
     * @param {String} url the url self to request in the manager
     */
    DependencyManager.prototype.addScript = function(url){
        var id = this.generateId( url );
        if(this.alreadyInCollection(id)){
            return 'the dependence already appended';
        } else {
            this.data[id] = new Dependency(url);
            //Hago la consulta del script
            this.data[id].request();
            return true;
        }
    };

    /**
     * method what receive an list of urls to request and callbacks when the requests are ready
     * @method ready
     * @param {Array} urlList List of urls to request
     * @param {Function} onReady Callback to execute when the all requests are ready
     */
    DependencyManager.prototype.ready = function(urlList, onReady){
        var index = 0,
        that = this;
        var queueQuering = function(list){
            var urlToQuery = that.transformUrl(list[index]);
            if(index < list.length){
                that.addScript(urlToQuery);
                that.avaliable(urlToQuery, function(){
                    index++;
                    queueQuering(urlList);
                });
            } else {
                onReady.apply(that);
            }
        };
        queueQuering(urlList);
    };

    /**
     * method what verify the avaliability of an Dependency
     * @method avaliable
     * @param {String} url the url to query if its avaliable or not
     * @param {Function} onAvaliable Callback to execute when the url its avaliable
     * @return {Boolean} if the dependency its avaliable return true
     */
    DependencyManager.prototype.avaliable = function(url, onAvaliable){
        var that = this,
        id = that.generateId(url),
        dependency = that.getDependency(url);
        if(!this.alreadyLoaded(id)){
            var checkStatusDependency = setInterval(function(){
                if(dependency.getStatus() == "ready"){
                    that.loaded[id] = true;
                    clearInterval(checkStatusDependency);
                    onAvaliable.apply(that);
                }
                if(dependency.getStatus() == "error"){
                    onAvaliable = null;
                    clearInterval(checkStatusDependency);
                }
            }, 500);
        } else {
            return true;
        }
    };

    /**
     * return the dependency saved in the manager
     * @method getDependency
     * @param {String} url the url to get in the manager
     * @return {Object} the object Dependency created by the url
     */
    DependencyManager.prototype.getDependency = function(url){
        var id = this.generateId(url);
        return this.data[id];
    };

    /**
     * Query if its appened in the collection of the manager
     * @method alreadyInCollection
     * @param {String} id the id generated by the url
     * @return {Object} the object Dependency created by the url
     */
    DependencyManager.prototype.alreadyInCollection = function(id){
        return this.data[id];
    };

    /**
     * Query if its loaded the dependency in the manager
     * @method alreadyLoaded
     * @param {String} id the id generated by the url
     * @return {Object} the object Dependency created by the url
     */
    DependencyManager.prototype.alreadyLoaded = function(id){
        return this.loaded[id];
    };

    yOSON.Components.DependencyManager = DependencyManager;
    

    //clase with pattern factory with the idea of create modules
    var Modular = function(){
        this.modules = {};
        this.runningModules = {};
        this.skeletonModule = {};
        this.entityBridge = {};
        this.alreadyAllModulesBeRunning = null;
    };

    //receive one method for the entity comunicator on modules
    Modular.prototype.addMethodToBrigde = function(methodName, methodSelf){
        this.entityBridge[methodName] = methodSelf;
    };

    //adding a module
    Modular.prototype.addModule = function(moduleName, moduleDefinition){
        if(this.existsModule(moduleName)){
            //mensaje ya existe modulo
        } else {
            this.modules[moduleName] = this.createDefinitionModule(moduleName, moduleDefinition);
        }
    };

    //return the complete definition of an module with the components
    Modular.prototype.getModuleDefinition = function(moduleName){
        var module = this.getModule(moduleName),
            moduleInstance = module.moduleDefinition(this.entityBridge),
            that = this;

        for(var propertyName in moduleInstance){
            var method = moduleInstance[propertyName];
            if(typeof method === "function"){
                moduleInstance[propertyName] = that.addFunctionToDefinitionModule(moduleName, propertyName, method);
            }
        }

        return moduleInstance;
    };

    //create a method taking a name and function self
    Modular.prototype.addFunctionToDefinitionModule = function(moduleName, functionName, functionSelf){
        return function(){
            try {
                return functionSelf.apply(this, arguments);
            } catch( ex ){
                console.log("Modulo:"+ moduleName + "." + functionName + "(): " + ex.message);
            }
        };
    };

    //verifying the existence of one module by name
    Modular.prototype.existsModule = function(moduleName){
        var founded = false;
        if(this.getModule(moduleName)){
            founded = true;
        }
        return founded;
    };

    //return the module from the collection of modules
    Modular.prototype.getModule = function(moduleName){
        return this.modules[moduleName];
    };

    // return the skeleton for the creation of module
    //creator of the definition ready for merge with the components
    Modular.prototype.createDefinitionModule = function(moduleName, moduleDefinition){
        this.skeletonModule[moduleName] = {
            'moduleDefinition': moduleDefinition
        };
        return this.skeletonModule[moduleName];
    };

    //running the module
    Modular.prototype.runModule = function(moduleName, optionalParameters){
        var parameters = "";
        if(this.existsModule(moduleName)){
            if(typeof optionalParameters === "undefined"){
                parameters = {};
            } else {
                parameters = optionalParameters;
            }

            parameters.moduleName = moduleName;

            var moduleDefinition = this.getModuleDefinition(moduleName);

            if(typeof moduleDefinition.init === "function"){
                this.runningModule(moduleName);
                moduleDefinition.init(parameters);
            } else {
                //message modulo dont run
            }
        }
    };

    //running one list of modules
    Modular.prototype.runModules = function(moduleNames){
        var that = this;
        //its necesary the parameter moduleNames must be a type Array
        if(!moduleNames instanceof Array){
            return;
        }

        for(var index = 0; index < moduleNames.length; index++){
            var moduleName = moduleNames[index];
            if(that.existsModule(moduleName)){
                that.runModule(moduleName);
            }
        }
    };

    Modular.prototype.runningModule = function(moduleName){
        this.modules[moduleName].running = true;
    };

    Modular.prototype.moduleIsRunning = function(moduleName){
        return this.modules[moduleName].running;
    };

    Modular.prototype.setStatusModule = function(moduleName, statusName){
        this.modules[moduleName].status = statusName;
    };

    Modular.prototype.getStatusModule = function(moduleName){
        return this.modules[moduleName].status;
    };

    Modular.prototype.allModulesRunning = function(onNotFinished, onFinished){
        var that = this;
        if(this.alreadyAllModulesBeRunning){
            onFinished.call(that);
        } else {
            var checkModulesRunning = setInterval(function(){
                var startedModules = 0,
                    runningModules = 0;

                for(var moduleName in that.modules){
                    if(that.moduleIsRunning(moduleName)){
                        runningModules++;
                    }
                    if(that.getStatusModule(moduleName) == "start"){
                        startedModules++;
                    }
                }

                if(startedModules > 0){
                    if( startedModules == runningModules){
                        this.alreadyAllModulesBeRunning = true;
                        onFinished.call(that);
                        clearInterval(checkModulesRunning);
                    } else {
                        onNotFinished.call(that);
                    }
                } else {
                    this.alreadyAllModulesBeRunning = true;
                    onFinished.call(that);
                    clearInterval(checkModulesRunning);
                }

            }, 200);
        }
    };

    yOSON.Components.Modular = Modular;

    


    //Clase que se orienta al manejo de comunicacion entre modulos
    var Comunicator = function(){
        this.events = {};
    };

    Comunicator.prototype.subscribe = function(eventNames, functionSelfEvent, instanceOrigin){
        var that = this;
        this.finderEvents(eventNames, function(){
        }, function(eventName){
            that.addEvent(eventName, functionSelfEvent, instanceOrigin);
        });
    };

    Comunicator.prototype.publish = function(eventName, argumentsOfEvent){
        var that = this;
        this.finderEvents([eventName], function(eventNameFound, eventFound){
            var instanceFound = eventFound.instanceOrigin,
                functionFound = eventFound.functionSelf,
                validArguments = that.validateArguments(argumentsOfEvent);
            functionFound.apply(instanceFound, validArguments);
        }, function(){});
    };

    Comunicator.prototype.validateArguments = function(argumentsToValidate){
        var validArguments = [];
        if(typeof argumentsToValidate !== "undefined"){
            validArguments = argumentsToValidate;
        }
        return validArguments;
    };

    Comunicator.prototype.stopSubscribe = function(EventsToStop){
        var that = this;
        this.finderEvents(EventsToStop, function(eventNameFound, eventFound){
            that.removeEvent(eventNameFound);
        }, function(){});
    };

    Comunicator.prototype.addEvent = function(eventName, functionOfEvent, instanceOrigin){
        var bodyNewEvent = {};
        bodyNewEvent.instanceOrigin = instanceOrigin;
        bodyNewEvent.functionSelf = functionOfEvent;
        this.events[eventName] = bodyNewEvent;
        return this;
    };

    Comunicator.prototype.removeEvent = function(eventName){
        delete this.events[eventName];
    };

    Comunicator.prototype.eventAlreadyRegistered = function(eventName){
        var response = false;
        if(this.getEvent(eventName)){
            response = true;
        }
        return response;
    };

    Comunicator.prototype.getEvent = function(eventName){
        return this.events[eventName];
    };

    Comunicator.prototype.finderEvents = function(eventNames, whichEventFound, whichEventNotFound){
        var that = this;
        for(var index = 0; index < eventNames.length;index++){
            var eventName = eventNames[index];
            if(that.eventAlreadyRegistered(eventName)){
                var eventFound = that.getEvent(eventName);
                whichEventFound.call(that, eventName, eventFound);
            } else {
                whichEventNotFound.call(that, eventName);
            }
        }
    };

    yOSON.Components.Comunicator = Comunicator;
    
//Clase que maneja la ejecución de modulos depediendo de 3 parametros (Modulo, Controlador, Accion)


    var Loader = function(schema){
        this.schema = schema;
        this.modules = this.schema.modules;
        this.controllers = {};
        this.actions = {};
    };

    Loader.prototype.init = function(moduleName, controllerName, actionName){

        var moduleNameToQuery = this.checkLevelName(moduleName);
        var controllerNameToQuery = this.checkLevelName(controllerName);
        var actionNameToQuery = this.checkLevelName(actionName);

        this.runModuleLevel(moduleNameToQuery, function(moduleFound){
            this.runControllerLevel(moduleFound, controllerNameToQuery , function(controllerFound){
                this.runActionLevel(controllerFound, actionNameToQuery, function(actionFound){
                    actionFound();
                }, function(controllerSelf){
                    this.getByDefaultInActionLevel(controllerSelf);
                });
            }, function(moduleSelf){
                this.getByDefaultInControllerLevel(moduleSelf);
            });
        }, function(){
            this.getByDefaultInModuleLevel();
        });
    };

    Loader.prototype.checkLevelName = function(levelName){
        var result = "";
        if(typeof levelName === "undefined"){

        } else {
            result = levelName;
        }
        return result;
    };

    Loader.prototype.getModuleByName = function(moduleName){
        return this.modules[moduleName];
    };

    Loader.prototype.existsModuleByName = function(moduleName){
        var result = false;
        if(this.getModuleByName(moduleName)){
            result = true;
        }
        return result;
    };

    Loader.prototype.getByDefaultInModuleLevel = function(){
        if(typeof this.modules.byDefault === "function"){
            this.modules.byDefault();
        } else {
            throw new Error("The level module dont have the default module or not is a function");
        }
    };

    Loader.prototype.runModuleLevel = function(moduleName, onModuleFound, onModuleNotFound){
        this.schema.modules.allModules();
        if(this.existsModuleByName(moduleName)){
            var module = this.getModuleByName(moduleName);
            onModuleFound.call(this, module);
        } else {
            onModuleNotFound.call(this);
        }
    };

    Loader.prototype.getControllerByNameInModule = function(controllerName, moduleSelf){
        return moduleSelf.controllers[controllerName];
    };

    Loader.prototype.existsControllerByName = function(module, controllerName){
        var result = false;
        if(this.getControllerByNameInModule(controllerName, module)){
            result = true;
        }
        return result;
    };

    Loader.prototype.getByDefaultInControllerLevel = function(moduleSelf){
        if(typeof moduleSelf.controllers.byDefault === "function"){
            moduleSelf.controllers.byDefault();
        } else {
            throw new Error("The level controller don't have the default controller or not is a function");
        }
    };

    Loader.prototype.runControllerLevel = function(moduleSelf, controllerName, onControllerFound, onControllerNotFound){
        moduleSelf.allControllers();
        if(this.existsControllerByName(moduleSelf, controllerName)){
            var controller = this.getControllerByNameInModule(controllerName, moduleSelf);
            onControllerFound.call(this, controller);
        } else {
            onControllerNotFound.call(this, moduleSelf);
        }
    };

    Loader.prototype.getActionByNameInController = function(actionName, controller){
        return controller.actions[actionName];
    };

    Loader.prototype.existsActionInController = function(controller, actionName){
        var result = false;
        if(this.getActionByNameInController(actionName, controller)){
            result = true;
        }
        return result;
    };

    Loader.prototype.getByDefaultInActionLevel = function(controllerSelf){
        if(typeof controllerSelf.actions.byDefault === "function"){
            controllerSelf.actions.byDefault();
        } else {
            throw new Error("The level action don't have the default controller or not is a function");
        }
    };

    Loader.prototype.runActionLevel = function(controllerSelf, actionName, onActionFound, onActionNotFound){
        controllerSelf.allActions();
        if(this.existsActionInController(controllerSelf, actionName)){
            var action = this.getActionByNameInController(actionName, controllerSelf);
            onActionFound.call(this, action);
        } else {
            onActionNotFound.call(this, controllerSelf);
        }
    };

    yOSON.Components.Loader = Loader;

    


    var objModular = new yOSON.Components.Modular(),
        dependencyManager = new yOSON.Components.DependencyManager(),
        objComunicator = new yOSON.Components.Comunicator(),
        dependenceByModule = {};

    yOSON.AppCore = (function(){


        //setting the main methods in the bridge of an module
        objModular.addMethodToBrigde('events', function(eventNames, functionSelfEvent, instanceOrigin){
            objComunicator.subscribe(eventNames, functionSelfEvent, instanceOrigin);
        });

        objModular.addMethodToBrigde('trigger', function(eventName, argumentsOfEvent){
            var eventsWaiting = {};
            objModular.allModulesRunning(function(){
                eventsWaiting[eventName] = argumentsOfEvent;
            }, function(){
                //if have events waiting
                for(var eventsForTrigger in eventsWaiting){
                    objComunicator.publish(eventsForTrigger , eventsWaiting[eventsForTrigger]);
                }
                objComunicator.publish(eventName, argumentsOfEvent);
            });
        });

        //managing the dependences
        var setDependencesByModule = function(moduleName, dependencesOfModule){
            dependenceByModule[moduleName] = dependencesOfModule;
        },
        getDependencesByModule = function(moduleName){
            var dependencesToReturn = [];
            if(dependenceByModule[moduleName]){
                dependencesToReturn = dependenceByModule[moduleName];
            }
            return dependencesToReturn;
        };

        return {
            getComponents: function(){
                return {
                    'Modular': objModular,
                    'Comunicator': objComunicator,
                    'DependencyManager': dependencyManager
                };
            },
            addModule: function(moduleName, moduleDefinition, dependences){
                setDependencesByModule(moduleName, dependences);
                objModular.addModule(moduleName, moduleDefinition);
            },
            runModule: function(moduleName, optionalParameter){
                var dependencesToLoad = getDependencesByModule(moduleName);
                objModular.setStatusModule(moduleName, "start");
                dependencyManager.ready(dependencesToLoad,function(){
                    objModular.runModule(moduleName, optionalParameter);
                });
            },
            setStaticHost: function(hostName){
                dependencyManager.setStaticHost(hostName);
            },
            setVersionUrl: function(versionCode){
                dependencyManager.setVersionUrl(versionCode);
            }
        };
    })();

    return yOSON;})(yOSON);