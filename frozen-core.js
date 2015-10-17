'use strict';

var strict = false;
var FrozenCore = {

    /**
     * @param options Spec for Object
     * options.state Spec for mutable properties
     * options.core Spec for immutable properties (Provide just one Object for pureness)
     */
    extend: function(options){
        if(typeof options !== 'object'){
            options = {};
        }
        var core = options.core || {},
            state = options.state || {},
            creation = {};

        var coreCopy = Object.keys(core).map(keepType(['function'], core))[0] || {}; //reduce to functions & retain copy
        var stateCopy = Object.keys(state).map(keepType(['string', 'number', 'array'], state))[0] || {};
        var stateSnapshot = state;

        // bind scope of core functions to snapshot
        Object.keys(core).map(isolate(core, state));

        //define general core api
        //stateSnapshot has scope on this api
        core.hasParent = function(){
            return typeof core.parent === 'object';
        };
        Object.defineProperty(stateSnapshot, 'hasParent', {
            value: core.hasParent,
            enumerable: false,
            writeable: false,
            configurable: false
        });
        core.getSnapshot = function(){
            return stateSnapshot;
        };
        // add a extension method to each object within its core, which others can inherit from
        core.extend = function(options){
            if(typeof options !== 'object') options = {};
            options.core = extendObject(options.core || {}, coreCopy, true);
            options.state = extendObject(options.state || {}, stateCopy, true );
            Object.defineProperty(options.core, 'parent', {
                value: creation,
                enumerable: false,
                writeable: false,
                configurable: false
            });

            return FrozenCore.extend(options);
        };
        Object.defineProperty(stateSnapshot, 'extend', {
            value: core.extend,
            enumerable: false,
            writeable: false,
            configurable: false
        });
        core.bubble = function(call, options){

            core[call](options);

            if(typeof core.parent === "object"){

                core.parent.bubble(call, options);
            }

            return true;
        };
        Object.defineProperty(stateSnapshot, 'bubble', {
            value: core.bubble,
            enumerable: false,
            writeable: false,
            configurable: false
        });
        // force the stateSnapshot to be immutable
        Object.freeze(stateSnapshot);


        /**STATE**/
        //extend the new object with the state object
        creation = extendObject(creation, stateCopy);

        /**CORE**/
        // freeze the core
        var frozenCore = Object.freeze(core);

        //now extend the new object with the core properties and their descriptors
        creation = extendObject(creation, frozenCore);

        //redefine parent due to enumerable false and object copy
        if(typeof core.parent === 'object'){
            Object.defineProperty(creation, 'parent', Object.getOwnPropertyDescriptor(core, 'parent'));
        }

        // return the new object sealed
        return Object.seal(creation);
    },

    enableStrict: function(){
        strict = true;
    }


};

/* a curry function, binds a function to a specific scope */
var isolate = function(obj, scope){

    return function(property){

        var refCopy = obj[property];
        obj[property] = function(options){

            return refCopy.call(scope, options);
        };

    };
};
var isIn = function(list, val){
    return list.indexOf(val) > -1;
};
/* curry function, keep values of certain type in an object, delete the remains */
var keepType = function(typeList, obj){
    var copy = {};
    return function(property){
        Object.defineProperty(copy, property, Object.getOwnPropertyDescriptor(obj, property));

        if(!isIn(typeList, (obj[property].constructor===Array) ? 'array' : typeof obj[property])){
            delete obj[property];
        }
        return copy;
    };
};

var extendObject = function(child, parent, typesafe){

    var result = {};

    var merge = function(object, safe){

        Object.keys(object).forEach(function(property){

            if(safe === true){
                // has the core this property already?
                if(typeof result[property] === "undefined" || typeof result[property] === typeof object[property]){

                    Object.defineProperty(result, property, Object.getOwnPropertyDescriptor(object, property));

                }  else if(strict === true){
                    throw new TypeError();
                }
            } else {
                Object.defineProperty(result, property, Object.getOwnPropertyDescriptor(object, property));
            }
        });
    };
    merge(parent);
    merge(child, typesafe);

    return result;
};

module.exports = FrozenCore;



