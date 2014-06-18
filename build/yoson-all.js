//Creando el manejo de dependencias
//Clase que trata con una url
//Objeto que como objetivo invoca a la dependencia a travez de su url
//y notifica el status del mismo
define([
    'yoson'
], function(yOSON){

    Dependency = function(url){
        this.url = url;
        this.status = "request";
        this.message = "";
    };
    //realiza el request
    Dependency.prototype.request = function(){
        console.log('solicitando url', this.url);
        var that = this,
        newScript = document.createElement("script");
        newScript.type = "text/javascript";
        newScript.src = this.url;
        if( newScript.readyState ){
            this.requestIE(newScript);
        } else {
            newScript.onload = function(){
                that.status = "ready";
            };
            newScript.onerror = function(){
                that.onErrorRequest();
            };
        }
        document.getElementsByTagName("head")[0].appendChild(newScript);
    };
    //en caso sea IExplorer realiza el request
    Dependency.prototype.requestIE = function(src){
        var that = this;
        src.onreadystatechange = function(){
            if(src.readyState=="loaded" || src.readyState=="complete"){
                src.onreadystatechange=null;
                that.status = "ready";
            } else {
                that.onErrorRequest();
            }
        };
    };

    Dependency.prototype.onErrorRequest = function(){
        this.status = "error";
        this.setErrorMessage("No pudo cargarse el script "+ this.url);
    };
    //retorna el status del request
    Dependency.prototype.getStatus = function(){
        return this.status;
    };

    //retorna el mensage de error
    Dependency.prototype.getErrorMessage = function(){
        return this.message;
    };

    //retorna el mensage de error
    Dependency.prototype.setErrorMessage = function(message){
        this.message = message;
    };

    yOSON.Dependency = Dependency;
    return Dependency;
});

define([
    "../yoson"
], function(yOSON){
    //clase manager de los objetos Dependency
    //Administrador de dependencias
    DependencyManager = function(){
        this.data = {};
        this.loaded = {};
        this.config = {
            staticHost: "",
            versionUrl: ""
        };
    };

    DependencyManager.prototype.setStaticHost = function(hostName){
        this.config.staticHost = hostName;
    };

    DependencyManager.prototype.setVersionUrl = function(versionNumber){
        this.config.versionUrl = versionNumber;
    };

    DependencyManager.prototype.getVersionUrl = function(){
        var result = "";
        if(this.config.versionUrl !== ""){
            result = "?" + this.config.versionUrl;
        }
        return result;
    };

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

    //método que crea el id segun la url ingresada
    DependencyManager.prototype.generateId = function(url){
        return (url.indexOf('//')!=-1)?url.split('//')[1].split('?')[0].replace(/[/.:]/g,'_'):url.split('?')[0].replace(/[/.:]/g,'_');
    };

    //Adiciona la dependencia a administrar con su url
    DependencyManager.prototype.addScript = function(url){
        var id = this.generateId( url );
        if(!this.alreadyInCollection(id)){
            this.data[id] = new yOSON.Dependency(url);
            //Hago la consulta del script
            this.data[id].request();
        } else {
            console.log('dependency in cache', this.data[id]);
        }
    };
    //Metodo que indica que está lista la dependencia
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
    //Método que verifica si está lista el script agregado
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
                    console.warn(dependency.getErrorMessage());
                    clearInterval(checkStatusDependency);
                    onAvaliable = null;
                }
            }, 500);
        } else {
            return true;
        }
    };
    //retorna la dependencia en memoria
    DependencyManager.prototype.getDependency = function(url){
        var id = this.generateId(url);
        return this.data[id];
    };
    //Consulta si está agregada en la data del administrador
    DependencyManager.prototype.alreadyInCollection = function(id){
        return this.data[id];
    };
    //retorna si ya está cargado la dependencia completamente
    DependencyManager.prototype.alreadyLoaded = function(id){
        return this.loaded[id];
    };

    yOSON.DependencyManager = DependencyManager;
    return DependencyManager;
});

define([
    "../yoson"
], function(yOSON){
    //clase with pattern factory with the idea of create modules
    Modular = function(){
        this.modules = {};
        this.runningModules = {};
        this.skeletonModule = {};
        this.entityBridge = {};
        this.alreadyAllModulesBeRunning = null;
        this.debug = false;
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
            'moduleDefinition': moduleDefinition,
        };
        return this.skeletonModule[moduleName];
    };

    //running the module
    Modular.prototype.runModule = function(moduleName, optionalParameter){
        var parameters = null;
        if(this.existsModule(moduleName)){
            console.log('running Module:', moduleName);

            if(typeof optionalParameter === "undefined"){
                parameters = {};
            } else {
                parameters = optionalParameter;
            }

            parameters.moduleName = moduleName;

            var moduleDefinition = this.getModuleDefinition(moduleName);

            this.runningModule(moduleName);

            if(moduleDefinition.hasOwnProperty('init')){
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

    yOSON.Modular = Modular;

    return Modular;
});

define([
    "../yoson"
], function(yOSON){

    //Clase que se orienta al manejo de comunicacion entre modulos
    Comunicator = function(){
        this.events = {};
    };

    Comunicator.prototype.publish = function(eventName, argumentsOfEvent){
        var that = this;
        this.finderEvents([eventName], function(eventNameFound, eventFound){
            var instanceFound = eventFound.instanceOrigin,
                functionFound = eventFound.functionSelf,
                validArguments = that.validateArguments(argumentsOfEvent);
            console.log('execute event', eventName);
            functionFound.call(instanceFound, validArguments);
        }, function(){});
    };

    Comunicator.prototype.subscribe = function(eventNames, functionSelfEvent, instanceOrigin){
        var that = this;
        this.finderEvents(eventNames, function(){
        }, function(eventName){
            console.log('register event', eventName);
            that.addEvent(eventName, functionSelfEvent, instanceOrigin);
        });
    };

    Comunicator.prototype.validateArguments = function(argumentsToValidate){
        var validArguments = [];
        if(typeof argumentsToValidate !== "undefined"){
            validArguments = argumentsToValidate;
        }
        return validArguments;
    };

    Comunicator.prototype.stopSubscribe = function(EventsToStop, instanceOrigin){
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
        this.events[eventName] = null;
    };

    Comunicator.prototype.eventAlreadyRegistered = function(eventName){
        var response = null;
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

    yOSON.Comunicator = Comunicator;
    return Comunicator;
});

//Clase que se orienta al manejo de comunicacion entre modulos
Loader = function(schema){
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

define(function(){

    if(typeof yOSON === "undefined"){
        var yOSON = {};
    }

    return yOSON;
})
