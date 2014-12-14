var Capsule = {

    /**
     *
     *
     * @param state Spec for Object state, mutable properties
     * @param core Spec for immutable properties (Provide just one Object for pureness)
     * @param deadEnd Spec for non inheritable properties
     */
    extend: function(state, core, deadEnd){
        //param check
        if(typeof state !== "object") state = {};
        if(core === undefined) core = state;
        if(typeof core !== "object") core = {};
        if(typeof deadEnd !== "object") deadEnd = {};

        // to not insert deadend properties into the inherited closures
        var parentObject = {};
        var coreMergeObject = {};

        // add a extension method to each object within its core, which others can inherit from
        core.extend = function(stateExtension, coreExtension, deadEnd){

            //param check
            if(typeof stateExtension !== "object") stateExtension = {};
            if(typeof coreExtension !== "object") coreExtension = stateExtension;
            if(state === core) state = {}; //if a parent state was never given parent state equals core - prevent that
            var mergeObject = {};

            //extend / overwrite the parent state
            Object.keys(stateExtension).forEach(function(property){
                state[property] = stateExtension[property];
            });
            //merge the parent core (overwrite possible)
            Object.keys(core).forEach(function(property){
                mergeObject[property] = core[property];
            });

            Object.keys(coreExtension).forEach(function(property){
                //here we overwrite existing / extend core props if given - make type check

                // has the core this property already?
                if(typeof core[property] === "undefined"){
                    mergeObject[property] = coreExtension[property];

                //property is already in parent
                } else if(typeof coreExtension[property] === typeof parentObject[property]) {

                    //overwrite on same type
                    mergeObject[property] = coreExtension[property];

                }
            });

            mergeObject.parent = parentObject;

            return Capsule.extend(state, mergeObject, deadEnd);
        };
        core.bubble = function(call){
            if(typeof parentObject[call] === "function"){
                if(typeof parentObject.parent === "object"){

                    if(parentObject[call] !== parentObject.parent[call]){
                        parentObject[call]();

                    } // else -> the function is a reference to its parents one TODO: evaluate
                    parentObject.parent.bubble(call);
                } else {
                    parentObject[call](); // parent is the forebear, bubbling end
                }
            } // bubble interrupted

            return true;
        };


        /**STATE**/
        //extend the new object with the state object
        Object.keys(state).forEach(function(property){
            parentObject[property] = state[property];
        });
        //param check
        var stateDeadend = {};
        if(deadEnd.constructor === Array &&
            deadEnd.length >= 2 &&
            typeof deadEnd[0] === "object"){

            stateDeadend = deadEnd[0];
        }
        //extend the new object with the state deadend properties
        Object.keys(stateDeadend).forEach(function(property){
            parentObject[property] = stateDeadend[property];

        });

        /**CORE**/

        //param check
        var coreDeadend = {};
        if(typeof deadEnd === "object"){

            if(deadEnd.constructor === Array){
                if(deadEnd.length === 1 && typeof deadEnd[0] === "object"){

                    coreDeadend = deadEnd[0];

                } else if(deadEnd.length >= 2 && typeof deadEnd[1] === "object"){
                    coreDeadend = deadEnd[1];
                }
            } else {
                coreDeadend = deadEnd;
            }

        }
        // extend the core merge object with the deadend core properties from the deadend object
        Object.keys(coreDeadend).forEach(function(property){
            coreMergeObject[property] = coreDeadend[property];
        });

        //merge core objects
        Object.keys(core).forEach(function(property){

            coreMergeObject[property] = core[property];
        });

        // freeze the core
        var frozenCore = Object.freeze(coreMergeObject);

        //now extend the new object with the core properties and their descriptors
        Object.keys(frozenCore).forEach(function(property){
            Object.defineProperty(parentObject, property, Object.getOwnPropertyDescriptor(frozenCore, property) );
            parentObject[property] = frozenCore[property];

        });

        // return the new object sealed
        return Object.seal(parentObject);
    }


};

module.exports = Capsule;