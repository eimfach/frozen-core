var chai = require('chai');
var q = require('q');
var FrozenCore = require('../frozen-core');

chai.should();

describe('FrozenCore', function(){
  it('should be a function', function(){
    FrozenCore.should.be.an("object");

  });
  it('should have an property named extend which is a function', function(){

    FrozenCore.should.have.a.property('extend').that.is.a("function");
  });

  it('should always return an "empty" object if none/wrong parameters are given.', function(){

    var emptyObject = FrozenCore.extend();
    emptyObject.should.be.a("object");
    emptyObject.should.have.property("extend");
    emptyObject.extend.should.be.a("function");

    emptyObject = FrozenCore.extend(1, 2);
    emptyObject.should.be.a("object");
    emptyObject.should.have.property("extend");
    emptyObject.extend.should.be.a("function");

    emptyObject = FrozenCore.extend({});
    emptyObject.should.be.a("object");
    emptyObject.should.have.property("extend");
    emptyObject.extend.should.be.a("function");

  });
  it('should merge two objects into a new one and provides an extend function on the new object.', function(){

    var object = FrozenCore.extend({
      state: {
        model: 'mutable',
        face: 'immutable'
      }
    });
    object.should.have.property('model').that.equals("mutable");
    object.should.have.property('face').that.equals("immutable");
  });
  it('should provide an extend function to the merged object', function(){

    var object = FrozenCore.extend();
    object.should.have.property('extend').that.is.a("function");

  });
  it('should be possible to modify the property values given by the state object.', function(){
    var object = FrozenCore.extend({
      state: {
        model: 'mutable',
        face: 'immutable'
      }
    });

    object.model = "modified";
    object.model.should.equal("modified");
  });
  it('should not be possible to remove or add properties to the merged object.', function(){
    var object = FrozenCore.extend({
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
    var object = FrozenCore.extend({
      core: {
        id: function(){
          return 'immutable'
        }
      }
    });
    object.id = "modified";
    object.id.should.be.a.function;
  });
  it('should be possible to extend an merged object with new properties', function(){
    var object = FrozenCore.extend({
      state: {
        model: 'mutable',
        face: 'mutable'
      }
    });

    var newObject = object.extend({
      state: {
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

    var object = FrozenCore.extend();
    var child = object.extend();
    var parent = child.parent;
    parent.should.deep.equal(object);


  });
  it('should overwrite existing state property values', function(){

    var object = FrozenCore.extend({
      state: {
        model: "mutable",
        face: "mutable"
      }
    });
    var child = object.extend({
      state: {
        model: "modified"
      }
    });
    child.should.have.property('model').that.equals("modified");
    child.should.have.property('face').that.equals("mutable");
  });
  it('should overwrite existing core properties on extension', function(){

    var object = FrozenCore.extend({
      core: {
        create: function(){
          return 'old';
        }
      }
    });

    var child = object.extend({
      core: {
        create: function(){
          return 'new';
        }
      }
    });
    object.should.have.property('create');
    child.should.have.property('create');
    object.create().should.equal('old');
    child.create().should.equal('new');
  });
  it('should prevent overwriting core properties with wrong types on extension', function(){

    var object = FrozenCore.extend({
      core: {
        id: function(){

        }
      }
    });

    var child = object.extend({
      core: {
        id: 'overwrite'
      }
    });
    child.should.have.property('id').that.is.a("function");
  });

  it('should prevent overwriting state properties with wrong types on extension', function(){

    var object = FrozenCore.extend({
      state: {
        id: function(){

        }
      }
    });

    var child = object.extend({
      state: {
        id: 'overwrite'
      }
    });
    child.should.have.property('id').that.is.a("function");
  });


  it('prevent overwriting its own core properties ', function(){
    //this is no spec for the core properties !
    var object = FrozenCore.extend({
      core: {
        id: "immutable"
      }
    });
    var child = object.extend({
      core: {
        extend: function(){
          return "modified"
        },
        parent: {},
        bubble: function(){
          return "modified"
        }
      }
    }
    );

    var child2 = child.extend();

    child2.should.be.a('object').that.not.equals("modified");
    child.parent.should.not.deep.equal({});
    try{
      var result = child.bubble();

    } catch(e){

      result = 'notoverwritten';
    }
    (result).should.not.equal("modified");
  });
  it('should be possible to modify the property values from child extension state object', function(){
    var object = FrozenCore.extend({
      state: {
        model: "mutable"
      }
    });

    var child = object.extend({
      state: {
        session: function(){
        }
      }
    });

    child.session = "modified";
    child.session.should.equal("modified");

    child.model = "modified";
    child.model.should.equal("modified");

  });
  it('isolated core should have access to capsule core api', function(){

    var cube = FrozenCore.extend({
      core: {

        mutate: function(){
          return this.extend({
            state: {
              width: this.width+20,
              height: this.height+20,
              depth: this.depth+20
            }
          });
        }
      },
      state: {
        width: 0,
        height: 0,
        depth: 0
      }
    });

    var mutatedCube = cube.mutate();

    (20).should.equal(mutatedCube.width);
    (20).should.equal(mutatedCube.height);
    (20).should.equal(mutatedCube.height);


  });
  it('should have a function "bubble" which executes all parent functions and its own', function(){

    var obj = FrozenCore.extend({
      core: {
        render: function(options){
          options.notifyOrResolve.call(this, this.template.split('$').join(this.content));
        }
      },
      state: {
        content: 'Hello World!',
        template: "<h1>$</h1>",
        refresh: function(deferred){

          this.bubble('render', {
            notifyOrResolve: function(value){
              //TODO: api plugin
              if(this.hasParent()){
                deferred.notify(value);
              } else {
                deferred.resolve(value);
              }
            }
          });
        }
      }
    });

    var chd = obj.extend({

      state: {
        content: 'I am Superman',
        template: "<h2>$</h2>"
      }
    });

    var deferred = q.defer();
    var results = [];
    deferred.promise.progress(function(notified){
      results.push(notified);

    });
    deferred.promise.then(function(resolved){
      results.push(resolved);
    });
    deferred.promise.finally(function(value){
      "<h2>I am Superman</h2>".should.equal(value[0]);
      "<h1>Hello World!</h1>".should.equal(value[1]);

    });
    chd.refresh(deferred);

  });
  it('should make sure, only functions can be created in core scope', function(){


    var obj = FrozenCore.extend({
      core: {
        stateVar: 'hello'
      }
    });

    obj.should.not.have.property('stateVar');
  });
  it('should make sure, functions in core scope have an isolated scope which inherited all scope properties', function(){

    var obj = FrozenCore.extend({
      core: {
        expose: function(prop){
          return this[prop];
        }

      },
      state: {
        id: 'mutable'
      }
    });
    var id = obj.expose('id');
    'mutable'.should.equal(id);

  });
  it('should make sure isolated scope is not writeable', function(){

    var obj = FrozenCore.extend({
      state: {
        member: 'john'
      },
      core: {
        modifyState: function(member){
          this.member = member;
          return this.member;
        }
      }
    });

    var member = obj.modifyState('fred');
    member.should.equal('john');
  });
  it('should make sure, inherited and non inherited core functions have overwritten or inherited or new properties from state in their scope', function(){

    var obj = FrozenCore.extend({
      core: {
        expose: function(prop){
          return this[prop];
        }

      },
      state: {
        id: 'mutable',
        template: '<div>$</div>'
      }
    });

    var chd = obj.extend({
      core: {
        render: function(prop){
          return this.template.split('$').join(this[prop]);
        }
      },
      state: {
        id: 'mutable1',
        random: 123
      }
    });

    var rendered = chd.render('id');
    '<div>mutable1</div>'.should.equal(rendered);

    var id1 = chd.expose('id');
    id1.should.equal('mutable1');

    var tmpl = chd.expose('template');
    '<div>$</div>'.should.equal(tmpl);

    var randomTmpl = chd.expose('random');
    (123).should.equal(randomTmpl);

    //TODO: 4 of 6 covered

  });
  it('should have a method "getSnapshot" which returns the isolated scope', function(){


    var obj = FrozenCore.extend({
      state: {
        id: 1,
        member: "john"
      }
    });

    (obj.getSnapshot()).should.deep.equal({
      id: 1,
      member: "john"
    });
  });


  describe('Strictmode', function(){
    it('should throw a typeerror on try to overwrite with wrong datatype', function(){

      FrozenCore.enableStrict();
      var object = FrozenCore.extend({
        core: {
          id: 'immutable'
        }
      });
      var errorThrown = false;

      try{
        var child = object.extend({
          core: {
            id: function(){
            }
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

