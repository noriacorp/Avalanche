const projectPWD = process.env.PWD;
const fs = require("fs");
const package = fs.existsSync(`${projectPWD}/package.json`) ? require(`${projectPWD}/package.json`) : undefined;
const avalanchePackage = require("../package.json");

const { COPYFILE_EXCL } = fs.constants;
const folders = [
  "/app",
  "/app/controllers",
  "/app/environments",
  "/app/localisations",
  "/app/middleware",
  "/app/public",
  "/app/routes",
  "/app/templates",
  "/app/templates/emails",
  "/app/templates/layouts",
  "/app/templates/partials",
  "/app/templates/status",
  "/app/views",
  "/app/helpers"
];
const files = [
  {
    src: "/core/components/environment",
    dest: "/app/environments/development.environment.json",
    standard: true
  },
  {
    src: "/core/components/helpers",
    dest: "/app/helpers/util.js",
    standard: true
  },
  {
    src: "/core/components/example1_status404",
    dest: "/app/templates/status/404.hbs",
    template: "example1"
  },
  {
    src: "/core/components/example1_controller",
    dest: "/app/controllers/MainController.js",
    template: "example1"
  },
  {
    src: "/core/components/example1_view",
    dest: "/app/views/MainViewController.js",
    template: "example1"
  },
  {
    src: "/core/components/example1_routes_api",
    dest: "/app/routes/api.json",
    template: "example1"
  },
  {
    src: "/core/components/example1_routes_web",
    dest: "/app/routes/web.json",
    template: "example1"
  },
  {
    src: "/core/components/example1_template",
    dest: "/app/templates/default.hbs",
    template: "example1"
  },
  {
    src: "/core/components/example1_template_layout",
    dest: "/app/templates/layouts/layout.hbs",
    template: "example1"
  },
  {
    src: "/core/components/example2_controller",
    dest: "/app/controllers/PostController.js",
    template: "example2"
  },
  {
    src: "/core/components/example2_routes",
    dest: "/app/routes/api.json",
    template: "example2"
  }
];


function init() {
  if(typeof package.avalancheConfig === "object") {
    console.log("\x1b[31m%s\x1b[0m", "[AVALANCHE] (error) Project has already been initialized.");
    process.exit();
  }
  console.log("\x1b[32m%s\x1b[0m", `[AVALANCHE] Initializing project...`);
  const example = typeof arguments[0] === "string" ? arguments[0] : null;
  for (const folder of folders) {
    const path = `${projectPWD}${folder}`;
    if(!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
  }
  if(typeof example === "string") {
    console.log(`\x1b[32m[AVALANCHE] Preparing \x1b[3m${example}\x1b[0m\x1b[32m...\x1b[0m`);
  }
  for (const file of files) {
    const src = `${__dirname}/..${file.src}`;
    const dest = `${projectPWD}${file.dest}`;
    if(fs.existsSync(src) && !fs.existsSync(dest) && (file.standard === true || file.template === example)) {
      fs.copyFileSync(src, dest, COPYFILE_EXCL);
    }
  }
  var file = package;
  // file.nodemonConfig = { ignore: ["/app/public/*"] };
  file.avalancheConfig = { preferredEnvironment: "development" };
  fs.writeFileSync("./package.json", JSON.stringify(file, null, 2));
  console.log("\x1b[32m%s\x1b[0m", `[AVALANCHE] Project has been initialized successfully!`);
}

/**
 * Runs your Avalanche application
 */
function run() {
  const environment = typeof arguments[0] === "string" ? arguments[0] : null;
  console.log("\x1b[32m%s\x1b[0m", `[AVALANCHE] Starting server...`);
  require("./Main.js").run(environment);
}

function routes() {
  const routes = getRoutes(projectPWD);
  if(routes.length <= 0) {
    console.log("\x1b[32m%s\x1b[0m", "[AVALANCHE] Can't show routes because there aren't any routes in the project.");
    return;
  }
  var string = "\n  \x1b[1m++======================================================================\x1b[0m\n";
  string += `  \x1b[1m||\x1b[0m\n`;
  for (const route of routes) {
    const path = route.path;
    const method = route.method;
    const controller = route.controller;
    const handler = typeof route.handler === "string" ? route.handler : null;
    const color =
      method === "GET" ? 32 :
      method === "POST" ? 33 :
      method === "PUT" ? 34 :
      method === "DELETE" ? 31 : 0
    string += `  \x1b[1m||\x1b[0m  [\x1b[${color}m\x1b[1m${method}\x1b[0m] \t \x1b[3m${path}\x1b[0m\t        \x1b[32m${controller}\x1b[0m${handler ? `.\x1b[33m${handler}\x1b[0m()` : ".\x1b[34mconstructor\x1b[0m" }\n`;
  }
  string += `  \x1b[1m||\x1b[0m\n`;
  string += "  \x1b[1m++======================================================================\x1b[0m\n";
  console.log(string);
}

function upgrade() {
  // Upgrade patterns not yet implemented.
  console.log("\x1b[32m%s\x1b[0m", "[AVALANCHE] Checking for update...");
  console.log("\x1b[31m%s\x1b[0m", "[AVALANCHE] (error) No upgrade pattern found. Check the GitHub Wiki for more information.");
}

function info() {
  const isNodeProject = typeof package === "object";
  var isAvalancheProject = isNodeProject ? typeof package.avalancheConfig === "object" : false;

  var string = "\n";
  string += `  \x1b[1m++==============================[Avalanche info]==============================\n`;
  string += `  \x1b[1m||\x1b[0m\n`;
  string += `  \x1b[1m||\x1b[0m   Version:\t\t\t  ${avalanchePackage.version}\n`;
  string += `  \x1b[1m||\x1b[0m   CLI Directory:\t\t  ${__dirname}\n`;
  string += `  \x1b[1m||\x1b[0m\n`;
  string += `  \x1b[1m++===============================[Project info]===============================\n`;
  string += `  \x1b[1m||\x1b[0m\n`;
  string += `  \x1b[1m||\x1b[0m   isNodeProject:\t\t  \x1b[33m\x1b[1m${isNodeProject}\x1b[0m\n`;
  string += `  \x1b[1m||\x1b[0m   isAvalancheProject:\t  \x1b[33m\x1b[1m${isAvalancheProject}\x1b[0m\n`;
  if(isAvalancheProject) {
    string += `  \x1b[1m||\x1b[0m   Models:\t\t\t  \x1b[32m\x1b[1m${getModels(projectPWD).length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Controllers:\t\t  \x1b[32m\x1b[1m${getControllers(projectPWD).length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Routes:\t\t\t  \x1b[32m\x1b[1m${getRoutes(projectPWD).length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Middleware:\t\t  \x1b[32m\x1b[1m${getMiddleware(projectPWD).length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Localisations:\t\t  \x1b[32m\x1b[1m${getLocalisations(projectPWD).length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Translations:\t\t  \x1b[32m\x1b[1m${getTranslations(projectPWD).length}\x1b[0m\n`;
  }
  string += `  \x1b[1m||\x1b[0m\n`;
  string += `  \x1b[1m++============================================================================\x1b[0m\n`;
  console.log(string);
}

function fix() {
  console.log("\x1b[32m%s\x1b[0m", "[AVALANCHE] Fixing project...");
  var fixedStructure = false;
  for (const folder of folders) {
    const path = `${projectPWD}${folder}`;
    if(!fs.existsSync(path)) {
      fs.mkdirSync(path);
      fixedStructure = true;
    }
  }
  for (const file of files) {
    const src = `${__dirname}/..${file.src}`;
    const dest = `${projectPWD}${file.dest}`;
    if(fs.existsSync(src) && !fs.existsSync(dest) && file.standard === true) {
      fs.copyFileSync(src, dest, COPYFILE_EXCL);
      fixedStructure = true;
    }
  }
  if(fixedStructure) {
    console.log("\x1b[32m%s\x1b[0m", "[AVALANCHE] Restored project structure");
  }
}

function makeController() {
  const name = "TestController";
  const src = `${__dirname}/../core/components/TEMPLATE_controller`;
  const dest = `${projectPWD}/app/controllers/${name}.js`;

  if(fs.existsSync(src) && !fs.existsSync(dest)) {
    fs.copyFileSync(src, dest, COPYFILE_EXCL);
    // var file = require(dest);
  }
}

function getRoutes(projectDir) {
  const normalizedPath = `${projectDir}/app/routes`;
  var routes = [];
  if (!fs.existsSync(normalizedPath)) {
    return routes;
  }
  fs.readdirSync(normalizedPath).forEach(function (file) {
    const extensions = file.split(".");
    if (extensions.length = 2) {
      if (extensions[extensions.length - 1].toUpperCase() === "JSON") {
        const route = JSON.parse(JSON.stringify(require(`${projectDir}/app/routes/${file}`)));
        routes.push.apply(routes, route);
      }
    }
  });
  return routes;
}

function getControllers(projectDir) {
  const normalizedPath = `${projectDir}/app/controllers`;
  var controllers = [];
  if (!fs.existsSync(normalizedPath)) {
    return controllers;
  }
  fs.readdirSync(normalizedPath).forEach(function (file) {
    const extensions = file.split(".");
    if (extensions.length = 2) {
      if (extensions[extensions.length - 1].toUpperCase() === "JS") {
        controllers.push(extensions[0]);
      }
    }
  });
  return controllers;
}

function getMiddleware(projectDir) {
  const normalizedPath = `${projectDir}/app/middleware`;
  var middleware = [];
  if (!fs.existsSync(normalizedPath)) {
    return middleware;
  }
  fs.readdirSync(normalizedPath).forEach(function (file) {
    const extensions = file.split(".");
    if (extensions.length = 2) {
      if (extensions[extensions.length - 1].toUpperCase() === "JS") {
        middleware.push(extensions[0]);
      }
    }
  });
  return middleware;
}

function getLocalisations(projectDir) {
  const normalizedPath = `${projectDir}/app/localisations`;
  var localisations = [];
  if (!fs.existsSync(normalizedPath)) {
    return localisations;
  }
  fs.readdirSync(normalizedPath).forEach(function (file) {
    const extensions = file.split(".");
    if (extensions.length = 2) {
      if (extensions[extensions.length - 1].toUpperCase() === "JSON") {
        localisations.push(extensions[0]);
      }
    }
  });
  return localisations;
}

function getTranslations(projectDir) {
  const normalizedPath = `${projectDir}/app/localisations`;
  var translations = [];
  if (!fs.existsSync(normalizedPath)) {
    return translations;
  }
  fs.readdirSync(normalizedPath).forEach(function (file) {
    const extensions = file.split(".");
    if (extensions.length = 2) {
      if (extensions[extensions.length - 1].toUpperCase() === "JSON") {
        const translationSet = JSON.parse(JSON.stringify(require(`${projectDir}/app/localisations/${file}`)));
        for (const translation of Object.keys(translationSet)) {
          translations.push(translationSet[translation]);
        }
      }
    }
  });
  return translations;
}

function getModels(projectDir) {
  const normalizedPath = `${projectDir}/app/models`;
  var models = [];
  if (!fs.existsSync(normalizedPath)) {
    return models;
  }
  fs.readdirSync(normalizedPath).forEach(function (file) {
    const extensions = file.split(".");
    if (extensions.length = 2) {
      if (extensions[extensions.length - 1].toUpperCase() === "JS") {
        models.push(extensions[0]);
      }
    }
  });
  return models;
}

module.exports = {
  fix: fix,
  run: run,
  init: init,
  info: info,
  routes: routes,
  upgrade: upgrade,
  makeController: makeController
};