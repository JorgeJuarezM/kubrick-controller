# kubrick-controller

### How to Install
```bash
npm install --save kubrick-controller
```

### Use with express
```js
var kubrickController = require("kubrick-controller");
var express = require("express");

var app = express();

var controllers = kubrickController(app).bind(__dirname + "/controllers");

app.listen(3000);
```

### Creating Controllers
#### Simple way
>controllers/usersController.js

```js
module.exports = {
    index: {
        // this will be transtaled to get("/users/")
        get: function(req, res){
            res.end("This is a index of Users");
        },
        // this will be translated to post("/users/");
        post: function(req, res){
            res.end("This is a post for index of Users");
        }
    }
    // GET method
    get: {
        // GET: /users/list
        list: function(req, res){
            res.end("Hello World");
        }
    },
    // POST method
    post: {
        // POST: /users/save
        save: function(req, res){
            res.json(req.body);
        }
    }
}
```

**The route will be built according to the following structure**

>[base_path]/[controller_name]/[method_key]/

* base_path has default to: `/`
* controller_name is substracted from controller file name: `[controller_name]Controller.js`

**How to define base_path**
```js
var base_path = "api";
kubrickController(app).bind(__dirname + "/controllers", base_path);
```
Above will result `/api/[controller_name]/[method_key]`


### Route Params

You can define controllers with route params, for example:

>controllers/usersController.js

```js
module.exports = {
    // GET method
    get: {
        /**
        * this will be translated to get("/users/list/:param_name")
        * this feaure will be deprecated in the next major versions
        */
        list: function(req, res, param_name){
            res.end(param_name);
        }
    },
    /**
    * Since Version 1.2.1, you can define params in the route
    * this will be translated to get("/users/:user_id/profiles")
    * params will be added to end of arguments automatically
    * this feature is not supported in older versions
    */
    "/:user_id/profiles": {
        get: {
            function(req, res, user_id){
                res.end(user_id);
            }
        }
    }
}
```

### Middlewares

To use midlewares is very simple. Just use an Array!

```js
    // File: usersController.js
    module.exports = {
        // this will be translated to get("/users/list");
        list: {
            get: [function Middleware(req, res, next){
                console.log("this is a middleware!");
                next();
            }, function(req, res){
                res.end("Middleware has been executed");
            }]
        }
    };
```
