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

/**
 * Top-Level of foam package
 * @exports foam
 */
foam = {
  isServer: typeof process === 'object',
  core:     {},
  Array:    Array.prototype,
  Function: Function.prototype,
  Number:   Number.prototype,
  Object:   Object.prototype,
  String:   String.prototype,
  Date:     Date.prototype,
};

/** Setup nodejs-like 'global' on web */
if ( ! foam.isServer ) global = this;


/**
 * A LIB is a collection of static constants, properties and functions.
 */
foam.LIB = function LIB(model) {
  var proto;

  function defineProperty(proto, key, map) {
    if ( ! map.value || proto === Object.prototype || proto === Array.prototype )
      Object.defineProperty.apply(this, arguments);
    else
      proto[key] = map.value;
  }

  proto = model.name ? foam[model.name] || ( foam[model.name] = {} ) : foam;

  if ( model.properties ) for ( var i = 0 ; i < model.properties.length ; i++ ) {
    var p = model.properties[i];
    defineProperty(
      proto,
      p.name,
      { get: p.getter, enumerable: false });
  }

  for ( key in model.constants )
    defineProperty(
      proto,
      key,
      { value: model.constants[key], writable: true, enumerable: false });

  if ( model.methods ) for ( var i = 0 ; i < model.methods.length ; i++ ) {
    var m = model.methods[i];
    defineProperty(
      proto,
      m.name,
      { value: m.code || m, writable: true, enumerable: false });
  }
};


/*
 * Add Unique Identifiers (UIDs) to all Objects.
 * UID's are created when first accessed.
 */
foam.LIB({
  name: 'Object',

  properties: [
    {
      name: '$UID',
      getter: (function() {
        var id = 1;
        return function() {
          if ( Object.hasOwnProperty.call(this, '$UID__') ) return this.$UID__;
          Object.defineProperty(this, '$UID__', {value: id, enumerable: false});
          id++;
          return this.$UID__;
        };
      })()
    }
  ]
});


foam.LIB({
  name: 'Number',

  methods: [
    function compareTo(o) { return ( o == this ) ? 0 : this < o ? -1 : 1; },
  ]
});


foam.LIB({
  name: 'String',

  methods: [
    function compareTo(o) { return ( o == this ) ? 0 : this < o ? -1 : 1; },

    /** Adds hashCode functionality to all strings. */
    function hashCode() {
      var hash = 0;
      if ( this.length == 0 ) return hash;

      for (i = 0; i < this.length; i++) {
        var code = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + code;
        hash &= hash;
      }

      return hash;
    }
  ]
});


foam.LIB({
  name: 'Array',
  methods: [
    function diff(other) {
      /** Finds elements added (found in other, not in this) and removed
          (found in this, not in other). Repeated values are treated
          as separate elements, but ordering changes are ignored. */
      var added = other.slice(0);
      var removed = [];
      for ( var i = 0 ; i < this.length ; i++ ) {
        for ( var j = 0 ; j < added.length ; j++ ) {
          if ( this[i].compareTo(added[j]) == 0 ) {
            added.splice(j, 1);
            j--;
            break;
          }
        }
        if ( j == added.length ) removed.push(this[i]);
      }
      return { added: added, removed: removed };
    },
    function clone() {
      /** Returns a deep copy of this array and its contents. */
      var ret = new Array(this.length);
      for ( var i = 0; i < this.length; i++ ) {
        ret[i] = ( this[i].clone ) ? this[i].clone() : this[i];
      }
      return ret;
    },
    function shallowClone() {
      /** Returns a new array containing the same elements as this. */
      return this.slice();
    }
  ]
});

foam.LIB({
  name: 'Date',
  methods: [
    function toRelativeDateString(){
      // TODO i18n: make this translatable
      var seconds = Math.floor((Date.now() - this.getTime())/1000);

      if ( seconds < 60 ) return 'moments ago';

      var minutes = Math.floor((seconds)/60);

      if ( minutes == 1 ) return '1 minute ago';

      if ( minutes < 60 ) return minutes + ' minutes ago';

      var hours = Math.floor(minutes/60);
      if ( hours == 1 ) return '1 hour ago';

      if ( hours < 24 ) return hours + ' hours ago';

      var days = Math.floor(hours / 24);
      if ( days == 1 ) return '1 day ago';

      if ( days < 7 ) return days + ' days ago';

      if ( days < 365 ) {
        var year = 1900+this.getYear();
        var noyear = this.toDateString().replace(' ' + year, '');
        return noyear.substring(4);
      }

      return this.toDateString().substring(4);
    },

    function equals(o) {
      if ( ! o ) return false;
      if ( ! o.getTime ) return false;
      return this.getTime() === o.getTime();
    },

    function compareTo(o){
      if ( o === this ) return 0;
      if ( ! o ) return 1;
      var d = this.getTime() - o.getTime();
      return d == 0 ? 0 : d > 0 ? 1 : -1;
    }
  ]
});



foam.LIB({
  name: 'array',

  methods: [
    function argsToArray(args) {
      /** convenience method to turn 'arguments' into a real array */
      return foam.fn.appendArguments([], args, 0);
    }
  ]
});


foam.LIB({
  name: 'events',

  methods: [
    function oneTime(listener) {
      /** Create a "one-time" listener which unsubscribes itself after its first invocation. **/
      return function(subscription) {
        listener.apply(this, foam.array.argsToArray(arguments));
        subscription.destroy();
      };
    },

    function consoleLog(listener) {
      /** Log all listener invocations to console. **/
      return function() {
        var args = foam.array.argsToArray(arguments);
        console.log(args);
        listener && listener.apply(this, args);
      };
    }
  ]
});


foam.LIB({
  name: 'util',
  methods: [
    function equals(a, b) {
      if ( a === b ) return true;
      if ( ! a || ! b ) return false;
      if ( a.equals ) return a.equals(b);
      return a == b;
    }
  ]
});


foam.LIB({
  name: 'fn',

  methods: [
    function memoize1(f) {
      // Faster version of memoize() when only dealing with one argument.
      var cache = {};
      var g = function(arg) {
        console.assert(arguments.length == 1, "Memoize1'ed functions must take exactly one argument.");
        var key = arg ? arg.toString() : '';
        if ( ! cache.hasOwnProperty(key) ) cache[key] = f.call(this, arg);
        return cache[key];
      };
      foam.fn.setName(g, 'memoize1(' + f.name + ')');
      return g;
    },

    function setName(f, name) {
      /** Set a function's name for improved debugging and profiling **/
      Object.defineProperty(f, 'name', {value: name, configurable: true});
    },

    function appendArguments(a, args, start) {
      /** Convenience method to append 'arguments' onto a real array **/
      for ( var i = start ; i < args.length ; i++ ) a.push(args[i]);
      return a;
    },

    function argsStr(f) {
      /** Finds the function(...) declaration arguments part. Strips newlines. */
      return f.toString().replace(/(\r\n|\n|\r)/gm,"").match(/^function(\s+[_$\w]+|\s*)\((.*?)\)/)[2] || '';
    },

    function argsArray(f) {
      /**
       * Return a function's arguments as an array.
       * Ex. args(function(a,b) {...}) == ['a', 'b']
       **/
      var args = foam.fn.argsStr(f);
      if ( ! args ) return [];
      args += ',';

      var ret = [];
      // [ ws /* anything */ ] ws arg_name ws [ /* anything */ ],
      var argMatcher = /(\s*\/\*.*?\*\/)?\s*([\w_$]+)\s*(\/\*.*?\*\/)?\s*\,+/g;
      var typeMatch;
      while ((typeMatch = argMatcher.exec(args)) !== null) {
        ret.push(typeMatch[2]);
      }
      return ret;
    },

    // ???: Is this needed?
    /*
    function passProperties(args, f) {
      return function passProperties() {
        var self = this;
        return f.apply(this, args.map(function(arg) { return self[arg]; }));
      };
    }
    */
  ]
});

(function() {
  // Disable setName if not supported on this platform.
  try {
    foam.fn.setName(function() {}, '');
  } catch (x) {
    foam.LIB({
      name: 'fn',
      methods: [ function setName() { /* NOP */ } ]
    });
  }
})();


foam.LIB({
  name: 'string',

  methods: [
    {
      name: 'constantize',
      code: foam.fn.memoize1(function(str) {
        // switchFromCamelCaseToConstantFormat to SWITCH_FROM_CAMEL_CASE_TO_CONSTANT_FORMAT
        return str.replace(/[a-z][^0-9a-z_]/g, function(a) {
          return a.substring(0,1) + '_' + a.substring(1,2);
        }).toUpperCase();
      })
    },

    {
      name: 'labelize',
      code: foam.fn.memoize1(function(str) {
        if ( ! str || str === '' ) return str;
        return this.capitalize(str.replace(/[a-z][A-Z]/g, function (a) { return a.charAt(0) + ' ' + a.charAt(1); }));
      })
    },

    {
      name: 'capitalize',
      code: foam.fn.memoize1(function(str) {
        // switchFromProperyName to //SwitchFromPropertyName
        return str[0].toUpperCase() + str.substring(1);
      })
    },

    function pad(str, size) {
      // Right pads to size if size > 0, Left pads to -size if size < 0
      return size < 0 ?
        (new Array(-size).join(' ') + str).slice(size)       :
        (str + new Array(size).join(' ')).substring(0, size) ;
    },

    function multiline(f) {
      // Function for returning multi-line strings from commented functions.
      // Ex. var str = multiline(function() { /* multi-line string here */ });
      if ( typeof f === 'string' ) return f;
      var s = f.toString();
      var start = s.indexOf('/*');
      var end   = s.lastIndexOf('*/');
      return s.substring(start+2, end);
    }
  ]
});


(function() {

  function set(X, key, value) {
    /** Update a Context binding. **/
    X[key] = value;

    // TODO:
    // if ( GLOBAL.SimpleReadOnlyValue && key !== '$' && key !== '$$' )
    // X[key + '$'] = SimpleReadOnlyValue.create({value: value});
  }

  function setDynamic(X, key, dValue) {
    Object.defineProperty(
      X,
      key,
      {
        get: function() { return dValue.get(); },
        configurable: true
      }
    );

    if ( key !== '$' && key !== '$$' ) X[key + '$'] = dValue;
  }

  var ROOT = global;

  function lookup_(id) {
    var path = id.split('.');
    var root = ROOT;
    for ( var i = 0 ; root && i < path.length ; i++ )
      root = root[path[i]];
    return root;
  }

  var X = {
    lookup: function(id) {
      return id && ( lookup_('foam.core.' + id) || lookup_(id) );
    },

    register: function(cls) {
      var path = cls.id.split('.');
      var root = ROOT;
      for ( var i = 0 ; i < path.length-1 ; i++ ) {
        root = root[path[i]] || ( root[path[i]] = {} );
      }
      root[path[path.length-1]] = cls;
    },

    sub: function sub(opt_args, opt_name) {
      var sub = Object.create(this);

      if ( opt_args ) for ( var key in opt_args ) {
        if ( opt_args.hasOwnProperty(key) ) {
          var asDyn = key !== '$' && key != '$$' && key.charAt(key.length-1) == '$';
          if ( asDyn ) {
            setDynamic(sub, key.substring(0, key.length-1), opt_args[key]);
          } else {
            set(sub, key, opt_args[key]);
          }
        }
      }

      if ( opt_name )
        Object.defineProperty(sub, 'NAME', {value: opt_name, enumerable: false});

      return sub;
    }
  };

  foam.X = X;

  for ( var key in X ) foam[key] = X[key].bind(X);
})();
