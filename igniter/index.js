const fs = require('fs');
//const User = require('./models/User');
const blueprints = require('./blueprints');
var beautify = require('js-beautify').js;

const generate = async (app, appTempId, callback) => {

    try {
        if (!fs.existsSync(`./${appTempId}`)) {
            fs.mkdirSync(`./${appTempId}`);
        }

        let generateModels = () => {
            if (!fs.existsSync(`./${appTempId}/models`)) {
                fs.mkdirSync(`./${appTempId}/models`);
            }

            for (i = 0; i < app.models.length; i++) {
                let model = app.models[i];
                fs.writeFile(`./${appTempId}/models/${model.name.toLowerCase()}.model.js`, beautify(blueprints.modelSkeleton(model)), function (err) {
                    if (err) throw err;
                    // console.log('Saved!');
                });
            }
            generateModelsIndexFile();
        }

        let generateModelsIndexFile = () => {
            fs.writeFile(`./${appTempId}/models/index.js`, beautify(blueprints.indexFileSkeleton(app.models)), function (err) {
                if (err) throw err;
                // console.log('Saved!');
            });

        }

        let generateRoutes = () => {
            if (!fs.existsSync(`./${appTempId}/routes`)) {
                fs.mkdirSync(`./${appTempId}/routes`);
            }

            for (i = 0; i < app.models.length; i++) {
                let model = app.models[i];
                fs.writeFile(`./${appTempId}/routes/${model.name.toLowerCase()}.route.js`, beautify(blueprints.routeSkeleton(model)), function (err) {
                    if (err) throw err;
                    // console.log('Saved!');
                });
            }
        }

        let generateControllers = () => {
            if (!fs.existsSync(`./${appTempId}/controllers`)) {
                fs.mkdirSync(`./${appTempId}/controllers`);
            }

            for (i = 0; i < app.models.length; i++) {
                let model = app.models[i];
                fs.writeFile(`./${appTempId}/controllers/${model.name.toLowerCase()}.controller.js`, beautify(blueprints.controllerSkeleton(model)), function (err) {
                    if (err) throw err;
                    // console.log('Saved!');
                });
            }
        }

        let generatePackageFile = () => {
            fs.writeFile(`./${appTempId}/package.json`, beautify(blueprints.packageSkeleton(app)), function (err) {
                if (err) throw err;
                // console.log('Saved!');
            });
        }



        let generateIndex = () => {
            fs.writeFile(`./${appTempId}/server.js`, beautify(blueprints.serverSkeleton(app.models)), function (err) {
                if (err) throw err;
                // console.log('Saved!');
            });
        }


        let generateConfigFile = () => {
            if (!fs.existsSync(`./${appTempId}/config`)) {
                fs.mkdirSync(`./${appTempId}/config`);
            }

            fs.writeFile(`./${appTempId}/config/db.config.js`, beautify(blueprints.configSkeleton(app)), function (err) {
                if (err) throw err;
                // console.log('Saved!');
            });

        }



        generateModels();
        generateRoutes();
        generateControllers();
        generateIndex();
        generatePackageFile();
        generateConfigFile();

        callback();
    } catch (error) {
        callback(error);
    }
}

module.exports = generate;