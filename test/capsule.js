var chai = require('chai');
var Capsule = require('../capsule');

chai.should();

describe('Capsule', function(){
    it('should be a function', function(){
        Capsule.should.be.an("object");

    });
    it('should have an property named extend which is a function', function(){

        Capsule.should.have.a.property('extend').that.is.a("function");
    });

    it('should always return an "empty" object if none/wrong parameters are given.', function(){

        var emptyObject = Capsule.extend();
        emptyObject.should.be.a("object");
        emptyObject.should.have.property("extend");
        emptyObject.extend.should.be.a("function");

        emptyObject = Capsule.extend(1,2);
        emptyObject.should.be.a("object");
        emptyObject.should.have.property("extend");
        emptyObject.extend.should.be.a("function");

        emptyObject = Capsule.extend({});
        emptyObject.should.be.a("object");
        emptyObject.should.have.property("extend");
        emptyObject.extend.should.be.a("function");

    });
    it('should merge two objects into a new one and provides an extend function on the new object.', function(){

        var object = Capsule.extend({root: "mutable"}, {core: "immutable"});
        object.should.have.property('root').that.equals("mutable");
        object.should.have.property('core').that.equals("immutable");
    });
    it('should provide an extend function to the merged object', function(){

        var object = Capsule.extend({root: "mutable"}, {core: "immutable"});
        object.should.have.property('extend').that.is.a("function");

    });
    it('should be possible to modify the property values given by the first parameter on construction.', function(){
        var object = Capsule.extend({root: "mutable"}, {core: "immutable"});

        object.root = "modified";
        object.root.should.equal("modified");
    });
    it('should not be possible to remove or add properties to the merged object.', function(){
        var object = Capsule.extend({root: "mutable"}, {core: "immutable"});

        delete object.root;
        object.root.should.exist;
        object.root.should.be.a("string");

        object.newProperty = 1;
        (1).should.not.equal(object.newProperty);


    });
    it('should not be possible to modify the property values given my the second parameter on construction (frozen core).', function(){
        var object = Capsule.extend({root: "mutable"}, {core: "immutable"});

        object.core = "modified";
        object.core.should.equal("immutable");
    });
    it('should be possible to extend an merged object with new properties', function(){
        var object = Capsule.extend({root: "mutable"}, {core: "immutable"});
        var newObject = object.extend({rootExtension: "mutable"}, {coreExtension: "immutable"});
        newObject.should.have.property('root').that.equals("mutable");
        newObject.should.have.property('core').that.equals("immutable");
        newObject.should.have.property('rootExtension').that.equals("mutable");
        newObject.should.have.property('coreExtension').that.equals("immutable");
        newObject.should.have.property('extend').that.is.a("function");
    });

    it('should be possible to modify the property values on the child object (created by extension) given by the first parameter on construction and the first parameter on extension', function(){
        var object = Capsule.extend({root: "mutable"}, {core: "immutable"});
        var newObject = object.extend({rootExtension: "mutable"}, {coreExtension: "immutable"});

        newObject.rootExtension = "modified";
        newObject.rootExtension.should.equal("modified");

        newObject.root = "modified";
        newObject.root.should.equal("modified");

    });
    it('should not be possible to remove or add properties to the child object (created by extension).', function(){
        var object = Capsule.extend({root: "mutable"}, {core: "immutable"});
        var newObject = object.extend({rootExtension: "mutable"}, {coreExtension: "immutable"});

        delete object.rootExtension;
        newObject.rootExtension.should.exist;
        newObject.rootExtension.should.be.a("string");

        delete object.root;
        newObject.root.should.exist;
        newObject.root.should.be.a("string");

        newObject.newProperty = 1;
        (1).should.not.equal(newObject.newProperty);


    });
    it('should not be possible to modify the property values given my the second parameter on construction and the second parameter on extension (frozen core).', function(){
        var object = Capsule.extend({root: "mutable"}, {core: "immutable"});
        var newObject = object.extend({rootExtension: "mutable"}, {coreExtension: "immutable"});

        object.core = "modified";
        object.core.should.equal("immutable");

        newObject.coreExtension = "modified";
        newObject.coreExtension.should.equal("immutable");
    });

    it('should return a complete frozen object if only one parameter is given', function(){

        var object = Capsule.extend({root: "immutable"});

        delete object.root;
        object.root.should.exist;
        object.root.should.be.a("string");

        object.newProperty = 1;
        (1).should.not.equal(object.newProperty);

        object.root = "modified";
        object.root.should.equal("immutable");

    });
    it('should accept an (dead-end) array or object as parameter or a Capsule which will not be inherited on extension', function(){

        //param check
        var obj = Capsule.extend({root: "mutable"}, {core: "immutable"}, [{rootDeadend: "mutable"}, {coreDeadend: "immutable"}]);
        obj.should.have.property('root').that.equals("mutable");
        obj.should.have.property('core').that.equals("immutable");
        obj.should.have.property('rootDeadend').that.equals("mutable");
        obj.should.have.property('coreDeadend').that.equals("immutable");

        var obj = Capsule.extend({root: "mutable"}, {core: "immutable"}, [{coreDeadend: "immutable"}]);
        obj.should.have.property('root').that.equals("mutable");
        obj.should.have.property('core').that.equals("immutable");
        obj.should.have.property('coreDeadend').that.equals("immutable");

        var obj = Capsule.extend({root: "mutable"}, {core: "immutable"}, {coreDeadend: "immutable"});
        obj.should.have.property('root').that.equals("mutable");
        obj.should.have.property('core').that.equals("immutable");
        obj.should.have.property('coreDeadend').that.equals("immutable");


        //inheritation check
        var object = Capsule.extend({root: "mutable"}, {core: "immutable"}, [{rootDeadend: "mutable", coreDeadend: "immutable"}]);
        var child1 = object.extend({rootExtension: "mutable"}, {coreExtension: "immutable"}, [{newDeadendRoot: "mutable"},{newDeadendCore: "immutable"}]);
        child1.should.have.property('root').that.equals("mutable");
        child1.should.have.property('core').that.equals("immutable");
        child1.should.have.property('rootExtension').that.equals("mutable");
        child1.should.have.property('coreExtension').that.equals("immutable");
        child1.should.have.property('newDeadendRoot').that.equals("mutable");
        child1.should.have.property('newDeadendCore').that.equals("immutable");
        child1.should.not.have.property('rootDeadend');
        child1.should.not.have.property('coreDeadend');


        var object1 = Capsule.extend({root: "mutable"}, {core: "immutable"}, {coreDeadend: "immutable"});
        var child2 = object1.extend({rootExtension: "mutable"}, {coreExtension: "immutable"}, {newDeadendCore: "immutable"});
        child2.should.have.property('root').that.equals("mutable");
        child2.should.have.property('core').that.equals("immutable");
        child2.should.have.property('rootExtension').that.equals("mutable");
        child2.should.have.property('coreExtension').that.equals("immutable");
        child2.should.have.property('newDeadendCore').that.equals("immutable");
        child2.should.not.have.property('rootDeadend');
        child2.should.not.have.property('coreDeadend');

        var object1 = Capsule.extend({root: "mutable"}, {core: "immutable"}, [{coreDeadend: "immutable"}]);
        var child2 = object1.extend({rootExtension: "mutable"}, {coreExtension: "immutable"}, [{newDeadendCore: "immutable"}]);
        child2.should.have.property('root').that.equals("mutable");
        child2.should.have.property('core').that.equals("immutable");
        child2.should.have.property('rootExtension').that.equals("mutable");
        child2.should.have.property('coreExtension').that.equals("immutable");
        child2.should.have.property('newDeadendCore').that.equals("immutable");
        child2.should.not.have.property('rootDeadend');
        child2.should.not.have.property('coreDeadend');


    });



});
