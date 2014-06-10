//clase with pattern factory with the idea of create modules
yOSON.Modular = function(){
    this.modules = {};
    this.skeletonModule = {};
    this.entityBridge = {};
    this.debug = false;
};

//receive one method for the entity comunicator on modules
yOSON.Modular.prototype.addMethodToBrigde = function(methodName, classSelf, methodOfClass){
    this.entityBridge[methodName] = function(){
        var objSelf = new classSelf();
        return objSelf[methodOfClass];
    }
};

//adding a module
yOSON.Modular.prototype.addModule = function(moduleName, moduleDefinition){
    if(this.existsModule(moduleName)){
        //mensaje ya existe modulo
    } else {
        this.modules[moduleName] = this.createDefinitionModule(moduleName, moduleDefinition);
    }
};

//return the complete definition of an module with the components
yOSON.Modular.prototype.getModuleDefinition = function(moduleName){
    var module = this.getModule(moduleName),
        moduleInstance = module.moduleDefinition(this.entityBridge),
        that = this;
    if(!this.debug){
        for(var propertyName in moduleInstance){
            var method = moduleInstance[propertyName];
            if(typeof method === "function"){
                moduleInstance[propertyName] = that.addFunctionToDefinitionModule(propertyName, method);
            }
        }
    }
    return moduleInstance;
};

//create a method taking a name and function self
yOSON.Modular.prototype.addFunctionToDefinitionModule = function(functionName, functionSelf){
    return function(){
        try {
            return functionSelf.apply(this, arguments);
        } catch( ex ){
            console.log(ex.message);
        }
    };
};

//verifying the existence of one module by name
yOSON.Modular.prototype.existsModule = function(moduleName){
    var founded = false;
    if(this.getModule(moduleName)){
        founded = true;
    }
    return founded;
};

//return the module from the collection of modules
yOSON.Modular.prototype.getModule = function(moduleName){
    return this.modules[moduleName];
};

// return the skeleton for the creation of module
//creator of the definition ready for merge with the components
yOSON.Modular.prototype.createDefinitionModule = function(moduleName, moduleDefinition){
    this.skeletonModule[moduleName] = {
        'moduleDefinition': moduleDefinition
    };
    return this.skeletonModule[moduleName];
};

//running the module
yOSON.Modular.prototype.runModule = function(moduleName, optionalParameter){
    var parameters = {};
    console.log('this.existsModule(moduleName)', moduleName);
    if(this.existsModule(moduleName)){

        if(typeof optionalParameter !== "undefined"){
            parameters = optionalParameter;
        }
        parameters.moduleName = moduleName;

        var moduleDefinition = this.getModuleDefinition(moduleName);

        if(moduleDefinition.hasOwnProperty('init')){
            moduleDefinition.init();
        } else {
            //message modulo dont run
        }
    }
};

//running one list of modules
yOSON.Modular.prototype.runModules = function(moduleNames){
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
