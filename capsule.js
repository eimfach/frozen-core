
var Capsule = {


    extend: function(rootObject, coreObject, deadEndObject){

        if(typeof rootObject !== "object") rootObject = {};
        if(coreObject === undefined) coreObject = rootObject;
        if(typeof coreObject !== "object") coreObject = {};
        if(typeof deadEndObject !== "object") deadEndObject = {};

        // to not insert deadend properties into the inherited closures
        var rootMergeObject = {};
        var coreMergeObject = {};


        // add a extension method to each object within its core, which others can inherit from
        coreObject.extend = function(rootExtension, coreExtension, deadEndObject){

            //inherit from parent root
            Object.keys(rootExtension).forEach(function(property){
                rootObject[property] = rootExtension[property];
            });

            //inherit from parent core
            Object.keys(coreObject).forEach(function(property){
                coreExtension[property] = coreObject[property];
            });

            return Capsule.extend(rootObject, coreExtension, deadEndObject);
        };

        var coreDeadend = {};
        if(typeof deadEndObject === "object"){

            if(deadEndObject.constructor === Array){
                if(deadEndObject.length === 1 && typeof deadEndObject[0] === "object"){

                    coreDeadend = deadEndObject[0];

                } else if(deadEndObject.length >= 2 && typeof deadEndObject[1] === "object"){
                    coreDeadend = deadEndObject[1];
                }
            } else {
                coreDeadend = deadEndObject;
            }

        }
        // extend the core merge object with the deadend core properties from the deadend object
        Object.keys(coreDeadend).forEach(function(property){
            coreMergeObject[property] = coreDeadend[property];
        });


        // freeze the core
        var frozenCore = Object.freeze(coreObject);
        var frozenMergeCore = Object.freeze(coreMergeObject);

        //now extend the root merge object with the core properties and their descriptors
        Object.keys(frozenCore).forEach(function(property){
            Object.defineProperty(rootMergeObject, property, Object.getOwnPropertyDescriptor(frozenCore, property) );
            rootMergeObject[property] = frozenCore[property];

        });

        //extend the root merge object with the rootobject
        Object.keys(rootObject).forEach(function(property){
            rootMergeObject[property] = rootObject[property];
        });

        //now extend the root merge object with the core deadend properties and their descriptors
        Object.keys(frozenMergeCore).forEach(function(property){
            Object.defineProperty(rootMergeObject, property, Object.getOwnPropertyDescriptor(frozenMergeCore, property) );
            rootMergeObject[property] = frozenMergeCore[property];

        });

        var rootDeadend = {};
        if(deadEndObject.constructor === Array &&
            deadEndObject.length >= 2 &&
            typeof deadEndObject[0] === "object"){

            rootDeadend = deadEndObject[0];
        }
        //extend the root merge object with the root deadend properties
        Object.keys(rootDeadend).forEach(function(property){
            rootMergeObject[property] = rootDeadend[property];

        });

        // return the object sealed
        return Object.seal(rootMergeObject);
    }


};

module.exports = Capsule;