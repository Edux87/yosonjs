/*! FrontendLabs comunity | yOSONJS v0.0.16-alpha | (c) 2014, 2014 FrontendLabs comunity */
if("undefined"==typeof yOSON)var yOSON={};yOSON.Components={},yOSON.Log=function(){try{console.log.apply(console,arguments)}catch(a){try{opera.postError.apply(opera,arguments)}catch(b){alert(Array.prototype.join.call(arguments)," ")}}},function(){var a=function(){this.callbacks={succeededs:[],faileds:[]},this.status="pending"};a.prototype.eachCallBackList=function(a,b){for(var c=0;c<a.length;c++)b.call(this,a[c])},a.prototype.done=function(){this.status="done",this.eachCallBackList(this.callbacks.succeededs,function(a){a.call(this)})},a.prototype.then=function(a,b){var c=this.callbacks,d={pending:function(){c.succeededs.push(a),"function"==typeof b&&c.faileds.push(b)},done:function(){"function"==typeof a&&a.call(this)},fail:function(){b.call(this)}};return d[this.status](),this},a.prototype.fail=function(a){this.status="fail",this.eachCallBackList(this.callbacks.faileds,function(b){b.call(this,a)})},yOSON.Components.SinglePromise=a;var b=function(a){this.url=a,this.status="request",this.message="",this.events={}};b.prototype.getStatus=function(){return this.status},b.prototype.request=function(a){var b=this;"undefined"!=typeof a&&(b.events=a),b.onRequest();var c=b.createNewScript(b.url);b.requestIE(c,function(){c.onload=function(){b.onReadyRequest()},c.onerror=function(){b.onErrorRequest()}}),document.getElementsByTagName("head")[0].appendChild(c)},b.prototype.createNewScript=function(a){var b=document.createElement("script");return b.type="text/javascript",b.src=a,b},b.prototype.onRequest=function(){this.requestCallBackEvent("onRequest")},b.prototype.onReadyRequest=function(){this.status="ready",this.requestCallBackEvent("onReady")},b.prototype.onErrorRequest=function(){this.status="error",this.requestCallBackEvent("onError")},b.prototype.requestCallBackEvent=function(a){var b=this.events[a];"function"==typeof b&&b.call(this)},b.prototype.requestIE=function(a,b){var c=this;a.readyState?a.onreadystatechange=function(){("loaded"==a.readyState||"complete"==a.readyState)&&(a.onreadystatechange=null,c.onReadyRequest())}:b.call(c)},yOSON.Components.Dependency=b;var c=function(){this.data={},this.loaded={},this.config={staticHost:yOSON.statHost||"",versionUrl:yOSON.statVers||""}};c.prototype.setStaticHost=function(a){this.config.staticHost=a},c.prototype.getStaticHost=function(){return this.config.staticHost},c.prototype.setVersionUrl=function(a){this.config.versionUrl=a},c.prototype.getVersionUrl=function(){var a="";return""!==this.config.versionUrl&&(a=this.config.versionUrl),a},c.prototype.transformUrl=function(a){var b="",c=/((http?|https):\/\/)(www)?([\w-]+\.\w+)+(\/[\w-]+)+\.\w+/g;return b=c.test(a)?a:this.validateDoubleSlashes(this.config.staticHost+a+this.getVersionUrl())},c.prototype.validateDoubleSlashes=function(a){var b=/([^\/:])\/+([^\/])/g;return a.replace(b,"$1/$2")},c.prototype.generateId=function(a){return-1!=a.indexOf("//")?a.split("//")[1].split("?")[0].replace(/[/.:]/g,"_"):a.split("?")[0].replace(/[/.:]/g,"_")},c.prototype.addScript=function(c){var d=this.generateId(c),e=new a;return this.alreadyInCollection(d)?this.data[d].promiseEntity:(this.data[d]=new b(c),this.data[d].request({onReady:function(){e.done()},onError:function(){e.fail()}}),this.data[d].promiseEntity=e,e)},c.prototype.ready=function(a,b,c){var d=0,e=this,f=function(g){if(d<g.length){var h=e.transformUrl(g[d]);e.addScript(h).then(function(){d++,f(a)},c)}else b.apply(e)};f(a)},c.prototype.getDependency=function(a){var b=this.generateId(a);return this.data[b]},c.prototype.alreadyInCollection=function(a){return this.data[a]},c.prototype.alreadyLoaded=function(a){return"undefined"!=typeof this.loaded[a]},yOSON.Components.DependencyManager=c;var d=function(a){this.entityBridge=a,this.moduleInstance="",this.status="stop"};d.prototype.create=function(a){this.moduleDefinition=a},d.prototype.generateModularDefinition=function(a,b){return"function"==typeof b?function(){try{return b.apply(this,arguments)}catch(c){yOSON.Log(a+"(): "+c.message)}}:b},d.prototype.start=function(a){var b=this.dealParamaterOfModule(a),c=this.moduleDefinition(this.entityBridge);for(var d in c){var e=c[d];c[d]=this.generateModularDefinition(d,e)}this.moduleInstance=c,this.runInitMethodOfModule(b)},d.prototype.dealParamaterOfModule=function(a){var b={};return"undefined"!=typeof a&&(b=a),b},d.prototype.runInitMethodOfModule=function(a){var b=this.moduleInstance;"function"==typeof b.init&&(this.setStatusModule("run"),b.init(a))},d.prototype.setStatusModule=function(a){this.status=a},d.prototype.getStatusModule=function(){return this.status},yOSON.Components.Modular=d;var e=function(){this.modules={},this.runningModules={},this.entityBridge={},this.alreadyAllModulesBeRunning=!1};e.prototype.addMethodToBrigde=function(a,b){this.entityBridge[a]=b},e.prototype.addModule=function(a,b){var c=this.modules;this.getModule(a)||(c[a]=new d(this.entityBridge),c[a].create(b))},e.prototype.getModule=function(a){return this.modules[a]},e.prototype.runModule=function(a,b){var c=this.getModule(a);c&&c.start(b)},e.prototype.whenModuleHaveStatus=function(a,b,c){var d=this.getModule(a);d.getStatusModule()===b&&c.call(this,a,d)},yOSON.Components.ModularManager=e;var f=function(){this.events={}};f.prototype.subscribe=function(a,b,c){var d=this;this.finderEvents(a,function(){},function(a){d.addEvent(a,b,c)})},f.prototype.publish=function(a,b){var c=this;this.finderEvents([a],function(a,d){var e=d.instanceOrigin,f=d.functionSelf,g=c.validateArguments(b);f.apply(e,g)},function(){})},f.prototype.validateArguments=function(a){var b=[];return"undefined"!=typeof a&&(b=a),b},f.prototype.stopSubscribe=function(a){var b=this;this.finderEvents(a,function(a,c){b.removeEvent(a)},function(){})},f.prototype.addEvent=function(a,b,c){var d={};return d.instanceOrigin=c,d.functionSelf=b,this.events[a]=d,this},f.prototype.removeEvent=function(a){delete this.events[a]},f.prototype.eventAlreadyRegistered=function(a){var b=!1;return this.getEvent(a)&&(b=!0),b},f.prototype.getEvent=function(a){return this.events[a]},f.prototype.finderEvents=function(a,b,c){for(var d=this,e=0;e<a.length;e++)d.eachFindEvent(a[e],b,c)},f.prototype.eachFindEvent=function(a,b,c){var d=this;if(d.eventAlreadyRegistered(a)){var e=d.getEvent(a);b.call(d,a,e)}else c.call(d,a)},yOSON.Components.Communicator=f;var g=function(a){this.modules=a.modules,this.modules.allModules=function(){},this.modules.byDefault=function(){},this.controllers={byDefault:function(){}},this.actions={byDefault:function(){}}};g.prototype.appendMethod=function(a,b,c){"function"!=typeof a[b]&&(a[b]=c)},g.prototype.overrideModuleLevel=function(a,b){this.appendMethod(b,"allControllers",function(){}),this.modules[a]=b,this.modules=this.modules},g.prototype.setControllers=function(a){this.controllers=this.modules[a].controllers},g.prototype.overrideControllerLevel=function(a,b){this.appendMethod(b,"allActions",function(){}),this.controllers[a]=b},g.prototype.setActions=function(a){this.actions=this.controllers[a].actions},g.prototype.getLevel=function(a){return this[a]},g.prototype.getNodeByLevel=function(a,b){return this[a][b]},g.prototype.getDefaultMethodInLevel=function(a){this[a].byDefault()};var h=function(a){this.objSchema=new g(a)};h.prototype.init=function(a,b,c){var d=this.checkLevelName(a),e=this.checkLevelName(b),f=this.checkLevelName(c),g=this.objSchema;this.runModuleLevel(d,function(a){a.allControllers(),this.runControllerLevel(e,function(a){a.allActions(),this.runActionLevel(f,function(a){a()})})})},h.prototype.checkLevelName=function(a){var b="";return"undefined"!=typeof a&&(b=a),b},h.prototype.runModuleLevel=function(a,b){var c=this.objSchema,d=c.getLevel("modules");if(d.allModules(),d[a]){var e=d[a];c.overrideModuleLevel(a,e),c.setControllers(a),b.call(this,e)}else c.getDefaultMethodInLevel("modules")},h.prototype.runControllerLevel=function(a,b){var c=this.objSchema,d=c.getLevel("controllers");if(d[a]){var e=d[a];c.setActions(a),b.call(this,e)}else c.getDefaultMethodInLevel("controllers")},h.prototype.runActionLevel=function(a,b){var c=this.objSchema,d=c.getLevel("actions");if(d[a]){var e=d[a];b.call(this,e)}else c.getDefaultMethodInLevel("actions")},yOSON.Components.Loader=h;var i=function(){this.taskInQueueToList={},this.listTaskInQueue=[]};i.prototype.generateId=function(){return this.listTaskInQueue.length},i.prototype.getTaskById=function(a){return this.taskInQueueToList[a]},i.prototype.inQueue=function(a){var b=this,c=this.generateId(),d={running:!1,initAlreadyCalled:!1,nextTask:function(a){d.running=!0,"function"==typeof a&&a.call(this),b.dispatchQueue()},init:function(){d.initAlreadyCalled||(d.initAlreadyCalled=!0,a.call(this,d.nextTask))}};return this.taskInQueueToList[c]=d,this.listTaskInQueue.push(this.taskInQueueToList),this.dispatchQueue(),this},i.prototype.taskIsRunning=function(a){return this.taskInQueueToList[a].running},i.prototype.dispatchQueue=function(){var a=this,b=0,c=function(d){if(b<d.length){var e=a.getTaskById(b);a.taskIsRunning(b)?(b++,c(d)):e.init()}};c(this.listTaskInQueue)},yOSON.Components.Sequential=i;var j=new yOSON.Components.ModularManager,k=new yOSON.Components.DependencyManager,l=new yOSON.Components.Communicator,m=new yOSON.Components.Sequential,n={},o=[],p=[];return yOSON.AppCore=function(){j.addMethodToBrigde("events",function(a,b,c){l.subscribe(a,b,c)}),j.addMethodToBrigde("trigger",function(){o=o.slice.call(arguments,0);var a=o[0];o.length>1&&(p=o.slice(1)),l.publish(a,p)});var a=function(a,b){n[a]=b},b=function(a){var b=[];return n[a]&&(b=n[a]),b};return{addModule:function(b,c,d){a(b,d),j.addModule(b,c)},runModule:function(a,c){var d=j.getModule(a);if(d){var e=b(a);m.inQueue(function(b){k.ready(e,function(){j.runModule(a,c),b()},function(){yOSON.Log("Error: the module "+a+" can't be loaded"),b()})})}else yOSON.Log("Error: the module "+a+" don't exists")},setStaticHost:function(a){k.setStaticHost(a)},setVersionUrl:function(a){k.setVersionUrl(a)}}}(),yOSON}();
//# sourceMappingURL=yoson.min.map