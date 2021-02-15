const pluralize = require('pluralize');
const supportedTypes = ['STRING', 'TEXT', 'TEXT', 'INTEGER', 'FLOAT', 'DOUBLE', 'BIGINT', 'BOOLEAN', 'DECIMAL'];
const supportedValidations = ['isEmail', 'isUrl', 'isIP', 'isIPv4', 'isIPv6','isAlphanumeric', 'isInt', 'isDecimal', 'isLowercase', 'isIPv6', 'isUppercase', 'notNull', 'notEmpty']
const supportedConstraints = ['allowNull', 'unique'];
const supportedAssociations = ['hasMany', 'belongsTo', 'hasOne', 'belongsToMany'];

function getDataType(datatype) {
    let type = datatype.toUpperCase();
    let dataTypeString = ``;


    if (supportedTypes.includes(type)) {
        dataTypeString = `DataTypes.${type}`
    } else {
        throw "unsupported DataType " + type;
    }

    return dataTypeString;
}

const getValidations = (field)=>{
    let validtionString = ``;
    if(field.hasOwnProperty('validations')){
        let validations = field['validations'];
        validations.forEach(element => {
            if(supportedValidations.includes(element)){
                validtionString = validtionString + `${element} : true ,`
            }else{
                throw "unsupported validation " + element;
            }
        });
    }
    return validtionString;

}
const getConstraints = (field)=>{
    let constraintString = `,`;
    let constraints  = null;
    if(field.hasOwnProperty('constraints')){
        constraints = field['constraints'];
        constraints.forEach(element => {
            if(supportedConstraints.includes(element)){
                constraintString = constraintString + `${element} : true ,`
            }else{
                throw "unsupported constraint " + element;
            }
        });
        if(!constraints.includes('allowNull')){
            constraintString = constraintString + `allowNull : false ,`
        }
    }

     if(constraints == null){
        constraintString = constraintString + `allowNull : false ,`
    }
    return constraintString;
}

const fieldSkeleton = (fields) => {
    let fieldsString = ``;

    for (let i = 0; i < fields.length; i++) {
        let field = fields[i];
        fieldsString = fieldsString + `${field.name}: {
             type : ${getDataType(field.type)},
             validate : {
                    ${getValidations(field)}
             }
             ${getConstraints(field)}
         },
         `
    }


    return fieldsString;
}

const getDefinedModels = (models) => {
    let definedModels = ``;

    for (let i = 0; i < models.length; i++) {
        let model = models[i];
        definedModels = definedModels + `db.${model.name.toLowerCase()} = require("./${model.name.toLowerCase()}.model.js")(sequelize, Sequelize);
     `
    }

    return definedModels;


}

const getDefinedRouters = (models) => {

    let definedRouters = ``;

    for (let i = 0; i < models.length; i++) {
        let model = models[i];
        definedRouters = definedRouters + ` app.use("/${pluralize(model.name.toLowerCase(), 5)}" , require('./routes/${model.name.toLowerCase()}.route'))
     `
    }

    return definedRouters;




}


const modelSkeleton = (model) => {
    return `
     
     const {DataTypes} = require('sequelize');
 
 
     const ${model.name}= (sequelize) => sequelize.define("${model.name}", {
       ${fieldSkeleton(model.fields)}
     });
 
 
     module.exports = ${model.name};  
 
     `
}

const indexFileSkeleton = (models) => {
    return `
     const dbConfig = require("../config/db.config.js");
 
     const Sequelize = require("sequelize");
     const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
     host: dbConfig.HOST,
     dialect: dbConfig.dialect,
     operatorsAliases: false,
 
     pool: {
         max: dbConfig.pool.max,
         min: dbConfig.pool.min,
         acquire: dbConfig.pool.acquire,
         idle: dbConfig.pool.idle
     }
     });
 
     const db = {};
 
     db.Sequelize = Sequelize;
     db.sequelize = sequelize;
     ${getDefinedModels(models)}
     ${getDefinedAssociations(models)}
 
    
    
 
     module.exports = db;
     
     
     
     `
}

const routeSkeleton = (model) => {
    let modelName = model.name.toLowerCase();

    return `
       const express = require('express');
       const router = express.Router();
       
       
       router.get('/', require('../controllers/${modelName}.controller.js').findAll);
       router.post('/', require('../controllers/${modelName}.controller.js').create);
       router.delete('/delete/:id', require('../controllers/${modelName}.controller.js').delete);
       router.get('/:id',require('../controllers/${modelName}.controller.js').findOne);
       router.put('/update/:id',require('../controllers/${modelName}.controller.js').update);
   
       
       
       module.exports = router;
       
     
       `

}

const controllerSkeleton = (model) => {
    let modelName = model.name;
    return `
     const db = require("../models");
     const ${modelName} = db.${modelName.toLowerCase()};
     const Op = db.Sequelize.Op;
 
     exports.create = async (req, res) => {
         try {
             let ${modelName.toLowerCase()} = await ${modelName}.create(req.body);
             res.send(${modelName.toLowerCase()})
         } catch (error) {
             res.send(error)
         }
     };
 
     exports.findAll = async (req, res) => {
         let order = [
             ['id', 'DESC']
         ]
         let options = {order : order}
         if(req.query.offest != undefined || req.query.limit != undefined){
             options.offset = parseInt(req.query.offset);
             options.limit = parseInt(req.query.limit);
         }
         let${pluralize(modelName.toLowerCase(), 5)} = await ${modelName}.findAll(options);
         res.send(${pluralize(modelName.toLowerCase(), 5)})
     }
 
 
     exports.findOne = async (req, res) => {
         let where = {}
         if(req.params.id != undefined){
             where.id = req.params.id;
         }
         let options = {where}
         let ${pluralize(modelName.toLowerCase(), 5)}  = await ${modelName}.findAll(options);
         res.send(${pluralize(modelName.toLowerCase(), 5)} )
     };
 
     exports.update = async (req, res) => {
         try {
             let where = {}
             if(req.params.id != undefined){
                 where.id = req.params.id;
             }
             let options = {where}
     
             await ${modelName}.update(req.body , options)
             let ${modelName.toLowerCase()} = await  ${modelName}.findOne(options)
             res.send(${modelName.toLowerCase()})
         } catch (error) {
             res.send(error)
         }
     };
 
     exports.delete = async (req, res) => {
         try {
             let where =  {}
             if(req.params.id != undefined){
                 where.id = req.params.id;
             }
             let options = {where}
             let ${modelName.toLowerCase()} = await  ${modelName}.findOne(options)
             await  ${modelName}.destroy(options)
             res.send(${modelName.toLowerCase()})
         } catch (error) {
             res.send(error)
         }
     };
 
 
     //add your custom logic and functinalities
 
     `
}

const getDefinedAssociations = (models) => {

    let associations = ``;
  

    models.forEach(model => {
        if (model['associations'] != undefined) {
            model['associations'].forEach(element => {
                if (!supportedAssociations.includes(element.name)) {
                    throw 'Unsupported association ' + element.name;
                }

                let assosiation = `
               db.${model.name.toLowerCase()}.${element.name}(db.${element.target.toLowerCase()});
                 `
                associations = associations + assosiation;
            });

        }

    })

    return associations;
}

const serverSkeleton = (models) => {
    return `
     
     const express = require("express");
     const cors = require("cors");
     const db = require("./models");
     const app = express();
 
 
     db.sequelize.sync();
 
     let corsOptions = {
     origin: "http://localhost:8081"
     };
 
     app.use(cors(corsOptions));
     app.use(express.json())
 
     ${getDefinedRouters(models)}
   
 
     
 
 
     app.get("/", (req, res) => {
     res.json({ message: "Welcome to IGNITER application." });
     });
 
     // set port, listen for requests
     const PORT = process.env.PORT || 8000;
     app.listen(PORT, () => {
     console.log('Server is running on port '+ PORT);
     });
     
     `
}

const configSkeleton = (app) => {
    return `
     module.exports = {
         HOST: "${app.database.host}",
         USER: "${app.database.user}",
         PASSWORD: "${app.database.password}",
         DB: "${app.database.name}",
         dialect: "mysql",
         pool: {
           max: 5,
           min: 0,
           acquire: 30000,
           idle: 10000
         }
       };
     
     `
}
const packageSkeleton = (app) => {
    return `
     {
         "name": "${app.name.toLowerCase()}",
         "version": "${app.version}",
         "description": "${app.description.toLowerCase()}",
         "main": "server.js",
         "scripts": {
           "start": "nodemon server.js"
         },
         "author": "author",
         "license": "ISC",
         "dependencies": {
           "cors": "^2.8.5",
           "dotenv": "^8.2.0",
           "express": "^4.17.1",
           "jsonwebtoken": "^8.5.1",
           "mysql2": "^2.2.5",
           "sequelize": "^6.5.0"
         },
         "devDependencies": {
           "nodemon": "^2.0.7"
         }
       }
 
     `
}


module.exports = {
    modelSkeleton,
    routeSkeleton,
    serverSkeleton,
    controllerSkeleton,
    indexFileSkeleton,
    configSkeleton,
    packageSkeleton
}