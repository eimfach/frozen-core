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
    it('creates a child object which should have a reference to its creator', function(){

        var object = Capsule.extend({root: "mutable"}, {core: "immutable"});
        var child = object.extend({root: "mutable"});
        child.should.have.property('parent').that.deep.equals(object);


    });
    it('should overwrite existing state property values with equal ones (if given) on extension', function(){

        var object = Capsule.extend({root: "mutable"}, {core: "immutable"});
        var child = object.extend({root: "modified"}, {core: "immutable"});
        child.should.have.property('root').that.equals("modified");
    });
    it('should overwrite existing core properties with equal ones (if given) on extension', function(){

        var object = Capsule.extend({root: "mutable"}, {core: "immutable"});
        var child = object.extend({root: "modified"}, {core: "modified"});
        child.should.have.property('core').that.equals("modified");
    });
    it('should prevent overwriting core properties with wrong datatypes on extension', function(){

        var object = Capsule.extend({nooverwrite: function(){}});
        var child = object.extend({nooverwrite: "modified"});
        child.nooverwrite.should.be.a("function");
    });


    it('prevent overwriting its own core properties ', function(){
        //this is no spec for the core properties !
        var object = Capsule.extend({core: "immutable"});
        var child = object.extend({extend: function(){return "modified"}, parent: {}, bubble: function(){return "modified"}});
        var child2 = child.extend();
        child2.should.be.a('object').that.not.equals("modified");
        child.parent.should.not.deep.equal({});
        var result = child.bubble();
        result.should.not.equal("modified");
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

        var child = object.extend({core: "immutable"});
        child.core = "modified";
        child.core.should.equal("immutable");

        Object.isFrozen(object).should.be.true;
        Object.isFrozen(child).should.be.true;
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

    it('should have a function "bubble" which executes all parent functions and its own', function(){

        var root = Capsule.extend({
            title: "root",
            render: function(){
                root.title = "modified"
            }
        }, {

        });
        var master = root.extend({
            title: "master"
        }, {

        });
        var parent = master.extend({
            title: "parent",
            render: function(){
                parent.title = "modified";
            }
        }, {

        });

        var child = parent.extend({
            title: "child",
            render: function(){
                child.title = "modified";
            }
        }, {
        });

        child.should.have.property('bubble').that.is.a('function');

        child.bubble('render');

        child.title.should.equal("modified");
        parent.title.should.equal("modified");
        master.title.should.equal("master");
        root.title.should.equal("modified");

    });


    describe('Strictmode', function(){
        it('should throw a typeerror on try to overwrite with wrong datatype', function(){

            Capsule.enableStrict();
            var object = Capsule.extend({nooverwrite: function(){}});
            var errorThrown = false;

            try{
                var child = object.extend({nooverwrite: "modified"});

            } catch(e){
                errorThrown = true;
                e.should.have.property('type').that.equals('TypeError');
                e.should.have.property('message').that.is.not.empty;
            }
            errorThrown.should.be.true;
        });
    });

});

