var Capsule = {


    extend: function(rootObject, coreObject){

        if(typeof rootObject !== "object") rootObject = {};
        if(coreObject === undefined) coreObject = rootObject;
        if(typeof coreObject !== "object") coreObject = {};


        // add a extension method to each object within its core, which others can inherit from
        coreObject.extend = function(rootExtension, coreExtension){

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

            return Capsule.extend(rootExtension, coreExtension);
        };
        var frozenCore = Object.freeze(coreObject); // freeze the core object

        var coreProps = Object.keys(frozenCore);

        //now extend the root with the core members
        for(var l = 0; l < coreProps.length; l++){

            Object.defineProperty(rootObject, coreProps[l], Object.getOwnPropertyDescriptor(frozenCore, coreProps[l]) );
            rootObject[coreProps[l]] = frozenCore[coreProps[l]];

        }

        return Object.seal(rootObject);	// seal the root object
    }


};

module.exports = Capsule;