
var Capsule = {

    extend: function(rootObject, coreObject, deadEndObject){

        //param check
        if(typeof rootObject !== "object") rootObject = {};
        if(coreObject === undefined) coreObject = rootObject;
        if(typeof coreObject !== "object") coreObject = {};
        if(typeof deadEndObject !== "object") deadEndObject = {};

        // to not insert deadend properties into the inherited closures
        var newObject = {};
        var coreMergeObject = {};

        // add a extension method to each object within its core, which others can inherit from
        coreObject.extend = function(rootExtension, coreExtension, deadEndObject){

            //param check
            if(typeof rootExtension !== "object") rootExtension = {};
            if(typeof coreExtension !== "object") coreExtension = {};

            rootExtension.parent = newObject;
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
        coreObject.bubble = function(call){
            if(typeof newObject[call] === "function"){
                if(typeof newObject.parent === "object"){

                    if(newObject[call] !== newObject.parent[call]){
                        newObject[call]();

                    } // else -> the function is a reference to its parents one
                    newObject.parent.bubble(call);
                } else {
                    newObject[call](); // parent is the forebear, bubbling end
                }
            } // bubble interrupted
        };

        //param check
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
        // extend the new object with the deadend core properties from the deadend object
        Object.keys(coreDeadend).forEach(function(property){
            coreMergeObject[property] = coreDeadend[property];
        });

        // freeze the core
        var frozenCore = Object.freeze(coreObject);
        var frozenMergeCore = Object.freeze(coreMergeObject);

        //now extend the new object with the core properties and their descriptors
        Object.keys(frozenCore).forEach(function(property){
            Object.defineProperty(newObject, property, Object.getOwnPropertyDescriptor(frozenCore, property) );
            newObject[property] = frozenCore[property];

        });

        //extend the new object with the rootobject
        Object.keys(rootObject).forEach(function(property){
            newObject[property] = rootObject[property];
        });

        //now extend the new object with the core deadend properties and their descriptors
        Object.keys(frozenMergeCore).forEach(function(property){
            Object.defineProperty(newObject, property, Object.getOwnPropertyDescriptor(frozenMergeCore, property) );
            newObject[property] = frozenMergeCore[property];

        });

        //param check
        var rootDeadend = {};
        if(deadEndObject.constructor === Array &&
            deadEndObject.length >= 2 &&
            typeof deadEndObject[0] === "object"){

            rootDeadend = deadEndObject[0];
        }
        //extend the new object with the root deadend properties
        Object.keys(rootDeadend).forEach(function(property){
            newObject[property] = rootDeadend[property];

        });

        // return the new object sealed
        return Object.seal(newObject);
    }


};

module.exports = Capsule;