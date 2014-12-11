
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
            var rootProps = Object.keys(rootObject);
            for(var k = 0; k < rootProps.length; k++){
                rootExtension[rootProps[k]] = rootObject[rootProps[k]];

            }

            //inherit from parent core
            var coreProps = Object.keys(coreObject);
            for(var j = 0; j < coreProps.length; j++){
                coreExtension[coreProps[j]] = coreObject[coreProps[j]];
            }

            return Capsule.extend(rootExtension, coreExtension, deadEndObject);
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
        var deadProps = Object.keys(coreDeadend);
        for(var r = 0; r < deadProps.length; r++){

            coreMergeObject[deadProps[r]] = coreDeadend[deadProps[r]];

        }

        // freeze the core
        var frozenCore = Object.freeze(coreObject);
        var frozenMergeCore = Object.freeze(coreMergeObject);
        var coreProps = Object.keys(frozenCore);
        var mergeCoreProps = Object.keys(frozenMergeCore);

        //now extend the root merge object with the core properties and their descriptors
        for(var l = 0; l < coreProps.length; l++){

            Object.defineProperty(rootMergeObject, coreProps[l], Object.getOwnPropertyDescriptor(frozenCore, coreProps[l]) );
            rootMergeObject[coreProps[l]] = frozenCore[coreProps[l]];

        }
        //extend the root merge object with the rootobject
        var rootProps = Object.keys(rootObject);
        for(var h = 0; h < rootProps.length; h++){

            rootMergeObject[rootProps[h]] = rootObject[rootProps[h]];
        }
        //now extend the root merge object with the core deadend properties and their descriptors
        for(var t = 0; t < mergeCoreProps.length; t++){

            Object.defineProperty(rootMergeObject, mergeCoreProps[t], Object.getOwnPropertyDescriptor(frozenMergeCore, mergeCoreProps[t]) );
            rootMergeObject[mergeCoreProps[t]] = frozenMergeCore[mergeCoreProps[t]];

        }

        var rootDeadend = {};
        if(deadEndObject.constructor === Array &&
            deadEndObject.length >= 2 &&
            typeof deadEndObject[0] === "object"){

            rootDeadend = deadEndObject[0];
        }
        //extend the root merge object with the root deadend properties
        var deadRootProps = Object.keys(rootDeadend);
        for(var y = 0; y < deadRootProps.length; y++){

            rootMergeObject[deadRootProps[y]] = rootDeadend[deadRootProps[y]];
        }


        // return the sealed the root object
        return Object.seal(rootMergeObject);
    }


};

module.exports = Capsule;