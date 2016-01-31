/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var GLOBAL = global || this;
var X = GLOBAL.X;

// Bootstrap Support, discarded after use
GLOBAL.Bootstrap = {

  // Temporary collection of classes to be updated later.
  classes: [],

  start: function() {
    GLOBAL.CLASS = GLOBAL.Bootstrap.CLASS.bind(Bootstrap);
  },

  getClass: (function() {
    /*
      Create or Update a Prototype from a psedo-Model definition.
      (Model is 'this').
    */

    var AbstractClass = {
      prototype: {},
      create: function(args) {
        var obj = Object.create(this.prototype);
        obj.instance_ = Object.create(null);
        console.log('------------------------------------');
        console.log('object create', this.prototype && this.prototype.ID___);
        if ( args ) {
          for ( var key in args )
            if ( args.hasOwnProperty(key) ) { // skips stuff from the proto (when copying an existing instance)
              obj[key] = args[key];
            }

          if ( args.instance_ )
            for ( var key in args.instance_ ) {
              obj.instance_[key] = args.instance_[key]; // had to set instance_ directly, setter not ready yet?
            }
        }

        return obj;
      },
      installModel: function(m) {
        if ( m.axioms )
          for ( var i = 0 ; i < m.axioms.length ; i++ )
            this.installAxiom(m.axioms[i]);
        
        if ( m.methods )
          for ( var i = 0 ; i < m.methods.length ; i++ ) {
            var a = m.methods[i];
            if ( typeof a === 'function' )
              m.methods[i] = a = { name: a.name, code: a };
            this.prototype[a.name] = a.code;    
          }
        
        if ( X.Property && m.properties )
          for ( var i = 0 ; i < m.properties.length ; i++ ) {
            var a = m.properties[i];
            if ( typeof a === 'string' ) m.properties[i] = a = { name: a };
            var type = X[(a.type || '') + 'Property'] || X.Property;
            this.installAxiom(type.create(a)); 
          }
      },
      installAxiom: function(a) {
        a.installInClass && a.installInClass(this);
        a.installInProto && a.installInProto(this.prototype);
      }
    };

    return function getClass() {
      var cls = X[this.name];

      if ( ! cls ) {
        var parent = this.extends ? X[this.extends] : AbstractClass ;
        cls = Object.create(parent);
        cls.prototype = Object.create(parent.prototype);
        cls.prototype.cls_ = cls;
        cls.ID___  = this.name + 'Class';
        cls.prototype.ID___  = this.name + 'Prototype';
        cls.name   = this.name;
        cls.model_ = this;
        X[cls.name] = cls;
      }

      cls.installModel(this);

      return cls;
    };
  })(),

  // Bootstrap Model definition which records incomplete models
  // so they can be patched at the end of the bootstrap process.
  CLASS: function(m) {
    this.classes.push(this.getClass.call(m));
  },

  end: function() {
    GLOBAL.CLASS = function(m) { return X.Model.create(m).getClass(); };

    for ( var i = 0 ; i < this.classes.length ; i++ )
      GLOBAL.CLASS(this.classes[i].model_);

    GLOBAL.Bootstrap = null;
    delete GLOBAL.Bootstrap;
  }
};


Bootstrap.start();

CLASS({
  name: 'FObject',

  documentation: 'Base model for model hierarchy.',

  methods: [
    function hasOwnProperty(name) {
      return Object.hasOwnProperty.call(this.instance_, name);
    }
  ]
});


CLASS({
  name: 'Model',
  extends: 'FObject', // Isn't the default yet.

  documentation: 'Class/Prototype description.',

  properties: [
    {
      name: 'name'
    },
    {
      name: 'extends',
      defaultValue: 'FObject'
    },
    {
      // type: 'Array',
      name: 'axioms',
      factory: function() { return []; }
    },
    {
      type: 'Array',
      subType: 'Property',
      name: 'properties',
      adaptArrayElement: function(o) {
        var cls = this.type ? X[this.type + 'Property'] : X.Property;
        return cls.create(o);
      }
    },
    {
      type: 'Array',
      subType: 'Method',
      name: 'methods',
      // TODO: this shouldn't be needed
      adapt: function(_, a, prop) {
        if ( ! a ) return [];
        return a.map(prop.adaptArrayElement.bind(prop));
      },
      adaptArrayElement: function(e) {
        if ( typeof e === 'function' ) {
          //GLOBAL.console.assert(e.name, 'Method must be named');
          return X.Method.create({name: e.name, code: e});
        }
        return e;
      }
    }
  ],

  methods: [
    GLOBAL.Bootstrap.getClass
  ]
});


CLASS({
  name: 'Property',
  extends: 'FObject',

  properties: [
    {
      name: 'name'
    },
    {
      name: 'type'
    },
    {
      name: 'defaultValue'
    },
    {
      name: 'factory'
    },
    {
      name: 'adapt'
    },
    {
      name: 'preSet'
    },
    {
      name: 'postSet'
    },
    {
      name: 'expression'
    }
  ],

  methods: [
    function installInClass(c) { c[X.constantize(this.name)] = this; },
    function installInProto(proto) {
      /*
        Install a property onto a prototype from a Property definition.
        (Property is 'this').
      */
      var prop            = this;
      var name            = this.name;
      var adapt           = this.adapt
      var name            = this.name;
      var adapt           = this.adapt
      var preSet          = this.preSet;
      var postSet         = this.postSet;
      var factory         = this.factory;
      var hasDefaultValue = this.hasOwnProperty('defaultValue');
      var defaultValue    = this.defaultValue;

      /* Future: needs events and slot support first.
         var slotName        = name + '$';
         Object.defineProperty(proto, slotName, {
         get: function propSlotGetter() {
         return this.getSlot(name);
         },
         set: function propSlotSetter(value) {
         value.link.link(this.getSlot(name));
         },
         configurable: true
         });
      */

      // TODO: implement 'expression'

      Object.defineProperty(proto, name, {
        get: prop.getter || function propGetter() {
          if ( ( hasDefaultValue || factory ) &&
               ! this.hasOwnProperty(name) )
          {
            if ( hasDefaultValue ) return defaultValue;

            var value = factory.call(this);
            this.instance_[name] = value;
            return value;
          }

          return this.instance_[name];
        },
        set: prop.setter || function propSetter(newValue) {
          // TODO: add logic to not trigger factory
          var oldValue = this[name];

          if ( adapt )  newValue = adapt.call(this, oldValue, newValue, prop);

          if ( preSet ) newValue = preSet.call(this, oldValue, newValue, prop);

          this.instance_[name] = newValue;

          // TODO: fire property change event

          // TODO: call global setter

          if ( postSet ) postSet.call(this, oldValue, newValue, prop);
        },
        configurable: true
      }); 
    }
  ]
});


CLASS({
  name: 'Method',
  extends: 'FObject',

  properties: [
    {
      name: 'name'
    },
    {
      name: 'code'
    }
  ],

  methods: [
    function installInProto(proto) { proto[this.name] = this.code; }
  ]
});


CLASS({
  name: 'StringProperty',
  extends: 'Property',

  properties: [
    {
      name: 'defaultValue',
      defaultValue: ''
    },
    {
      name: 'preSet',
      defaultValue: function(_, a) {
        return a ? a.toString() : '';
      }
    }
  ]
});


CLASS({
  name: 'ArrayProperty',
  extends: 'Property',

  properties: [
    {
      name: 'factory',
      defaultValue: function() { return []; }
    },
    {
      name: 'subType'
    },
    {
      name: 'preSet',
      defaultValue: function(_, a, prop) {
        var cls = X[prop.subType];
        // TODO: loop for performance
        return a.map(function(p) { return cls.create(p); });
      }
    },
    {
      name: 'adapt',
      defaultValue: function(_, a, prop) {
        if ( ! a ) return [];
        return a.map(prop.adaptArrayElement.bind(prop));
      }
    },
    {
      name: 'adaptArrayElement',
      defaultValue: function(o) {
        console.log('subtype', this.subType);
        return X[this.subType].create(o);
      }
    }
  ]
});


Bootstrap.end();


CLASS({
  name: 'FObject',

  methods: [
    function clearProperty(name) { delete this.instance_[name]; },
    function toString() {
      // Distinguish between prototypes and instances.
      return this.cls_.model_.name + (this.instance_ ? '' : 'Proto');
    }
  ],

  // TODO: insert core/FObject.js functionality

  // TODO: insert EventService and PropertyChangeSupport here
});


CLASS({
  name: 'AxiomArrayProperty',
  extends: 'ArrayProperty',

  properties: [
    {
      name: 'postSet',
      defaultValue: function(_, a) {
        (this.axioms || (this.axioms = [])).push.apply(this.axioms, a); }
    }
  ]
});


CLASS({
  name: 'Constant',

  properties: [
    {
      name: 'name'
    },
    {
      name: 'value'
    }
  ],

  methods: [
    function installInClass(cls) { cls[X.constantize(this.name)] = this.value; },
    function installInProto(proto) { proto[X.constantize(this.name)] = this.value; }
  ]
});


CLASS({
  name: 'Model',

  properties: [
    {
      type: 'AxiomArray',
      subType: 'Constant',
      name: 'constants'
    }
  ]
});


/*
  Notes:

  remove create from regular objects
  acreate or afromJSON

  TODO:
  - property overriding
*/
