define([
   '../../src/core.js'
  ],
  function(yOSON){

    describe('Core', function(){
        it('should be set the staticHost', function(){
            yOSON.AppCore.setStaticHost('http://statichost.com/');
            expect(true).toBeTruthy();
        });

        it('should be set the version of the url', function(){
            yOSON.AppCore.setVersionUrl('?v=0.0.1');
            expect(true).toBeTruthy();
        });

        it('should be create a module', function(){
            yOSON.AppCore.addModule('nombreModulo', function(){
                return {
                    init: function(){

                    }
                }
            });
            expect(true).toBeTruthy();
        });

        it('should be run a module', function(done){
            var functionMustRun = jasmine.createSpy();
            yOSON.AppCore.addModule('moduleA', function(){
                return {
                    init: function(){
                        functionMustRun();
                        expect(functionMustRun).toHaveBeenCalled();
                        done();
                    }
                }
            });
            yOSON.AppCore.runModule('moduleA');
        });

        it('should be execute method from moduleA1 to moduleB1', function(done){
            var functionToBridge = jasmine.createSpy();
            yOSON.AppCore.addModule('moduleA1', function(Sb){
                var privateMethodA1 = function(){
                    functionToBridge();
                    expect(functionToBridge).toHaveBeenCalled();
                    done();
                };
                return {
                    init: function(){
                        Sb.events(['publicMethodInModuleA1'], privateMethodA1, this);
                    }
                }
            });
            yOSON.AppCore.addModule('moduleB1', function(Sb){
                return {
                    init: function(){
                        Sb.trigger('publicMethodInModuleA1');
                    }
                }
            });
            yOSON.AppCore.runModule('moduleA1');
            yOSON.AppCore.runModule('moduleB1');
        });

        it('should be execute method from moduleB2 to moduleA2', function(done){
            var functionToBridge2 = jasmine.createSpy();
            var dependence = "http://cdnjs.cloudflare.com/ajax/libs/Colors.js/1.2.4/colors.min.js";

            yOSON.AppCore.addModule('moduleA2', function(Sb){
                return {
                    init: function(){
                        Sb.trigger('publicMethodInModuleB2');
                    }
                }
            });

            yOSON.AppCore.addModule('moduleB2', function(Sb){
                var privateMethodB2 = function(){
                    functionToBridge2();
                    expect(functionToBridge2).toHaveBeenCalled();
                    done();
                };
                return {
                    init: function(){
                        Sb.events(['publicMethodInModuleB2'], privateMethodB2 , this);
                    }
                }
            });

            yOSON.AppCore.runModule('moduleA2');
            yOSON.AppCore.runModule('moduleB2');
        });
    });
});
