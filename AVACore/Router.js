import express from "express";
import fs from "fs";
import path from "path";
import url from "url";
import { AVAValidator } from "../index";
import { terminalPrefix } from "../AVACore/ACUtil";

const ExRouter = express.Router();


/**
 * @author Lawrence Bensaid <lawrencebensaid@icloud.com>
 */
class Router {

    constructor() {
    }

    routes() {
        const normalizedPath = `${projectPWD}/app/routes`;
        var routes = [];
        if (fs.existsSync(normalizedPath)) {
            fs.readdirSync(normalizedPath).forEach((file) => {
                const extensions = file.split(".");
                if (extensions.length === 2) {
                    if (extensions[extensions.length - 1].toUpperCase() === "JSON") {
                        const route = JSON.parse(JSON.stringify(require(`${projectPWD}/app/routes/${file}`)));
                        routes.push.apply(routes, route);
                    }
                }
            });
        }
        const normalizedPathB = `${projectPWD}/app/middleware`;
        var middleware = [];
        if (fs.existsSync(normalizedPathB)) {
            fs.readdirSync(normalizedPathB).forEach(function (file) {
                const extensions = file.split(".");
                if (extensions.length === 2) {
                    if (extensions[extensions.length - 1].toUpperCase() === "JS") {
                        const middleFile = require(`${projectPWD}/app/middleware/${file}`).default;
                        middleware[extensions[0]] = middleFile;
                    }
                }
            });
        }
        for (var i = 0; i < routes.length; i++) {
            const route = routes[i];
            const method = route.method;
            const routePath = route.path;
            const routeFile = route.file;
            const routeMiddleware = route.middleware;
            const routePermission = route.permission;
            const controllerFile = route.controller;
            const controllerHandler = route.handler;
            var controller;
            if (typeof (route.redirect) === "string") {
                ExRouter[method.toLowerCase()](routePath, (request, response) => {
                    response.redirect(url.format({
                        pathname: route.redirect,
                    }));
                });
                continue;
            }
            var routeHandler;
            if (typeof (controllerFile) === "string") {
                if (typeof (controllerHandler) === "string") {
                    // Controller handler
                    if (fs.existsSync(`${projectPWD}/app/controllers/${controllerFile}.js`)) {
                        controller = require(`${projectPWD}/app/controllers/${controllerFile}.js`).default;
                    } else {
                        console.log(`${terminalPrefix()}\x1b[33m (warn) Endpoint '${routePath}' leads to a controller that doesn't exist: '${controllerFile}'.\x1b[0m`);
                        continue;
                    }
                    routeHandler = new controller();
                    if (typeof routeHandler[controllerHandler] !== "function") {
                        console.log(`${terminalPrefix()}\x1b[33m (warn) Endpoint '${routePath}' leads to a handler/method that doesn't exist: '${controllerHandler}'.\x1b[0m`);
                        continue;
                    }
                    if (typeof routeMiddleware === "object") {
                        const filteredMiddlewareKeys = Object.keys(middleware).filter(function (i) {
                            return routeMiddleware.includes(i);
                        });
                        var filteredMiddleware = [];
                        for (let i = 0; i < filteredMiddlewareKeys.length; i++) {
                            const key = filteredMiddlewareKeys[i];
                            const mw = middleware[key];
                            const mwo = new mw();
                            filteredMiddleware[i] = (request, response, next) => {
                                new AVAValidator(request);
                                mwo.init(request, response, next);
                            };
                        }
                        ExRouter[method.toLowerCase()](routePath, filteredMiddleware, routeHandler[controllerHandler]);
                    } else {
                        ExRouter[method.toLowerCase()](routePath, (request, response, next) => {
                            new AVAValidator(request);
                            next();
                        }, routeHandler[controllerHandler]);
                    }
                } else {
                    // ViewController handler
                    if (fs.existsSync(path.join(__dirname, `./views/${controllerFile}.js`))) {
                        controller = require(`./views/${controllerFile}.js`).default;
                    } else {
                        controller = require(`${projectPWD}/app/views/${controllerFile}.js`).default;
                    }
                    const cntrlr = new controller((routeHandler, that) => {
                        if (typeof routeMiddleware === "object") {
                            const filteredMiddlewareKeys = Object.keys(middleware).filter(function (i) {
                                return routeMiddleware.includes(i);
                            });
                            var filteredMiddleware = [];
                            for (let i = 0; i < filteredMiddlewareKeys.length; i++) {
                                const key = filteredMiddlewareKeys[i];
                                const mw = middleware[key];
                                const mwo = new mw();
                                filteredMiddleware[i] = (request, response, next) => { mwo.init(request, response, next, cntrlr); };;
                            }
                            ExRouter[method.toLowerCase()](routePath, filteredMiddleware, (request, response) => { routeHandler(request, response, that); });
                        } else {
                            ExRouter[method.toLowerCase()](routePath, (request, response) => { routeHandler(request, response, that); });
                        }
                    });
                }
                continue;
            }
            if (typeof routeFile === "string") {
                ExRouter.get(routePath, (request, response) => {
                    response.render(routeFile);
                });
                continue;
            }
        }
        ExRouter.use((request, response) => {
            const layout = "layout.hbs";
            response.status(404);
            response.render("status/404.hbs", {
                layout: layout
            });
        });
        return ExRouter;
    }

}


module.exports = Router;
export default Router;