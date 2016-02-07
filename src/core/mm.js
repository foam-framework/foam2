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

// Bootstrap support, discarded after use
foam.boot = {

  // Temporary collection of classes to be updated later.
  classes: [],

  start: function() {
    global.CLASS = this.CLASS.bind(this);
  },

  getClass: (function() {
    /*
      Create or Update a Prototype from a psedo-Model definition.
      (Model is 'this').
    */
    var AbstractClass = {
      prototype: Object.prototype,
      axiomMap_: null,
      create: function create(args) {
        var obj = Object.create(this.prototype);
        obj.instance_ = Object.create(null);

        obj.initArgs(args);

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

        if ( global.Property && m.properties )
          for ( var i = 0 ; i < m.properties.length ; i++ ) {
            var a = m.properties[i];
            if ( typeof a === 'string' ) m.properties[i] = a = { name: a };
            var type = global[(a.type || '') + 'Property'] || Property;
            this.installAxiom(type.create(a));
          }
      },
      installAxiom: function(a) {
        this.axiomMap_[a.name] = a;
        this.axiomCache_ = {};

        a.sourceCls_ = this;

        a.installInClass && a.installInClass(this);
        a.installInProto && a.installInProto(this.prototype);
      },
      isInstance: function isInstance(o) {
        return o.cls_ && this.isSubClass(o.cls_);
      },
      isSubClass: function isSubClass(o) {
        // TODO: switch from 'name' to 'id' when available
        if ( ! o ) return false;

        var subClasses_ = this.hasOwnProperty('subClasses_') ?
          this.subClasses_ :
          this.subClasses_ = {} ;

        if ( ! subClasses_.hasOwnProperty(o.name) )
          subClasses_[o.name] = ( o === this ) || this.isSubClass(o.__proto__);

        return subClasses_[o.name];
      },
      getAxiomByName: function(name) {
        return this.axiomMap_[name];
      },
      // The Following method will eventually change.
      // Would like to have efficient support for:
      //    .where() .orderBy() groupBy
      getAxiomsByClass: function(cls) {
        var as = this.axiomCache_[cls.name];
        if ( ! as ) {
          as = [];
          for ( var key in this.axiomMap_ ) {
            var a = this.axiomMap_[key];
            if ( cls.isInstance(a) )
              as.push(a);
          }
          this.axiomCache_[cls.name] = as;
        }

        return as;
      },
      getAxioms: function() {
        var as = this.axiomCache_[''];
        if ( ! as ) {
          as = [];
          for ( var key in this.axiomMap_ )
            as.push(this.axiomMap_[key]);
          this.axiomCache_[''] = as;
        }
        return as;
      },
      toString: function() {
        return this.name + 'Class';
      }
    };

    return function getClass() {
      var cls = global[this.name];

      if ( ! cls ) {
        var parent = this.extends ? global[this.extends] : AbstractClass ;
        // TODO: make some of these values non-innumerable
        cls                  = Object.create(parent);
        cls.prototype        = Object.create(parent.prototype);
        cls.prototype.cls_   = cls;
        cls.prototype.model_ = this;
        cls.prototype.ID__   = this.name + 'Prototype';
        cls.ID__             = this.name + 'Class';
        cls.axiomMap_        = Object.create(parent.axiomMap_);
        cls.axiomCache_      = {};
        cls.name             = this.name;
        cls.model_           = this;
        global[cls.name]     = cls;
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

  endPhase1: function() {
    // Upgrade to final CLASS() definition.
    global.CLASS = function(m) { return Model.create(m).getClass(); };

    // Upgrade existing classes to real classes.
    for ( var i = 0 ; i < this.classes.length ; i++ )
      CLASS(this.classes[i].model_);
  },

  end: function() {
    // Substitute AbstractClass.installModel() with simpler axiom-only version.
    FObject.__proto__.installModel = function installModel(m) {
      for ( var i = 0 ; i < m.axioms.length ; i++ )
        this.installAxiom(m.axioms[i]);
    };

    delete foam['boot'];
  }
};


foam.boot.start();

CLASS({
  name: 'FObject',

  documentation: 'Base model for model hierarchy.',

  methods: [
    function initArgs(args) {
      if ( ! args ) return;

      for ( var key in args )
        if ( key.indexOf('_') == -1 )
          this[key] = args[key];

      if ( args.instance_ )
        for ( var key in args.instance_ )
          this[key] = args.instance_[key];
    },
    function hasOwnProperty(name) {
      return Object.hasOwnProperty.call(this.instance_, name);
    },
    function setPrivate_(name, value) {
      if ( ! this.private_ ) {
        Object.defineProperty(this, 'private_', {
          value: {},
          ennumerable: false
        });
      }
      this.private_[name] = value;
      return value;
    },
    function getPrivate_(name) {
      return this.private_ && this.private_[name];
    },
    function hasOwnPrivate_(name) {
      return this.private_ && this.private_.hasOwnProperty(name);
    }
  ]
});


CLASS({
  name: 'Model',
  extends: 'FObject', // Isn't the default yet.

  documentation: 'Class/Prototype description.',

  properties: [
    'name',
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
        return typeof o === 'string'     ?
          Property.create({name: o})     :
          global[this.subType].create(o) ;
      }
    },
    {
      type: 'Array',
      subType: 'Method',
      name: 'methods',
      adaptArrayElement: function(e) {
        if ( typeof e === 'function' ) {
          console.assert(e.name, 'Method must be named');
          return Method.create({name: e.name, code: e});
        }
        return e;
      }
    }
  ],

  methods: [ foam.boot.getClass ]
});


CLASS({
  name: 'Property',
  extends: 'FObject',

  properties: [
    'name', 'type', 'defaultValue', 'factory', 'adapt', 'preSet', 'postSet', 'expression'
  ],

  methods: [
    function installInClass(c) {
      var superProp = c.__proto__.getAxiomByName(this.name);
      if ( superProp ) {
        var a = this.cls_.getAxiomsByClass(Property);
        for ( var i = 0 ; i < a.length ; i++ ) {
          var name = a[i].name;
          if ( typeof superProp[name] !== 'undefined' && ! this.hasOwnProperty(name) )
            this[name] = superProp[name];
        }
      }
      c[foam.string.constantize(this.name)] = this;
    },
    function installInProto(proto) {
      /*
        Install a property onto a prototype from a Property definition.
        (Property is 'this').
      */
      var prop            = this;
      var name            = this.name;
      var adapt           = this.adapt
      var preSet          = this.preSet;
      var postSet         = this.postSet;
      var factory         = this.factory;
      var hasDefaultValue = this.hasOwnProperty('defaultValue');
      var defaultValue    = this.defaultValue;

      /* Future: needs events and slot support first.
         Should be deferred until phase2?
         var slotName        = name + '$';
         Object.defineProperty(proto, slotName, {
         get: function propSlotGetter() {
         return this.slot(name);
         },
         set: function propSlotSetter(value) {
         value.link.link(this.slot(name));
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
          // Get old value but avoid triggering factory if present
          var oldValue = this.factory ?
            ( this.hasOwnProperty(name) ? this[name] : undefined ) :
            this[name] ;

          if ( adapt )  newValue = adapt.call(this, oldValue, newValue, prop);

          if ( preSet ) newValue = preSet.call(this, oldValue, newValue, prop);

          this.instance_[name] = newValue;

          this.publish && this.publish('propertyChange', name, oldValue, newValue);

          // TODO: publish to a global topic to support dynamic()

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

  properties: [ 'name', 'code' ],

  methods: [
    function override_(proto, method) {
      /*
        Decorate a method so that it can call the
        method it overrides with this.SUPER().
      */
      var super_ = proto[this.name];

      // Not overriding, or not using SUPER, so just return original method
      if ( ! super_ || method.toString().indexOf('SUPER') == -1 ) return method;

      var SUPER = function() { return super_.apply(this, arguments); };

      // This code isn't JIT'ed in V8 because of the try/finally,
      // so we move it outside of 'f' below so that the rest of
      // that function is JIT'ed.
      var slowF = function(OLD_SUPER, args) {
        try {
          return method.apply(this, args);
        } finally {
          this.SUPER = OLD_SUPER;
        }
      };

      var f = function() {
        var OLD_SUPER = this.SUPER;
        this.SUPER = SUPER;

        if ( OLD_SUPER ) return slowF.call(this, OLD_SUPER, arguments);

        // Fast-Path when it doesn't matter if we restore SUPER or not
        var ret = method.apply(this, arguments);
        this.SUPER = null;
        return ret;
      };

      foam.fn.setName(f, this.name);
      f.toString = function() { return method.toString(); };
      f.super_ = super_;

      return f;
    },
    function installInProto(proto) {
      proto[this.name] = this.override_(proto, this.code);
    }
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
      defaultValue: function(_, a) { return a ? a.toString() : ''; }
    }
  ]
});


CLASS({
  name: 'ArrayProperty',
  extends: 'Property',

  properties: [
    'subType',
    {
      name: 'factory',
      defaultValue: function() { return []; }
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
        return global[this.subType].create(o);
      }
    }
  ]
});


foam.boot.endPhase1();


CLASS({
  name: 'FObject',

  methods: [
    function createListenerList_() {
      return { next: null, children: [] };
    },

    function listeners_() {
      return this.getPrivate_('listeners') ||
        this.setPrivate_('listeners', this.createListenerList_());
    },

    function notify_(listeners, args) {
      var count = 0;
      while ( listeners ) {
        args[0] = listeners.sub;
        listeners.l.apply(null, args);
        listeners = listeners.next;
        count++;
      }
      return count;
    },

    function publish(/* args... */) {
      if ( ! this.hasOwnPrivate_('listeners') ) return 0;

      var listeners = this.listeners_();
      var args      = Array.prototype.concat.apply([null], arguments);
      var count     = this.notify_(listeners.next, args);

      for ( var i = 0 ; i < arguments.length-1 ; i++ ) {
        var listeners = listeners.children[arguments[i]];
        if ( ! listeners ) break;
        count += this.notify_(listeners.next, args);
      }

      return count;
    },

    function subscribe(/* args..., l */) {
      var l         = arguments[arguments.length-1];
      var listeners = this.listeners_();

      for ( var i = 0 ; i < arguments.length-1 ; i++ )
        listeners = listeners.children[arguments[i]] ||
        ( listeners.children[arguments[i]] = this.createListenerList_() );

      var node = {
        sub:  { src: this },
        next: listeners.next,
        prev: listeners,
        l: l
      };
      node.sub.destroy = function() {
        if ( node.next ) node.next.prev = node.prev;
        if ( node.prev ) node.prev.next = node.next;

        // Disconnect so that calling destroy more than once is harmless
        node.next = node.prev = null;
      };

      listeners.next = node;

      return node.sub;
    },

    function unsubscribe(/* args..., l */) {
      var l         = arguments[arguments.length-1];
      var listeners = this.getPrivate_('listeners');

      for ( var i = 0 ; i < arguments.length-1 && listeners ; i++ )
        listeners = listeners.children[arguments[i]];

      var node = listeners && listeners.next;
      while ( node ) {
        if ( node.l === l ) {
          node.sub.destroy();
          return;
        }
      }
    },

    function clearProperty(name) { delete this.instance_[name]; },
    function toString() {
      // Distinguish between prototypes and instances.
      return this.cls_.name + (this.instance_ ? '' : 'Proto')
    }
  ],

  // TODO: insert core/FObject.js functionality

  // TODO: insert foam.events and PropertyChangeSupport here
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

  properties: [ 'name', 'value' ],

  methods: [
    function installInClass(cls)   { cls[foam.string.constantize(this.name)]   = this.value; },
    function installInProto(proto) { proto[foam.string.constantize(this.name)] = this.value; }
  ]
});


CLASS({
  name: 'Trait',

  properties: [
    { name: 'name', getter: function() { return 'trait_' + this.path; } },
    'path'
  ],

  methods: [
    function installInClass(cls) { cls.installModel(global[this.path].model_); }
  ]
});


CLASS({
  name: 'Topic',

  properties: [ 'name', 'description' ],

  methods: [
    function installInProto(proto) {
      var name = this.name;

      Object.defineProperty(proto, name, {
        get: function topicGetter() {
          var self = this;
          if ( ! this.hasOwnPrivate_(name) )
            this.setPrivate_(
              name,
              {
                publish:     self.publish.bind(self, name),
                subscribe:   self.subscribe.bind(self, name),
                unsubscribe: self.unsubscribe.bind(self, name),
                toString:    function() { return 'Topic(' + name + ')'; }
              }
            );

          return this.getPrivate_(name);
        },
        set: function propSetter(newValue) {
          this.setPrivate_(name, newValue);
        },
        configurable: true,
        enumerable: false
      });
    }
  ]
});


CLASS({
  name: 'BooleanProperty',
  extends: 'Property',

  properties: [
    {
      name: 'defaultValue',
      defaultValue: false
    },
    {
      name: 'adapt',
      defaultValue: function(_, v) { return !!v; }
    }
  ]
});


CLASS({
  name: 'IntProperty',
  extends: 'Property',

  properties: [
    'units',
    {
      name: 'defaultValue',
      defaultValue: 0
    },
    {
      name: 'adapt',
      defaultValue: function(_, v) {
        return typeof v === 'number' ?
          Math.round(v) : v ? parseInt(v) : 0 ;
      }
    }
  ]
});


// TODO: Add other Property sub-classes here.


CLASS({
  name: 'Listener',

  properties: [
    'name',
    'code',
    { type: 'Boolean', name: 'isFramed',   defaultValue: false },
    { type: 'Boolean', name: 'isMerged',   defaultValue: false },
    { type: 'Int',     name: 'mergeDelay', defaultValue: 16, units: 'ms' }
  ],

  methods: [
    function installInProto(proto) {
      var name = this.name;
      var code = this.code;

      Object.defineProperty(proto, name, {
        get: function topicGetter() {
          if ( ! this.hasOwnPrivate_(name) )
            this.setPrivate_(name, code.bind(this));

          return this.getPrivate_(name);
        },
        configurable: true,
        enumerable: false
      });
    }
  ]
});


CLASS({
  name: 'Model',

  properties: [
    {
      type: 'AxiomArray',
      subType: 'Trait',
      name: 'traits',
      adaptArrayElement: function(o) {
        return typeof o === 'string' ?
          Trait.create({path: o})    :
          Trait.create(o)            ;
      }
    },
    {
      type: 'AxiomArray',
      subType: 'Constant',
      name: 'constants',
      adapt: function(_, a, prop) {
        if ( ! a ) return [];
        if ( ! Array.isArray(a) ) {
          var cs = [];
          for ( var key in a )
            cs.push(Constant.create({name: key, value: a[key]}));
          return cs;
        }
        return a.map(prop.adaptArrayElement.bind(prop));
      }
    },
    {
      type: 'AxiomArray',
      subType: 'Topic',
      name: 'topics',
      adaptArrayElement: function(o) {
        return typeof o === 'string' ?
          Topic.create({name: o})    :
          Topic.create(o)            ;
      }
    },
    {
      type: 'AxiomArray',
      subType: 'Property',
      name: 'properties',
      adaptArrayElement: function(o) {
        return typeof o === 'string'     ?
          Property.create({name: o})     :
          global[this.subType].create(o) ;
      }
    },
    {
      type: 'AxiomArray',
      subType: 'Method',
      name: 'methods',
      adaptArrayElement: function(o) {
        if ( typeof o === 'function' ) {
          console.assert(o.name, 'Method must be named');
          return Method.create({name: o.name, code: o});
        }
        return global[this.subType].create(o);
      }
    },
    {
      type: 'AxiomArray',
      subType: 'Listener',
      name: 'listeners',
      adaptArrayElement: function(o) {
        if ( typeof o === 'function' ) {
          console.assert(o.name, 'Listener must be named');
          return Listener.create({name: o.name, code: o});
        }
        return Listener.create(o);
      }
    }
  ]
});


CLASS({
  name: 'FObject',

  topics: [ 'propertyChange' ],

  methods: [
    function initArgs(args) {
      if ( ! args ) return;

      if ( args.__proto__ === Object.prototype ) {
        for ( var key in args )
          this[key] = args[key];
      } else if ( args.instance_ ) {
        for ( var key in args.instance_ )
          if ( this.cls_.getAxiomByName(key) )
            this[key] = args.instance_[key];
      } else {
        this.copyFrom(args);
      }
    },
    function copyFrom(o) {
      // TODO: should walk through Axioms with initAgents instead
      var a = this.cls_.getAxiomsByClass(Property);
      for ( var i = 0 ; i < a.length ; i++ ) {
        var name = a[i].name;
        if ( typeof o[name] !== 'undefined' ) {
          this[name] = o[name];
        }
      }
      return this;
    }
  ]
});

foam.boot.end();


/*
  TODO:
  - SUPER support
  - Lightweight Objects
  - Add package and id to Model and Class
  - Proxy id, name, package, label, plural from Class to Model
  - Make Properties be adapter functions.
  - Make Properties be comparator functions.
*/
