# frozen-core
![](https://travis-ci.org/eimfach/frozen-core.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/eimfach/capsule-js/badge.svg?branch=master)](https://coveralls.io/r/eimfach/capsule-js?branch=master)
![](https://david-dm.org/eimfach/frozen-core.svg)
[![Code Climate](https://codeclimate.com/github/eimfach/capsule-js/badges/gpa.svg)](https://codeclimate.com/github/eimfach/capsule-js)

General purpose lib to create maintainable and immutable Objects - the idea is to work without side effects .

- Very small (4KB, raw)
- Object properties are immutable
- Optional state properties
- Simple Typesafe inheritance
- Hierarchic method bubbling
- Enforces a specifc way to implement your Objects and Methods

```javascript
var frozenCore = require('frozen-core');
var myObject = frozenCore.extend({
  state: {
    //mutable property values (the object mask)`
  },
  core: {
    // immutable property values here
    //only functions allowed (other types are ommited)
    // 'shares' the state object scope by obtaining a immutable copy (the snapshot) (lexical this refers to that snapshot)
    /* Every method here only can access that copy but no other method within 
    the object except the inherited public api methods (extend, bubble) */
  }
})
// the properties of the resulting object are always immutable, not configurable as the object itself too, one can't add new properties, remove or configure them
```
##Public API 
```javascript
myObject.extend(/*options object*/);
myObject.bubble(/*method to call (which will be executed on every parent)*/)
myObject.getSnapshot() //returns the immutable state copy
myObject.parent // reference to the latest origin
```

## Simple implementation example

```javascript
var cube = frozenCore.extend({
  core: {
    mutate: function(){
      //'this' is safe to use here since it will be immutable - it will refer to a copy of the state object
      /* this will have no effect !*/this.width = 1;
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
```
