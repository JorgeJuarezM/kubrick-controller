var fs = require("fs");
var path = require("path");

String.prototype.toSnake = function() {
    return this.replace(/\W+/g, "_").replace(/([a-z\d])([A-Z])/g, "$1_$2").toString().toLowerCase();
};

String.prototype.toPascal = function() {
    return this.toSnake()
        .replace(/_([a-z])/g, function(g) {
            return g[1].toUpperCase();
        }).replace(/^([a-z])/g, function(g) {
            return g.toUpperCase();
        });
}

module.exports = function(app) {
    return {
        bind: function(dirname, base_path) {
            //Obtener ruta /controller/?action/?:param1/?:param2/etc
            //Obtener nombre del controlador como nombre del modulo
            //Obtener parametros


            //verificamos que el directorio es un directorio y existe
            if (typeof dirname != "string") throw new Error("Directorio No Valido");
            if (!fs.existsSync(dirname)) throw new Error("Directorio no Existe");
            if (!fs.lstatSync(dirname).isDirectory()) throw new Error("La ruta no es un directorio");


            var controllers = fs.readdirSync(dirname);
            controllers.forEach(function(ctrl) {
                var controller = require(path.join(dirname, ctrl));
                var controller_name = ctrl.replace("Controller.js", "").toSnake();
                var controllerKey = ctrl.toPascal();

                
                
                var bindMethods = function(method, controller_method, version){
                    for (var action_controller in controller_method) {
                        var action_fn = controller_method[action_controller];
                        var midlewares = [];
                        if(Array.isArray(action_fn)){
                            midlewares = action_fn;
                            action_fn = midlewares.pop();
                        }
                        var params = action_fn.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s))/mg, "").match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1].split(",");

                        if (params.length < 2) {
                            throw new Error("Controller function need at least 2 params");
                        }
                        else {
                            params.splice(0, 2);
                        }

                        var action_name = action_controller.toLocaleLowerCase();

                        var module = (controller_name == "index") ? "/" : controller_name;
                        var action = (action_name == "index") ? "/" : action_name;


                        var action_path = path.join("/", (base_path || "/"), module, action).replace(/\/$/g, "");
                        if(action_path.length == 0) action_path = "/";
                        
                        if(version == 1){
                            params.forEach(function(p) {
                                action_path = path.join(action_path, "/:" + p);
                            });
                        }


                        try{
                            if(process.env.log){
                                console.log("binding [%s]  %s (v%s)", method, action_path, version);
                            }
                            app[method](action_path, midlewares, function(req, res) {
                                req.controllerName = controllerKey;
                                var action_params = [req, res];
                                for (var k in req.params) {
                                    action_params.push(req.params[k]);
                                }
                                action_fn.apply({}, action_params);
                            });
                        }catch(e){
                            throw e;
                        }

                    }
                }
                
                for (var method in controller) {
                    var controller_methods = controller[method];
                    if(["post", "get", "delete", "put", "patch"].indexOf(method) > -1){
                        bindMethods(method, controller_methods, 1);
                    }else{
                        var action = method;
                        for(var method in controller_methods){
                            var tmp_action = {};
                            tmp_action[action] = controller_methods[method];
                            bindMethods(method, tmp_action, 2);
                        }
                    }
                }
            });

            return this;
        }
    }
}