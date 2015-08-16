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
    get: {
        list: function(req, res){
            res.end("Hello World");
        }
    },
    post: {
        save: function(req, res){
            res.json(req.body);
        }
    }
}
```
Above will result:

GET: /users/list
>Hello World

And POST: /users/save
>{key: "value"}

**The route will be built according to the following structure**

>[base_path]/[controller_name]/[method_key]/

* base_path has default to: `/`
* controller_name is substracted from controller file name: `[controller_name]Controller.js`

**How to change base_path**
```js
var base_path = "api";
kubrickController(app).bind(__dirname + "/controllers", base_path);
```
Above will result `/api/[controller_name]/[method_key]`


##Route Params

You can define controllers with route params, for example:

>controllers/usersController.js

```js
module.exports = {
    get: {
        list: function(req, res, param_name){
            res.end(param_name);
        }
    }
}
```

Above will result
>GET: /users/list/:param_name

If you call the next route:

>GET: /users/list/HelloWorld

Will Result to:

>HelloWorld
