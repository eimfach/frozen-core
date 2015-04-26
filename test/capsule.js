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

        var object = Capsule.extend({
            state: {
                model: 'mutable',
                face: 'immutable'
            }
        });
        object.should.have.property('model').that.equals("mutable");
        object.should.have.property('face').that.equals("immutable");
    });
    it('should provide an extend function to the merged object', function(){

        var object = Capsule.extend();
        object.should.have.property('extend').that.is.a("function");

    });
    it('should be possible to modify the property values given by the state object.', function(){
        var object = Capsule.extend({
            state: {
                model: 'mutable',
                face: 'immutable'
            }
        });

        object.model = "modified";
        object.model.should.equal("modified");
    });
    it('should not be possible to remove or add properties to the merged object.', function(){
        var object = Capsule.extend({
            state: {
                model: 'mutable',
                face: 'immutable'
            }
        });

        delete object.model;
        object.model.should.exist;
        object.model.should.be.a("string");

        object.newProperty = 1;
        (1).should.not.equal(object.newProperty);


    });
    it('should not be possible to modify the property values given by the core object (frozen core).', function(){
        var object = Capsule.extend({
            core: {
                id: 'immutable'
            }
        });

        object.id = "modified";
        object.id.should.equal("immutable");
    });
    it('should be possible to extend an merged object with new properties', function(){
        var object = Capsule.extend({
            state: {
                model: 'mutable',
                face: 'mutable'
            }
        });

        var newObject = object.extend({
            state:{
                session: "mutable",
                lifetime: "mutable"
            }
        });
        newObject.should.have.property('model').that.equals("mutable");
        newObject.should.have.property('face').that.equals("mutable");
        newObject.should.have.property('session').that.equals("mutable");
        newObject.should.have.property('lifetime').that.equals("mutable");
    });
    it('creates a child object which should have a reference to its creator', function(){

        var object = Capsule.extend({model: "mutable"}, {face: "immutable"});
        var child = object.extend({model: "mutable"});
        child.should.have.property('parent').that.deep.equals(object);


    });
    it('should overwrite existing state property values', function(){

        var object = Capsule.extend({
            state:{
                model: "mutable",
                face: "mutable"
            }
        });
        var child = object.extend({
            state:{
                model: "modified"
            }
        });
        child.should.have.property('model').that.equals("modified");
        child.should.have.property('face').that.equals("mutable");
    });
    it('should overwrite existing core properties on extension', function(){

        var object = Capsule.extend({
            core:{
                id: "immutable",
                create: function(){}
            }
        });

        var child = object.extend({
            core:{
                id: "modified"
            }
        });
        child.should.have.property('id').that.equals("modified");
        child.should.have.property('create').that.is.a("function");
    });
    it('should prevent overwriting core properties with wrong types on extension', function(){

        var object = Capsule.extend({
            core:{
                id: "immutable"
            }
        });

        var child = object.extend({
            core:{
                id: function(){}
            }
        });
        child.should.have.property('id').that.is.a("string");
    });


    it('prevent overwriting its own core properties ', function(){
        //this is no spec for the core properties !
        var object = Capsule.extend({
            core:{
                id: "immutable"
            }
        });
        var child = object.extend({
            core:{
                extend: function(){return "modified"},
                parent: {},
                bubble: function(){return "modified"}
            }}
        );

        var child2 = child.extend();

        child2.should.be.a('object').that.not.equals("modified");
        child.parent.should.not.deep.equal({});
        var result = child.bubble();
        result.should.not.equal("modified");
    });
    it('should be possible to modify the property values from child extension state object', function(){
        var object = Capsule.extend({
            state:{
                model: "mutable"
            }
        });

        var child = object.extend({
            state:{
                session: function(){}
            }
        });

        child.session = "modified";
        child.session.should.equal("modified");

        child.model = "modified";
        child.model.should.equal("modified");

    });
    it('should have a function "bubble" which executes all parent functions and its own', function(){

        var root = Capsule.extend({
            core: {
                render: function(){
                    this.title = "modified"
                }
            },
            state: {
                title: "root"
            }

        });

        var master = root.extend({
            state: {
                title: 'master'
            }
        });

        var slave1 = master.extend({
            core: {
                render: function(){
                    this.title = 'slave1 modified';
                }
            },
            state: {
                title: 'slave1'
            }
        });

        var slave2 = master.extend({
            core: {
                render: function(){
                    this.title = 'slave2 modified';
                }
            },
            state: {
                title: 'slave2'
            }
        });

        slave2.should.have.property('bubble').that.is.a('function');

        slave2.bubble('render');

        slave2.title.should.equal("slave2 modified");
        slave1.title.should.equal("slave1");
        master.title.should.equal("modified");
        root.title.should.equal("modified");

    });


    describe('Strictmode', function(){
        it('should throw a typeerror on try to overwrite with wrong datatype', function(){

            Capsule.enableStrict();
            var object = Capsule.extend({
                core: {
                    id: 'immutable'
                }
            });
            var errorThrown = false;

            try{
                var child = object.extend({
                    core: {
                        id: function(){}
                    }
                });

            } catch(e){
                errorThrown = true;
                e.should.be.an.instanceof(TypeError);
            }
            errorThrown.should.be.true;
        });
    });

});

