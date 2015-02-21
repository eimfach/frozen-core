(function(module){
    'use strict';

    var strict = false;
    var Capsule = {

        /**
         * @param state Spec for Object state, mutable properties
         * @param core Spec for immutable properties (Provide just one Object for pureness)
         * @param deadEnd Spec for non inheritable properties
         */
        extend: function(state, core, deadEnd){
            //param check
            if(typeof state !== "object") state = {};
            if(core === undefined) core = state;
            if(typeof core !== "object") core = {};
            if(typeof state !== "object") state = {};
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
                state = extendObject(stateExtension, state);
                core = extendObject(coreExtension, core, true);

                core.parent = parentObject;

                return Capsule.extend(state, core, deadEnd);
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
                } // bubble interrupted //TODO: evaluate throwing error on strict mode //TODO: evaluate this possibility in general

                return true;
            };


            /**STATE**/
                //extend the new object with the state object
            parentObject = extendObject(state, parentObject);

            //param check
            var stateDeadend = {};
            if(deadEnd.constructor === Array &&
                deadEnd.length >= 2 &&
                typeof deadEnd[0] === "object"){

                stateDeadend = deadEnd[0];
            }
            //extend the new object with the state deadend properties
            parentObject = extendObject(stateDeadend, parentObject);

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
            coreMergeObject = extendObject(coreDeadend, coreMergeObject);

            //merge core objects
            coreMergeObject = extendObject(core, coreMergeObject);

            // freeze the core
            var frozenCore = Object.freeze(coreMergeObject);

            //now extend the new object with the core properties and their descriptors
            Object.keys(frozenCore).forEach(function(property){
                parentObject[property] = frozenCore[property];
                Object.defineProperty(parentObject, property, Object.getOwnPropertyDescriptor(frozenCore, property) );

            });

            // return the new object sealed
            return Object.seal(parentObject);
        },

        enableStrict: function(){
            strict = true;
        }


    };

    /* pure */
    var extendObject = function(parent, child, typesafe){

//TODO: property descriptor inheritance

        Object.keys(parent).forEach(function(property){

            //TODO: flip parent/child logic
            if(typesafe === true){
                // has the core this property already?
                if(typeof child[property] === "undefined"){
                    child[property] = parent[property];

                    //property is already in parent
                } else if(typeof parent[property] === typeof child[property]) {

                    //overwrite on same type
                    child[property] = parent[property];

                } else if(strict === true){
                    throw Capsule.extend({type: 'TypeError', 'message':'Mismatch of type from property'});
                }
            } else {
                child[property] = parent[property];
            }
        });
        return child;
    };

    module.exports = Capsule;

})(module);


