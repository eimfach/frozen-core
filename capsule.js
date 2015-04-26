'use strict';

var strict = false;
var Capsule = {

    /**
     * @param options Spec for Object
     * options.state Spec for mutable properties
     * options.core Spec for immutable properties (Provide just one Object for pureness)
     * options.deadEnd Spec for non inheritable properties
     */
    extend: function(options){
        if(typeof options !== 'object') options = {};
        var core = options.core || {},
            state = options.state || {};

        var parentObject = {};
        var coreMergeObject = {};

        // add a extension method to each object within its core, which others can inherit from
        core.extend = function(options){
            if(typeof options !== 'object') options = {};
            options.core = extendObject(options.core || {}, core, true );
            options.state = extendObject(options.state || {}, state );
            options.core.parent = parentObject;

            return Capsule.extend(options);
        };
        core.bubble = function(call){
            if(typeof parentObject[call] === "function"){
                if(typeof parentObject.parent === "object"){

                    parentObject[call]();
                    parentObject.parent.bubble(call);
                } else {
                    parentObject[call](); // parent is the forebear, bubbling end
                }
            } // bubble interrupted //TODO: evaluate throwing error on strict mode //TODO: evaluate this possibility in general

            return true;
        };


        /**STATE**/
            //extend the new object with the state object
        parentObject = extendObject(parentObject, state);

        /**CORE**/

        //merge core objects
        coreMergeObject = extendObject(coreMergeObject, core);

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
var extendObject = function(child, parent, typesafe){

//TODO: property descriptor inheritance

    var result = {};

    var merge = function(object, safe){

        Object.keys(object).forEach(function(property){

            if(safe === true){
                // has the core this property already?
                if(typeof result[property] === "undefined" || typeof result[property] === typeof object[property]){
                    result[property] = object[property];

                }  else if(strict === true){
                    throw new TypeError();
                }
            } else {
                result[property] = object[property];
            }
        });
    };
    merge(parent);
    merge(child, typesafe);

    return result;
};

module.exports = Capsule;



