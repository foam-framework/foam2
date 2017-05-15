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
 */
foam = {
  isServer: typeof window === 'undefined',
  core:     {},
  next$UID: (function() {
    /* Return a unique id. */
    var id = 1;
    return function next$UID() { return id++; };
  })()
};


/** Setup nodejs-like 'global' on web */
if ( ! foam.isServer ) global = window;


Object.defineProperty(
  Object.prototype,
  '$UID',
  {
    get: function() {
      if ( ! Object.hasOwnProperty.call(this, '$UID__') &&
           ! Object.isFrozen(this) ) {
        Object.defineProperty(
            this,
            '$UID__',
            {value: foam.next$UID(), enumerable: false});
      }
      return this.$UID__;
    },
    enumerable: false
  }
);


/**
 * Define an assertion function that is significantly faster and more
 * compatible than console.assert.  Also allows us to turn off assertions
 * in a production scenario.
 *
 * Usage of console.assert directly is slow, and not all platforms agree
 * on what to do with extra arguments, some ignore them, some join them
 * to the message.
 */
foam.assert = function assert(cond) {
  if ( ! cond ) {
    console.assert(false, Array.from(arguments).slice(1).join(' '));
  }

  return cond;
};


/**
 * Creates a small library in the foam package. A LIB is a collection of
 * constants and static methods.
 * <pre>
foam.LIB({
  name: 'network',
  constants: {
    PORT: 4000
  },
  methods: [ function sendPacket() { ... }  ]
});
</pre>
Produces <code>foam.network</code>:
<pre>
console.log(foam.network.PORT); // outputs 4000
foam.network.sendPacket();
</pre>
 * @method LIB
 * @memberof module:foam
 */
foam.LIB = function LIB(model) {
  var root = global;
  var path = model.name.split('.');
  var i;

  for ( i = 0 ; i < path.length ; i++ ) {
    root = root[path[i]] || ( root[path[i]] = {} );
  }

  // During boot, keep a list of created LIBs
  if ( global.foam.__LIBS__ ) global.foam.__LIBS__[model.name] = root;

  if ( model.constants ) {
    foam.assert(
      typeof model.constants === 'object',
      'Constants must be a map.');

    for ( var key in model.constants ) root[key] = model.constants[key];
  }

  if ( model.methods ) {
    foam.assert(Array.isArray(model.methods), 'Methods must be an array.');

    for ( i = 0 ; i < model.methods.length ; i++ ) {
      var m = model.methods[i];

      foam.assert(
        typeof m === 'object' || typeof m === 'function',
        'Methods must be a map of a function');

      foam.assert(
         typeof m !== 'object' || typeof m.code === 'function',
        'Methods must have a code key which is a function');

      foam.assert(
        typeof m.name === 'string' && m.name !== '',
        'Methods must be named with a non-empty string');

      root[m.name] = m.code || m;
    }
  }
};
global.foam.__LIBS__ = Object.create(null);
/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
  Rather than extending built-in prototypes, we create flyweight versions.

  This has a number of advantages:
  1. It avoids conflicts with other libraries which might also extend built-in
     types with methods with the same names but different semantics.
  2. It is >10X faster (in V8) to call a flyweight method than a Method added
     to the prototypes of String or Number. This is because calling an added
     method on those types promotes the object from a primitive string or number
     to a String or Number object.  Creating the object takes time and creates a
     new object that will need to be GC'ed.
  3. It lets us effectively add methods to built-in special values like
     true, false, null, and undefined. This avoids the need for null-pointer
     checks.
  4. It avoids the proliferation of large ===/typeof/isInstance/instanceof blocks
     throughout the rest of the code.
  5. It provides a consistent method for checking an object's type, since each
     type flyweight has an .isInstance() method which abstracts the underlying detection
     mechanism.
  6. It makes the future implementation of multi-methods much easier.
*/

/**
 * Each of these flyweight types follows a standard interface.
 *
 * <pre>
 * interface Type {
 *   // Returns true if the given object is of this type.
 *   // example: foam.String.isInstance('hello') -> true
 *   isInstance(o) -> Boolean
 *
 *   // Returns a deep clone of o, if the type supports it.
 *   clone(o);
 *
 *   // Returns true if a and b are equivalent.
 *   equals(a, b) -> Boolean
 *
 *   // Returns -1, 0 or 1 as a comparsion of the two types.
 *   // -1 means that 'a' is considered smaller that 'b'
 *   // 0 means that and 'a' and 'b' are considered equivalent
 *   // 1 means that 'a' is considered larger than 'b'
 *   compare(a, b) -> Int
 *
 *   // Returns a hash of 'a' useful for hash tables
 *   hashCode(a) -> Int
 * }
 */

foam.LIB({
  name: 'foam.Undefined',
  methods: [
    function isInstance(o) { return o === undefined; },
    function clone(o) { return o; },
    function equals(_, b) { return b === undefined; },
    function compare(_, b) { return b === undefined ? 0 : 1; },
    function hashCode() { return -2; }
  ]
});


foam.LIB({
  name: 'foam.Null',
  methods: [
    function isInstance(o) { return o === null; },
    function clone(o) { return o; },
    function equals(_, b) { return b === null; },
    function compare(_, b) {
      return b === null ? 0 : b === undefined ? -1 : 1;
    },
    function hashCode() { return -3; }
  ]
});


foam.LIB({
  name: 'foam.Boolean',
  methods: [
    function isInstance(o) { return typeof o === 'boolean'; },
    function clone(o) { return o; },
    function equals(a, b) { return a === b; },
    function compare(a, b) { return a ? (b ? 0 : 1) : (b ? -1 : 0); },
    function hashCode(o) { return o ? 1 : -1; }
  ]
});


foam.LIB({
  name: 'foam.Function',
  methods: [
    function isInstance(o) { return typeof o === 'function'; },
    function clone(o) { return o; },
    function equals(a, b) { return b ? a.toString() === b.toString() : false; },
    function compare(a, b) {
      return b ? foam.String.compare(a.toString(), b.toString()) :  1;
    },
    function hashCode(o) { return foam.String.hashCode(o.toString()); },

    /* istanbul ignore next */
    function bind(f, that, a1, a2, a3, a4) {
      /**
       * Faster than Function.prototype.bind
       */
      switch ( arguments.length ) {
        case 1:
          console.error('No arguments given to bind to.');
          break;
        case 2: return function() { return f.apply(that, arguments); };
        case 3: return function(b1, b2, b3, b4) {
          switch ( arguments.length ) {
            case 0: return f.call(that, a1);
            case 1: return f.call(that, a1, b1);
            case 2: return f.call(that, a1, b1, b2);
            case 3: return f.call(that, a1, b1, b2, b3);
            case 4: return f.call(that, a1, b1, b2, b3, b4);
          }
        };
        case 4: return function(b1, b2, b3, b4) {
          switch ( arguments.length ) {
            case 0: return f.call(that, a1, a2);
            case 1: return f.call(that, a1, a2, b1);
            case 2: return f.call(that, a1, a2, b1, b2);
            case 3: return f.call(that, a1, a2, b1, b2, b3);
            case 4: return f.call(that, a1, a2, b1, b2, b3, b4);
          }
        };
        case 5: return function(b1, b2, b3, b4) {
          switch ( arguments.length ) {
            case 0: return f.call(that, a1, a2, a3);
            case 1: return f.call(that, a1, a2, a3, b1);
            case 2: return f.call(that, a1, a2, a3, b1, b2);
            case 3: return f.call(that, a1, a2, a3, b1, b2, b3);
            case 4: return f.call(that, a1, a2, a3, b1, b2, b3, b4);
          }
        };
        case 6: return function(b1, b2, b3, b4) {
          switch ( arguments.length ) {
            case 0: return f.call(that, a1, a2, a3, a4);
            case 1: return f.call(that, a1, a2, a3, a4, b1);
            case 2: return f.call(that, a1, a2, a3, a4, b1, b2);
            case 3: return f.call(that, a1, a2, a3, a4, b1, b2, b3);
            case 4: return f.call(that, a1, a2, a3, a4, b1, b2, b3, b4);
          }
        };
      }

      console.error('Attempt to foam.Function.bind more than 4 arguments.');
    },

    /**
     * Decorates the function 'f' to cache the return value of 'f' when
     * called in the future. Also known as a 'thunk'.
     */
    function memoize0(/* Function */ f) {
      var set = false, cache;
      var ret = foam.Function.setName(
          function() {
            if ( ! set ) {
              set = true;
              cache = f();
            }
            return cache;
          },
          'memoize0(' + f.name + ')');
      ret.toString = function() { return f.toString(); };
      return ret;
    },

    /**
     * Decorates the function 'f' to cache the return value of 'f' when called
     * with a particular value for its first argument.
     */
    function memoize1(/* Function */ f) {
      var cache = {}, nullCache, undefinedCache;
      var ret = foam.Function.setName(
          function(key) {
            foam.assert(
                arguments.length === 1,
                'Memoize1\'ed functions must take exactly one argument.');

            var mKey =
                key === null      ? '___null___'      :
                key === undefined ? '___undefined___' :
                key ;

            if ( ! cache.hasOwnProperty(mKey) ) cache[mKey] = f.call(this, key);

            return cache[mKey];
          },
          'memoize1(' + f.name + ')');
        ret.toString = function() { return f.toString(); };
        return ret;
    },

    /**
     * Set a function's name for improved debugging and profiling
     *
     * Returns the given function.
     */
    function setName(f, name) {
      Object.defineProperty(f, 'name', { value: name, configurable: true });
      return f;
    },

    /** Convenience method to append 'arguments' onto a real array **/
    function appendArguments(a, args, start) {
      start = start || 0;
      for ( var i = start ; i < args.length ; i++ ) a.push(args[i]);
      return a;
    },

    /** Finds the function(...) declaration arguments part. Strips newlines. */
    function argsStr(f) {
      var str = f.
          toString().
          replace(/(\r\n|\n|\r)/gm,'');
      var isArrowFunction = str.indexOf('function') !== 0;

      var match = isArrowFunction ?
          // (...args...) => ...
          // or
          // arg => ...
          match = str.match(/^(\(([^)]*)\)[^=]*|([^=]+))=>/) :
          // function (...args...) { ...body... }
          match = str.match(/^function(\s+[_$\w]+|\s*)\((.*?)\)/);

      if ( ! match ) {
        /* istanbul ignore next */
        throw new TypeError("foam.Function.argsStr could not parse input function:\n" + ( f ? f.toString() : 'undefined' ) );
      }

      return isArrowFunction ? (match[2] || match[1] || '') : (match[2] || '');
    },

    function argNames(f) {
      /**
       * Return a function's arguments as an array.
       * Ex. argNames(function(a,b) {...}) === ['a', 'b']
       **/
      var args = foam.Function.argsStr(f);
      args += ',';

      var ret = [];
      // [ ws /* anything */ ] ws [...]arg_name ws [ /* anything */ ],
      var argMatcher = /(\s*\/\*.*?\*\/)?\s*((?:\.\.\.)?[\w_$]+)\s*(\/\*.*?\*\/)?\s*\,+/g;
      var typeMatch;
      while ( ( typeMatch = argMatcher.exec(args) ) !== null ) {
        ret.push(typeMatch[2]);
      }
      return ret;
    },

    /** Finds the function(...) declaration and finds the first block comment
      in the function body. */
    function functionComment(f) {
      var match = f.
          toString().
          replace(/\n/g, '_#_%_%_'). // fake newlines
          match(/^function(\s+[_$\w]+|\s*)\(.*?\)(?:\_\#\_\%\_\%\_|\s)*\{(?:\_\#\_\%\_\%\_|\s)*\/\*\*?\s*(.*?)\*?\*\/.*\}/);
      if ( ! match ) {
        return '';
      } else {
        return match[2] && match[2].replace(/_#_%_%_/g, '\n') || '';
      }
    },

    /**
     * Calls fn, and provides the arguments to fn by looking
     * up their names on source. The 'this' context is either
     * source, or opt_self if provided.
     *
     * If the argument maps to a function on source, it is bound to source.
     *
     * Ex.
     * var a = {
     *   name: 'adam',
     *   hello: function() {
     *     console.blog('Hello ' + this.name);
     *   }
     * };
     * function foo(name, hello) {
     *   console.log('Name is ' + name);
     *   hello();
     * }
     * foam.Function.withArgs(foo, a);
     *
     * Outputs:
     * Name is adam
     * Hello adam
     *
     **/
    function withArgs(fn, source, opt_self) {
      var argNames = foam.Function.argNames(fn);
      var args = [];
      for ( var i = 0 ; i < argNames.length ; i++ ) {
        var a = source[argNames[i]];
        if ( typeof a === 'function' ) a = a.bind(source);
        args.push(a);
      }
      return fn.apply(opt_self || source, args);
    },

    function closure(fn) {
      /**
         Create a closure which still serializes to its definition.

         var f = foam.Function.closure(function() { var i = 0; return function() { return i++; } });
         f(); -> 0
         f(); -> 1
         f.toString(); -> "foam.Function.closure(function () { var i = 0; return function() { return i++; } })"
      */
      var ret = fn();

      ret.toString = function() { return 'foam.Function.closure(' + fn.toString() + ')'; };

      return ret;
    }
  ]
});


/* istanbul ignore next */
(function() {
  // Disable setName if not supported on this platform.
  try {
    foam.Function.setName(function() {}, '');
  } catch (x) {
    console.warn('foam.Function.setName is not supported on your platform. ' +
                 'Stack traces will be harder to decipher, but no ' +
                 'functionality will be lost');
    foam.LIB({
      name: 'foam.Function',
      methods: [
        function setName(f) { return f; }
      ]
    });
  }
})();


foam.LIB({
  name: 'foam.Number',
  methods: [
    function isInstance(o) { return typeof o === 'number'; },
    function clone(o) { return o; },
    function equals(a, b) { return a === b; },
    function compare(a, b) {
      return ( b === null || b === undefined ) ? 1 :
          a < b ? -1 : a > b ? 1 : 0;
    },
    (function() {
      var bufForHash = new ArrayBuffer(8);
      var floatArrayForHash = new Float64Array(bufForHash);
      var intArrayForHash = new Int32Array(bufForHash);

      return function hashCode(n) {
        if (Number.isInteger(n)) return n & n; // Truncate to 32 bits.

        floatArrayForHash[0] = n;
        var hash = ((intArrayForHash[0] << 5) - intArrayForHash[0]) +
            intArrayForHash[1];
        return hash & hash; // Truncate to 32 bits.
      };
    })()
  ]
});


foam.LIB({
  name: 'foam.String',
  methods: [
    function isInstance(o) { return typeof o === 'string'; },
    function clone(o) { return o; },
    function equals(a, b) { return a === b; },
    function compare(a, b) { return b != null ? a.localeCompare(b) : 1 ; },
    function hashCode(s) {
      var hash = -4;

      for ( var i = 0 ; i < s.length ; i++ ) {
        var code = s.charCodeAt(i);
        hash = ((hash << 5) - hash) + code;
        hash &= hash; // Truncate to 32 bits.
      }

      return hash;
    },
    {
      name: 'constantize',
      code: foam.Function.memoize1(function(/* String */ str) {
        // switches from from camelCase to CAMEL_CASE
        return str.replace(/([a-z])([^0-9a-z_])/g, '$1_$2').toUpperCase();
      })
    },
    {
      name: 'labelize',
      code: foam.Function.memoize1(function(/* String= */ str) {
        if ( str === '' || str === null || foam.Undefined.isInstance(str) ) return '';

        return this.capitalize(str.replace(/[a-z][A-Z]/g, function(a) {
          return a.charAt(0) + ' ' + a.charAt(1);
        }));
      })
    },
    {
      name: 'capitalize',
      code: foam.Function.memoize1(function(str) {
        foam.assert(typeof str === 'string',
            'Cannot capitalize non-string values.');
        // switchFromProperyName to //SwitchFromPropertyName
        return str[0].toUpperCase() + str.substring(1);
      })
    },
    {
      /**
       * Takes a key and creates a slot name for it.  Generally key -> key + '$'.
       *
       * For example, if an object has a property called myProperty, the slot
       * name for that will be myProperty$.
       */
      name: 'toSlotName',
      code: foam.Function.memoize1(function toSlotName(key) {
        foam.assert(
            typeof key === 'string',
            'Cannot toSlotName non-string values.');

        return key + '$';
      })
    },
    {
      name: 'toUpperCase',
      code: foam.Function.memoize1(function(str) {
        foam.assert(
            typeof str === 'string',
            'Cannot toUpperCase non-string values.');

        return str.toUpperCase();
      })
    },
    {
      name: 'cssClassize',
      code: foam.Function.memoize1(function(str) {
        foam.assert(typeof str === 'string',
            'Cannot cssClassize non-string values.');
        // Turns foam.u2.Foo into foam-u2-Foo
        return str.replace(/\./g, '-');
      })
    },
    function pad(obj, size) {
      // Right pads to size if size > 0, Left pads to -size if size < 0
      return size < 0 ?
        (new Array(-size).join(' ') + obj).slice(size)       :
        (obj + new Array(size).join(' ')).substring(0, size) ;
    },
    function multiline(f) {
      // Function for returning multi-line strings from commented functions.
      // Ex. var str = multiline(function() { /* multi-line string here */ });
      if ( typeof f === 'string' ) return f;
      var s     = f.toString();
      var start = s.indexOf('/*');
      var end   = s.lastIndexOf('*/');
      return ( start >= 0 && end >= 0 ) ? s.substring(start + 2, end) : '';
    },
    function startsWithIC(a, b) {
      foam.assert(typeof a === 'string' && typeof b === 'string',
          'Cannot startsWithIC non-string values.');

      return a.toUpperCase().startsWith(b.toUpperCase());
    },
    (function() {
      var map = {};

      return function intern(val) {
        /** Convert a string to an internal canonical copy. **/
        return map[val] || (map[val] = val.toString());
      };
    })(),
  ]
});


foam.LIB({
  name: 'foam.Array',
  methods: [
    function isInstance(o) { return Array.isArray(o); },
    function clone(o) {
      /** Returns a deep copy of this array and its contents. */
      var ret = new Array(o.length);
      for ( var i = 0 ; i < o.length ; i++ ) {
        ret[i] = foam.util.clone(o[i]);
      }
      return ret;
    },
    function diff(a, b) {
      /** Finds elements added (found in other, not in this) and removed
          (found in this, not in other). Repeated values are treated
          as separate elements, but ordering changes are ignored. */
      var added = b.slice(0);
      var removed = [];
      for ( var i = 0 ; i < a.length ; i++ ) {
        for ( var j = 0 ; j < added.length ; j++ ) {
          if ( foam.util.equals(a[i], added[j]) ) {
            added.splice(j, 1);
            j--;
            break;
          }
        }
        if ( j === added.length ) removed.push(a[i]);
      }
      return { added: added, removed: removed };
    },
    function equals(a, b) {
      if ( ! b || ! Array.isArray(b) || a.length !== b.length ) return false;
      for ( var i = 0 ; i < a.length ; i++ ) {
        if ( ! foam.util.equals(a[i], b[i]) ) return false;
      }
      return true;
    },
    function compare(a, b) {
      if ( ! b || ! Array.isArray(b) ) return 1;
      var l = Math.min(a.length, b.length);
      for ( var i = 0 ; i < l ; i++ ) {
        var c = foam.util.compare(a[i], b[i]);
        if ( c ) return c;
      }
      return a.length === b.length ? 0 : a.length < b.length ? -1 : 1;
    },
    function hashCode(a) {
      var hash = -5;

      for ( var i = 0 ; i < a.length ; i++ ) {
        hash = ((hash << 5) - hash) + foam.util.hashCode(a[i]);
      }

      return hash;
    },
    function remove(a, o) {
      for ( var i = 0 ; i < a.length ; i++ ) {
        if ( o === a[i] ) {
          a.splice(i, 1);
        }
      }
    }
  ]
});


foam.LIB({
  name: 'foam.Date',
  methods: [
    function isInstance(o) { return o instanceof Date; },
    function clone(o) { return new Date(o); },
    function getTime(d) { return ! d ? 0 : d.getTime ? d.getTime() : d ; },
    function equals(a, b) { return this.getTime(a) === this.getTime(b); },
    function compare(a, b) {
      a = this.getTime(a);
      b = this.getTime(b);
      return a < b ? -1 : a > b ? 1 : 0;
    },
    // Hash n & n: Truncate to 32 bits.
    function hashCode(d) { var n = d.getTime(); return n & n; },
    function relativeDateString(date) {
      // FUTURE: make this translatable for i18n, including plurals
      //   "hours" vs. "hour"
      var seconds = Math.trunc( ( Date.now() - date.getTime() ) / 1000 );

      if ( seconds >= 0 && seconds < 60 ) return 'moments ago';
      if ( seconds < 0  && seconds > -60 ) return 'in moments';

      var minutes = Math.trunc((seconds) / 60);

      if ( minutes === 1 ) return '1 minute ago';
      if ( minutes === -1 ) return 'in 1 minute';

      if ( minutes >= 0 && minutes < 60 ) return minutes + ' minutes ago';
      if ( minutes < 0  && minutes > -60 ) return 'in ' + -minutes + ' minutes';

      var hours = Math.trunc(minutes / 60);
      if ( hours === 1 ) return '1 hour ago';
      if ( hours === -1 ) return 'in 1 hour';

      if ( hours >= 0 && hours < 24 ) return hours + ' hours ago';
      if ( hours <  0 && hours > -24 ) return 'in ' + -hours + ' hours';

      var days = Math.trunc(hours / 24);
      if ( days === 1 ) return '1 day ago';
      if ( days === -1 ) return 'in 1 day';

      if ( days >= 0 && days < 7 ) return days + ' days ago';
      if ( days <  0 && days > -7 ) return 'in ' + -days + ' days';

      if ( days >= 0 && days < 365 || days < 0 && days > -365 ) {
        var year = 1900 + date.getYear();
        var noyear = date.toDateString().replace(' ' + year, '');
        return noyear.substring(4);
      }

      return date.toDateString().substring(4);
    }
  ]
});


// An FObject is a FOAM-Object, the root class for all modeled classes.
foam.LIB({
  name: 'foam.core.FObject',
  methods: [
    // Can't be an FObject yet because we haven't built the class system yet
    /* istanbul ignore next */
    function isInstance(o) { return false; },
    function clone(o)      { return o ? o.clone() : this; },
    function diff(a, b)    { return a.diff(b); },
    function equals(a, b)  { return a.equals(b); },
    function compare(a, b) { return a.compareTo(b); },
    function hashCode(o)   { return o.hashCode(); }
  ]
});


// AN Object is a Javascript Object which is neither an FObject nor an Array.
foam.LIB({
  name: 'foam.Object',
  methods: [
    function forEach(obj, f) {
      for ( var key in obj ) {
        if ( obj.hasOwnProperty(key) ) f(obj[key], key);
      }
    },
    function isInstance(o) {
      return typeof o === 'object' && ! Array.isArray(o);
    },
    function clone(o) { return o; },
    function equals(a, b) { return a === b; },
    function compare(a, b) {
      return foam.Number.compare(a.$UID, b ? b.$UID : -1);
    },
    function hashCode(o) {
      var hash = 19;
      for ( var key in o ) {
        if ( ! o.hasOwnProperty(key) ) continue;
        hash = ((hash << 5) - hash) + foam.util.hashCode(o[key]);
      }
      return hash;
    },
    function freeze(o) {
      // Force $UID creation before freezing because it can't
      // be added to the object after it's frozen.
      o.$UID__ = foam.next$UID();
      Object.freeze(o);
    }
  ]
});


/**
  Return the flyweight 'type object' for the provided object.
  Any value is a valid argument, including null and undefined.
*/
foam.typeOf = (function() {
  var tNumber    = foam.Number;
  var tString    = foam.String;
  var tUndefined = foam.Undefined;
  var tNull      = foam.Null;
  var tBoolean   = foam.Boolean;
  var tArray     = foam.Array;
  var tDate      = foam.Date;
  var tFObject   = foam.core.FObject;
  var tFunction  = foam.Function;
  var tObject    = foam.Object;

  return function typeOf(o) {
    if ( tNumber.isInstance(o) )    return tNumber;
    if ( tString.isInstance(o) )    return tString;
    if ( tUndefined.isInstance(o) ) return tUndefined;
    if ( tNull.isInstance(o) )      return tNull;
    if ( tBoolean.isInstance(o) )   return tBoolean;
    if ( tArray.isInstance(o) )     return tArray;
    if ( tDate.isInstance(o) )      return tDate;
    if ( tFunction.isInstance(o) )  return tFunction;
    if ( tFObject.isInstance(o) )   return tFObject;
    return tObject;
  };
})();


foam.LIB({
  name: 'foam',

  methods: [
    function mmethod(map, opt_defaultMethod) {
      var uid = '__mmethod__' + foam.next$UID() + '__';

      var first = true;
      return function(arg1) {
        if ( first ) {
          for ( var key in map ) {
            var type = key === 'FObject' ?
                foam.core.FObject :
                foam[key] || foam.lookup(key);

            type[uid] = map[key];
          }
          first = false;
        }

        var type = arg1 && arg1.cls_ && arg1.cls_[uid] ?
            arg1.cls_ :
            foam.typeOf(arg1) ;

        if ( ! opt_defaultMethod ) {
          foam.assert(type, 'Unknown type: ', arg1,
              'and no default method provided');
          foam.assert(
              type[uid],
              'Missing multi-method for type ', arg1, ' map: ', map,
              'and no deafult method provided');
        }
        return ( type[uid] || opt_defaultMethod ).apply(this, arguments);
      };
    }
  ]
});


(function() {
  var typeOf = foam.typeOf;

  foam.LIB({
    name: 'foam.util',

    methods: [
      function clone(o)      { return typeOf(o).clone(o); },
      function equals(a, b)  { return typeOf(a).equals(a, b); },
      function compare(a, b) { return typeOf(a).compare(a, b); },
      function hashCode(o)   { return typeOf(o).hashCode(o); },
      function diff(a, b)    {
        var t = typeOf(a);
        return t.diff ? t.diff(a, b) : undefined;
      }
    ]
  });
})();


foam.LIB({
  name: 'foam.package',
  methods: [
    /**
     * Registers the given class in the global namespace.
     * If the given class has an id of 'some.package.MyClass'
     * then the class object will be made available globally at
     * global.some.package.MyClass.
     */
    function registerClass(cls) {
      foam.assert(typeof cls === 'object',
          'cls must be an object');
      foam.assert(typeof cls.name === 'string' && cls.name !== '',
          'cls must have a non-empty string name');

      var pkg = foam.package.ensurePackage(global, cls.package);
      pkg[cls.name] = cls;
    },

    /**
     * Register a class lazily in the global namespace.
     * The class is not created until accessed the first time.
     * The provided factory function creates the class.
     */
    function registerClassFactory(m, thunk) {
      var pkg = foam.package.ensurePackage(global, m.package);
      Object.defineProperty(pkg, m.name, {get: thunk, configurable: true});
    },

    /**
     * Walk a dot separated path starting at root, creating empty
     * objects if necessary.
     *
     * ensurePackage(global, 'some.dot.separated.path');
     * will ensure that global.some.dot.separated.path exists with
     * each part being a JS object.
     *
     * Returns root if path is null or undefined.
     */
    function ensurePackage(root, path) {
      if ( path === null ||
           path === undefined ||
           path === '' ) {
        return root;
      }

      foam.assert(typeof path === 'string',
          'Cannot make a package path of a non-string');

      path = path.split('.');
      var node = root;

      for ( var i = 0 ; i < path.length ; i++ ) {
        node = node[path[i]] || ( node[path[i]] = {} );
      }

      return node;
    }
  ]
});


foam.LIB({
  name: 'foam.uuid',
  methods: [
    function randomGUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0;
        var v = c === 'x' ? r : ( r & 0x3 | 0x8 );
        return v.toString(16);
      });
    }
  ]
});


foam.LIB({
  name: 'foam.compare',
  methods: [
    function toCompare(c) {
      return foam.Array.isInstance(c)    ? foam.compare.compound(c) :
             foam.Function.isInstance(c) ? { compare: c} :
             c ;
    },

    function compound(args) {
      /* Create a compound comparator from an array of comparators. */
      var cs = args.map(foam.compare.toCompare);

      if ( cs.lengh === 1 ) return cs[0];

      var f = {
        compare: function(o1, o2) {
          for ( var i = 0 ; i < cs.length ; i++ ) {
            var r = cs[i].compare(o1, o2);
            if ( r != 0 ) return r;
          }
          return 0;
        }
      };

      return f;
    }
  ]
});
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
 * Event listener utilities.
 */
foam.LIB({
  name: 'foam.events',

  methods: [
    function oneTime(listener) {
      /** Create a "one-time" listener which unsubscribes itself when called. **/
      return function(subscription) {
        subscription.detach();
        listener.apply(this, Array.from(arguments));
      };
    },

    function consoleLog(listener) {
      /** Log all listener invocations to console. **/
      return function() {
        var args = Array.from(arguments);
        console.log(args);
        listener && listener.apply(this, args);
      };
    }
  ]
});
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
 * Context Support
 *
 * Contexts, also known as frames, scopes or environments, are used to store
 * named resources. They provide an object-oriented replacement for global
 * variables. Contexts are immutable. New bindings are added by creating
 * "sub-contexts" with new bindings, from an existing parent context.
 * Sub-contexts inherit bindings from their parent.
 *
 * Contexts provide a form of inversion-of-control or dependendency-injection.
 * Normally, contexts are not explicitly used because FOAM's imports/exports
 * mechanism provides a high-level declarative method of dependency management
 * which hides their use.
 *
 * foam.__context__ references the root context, which is the ancestor of all other
 * contexts.
 */

(function() {
  var __context__ = {
    /**
     * Lookup a class in the context.  Throws an exception if the value
     * couldn't be found, unless opt_suppress is true.
     *
     * @param id The id of the class to lookup.
     * @param opt_suppress Suppress throwing an error.
     **/
    lookup: function(id, opt_suppress) {
      var ret = typeof id === 'string' && this.__cache__[id];

      if ( ! opt_suppress ) {
        foam.assert(
            ret,
            'Could not find any registered class for ' + id);
      }

      return foam.Function.isInstance(ret) ? ret() : ret;
    },

    /**
     * Register a class into the given context.  After registration
     * the class can be found again by calling foam.lookup('com.foo.SomeClass');
     *
     * @param cls    The class to register.
     * @param opt_id Optional id under which to register class.
     */
    register: function(cls, opt_id) {
      foam.assert(
        typeof cls === 'object',
        'Cannot register non-objects into a context.');

      if ( opt_id ) {
        this.registerInCache_(cls, this.__cache__, opt_id);
      } else {
        foam.assert(
            typeof cls.id === 'string',
            'Must have an .id property to be registered in a context.');

        this.registerInCache_(cls, this.__cache__, cls.id);

        if ( cls.package === 'foam.core' ) {
          this.registerInCache_(cls, this.__cache__, cls.name);
        }
      }
    },

    /**
     * Register a class factory into the given context.
     * When the class is first accessed the factory is used
     * to create the value which is used.
     */
    registerFactory: function(m, factory) {
      foam.assert(
        typeof m.id === 'string',
        'Must have an .id property to be registered in a context.');

      this.registerInCache_(factory, this.__cache__, m.id);

      if ( m.package === 'foam.core' ) {
        this.registerInCache_(factory, this.__cache__, m.name);
      }
    },

    /**
     * Returns true if the model ID has been registered. False otherwise.
     */
    isRegistered: function(modelId) {
      return !! this.__cache__[modelId];
    },

    /** Internal method to register a context binding in an internal cache */
    registerInCache_: function registerInCache_(cls, cache, name) {
      var hasOld = Object.prototype.hasOwnProperty.call(cache, name);
      var old = cache[name];

      // Okay to replace a function with an actual class.
      // This happens after a lazy class is initialized.
      foam.assert(
          ! hasOld ||
              (foam.Function.isInstance(old) && ! foam.Function.isInstance(cls)),
          name + ' is already registered in this context.');

      cache[name] = cls;
    },

    /** Internal method to create a slot name for a specified key. */
    toSlotName_: foam.Function.memoize1(function toSlotName_(key) {
      return key + '$';
    }),

    /**
     * Creates a sub context of the context that this is called upon.
     * @param opt_args A map of bindings to set up in the sub context.
     *     Currently unused.
     */
    createSubContext: function createSubContext(opt_args, opt_name) {
      if ( ! opt_args ) return this;

      foam.assert(
          opt_name === undefined || typeof opt_name === 'string',
          'opt_name must be left undefined or be a string.');

      var sub = Object.create(this);

      if ( opt_name ) {
        Object.defineProperty(sub, 'NAME', {
          value: opt_name,
          enumerable: false
        });
      }

      for ( var key in opt_args ) {
        if ( opt_args.hasOwnProperty(key) ) {
          var v = opt_args[key];

          if ( ! foam.core.Slot.isInstance(v) ) {
            Object.defineProperty(sub, this.toSlotName_(key), {
              value: foam.core.ConstantSlot.create({ value: v })
            });

            Object.defineProperty(sub, key, {
              value: v
            });
          } else {
            Object.defineProperty(sub, this.toSlotName_(key), {
              value: v
            });

            (function(v) {
              Object.defineProperty(sub, key, {
                get: function() { return v.get(); },
                enumerable: false
              });
            })(v);
          }
        }
      }

      Object.defineProperty(sub, '__cache__', {
        value: Object.create(this.__cache__),
        enumerable: false
      });

      foam.Object.freeze(sub);

      return sub;
    }
  };

  Object.defineProperty(__context__, '__cache__', {
    value: {},
    enumerable: false
  });

  // Create short-cuts for foam.__context__.[createSubContext, register, lookup]
  // in foam.
  foam.lookup = function(id, opt_suppress) {
    return foam.__context__.lookup(id, opt_suppress);
  };
  foam.register = function(cls, opt_id) {
    foam.__context__.register(cls, opt_id);
  };
  foam.createSubContext = function(opt_args, opt_name) {
    return foam.__context__.createSubContext(opt_args, opt_name);
  };

  foam.__context__ = __context__;
})();
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
 FOAM Bootstrap
<p>
 FOAM uses Models to specify class definitions.
 The FOAM Model class is itself specified with a FOAM model, meaning
 that Model is defined in the same language which it defines.
 This self-modeling system requires some care to bootstrap, but results
 in a very compact, uniform, and powerful system.
<pre>

 FObject -> FObject Class                     Prototype
    ^                        +-.prototype---------^
    |                        |                    |
  Model  -> buildClass()  -> Class -> create() -> instance
</pre>
  FObject is the root model/class of all other classes, including Model.
  Abstract Class is the prototype of FObject's Class, which makes it the root of all Classes.
  From a Model we call buildClass() to create a Class (or the previously created Class) object.
  From the Class we call create() to create new instances of that class.
  New instances extend the classes prototype object, which is stored on the class as .prototype.
<pre>
  instance ---> .cls_   -> Object's Class
       |
       +------> .model_ -> Object's Model
</pre>
  All descendents of FObject have references to both their Model and Class.
    - obj.cls_ refers to an Object's Class
    - obj.model_ refers to an Object's Model

<p>  Classes also refer to their Model with .model_.

<p>  Model is its own definition:
<pre>
    Model.buildClass().create(Model) == Model
    Model.model_ === Model
</pre>
  Models are defined as a collection of Axioms.
  It is the responsibility of Axioms to install itself onto a Model's Class and/or Prototype.

<p>
  Axioms are defined with the following psedo-interface:
<pre>
    public interface Axiom {
      optional installInClass(cls)
      optional installInProto(proto)
    }
</pre>
  Ex. of a Model with one Axiom:
<pre>
  foam.CLASS({
    name: 'Sample',

    axioms: [
      {
        name: 'axiom1',
        installInClass: function(cls) { ... },
        installInProto: function(proto) { ... }
      }
    ]
  });
</pre>
  Axioms can be added either during the initial creation of a class and prototype,
  or anytime after.  This allows classes to be extended with new functionality,
  and this is very important to the bootstrap process because it allows us to
  start out with very simple definitions of Model and FObject, and then build
  them up until they're fully bootstrapped.
<p>
  However, raw axioms are rarely used directly. Instead we model higher-level
  axiom types, including:
<ul>
  <li>Requires   - Require other classes
  <li>Imports    - Context imports
  <li>Exports    - Context exports
  <li>Implements - Declare interfaces implemented / mix-ins mixed-in
  <li>Constants  - Add constants to the prototype and class
  <li>Properties - High-level instance variable definitions
  <li>Methods    - Prototype methods
  <li>Topics     - Publish/sub topics
  <li>Listeners  - Like methods, but with extra features for use as callbacks
</ul>

*/


/**
 Bootstrap support.

 Is discarded after use.
*/
foam.LIB({
  name: 'foam.boot',

  constants: {
    startTime: Date.now(),
  },

  methods: [
    /**
      Create or Update a Prototype from a Model definition.

      This will be added as a method on the Model class
      when it is eventually built.

      (Model is 'this').
    */
    function buildClass() {
      var context = this.__context__ || foam.__context__;
      var cls;

      if ( this.refines ) {
        cls = context.lookup(this.refines);
        foam.assert(cls, 'Unknown refinement class: ' + this.refines);
      } else {
        foam.assert(this.id, 'Missing id name.', this.name);
        foam.assert(this.name, 'Missing class name.');

        var parent = this.extends      ?
          context.lookup(this.extends) :
          foam.core.FObject            ;

        cls                  = parent.createSubClass_();
        cls.prototype.cls_   = cls;
        cls.prototype.model_ = this;
        cls.count_           = 0;            // Number of instances created
        cls.id               = this.id;
        cls.package          = this.package;
        cls.name             = this.name;
        cls.model_           = this;

        // Install an FObject on the class that we can use as a pub/sub hub.
        // We have to do this because classes aren't FObjects.
        // This is used to publish 'installAxiom' events to, so that descendents
        // properties know when they need to be re-installed.
        if ( cls !== foam.core.FObject ) {
          cls.pubsub_ = foam.core.FObject.create();

          // Relay 'installAxiom' events from parent class.
          parent.pubsub_ && parent.pubsub_.sub(
            'installAxiom',
            function(_, a1, a2, a3) { cls.pubsub_.pub(a1, a2, a3); });
        }
      }

      cls.installModel(this);

      return cls;
    },

    function start() {
      /* Start the bootstrap process. */

      var buildClass = this.buildClass;

      // Will be replaced in phase2.
      foam.CLASS = function(m) {
        m.id = m.package + '.' + m.name;
        var cls = buildClass.call(m);

        foam.assert(
          ! m.refines,
          'Refines is not supported in early bootstrap');

        foam.register(cls);

        // Register the class in the global package path.
        foam.package.registerClass(cls);

        return cls;
      };
    },

    /** Start second phase of bootstrap process. */
    function phase2() {
      // Upgrade to final CLASS() definition.
      /* Creates a Foam class from a plain-old-object definition:
          (1) Determine the class of model for the new class's model;
          (2) Construct and validate the new class's model;
          (3) Construct and validate the new class.
          @method CLASS
          @memberof module:foam */
      foam.CLASS = function(m, skipRegistration) {
        var cls   = m.class ? foam.lookup(m.class) : foam.core.Model;
        var model = cls.create(m);
        model.validate();
        // cls was: class-for-model-construction;
        // cls is: class-constructed-from-model.
        cls = model.buildClass();
        cls.validate();

        if ( skipRegistration ) return cls;

        if ( ! m.refines ) {
          // Register class in global context.
          foam.register(cls);

          // Register the class in the global package path.
          foam.package.registerClass(cls);
        } else if ( m.name ) {
          // Register refinement id in global context.
          foam.register(cls, ( m.package || 'foam.core' ) + '.' + m.name);
        }
        // TODO(markdittmer): Identify and name anonymous refinements with:
        // else {
        //   console.warn('Refinement without unique id', cls);
        //   debugger;
        // }

        return cls;
      };

      // Upgrade existing classes to real classes.
      for ( var key in foam.core ) {
        var m = foam.lookup(key).model_;

        // classModel.buildClass() expects 'refines' if we are upgrading an
        // existing class.
        m.refines = m.id;

        foam.CLASS(m, true);
      }
    },

    function phase3() {
      // Substitute foam.core.installModel() with simpler axiom-only version.
      foam.core.FObject.installModel = function installModel(m) {
        this.installAxioms(m.axioms_);
      };
    },

    /** Finish the bootstrap process, deleting foam.boot when done. */
    function end() {
      var Model = foam.core.Model;

      // Update psedo-Models to real Models
      for ( var key in foam.core ) {
        var c = foam.core[key];
        c.prototype.model_ = c.model_ = Model.create(c.model_);
      }

      delete foam.boot;

      console.log('core boot time: ', Date.now() - this.startTime);
    }
  ]
});


foam.boot.start();
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

/*
  FObject is the root of FOAM's class hierarchy.

  We define FObject twice, first as a LIB to install all of
  the static/class methods in the top-level FObject class,
  then with a CLASS below to define methods on the FObject
  prototype.

  For details on how FObject fits in to the FOAM class system,
  see the documentation in the top of Boot.js
 */
foam.LIB({
  name: 'foam.core.FObject',

  constants: {
    // Each class has a prototype object which is the prototype of all
    // instances of the class. A classes prototype extends its parent
    // classes prototype.
    prototype: {},

    // Each class has a map of Axioms added to the class.
    // Map keys are the name of the axiom.
    // The classes axiomMap_'s extends its parent's axiomMap_.
    axiomMap_: {},

    // Each class has a map of "private" variables for use by
    // axioms. Storing internal data in private_ instead of on the
    // class directly avoids name conflicts with public features of
    // the class.
    private_:  { axiomCache: {} }
  },

  methods: [
    function create(args, opt_parent) {
      /**
       * Create a new instance of this class.
       * Configured from values taken from 'args', if supplifed.
       */

      var obj = Object.create(this.prototype);

      // Increment number of objects created of this class.
      this.count_++;

      // Properties have their values stored in instance_ instead
      // of on the object directly. This lets us defineProperty on
      // the object itself so that we can add extra behaviour
      // to properties (things like preSet, postSet, firing property-
      // change events, etc.).
      obj.instance_ = {};

      // initArgs() is the standard argument extraction method.
      obj.initArgs(args, opt_parent);

      var axioms = this.getInitAgents();
      for ( var i = 0 ; i < axioms.length ; i++ ) {
        axioms[i].initObject(obj);
      }

      // init() is called when object is created.
      // This is where class-specific initialization code should
      // be put (not in initArgs).
      obj.init();

      return obj;
    },

    function createSubClass_() {
      /**
       * Used to create a sub-class of this class.  Sets up the appropriate
       * prototype chains for the class, class.prototype and axiomMap_
       *
       * The very first "subClass" that we create will be FObject itself, when
       * we define the FObject class rather than the FObject lib that we are
       * currently defining.
       *
       * So instead of actually creating a subClass, we will just return "this"
       * and replace createSubClass() on FObject to actually create real
       * sub-classes for all subsequent uses of FObject.createSubClass()
       */
      foam.core.FObject.createSubClass_ = function() {
        var cls = Object.create(this);

        cls.prototype = Object.create(this.prototype);
        cls.axiomMap_ = Object.create(this.axiomMap_);
        cls.private_  = { axiomCache: {} };

        return cls;
      };

      return this;
    },

    function installAxioms(axs) {
      /**
       * Install Axioms into the class and prototype.
       * Invalidate the axiom-cache, used by getAxiomsByName().
       *
       * FUTURE: Wait for first object to be created before creating prototype.
       * Currently it installs axioms into the protoype immediately, but in should
       * wait until the first object is created. This will provide
       * better startup performance.
       */
      this.private_.axiomCache = {};

      // We install in two passes to avoid ordering issues from Axioms which
      // need to access other axioms, like ids: and exports:.

      var existing = new Array(axs.length);

      for ( var i = 0 ; i < axs.length ; i++ ) {
        var a = axs[i];

        // Store the destination class in the Axiom. Used by describe().
        // Store source class on a clone of 'a' so that the Axiom can be
        // reused without corrupting the sourceCls_.
        a.sourceCls_ = this;

        if ( Object.prototype.hasOwnProperty.call(this.axiomMap_, a.name) ) {
          existing[i] = this.axiomMap_[a.name];
        }

        this.axiomMap_[a.name] = a;
      }

      for ( var i = 0 ; i < axs.length ; i++ ) {
        var a = axs[i];

        var superAxiom = this.getSuperAxiomByName(a.name);

        a.installInClass && a.installInClass(this,           superAxiom, existing[i]);
        a.installInProto && a.installInProto(this.prototype, superAxiom, existing[i]);

        if ( a.name ) {
          this.pubsub_ && this.pubsub_.pub('installAxiom', a.name, a);
        }
      }
    },

    function installAxiom(a) {
      this.installAxioms([a]);
    },

    function installConstant(key, value) {
      var cName = foam.String.constantize(key);
      var prev  = this[cName];

      // Detect constant name collisions
      if ( prev && prev.name !== key ) {
        throw 'Class constant conflict: ' +
          this.id + '.' + cName + ' from: ' + key + ' and ' + prev.name;
      }

      this.prototype[cName] = this[cName] = value;
    },

    function isInstance(o) {
      /**
       * Determine if an object is an instance of this class
       * or one of its sub-classes.
       */

      return !! ( o && o.cls_ && this.isSubClass(o.cls_) );
    },

    function isSubClass(c) {
      /**
       * Determine if a class is either this class, a sub-class, or
       * if it implements this class (directly or indirectly).
       */

      if ( ! c || ! c.id ) return false;

      // Optimize most common case and avoid creating cache
      if ( this === foam.core.FObject ) return true;

      var cache = this.private_.isSubClassCache ||
        ( this.private_.isSubClassCache = {} );

      if ( cache[c.id] === undefined ) {
        cache[c.id] = ( c === this.prototype.cls_ ) ||
          ( c.getAxiomByName && !! c.getAxiomByName('implements_' + this.id) ) ||
          this.isSubClass(c.__proto__);
      }

      return cache[c.id];
    },

    function getAxiomByName(name) {
      /**
       * Find an axiom by the specified name from either this class or an
       * ancestor.
       */
      return this.axiomMap_[name];
    },

    function getAxiomsByClass(cls) {
      /**
       * Returns all axioms defined on this class or its parent classes
       * that are instances of the specified class.
       */
      // FUTURE: Add efficient support for:
      //    .where() .orderBy() .groupBy()
      var as = this.private_.axiomCache[cls.id];
      if ( ! as ) {
        as = [];
        for ( var key in this.axiomMap_ ) {
          var a = this.axiomMap_[key];
          if ( cls.isInstance(a) ) as.push(a);
        }
        this.private_.axiomCache[cls.id] = as;
      }

      return as;
    },

    function getSuperAxiomByName(name) {
      /**
       * Find an axiom by the specified name from an ancestor.
       */
      return this.axiomMap_.__proto__[name];
    },

    function hasOwnAxiom(name) {
      /**
       * Return true if an axiom named "name" is defined on this class
       * directly, regardless of what parent classes define.
       */
      return Object.hasOwnProperty.call(this.axiomMap_, name);
    },

    function getOwnAxiomsByClass(cls) {
      /**
       * Returns all axioms defined on this class that are instances of the
       * specified class.
       */
      return this.getAxiomsByClass(cls).filter(function(a) {
        return this.hasOwnAxiom(a.name);
      }.bind(this));
    },

    function hasOwnAxiom(name) {
      /**
       * Return true if an axiom named "name" is defined on this class
       * directly, regardless of what parent classes define.
       */
      return Object.hasOwnProperty.call(this.axiomMap_, name);
    },

    function getOwnAxioms() {
      /** Returns all axioms defined on this class. */
      return this.getAxioms().filter(function(a) {
        return this.hasOwnAxiom(a.name);
      }.bind(this));
    },

    function getAxioms() {
      /** Returns all axioms defined on this class or its parent classes. */

      // The full axiom list is stored in the regular cache with '' as a key.
      var as = this.private_.axiomCache[''];
      if ( ! as ) {
        as = [];
        for ( var key in this.axiomMap_ ) as.push(this.axiomMap_[key]);
        this.private_.axiomCache[''] = as;
      }
      return as;
    },

    function getInitAgents() {
      if ( ! this.private_.initAgentsCache ) {
        this.private_.initAgentsCache = [];
        for ( var key in this.axiomMap_ ) {
          var axiom = this.axiomMap_[key];
          if (axiom.initObject) this.private_.initAgentsCache.push(axiom);
        }
      }
      return this.private_.initAgentsCache;
    },

    // NOP, is replaced if debug.js is loaded
    function validate() { },

    function toString() { return this.name + 'Class'; },

    function installModel(m) {
      /**
       * Temporary Bootstrap Implementation
       *
       * This is a temporary version of installModel.
       * When the bootstrap is finished, it will be replaced by a
       * version that only knows how to install axioms in Boot.js phase3().
       *
       * It is easier to start with hard-coded method and property
       * support because Axioms need methods to install themselves
       * and Property Axioms themselves have properties.
       *
       * However, once we've bootstrapped proper Property and Method
       * Axioms, we can remove this support and just install Axioms.
       */


      /*
        Methods can be defined using two formats.
        1. Short-form function literal:
             function foo() {
               console.log('bar');
             }

        3. Long-form JSON:
             {
               name: 'foo',
               code: function() {
                 console.log('bar');
               }
             }
           The long-form will support many options (many of which are defined
           in Method.js), but only 'name' and 'code' are mandatory.
       */
      if ( m.methods ) {
        for ( var i = 0 ; i < m.methods.length ; i++ ) {
          var a = m.methods[i];
          if ( foam.Function.isInstance(a) ) {
            m.methods[i] = a = { name: a.name, code: a };
          }
          if ( foam.core.Method ) {
            foam.assert(a.cls_ !== foam.core.Method,
              'Method', a.name, 'on', m.name,
              'has already been upgraded to a Method');

            a = foam.core.Method.create(a);
            this.installAxiom(a);
          } else {
            this.prototype[a.name] = a.code;
          }
        }
      }

      /*
        Properties can be defined using three formats:
        1. Short-form String:  'firstName' or 'sex'

        2. Medium-form Array:  [ 'firstName', 'John' ] or [ 'sex', 'Male' ]
           The first element of the array is the name and the second is the
           default value.

        3. Long-form JSON:     { class: 'String', name: 'sex', value: 'Male' }
           The long-form will support many options (many of which are defined
           in Property.js), but only 'name' is mandatory.
       */
      if ( foam.core.Property && m.properties ) {
        for ( var i = 0 ; i < m.properties.length ; i++ ) {
          var a = m.properties[i];

          if ( Array.isArray(a) ) {
            m.properties[i] = a = { name: a[0], value: a[1] };
          } else if ( foam.String.isInstance(a) ) {
            m.properties[i] = a = { name: a };
          }

          var type = foam.lookup(a.class, true) || foam.core.Property;
          foam.assert(
            type !== a.cls_,
            'Property', a.name, 'on', m.name,
            'has already been upgraded to a Property.');

          a = type.create(a);

          this.installAxiom(a);
        }
      }
    }
  ]
});

/**
 * The implicit base class for the FOAM class hierarchy. If you do not
 * explicitly extend another class, FObject is used.
 */
foam.CLASS({
  package: 'foam.core',
  name: 'FObject',

  // Effectively imports the following methods, but imports: isn't available
  // yet, so we add with 'methods:'.
  //
  // imports: [ 'error', 'log', 'warn' ],

  methods: [
    function init() {
      /**
       * Template init() method, basic FObject this is a no-op, but classes
       * can override this to do their own per-instance initialization
       */
    },

    function initArgs(args) {
      /**
       * This is a temporary version of initArgs.
       * When the bootstrap is finished, it will be replaced by a version
       * that knows about a classes Properties, so it can do a better job.
       */

      if ( ! args ) return;

      for ( var key in args ) this[key] = args[key];
    },

    function hasOwnProperty(name) {
      /**
       * Returns true if this object is storing a value for a property
       * named by the 'name' parameter.
       */

      return ! foam.Undefined.isInstance(this.instance_[name]);
    },

    function hasDefaultValue(name) {
      if ( ! this.hasOwnProperty(name) ) return true;

      var axiom = this.cls_.getAxiomByName(name);
      return axiom.isDefaultValue(this[name]);
    },

    function clearProperty(name) {
      /**
       * Undefine a Property's value.
       * The value will revert to either the Property's 'value' or
       * 'expression' value, if they're defined or undefined if they aren't.
       * A propertyChange event will be fired, even if the value doesn't change.
       */

      var prop = this.cls_.getAxiomByName(name);
      foam.assert(prop && foam.core.Property.isInstance(prop),
                    'Attempted to clear non-property', name);

      if ( this.hasOwnProperty(name) ) {
        var oldValue = this[name];
        this.instance_[name] = undefined;

        // Avoid creating slot and publishing event if nobody is listening.
        if ( this.hasListeners('propertyChange', name) ) {
          this.pub('propertyChange', name, this.slot(name));
        }
      }
    },

    function setPrivate_(name, value) {
      /**
       * Private support is used to store per-object values that are not
       * instance variables.  Things like listeners and topics.
       */
      ( this.private_ || ( this.private_ = {} ) )[name] = value;
      return value;
    },

    function getPrivate_(name) {
      return this.private_ && this.private_[name];
    },

    function hasOwnPrivate_(name) {
      return this.private_ && ! foam.Undefined.isInstance(this.private_[name]);
    },

    function clearPrivate_(name) {
      if ( this.private_ ) this.private_[name] = undefined;
    },

    function validate() {
      var as = this.cls_.getAxioms();
      for ( var i = 0 ; i < as.length ; i++ ) {
        var a = as[i];
        a.validateInstance && a.validateInstance(this);
      }
    },


    /************************************************
     * Console
     ************************************************/

    // Imports aren't implemented yet, so mimic:
    //   imports: [ 'lookup', 'assert', 'error', 'log', 'warn' ],

    function lookup() { return this.__context__.lookup.apply(this.__context__, arguments); },

    function error() { this.__context__.error.apply(null, arguments); },

    function log() { this.__context__.log.apply(null, arguments); },

    function warn() { this.__context__.warn.apply(null, arguments); },


    /************************************************
     * Publish and Subscribe
     ************************************************/

    function createListenerList_() {
      /**
       * This structure represents the head of a doubly-linked list of
       * listeners. It contains 'next', a pointer to the first listener,
       * and 'children', a map of sub-topic chains.
       *
       * Nodes in the list contain 'next' and 'prev' links, which lets
       * removing subscriptions be done quickly by connecting next to prev
       * and prev to next.
       *
       * Note that both the head structure and the nodes themselves have a
       * 'next' property. This simplifies the code because there is no
       * special case for handling when the list is empty.
       *
       * Listener List Structure
       * -----------------------
       * next     -> {
       *   prev: <-,
       *   sub: {src: <source object>, detach: <destructor function> },
       *   l: <listener>,
       *   next: -> <same structure>,
       *   children -> {
       *     subTopic1: <same structure>,
       *     ...
       *     subTopicn: <same structure>
       *   }
       * }
       *
       * TODO: Move this structure to a foam.LIB, and add a benchmark
       * to show why we are using plain javascript objects rather than
       * modeled objects for this structure.
    */
      return { next: null };
    },

    function listeners_() {
      /**
       * Return the top-level listener list, creating if necessary.
       */
      return this.getPrivate_('listeners') ||
        this.setPrivate_('listeners', this.createListenerList_());
    },

    function notify_(listeners, a) {
      /**
       * Notify all of the listeners in a listener list.
       * Pass 'a' arguments to listeners.
       * Returns the number of listeners notified.
       */
      var count = 0;
      while ( listeners ) {
        var l = listeners.l;
        var s = listeners.sub;

        // Update 'listeners' before notifying because the listener
        // may set next to null.
        listeners = listeners.next;

        // Like l.apply(l, [s].concat(Array.from(a))), but faster.
        // FUTURE: add benchmark to justify
        // ???: optional exception trapping, benchmark
        try {
          switch ( a.length ) {
            case 0: l(s); break;
            case 1: l(s, a[0]); break;
            case 2: l(s, a[0], a[1]); break;
            case 3: l(s, a[0], a[1], a[2]); break;
            case 4: l(s, a[0], a[1], a[2], a[3]); break;
            case 5: l(s, a[0], a[1], a[2], a[3], a[4]); break;
            case 6: l(s, a[0], a[1], a[2], a[3], a[4], a[5]); break;
            case 7: l(s, a[0], a[1], a[2], a[3], a[4], a[5], a[6]); break;
            case 8: l(s, a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7]); break;
            case 9: l(s, a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8]); break;
            default: l.apply(l, [s].concat(Array.from(a)));
          }
        } catch (x) {}
        count++;
      }
      return count;
    },

    function hasListeners(/* args */) {
      /**
       * Return true iff there are listeners for the supplied message.
       */

      var listeners = this.getPrivate_('listeners');

      for ( var i = 0 ; listeners ; i++ ) {
        if ( listeners.next        ) return true;
        if ( i == arguments.length ) return false;
        listeners = listeners.children && listeners.children[arguments[i]];
      }

      return false;
    },

    function pub(a1, a2, a3, a4, a5, a6, a7, a8) {
      /**
       * Publish a message to all matching sub()'ed listeners.
       *
       * All sub()'ed listeners whose specified pattern match the
       * pub()'ed arguments will be notified.
       * Ex.
       * <pre>
       *   var obj  = foam.core.FObject.create();
       *   var sub1 = obj.sub(               function(a,b,c) { console.log(a,b,c); });
       *   var sub2 = obj.sub('alarm',       function(a,b,c) { console.log(a,b,c); });
       *   var sub3 = obj.sub('alarm', 'on', function(a,b,c) { console.log(a,b,c); });
       *
       *   obj.pub('alarm', 'on');  // notifies sub1, sub2 and sub3
       *   obj.pub('alarm', 'off'); // notifies sub1 and sub2
       *   obj.pub();               // only notifies sub1
       *   obj.pub('foobar');       // only notifies sub1
       * </pre>
       *
       * Note how FObjects can be used as generic pub/subs.
       *
       * Returns the number of listeners notified.
       */

      // This method prevents this function not being JIT-ed because
      // of the use of 'arguments'. Doesn't generate any garbage ([]'s
      // don't appear to be garbage in V8).
      // FUTURE: benchmark
      switch ( arguments.length ) {
        case 0:  return this.pub_([]);
        case 1:  return this.pub_([ a1 ]);
        case 2:  return this.pub_([ a1, a2 ]);
        case 3:  return this.pub_([ a1, a2, a3 ]);
        case 4:  return this.pub_([ a1, a2, a3, a4 ]);
        case 5:  return this.pub_([ a1, a2, a3, a4, a5 ]);
        case 6:  return this.pub_([ a1, a2, a3, a4, a5, a6 ]);
        case 7:  return this.pub_([ a1, a2, a3, a4, a5, a6, a7 ]);
        case 8:  return this.pub_([ a1, a2, a3, a4, a5, a6, a7, a8 ]);
        default: return this.pub_(arguments);
      }
    },

    function pub_(args) {
      /** Internal publish method, called by pub(). */

      // No listeners, so return.
      if ( ! this.hasOwnPrivate_('listeners') ) return 0;

      var listeners = this.listeners_();

      // Notify all global listeners.
      var count = this.notify_(listeners.next, args);

      // Walk the arguments, notifying more specific listeners.
      for ( var i = 0 ; i < args.length; i++ ) {
        listeners = listeners.children && listeners.children[args[i]];
        if ( ! listeners ) break;
        count += this.notify_(listeners.next, args);
      }

      return count;
    },

    function sub() { /* args..., l */
      /**
       * Subscribe to pub()'ed events.
       * args - zero or more values which specify the pattern of pub()'ed
       * events to match.
       * <p>For example:
       * <pre>
       *   sub('propertyChange', l) will match:
       *   pub('propertyChange', 'age', 18, 19), but not:
       *   pub('stateChange', 'active');
       * </pre>
       * <p>sub(l) will match all events.
       *   l - the listener to call with notifications.
       * <p> The first argument supplied to the listener is the "subscription",
       *   which contains the "src" of the event and a detach() method for
       *   cancelling the subscription.
       * <p>Returns a "subscrition" which can be cancelled by calling
       *   its .detach() method.
       */

      var l = arguments[arguments.length - 1];

      foam.assert(foam.Function.isInstance(l),
          'Listener must be a function');

      var listeners = this.listeners_();

      for ( var i = 0 ; i < arguments.length - 1 ; i++ ) {
        var children = listeners.children || ( listeners.children = {} );
        listeners = children[arguments[i]] ||
            ( children[arguments[i]] = this.createListenerList_() );
      }

      var node = {
        sub:  { src: this },
        next: listeners.next,
        prev: listeners,
        l:    l
      };
      node.sub.detach = function() {
        if ( node.next ) node.next.prev = node.prev;
        if ( node.prev ) node.prev.next = node.next;

        // Disconnect so that calling detach more than once is harmless
        node.next = node.prev = null;
      };

      if ( listeners.next ) listeners.next.prev = node;
      listeners.next = node;

      return node.sub;
    },

    function pubPropertyChange_(prop, oldValue, newValue) {
      /**
       * Publish to this.propertyChange topic if oldValue and newValue are
       * different.
       */
      if ( Object.is(oldValue, newValue) ) return;
      if ( ! this.hasListeners('propertyChange', prop.name) ) return;

      var slot = prop.toSlot(this);
      slot.setPrev(oldValue);
      this.pub('propertyChange', prop.name, slot);
    },

    function slot(obj) {
      /**
       * Creates a Slot for an Axiom.
       */
      if ( typeof obj === 'function' ) {
        return foam.core.ExpressionSlot.create(
            arguments.length === 1 ?
                { code: obj, obj: this } :
                {
                  code: obj,
                  obj: this,
                  args: Array.prototype.slice.call(arguments, 1)
                });
      }

      var axiom = this.cls_.getAxiomByName(obj);

      foam.assert(axiom, 'slot() called with unknown axiom name:', obj);
      foam.assert(axiom.toSlot, 'Called slot() on unslottable axiom:', obj);

      return axiom.toSlot(this);
    },


    /************************************************
     * Destruction
     ************************************************/

    function onDetach(d) {
      /**
       * Register a function or a detachable to be called when this object is
       * detached.
       *
       * A detachable is any object with a detach() method.
       *
       * Does nothing is the argument is falsy.
       *
       * Returns the input object, which can be useful for chaining.
       */
      foam.assert(! d || foam.Function.isInstance(d.detach) ||
          foam.Function.isInstance(d),
          'Argument to onDetach() must be callable or detachable.');
      if ( d ) this.sub('detach', d.detach ? d.detach.bind(d) : d);
      return d;
    },

    function detach() {
      /**
       * Detach this object. Free any referenced objects and destory
       * any registered detroyables.
       */
      if ( this.instance_.detaching_ ) return;

      // Record that we're currently detaching this object,
      // to prevent infinite recursion.
      this.instance_.detaching_ = true;
      this.pub('detach');
      this.instance_.detaching_ = false;
      this.clearPrivate_('listeners');
    },


    /************************************************
     * Utility Methods: clone, equals, hashCode, etc.
     ************************************************/

    function equals(other) { return this.compareTo(other) === 0; },

    function compareTo(other) {
      if ( other === this ) return 0;
      if ( ! other        ) return 1;

      if ( this.model_ !== other.model_ ) {
        return other.model_ ?
          foam.util.compare(this.model_.id, other.model_.id) :
          1;
      }

      // FUTURE: check 'id' first
      // FUTURE: order properties
      var ps = this.cls_.getAxiomsByClass(foam.core.Property);
      for ( var i = 0 ; i < ps.length ; i++ ) {
        var r = ps[i].compare(this, other);
        if ( r ) return r;
      }

      return 0;
    },

    /**
     * Compare this object to another object of the same type, and produce a raw
     * javascript object which shows the differences between the two.
     * Example
     * <pre>
     * var obj1 = Abc.create({ a: 1, b: ['A', 'B', 'C'] });
     * var obj2 = Abc.create({ a: 2, b: ['A', 'D'] });
     * var diff = obj1.diff(obj2);
     * </pre>
     * The diff object will look like
     * <pre>
     * { a: 2, b: { added: ['D'], removed: ['B', 'C'] } };
     * </pre>
     */
    function diff(other) {
      var d = {};

      foam.assert(other, 'Attempt to diff against null.');
      foam.assert(other.cls_ === this.cls_, 'Attempt to diff objects with different classes.', this, other);

      var ps = this.cls_.getAxiomsByClass(foam.core.Property);
      for ( var i = 0, property ; property = ps[i] ; i++ ) {
        // FUTURE: move this to a refinement in case not needed?
        // FUTURE: add nested Object support
        // FUTURE: add patch() method?

        // Property adds its difference(s) to "d".
        property.diffProperty(this, other, d, property);
      }

      return d;
    },

    /**
      Create an integer hash code value based on all properties of this object.
    */
    function hashCode() {
      var hash = 17;

      var ps = this.cls_.getAxiomsByClass(foam.core.Property);
      for ( var i = 0 ; i < ps.length ; i++ ) {
        var prop = this[ps[i].name];
        hash = ((hash << 5) - hash) + foam.util.hashCode(prop);
        hash &= hash; // forces 'hash' back to a 32-bit int
      }

      return hash;
    },

    function clone(opt_X) {
      /** Create a deep copy of this object. **/
      var m = {};
      for ( var key in this.instance_ ) {
        if ( this.instance_[key] === undefined ) continue; // Skip previously cleared keys.

        var value = this[key];
        this.cls_.getAxiomByName(key).cloneProperty(value, m);
      }
      return this.cls_.create(m, opt_X || this.__context__);
    },

    /**
      Copy property values from the supplied object or map.

      Ex.
<pre>
  person.copyFrom({fName: 'John', lName: 'Smith', age: 42})
  or
  person.copyFrom(otherPerson);
</pre>
     The first example is short-form for:
<pre>
  person.fName = 'John';
  person.lName = 'Smith';
  person.age   = 42;
</pre>
     If an FObject is supplied, it doesn't need to be the same class as 'this'.
     Only properties that the two classes have in common will be copied.
     Null or undefined values are ignored.
     */
    function copyFrom(o, opt_warn) {
      if ( ! o ) return this;

      // When copying from a plain map, just enumerate the keys
      if ( o.__proto__ === Object.prototype || ! o.__proto__ ) {
        for ( var key in o ) {
          var name = key.endsWith('$') ?
              key.substring(0, key.length - 1) :
              key ;

          var a = this.cls_.getAxiomByName(name);
          if ( a && foam.core.Property.isInstance(a) ) {
            this[key] = o[key];
          } else if ( opt_warn ) {
            this.unknownArg(key, o[key]);
          }
        }
        return this;
      }

      // When copying from an object of the same class
      // We don't copy default values or the values of expressions
      // so that the unset state of those properties is preserved
      var props = this.cls_.getAxiomsByClass(foam.core.Property);

      if ( o.cls_ && ( o.cls_ === this.cls_ || o.cls_.isSubClass(this.cls_) ) ) {
        for ( var i = 0 ; i < props.length ; i++ ) {
          var name = props[i].name;

          // Only copy values that are set or have a factory.
          // Any default values or expressions will be the same
          // for each object since they are of the exact same
          // type.
          if ( o.hasOwnProperty(name) || props[i].factory ) {
            this[name] = o[name];
          }
        }
        return this;
      }

      // If the source is an FObject, copy any properties
      // that we have in common.
      if ( foam.core.FObject.isInstance(o) ) {
        for ( var i = 0 ; i < props.length ; i++ ) {
          var name = props[i].name;
          var otherProp = o.cls_.getAxiomByName(name);
          if ( otherProp && foam.core.Property.isInstance(otherProp) ) {
            this[name] = o[name];
          }
        }
        return this;
      }

      // If the source is some unknown object, we do our best
      // to copy any values that are not undefined.
      for ( var i = 0 ; i < props.length ; i++ ) {
        var name = props[i].name;
        if ( typeof o[name] !== 'undefined' ) {
          this[name] = o[name];
        }
      }
      return this;
    },

    function toString() {
      // Distinguish between prototypes and instances.
      return this.cls_.id + (
          this.cls_.prototype === this ? 'Proto' : '');
    },

    function dot(name) {
      // Behaves just like Slot.dot().  Makes it easy for creating sub-slots
      // without worrying if you're holding an FObject or a slot.
      return this[name + '$'];
    }
  ]
});
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

/** Class/Prototype description. */
foam.CLASS({
  package: 'foam.core',
  name: 'Model',

  documentation: 'A Class Model (description).',

  properties: [
    {
      name: 'id',
      hidden: true,
      transient: true,
      getter: function() {
        return this.package ? this.package + '.' + this.name : this.name;
      }
    },
    'package',
    'abstract',
    'name',
    {
      name: 'flags',
      factory: function() { return {}; }
    },
    {
      name: 'label',
      expression: function(name) { return foam.String.labelize(name); }
    },
    [ 'extends', 'FObject' ],
    'refines',
    { name: 'documentation', adapt: function(_, d) { return typeof d === 'function' ? foam.String.multiline(d).trim() : d; } },
    {
      // List of all axioms, including methods, properties, listeners,
      // etc. and 'axioms'.
      name: 'axioms_',
      transient: true,
      hidden: true,
      factory: function() { return []; }
    },
    {
      // List of extra axioms. Is added to axioms_.
      name: 'axioms',
      hidden: true,
      factory: function() { return []; },
      postSet: function(_, a) { this.axioms_.push.apply(this.axioms_, a); }
    },
    {
      // Is upgraded to an AxiomArray later.
      of: 'Property',
      name: 'properties'
    },
    {
      // Is upgraded to an AxiomArray later.
      of: 'Method',
      name: 'methods'
    }
  ],

  methods: [ foam.boot.buildClass ]
});
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
  A Property is a high-level instance variable.

  Properties contain more information than typical variable declarations.
  Such as: label, help text, pre/post-set callbacks, default value,
  value factory, units, etc.

  When setting a Propery's value, the callback order is:
    1. adapt()
    2. assertValue()
    3. preSet()
       value updated
       property change event fired
    4. postSet()

   Unless the user has provided a customer 'setter', in which case the order is
     1. setter()

  A sub-class or refinement can include a partial Property definition which
  will override or add meta-information to the Property.
**/
foam.CLASS({
  package: 'foam.core',
  name: 'Property',
  extends: 'FObject',

  properties: [
    {
      name: 'name',
      required: true
    },
    {
      name: 'label',
      // If not provided, it defaults to the name "labelized".
      expression: function(name) { return foam.String.labelize(name); }
    },

    /* Developer-level documentation. */
    'documentation',

    /* User-level help. Could/should appear in GUI's as online help. */
    'help',

    /* Hidden properties to not appear in GUI's by default. */
    { class: 'Boolean', name: 'hidden' },

    /**
      The default-value of this property.
      A property which has never been set or has been cleared
      by setting it to 'undefined' or cleared with clearProperty()
      will have the default value.
    */
    'value',

    /**
      A factory is a function which initializes the property value
      when accessed for the first time, if not already set.
    */
    'factory',

    /**
      A function of the form:
        Object function(oldValue, newValue)
      adapt is called whenver the property is set. It's intended
      to adapt the value to the appropriate type if required.
      Adapt must return a value. It can return newValue unchanged
      if it was already the appropriate type.
    */
    'adapt',

    /**
      A function of the form:
        Object function(oldValue, newValue)
      preSet is called before the propery's value is updated.
      It can veto the value change by returning a different newValue
      (including returning oldValue to leave the property unchanged).
    */
    'preSet',

    /**
      A function of the form:
        void function(oldValue, newValue) throws Exception
      assertValue can validate newValue and throw an exception if it's an
      invalid value.
    */
    'assertValue',

    /**
      A function of the form:
        void function(oldValue, newValue)
      postSet is called after the Property's value has been updated.
    */
    'postSet',

    /**
      A dynamic function which defines this Property's value.
      Similar to 'factory', except that the function takes arguments
      which are named the same as other properties of this object.
      Whenever the values of any of the argument properties change,
      the value of this Property is invalidated. Like a regular factory,
      an invalidated property will be recalculated by calling the provided
      expression function when accessed. This makes expressions very efficient
      because the value is only recomputed when actually needed.
    */
    'expression',

    /**
      A getter function which completely replaces the normal
      Property getter process. Whenever the property is accessed, getter is
      called and its value is returned.
    */
    'getter',

    /**
      A setter function which completely replaces the normal
      Property setter process. Whenever the property is set, setter is
      called.
      A function of the form:
        void function(newValue)
    */
    'setter',

    [ 'cloneProperty', function(
      /* any // The value to clone */         value,
      /* object // Add values to this map to
         have them installed on the clone. */ cloneMap
      ) {
        /** Override to provide special deep cloning behavior. */
        cloneMap[this.name] = ( value && value.clone ) ? value.clone() :
          foam.util.clone(value);
      }
    ],

    /**
      A final Property can only be set once.
      After being set, its value is final (read-only).
    */
    'final',

    /**
      A required Property can not be set to null, undefined, 0 or "".
     */
    'required',

    [
      /**
        Called to convert a string into a value suitable for this property.
        Eg. this might convert strings to numbers, or parse RFC 2822 timestamps.
        By default it simply returns the string unchanged.
       */
      'fromString',
      function(str) { return str; }
    ],

    [
      /**
        Compare two values taken from this property.
        <p>Used by Property.compare().
        It is a property rather than a method so that it can be configured
        without subclassing.
      */
      'comparePropertyValues',
      function(o1, o2) { return foam.util.compare(o1, o2); }
    ],

    [
      'isDefaultValue',
      function(v) { return ! this.comparePropertyValues(this.value, v); }
    ],

    {
      /** Makes Properties useful as map functions. */
      name: 'f',
      transient: true,
      factory: function() {
        var name = this.name;
        return function f(o) { return o[name]; }
      }
    },

    {
      /** Makes Properties useful as comparators. */
      name: 'compare',
      transient: true,
      factory: function() {
        var comparePropertyValues = this.comparePropertyValues;
        var f = this.f;
        return function compare(o1, o2) {
          return comparePropertyValues(f(o1), f(o2));
        };
      }
    },
    // FUTURE: Move to refinement?
    {
      name: 'diffPropertyValues',
      transient: true,
      value: function(v1, v2, diff) {
        // TODO: instead of array check, have different implementation in ArrayProperty
        if ( Array.isArray(v1) ) {
          var subdiff = foam.Array.diff(v1, v2);
          if ( subdiff.added.length !== 0 || subdiff.removed.length !== 0 ) {
            diff[this.name] = subdiff;
          }
        } else if ( ! foam.util.equals(v1, v2) ) {
          // if the primary value is undefined, use the compareTo of the other
          diff[this.name] = v2;
        }
        return diff;
      }
    },
    {
      name: 'diffProperty',
      transient: true,
      value: function diffProperty(o1, o2, diff, prop) {
        return prop.diffPropertyValues(prop.f(o1), prop.f(o2), diff);
      }
    },
    {
      name: 'forClass_',
      transient: true
    }
  ],

  methods: [
    /**
      Handle overriding of Property definition from parent class by
      copying undefined values from parent Property, if it exists.
    */
    function installInClass(c, superProp, existingProp) {
      var prop = this;

      if ( superProp && foam.core.Property.isInstance(superProp) ) {
        prop = superProp.createChildProperty_(prop);

        // If properties would be shadowed by superProp properties, then
        // clear the shadowing property since the new value should
        // take precedence since it was set later.
        var es = foam.core.Property.SHADOW_MAP || {};
        for ( var key in es ) {
          var e = es[key];
          for ( var j = 0 ; j < e.length ; j++ ) {
            if ( this.hasOwnProperty(e[j]) && superProp[key] ) {
              prop.clearProperty(key);
              break;
            }
          }
        }

        c.axiomMap_[prop.name] = prop;
      }

      if ( this.forClass_ && this.forClass_ !== c.id && prop === this ) {
        // Clone this property if it's been installed before.
        prop = this.clone();
        c.axiomMap_[prop.name] = prop;
      }

      prop.forClass_ = c.id + '.' + this.name;

      // var reinstall = foam.events.oneTime(function reinstall(_,_,_,axiom) {
      //   // We only care about Property axioms.

      //   // FUTURE: we really only care about those properties that affect
      //   // the definition of the property getter and setter, so an extra
      //   // check would help eliminate extra reinstalls.

      //   // Handle special case of axiom being installed into itself.
      //   // For example foam.core.String has foam.core.String axioms for things
      //   // like "label"
      //   // In the future this shouldn't be required if a reinstall is
      //   // only triggered on this which affect getter/setter.
      //   if ( prop.cls_ === c ) {
      //     return;
      //   }

      //   if ( foam.core.Property.isInstance(axiom) ) {
      //     // console.log('**************** Updating Property: ', c.name, prop.name);
      //     c.installAxiom(prop);
      //   }
      // });

      // // If the superProp is updated, then reinstall this property
      // c.__proto__.pubsub_ && c.__proto__.pubsub_.sub(
      //   'installAxiom',
      //   this.name,
      //   reinstall
      // );

      // // If the class of this Property changes, then also reinstall
      // if (
      //   c.id !== 'foam.core.Property' &&
      //   c.id !== 'foam.core.Model'    &&
      //   c.id !== 'foam.core.Method'   &&
      //   c.id !== 'foam.core.FObject'  &&
      //   this.cls_.id !== 'foam.core.FObject'
      // ) {
      //   this.cls_.pubsub_.sub('installAxiom', reinstall);
      // }

      c.installConstant(prop.name, prop);
    },

    /**
      Install a property onto a prototype from a Property definition.
      (Property is 'this').
    */
    function installInProto(proto) {
      // Take Axiom from class rather than using 'this' directly,
      // since installInClass() may have created a modified version
      // to inherit Property Properties from a super-Property.
      var prop        = proto.cls_.getAxiomByName(this.name);
      var name        = prop.name;
      var adapt       = prop.adapt
      var assertValue = prop.assertValue;
      var preSet      = prop.preSet;
      var postSet     = prop.postSet;
      var factory     = prop.factory;
      var getter      = prop.getter;
      var value       = prop.value;
      var hasValue    = typeof value !== 'undefined';
      var slotName    = name + '$';
      var isFinal     = prop.final;
      var eFactory    = this.exprFactory(prop.expression);
      var FIP         = factory && ( prop.name + '_fip' ); // Factory In Progress
      var fip         = 0;

      // Factory In Progress (FIP) Support
      // When a factory method is in progress, the object sets a private
      // flag named by the value in FIP.
      // This allows for the detection and elimination of
      // infinite recursions (if a factory accesses another property
      // which in turn tries to access its propery) and allows for
      // the property change event to not be fired when the value
      // is first set by the factory (since the value didn't change,
      // the factory is providing its original value).
      // However, this is expensive, so we keep a global 'fip' variable
      // which indicates that the factory is already being called on any
      // object and then we only track on a per-instance basis when this
      // is on. This eliminates almost all per-instance FIP checks.

      // Property Slot
      // This costs us about 4% of our boot time.
      // If not in debug mode we should share implementations like in F1.
      //
      // Define a PropertySlot accessor (see Slot.js) for this Property.
      // If the property is named 'name' then 'name$' will access a Slot
      // for this Property. The Slot is created when first accessed and then
      // cached.
      // If the Slot is set (to another slot) the two Slots are link()'ed
      // together, meaning they will now dynamically share the same value.
      Object.defineProperty(proto, slotName, {
        get: function propertySlotGetter() {
          return prop.toSlot(this);
        },
        set: function propertySlotSetter(slot2) {
          prop.toSlot(this).linkFrom(slot2);
        },
        configurable: true,
        enumerable: false
      });

      // Define Property getter and setter based on Property properties.
      // By default, getter and setter stores instance value for property
      // in this.instance_[<name of property>],
      // unless the user provides custom getter and setter methods.

      // Getter
      // Call 'getter' if provided, else return value from instance_ if set.
      // If not set, return value from 'factory', 'expression', or
      // (default) 'value', if provided.
      var get =
        getter ? function() { return getter.call(this, prop); } :
        factory ? function factoryGetter() {
          var v = this.instance_[name];
          if ( v !== undefined ) return v;
          // Indicate the Factory In Progress state
          if ( fip > 10 && this.getPrivate_(FIP) ) {
            console.warn('reentrant factory for property:', name);
            return undefined;
          }

          var oldFip = fip;
          fip++;
          if ( oldFip === 10 ) this.setPrivate_(FIP, true);
          v = factory.call(this, prop);
          // Convert undefined to null because undefined means that the
          // value hasn't been set but it has. Setting it to undefined
          // would prevent propertyChange events if the value were cleared.
          this[name] = v === undefined ? null : v;
          if ( oldFip === 10 ) this.clearPrivate_(FIP);
          fip--;

          return this.instance_[name];
        } :
        eFactory ? function eFactoryGetter() {
          return this.hasOwnProperty(name) ? this.instance_[name]   :
                 this.hasOwnPrivate_(name) ? this.getPrivate_(name) :
                 this.setPrivate_(name, eFactory.call(this)) ;
        } :
        hasValue ? function valueGetter() {
          var v = this.instance_[name];
          return v !== undefined ? v : value ;
        } :
        function simpleGetter() { return this.instance_[name]; };

      var set = prop.setter ? prop.setter :
        ! ( postSet || factory || eFactory || adapt || assertValue || preSet || isFinal ) ?
        function simplePropSetter(newValue) {
          if ( newValue === undefined ) {
            this.clearProperty(name);
            return;
          }

          var oldValue = this.instance_[name] ;
          this.instance_[name] = newValue;
          this.pubPropertyChange_(prop, oldValue, newValue);
        }
        : factory && ! ( postSet || eFactory || adapt || assertValue || preSet || isFinal ) ?
        function factoryPropSetter(newValue) {
          if ( newValue === undefined ) {
            this.clearProperty(name);
            return;
          }

          var oldValue = this.hasOwnProperty(name) ? this[name] : undefined;

          this.instance_[name] = newValue;

          // If this is the result of a factory setting the initial value,
          // then don't fire a property change event, since it hasn't
          // really changed.
          if ( oldValue !== undefined )
            this.pubPropertyChange_(prop, oldValue, newValue);
        }
        :
        function propSetter(newValue) {
          // ???: Should clearProperty() call set(undefined)?
          if ( newValue === undefined ) {
            this.clearProperty(name);
            return;
          }

          // Getting the old value but avoid triggering factory or expression if
          // present. Factories and expressions (which are also factories) can be
          // expensive to generate, and if the value has been explicitly set to
          // some value, then it isn't worth the expense of computing the old
          // stale value.
          var oldValue =
            factory  ? ( this.hasOwnProperty(name) ? this[name] : undefined ) :
            eFactory ?
                ( this.hasOwnPrivate_(name) || this.hasOwnProperty(name) ?
                  this[name] :
                  undefined ) :
            this[name] ;

          if ( adapt ) newValue = adapt.call(this, oldValue, newValue, prop);

          if ( assertValue ) assertValue.call(this, newValue, prop);

          if ( preSet ) newValue = preSet.call(this, oldValue, newValue, prop);

          // ???: Should newValue === undefined check go here instead?

          this.instance_[name] = newValue;

          if ( isFinal ) {
            Object.defineProperty(this, name, {
              value: newValue,
              writable: false,
              configurable: true // ???: is this needed?
            });
          }

          // If this is the result of a factory setting the initial value,
          // then don't fire a property change event, since it hasn't
          // really changed.
          if ( ! factory || oldValue !== undefined )
            this.pubPropertyChange_(prop, oldValue, newValue);

          // FUTURE: pub to a global topic to support dynamic()

          if ( postSet ) postSet.call(this, oldValue, newValue, prop);
        };

      Object.defineProperty(proto, name, {
        get: get,
        set: set,
        configurable: true
      });
    },

    /** Validate an object which has this Property. */
    function validateInstance(o) {
      if ( this.required && ! o[this.name] ) {
        throw 'Required property ' +
            o.cls_.id + '.' + this.name +
            ' not defined.';
      }
    },

    /**
     * Create a factory function from an expression function.
     * Function arguments are validated in debug.js.
     **/
    function exprFactory(e) {
      if ( ! e ) return null;

      var argNames = foam.Function.argNames(e);
      var name     = this.name;

      // FUTURE: determine how often the value is being invalidated,
      // and if it's happening often, then don't unsubscribe.
      return function exportedFactory() {
        var self = this;
        var args = new Array(argNames.length);
        var subs = [];
        var l    = function() {
          if ( ! self.hasOwnProperty(name) ) {
            var oldValue = self[name];
            self.clearPrivate_(name);

            // Avoid creating slot and publishing event if no listeners
            if ( self.hasListeners('propertyChange', name) ) {
              self.pub('propertyChange', name, self.slot(name));
            }
          }
          for ( var i = 0 ; i < subs.length ; i++ ) subs[i].detach();
        };
        for ( var i = 0 ; i < argNames.length ; i++ ) {
          var s = this.slot(argNames[i]).sub(l);
          s && subs.push(s);
          args[i] = this[argNames[i]];
        }
        var ret = e.apply(this, args);
        if ( ret === undefined ) this.warn('Expression returned undefined');
        return ret;
      };
    },

    /** Returns a developer-readable description of this Property. **/
    function toString() { return this.name; },

    /** Flyweight getter for this Property. **/
    function get(o) { return o[this.name]; },

    /** Flyweight setter for this Property. **/
    function set(o, value) {
      o[this.name] = value;
      return this;
    },

    /**
     * Handles property inheritance.  Builds a new version of
     * this property to be installed on classes that inherit from
     * this but define their own property with the same name as this.
     */
    function createChildProperty_(child) {
      var prop = this.clone();

      if ( child.cls_ !== foam.core.Property &&
           child.cls_ !== this.cls_ )
      {
        if ( this.cls_ !== foam.core.Property ) {
          this.warn('Unsupported change of property type from', this.cls_.id, 'to', child.cls_.id);
        }

        return child;
      }

      prop.sourceCls_ = child.sourceCls_;

      for ( var key in child.instance_ ) {
        prop.instance_[key] = child.instance_[key];
      }

      return prop;
    },

    function exportAs(obj, sourcePath) {
      /** Export obj.name$ instead of just obj.name. */

      var slot = this.toSlot(obj);

      for ( var i = 0 ; sourcePath && i < sourcePath.length ; i++ ) {
        slot = slot.dot(sourcePath[i]);
      }

      return slot;
    },

    function toSlot(obj) {
      /** Create a Slot for this Property. */
      var slotName = this.slotName_ || ( this.slotName_ = this.name + '$' );
      var slot     = obj.getPrivate_(slotName);

      if ( ! slot ) {
        slot = foam.core.internal.PropertySlot.create();
        slot.obj  = obj;
        slot.prop = this;
        obj.setPrivate_(slotName, slot);
      }

      return slot;
    }
  ]
});


/**
  A Simple Property skips the regular FOAM Property getter/setter/instance_
  mechanism. In gets installed on the CLASS as a Property constant, but isn't
  added to the prototype at all. From this point of view, it's mostly just for
  documentation. Simple Properties are used only in special cases to maximize
  performance and/or minimize memory use.
  Used for MDAO indices and Slots.

  USE WITH EXTREME CAUTION (OR NOT AT ALL).
*/
foam.CLASS({
  package: 'foam.core',
  name: 'Simple',
  extends: 'Property',

  methods: [
    function installInProto(proto) {}
  ]
});
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
<p>
  Methods are only installed on the prototype.
  If the method is overriding a method from a parent class,
  then SUPER support is added.

<p>
  Ex.
<pre>
  foam.CLASS({
    name: 'Parent',
    methods: [
      // short-form
      function sayHello() { console.log('hello'); },

      // long-form
      {
        name: 'sayGoodbye',
        code: function() { console.log('goodbye'); }
      }
    ]
  });

  // Create a subclass of Parent and override the 'sayHello' method.
  // The parent classes 'sayHello' methold is called with 'this.SUPER()'
  foam.CLASS({
    name: 'Child',
    extends: 'Parent',
    methods: [
      function sayHello() { this.SUPER(); console.log('world'); }
    ]
  });

  Child.create().sayHello();
  >> hello
  >> world
</pre>
*/
foam.CLASS({
  package: 'foam.core',
  name: 'AbstractMethod',

  properties: [
    { name: 'name', required: true },
    { name: 'code', required: false },
    'documentation',
    'returns',
    {
      name: 'args',
      factory: function() { return this.code ? foam.Function.args(this.code) : []; }
    }
  ],

  methods: [
    /**
      Decorate a method so that it can call the
      method it overrides with this.SUPER().
    */
    function override_(proto, method, superMethod) {
      if ( ! method ) return;

      // Not using SUPER, so just return original method
      if ( method.toString().indexOf('SUPER') == -1 ) return method;

      var superMethod_ = proto.cls_.getSuperAxiomByName(this.name);
      var super_;

      if ( ! superMethod_ ) {
        var name = this.name;

        // This method itself provides a false-posistive because
        // it references SUPER(), so ignore.
        if ( name !== 'override_' ) {
          super_ = function() {
            console.warn(
                'Attempted to use SUPER() in',
                name, 'on', proto.cls_.id, 'but no parent method exists.');
          };

          // Generate warning now.
          super_();
        }
      } else {
        foam.assert(foam.core.AbstractMethod.isInstance(superMethod_),
          'Attempt to override non-method', this.name, 'on', proto.cls_.id);

        // Fetch the super method from the proto, as the super method axiom
        // may have decorated the code before installing it.
        super_ = proto.__proto__[this.name];
      }

      function SUPER() { return super_.apply(this, arguments); }

      var f = function superWrapper() {
        var oldSuper = this.SUPER;
        this.SUPER = SUPER;

        try {
          return method.apply(this, arguments);
        } finally {
          this.SUPER = oldSuper;
        }

        return ret;
      };

      foam.Function.setName(f, this.name);
      f.toString = function() { return method.toString(); };

      return f;
    },

    function createChildMethod_(child) {
      /**
        Template method for use by Method subclasses.
        (Used by JavaSource.)
      */
      return child;
    },

    function installInClass(cls, superMethod, existingMethod) {
      var method = this;

      var parent = superMethod;
      if ( parent && foam.core.AbstractMethod.isInstance(parent) ) {
        method = parent.createChildMethod_(method);
      }

      cls.axiomMap_[method.name] = method;
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'Method',
  extends: 'foam.core.AbstractMethod',

  methods: [
    function installInProto(proto, superAxiom) {
      proto[this.name] = this.override_(proto, this.code, superAxiom);
    },

    function exportAs(obj) {
      var m = obj[this.name];
      /** Bind the method to 'this' when exported so that it still works. **/
      return function exportedMethod() { return m.apply(obj, arguments); };
    }
  ]
});


foam.boot.phase2();
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

foam.CLASS({
  package: 'foam.core',
  name: 'Boolean',
  extends: 'Property',

  documentation: 'A Property for Boolean values.',

  properties: [
    [ 'value', false ],
    [ 'adapt', function adaptBoolean(_, v) { return !!v; } ]
  ]
});
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

foam.CLASS({
  package: 'foam.core',
  name: 'AxiomArray',
  extends: 'Property',

  documentation: 'An Array of Axioms (used by Model) whose elements are added to this.axioms_.',

  properties: [
    {
      name: 'of',
      required: true
    },
    {
      name: 'adapt',
      value: function(_, a, prop) {
        if ( ! Array.isArray(a) ) return a;

        var copy;
        for ( var i = 0 ; i < a.length ; i++ ) {
          var b = prop.adaptArrayElement.call(this, a[i], prop);
          if ( b !== a[i] ) {
            if ( ! copy ) copy = a.slice();
            copy[i] = b;
          }
        }

        return copy || a;
      }
    },
    {
      name: 'assertValue',
      value: function(v, prop) {
        foam.assert(Array.isArray(v),
            'Tried to set', prop.name, 'to non array value');

        // FUTURE: Use __context__.lookup ?
        var of = foam.lookup(prop.of, true);
        foam.assert(
            of,
            'Unknown "of" Model in AxiomArray: property=',
            prop.name,
            ' of=',
            prop.of);
        for ( var i = 0 ; i < v.length ; i++ ) {
          foam.assert(of.isInstance(v[i]),
              'Element', i, 'of', prop.name, 'is not an instance of',
              prop.of);
        }
      }
    },
    {
      name: 'adaptArrayElement',
      value: function(a, prop) {
        // FUTURE: Use __context__.lookup ?
        var of = foam.lookup(prop.of);
        return of.isInstance(a) ? a : of.create(a, this);
      }
    },
    [ 'postSet', function(_, a) { this.axioms_.push.apply(this.axioms_, a); } ]
  ]
});
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
 * Map of Property property names to arrays of names of properties that they shadow.
 *
 * Ex. 'setter' has higher precedence than 'adapt', 'preSet', and 'postSet', so if
 * it is set, then it shadows those other properties if they are set, causing their
 * values to be ignored.
 *
 * Not defined as a constant, because they haven't been defined yet.
 */
foam.core.Property.SHADOW_MAP = {
  setter:     [ 'adapt', 'preSet', 'postSet' ],
  getter:     [ 'factory', 'expression', 'value' ],
  factory:    [ 'expression', 'value' ],
  expression: [ 'value' ]
};


/** Add new Axiom types (Implements, Constants, Topics, Properties, Methods and Listeners) to Model. */
foam.CLASS({
  refines: 'foam.core.Model',

  properties: [
    {
      class: 'AxiomArray',
      of: 'Property',
      name: 'properties',
      adaptArrayElement: function(o) {
        if ( typeof o === 'string' ) {
          var p = foam.core.Property.create();
          p.name = o;
          return p;
        }

        if ( Array.isArray(o) ) {
          var p = foam.core.Property.create();
          p.name  = o[0];
          p.value = o[1];
          return p;
        }

        if ( o.class ) {
          var m = foam.lookup(o.class);
          if ( ! m ) throw 'Unknown class : ' + o.class;
          return m.create(o, this);
        }

        return foam.core.Property.isInstance(o) ? o : foam.core.Property.create(o);
      }
    },
    {
      class: 'AxiomArray',
      of: 'Method',
      name: 'methods',
      adaptArrayElement: function(o, prop) {
        if ( typeof o === 'function' ) {
          foam.assert(o.name, 'Method must be named');
          var m = foam.lookup(prop.of).create();
          m.name = o.name;
          m.code = o;
          return m;
        }
        if ( foam.lookup(prop.of).isInstance(o) ) return o;
        if ( o.class ) return this.lookup(o.class).create(o, this);
        return foam.lookup(prop.of).create(o);
      }
    }
  ]
});


foam.boot.phase3();


foam.CLASS({
  refines: 'foam.core.FObject',

  documentation: 'Upgrade FObject to fully bootstraped form.',

  axioms: [
    {
      name: '__context__',
      installInProto: function(p) {
        Object.defineProperty(p, '__context__', {
          get: function() {
            var x = this.getPrivate_('__context__');
            if ( ! x ) {
              var contextParent = this.getPrivate_('contextParent');
              if ( contextParent ) {
                this.setPrivate_(
                    '__context__',
                    x = contextParent.__subContext__ || contextParent.__context__);
                this.setPrivate_('contextParent', undefined);
              } else {
                // Happens during bootstrap with Properties.
                x = foam.__context__;
              }
            }
            return x;
          },
          set: function(x) {
            if ( x ) {
              this.setPrivate_(
                  foam.core.FObject.isInstance(x) ?
                      'contextParent' :
                      '__context__',
                  x);
            }
          }
        });

        // If no delcared exports, then sub-context is the same as context.
        Object.defineProperty(
            p,
            '__subContext__',
            {
              get: function() { return this.__context__; },
              set: function() {
                throw new Error(
                    'Attempted to set unsettable __subContext__ in ' +
                    this.cls_.id);
              }
            });
      }
    }
  ],

  methods: [
    /**
      Called to process constructor arguments.
      Replaces simpler version defined in original FObject definition.
    */
    function initArgs(args, ctx) {
      if ( ctx  ) this.__context__ = ctx;
      if ( args ) this.copyFrom(args, true);
    },

    /**
      Template method used to report an unknown argument passed
      to a constructor. Is set in debug.js.
    */
    function unknownArg(key, value) {
      // NOP
    }
  ]
});


foam.boot.end();


/**
  Refine foam.core.Property to add 'transient' support.

  A transient Property is not intended to be persisted
  or transfered over the network.

  Ex. A computed Property could be made transient to avoid
  wasting disk space or network bandwidth.

  For finer control, there are also separate properties called
  'networkTransient' and 'storageTransient', which default to
  the value of 'transient' if not explicitly set.

  A networkTransient field is not marshalled over network calls.
  foam.json.Network does not encode networkTransient fields.

  A storageTransient field is not stored to persistent storage.
  foam.json.Storage does not encode storageTransient fields.
 */
foam.CLASS({
  refines: 'foam.core.Property',

  properties: [
    {
      class: 'Boolean',
      name: 'transient'
    },
    {
      class: 'Boolean',
      name: 'networkTransient',
      expression: function(transient) {
        return transient;
      }
    },
    {
      class: 'Boolean',
      name: 'storageTransient',
      expression: function(transient) {
        return transient;
      }
    }
  ]
});


/**
 * Replace foam.CLASS() with a lazy version which only
 * build the class when first accessed.
 */
(function() {
  // List of unused Models in the system.
  foam.USED   = {};
  foam.UNUSED = {};

  var CLASS = foam.CLASS;

  foam.CLASS = function(m) {
    if ( m.refines ) return CLASS(m);

    m.id = m.package ? m.package + '.' + m.name : m.name;
    foam.UNUSED[m.id] = true;
    var f = foam.Function.memoize0(function() {
      delete foam.UNUSED[m.id];
      var c = CLASS(m);
      foam.USED[m.id] = c;
      return c;
    });

    foam.__context__.registerFactory(m, f);
    foam.package.registerClassFactory(m, f);
  };
})();
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

foam.CLASS({
  package: 'foam.core',
  name: 'FObjectArray',
  extends: 'Property',

  documentation: "A Property which contains an array of 'of' FObjects.",

  properties: [
    { name: 'of', required: true },
    [
      'factory',
      function() { return []; }
    ],
    [ 'adapt', function(_, /* array? */ a, prop) {
        if ( ! a ) return [];
        // If not an array, allow assertValue to assert the type-check.
        if ( ! Array.isArray(a) ) return a;

        var b = new Array(a.length);
        for ( var i = 0 ; i < a.length ; i++ ) {
          b[i] = prop.adaptArrayElement(a[i], this);
        }
        return b;
      }
    ],
    [ 'assertValue', function(v, prop) {
        foam.assert(Array.isArray(v),
            prop.name, 'Attempt to set array property to non-array value', v);
      }
    ],
    [ 'adaptArrayElement', function(o, obj) {
      // FUTURE: replace 'foam.' with '(this.__subContext__ || foam).' ?
      var ctx = obj.__subContext__ || foam;
      var of = o.class || this.of;
      var cls = ctx.lookup(of);
      return cls.isInstance(o) ? o : cls.create(o, obj);
    }],
    {
      name: 'fromJSON',
      value: function(value, ctx, prop) {
        return foam.json.parse(value, prop.of, ctx);
      }
    }
  ]
});
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
  Constants are installed on both the prototype and class.
<pre>
  Ex.
  constants: {
    KEY: 'some value'
  }

  this.cls_.KEY === this.KEY === 'some value'
</pre>
*/
foam.CLASS({
  package: 'foam.core',
  name: 'Constant',

  documentation: 'An Axiom for defining class constants.',

  properties: [ 'name', 'value' ],

  methods: [
    function installInClass(cls) {
      Object.defineProperty(
        cls,
        foam.String.constantize(this.name),
        {
          value: this.value,
          configurable: false
        });
    },
    function installInProto(proto) {
      this.installInClass(proto);
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Model',
  properties: [
    {
      class: 'AxiomArray',
      of: 'Constant',
      name: 'constants',
      adapt: function(_, a, prop) {
        if ( ! a ) return [];
        if ( ! Array.isArray(a) ) {
          var cs = [];
          for ( var key in a ) {
            cs.push(foam.core.Constant.create({name: key, value: a[key]}));
          }
          return cs;
        }
        var b = new Array(a.length);
        for ( var i = 0 ; i < a.length ; i++ ) {
          b[i] = prop.adaptArrayElement.call(this, a[i], prop);
        }
        return b;
      }
    }
  ]
});
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

foam.CLASS({
  refines: 'foam.core.Property',

  properties: [
    'validateObj'
  ]
});


foam.CLASS({
  package: 'foam.core.internal',
  name: 'Errors',
//  extends: 'foam.core.Property',

  documentation: `
    A psedo-Property Axiom added to FObject which contains an object\'s validation errors.
    Adds the following attributes to an Object:
    <dl>
      <dt>errors_</dt><dd>list of current errors</dd>
      <dt>errors_$</dt><dd>Slot representation of errors_</dd>
      <dt>validateObject()</dt><dd>calls the validateObj() method of all property Axioms, allowing them to populate errors_</dd>
    </dl>
  `,

  properties: [
    [ 'name', 'errors_' ]
  ],

  methods: [
    function installInProto(proto) {
      var self = this;
      Object.defineProperty(proto, 'errors_', {
        get: function() {
          return self.toSlot(this).get();
        },
        configurable: true,
        enumerable: false
      });

      Object.defineProperty(proto, 'errors_$', {
        get: function() {
          return self.toSlot(this);
        },
        configurable: true,
        enumerable: false
      });
    },

    function toSlot(obj) {
      var slotName = this.slotName_ || ( this.slotName_ = this.name + '$' );
      var slot     = obj.getPrivate_(slotName);

      if ( ! slot ) {
        slot = this.createErrorSlot_(obj)
        obj.setPrivate_(slotName, slot);
      }

      return slot;
    },

    function createErrorSlot_(obj) {
      var args = [];
      var ps   = obj.cls_.getAxiomsByClass(foam.core.Property).
        filter(function(a) { return a.validateObj; });

      for ( var i = 0 ; i < ps.length ; i++ ) {
        var p = ps[i];
        args.push(obj.slot(p.validateObj));
      }

      function validateObject() {
        var ret;

        for ( var i = 0 ; i < ps.length ; i++ ) {
          var p = ps[i];
          var err = args[i].get();
          if ( err ) (ret || (ret = [])).push([p, err]);
        }

        return ret;
      }

      return foam.core.ExpressionSlot.create({
        obj: obj,
        code: validateObject,
        args: args});
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.FObject',

  axioms: [
    foam.core.internal.Errors.create()
  ]
});
/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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
  A Faceted Axiom, when added to a Class, makes it implement
  the Facet-Manager Pattern, meaning that calls to create() can
  be intercepted and return a special Facet class depending on the
  value of the 'of' create argument.

  Ex.:
  foam.CLASS({
    name: 'View',
    axioms: [ foam.pattern.Faceted.create() ],
    properties: [ 'of' ],
    methods: [ function view() { return 'default' } ]
  });

  foam.CLASS({name: 'A'});
  foam.CLASS({name: 'B'});
  foam.CLASS({name: 'C'});
  foam.CLASS({name: 'BView', extends: 'View', methods: [function view() { return 'BView'; }]});
  foam.CLASS({name: 'CView', extends: 'View', methods: [function view() { return 'CView'; }]});

  console.log(View.create({of: A}));
  console.log(View.create({of: B}));
  console.log(View.create({of: C}));
*/
// FUTURE: add createOriginal() (or similar) method.
foam.CLASS({
  package: 'foam.pattern',
  name: 'Faceted',

  methods: [
    function installInClass(cls) {
      var oldCreate = cls.create;

      cls.getFacetOf = function(of, X) {
        if ( ! of ) return this;
        X = X || foam.__context__;

        var name;
        var pkg;
        if ( foam.String.isInstance(of) ) {
          name = of.substring(of.lastIndexOf('.') + 1);
          pkg = of.substring(0, of.lastIndexOf('.'))
        } else {
          name = of.name;
          pkg  = of.package;
        }

        var id = ( pkg ? pkg + '.' : '' ) + name + this.name;

        return X.lookup(id, true) || this;
      };

      // ignoreFacets is set to true when called to prevent a second-level
      // of facet checking
      cls.create = function(args, X, ignoreFacets) {
        if ( ! ignoreFacets ) {
          var facetCls = this.getFacetOf(args && args.of, X);

          if ( facetCls !== this ) return facetCls.create(args, X, true);
        }

        return oldCreate.apply(this, arguments);
      }
    }
  ],

  properties: [
    ['name', 'foam.pattern.Faceted']
  ]
});
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

foam.CLASS({
  package: 'foam.core',
  name: 'Int',
  extends: 'Property',

  properties: [
    'units',
    [ 'value', 0 ],
    [ 'adapt', function adaptInt(_, v) {
        return typeof v === 'number' ? Math.trunc(v) :
          v ? parseInt(v) :
          0 ;
      }
    ],
    [ 'fromString', function intFromString(str) {
        return str ? parseInt(str) : 0;
      }
    ]
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'String',
  extends: 'Property',

  documentation: 'StringProperties coerce their arguments into Strings.',

  properties: [
    { class: 'Int', name: 'width', value: 30 },
    [ 'adapt', function(_, a) {
        return typeof a === 'function' ? foam.String.multiline(a) :
               typeof a === 'number'   ? String(a)                :
               a && a.toString         ? a.toString()             :
                                         ''                       ;
      }
    ],
    [ 'value', '' ]
  ]
});


foam.CLASS({
  refines: 'foam.core.Model',

  documentation: 'Upgrade Mode.documentation to a proper String property.',

  properties: [
    { class: 'String', name: 'documentation' }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'Date',
  extends: 'Property',

  // documentation: 'Describes properties of type Date.',
  label: 'Date',

  properties: [
    {
      name: 'adapt',
      value: function (_, d) {
        if ( typeof d === 'number' ) return new Date(d);
        if ( typeof d === 'string' ) {
          var ret = new Date(d);

          if ( ret.toUTCString() === 'InvalidDate' ) throw 'Invalid Date: ' + d;

          return ret;
        }
        return d;
      }
    },
    {
      name: 'comparePropertyValues',
      value: function(o1, o2) {
        if ( ! o1 ) return o2 ? -1 : 0;
        if ( ! o2 ) return 1;

        return foam.Date.compare(o1, o2);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'DateTime',
  extends: 'Date',

  documentation: 'Describes properties of type DateTime.',
  label: 'Date and time'
});


foam.CLASS({
  package: 'foam.core',
  name: 'Byte',
  extends: 'Int',

  documentation: 'Describes properties of type Byte.',
  label: 'Round byte numbers'
});


foam.CLASS({
  package: 'foam.core',
  name: 'Short',
  extends: 'Int',

  documentation: 'Describes properties of type Short.',
  label: 'Round short numbers'
});


foam.CLASS({
  package: 'foam.core',
  name:  'Long',
  extends: 'Int',

  documentation:  'Describes properties of type Long.',
  label: 'Round long numbers'
});


foam.CLASS({
  package: 'foam.core',
  name: 'Float',
  extends: 'Int',

  // documentation:  'Describes properties of type Float.',
  label: 'Decimal numbers',

  properties: [
    'precision',
    [
      'adapt',
      function (_, v) {
        return typeof v === 'number' ? v : v ? parseFloat(v) : 0.0 ;
      }
    ]
  ]
});


/**
 No different than Float for JS, but useful when targeting with other languages.
 **/
foam.CLASS({
  package: 'foam.core',
  name: 'Double',
  extends: 'Float'
});


foam.CLASS({
  package: 'foam.core',
  name: 'Function',
  extends: 'Property',

  documentation: 'Describes properties of type Function.',
  label: 'Code that can be run',

  properties: [
    [
      'value',
      function() {}
    ],
    [
      'assertValue',
      function(value, prop) {
        foam.assert(typeof value === 'function', prop.name, 'Cannot set to non function type.');
      }
    ]
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'Blob',
  extends: 'Property',

  // documentation: 'A chunk of binary data.',
  label: 'Binary data',
});


foam.CLASS({
  package: 'foam.core',
  name: 'Object',
  extends: 'Property',
  documentation: ''
});


foam.CLASS({
  package: 'foam.core',
  name: 'Array',
  extends: 'Property',

  properties: [
    [
      'factory',
      function() { return []; }
    ],
    [
      'isDefaultValue',
      function(v) { return ! v || ! v.length; }
    ]
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'List',
  extends: 'foam.core.Object'
});


foam.CLASS({
  package: 'foam.core',
  name: 'StringArray',
  extends: 'Property',

  documentation: 'An array of String values.',
  label: 'List of text strings',

  properties: [
    {
      name: 'of',
      value: 'String',
      documentation: 'The FOAM sub-type of this property.'
    },
    [
      'factory',
      function() { return []; }
    ],
    [
      'adapt',
      function(_, v, prop) {
        if ( ! Array.isArray(v) ) return v;

        var copy;
        for ( var i = 0 ; i < v.length ; i++ ) {
          if ( typeof v[i] !== 'string' ) {
            if ( ! copy ) copy = v.slice();
            copy[i] = '' + v[i];
          }
        }

        return copy || v;
      }
    ],
    [
      'assertValue',
      function(v, prop) {
        if ( v === null ) return;

        foam.assert(Array.isArray(v),
            prop.name, 'Tried to set StringArray to non-array type.');
        for ( var i = 0 ; i < v.length ; i++ ) {
          foam.assert(typeof v[i] === 'string',
              prop.name, 'Element', i, 'is not a string', v[i]);
        }
      }
    ]
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'Class',
  extends: 'Property',

  properties: [
    {
      name: 'getter',
      value: function(prop) {
        var c = this.instance_[prop.name];

        // Implement value and factory support.
        if ( ! c ) {
          if ( prop.value ) {
            c = prop.value;
          } else if ( prop.factory ) {
            c = this.instance_[prop.name] = prop.factory.call(this, prop);
          }
        }

        // Upgrade Strings to actual classes, if available.
        if ( foam.String.isInstance(c) ) {
          c = this.lookup(c, true);
          if ( c ) this.instance_[prop.name] = c;
        }

        return c;
      }
    },
    {
      name: 'toJSON',
      value: function(value) { return value.id; }
    }
  ],

  methods: [
    function installInProto(proto) {
      this.SUPER(proto);

      var name = this.name;

      Object.defineProperty(proto, name + '$cls', {
        get: function classGetter() {
          console.warn("Deprecated use of 'cls.$cls'. Just use 'cls' instead.");
          return typeof this[name] !== 'string' ? this[name] :
            this.__context__.lookup(this[name], true);
        },
        configurable: true
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'EMail',
  extends: 'String',
  // FUTURE: verify
  label: 'Email address'
});


foam.CLASS({
  package: 'foam.core',
  name: 'Image',
  extends: 'String',
  // FUTURE: verify
  label: 'Image data or link'
});


foam.CLASS({
  package: 'foam.core',
  name: 'URL',
  extends: 'String',
  // FUTURE: verify
  label: 'Web link (URL or internet address)'
});


foam.CLASS({
  package: 'foam.core',
  name: 'Color',
  extends: 'String',
  label: 'Color'
});


foam.CLASS({
  package: 'foam.core',
  name: 'Password',
  extends: 'String',
  label: 'Password that displays protected or hidden text'
});


foam.CLASS({
  package: 'foam.core',
  name: 'PhoneNumber',
  extends: 'String',
  label: 'Phone number'
});


foam.CLASS({
  package: 'foam.core',
  name: 'Map',
  extends: 'Property',

  properties: [
    [ 'factory', function() { return {} } ],
    'of'
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'FObjectProperty',
  extends: 'Property',

  properties: [
    {
      class: 'Class',
      name: 'of',
      value: 'foam.core.FObject'
    },
    {
      name: 'fromJSON',
      value: function(json, ctx, prop) {
        return foam.json.parse(json, prop.of, ctx);
      }
    },
    {
      name: 'adapt',
      value: function(_, v, prop) {
        // All FObjects may be null.
        if (v === null) return v;

        var of = prop.of;

        return of.isInstance(v) ?
            v :
            ( v.class ?
                foam.lookup(v.class) :
                of ).create(v, this.__subContext__);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'Reference',
  extends: 'Property',

  properties: [
    {
      class: 'Class',
      name: 'of'
    },
    {
      class: 'String',
      name: 'targetDAOKey',
      expression: function(of) { return of + 'DAO'; }
    },
    {
      name: 'adapt',
      value: function(oldValue, newValue, prop) {
        return prop.of.isInstance(newValue) ?
          newValue.id :
          newValue ;
      }
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Model',

  documentation: 'Update Model Property types.',

  properties: [
    { class: 'String',  name: 'name' },
    { class: 'Boolean', name: 'abstract' }
  ]
});


foam.CLASS({
  refines: 'Property',

  axioms: [
    foam.pattern.Faceted.create()
  ],

  properties: [
    {
      name: 'of'
    }
  ]
});
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

foam.CLASS({
  package: 'foam.core',
  name: 'Topic',

  documentation: `
  Topics delcare the types of events that an object publishes.
  <pre>
    Ex.
    foam.CLASS({
      name: 'Alarm',
      topics: [ 'ring' ]
    });

    then doing:
    alarm.ring.pub();
    alarm.ring.sub(l);

    is the same as:
    alarm.pub('ring');
    alarm.sub('ring', l);
  </pre>
  `,

  properties: [
    'name',
    'description',
    {
      class: 'FObjectArray',
      of: 'Topic',
      name: 'topics',
      adaptArrayElement: function(o) {
        return typeof o === 'string' ?
          foam.core.Topic.create({ name: o }, this) :
          foam.core.Topic.create(o, this);
      }
    }
  ],

  methods: [
    function installInProto(proto) {
      var name      = this.name;
      var topic     = this;
      var makeTopic = this.makeTopic;

      Object.defineProperty(proto, name, {
        get: function topicGetter() {
          if ( ! this.hasOwnPrivate_(name) ) {
            this.setPrivate_(name, makeTopic(topic, this));
          }

          return this.getPrivate_(name);
        },
        configurable: true,
        enumerable: false
      });
    },

    function makeTopic(topic, parent) {
      var name   = topic.name;
      var topics = topic.topics || [];

      var ret = {
        pub: foam.Function.bind(parent.pub, parent, name),
        sub: foam.Function.bind(parent.sub, parent, name),
        hasListeners: foam.Function.bind(parent.hasListeners, parent, name),
        toString: function() { return 'Topic(' + name + ')'; }
      };

      for ( var i = 0 ; i < topics.length ; i++ ) {
        ret[topics[i].name] = makeTopic(topics[i], ret);
      }

      return ret;
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Model',
  properties: [
    {
      class: 'AxiomArray',
      of: 'Topic',
      name: 'topics',
      adaptArrayElement: function(o) {
        return typeof o === 'string'        ?
          foam.core.Topic.create({name: o}) :
          foam.core.Topic.create(o)         ;
      }
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.FObject',
  topics: [ 'propertyChange' ]
});
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
  Classes can have "inner-classes" which are classes which are defined within
  the scope of a class itself rather than being top-level classes which reside
  in a package or globally. This helps to avoid polluting namespaces with classes
  which are only used by a single class.

<pre>
  Ex.
  // Classes can have inner-Classes.
  foam.CLASS({
    name: 'InnerClassTest',
    classes: [
      { name: 'InnerClass1', properties: ['a', 'b'] },
      { name: 'InnerClass2', properties: ['x', 'y'] }
    ],
    methods: [
      function init() {
        var ic1 = this.InnerClass1.create({a:1, b:2});
        var ic2 = this.InnerClass2.create({x:5, y:10});
        log(ic1.a, ic1.b, ic2.x, ic2.y);
      }
    ]
  });
  InnerClassTest.create();
</pre>
*/
foam.CLASS({
  package: 'foam.core',
  name: 'InnerClass',

  documentation: 'Axiom for defining inner-classes. An inner-class is a class defined in the scope of the outer/owner class. This avoids poluting the package namespace with classes which are only used internally by a class.',

  properties: [
    {
      name: 'name',
      getter: function() { return this.model.name; }
    },
    {
      name: 'model',
      adapt: function(_, m) {
        return this.modelAdapt_(m);
      }
    }
  ],

  methods: [
    function modelAdapt_(m) {
      return foam.core.Model.isInstance(m) ? m :
          foam.core.EnumModel.isInstance(m) ? m :
          foam.core.InnerClass.isInstance(m) ? this.modelAdapt_(m.model) :
          m.class ? this.modelAdapt_(foam.json.parse(m)) :
          foam.core.Model.create(m);
    },

    function installInClass(cls) {
      cls[this.model.name] = this.model.buildClass();
    },

    function installInProto(proto) {
      // get class already created in installInClass();
      var name = this.model.name;
      var cls = proto.cls_[name];

      // Create a private_ clone of the Class with the create() method decorated
      // to pass 'this' as the context if not explicitly provided.  This ensures
      // that the created object has access to this object's exported bindings.
      Object.defineProperty(proto, name, {
        get: function innerClassGetter() {
          if ( ! this.hasOwnPrivate_(name) ) {
            var parent = this;
            var c      = Object.create(cls);

            c.create = function innerClassCreate(args, ctx) {
              return cls.create(args, ctx || parent);
            };
            this.setPrivate_(name, c);
          }

          return this.getPrivate_(name);
        },
        configurable: true,
        enumerable: false
      });
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Model',
  properties: [
    {
      class: 'AxiomArray',
      of: 'InnerClass',
      name: 'classes',
      // A custom adaptArrayElement is needed because we're
      // passing the model definition as model:, rather than
      // as all of the arguments to create().
      adaptArrayElement: function(o) {
        return foam.core.InnerClass.isInstance(o) ?
          o :
          foam.core.InnerClass.create({model: o}) ;
      }
    }
  ]
});
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
  Classes can have "inner-enums" which are enums which are defined within
  the scope of a class itself rather than being top-level enums which reside
  in a package or globally. This helps to avoid polluting namespaces with enums
  which are only used by a single class.

<pre>
  Ex.
  // Classes can have inner-Enums.
  foam.CLASS({
    name: 'InnerEnumTest',
    enums: [
      { name: 'InnerEnum', values: [
        { name: 'OPEN',   label: 'Open'   },
        { name: 'CLOSED', label: 'Closed' }
      ] }
    ],
    methods: [
      function init() {
        log(this.InnerEnum.OPEN, this.InnerEnum.CLOSED)
      }
    ]
  });
  InnerEnumTest.create();
</pre>
*/
foam.CLASS({
  package: 'foam.core',
  name: 'InnerEnum',

  documentation: 'Axiom for defining inner-enums. An inner-enum is an enum defined in the scope of the outer/owner class. This avoids poluting the package namespace with enums which are only used internally by a class.',

  properties: [
    {
      name: 'name',
      getter: function() { return this.model.name; }
    },
    {
      name: 'model',
      adapt: function(_, m) {
        return foam.core.EnumModel.isInstance(m) ? m : foam.core.EnumModel.create(m);
      }
    }
  ],

  methods: [
    function installInClass(cls) {
      cls[this.model.name] = this.model.buildClass();
    },

    function installInProto(proto) {
      // get class already created in installInClass();
      var name = this.model.name;
      var cls = proto.cls_[name];
      proto[name] = cls;
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Model',
  properties: [
    {
      class: 'AxiomArray',
      of: 'InnerEnum',
      name: 'enums',
      // A custom adaptArrayElement is needed because we're
      // passing the model definition as model:, rather than
      // as all of the arguments to create().
      adaptArrayElement: function(o) {
        return foam.core.InnerEnum.isInstance(o) ?
          o :
          foam.core.InnerEnum.create({model: o}) ;
      }
    }
  ]
});
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

foam.CLASS({
  package: 'foam.core',
  name: 'Implements',

  documentation: function() {/*
    Axiom for declaring intent to implement an interface.

    Since interfaces can also have implementations, it
    can also be used to provide mix-ins, which is a safe form of
    multiple-inheritance.
  <pre>
    Ex.
    foam.CLASS({
      name: 'SalaryI',
      properties: [ 'salary' ]
    });

    foam.CLASS({
      name: 'Employee',
      extends: 'Person',
      implements: [ 'SalaryI' ]
    });
  </pre>
  Employee extends Person through regular inheritance, but
  the axioms from SalaryI are also added to the class.
  Any number of mix-ins/interfaces can be specified.
  */},

  properties: [
    { name: 'name', getter: function() { return 'implements_' + this.path; } },
    'path'
  ],

  methods: [
    function installInClass(cls) {
      var m = foam.lookup(this.path);
      if ( ! m ) throw 'No such interface or trait: ' + this.path;

      // TODO: clone these axioms since they could be reused and then would
      // have the wrong sourceCls_;

      // This next part is a bit tricky.
      // If we install a mixin and then override properties of one of the
      // Properties from the mixin, the mixin Property will see the overridden
      // Property as its super-prop, which is wrong. So, we insert a new level
      // in the axiomMap_ between the current axiomMap_ and its prototype, and
      // then install the mixin there.

      // Current AxiomMap
      var aMap = cls.axiomMap_;

      // New mixin AxiomMap to install into
      var sMap = Object.create(aMap.__proto__);

      // Insert new AxiomMap between current and its parent
      aMap.__proto__ = sMap;

      // Temporarily set the class'es AxiomMap to sMap so that
      // mixin axioms get installed into it.
      cls.axiomMap_ = sMap;

      cls.installAxioms(m.getOwnAxioms());

      // Put the original AxiomMap back, with the inserted parent.
      cls.axiomMap_ = aMap;
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Model',
  properties: [
    {
      class: 'AxiomArray',
      of: 'Implements',
      name: 'implements',
      adaptArrayElement: function(o) {
        return typeof o === 'string' ?
          foam.core.Implements.create({path: o}) :
          foam.core.Implements.create(o)         ;
      }
    }
  ]
});
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
  Imports and Exports provide implicit Context dependency management.

  A class can list which values it requires from the Context, and then
  these values will be added to the object itself so that it doesn't need
  to explicitly work with the Context.

  A class can list which values (properties, methods, or method-like axioms)
  that it exports, and these will automatically be added to the object's
  sub-Context. The object's sub-Context is the context that is used when
  new objects are created by the object.

  Ex.
<pre>
foam.CLASS({
  name: 'ImportsTest',

  imports: [ 'log', 'warn' ],

  methods: [
    function foo() {
      this.log('log foo from ImportTest');
      this.warn('warn foo from ImportTest');
    }
  ]
});

foam.CLASS({
  name: 'ExportsTest',
  requires: [ 'ImportsTest' ],

  exports: [ 'log', 'log as warn' ],

  methods: [
    function init() {
      // ImportsTest will be created in ExportTest's
      // sub-Context, which will have 'log' and 'warn'
      // exported.
      this.ImportsTest.create().foo();
    },
    function log(msg) {
      console.log('log:', msg);
    }
  ]
});
</pre>

  Aliasing:
    Bindings can be renamed or aliased when they're imported or exported using
    'as alias'.

  Examples:
    // import 'userDAO' from the Context and make available as this.dao
    imports: [ 'userDAO as dao' ]

    // export my log method as 'warn'
    exports: [ 'log as warn' ]

    // If the axiom to be exported isn't named, but just aliased, then 'this'
    // is exported as the named alias.  This is how objects export themselves.
    exports: [ 'as Controller' ]

  See Context.js.
 */
foam.CLASS({
  package: 'foam.core',
  name: 'Import',

  documentation: 'Axiom to Import a Context Value.',

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    'key',
    {
      class: 'Boolean',
      name: 'required',
      value: true
    },
    {
      name: 'slotName_',
      factory: function() {
        return foam.String.toSlotName(this.name);
      }
    }
  ],

  methods: [
    function installInProto(proto) {
      var name     = this.name;
      var key      = foam.String.toSlotName(this.key);
      var slotName = this.slotName_;

      Object.defineProperty(proto, slotName, {
        get: function importsSlotGetter() {
          return this.__context__[key];
        },
        configurable: false,
        enumerable: false
      });

      Object.defineProperty(proto, name, {
        get: function importsGetter()  {
          var slot = this[slotName];
          if ( slot ) return slot.get();
          console.warn('Access missing import:', name);
          return undefined;
        },
        set: function importsSetter(v) {
          var slot = this[slotName];
          if ( slot ) slot.set(v);
          else console.warn('Attempt to set missing import:', name);
        },
        configurable: true,
        enumerable: false
      });
    },

    function toSlot(obj) {
      return obj[this.slotName_];
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'Export',

  documentation: 'Axiom to Export a Sub-Context Value.',

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      name: 'exportName',
      postSet: function(_, name) {
        this.name = 'export_' + name;
      }
    },
    'key'
  ],

  methods: [
    function getExportMap() {
      var m = {};
      var bs = this.cls_.getAxiomsByClass(foam.core.Export);
      for ( var i = 0 ; i < bs.length ; i++ ) {
        var b = bs[i];

        if ( b.key ) {
          var path = b.key.split('.');

          var a = this.cls_.getAxiomByName(path[0]);

          foam.assert(!!a, 'Unknown axiom: "', path[0], '" in model: ',
                      this.cls_.id, ", trying to export: '", b.key, "'");

          // Axioms have an option of wrapping a value for export.
          // This could be used to bind a method to 'this', for example.
          var e = a.exportAs ? a.exportAs(this, path.slice(1)) : this[path[0]];

          m[b.exportName] = e;
        } else {
          // Ex. 'as Bank', which exports an implicit 'this'
          m[b.exportName] = this;
        }
      }
      return m;
    },

    function installInProto(proto) {
      if ( Object.prototype.hasOwnProperty.call(proto, '__subContext__' ) ) {
        return;
      }

      var axiom = this;

      Object.defineProperty(proto, '__subContext__', {
        get: function YGetter() {
          if ( ! this.hasOwnPrivate_('__subContext__') ) {
            var ctx = this.__context__;
            var m = axiom.getExportMap.call(this);
            this.setPrivate_('__subContext__', ctx.createSubContext(m));
          }

          return this.getPrivate_('__subContext__');
        },
        set: function() {
          throw new Error('Attempted to set unsettable __subContext__ in ' + this.cls_.id);
        },
        configurable: true,
        enumerable: false
      });
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Model',

  properties: [
    {
      class: 'AxiomArray',
      of: 'Import',
      name: 'imports',
      adaptArrayElement: function(o) {
        if ( typeof o === 'string' ) {
          var a        = o.split(' as ');
          var key      = a[0];
          var optional = key.endsWith('?');
          if ( optional ) key = key.slice(0, key.length-1);
          return foam.core.Import.create({name: a[1] || key, key: key, required: ! optional});
        }

        return foam.core.Import.create(o);
      }
    },
    {
      class: 'AxiomArray',
      of: 'Export',
      name: 'exports',
      adaptArrayElement: function(o) {
        if ( typeof o === 'string' ) {
          var a = o.split(' ');

          switch ( a.length ) {
            case 1:
              return foam.core.Export.create({exportName: a[0], key: a[0]});

            case 2:
              // Export 'this'
              foam.assert(
                  a[0] === 'as',
                  'Invalid export syntax: key [as value] | as value');
              return foam.core.Export.create({exportName: a[1], key: null});

            case 3:
              foam.assert(
                  a[1] === 'as',
                  'Invalid export syntax: key [as value] | as value');
              return foam.core.Export.create({exportName: a[2], key: a[0]});

            default:
              foam.assert(false,
                  'Invalid export syntax: key [as value] | as value');
          }
        }

        return foam.core.Export.create(o);
      }
    }
  ]
});
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
  Listeners are high-level pre-bound event call-backs.
<pre>
  Ex.
  foam.CLASS({
    name: 'Sprinkler',
    listeners: [

      // short-form
      function onAlarm() { ... },

      // long-form
      {
        name: 'onClear',
        isFramed: true,
        code: function() { ... }
      }
    ]
  });
</pre>
  You might use the above onAlarm listener like this:
  alarm.ring.sub(sprinker.onAlarm);
<p>
  Notice, that normally JS methods forget which object they belong
  to so you would need to do something like:
    <pre>alarm.ring.sub(sprinker.onAlarm.bind(sprinkler));</pre>
  But listeners are pre-bound.
*/
// TODO(kgr): Add SUPER support.
foam.CLASS({
  package: 'foam.core',
  name: 'Listener',
  extends: 'foam.core.AbstractMethod',

  properties: [
    { class: 'Boolean', name: 'isFramed',   value: false },
    { class: 'Boolean', name: 'isMerged',   value: false },
    { class: 'Int',     name: 'mergeDelay', value: 16, units: 'ms' }
  ],

  methods: [
    function installInProto(proto, superAxiom) {
      foam.assert(
        ! superAxiom ||
          foam.core.Listener.isInstance(superAxiom),
        'Attempt to override non-listener', this.name);

      var name       = this.name;
      var code       = this.override_(proto, foam.Function.setName(this.code, name), superAxiom);
      var isMerged   = this.isMerged;
      var isFramed   = this.isFramed;
      var mergeDelay = this.mergeDelay;

      Object.defineProperty(proto, name, {
        get: function listenerGetter() {
          if ( this.cls_.prototype === this ) return code;

          if ( ! this.hasOwnPrivate_(name) ) {
            var self = this;
            var l = function(sub) {
              // Is it possible to detect stale subscriptions?
              // ie. after an object has been detached.
              return code.apply(self, arguments);
            };

            if ( isMerged ) {
              l = this.__context__.merged(l, mergeDelay);
            } else if ( isFramed ) {
              l = this.__context__.framed(l);
            }
            this.setPrivate_(name, l);
          }

          return this.getPrivate_(name);
        },
        configurable: true,
        enumerable: false
      });
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Model',

  properties: [
    {
      class: 'AxiomArray',
      of: 'Listener',
      name: 'listeners',
      adaptArrayElement: function(o) {
        if ( typeof o === 'function' ) {
          foam.assert(o.name, 'Listener must be named');
          return foam.core.Listener.create({name: o.name, code: o});
        }

        return foam.core.Listener.isInstance(o) ?
            o :
            foam.core.Listener.create(o) ;
      }
    }
  ]
});
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

foam.CLASS({
  package: 'foam.core',
  name: 'MultiPartID',
  extends: 'foam.core.Property',

  documentation: function() {/*
  An Identity Axiom which installs a psedo-property to use as an id.

  Use when you want a multi-part primary-key.
  <pre>
  Ex.
  foam.CLASS({
    name: 'Person',
    ids: [ 'firstName', 'lastName' ],
    properties: [ 'firstName', 'lastName', 'age', 'sex' ]
  });

  > var p = Person.create({firstName: 'Kevin', lastName: 'Greer'});
  > p.id;
  ["Kevin", "Greer"]
  </pre>
  */},

  properties: [
    [ 'name', 'id' ],
    [ 'transient', true ],
    [ 'hidden', true ],
    'propNames',
    'props',
    [ 'getter', function multiPartGetter() {
      var props = this.cls_.ID.props;

      if ( props.length === 1 ) return props[0].get(this);

      var a = new Array(props.length);
      for ( var i = 0 ; i < props.length ; i++ ) a[i] = props[i].get(this);
      return a;
    }],
    [ 'setter', function multiPartSetter(a) {
      var props = this.cls_.ID.props;

      if ( props.length === 1 ) {
        props[0].set(this, a);
      } else {
        for ( var i = 0 ; i < props.length ; i++ ) props[i].set(this, a[i]);
      }
    }],
    {
      name: 'compare',
      value: function multiPartCompare(o1, o2) {
        var props = this.props;
        if ( props.length === 1 ) return props[0].compare(o1, o2);

        for ( var i = 0 ; i < props.length ; i++ ) {
          var c = props[i].compare(o1, o2);
          if ( c ) return c;
        }
        return 0;
      }
    }
  ],

  methods: [
    function installInClass(c) {
      this.props = this.propNames.map(function(n) {
        var prop = c.getAxiomByName(n);
        foam.assert(prop, 'Unknown ids property:', c.id + '.' + n);
        foam.assert(foam.core.Property.isInstance(prop), 'Ids property:', c.id + '.' + n, 'is not a Property.');
        return prop;
      });

      // Extends Property, so actually gets installed in SUPER call
      this.SUPER(c);
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Model',
  properties: [
    {
      name: 'ids',
      postSet: function(_, ids) {
        foam.assert(foam.Array.isInstance(ids), 'Ids must be an array.');
        foam.assert(ids.length, 'Ids must contain at least one property.');

        this.axioms_.push(foam.core.MultiPartID.create({propNames: ids}));
      }
    }
  ]
});
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
  The Requires Axiom is used to declare that a class requires/creates objects
  of a particular class. Required classes can be accessed without fully
  qualifying their package names. Required classes are automatically
  created in the sub-context of the creating object.
<pre>
  Ex.
  foam.CLASS({
    package: 'demo.bank',
    name: 'AccountTester',
    requires: [
      // Require demo.bank.Account so that it can be accessed as this.Account
      'demo.bank.Account',

      // Require SavingsAccount and alias it so that it can be accessed
      // as this.SAccount
      'demo.bank.SavingsAccount as SAccount'
    ],
    methods: [ function init() {
      var a = this.Account.create();
      var s = this.SAccount.create();
    } ]
  });
</pre>
*/
foam.CLASS({
  package: 'foam.core',
  name: 'Requires',

  properties: [ 'name', 'path' ],

  methods: [
    function installInProto(proto) {
      var name = this.name;
      var path = this.path;

      // Create a private_ clone of the Class with the create() method decorated
      // to pass 'this' as the context if not explicitly provided.  This ensures
      // that the created object has access to this object's exported bindings.
      Object.defineProperty(proto, name, {
        get: function requiresGetter() {
          if ( ! this.hasOwnPrivate_(name) ) {
            var cls    = (this.__context__ || foam).lookup(path);
            var parent = this;
            foam.assert(cls, 'Requires: Unknown class: ', path);

            var c = Object.create(cls);
            c.create = function requiresCreate(args, ctx) { return cls.create(args, ctx || parent); };
            this.setPrivate_(name, c);
          }

          return this.getPrivate_(name);
        },
        configurable: true,
        enumerable: false
      });
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.Model',
  properties: [
    {
      class: 'AxiomArray',
      of: 'Requires',
      name: 'requires',
      adaptArrayElement: function(o) {
        if ( typeof o === 'string' ) {
          var a     = o.split(' as ');
          var path  = a[0];
          var parts = path.split('.');
          var name  = a[1] || parts[parts.length-1];
          return foam.core.Requires.create(
              {name: name, path: path}, this);
        }

        return foam.core.Requires.create(o, this);
      }
    }
  ]
});
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

foam.CLASS({
  package: 'foam.core',
  name: 'Slot', // ???: Rename AbstractSlot or make an Interface

  documentation: `
    Slots are observable values which can change over time.

    Slots are simple single-value Model-View-Controller Models, but since
    another meaning of 'Model' is already heavily used in FOAM, Slot is
    used to avoid overloading the term.

    <ul>Types of Slots include:
      <li>PropertySlot
      <li>ConstantSlot
      <li>ExpressionSlot
    </ul>
  `,

  methods: [
    /**
      Subscribe to the Slot's value, if it has one. If the Slot's
      value changes, then unsubscribe from the previous value and
      resubscribe to the new one.
    */
    function valueSub() {
      var self = this;
      var args = Array.from(arguments);
      var s;
      var l = function() {
        var v = self.get();
        if ( s ) s.detach();
        if ( v ) s = v.sub.apply(v, args);
      };
      l();
      this.sub(l);
    },

    /**
      Create a sub-Slot for this Slot's value. If this Slot's
      value changes, then the sub-Slot becomes the Slot for
      the new value's sub-Slot instead. Useful for creating
      Slot paths without having to rebuild whenever a value
      along the chain changes.
    */
    function dot(name) {
      return foam.core.internal.SubSlot.create({
        parent: this,
        name:   name
      });
    },

    // TODO: remove when all code ported
    function link(other) {
      console.warn('deprecated use of link(), use linkFrom() instead');
      return this.linkFrom(other);
    },

    /**
      Link two Slots together, setting both to other's value.
      Returns a Detachable which can be used to break the link.
      After copying a value from one slot to the other, this implementation
      then copies the value back in case the target slot rejected the value.
    */
    function linkFrom(s2) {
      var s1        = this;
      var feedback1 = false, feedback2 = false;

      // TODO: once all slot types property set 'src', these
      // two listeneners can be merged.
      var l1 = function(e) {
        if ( feedback1 ) return;

        if ( ! foam.util.equals(s1.get(), s2.get()) ) {
          feedback1 = true;
          s2.set(s1.get());
          if ( ! foam.util.equals(s1.get(), s2.get()) )
            s1.set(s2.get());
          feedback1 = false;
        }
      };

      var l2 = function(e) {
        if ( feedback2 ) return;

        if ( ! foam.util.equals(s1.get(), s2.get()) ) {
          feedback2 = true;
          s1.set(s2.get());
          if ( ! foam.util.equals(s1.get(), s2.get()) )
            s2.set(s1.get());
          feedback2 = false;
        }
      };

      var sub1 = s1.sub(l1);
      var sub2 = s2.sub(l2)

      l2();

      return {
        detach: function() {
          sub1 && sub1.detach();
          sub2 && sub2.detach();
          sub1 = sub2 = null;
        }
      };
    },

    function linkTo(other) {
      return other.linkFrom(this);
    },

    /**
      Have this Slot dynamically follow other's value.
      Returns a Detachable which can be used to cancel the binding.
    */
    function follow(other) {
      foam.assert(other, 'Slot.follow requires Slot argument.');
      var self = this;
      var l = function() {
        if ( ! foam.util.equals(self.get(), other.get()) ) {
          self.set(other.get());
        }
      };
      l();
      return other.sub(l);
    },

    /**
     * Maps values from one model to another.
     * @param f maps values from srcValue to dstValue
     */
    function mapFrom(other, f) {
      var self = this;
      var l = function() { self.set(f(other.get())); };
      l();
      return other.sub(l);
    },

    function mapTo(other, f) {
      return other.mapFrom(this, f);
    },

    function map(f) {
      return foam.core.ExpressionSlot.create({code: f, args: [this]});
    },

    /**
     * Relate to another Slot.
     * @param f maps from this to other
     * @param fprime maps other to this
     */
    function relateTo(other, f, fPrime) {
      var self     = this;
      var feedback = false;
      var sub      = foam.core.FObject.create();
      var l1 = function() {
        if ( feedback ) return;
        feedback = true;
        other.set(f(self.get()));
        feedback = false;
      };
      var l2 = function() {
        if ( feedback ) return;
        feedback = true;
        self.set(fPrime(other.get()));
        feedback = false;
      };

      sub.onDetach(this.sub(l1));
      sub.onDetach(other.sub(l2));

      l1();

      return sub;
    },

    function relateFrom(other, f, fPrime) {
      return other.relateTo(this, fPrime, f);
    }
  ]
});


foam.CLASS({
  package: 'foam.core.internal',
  name: 'PropertySlot',
  extends: 'foam.core.Slot',

  documentation: `
    Represents object properties as Slots.
    Created with calling obj.prop$ or obj.slot('prop').
    For internal use only.
  `,

  methods: [
    function initArgs() { },
    function init() { },

    function get() {
      return this.prop.get(this.obj);
    },

    function set(value) {
      return this.prop.set(this.obj, value);
    },

    function getPrev() {
      return this.oldValue;
    },

    function setPrev(value) {
      return this.oldValue = value;
    },

    function sub(l) {
      var s = this.obj.sub('propertyChange', this.prop.name, l);
      s.src = this;
      return s;
    },

    function isDefined() {
      return this.obj.hasOwnProperty(this.prop.name);
    },

    function clear() {
      this.obj.clearProperty(this.prop.name);
    },

    function toString() {
      return 'PropertySlot(' + this.obj.cls_.id + '.' + this.prop.name + ')';
    }
  ]
});


foam.CLASS({
  package: 'foam.core.internal',
  name: 'SubSlot',
  extends: 'foam.core.Slot',

  documentation:
      'For internal use only. Is used to implement the Slot.dot() method.',

  properties: [
    'of',
    'parent', // parent slot, not parent object
    'name',
    'value',
    'prevSub'
  ],

  methods: [
    function init() {
      this.parent.sub(this.parentChange);
      this.parentChange();
    },

    function get() {
      var o = this.parent.get();

      return o && o[this.name];
    },

    function set(value) {
      var o = this.parent.get();

      if ( o ) o[this.name] = value;
    },

    /** Needed? **/
    function getPrev() {
      debugger;
      return this.oldValue;
    },

    /** Needed? **/
    function setPrev(value) {
      debugger;
      return this.oldValue = value;
    },

    function sub(l) {
      return this.SUPER('propertyChange', 'value', l);
    },

    function isDefined() {
      return this.parent.get().hasOwnProperty(this.name);
    },

    function clear() {
      this.parent.get().clearProperty(this.name);
    },

    function toString() {
      return 'SubSlot(' + this.parent + ',' + this.name + ')';
    }
  ],

  listeners: [
    function parentChange(s) {
      this.prevSub && this.prevSub.detach();
      var o = this.parent.get();

      // If the parent object changes class, then don't update
      // because a new class will have different sub-slots.
      if ( this.of ) {
        if ( this.of !== ( o && o.cls_ ) ) {
          s.detach();
          return;
        }
      } else {
        if ( o ) this.of = o.cls_;
      }

      this.prevSub = o && o.sub('propertyChange', this.name, this.valueChange);
      this.valueChange();
    },

    function valueChange() {
      var parentValue = this.parent.get();
      this.value = parentValue ? parentValue[this.name] : undefined;
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'ConstantSlot',

  implements: [ 'foam.core.Slot' ],

  documentation: 'An immutable constant valued Slot.',

  properties: [
    {
      name: 'value',
      getter: function() { return this.value_; },
      setter: function() {}
    }
  ],

  methods: [
    function initArgs(args) { this.value_ = args && args.value; },

    function get() { return this.value; },

    function set() {
      throw new Error('Tried to mutate immutable ConstantSlot.');
    },

    function sub(l) { /* nop */ }
  ]
});


/**
*/
foam.CLASS({
  package: 'foam.core',
  name: 'ExpressionSlot',
  implements: [ 'foam.core.Slot' ],

  documentation: `
    Tracks dependencies for a dynamic function and invalidates if they change.

    <pre>
      foam.CLASS({name: 'Person', properties: ['fname', 'lname']});
      var p = Person.create({fname: 'John', lname: 'Smith'});
      var e = foam.core.ExpressionSlot.create({
        args: [ p.fname$, p.lname$ ],
        code: function(f, l) { return f + ' ' + l; }
      });
      log(e.get());
      e.sub(log);
      p.fname = 'Steve';
      p.lname = 'Jones';
      log(e.get());

      Output:
       > John Smith
       > [object Object] propertyChange value [object Object]
       > [object Object] propertyChange value [object Object]
       > Steve Jones

      var p = foam.CLASS({name: 'Person', properties: [ 'f', 'l' ]}).create({f:'John', l: 'Doe'});
      var e = foam.core.ExpressionSlot.create({
        obj: p,
        code: function(f, l) { return f + ' ' + l; }
      });
    </pre>
  `,

  properties: [
    'obj',
    'code',
    {
      name: 'args',
      expression: function(obj) {
        foam.assert(obj, 'ExpressionSlot: "obj" or "args" required.');

        var args = foam.Function.argNames(this.code);
        for ( var i = 0 ; i < args.length ; i++ ) {
          args[i] = obj.slot(args[i]);
        }

        // this.invalidate(); // ???: Is this needed?
        this.subToArgs_(args);

        return args;
      },
      postSet: function(_, args) {
        this.subToArgs_(args);
      }
    },
    {
      name: 'value',
      factory: function() {
        return this.code.apply(this.obj || this, this.args.map(function(a) {
          return a.get();
        }));
      }
    },
    'cleanup_', // detachable to cleanup old subs when obj changes
  ],

  methods: [
    function init() { this.onDetach(this.cleanup); },

    function get() { return this.value; },

    function set() { /* nop */ },

    function sub(l) {
      return arguments.length === 1 ?
        this.SUPER('propertyChange', 'value', l) :
        this.SUPER.apply(this,arguments);
    },

    function subToArgs_(args) {
      this.cleanup();

      var cleanup = foam.core.FObject.create();

      for ( var i = 0 ; i < args.length ; i++ ) {
        cleanup.onDetach(args[i].sub(this.invalidate));
      }

      this.cleanup_ = cleanup;
    }
  ],

  listeners: [
    function cleanup() { this.cleanup_ && this.cleanup_.detach(); },
    function invalidate() { this.clearProperty('value'); }
  ]
});
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
 * The Proxy axiom enables your class to automatically proxy methods of
 * an interface to a delegate object.
 *
 * It is an implementation of the Proxy design pattern.
 *
 * The Proxy axiom itself is a property which holds the delegate object
 * that we are proxying.  It also installs a number of Method axioms onto
 * the target class, which proxy all the the specific methods of the interface
 * being proxied.
 *
 * Currently only methods are proxied.
 *
 * USAGE:
 *
 * foam.CLASS({
 *   name: 'Abc',
 *   methods: [
 *     function foo() {
 *       console.log("foo");
 *     }
 *   ]
 * });
 *
 * foam.CLASS({
 *   name: 'ProxyAbc',
 *   properties: [
 *     {
 *       class: 'Proxy',
 *       of: 'Abc'
 *       name: 'delegateAbc'
 *     }
 *   ]
 * });
 *
 * var a = ProxyAbc.create({ delegateAbc: Abc.create() });
 * a.foo();
 *
 * will output:
 *
 * "foo"
 *
 *
 * Methods can be forwarded or delegated to the proxied object.
 * Forwarded methods are the simple case:
 *
 * function foo() {
 *   // This is what a forwarded method looks like
 *   this.delegateAbc.foo();
 * }
 *
 * Delegated methods call the proxied object's implementation
 * but keep "this" as the same object.
 *
 * If the foo method was delegated it would look like this:
 *
 * function foo() {
 *   this.delegateAbc.foo.call(this);
 * }
 *
 * FUTURE(adamvy): Support proxying properties?
 * TODO(adamvy): Document how topics are proxied once the implementation is settled.
 */
// NB: Extending a Proxied object and unsetting options (like setting
//     topics: []) will not undo the work the base class has already done.
//     The ProxySub is already installed in the prototype and will still
//     be active in the derived class, even though it appears that topics is
//     not proxied when examining the dervied class' axiom.
foam.CLASS({
  package: 'foam.core',
  name: 'Proxy',
  extends: 'Property',

  properties: [
    { name: 'of', required: true },
    {
      class: 'StringArray',
      name: 'topics'
    },
    {
      class: 'StringArray',
      name: 'forwards',
      factory: null,
      value: null
      //documentation: 'Methods that are forwarded to the proxies object.'
    },
    {
      class: 'StringArray',
      name: 'delegates',
      factory: null,
      value: null
      //documentation: 'Methods that are delegated to the proxied object.'
    },
    {
      name: 'fromJSON',
      value: function(json, ctx) {
        return foam.json.parse(json, null, ctx);
      }
    }
  ],

  methods: [
    function installInClass(cls) {
      this.SUPER(cls);

      var name     = this.name;
      var delegate = foam.lookup(this.of);

      function resolveName(name) {
        var m = delegate.getAxiomByName(name);
        foam.assert(foam.core.Method.isInstance(m), 'Cannot proxy non-method', name);
        return m;
      }

      var delegates = this.delegates ? this.delegates.map(resolveName) : [];

      var forwards = this.forwards ?
          this.forwards.map(resolveName) :
          // TODO(adamvy): This isn't the right check.  Once we have modeled interfaces
          // we can proxy only that which is defined in the interface.
          delegate.getOwnAxiomsByClass(foam.core.Method);

      var axioms = [];
      for ( var i = 0 ; i < forwards.length ; i++ ) {
        var method = forwards[i];
        axioms.push(foam.core.ProxiedMethod.create({
          name: method.name,
          returns: method.returns,
          property: name,
          args: method.args
        }));
      }

      for ( var i = 0 ; i < delegates.length ; i++ ) {
        var method = delegates[i];
        axioms.push(foam.core.ProxiedMethod.create({
          name: method.name,
          returns: method.returns,
          property: name,
          args: method.args,
          delegate: true
        }));
      }

      if ( ! this.topics || this.topics.length ) {
        axioms.push(foam.core.ProxySub.create({
          topics: this.topics,
          prop:   this.name
        }));
      }

      cls.installAxioms(axioms);
    }
  ]
});

/**
 * ProxiedMethod is a type of method that delegates or forwards calls
 * to a delegate object.  It is used as an implementation detail of the
 * Proxy axiom
 *
 * Delegation means that the delegate object's implementation is called with
 * "this" still being the original object.
 *
 * Forwarding means that the method call is simply "forwarded" to the delegate
 * object.  "this" will be the delegate object.
 */
foam.CLASS({
  package: 'foam.core',
  name: 'ProxiedMethod',
  extends: 'Method',

  properties: [
    {
      class: 'String',
      name: 'property'
    },
    {
      class: 'Boolean',
      name: 'delegate',
      value: false
    },
    {
      name: 'code',
      expression: function(name, property, returns, delegate) {
        return delegate ?
            function delegate() {
              return this[property][name].apply(this, arguments);
            } :
            function forward() {
              return this[property][name].apply(this[property], arguments);
            } ;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'EventProxy',

  properties: [
    {
      name: 'dest'
    },
    {
      name: 'topic',
      factory: function() { return []; }
    },
    {
      class: 'Boolean',
      name: 'active',
      value: false,
      postSet: function(old, a) {
        for ( var key in this.children ) {
          this.children[key].active = ! a;
        }

        if ( old !== a ) {
          if ( a ) {
            this.doSub();
          } else {
            this.doUnsub();
          }
        }
      }
    },
    {
      name: 'parent'
    },
    {
      name: 'children',
      factory: function() {
        return {};
      }
    },
    {
      name: 'src',
      postSet: function(o, src) {
        if ( this.active ) this.doSub();
        for ( var key in this.children ) {
          this.children[key].src = src;
        }
      }
    },
    {
      name: 'subscription'
    }
  ],

  methods: [
    function init() {
      this.onDetach(foam.Function.bind(function() {
        this.subscription && this.subscription.detach();

        if ( this.parent ) {
          this.parent.removeChild(this);
          this.parent.active = true;
        }
      }, this));
    },

    function doSub() {
      if ( this.subscription ) this.subscription.detach();

      if ( ! this.src ) return;

      var args = this.topic.slice()
      args.push(this.onEvent);
      this.subscription = this.src.sub.apply(this.src, args);
    },

    function doUnsub() {
      if ( this.subscription ) this.subscription.detach();
    },

    function removeChild(c) {
      for ( var key in this.children ) {
        if ( this.children[key] === c ) {
          delete this.children[key];
          return;
        }
      }
    },

    function getChild(key) {
      if ( ! this.children[key] ) {
        this.children[key] = this.cls_.create({
          parent: this,
          dest: this.dest,
          src: this.src,
          topic: this.topic.slice().concat(key)
        });
      }
      return this.children[key];
    },

    function addProxy(topic) {
      var c = this;
      var active = true;
      for ( var i = 0 ; i < topic.length ; i++ ) {
        active = active && ! c.active;
        c = c.getChild(topic[i]);
      }

      c.active = active;
    }
  ],

  listeners: [
    function onEvent(s) {
      if ( this.active ) {
        var args = foam.Function.appendArguments([], arguments, 1);
        var c = this.dest.pub.apply(this.dest, args);
        if ( ! c ) this.detach();
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.core',
  name: 'ProxySub',
  extends: 'Method',

  properties: [
    {
      name: 'name',
      getter: function() {
        return 'sub';
      }
    },
    {
      class: 'String',
      name: 'prop'
    },
    {
      class: 'StringArray',
      name: 'topics',
      factory: null
    },
    {
      name: 'code',
      expression: function(prop, topics) {
        var privateName = prop + 'EventProxy_';
        return function subProxy(a1) {
          if ( ! topics || topics.indexOf(a1) != -1 ) {
            var proxy = this.getPrivate_(privateName);
            if ( ! proxy ) {
              proxy = foam.core.EventProxy.create({
                dest: this,
                src: this[prop]
              });
              this.setPrivate_(privateName, proxy);

              proxy.src$.follow(this.slot(prop));
            }

            proxy.addProxy(Array.from(arguments).slice(0, -1));
          }

          return this.SUPER.apply(this, arguments);
        };
      }
    }
  ]
});
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

foam.CLASS({
  package: 'foam.core',
  name: 'PromisedMethod',
  extends: 'ProxiedMethod',

  properties: [
    {
      name: 'code',
      expression: function(name, property, returns, delegate) {
        if ( delegate ) {
          return returns ?
            function() {
              var self = this;
              var args = arguments;
              return this[property].then(function(d) {
                return d[name].apply(self, args);
              });
            } :
            function() {
              var self = this;
              var args = arguments;
              this[property].then(function(d) {
                d[name].apply(self, args);
              });
            };
        }
        return returns ?
          function() {
            var self = this;
            var args = arguments;
            return this[property].then(function(d) {
              return d[name].apply(d, args);
            });
          } :
          function() {
            var self = this;
            var args = arguments;
            this[property].then(function(d) {
              d[name].apply(d, args);
            });
          };
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'Promised',
  extends: 'Property',

  properties: [
    {
      name: 'of',
      required: true
    },
    {
      class: 'StringArray',
      name: 'methods',
      value: null,
      factory: null
    },
    {
      class: 'StringArray',
      name: 'topics',
      value: null,
      factory: null
    },
    {
      name: 'postSet',
      expression: function(name) {
        var stateName    = name + 'State';
        var delegateName = name + 'Delegate';
        return function(_, p) {
          var self = this;
          this[stateName]    = undefined;
          this[delegateName] = undefined;

          p.then(function(d) { self[delegateName] = d; });
        };
      }
    }
  ],

  methods: [
    function installInClass(cls) {
      this.SUPER(cls);

      var myName         = this.name;
      var stateName      = this.name + 'State';
      var delegateName   = this.name + 'Delegate';
      var pendingState   = 'Pending' + foam.String.capitalize(myName);
      var fulfilledState = 'Fulfilled' + foam.String.capitalize(myName);

      var delegate = foam.lookup(this.of);

      function resolveName(name) {
        var m = delegate.getAxiomByName(name);
        foam.assert(foam.core.Method.isInstance(m), 'Cannot proxy non-method', name);
        return m;
      }

      var methods = this.methods ?
          this.methods.map(resolveName) :
          delegate.getOwnAxiomsByClass(foam.core.Method);

      var methodNames = methods.map(function(m) { return m.name; });

      var myAxioms = [
        foam.core.Proxy.create({
          name:      stateName,
          of:        this.of,
          delegates: methodNames,
          forwards:  [],
          factory: function() {
            return this[pendingState].create();
          }
        }),
        foam.core.Property.create({
          name: delegateName,
          postSet: function() {
            this[stateName] = this[fulfilledState].create();
          }
        }),
        foam.core.ProxySub.create({
          topics: this.topics,
          prop:   delegateName
        })
      ];

      var pendingMethods = [];

      for ( var i = 0 ; i < methods.length ; i++ ) {
        pendingMethods.push(foam.core.PromisedMethod.create({
          name: methods[i].name,
          property: myName,
          returns:  methods[i].returns,
          delegate: false
        }));
      }

      var name = this.name;
      myAxioms = myAxioms.concat(
        foam.core.InnerClass.create({
          model: {
            name: pendingState,
            axioms: [
              foam.pattern.Singleton.create()
            ],
            methods: pendingMethods
          }
        }),
        foam.core.InnerClass.create({
          model: {
            name: fulfilledState,
            properties: [
              {
                class:    'Proxy',
                name:     delegateName,
                of:       this.of,
                topics:   this.topics,
                forwards: methodNames
              }
            ],
            axioms: [
              foam.pattern.Singleton.create()
            ]
          }
        }));

      cls.installAxioms(myAxioms);
    }
  ]
});
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

foam.CLASS({
  package: 'foam.core.internal',
  name: 'InterfaceMethod',
  extends: 'foam.core.Method',

  documentation: 'An InterfaceMethod is a Method declaration, but lacks code.',

  properties: [
    {
      name: 'code',
      required: false
    },
    {
      class: 'Boolean',
      name: 'abstract',
      value: true
    }
  ],

  methods: [
    function installInProto() { }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'InterfaceModel',
  extends: 'foam.core.Model',

  documentation: 'An Interface Mode/definition. Created with foam.INTERFACE().',

  properties: [
    ['extends', 'foam.core.AbstractInterface'],
    {
      class: 'AxiomArray',
      name: 'methods',
      of: 'foam.core.internal.InterfaceMethod'
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'AbstractInterface',

  documentation: 'Abstract base-class for Interfaces.',

  axioms: [
    {
      installInClass: function(cls) {
        cls.create = function() {
          throw new Error("Cannot instantiate an Interface.");
        };
      }
    }
  ]
});


foam.LIB({
  name: 'foam',

  methods: [
    function INTERFACE(m) {
      m.class = m.class || 'foam.core.InterfaceModel';
      foam.CLASS(m);
    }
  ]
});
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

foam.CLASS({
  package: 'foam.core',
  name: 'ContextMethod',
  extends: 'foam.core.Method',

  documentation: 'A Method which has the call-site context added as the first argument when exported. See use in foam.u2.U2Context.E',

  methods: [
    function exportAs(obj) {
      var m = obj[this.name];

      return function() {
        var ctx = foam.core.FObject.isInstance(this) ? this.__context__ : this;

        return m.apply(obj, foam.Function.appendArguments([ctx], arguments, 0));
      };
    }
  ]
});
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

foam.CLASS({
  package: 'foam.core',
  name: 'Window',

  documentation: function(){/*
    Encapsulates top-level window/document features.

    Export common window/document services through the Context.

    Rather than using window or document directly, objects should import: the
    services that foam.core.Window exports:, and then access them as this.name,
    rather than as console.name or document.name.

    All FObjects already import: [ 'error', 'log', 'warn' ], meaning
    that these do not need to be explicitly imported.

    This is done to remove dependency on the globals 'document' and 'window',
    which makes it easier to write code which works with multiple windows.

    It also allows for common services to be decorated, trapped, or replaced
    in sub-contexts (for example, to replace console.error and console.warn when
    running test).

    A foam.core.Window is installed by FOAM on starup for the default
    window/document, but if user code opens a new Window, it should create
    and install a new foam.core.Window explicitly.
  */},

  exports: [
    'getElementsByClassName',
    'getElementById',
    'async',
    'cancelAnimationFrame',
    'clearInterval',
    'clearTimeout',
    'console',
    'delayed',
    'document',
    'error',
    'framed',
    'info',
    'installCSS',
    'log',
    'merged',
    'requestAnimationFrame',
    'setInterval',
    'setTimeout',
    'warn',
    'window'
  ],

  properties: [
    [ 'name', 'window' ],
    'window',
    {
      name: 'document',
      factory: function() { return this.window.document; }
    },
    {
      name: 'console',
      factory: function() { return this.window.console; }
    }
  ],

  methods: [
    function getElementById(id) {
      return this.document.getElementById(id);
    },

    function getElementsByClassName(cls) {
      return this.document.getElementsByClassName(cls);
    },

    function error() {
      this.console.error.apply(this.console, arguments);
    },

    function info() {
      this.console.info.apply(this.console, arguments);
    },

    function log() {
      this.console.log.apply(this.console, arguments);
    },

    function warn() {
      this.console.warn.apply(this.console, arguments);
    },

    function async(l) {
      /* Decorate a listener so that the event is delivered asynchronously. */
      return this.delayed(l, 0);
    },

    function delayed(l, delay) {
      /* Decorate a listener so that events are delivered 'delay' ms later. */
      return foam.Function.bind(function() {
        this.setTimeout(
          function() { l.apply(this, arguments); },
          delay);
      }, this);
    },

    function merged(l, opt_delay) {
      var delay = opt_delay || 16;
      var ctx     = this;

      return foam.Function.setName(function() {
        var triggered = false;
        var lastArgs  = null;
        function mergedListener() {
          triggered = false;
          var args = Array.from(lastArgs);
          lastArgs = null;
          l.apply(this, args);
        }

        var f = function() {
          lastArgs = arguments;

          if ( ! triggered ) {
            triggered = true;
            ctx.setTimeout(mergedListener, delay);
          }
        };

        return f;
      }(), 'merged(' + l.name + ')');
    },

    function framed(l) {
      var ctx = this;

      return foam.Function.setName(function() {
        var triggered = false;
        var lastArgs  = null;
        function frameFired() {
          triggered = false;
          var args = lastArgs;
          lastArgs = null;
          l.apply(this, args);
        }

        var f = function framed() {
          lastArgs = arguments;

          if ( ! triggered ) {
            triggered = true;
            ctx.requestAnimationFrame(frameFired);
          }
        };

        return f;
      }(), 'framed(' + l.name + ')');
    },

    function setTimeout(f, t) {
      return this.window.setTimeout(f, t);
    },
    function clearTimeout(id) {
      this.window.clearTimeout(id);
    },

    function setInterval(f, t) {
      return this.window.setInterval(f, t);
    },
    function clearInterval(id) {
      this.window.clearInterval(id);
    },

    function requestAnimationFrame(f) {
      return this.window.requestAnimationFrame(f);
    },
    function cancelAnimationFrame(id) {
      this.window.cancelAnimationFrame(id);
    },
    function installCSS(text) {
      /* Create a new <style> tag containing the given CSS code. */
      this.document.head.insertAdjacentHTML('beforeend',
          '<style>' + text + '</style>');
    }
  ]
});


/*
 * requestAnimationFrame is not available on nodejs,
 * so swap out with calls to setTimeout.
 */
if ( foam.isServer ) {
  foam.CLASS({
    refines: 'foam.core.Window',
    methods: [
      function requestAnimationFrame(f) {
        return this.setTimeout(f, 16);
      },
      function cancelAnimationFrame(id) {
        this.clearTimeout(id);
      }
    ]
  });
}


// Replace top-level Context with one which includes Window's exports.
foam.__context__ = foam.core.Window.create(
  { window: global },
  foam.__context__
).__subContext__;
foam.CLASS({
  package: 'foam.core.internal',
  name: 'ContextMultipleInheritence',
  exports: [
    'createSubContext'
  ],
  methods: [
    {
      class: 'ContextMethod',
      name: 'createSubContext',
      code: function createSubContext(X, opt_args, opt_name) {
        // TODO(adamvy): Revisit this.  Consider adding a MultiContext object which
        // implemented context multiple inheritence property.
        if ( foam.core.FObject.isInstance(opt_args) ) {
          var obj = opt_args;

          var exports = obj.cls_.getAxiomsByClass(foam.core.Export);

          if ( ! exports ) return X;

          opt_args = exports[0].getExportMap.call(obj);
        }

        return this.__context__.createSubContext.call(X, opt_args, opt_name);
      }
    }
  ]
});

(function() {
  var tmp = foam.core.internal.ContextMultipleInheritence.create();
  tmp.setPrivate_('__context__', foam.__context__);
  foam.__context__ = tmp.__subContext__;
})();
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

foam.CLASS({
  package: 'foam.classloader',
  name: 'ModelARequireExtension',
  refines: 'foam.core.Model',

  methods: [
    function arequire(opt_deps) {
      var X = this.__context__;
      var promises = [];
      if ( this.extends ) promises.push(X.arequire(this.extends, opt_deps));

      for ( var i = 0, a; a = this.axioms_[i]; i++ ) {
        if ( a.arequire ) promises.push(a.arequire(opt_deps));
      }

      return Promise.all(promises);
    }
  ]
});


foam.CLASS({
  package: 'foam.classloader',
  name: 'RequiresARequireExtension',
  refines: 'foam.core.Requires',

  methods: [
    function arequire(opt_deps) {
      return this.__context__.arequire(this.path, opt_deps);
    }
  ]
});


foam.CLASS({
  package: 'foam.classloader',
  name: 'ClassLoader',

  documentation: 'Asynchronous class loader service. Loads classes dynamically.',

  exports: [
    'arequire'
  ],

  properties: [
    {
      name: 'pending',
      class: 'Object',
      factory: function() { return {}; }
    }
  ],

  methods: [
    {
      name: 'arequire',
      class: 'foam.core.ContextMethod',
      code: function(X, modelId, opt_deps) {
        // Contains models that depend on the modelId and have already been
        // arequired. Used to avoid circular dependencies from waiting on
        // each other.
        var deps = opt_deps || {};

        if ( X.isRegistered(modelId) ) return Promise.resolve();
        if ( deps[modelId] ) return Promise.resolve();
        if ( this.pending[modelId] ) return this.pending[modelId];
        deps[modelId] = true;

        var modelDao = X[foam.String.daoize(foam.core.Model.name)];
        this.pending[modelId] = modelDao.find(modelId).then(function(m) {
          // Model validation may make use of deps. Require them first, then
          // validate the model.
          foam.assert(m, 'Cannot find ' + modelId);
          return m.arequire(deps).then(function() {
            m.validate();
            return m;
          });
        }).then(function(m) {
          if ( X.isRegistered(modelId) ) return m;

          if ( m.refines ) {
            foam.CLASS(m);
            return m;
          }

          m.id = m.package ? m.package + '.' + m.name : m.name;
          foam.UNUSED[m.id] = true;

          var f = foam.Function.memoize0(function() {
            delete foam.UNUSED[m.id];
            var c = m.buildClass();
            c.validate();
            foam.USED[m.id] = c;
            return c;
          });

          // Register model in global context and global namespace.
          foam.__context__.registerFactory(m, f);
          foam.package.registerClassFactory(m, f);
          return m;
        });

        var self = this;
        this.pending[modelId].then(function() {
          delete self.pending[modelId];
        });

        return this.pending[modelId];
      }
    }
  ]
});

// Export ClassLoader.arequire by overwriting global context with
// ClassLoader's sub-context.
foam.__context__ = foam.classloader.ClassLoader.create(
  {},
  foam.__context__
).__subContext__;
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

foam.LIB({
  name: 'foam.Function',

  methods: [
    (function() {
      var ret = function resolveTypeString(typeStr) {
        /** Looks up a type as a FOAM class, stdlib String, Number, etc., or 'any' */
        // missing types are checked for _after_ the body comment is checked
        if ( ! typeStr ) return undefined;

        typeStr = typeStr.trim();
        if ( typeStr.substring(typeStr.length - 2) === '[]' ) {
          return foam.Array;
        }
        if ( typeStr === 'any' ) {
          return undefined;
        }

        // otherwise look for foam.<primitive> type
        cls = foam[typeStr];
        if ( cls ) return cls;

        var cls = foam.lookup(typeStr, true);
        if ( cls ) return cls;

        // could not resolve
        throw new TypeError('foam.Function.args could not resolve type ' +
          typeStr);
      };
      ret.isTypeChecked__ = true;
      return ret;
    })(),

    function args(fn) {
      /**
       * Extracts the arguments and their types from the given function.
       * @param {Function} fn The function to extract from. The toString() of the function
       *     must be accurate.
       * @return {Array} An array of Argument objects.
       */
      // strip newlines and find the function(...) declaration
      var args = foam.Function.argsStr(fn);

      if ( ! args ) return [];

      args += ','; // easier matching

      var ret = [];
      var retMapByName = {};
      // check each arg for types
      // Optional commented type(incl. dots for packages), argument name,
      // optional commented return type
      // ws [/* ws package.type? ws */] ws argname ws [/* ws retType ws */]
      var argIdx = 0;
      var argMatcher = /(\s*\/\*\s*(\.\.\.)?([\w._$\[\]]+)(\=)?\s*(\/\/\s*(.*?))?\s*\*\/)?\s*(\.\.\.)?([\w_$]+)\s*(\/\*\s*([\w._$\[\]]+)(\?)?\s*\*\/)?\s*\,+/g;
      var typeMatch;

      while ( typeMatch = argMatcher.exec(args) ) {
        // if can't match from start of string, fail
        if ( argIdx === 0 && typeMatch.index > 0 ) break;

        if ( ret.returnType ) {
          throw new SyntaxError('foam.Function.args return type \'' +
            ret.returnType.typeName +
            '\' must appear after the last argument only: ' +
            args.toString() + '\n' +
            'For function:\n' +
            fn.toString() + '\n'

          );
        }

        // record the argument
        var arg = foam.core.Argument.create({
          name:          typeMatch[8],
          typeName:      typeMatch[3],
          type:          this.resolveTypeString(typeMatch[3]),
          optional:      true, //typeMatch[4] === '=', // TODO: mandatory
          repeats:       typeMatch[2] === '...' || typeMatch[7] === '...',
          index:         argIdx++,
          documentation: typeMatch[6]
        });
        ret.push(arg);
        retMapByName[arg.name] = arg;

        // if present, record return type (if not the last arg, we fail on the
        // next iteration)
        if ( typeMatch[9] ) {
          ret.returnType = foam.core.Argument.create({
            name: 'ReturnValue',
            optional: typeMatch[11],
            typeName: typeMatch[10]
          });
        }
      }

      if ( argIdx === 0 ) {
        // check for bare return type with no args
        typeMatch = args.match(/^\s*\/\*\s*([\w._$\[\]]+)(\=)?\s*\*\/\s*/);
        if ( typeMatch && typeMatch[1] ) {
          foam.assert(! ret.returnType,
            'foam.Function.args found two return types: ' + fn.toString());
          ret.returnType = foam.core.Argument.create({
            name: 'ReturnValue',
            optional: typeMatch[2] === '=',
            typeName: typeMatch[1]
          });
        } else {
          throw new SyntaxError(
              'foam.Function.args argument parsing error:\n' +
              args.toString() + '\n' +
            'For function:\n' +
            fn.toString() + '\n'
          );
        }
      }

      // Also pull args out of the documentation comment (if inside the body
      // so we can access it)
      var comment = foam.Function.functionComment(fn);
      if ( comment ) {
        // match @arg or @param {opt_type} arg_name
        var commentMatcher = /.*(\@arg|\@param|\@return)\s+(?:\{(\.\.\.)?([\w._$\[\]]+)(\=)?\}\s+)?(.*?)\s+(?:([^\@]*))?/g;
        var commentMatch;
        while ( commentMatch = commentMatcher.exec(comment) ) {
          var name     = commentMatch[5];
          var optional = commentMatch[4] === '=';
          var repeats  = commentMatch[2] === '...';
          var type     = commentMatch[3];
          var docs     = commentMatch[6] && commentMatch[6].trim();

          if ( commentMatch[1] === '@return' ) {
            if ( ret.returnType ) {
              throw new SyntaxError(
                  'foam.Function.args duplicate return type ' +
                  'definition in block comment: \"' +
                  type + '\" from \:\n' + fn.toString());
            }

            ret.returnType = foam.core.Argument.create({
              name: 'ReturnValue',
              optional: optional,
              repeats: repeats,
              typeName: type,
              type: this.resolveTypeString(type),
              documentation: docs
            });
          } else {
            // check existing args
            if ( retMapByName[name] ) {
              if ( retMapByName[name].typeName ) {
                throw new SyntaxError(
                    'foam.Function.args duplicate argument ' +
                    'definition in block comment: \"' +
                    name + '\" from:\n' + fn.toString());
              }

              retMapByName[name].typeName      = type;
              retMapByName[name].optional      = optional;
              retMapByName[name].repeats       = repeats;
              retMapByName[name].documentation = docs;
              retMapByName[name].type          = this.resolveTypeString(type);
            } else {
              var arg = foam.core.Argument.create({
                name:          name,
                optional:      optional,
                repeats:       repeats,
                typeName:      type,
                index:         argIdx++,
                documentation: docs
              });
              ret.push(arg);
              retMapByName[arg.name] = arg;
            }
          }
        }
      }

      // Check for missing types
      var missingTypes = [];
      for ( var i = 0; i < ret.length; i++ ) {
        if ( ! ret[i].typeName ) missingTypes.push(ret[i].name);
      }

      if ( missingTypes.length ) {
        //(this.warn || console.warn)('Missing type(s) for ' +
        //  missingTypes.join(', ') + ' in:\n' + fn.toString());
      }

      return ret;
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'Argument',

  documentation: 'Describes one argument of a function or method.',

  properties: [
    {
      /** The name of the argument */
      name: 'name'
    },
    {
      /**
       * The string name of the type
       * (either a model name or foam.String, foam.Function, etc. or [])
       */
      name: 'typeName'
    },
    {
      /**
       * If set, this holds the actual FOAM Class or LIB represented
       * by typeName.
       */
      name: 'type',
      factory: function() {
        return foam.Function.resolveTypeString(this.typeName) || null;
      }
    },
    {
      /** If true, indicates that this argument is optional. */
      name: 'optional', value: false
    },
    {
      /** If true, indicates a variable number of arguments. */
      name: 'repeats', value: false
    },
    {
      /** The index of the argument (the first argument is at index 0). */
      name: 'index', value: -1
    },
    {
      /** The documentation associated with the argument (denoted by a // ) */
      name: 'documentation', value: ''
    }
  ],

  methods: [
    (function() {
      var validate = function validate(arg) {
        /**
          Validates the given argument against this type information.
          If any type checks are failed, a TypeError is thrown.
         */
        if ( ! this.type ) {
          // no type, no check to perform
          return;
        }

        var i = ( this.index >= 0 ) ? ' ' + this.index + ', ' : ', ';

        // optional check
        if ( foam.Null.isInstance(arg) || foam.Undefined.isInstance(arg) ) {
          if ( ! this.optional ) {
            throw new TypeError(
              'Argument ' + i + this.name + ' {' + this.typeName + '}' +
                ', is not optional, but was undefined in a function call');
          }

          return; // value is undefined, but ok with that
        }

        // have a modelled type
        if ( ! this.type.isInstance(arg) ) {
          var gotType = (arg.cls_) ? arg.cls_.name : typeof arg;
          throw new TypeError(
              'Argument ' + i + this.name +
              ', expected type ' + this.typeName + ' but passed ' + gotType);
        }
      };

      validate.isTypeChecked__ = true; // avoid type checking this method
      return validate;
    })()
  ]
});

foam.CLASS({
  refines: 'foam.core.Method',
  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.core.Argument',
      name: 'args',
      adaptArrayElement: function(e, obj) {
        var ctx = obj.__subContext__ || foam;
        var of = e.class || this.of;
        var cls = ctx.lookup(of);

        return cls.isInstance(e) ? e :
          foam.String.isInstance(e) ? cls.create({ name: e }) :
          cls.create(e, obj);
      }
    }
  ]
});
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

/*
  A -> foo(C)
       foo(D)
  B -> foo(C)

  How does B.foo(D) work?
  Copy methods? Then what if A gets refined?
  Lookup B.foo, otherwise lookup A.foo()?
    Then what about FObject vs. particular class lookup?
  What about treating 'this' as first argument?
*/

foam.CLASS({
  package: 'foam.core',
  name: 'MultiMethod',
  extends: 'foam.core.AbstractMethod',

  properties: [
    {
      name: 'name',
      factory: function() {
        return this.methodName +
          this.args.map(function(a) { return a.typeName; }).join(':');
      }
    },
    {
      name: 'methodName',
      required: true
    }
  ],

  methods: [
    function installInProto(proto) {
      var key = this.cls_.id.replace(/\./g,':') + ':' + this.methodName;
      console.log('Installing: ' + key);
      var dispath = this.createDispatch(proto, key, 0, this.args);
      displatch.code = this.code;
    },

    function createDispatch(proto, prefix, pos, args) {
      var d = proto[prefix];

      if ( ! d ) {
        var prefix2 = prefix + ':' + args[pos] + typeName;
        proto[prefix] = function dispatch() {
          if ( arguments.length === pos ) {
            return arguments.callee.code.apply(this, arguments);
          }
          var t = foam.typeOf(arguments[pos]);
          var f = t[prefix2];
          return f.apply(this, arguments);
        };
      }

      if ( pos === args.length ) return proto[prefix];
    },

    function exportAs(obj) {
      var m = obj[this.name];
      /** Bind the method to 'this' when exported so that it still works. **/
      return function exportedMethod() { return m.apply(obj, arguments); };
    }
  ]
});
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

foam.CLASS({
  package: 'foam.pattern',
  name: 'Singleton',

  documentation: `
  A Singleton Axiom, when added to a Class, makes it implement
  the Singleton Pattern, meaning that all calls to create()
  will return the same (single) instance.
  `,

  properties: [ [ 'name', 'create' ] ],

  methods: [
    function installInClass(cls) {
      /** @param {any} cls */
      var oldCreate = cls.create;
      var newCreate = cls.create = function() {
        // This happens when a newer Axiom replaces create().
        // If this happens, don't apply Singleton behaviour.
        if ( this.create !== newCreate )
          return oldCreate.apply(this, arguments);

        return this.private_.instance_ ||
            ( this.private_.instance_ = oldCreate.apply(this, arguments) );
      };
    },

    function installInProto(p) {
      // Not needed, but improves performance.
      p.clone  = function() { return this; };
      p.equals = function(o) { /** @param {any=} o */ return this === o; };
    }
  ]
});

// We only need one Singleton, so make it a Singleton.
foam.CLASS({
  refines: 'foam.pattern.Singleton',
  axioms: [ foam.pattern.Singleton.create() ]
});
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
  A Multiton Axiom, when added to a Class, makes it implement
  the Multiton Pattern, meaning that calls to create() with
  the same value for the specified 'property', will return the
  same instance.

  Ex.:
  foam.CLASS({
    name: 'Color',
    axioms: [ foam.pattern.Multiton.create({property: 'color'}) ],
    properties: [ 'color' ],
    methods: [ function init() { log('Creating Color:', this.color); } ]
  });

  var red1 = Color.create({color: 'red'});
  var red2 = Color.create({color: 'red'});
  var blue = Color.create({color: 'blue'});

  log(red1 === red2); // true, same object
  log(red1 === blue); // false, different objects
*/
foam.CLASS({
  package: 'foam.pattern',
  name: 'Multiton',

  properties: [
    [ 'name', 'create' ],
    {
      // FUTURE: switch to 'properties' to support multiple keys when/if needed.
      class: 'String',
      name: 'property'
    }
  ],

  methods: [
    function installInClass(cls) {
      var property  = this.property;
      var oldCreate = cls.create;

      cls.create = function(args) {
        var instances = this.private_.instances ||
            ( this.private_.instances = {} );
        var key = args[property];

        return instances[key] ||
            ( instances[key] = oldCreate.apply(this, arguments) );
      };
    },

    function installInProto(p) {
      // Not needed, but improves performance.
      p.clone  = function() { return this; };
      p.equals = function(o) { return this === o; };
    }
  ]
});
/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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
 * For those familiar with Java, FOAM Enums are very similar to Java enums in
 * design.
 *
 * An Enum is essentially a class with a fixed number of named instances.
 * The instances are frequently referred to as Enum Values, or the 'values'
 * of an Enum.
 *
 * Enums have most of the features available to FOAM classes, including
 * properties, methods, constants, templates, and listeners.
 *
 * Enums extend from FObject, so they inherit FObject features such as
 * pub/sub events, diffing, hashCode, etc.
 *
 * Enums also have a few built-in properties by default. Every Enum has an
 * 'ordinal' property, which is a integer unique to all the Enum Values of a
 * particular Enum. Each enum also has a 'name' property, which is the name
 * given to each Enum Value.
 *
 * Example usage:
 * <pre>
 * // To define an enum we use the foam.ENUM() function.
 * foam.ENUM({
 *   name: 'IssueStatus',
 *
 *   // Enums share many features with regular classes, the properties
 *   // and methods we want our enums to have are defined as follows.
 *   properties: [
 *     {
 *       class: 'Boolean',
 *       name: 'consideredOpen',
 *       value: true
 *     }
 *   ],
 *
 *   methods: [
 *     function foo() {
 *       return this.label + ( this.consideredOpen ? ' is' : ' is not' ) +
 *           ' considered open.';
 *     }
 *   ],
 *
 *   // Use the values: key to define the actual Enum Values that we
 *   // want to exist.
 *   values: [
 *     {
 *       name: 'OPEN'
 *     },
 *     {
 *       // The ordinal can be specified explicitly.
 *       name: 'CLOSED',
 *       ordinal: 100
 *     },
 *     {
 *       // If the ordinal isn't given explicitly it is auto assigned as
 *       // the previous ordinal + 1
 *       name: 'ASSIGNED'
 *     },
 *     {
 *       // You can specify the label, which will be used when rendering in a
 *       // combo box or similar
 *       name: 'UNVERIFIED',
 *       label: 'Unverified'
 *     },
 *     {
 *       // Values for additional properties to your enum are also defined
 *       // inline.
 *       name: 'FIXED',
 *       label: 'Fixed',
 *       consideredOpen: false
 *     }
 *   ]
 * });
 *
 * console.log(IssueStatus.OPEN.name); // outputs "OPEN"
 * console.log(IssueStatus.ASSIGNED.consideredOpen); // outputs "true"
 *
 * // Enum value ordinals can be specified.
 * console.log(IssueStatus.CLOSED.ordinal); // outputs 100
 * // values without specified ordinals get auto assigned.
 * console.log(IssueStatus.ASSIGNED.ordinal); // outputs 101
 *
 * // Methods can be called on the enum values.
 * // outputs "Fixed is not considered open."
 * console.log(IssueStatus.FIXED.foo());
 *
 * // To store enums on a class, it is recommended to use the Enum property
 * // type.
 * foam.CLASS({
 *   name: 'Issue',
 *   properties: [
 *     {
 *       class: 'Enum',
 *       of: 'IssueStatus',
 *       name: 'status'
 *     }
 *   ]
 * });
 *
 * var issue = Issue.create({ status: IssueStatus.UNVERIFIED });
 * console.log(issue.status.label); // outputs "Unverified"
 *
 * // Enum properties give you some convenient adapting.
 * // You can set the property to the ordinal or the
 * // name of an enum, and it will set the property
 * // to the correct Enum value.
 *
 * issue.status = 100;
 *
 * issue.status === IssueStatus.CLOSED; // is true
 *
 * // Enum properties also allow you to assign them via the name
 * // of the enum.
 *
 * issue.status = "ASSIGNED"
 *
 * issue.status === IssueStatus.ASSIGNED; // is true
 *
 * The extent of all Enum values can be accessed from either the collection or from any
 * individual Enum value:
 * console.log(IssueStatus.VALUES, IssueStatus.CLOSED.VALUES);
 *
 * Values can be specified as just Strings if you don't want to explicitly set the label
 * or ordinal. Ex.:
 *
 * foam.ENUM({
 *  name: 'DaysOfWeek',
 *  values: [
 *    'SUNDAY',
 *    'MONDAY',
 *    'TUESDAY',
 *    'WEDNESDAY',
 *    'THURSDAY',
 *    'FRIDAY',
 *    'SATURDAY'
 *  ]
 * });
 *
 * </pre>
 */
// TODO: Make extend Model so can override methods (or do some other way).
foam.CLASS({
  package: 'foam.core.internal',
  name: 'EnumValueAxiom',

  documentation: 'The definition of a single Enum value.',

  properties: [
    {
      name: 'ordinal',
      getter: function() { return this.definition.ordinal; },
      setter: function(o) { this.definition.ordinal = o; }
    },
    {
      name: 'name',
      getter: function() { return this.definition.name; }
    },
    'definition'
  ],

  methods: [
    function installInClass(cls) {
      var e = cls.create(this.definition);
      cls.installConstant(this.name, e);
      cls.VALUES.push(e);
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'EnumModel',
  extends: 'Model',

  documentation: 'Model for defining Enum(erations).',

  properties: [
    [ 'extends', 'foam.core.AbstractEnum' ],
    {
      class: 'AxiomArray',
      of: 'foam.core.internal.EnumValueAxiom',
      name: 'values',
      adapt: function(_, v) {
        var used = {}; // map of ordinals used to check for duplicates

        var next = 0;
        for ( var i = 0 ; i < v.length ; i++ ) {
          var def = v[i];

          if ( foam.String.isInstance(def) ) {
            def = { label: def, name: foam.String.constantize(def) };
          }

          if ( def.ordinal || def.ordinal === 0 ) {
            next = def.ordinal + 1;
          } else {
            def.ordinal = next++;
          }

          if ( ! foam.core.internal.EnumValueAxiom.isInstance(def) ) {
            v[i] = def = foam.core.internal.EnumValueAxiom.create({definition: def});
          }

          if ( used[def.ordinal] ) {
            throw this.id +
                ' Enum error: duplicate ordinal found ' + def.name + ' ' +
                used[def.ordinal] + ' both have an ordinal of ' + def.ordinal;
          }

          used[def.ordinal] = def.name;
        }

        return v;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'AbstractEnum',

  documentation: 'Abstract base class for all Enum classes.',

  axioms: [
    foam.pattern.Multiton.create({property: 'ordinal'}),
    {
      installInClass: function(cls) {
        // Each sub-class of AbstractEnum gets it's own VALUES array.
        Object.defineProperty(cls, 'VALUES', {
          get: function() {
            return this.private_.VALUES || ( this.private_.VALUES = [] );
          },
          configurable: true,
          enumerable: false
        });
      },
      installInProto: function(p) {
        Object.defineProperty(p, 'VALUES', {
          get: function() { return this.cls_.VALUES; },
          configurable: true,
          enumerable: false
        });
      }
    }
  ],

  properties: [
    {
      class: 'Int',
      name: 'ordinal',
      final: true
    },
    {
      class: 'String',
      name: 'name',
      final: true
    },
    {
      class: 'String',
      name: 'label',
      final: true,
      factory: function() {
        return this.name;
      }
    }
  ],

  methods: [
    function toString() { return this.name; }
  ]
});


// TODO(adamvy): Support default values.
foam.CLASS({
  package: 'foam.core',
  name: 'Enum',
  extends: 'Property',

  documentation: 'A Property type for storing enum values.',

  properties: [
    {
      class: 'Class',
      name: 'of',
      required: true
    },
    [
      'adapt',
      function(o, n, prop) {
        var of = prop.of;

        if ( n && n.cls_ === of ) return n;

        var type = foam.typeOf(n), ret;

        if ( type === foam.String ) {
          ret = of[foam.String.constantize(n)];
        } else if ( type === foam.Number ) {
          ret = of.create({ordinal: n}, foam.__context__);
        }

        if ( ret ) return ret;

        throw 'Attempt to set invalid Enum value. Enum: ' + of.id + ', value: ' + n;
      }
    ]
  ]
});


foam.LIB({
  name: 'foam',

  methods: [
    function ENUM(m) {
      m.class = m.class || 'foam.core.EnumModel';
      return foam.CLASS(m);
    }
  ]
});
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
// JSON Support
//
// TODO:
//   - don't output default classes
*/

/**
  A short-name is an optional shorter name for a property.
  It is used by foam.json.Outputer when 'useShortNames'
  is enabled. Short-names enable JSON output to be smaller,
  which can save disk space and/or network bandwidth.
  Ex.
<pre>
  properties: [
    { name: 'firstName', shortName: 'fn' },
    { name: 'lastName',  shortName: 'ln' }
  ]
</pre>
*/
foam.CLASS({
  refines: 'foam.core.Property',

  properties: [
    { class: 'String', name: 'shortName' },
    {
      name: 'fromJSON',
      value: function fromJSON(value, ctx, prop, json) {
        return foam.json.parse(value, null, ctx);
      }
    },
    {
      name: 'toJSON',
      value: function toJSON(value, outputter) { return value; }
    }
  ],

  methods: [
    function outputJSON(o) {
      o.output({ class: '__Property__', forClass_: this.forClass_ });
    }
  ]
});

foam.CLASS({
  name: '__Property__',
  package: 'foam.core',
  axioms: [
    {
      name: 'create',
      installInClass: function(c) {
        var oldCreate = c.create;
        c.create = function(args, X) {
          var cls = args.forClass_.substring(0, args.forClass_.lastIndexOf('.'));
          var name = args.forClass_.substring(args.forClass_.lastIndexOf('.') + 1);

          var prop = X.lookup(cls).getAxiomByName(name);

          foam.assert(prop, 'Could not find property "', args.forClass_, '"');

          return prop;
        };
      }
    }
  ]
});

/** Add toJSON() method to FObject. **/
foam.CLASS({
  refines: 'foam.core.FObject',

  methods: [
    /**
      Output as a pretty-printed JSON-ish String.
      Use for debugging/testing purposes. If you want actual
      JSON output, use foam.json.* instead.
    */
    function stringify() {
      return foam.json.Pretty.stringify(this);
    }
  ]
});


/** JSON Outputer. **/
foam.CLASS({
  package: 'foam.json',
  name: 'Outputer',

  documentation: 'JSON Outputer.',

  properties: [
    {
      class: 'String',
      name: 'buf_',
      value: ''
    },
    {
      class: 'Int',
      name: 'indentLevel_',
      value: 0
    },
    {
      class: 'String',
      name: 'indentStr',
      value: '\t'
    },
    {
      class: 'String',
      name: 'nlStr',
      value: '\n'
    },
    {
      class: 'String',
      name: 'postColonStr',
      value: ' '
    },
    {
      class: 'Boolean',
      name: 'alwaysQuoteKeys',
      help: 'If true, keys are always quoted, as required by the JSON standard. If false, only quote keys which aren\'tvalid JS identifiers.',
      value: true
    },
    {
      class: 'Boolean',
      name: 'formatDatesAsNumbers',
      value: false
    },
    {
      class: 'Boolean',
      name: 'formatFunctionsAsStrings',
      value: true
    },
    {
      class: 'Boolean',
      name: 'outputDefaultValues',
      value: true
    },
    {
      class: 'Boolean',
      name: 'outputClassNames',
      value: true
    },
    {
      class: 'Function',
      name: 'propertyPredicate',
      value: function(o, p) { return ! p.transient; }
    },
    {
      class: 'Boolean',
      name: 'useShortNames',
      value: false
    },
    {
      class: 'Boolean',
      name: 'sortObjectKeys',
      value: false
    },
    {
      class: 'Boolean',
      name: 'pretty',
      value: true,
      postSet: function(_, p) {
        if ( p ) {
          this.clearProperty('indentStr');
          this.clearProperty('nlStr');
          this.clearProperty('postColonStr');
          this.clearProperty('useShortNames');
        } else {
          this.indentStr = this.nlStr = this.postColonStr = null;
        }
      }
    },
    {
      // TODO: rename to FON
      class: 'Boolean',
      name: 'strict',
      value: true,
      postSet: function(_, s) {
        if ( s ) {
          this.useShortNames            = false;
          this.formatDatesAsNumbers     = false;
          this.alwaysQuoteKeys          = true;
          this.formatFunctionsAsStrings = true;
        } else {
          this.alwaysQuoteKeys          = false;
          this.formatFunctionsAsStrings = false;
        }
      }
    }
    /*
    {
      class: 'Boolean',
      name: 'functionFormat',
      value: false
    },
    */
  ],

  methods: [
    function reset() {
      this.indentLevel_ = 0;
      this.buf_ = '';
      return this;
    },

    function escape(str) {
      return str
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/[\x00-\x1f]/g, function(c) {
          return "\\u00" + ((c.charCodeAt(0) < 0x10) ?
              '0' + c.charCodeAt(0).toString(16) :
              c.charCodeAt(0).toString(16));
        });
    },

    function maybeEscapeKey(str) {
      return this.alwaysQuoteKeys || ! /^[a-zA-Z\$_][0-9a-zA-Z$_]*$/.test(str) ?
          '"' + str + '"' :
          str ;
    },

    function out() {
      for ( var i = 0 ; i < arguments.length ; i++ ) this.buf_ += arguments[i];
      return this;
    },

    /**
      Start a block, using the supplied start character, which would typically
      be '{' for objects or '[' for arrays.  Handles indentation if enabled.
    */
    function start(c) {
      if ( c ) this.out(c).nl();
      if ( this.indentStr ) {
        this.indentLevel_++;
        this.indent();
      }
      return this;
    },

    /**
      End a block, using the supplied end character, which would typically
      be '}' for objects or ']' for arrays.
    */
    function end(c) {
      if ( this.indent ) {
        this.indentLevel_--;
      }
      if ( c ) this.nl().indent().out(c);
      return this;
    },

    function nl() {
      if ( this.nlStr && this.nlStr.length ) {
        this.out(this.nlStr);
      }
      return this;
    },

    function indent() {
      for ( var i = 0 ; i < this.indentLevel_ ; i++ ) this.out(this.indentStr);
      return this;
    },

    function outputPropertyName(p) {
      this.out(this.maybeEscapeKey(this.useShortNames && p.shortName ? p.shortName : p.name));
      return this;
    },

    function outputProperty(o, p, includeComma) {
      if ( ! this.propertyPredicate(o, p ) ) return;
      if ( ! this.outputDefaultValues && p.isDefaultValue(o[p.name]) ) return;

      var v = o[p.name];

      if ( includeComma ) this.out(',');

      this.nl().indent().outputPropertyName(p).out(':', this.postColonStr);
      this.output(p.toJSON(v, this));
    },

    function outputDate(o) {
      if ( this.formatDatesAsNumbers ) {
        this.out(o.valueOf());
      } else {
        this.out(JSON.stringify(o));
      }
    },

    function outputFunction(o) {
      if ( this.formatFunctionsAsStrings ) {
        this.output(o.toString());
      } else {
        this.out(o.toString());
      }
    },

    function outputObjectKeyValue_(key, value, first) {
      if ( ! first ) this.out(',').nl().indent();
      this.out(this.maybeEscapeKey(key), ':').output(value);
    },

    function outputObjectKeyValues_(o) {
      var first = true;
      for ( var key in o ) {
        this.outputObjectKeyValue_(key, o[key], first);
        first = false;
      }
    },

    function outputSortedObjectKeyValues_(o) {
      var key, keys = [];

      for ( key in o ) keys.push(key);
      keys.sort();

      var first = true;
      for ( var i = 0 ; i < keys.length; i++ ) {
        key = keys[i];
        this.outputObjectKeyValue_(key, o[key], first);
        first = false;
      }
    },

    {
      name: 'output',
      code: foam.mmethod({
        // JSON doesn't support sending 'undefined'
        Undefined: function(o) { this.out('null'); },
        Null:      function(o) { this.out('null'); },
        String:    function(o) { this.out('"', this.escape(o), '"'); },
        Number:    function(o) { this.out(o); },
        Boolean:   function(o) { this.out(o); },
        Date:      function(o) { this.outputDate(o); },
        Function:  function(o) { this.outputFunction(o); },
        FObject:   function(o) {
          if ( o.outputJSON ) {
            o.outputJSON(this)
            return;
          }

          this.start('{');
          if ( this.outputClassNames ) {
            this.out(
                this.maybeEscapeKey('class'),
                ':',
                this.postColonStr,
                '"',
                o.cls_.id,
                '"');
          }
          var ps = o.cls_.getAxiomsByClass(foam.core.Property);
          for ( var i = 0 ; i < ps.length ; i++ ) {
            this.outputProperty(o, ps[i], this.outputClassNames || i );
          }
          this.nl().end('}');
        },
        Array: function(o) {
          this.start('[');
          for ( var i = 0 ; i < o.length ; i++ ) {
            this.output(o[i], this);
            if ( i < o.length-1 ) this.out(',').nl().indent();
          }
          //this.nl();
          this.end(']');
        },
        Object: function(o) {
          if ( o.outputJSON ) {
            o.outputJSON(this);
          } else {
            this.start('{');
            if ( this.sortObjectKeys ) {
              this.outputSortedObjectKeyValues_(o);
            } else {
              this.outputObjectKeyValues_(o);
            }
            this.end('}');
          }
        }
      })
    },

    function stringify(o) {
      this.output(o);
      var ret = this.buf_;
      this.reset(); // reset to avoid retaining garbage
      return ret;
    },

    {
      name: 'objectify',
      code: foam.mmethod({
        Date: function(o) {
          return this.formatDatesAsNumbers ? o.valueOf() : o;
        },
        Function: function(o) {
          return this.formatFunctionsAsStrings ? o.toString() : o;
        },
        FObject: function(o) {
          var m = {};
          if ( this.outputClassNames ) {
            m.class = o.cls_.id;
          }
          var ps = o.cls_.getAxiomsByClass(foam.core.Property);
          for ( var i = 0 ; i < ps.length ; i++ ) {
            var p = ps[i];
            if ( ! this.propertyPredicate(o, p) ) continue;
            if ( ! this.outputDefaultValues && p.isDefaultValue(o[p.name]) ) continue;

            m[p.name] = this.objectify(p.toJSON(o[p.name], this));
          }
          return m;
        },
        Array: function(o) {
          var a = [];
          for ( var i = 0 ; i < o.length ; i++ ) {
            a[i] = this.objectify(o[i]);
          }
          return a;
        },
        Object: function(o) {
          var ret = {};
          for ( var key in o ) {
            // NOTE: Could lazily construct "ret" first time
            // this.objectify(o[key]) !== o[key].
            if ( o.hasOwnProperty(key) ) ret[key] = this.objectify(o[key]);
          }
          return ret;
        }
      },
      function(o) { return o; })
    }
  ]
});


/** Library of pre-configured JSON Outputers. **/
foam.LIB({
  name: 'foam.json',

  constants: {

    // Pretty Print
    Pretty: foam.json.Outputer.create({
      strict: false
    }),

    // Strict means output as proper JSON.
    Strict: foam.json.Outputer.create({
      pretty: false,
      strict: true
    }),

    // Pretty and proper JSON.
    PrettyStrict: foam.json.Outputer.create({
      pretty: true,
      strict: true
    }),

    // Compact output (not pretty)
    Compact: foam.json.Outputer.create({
      pretty: false,
      formatDatesAsNumbers: true,
      outputDefaultValues: false,
      strict: false
    }),

    // Shorter than Compact (uses short-names if available)
    Short: foam.json.Outputer.create({
      pretty: false,
      formatDatesAsNumbers: true,
      outputDefaultValues: false,
      useShortNames: true,
      strict: false
    }),

    // Short, but exclude network-transient properties.
    Network: foam.json.Outputer.create({
      pretty: false,
      formatDatesAsNumbers: true,
      outputDefaultValues: false,
      useShortNames: true,
      strict: false,
      propertyPredicate: function(o, p) { return ! p.networkTransient; }
    }),

    // Short, but exclude storage-transient properties.
    Storage: foam.json.Outputer.create({
      pretty: false,
      formatDatesAsNumbers: true,
      outputDefaultValues: false,
      useShortNames: true,
      strict: false,
      propertyPredicate: function(o, p) { return ! p.storageTransient; }
    })
  },

  methods: [
    {
      name: 'parse',
      code: foam.mmethod({
        Array: function(o, opt_class, opt_ctx) {
          var a = new Array(o.length);
          for ( var i = 0 ; i < o.length ; i++ ) {
            a[i] = this.parse(o[i], opt_class, opt_ctx);
          }

          return a;
        },
        FObject: function(o) { return o; },
        Object: function(json, opt_class, opt_ctx) {
          var cls = json.class || opt_class;

          if ( cls ) {
            var c = typeof cls === 'string' ? foam.lookup(cls) : cls;

            for ( var key in json ) {
              var prop = c.getAxiomByName(key);
              if ( prop ) {
                json[key] = prop.fromJSON(json[key], opt_ctx, prop, this);
              }
            }

            return c.create(json, opt_ctx);
          }

          for ( var key in json ) {
            var o = json[key];
            json[key] = this.parse(json[key], null, opt_ctx);
          }

          return json;
        }
      }, function(o) { return o; })
    },

    function parseString(jsonStr, opt_ctx) {
      return this.parse(eval('(' + jsonStr + ')'), undefined, opt_ctx);
    },

    function stringify(o) {
      return foam.json.Compact.stringify(o);
    },

    function objectify(o) {
      return foam.json.Compact.objectify(o);
    }
  ]
});
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
  Parse combinator library.

  Create complex parsers by composing simple parsers.s

  A PStream is a "Parser Stream", the input format accepted by
  FOAM parsers.

  PStreams have the following interface:
    get int     pos   - The character position in the input stream.

    get Char    head  - The first character in the stream.

    get PStream tail  - A PStream for the next position in the input steam.

    get Object  value - 'Value' associated with this PStream.

    PStream setValue(Object value) - Create a new PStream at the same position
        but with a new 'value'. The value is used to hold the result of a
        (sub-)parse.

  PStreams are immutable, which greatly simplifies backtracking.

  A parser has the following interface:
    PStream parse(PStream stream);

  It takes as input a PStream, and returns either a PStream
  advanced to the point after all input consumed by the parser,
  or undefined if the parse failed. The value generated by the parser
  is stored in the .value property of the returned PStream.
 */
foam.CLASS({
  package: 'foam.parse',
  name: 'StringPS',

  properties: [
    {
      name: 'str',
      class: 'Simple'
    },
    {
      name: 'pos',
      class: 'Simple'
    },
    {
      name: 'head',
      getter: function() {
        return this.str[0][this.pos];
      }
    },
    {
      name: 'tail',
      getter: function() {
        if ( ! this.instance_.tail ) {
          var ps = this.cls_.create();
          ps.str = this.str;
          ps.pos = this.pos + 1;
          this.instance_.tail = ps;
        }
        return this.instance_.tail;
      },
      setter: function(value) {
        this.instance_.tail = value;
      }
    },
    {
      name: 'value',
      setter: function(value) { this.instance_.value = value; },
      getter: function() {
        return this.instance_.value !== undefined ?
          this.instance_.value :
          this.str[0].charAt(this.pos - 1);
      }
    }
  ],

  methods: [
    function initArgs() {},

    function setValue(value) {
      // Force undefined values to null so that hasOwnProperty checks are faster.
      if ( value === undefined ) value = null;
      var ps = this.cls_.create();
      ps.str = this.str;
      ps.pos = this.pos;
      ps.tail = this.tail;
      ps.value = value;
      return ps;
    },

    function setString(s) {
      if ( ! this.pos ) this.pos = 0;
      if ( ! this.str ) this.str = [];
      this.str[0] = s;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'ParserArray',
  extends: 'FObjectArray',

  properties: [
    ['of', 'foam.parse.Parser'],
    ['adapt', function(_, a) {
        if ( ! a ) return [];
        var b = new Array(a.length);
        for ( var i = 0 ; i < a.length ; i++ ) {
          b[i] = typeof a[i] === 'string' ?
              foam.parse.Literal.create({s: a[i]}) :
              a[i];
        }
        return b;
      }
    ]
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'ParserProperty',
  extends: 'Property',

  properties: [
    {
      name: 'adapt',
      value: function(_, v) {
        return typeof v === 'string' ? foam.parse.Literal.create({s: v}) : v;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'ParserDecorator',

  properties: [
    {
      name: 'p',
      class: 'foam.parse.ParserProperty',
      final: true
    }
  ],

  methods: [
    function toString() { return this.p.toString(); }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'State',

  properties: [
    {
      class: 'Simple',
      name: 'success'
    },
    {
      class: 'Simple',
      name: 'fail'
    },
    {
      class: 'Simple',
      name: 'ps'
    }
  ],

  methods: [
    /*
      TODO: make this model abstract
      TODO: allow methods without code in abstract classes
    {
      name: 'step'
    },
    */
    function partialEval() { return this; }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'BacktrackStart',
  extends: 'foam.parse.compiled.State',

  properties: [
    {
      name: 'restore',
      final: true
    },
    {
      name: 'next',
      final: true
    }
  ],

  methods: [
    function step() {
      //      this.restore.ps = this.ps;
      this.restore.next.ps = this.ps;
      this.next.ps = this.ps;
      return this.next;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'BacktrackFinish',
  extends: 'foam.parse.compiled.State',

  properties: [
    {
      name: 'next',
      final: true
    }
  ],

  methods: [
//    function step(pps) {
    //      pps[0] = this.ps;
    function step() {
      return this.next;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'Placeholder',
  extends: 'foam.parse.compiled.State',

  properties: [
    {
      name: 'next',
      final: true
    }
  ],

  methods: [
    //    function step(pps) {
    function step() {
      this.next.ps = this.ps;
      return this.next;
    },

    function partialEval() {
      return this.next.partialEval();
    }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'Char',
  extends: 'foam.parse.compiled.State',

  properties: [
    {
      name: 'c',
      final: true
    }
  ],

  methods: [
    function step() {
      if ( this.ps.head === this.c ) {
        this.success.ps = this.ps.tail;
        return this.success;
      }
      this.fail.ps = this.ps;
      return this.fail;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'LiteralWithValue',
  extends: 'foam.parse.compiled.State',

  properties: [
    {
      name: 's',
      final: true
    },
    {
      name: 'value',
      final: true
    }
  ],
  methods: [
    function step() {
      var str = this.s;
      var ps = this.ps;
      for ( var i = 0 ; i < str.length ; i++, ps = ps.tail ) {
        if ( str.charAt(i) !== ps.head.toLowerCase() ) {
          this.fail.ps = this.ps;
          return this.fail;
        }
      }
      this.success.ps = ps.setValue(this.value || str);
      return this.success;
    }
  ]
});


/**
 * Case-insensitive literal that returns a fixed value when it matches.
 */
foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'LiteralICWithValue',
  extends: 'foam.parse.compiled.State',

  properties: [
    {
      name: 's',
      final: true,
      postSet: function(old, nu) {
        this.lower = nu.toLowerCase();
      }
    },
    {
      name: 'lower',
      final: true
    },
    {
      name: 'value',
      final: true
    }
  ],

  methods: [
    function step() {
      var str = this.lower;
      var ps = this.ps;
      for ( var i = 0 ; i < str.length ; i++, ps = ps.tail ) {
        if ( str.charAt(i) !== ps.head.toLowerCase() ) {
          this.fail.ps = this.ps;
          return this.fail;
        }
      }
      this.success.ps = ps.setValue(this.value || this.s);
      return this.success;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'Literal',
  extends: 'foam.parse.compiled.State',

  properties: [
    {
      name: 's',
      final: true
    }
  ],

  methods: [
    function step() {
      var ps1 = this.ps;
      var ps  = this.ps;
      var str = this.s;
      for ( var i = 0 ; i < str.length ; i++, ps = ps.tail ) {
        if ( str.charAt(i) !== ps.head ) {
          this.fail.ps = ps1;
          return this.fail;
        }
      }
      this.success.ps = ps;
      return this.success;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'LiteralIC',
  extends: 'foam.parse.compiled.State',

  properties: [
    {
      name: 's',
      final: true,
      postSet: function(old, nu) {
        this.lower = nu.toLowerCase();
      }
    },
    {
      name: 'lower',
      final: true
    }
  ],

  methods: [
    function step() {
      var ps1 = this.ps;
      var ps  = this.ps;
      var str = this.lower;
      for ( var i = 0 ; i < str.length ; i++, ps = ps.tail ) {
        if ( ! ps.head || str.charAt(i) !== ps.head.toLowerCase() ) {
          this.fail.ps = ps1;
          return this.fail;
        }
      }
      this.success.ps = ps;
      return this.success;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'AnyChar',
  extends: 'foam.parse.compiled.State',

  methods: [
    function step() {
      var ps = this.ps;
      if ( ps.head ) {
        this.success.ps = ps.tail;
        return this.success;
      }
      this.fail.ps = ps;
      return this.fail;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'Range',
  extends: 'foam.parse.compiled.State',

  properties: [
    {
      name: 'from',
      final: true
    },
    {
      name: 'to',
      final: true
    }
  ],

  methods: [
    function step() {
      var ps = this.ps;
      if ( this.from <= ps.head && ps.head <= this.to ) {
        this.success.ps = ps.tail;
        return this.success;
      }

      this.fail.ps = ps;
      return this.fail;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'Counter',
  extends: 'foam.parse.compiled.State',

  properties: [
    {
      name: 'count',
      final: true
    },
    {
      name: 'next',
      final: true
    }
  ],

  methods: [
    function step() {
      this.count[0]++;
      this.next.ps = this.ps;
      return this.next;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'CounterStart',
  extends: 'foam.parse.compiled.State',

  properties: [
    {
      name: 'count',
      final: true
    },
    {
      name: 'next',
      final: true
    }
  ],

  methods: [
    function step() {
      this.count[0] = 0;
      this.next.ps = this.ps;
      return this.next;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'MinimumCount',
  extends: 'foam.parse.compiled.State',

  properties: [
    {
      class: 'Int',
      name: 'minimum',
      final: true
    },
    {
      name: 'count',
      final: true
    }
  ],

  methods: [
    function step() {
      if ( this.count[0] < this.minimum ) {
        this.fail.ps = this.ps;
        return this.fail;
      }
      this.success.ps = this.ps;
      return this.success;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'ParserState',
  extends: 'foam.parse.compiled.State',

  properties: [
    {
      name: 'parser',
      final: true
    }
  ],

  methods: [
    function step() {
      var ps = this.ps;
      var ret = this.parser.parse(ps);

      if ( ret ) {
        this.success.ps = ret;
        return this.success;
      }

      this.fail.ps = ps;
      return this.fail;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'Action',
  extends: 'foam.parse.compiled.State',

  properties: [
    {
      name: 'action',
      final: true
    }
  ],

  methods: [
    function step() {
      var ps = this.ps.setValue(this.action(this.ps.value));
      this.success.ps = ps;
      return this.success;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'GetValue',
  extends: 'foam.parse.compiled.State',

  properties: [
    {
      name: 'next',
      final: true
    },
    {
      name: 'value',
      final: true
    }
  ],

  methods: [
    function step() {
      this.value[0] = this.ps.value;
      this.next.ps = this.ps;
      return this.next;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'SetValue',
  extends: 'foam.parse.compiled.State',

  properties: [
    {
      name: 'value',
      final: true
    },
    {
      name: 'next',
      final: true
    }
  ],

  methods: [
      function step() {
      var ps = this.ps.setValue(this.value[0]);
      this.next.ps = ps;
      return this.next;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'StartValue',
  extends: 'foam.parse.compiled.State',

  properties: [
    {
      name: 'next',
      final: true
    },
    {
      name: 'value',
      final: true
    }
  ],

  methods: [
    function step() {
      this.value.length = 0;
      this.next.ps = this.ps;
      return this.next;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'AddValue',
  extends: 'foam.parse.compiled.State',

  properties: [
    {
      name: 'value',
      final: true
    },
    {
      name: 'next',
      final: true
    }
  ],

  methods: [
    function step() {
      this.value.push(this.ps.value);
      this.next.ps = this.ps;
      return this.next;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'FinishValue',
  extends: 'foam.parse.compiled.State',

  properties: [
    {
      name: 'value',
      final: true
    },
    {
      name: 'next',
      final: true
    }
  ],

  methods: [
    function step() {
      //      pps[0] = pps[0].setValue(this.value);
      this.next.ps = this.ps.setValue(this.value);
      return this.next;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Literal',

  properties: [
    {
      name: 's',
      final: true
    },
    {
      name: 'value',
      final: true
    }
  ],

  methods: [
    function compile(success, fail, withValue) {
      return withValue ?
        foam.parse.compiled.LiteralWithValue.create({
          s: this.s,
          value: this.value !== undefined ? this.value : this.s,
          success: success,
          fail: fail
        }) :
      foam.parse.compiled.LiteralWithValue.create({
        s: this.s,
        success: success,
        fail: fail
      });
    },

    function parse(ps) {
      var str = this.s;
      for ( var i = 0 ; i < str.length ; i++, ps = ps.tail ) {
        if ( str.charAt(i) !== ps.head ) {
          return undefined;
        }
      }
      return ps.setValue(this.value !== undefined ? this.value : str);
    },

    function toString() {
      return '"' + this.s + '"';
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'LiteralIC',

  properties: [
    {
      name: 's',
      final: true,
      postSet: function(old, nu) {
        this.lower = nu.toLowerCase();
      }
    },
    {
      name: 'lower',
      final: true
    },
    {
      name: 'value',
      final: true
    }
  ],

  methods: [
    function compile(success, fail, withValue) {
      return withValue ?
        foam.parse.compiled.LiteralICWithValue.create({
          s: this.s,
          value: this.value !== undefined ? this.value : this.s,
          success: success,
          fail: fail
        }) :
      foam.parse.compiled.LiteralICWithValue.create({
        s: this.s,
        success: success,
        fail: fail
      });
    },

    function parse(ps) {
      var str = this.lower;
      for ( var i = 0 ; i < str.length ; i++, ps = ps.tail ) {
        if ( ! ps.head || str.charAt(i) !== ps.head.toLowerCase() ) {
          return undefined;
        }
      }
      return ps.setValue(this.value !== undefined ? this.value : this.s);
    },

    function toString() {
      return 'ignoreCase("' + this.lower + '")';
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Alternate',

  properties: [
    {
      name: 'args',
      final: true,
      class: 'foam.parse.ParserArray'
    }
  ],

  methods: [
    function compile(success, fail, withValue, grammar) {
      var alt = [];
      var fails = [];
      var args = this.args;

      for ( var i = 0 ; i < args.length ; i++ ) {
        fails[i] = foam.parse.compiled.Placeholder.create();
        alt[i] = args[i].compile(success, fails[i], withValue, grammar);
      }

      for ( i = 0 ; i < alt.length ; i++ ) {
        fails[i].next = alt[i + 1] || fail;
      }

      return alt[0];
    },

    function parse(ps, obj) {
      // TODO(adamvy): Should we remove the obj argument in favour of
      // passing the obj along via context or something?
      var args = this.args;
      for ( var i = 0, p ; p = args[i] ; i++ ) {
        var ret = p.parse(ps, obj);
        if ( ret ) return ret;
      }
      return undefined;
    },

    function toString() {
      var args = this.args;
      var strs = new Array(args.length);
      for ( var i = 0; i < args.length; i++ ) {
        strs[i] = args[i].toString();
      }
      return 'alt(' + strs.join(', ') + ')';
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Sequence',

  properties: [
    {
      name: 'args',
      final: true,
      class: 'foam.parse.ParserArray'
    }
  ],

  methods: [
    function compile(success, fail, withValue, grammar) {
      var restore = foam.parse.compiled.BacktrackFinish.create({
        next: fail
      });
      var capture = foam.parse.compiled.BacktrackStart.create({
        restore: restore
      });

      var value = [];

      var args = this.args;
      var successes = [];
      var seq = [];
      for ( var i = 0 ; i < args.length ; i++ ) {
        successes[i] = foam.parse.compiled.Placeholder.create();
        seq[i] = args[i].compile(
          withValue ?
            foam.parse.compiled.AddValue.create({
              value: value,
              next: successes[i]
            }) :
            successes[i],
          restore,
          withValue,
          grammar);
      }

      success = withValue ?
        foam.parse.compiled.FinishValue.create({value: value, next: success}) :
        success;

      for ( i = 0 ; i < seq.length ; i++ ) {
        successes[i].next = seq[i + 1] || success;
      }

      capture.next = seq[0];

      return withValue ?
        foam.parse.compiled.StartValue.create({value: value, next: capture}) :
        capture;
    },

    function parse(ps, obj) {
      var ret = [];
      var args = this.args;
      for ( var i = 0, p ; p = args[i] ; i++ ) {
        if ( ! ( ps = p.parse(ps, obj) ) ) return undefined;
        ret.push(ps.value);
      }
      return ps.setValue(ret);
    },

    function toString() {
      var args = this.args;
      var strs = new Array(args.length);
      for ( var i = 0; i < args.length; i++ ) {
        strs[i] = args[i].toString();
      }
      return 'seq(' + strs.join(', ') + ')';
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'String',
  extends: 'foam.parse.ParserDecorator',
  methods: [
    function parse(ps, obj) {
      ps = this.p.parse(ps, obj);
      return ps ? ps.setValue(ps.value.join('')) : undefined;
    },

    function toString() {
      return 'str(' + this.SUPER() + ')';
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Sequence1',

  properties: [
    {
      name: 'args',
      final: true,
      class: 'foam.parse.ParserArray'
    },
    {
      name: 'n',
      final: true
    }
  ],

  methods: [
    function compile(success, fail, withValue, grammar) {
      var restore = foam.parse.compiled.BacktrackFinish.create({
        next: fail
      });
      var capture = foam.parse.compiled.BacktrackStart.create({
        restore: restore
      });

      var value = [];

      var args = this.args;
      var successes = [];
      var seq = [];
      for ( var i = 0 ; i < args.length ; i++ ) {
        successes[i] = foam.parse.compiled.Placeholder.create();
        seq[i] = args[i].compile((withValue && i === this.n) ?
            foam.parse.compiled.GetValue.create({
              value: value,
              next: successes[i]
            }) : successes[i],
            restore,
            withValue,
            grammar);
      }

      success = withValue ?
        foam.parse.compiled.SetValue.create({value: value, next: success}) :
        success;

      for ( i = 0 ; i < seq.length ; i++ ) {
        successes[i].next = seq[i + 1] || success;
      }

      capture.next = seq[0];

      return capture;
    },

    function parse(ps, obj) {
      var ret;
      var args = this.args;
      var n = this.n;
      for ( var i = 0, p ; p = args[i] ; i++ ) {
        if ( ! ( ps = p.parse(ps, obj) ) ) return undefined;
        if ( i === n ) ret = ps.value;
      }
      return ps.setValue(ret);
    },

    function toString() {
      var args = this.args;
      var strs = new Array(args.length);
      for ( var i = 0; i < args.length; i++ ) {
        strs[i] = args[i].toString();
      }
      return 'seq1(' + this.n + ', ' + strs.join(', ') + ')';
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Optional',
  extends: 'foam.parse.ParserDecorator',

  methods: [
    function compile(success, fail, withValue, grammar) {
      return this.p.compile(success, success, withValue, grammar);
    },

    function parse(ps, obj) {
      return this.p.parse(ps, obj) || ps.setValue(null);
    },

    function toString() {
      return 'opt(' + this.SUPER() + ')';
    }
  ],
});


foam.CLASS({
  package: 'foam.parse',
  name: 'AnyChar',

  axioms: [ foam.pattern.Singleton.create() ],

  methods: [
    function compile(success, fail) {
      return foam.parse.compiled.AnyChar.create({
        success: success,
        fail: fail
      });
    },

    function parse(ps) {
      return ps.head ? ps.tail : undefined;
    },

    function toString() { return 'anyChar()'; }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'NotChars',

  properties: [
    {
      name: 'string',
      final: true
    }
  ],

  methods: [
    function compile(success, fail) {
      return foam.parse.compiled.ParserState.create({
        parser: this,
        success: success,
        fail: fail
      });
    },

    function parse(ps) {
      return ps.head && this.string.indexOf(ps.head) === -1 ?
        ps.tail : undefined;
    },

    function toString() {
      var str = this.string;
      var chars = new Array(str.length);
      for ( var i = 0; i < str.length; i++ ) {
        chars[i] = str.charAt(i);
      }
      return 'notChars("' + chars.join('", "') + '")';
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Range',

  properties: [
    {
      name: 'from',
      final: true
    },
    {
      name: 'to',
      final: true
    }
  ],

  methods: [
    function compile(success, fail) {
      return foam.parse.compiled.Range.create({
        from: this.from,
        to: this.to,
        success: success,
        fail: fail
      });
    },

    function parse(ps) {
      if ( ! ps.head ) return undefined;
      return ( this.from <= ps.head && ps.head <= this.to ) ?
          ps.tail.setValue(ps.head) :
          undefined;
    },

    function toString() {
      return 'range("' + this.from + '", "' + this.to + '")';
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Repeat',
  extends: 'foam.parse.ParserDecorator',

  properties: [
    {
      class: 'foam.parse.ParserProperty',
      name: 'delimiter'
    },
    {
      class: 'Int',
      name: 'minimum'
    }
  ],

  methods: [
    function compile(success, fail, withValue, grammar) {
      var pSuccess = foam.parse.compiled.Placeholder.create();
      var pFail = foam.parse.compiled.Placeholder.create();
      var p = this.p.compile(pSuccess, pFail, withValue, grammar);

      var delimSuccess = foam.parse.compiled.Placeholder.create();
      var delimFail = foam.parse.compiled.Placeholder.create();

      var delim;
      if ( this.delimiter ) {
        delim = this.delimiter.compile(delimSuccess, delimFail, false, grammar);
      } else {
        delim = foam.parse.compiled.Placeholder.create({
          next: delimSuccess
        });
      }

      var start = p;

      if ( this.minimum > 0 ) {
        var count = [];

        start = foam.parse.compiled.CounterStart.create({
          count: count,
          next: start
        });

        pSuccess.next = foam.parse.compiled.Counter.create({
          count: count
        });
        pSuccess = pSuccess.next;

        success = foam.parse.compiled.MinimumCount.create({
          count: count,
          minimum: this.minimum,
          success: success,
          fail: fail
        });
      }

      if ( withValue ) {
        var value = [];

        pSuccess.next = foam.parse.compiled.AddValue.create({
          value: value
        });
        pSuccess = pSuccess.next;

        start = foam.parse.compiled.StartValue.create({
          value: value,
          next: start
        });

        success = foam.parse.compiled.FinishValue.create({
          value: value,
          next: success
        });
      }

      pSuccess.next = delim;
      delimSuccess.next = p;
      delimFail.next = success;

      pFail.next = success;

      return start;
    },

    function parse(ps, obj) {
      var ret = [];
      var p = this.p;
      var last;
      while ( ps ) {
        last = ps;
        ps = p.parse(ps, obj);
        if ( ps ) ret.push(ps.value);
        if ( this.delimiter && ps ) {
          ps = this.delimiter.parse(ps, obj) || ps;
        }
      }

      if ( this.minimum > 0 && ret.length < this.minimum ) return undefined;
      return last.setValue(ret);
    },

    function toString() {
      var str = 'repeat(' + this.SUPER();
      if ( this.delimiter ) str += ', ' + this.delimiter;
      if ( this.minimum ) str += ', ' + this.minimum;
      str += ')';
      return str;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Plus',
  extends: 'foam.parse.Repeat',

  properties: [
    ['minimum', 1]
  ],

  methods: [
    function toString() {
      var str = 'plus(' + this.p.toString();
      if ( this.delimiter ) str += ', ' + this.delimiter;
      str += ')';
      return str;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Repeat0',
  extends: 'foam.parse.Repeat',

  methods: [
    function compile(success, fail, withValue, grammar) {
      return this.SUPER(success, fail, false, grammar);
    },

    function parse(ps, obj) {
      var res;
      var p = this.p;
      while ( res = p.parse(ps, obj) ) ps = res;
      return ps.setValue('');
    },

    function toString() {
      var str = 'repeat0(' + this.p.toString();
      if ( this.delimiter ) str += ', ' + this.delimiter;
      if ( this.minimum ) str += ', ' + this.minimum;
      str += ')';
      return str;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Not',
  extends: 'foam.parse.ParserDecorator',

  properties: [
    {
      name: 'else',
      final: true,
      class: 'foam.parse.ParserProperty'
    }
  ],

  methods: [
    function compile(success, fail, withValue, grammar) {
      var restore = foam.parse.compiled.BacktrackFinish.create({
        next: fail
      });

      var capture = foam.parse.compiled.BacktrackStart.create({
        restore: restore
      });

      var e = this.else ?
          this.else.compile(
            success,
            fail,
            withValue,
            grammar) :
          success;

      var delegate = this.p.compile(restore, e, false, grammar);
      capture.next = delegate;
      return capture;
    },

    function parse(ps, obj) {
      return this.p.parse(ps, obj) ?
        undefined :
        (this.else ? this.else.parse(ps, obj) : ps);
    },

    function toString() {
      var str = 'not(' + this.SUPER();
      if ( this.else ) str += ', ' + this.else.toString();
      str += ')';
      return str;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'ParserWithAction',
  extends: 'foam.parse.ParserDecorator',

  properties: [
    'action'
  ],

  methods: [
    function compile(success, fail, withValue, grammar) {
      success = foam.parse.compiled.Action.create({
        action: this.action,
        success: success
      });
      return this.p.compile(success, fail, true, grammar);
    },

    function parse(ps, obj) {
      ps = this.p.parse(ps, obj);
      return ps ?
        ps.setValue(this.action(ps.value)) :
        undefined;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Symbol',

  properties: [
    {
      name: 'name',
      final: true
    },
    {
      class: 'Boolean',
      name: 'compiling',
      value: false
    },
    {
      name: 'compiled'
    }
  ],

  methods: [
    function compile(success, fail, withValue, grammar) {
      if ( this.compiling ) {
        var ret = foam.parse.compiled.Placeholder.create({
          name: 'symbol placeholder'
        });

        this.compiled(function(p) {
          ret.next = p;
        });

        return ret;
      }

      this.compiling = true;
      var future = (function() {
        var waiters = [];
        var value;
        var set = false;

        return {
          get: function(f) {
            if ( set ) {
              f(value);
              return;
            }

            waiters.push(f);
          },
          set: function(v) {
            set = true;
            value = v;

            for ( var i = 0 ; i < waiters.length ; i++ ) {
              waiters[i](value);
            }

            waiters = null;
          }
        };
      })();

      this.compiled = future.get;

      var compiled = grammar.getSymbol(this.name).compile(
          success, fail, withValue, grammar);

      future.set(compiled);

      this.compiling = false;
      this.compiled = null;

      return compiled;
    },

    function parse(ps, grammar) {
      var p = grammar.getSymbol(this.name);
      if ( ! p ) {
        console.error('No symbol found for', this.name);
        return undefined;
      }
      return p.parse(ps, grammar);
    },

    function toString() { return 'sym("' + this.name + '")'; }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Parsers',

  axioms: [ foam.pattern.Singleton.create() ],

  methods: [
    function seq() {
      return foam.lookup('foam.parse.Sequence').create({
        args: Array.from(arguments)
      });
    },

    function repeat0(p, delim, min) {
      return foam.lookup('foam.parse.Repeat0').create({
        p: p,
        minimum: min || 0,
        delimiter: delim
      });
    },

    function simpleAlt() {
      return foam.lookup('foam.parse.Alternate').create({
        args: Array.from(arguments)
      });
    },

    function alt() {
      return foam.lookup('foam.parse.Alternate').create({
        args: Array.from(arguments)
      });
    },

    function sym(name) {
      return foam.lookup('foam.parse.Symbol').create({
        name: name
      });
    },

    function seq1(n) {
      return foam.lookup('foam.parse.Sequence1').create({
        n: n,
        args: Array.from(arguments).slice(1)
      });
    },

    function repeat(p, delim, min) {
      return foam.lookup('foam.parse.Repeat').create({
        p: p,
        minimum: min || 0,
        delimiter: delim
      });
    },

    function plus(p, delim) {
      return foam.lookup('foam.parse.Plus').create({
        p: p,
        delimiter: delim
      });
    },

    function str(p) {
      return foam.lookup('foam.parse.String').create({
        p: p
      });
    },

    function range(a, b) {
      return foam.lookup('foam.parse.Range').create({
        from: a,
        to: b
      });
    },

    function notChars(s) {
      return foam.lookup('foam.parse.NotChars').create({
        string: s
      });
    },

    function not(p, opt_else) {
      return foam.lookup('foam.parse.Not').create({
        p: p,
        else: opt_else
      });
    },

    function optional(p) {
      return foam.lookup('foam.parse.Optional').create({
        p: p
      });
    },

    function literal(s, value) {
      return foam.lookup('foam.parse.Literal').create({
        s: s,
        value: value
      });
    },

    function literalIC(s, value) {
      return foam.lookup('foam.parse.LiteralIC').create({
        s: s,
        value: value
      });
    },

    function anyChar() {
      return foam.parse.AnyChar.create();
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'PSymbol',

  properties: ['name', 'parser']
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Grammar',

  requires: [
    'foam.parse.StringPS',
    'foam.parse.Parsers'
  ],

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.parse.PSymbol',
      name: 'symbols',
      adapt: function(_, o) {
        if ( Array.isArray(o) ) return o;

        if ( typeof o === 'function' ) {
          var args = o.toString().match(/\((.*?)\)/);
          if ( ! args ) {
            throw 'Could not parse arguments from parser factory function';
          }

          o = foam.Function.withArgs(o, this.Parsers.create(), this);
        }

        var a = [];
        for ( var key in o ) {
          a.push(foam.parse.PSymbol.create({
            name: key,
            parser: o[key]
          }));
        }
        return a;
      }
    },
    {
      name: 'symbolMap_',
      expression: function(symbols) {
        var m = {};
        for ( var i = 0 ; i < symbols.length ; i++ ) {
          if ( m[symbols[i].name] ) {
            console.error('Duplicate symbol found', symbols[i].name);
          }
          m[symbols[i].name] = symbols[i];
        }
        return m;
      }
    },
    {
      name: 'finishSuccess',
      factory: function() {
        return {};
      }
    },
    {
      name: 'finishFail',
      factory: function() {
        return {};
      }
    },
    {
      name: 'compiled',
      expression: function(symbolMap_) {
        return symbolMap_.START.parser.compile(
          this.finishSuccess,
          this.finishFail,
          false,
          this);
      }
    },
    {
      name: 'ps',
      factory: function() {
        return this.StringPS.create();
      }
    }
  ],

  methods: [
    function parseString(str) {
      this.ps.setString(str);
      var state = this.compiled;
      state.ps = this.ps;
      var success = this.finishSuccess;
      var fail = this.finishFail;
      return this.parse(this.ps, state, success, fail);
    },

    function parse(ps, state, success, fail) {
      while ( state !== success && state !== fail ) {
        state = state.step();
      }
      if ( state === success ) return state.ps.value;
    },

    function getSymbol(name) {
      return this.symbolMap_[name].parser;
    },

    function addActions(map) {
      for ( var key in map ) {
        this.addAction(key, map[key]);
      }
      return this;
    },

    function addAction(name, action) {
      for ( var i = 0 ; i < this.symbols.length ; i++ ) {
        if ( this.symbols[i].name === name ) {
          this.symbols[i].parser = foam.parse.ParserWithAction.create({
            p: this.symbols[i].parser,
            action: action
          });
        }
      }

      // TODO(adamvy): Array property should help me here
      this.pub('propertyChange', 'symbols', this.slot('symbols'));
      return this;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'ImperativeGrammar',
  extends: 'foam.parse.Grammar',

  methods: [
    function parseString(str, opt_name) {
      opt_name = opt_name || 'START';

      this.ps.setString(str);
      var start = this.getSymbol(opt_name);
      foam.assert(start, 'No symbol found for', opt_name);

      var result = start.parse(this.ps, this);
      return result && result.value;
    }
  ]
});

/*
TODO(adamvy):
  -detect non string values passed to StringPS.setString()
*/
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

foam.CLASS({
  package: 'foam.templates',
  name: 'TemplateOutput',

  documentation: 'A buffer for storing Template output.',

  properties: [
    {
      name: 'buf',
      factory: function() { return []; }
    }
  ],

  methods: [
    function output() {
      for ( var i = 0 ; i < arguments.length ; i++ ) {
        var o = arguments[i];

        if ( typeof o === 'object' ) {
          this.buf.push(o.toString());
        } else {
          this.buf.push(o);
        }
      }
    },

    function toString() {
      return this.buf.length == 0 ? '' :
        this.buf.length == 1 ? this.buf[0] :
        this.buf.join('');
    }
  ]
});


foam.CLASS({
  package: 'foam.templates',
  name: 'TemplateUtil',

  documentation: 'Utility methods for working with Templates. Mostly just for internal use.',

  axioms: [ foam.pattern.Singleton.create() ],

  requires: [
    'foam.parse.ImperativeGrammar as Grammar'
  ],

  constants: {
    HEADER: 'var self = this, ctx = this.__context__, Y = this.__subContext__;\n' +
      'var output = opt_outputter ? opt_outputter : TOC(this);\n' +
      'var out = output.output.bind(output);\n' +
      "out('",
    FOOTER: "');\nreturn opt_outputter ? output : output.toString();\n"
  },

  properties: [
    {
      name: 'grammar',
      factory: function() {
        var g = this.Grammar.create({
          symbols: function(repeat0, simpleAlt, sym, seq1, seq, repeat, notChars, anyChar, not, optional, literal) {
            return {
              START: sym('markup'),

              markup: repeat0(simpleAlt(
                sym('comment'),
                sym('simple value'),
                sym('raw values tag'),
                sym('code tag'),
                sym('ignored newline'),
                sym('newline'),
                sym('single quote'),
                sym('text')
              )),

              'comment': seq1(1, '<!--', repeat0(not('-->', anyChar())), '-->'),

              'simple value': seq('%%', repeat(notChars(' ()-"\r\n><:;,')), optional('()')),

              'raw values tag': simpleAlt(
                seq('<%=', repeat(not('%>', anyChar())), '%>')
              ),

              'code tag': seq('<%', repeat(not('%>', anyChar())), '%>'),
              'ignored newline': simpleAlt(
                literal('\\\r\\\n'),
                literal('\\\n')
              ),
              newline: simpleAlt(
                literal('\r\n'),
                literal('\n')
              ),
              'single quote': literal("'"),
              text: anyChar()
            }
          }
        });

        var self = this;

        g.addActions({
          markup: function(v) {
            var wasSimple = self.simple;
            var ret = wasSimple ? null : self.out.join('');
            self.out = [];
            self.simple = true;
            return [wasSimple, ret];
          },
          'simple value': function(v) {
            self.push("',\n self.",
                v[1].join(''),
                v[2],
                ",\n'");
          },
          'raw values tag': function (v) {
            self.push("',\n",
                v[1].join(''),
                ",\n'");
          },
          'code tag': function (v) {
            self.push("');\n",
                v[1].join(''),
                ";out('");
          },
          'single quote': function() {
            self.push("\\'");
          },
          newline: function() {
            self.push('\\n');
          },
          text: function(v) {
            self.pushSimple(v);
          }
        });
        return g;
      }
    },
    {
      name: 'out',
      factory: function() { return []; }
    },
    {
      name: 'simple',
      value: true
    }
  ],

  methods: [
    function push() {
      this.simple = false;
      this.pushSimple.apply(this, arguments);
    },

    function pushSimple() {
      this.out.push.apply(this.out, arguments);
    },

    function compile(t, name, args) {
      var result = this.grammar.parseString(t);
      if ( ! result ) throw "Error parsing template " + name;

      var code = this.HEADER +
          ( result[0] ? t : result[1] ) +
          this.FOOTER;

      var newArgs = ['opt_outputter'].concat(args.map(function(a) { return a.name }));
      var f = eval(
        '(function() { ' +
          'var TOC = function(o) { return foam.templates.TemplateOutput.create(); };' +
          'var f = function(' + newArgs.join(',') + '){' + code + '};' +
          'return function() { '+
          'if ( arguments.length && arguments[0] && ! arguments[0].output ) return f.apply(this, [undefined].concat(Array.from(arguments)));' +
          'return f.apply(this, arguments);};})()');

      return f;
    },

    function lazyCompile(t, name, args) {
      return (function(util) {
        var delegate;
        return function() {
          if ( ! delegate ) delegate = util.compile(t, name, args)
          return delegate.apply(this, arguments);
        };
      })(this);
    }
  ]
});


foam.CLASS({
  package: 'foam.templates',
  name: 'TemplateAxiom',
  extends: 'Method',

  properties: [
    {
      name: 'template',
      class: 'String'
    },
    { name: 'code', required: false },
    'args'
  ],

  methods: [
    function installInProto(proto) {
      proto[this.name] =
          foam.templates.TemplateUtil.create().lazyCompile(
              this.template, this.name, this.args || []);
    }
  ]
});


foam.CLASS({
  package: 'foam.templates',
  name: 'TemplateExtension',
  refines: 'foam.core.Model',

  properties: [
    {
      name: 'templates',
      class: 'AxiomArray',
      of: 'foam.templates.TemplateAxiom',
      adaptArrayElement: function(o, prop) {
        return foam.lookup(prop.of).create(o);
      }
    }
  ]
});
/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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

foam.locale = foam.locale || 'en';

foam.CLASS({
  package: 'foam.i18n',
  name: 'MessageAxiom',

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'description'
    },
    {
      class: 'Object',
      name: 'messageMap',
      help: 'Map of language codes to the message in that language.',
      factory: function() { return {}; }
    },
    {
      class: 'String',
      name: 'message',
      getter: function() { return this.message_ || this.messageMap[foam.locale]; },
      setter: function(m) { this.message_ = this.messageMap[foam.locale] = m; }
    },
    {
      class: 'Simple',
      name: 'message_'
    }
  ],

  methods: [
    function installInClass(cls) {
      Object.defineProperty(
        cls,
        this.name,
        {
          value: this.message,
          configurable: false
        });
    },

    function installInProto(proto) {
      this.installInClass(proto);
    }
  ]
});


foam.CLASS({
  package: 'foam.i18n',
  name: 'MessagesExtension',
  refines: 'foam.core.Model',

  properties: [
    {
      name: 'messages',
      class: 'AxiomArray',
      of: 'foam.i18n.MessageAxiom'
    }
  ]
});
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
  Actions are high-level executable behaviours that are typically
  triggered by users and represented as buttons or menus.

  Actions are installed as methods on the class, but contain more
  meta-information than regular methods. Meta-information includes
  information needed to surface to action in a meaningful way to
  users, and includes things like the label to appear in the button
  or menu, a speech-label for i18n, help text, dynamic functions to
  enable or disable and hide or unhide the UI associated with this Action.

  Actions implement the Action Design Pattern.
*/
foam.CLASS({
  package: 'foam.core',
  name: 'Action',

  documentation: 'An Action is a method with extra GUI support.',

  properties: [
    {
      class: 'String',
      name: 'name',
      required: true
    },
    {
      class: 'String',
      name: 'label',
      expression: function(name) { return foam.String.labelize(name); }
    },
    {
      class: 'String',
      name: 'speechLabel',
      expression: function(label) { return label; }
    },
    {
      name: 'icon'
    },
    {
      class: 'Array',
      name: 'keyboardShortcuts'
    },
    {
      class: 'String',
      name: 'help'
    },
    {
      class: 'Boolean',
      name: 'isDefault',
      help: 'Indicates if this is the default action.',
      value: false
    },
    {
      class: 'Function',
      name: 'isAvailable',
      label: 'Available',
      help: 'Function to determine if action is available.',
      value: null
    },
    {
      class: 'Function',
      name: 'isEnabled',
      label: 'Enabled',
      help: 'Function to determine if action is enabled.',
      value: null
    },
    {
      class: 'Function',
      name: 'code',
      required: true,
      value: null
    }
  ],

  methods: [
    function isEnabledFor(data) {
      return this.isEnabled ?
        foam.Function.withArgs(this.isEnabled, data) :
        true;
    },

    function createIsEnabled$(data$) {
      return foam.core.ExpressionSlot.create({
        obj$: data$,
        code: this.isEnabled
      });
    },

    function isAvailableFor(data) {
      return this.isAvailable ?
        foam.Function.withArgs(this.isAvailable, data) :
        true ;
    },

    function createIsAvailable$(data$) {
      return foam.core.ExpressionSlot.create({
        obj$: data$,
        code: this.isAvailable
      });
    },

    function maybeCall(ctx, data) {
      if ( this.isEnabledFor(data) && this.isAvailableFor(data) ) {
        this.code.call(data, ctx, this);
        data && data.pub('action', this.name, this);
        return true;
      }

      return false;
    },

    function installInClass(c) {
      c.installConstant(this.name, this);
    },

    function installInProto(proto) {
      var action = this;
      proto[this.name] = function() {
        return action.maybeCall(this.__context__, this);
      };
    }
  ]
});


/** Add Action support to Model. */
foam.CLASS({
  refines: 'foam.core.Model',

  properties: [
    {
      class: 'AxiomArray',
      of: 'Action',
      name: 'actions',
      adaptArrayElement: function(o, prop) {
        return typeof o === 'function' ?
            foam.core.Action.create({name: o.name, code: o}) :
            foam.lookup(prop.of).create(o) ;
      }
    }
  ]
});
foam.CLASS({
  package: 'foam.core',
  name: 'Reaction',
  properties: [
    {
      name: 'name',
      expression: function(target, topic, listener) {
        return 'reaction_' + target +  '$$' + topic + '$$' + listener;
      }
    },
    {
      class: 'String',
      name: 'target'
    },
    {
      class: 'StringArray',
      name: 'topic'
    },
    {
      name: 'listener'
    },
  ],
  methods: [
    function initObject(obj) {
      var listener = obj[this.listener];
      var topic = this.topic;

      if ( this.target === '' ) {
        obj.onDetach(obj.sub.apply(obj, this.topic.concat(obj[listener])));
        return;
      }

      var path = this.target.split('.');

      var slot = obj;

      for ( var i = 0 ; i < path.length ; i++ ) {
        slot = slot.dot(path[i]);
      }

      if ( topic.length ) {
        var l = listener;
        var prevSub;
        var args = topic.concat(l);

        listener = function() {
          prevSub && prevSub.detach();
          var target = slot.get();
          if ( target ) {
            obj.onDetach(prevSub = target.sub.apply(target, args));
          }
        };

        listener();
      }

      obj.onDetach(slot.sub(listener));
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.Model',
  properties: [
    {
      class: 'AxiomArray',
      name: 'reactions',
      of: 'foam.core.Reaction',
      adaptArrayElement: function(e, prop) {
        return foam.Array.isInstance(e) ?
          foam.core.Reaction.create({target: e[0], topic: e[1].split('.'), listener: e[2] }) :
          e.class ? this.lookup(e.class).create(e, this) :
          foam.lookup(prop.of).create(e, this);
      }
    }
  ]
});
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

foam.INTERFACE({
  package: 'foam.core',
  name: 'Serializable',

  documentation:
      'Marker interface to indicate that a CLASS is serializble or not.'
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.util',
  name: 'Timer',

  documentation: 'Timer object. Useful for creating animations.',

  properties: [
    {
      class: 'Int',
      name: 'interval',
      help: 'Interval of time between updating time.',
      // units: 'ms',
      value: 10
    },
    {
      class: 'Int',
      name: 'i',
      value: 0
    },
    {
      class: 'Float',
      name: 'timeWarp',
      value: 1.0
    },
    {
      class: 'Int',
      name:  'duration',
      units: 'ms',
      value: -1
    },
    {
      class: 'Float',
      name: 'percent',
      value: 0
    },
    {
      class: 'Int',
      name:  'startTime',
      value: 0
    },
    {
      class: 'Int',
      name:  'time',
      help:  'The current time in milliseconds since epoch.',
      adapt: function(_, t) { return Math.ceil(t); },
      value: 0
    },
    {
      class: 'Int',
      name:  'second',
      help:  'The second of the current minute.',
      value: 0
    },
    {
      class: 'Int',
      name:  'minute',
      help:  'The minute of the current hour.',
      value: 0
    },
    {
      class: 'Int',
      name:  'hour',
      help:  'The hour of the current day.',
      value: 0
    },
    {
      class: 'Boolean',
      name: 'isStarted',
      hidden: true
    },
    {
      class: 'Int',
      name: 'startTime_',
      hidden: true
    }
  ],

  methods: [
    function cycle(frequency, a, b) {
      /**
         cycle(frequency)             - cycle between -1 and 1 frequency times a second
         cycle(frequency, amplitude)  - cycle between -amplitude and amplitude frequency times a second
         cycle(frequency, start, end) - cycle between start and end frequency times a second
      */
      var s = Math.sin(this.time/1000*frequency*Math.PI*2);
      if ( arguments.length === 1 ) return s;
      if ( arguments.length === 2 ) return s * a;
      return a + (1 + s) * (b-a)/2;
    }
  ],

  actions: [
    {
      name:  'start',
      help:  'Start the timer.',
      isEnabled: function(isStarted) { return ! isStarted; },
      code:      function() { this.isStarted = true; this.tick(); }
    },
    {
      name:  'step',
      help:  'Step the timer.',
      code: function() {
        this.i++;
        this.time  += this.interval * this.timeWarp;
        this.second = this.time /    1000 % 60 << 0;
        this.minute = this.time /   60000 % 60 << 0;
        this.hour   = this.time / 3600000 % 24 << 0;
      }
    },
    {
      name:  'stop',
      help:  'Stop the timer.',
      isEnabled: function(isStarted) { return isStarted; },
      code:      function() { this.isStarted = false; }
    }
  ],

  listeners: [
    {
      name: 'tick',
      isFramed: true,
      code: function(e) {
        if ( ! this.isStarted ) return;

        var prevTime = this.startTime_;
        this.startTime_ = Date.now();
        this.interval = Math.min(100, this.startTime_ - prevTime);
        this.step();
        this.tick();
      }
    }
  ]
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.memento',
  name: 'MementoMgr',

  documentation: 'Provide memento undo/redo support.',

  properties: [
    {
      name: 'memento'
    },
    {
      name: 'stack',
      factory: function() { return []; }
    },
    {
      name: 'redo',
      factory: function() { return []; }
    },
    'posFeedback_',
    {
      class: 'Int',
      name: 'position',
      postSet: function(_, n) {
        if ( this.posFeedback_ ) return;

        while ( n < this.stackSize_ ) this.back();
        while ( n > this.stackSize_ ) this.forth();
      }
    },
    'stackSize_',
    'redoSize_',
    'totalSize_'
  ],

  methods: [
    function init() {
      this.memento$.sub(this.onMementoChange);
    },

    function updateSizes() {
      this.posFeedback_  = true;
      this.stackSize_    = this.stack.length;
      this.redoSize_     = this.redo.length;
      this.totalSize_    = this.stack.length + this.redo.length;
      this.position      = this.stack.length;
      this.posFeedback_  = false;
    },

    function remember(memento) {
      this.dumpState('preRemember');
      this.stack.push(memento);
      this.updateSizes();
      this.dumpState('postRemember');
    },

    function restore(memento) {
      this.dumpState('preRestore');
      this.ignore_ = true;
      this.memento = memento;
      this.ignore_ = false;
      this.dumpState('postRestore');
    },

    function dumpState(spot) {
      // Uncomment for debugging
      /*
      console.log('--- ', spot);
      console.log('stack: ', JSON.stringify(this.stack));
      console.log('redo: ', JSON.stringify(this.redo));
      */
    }
  ],

  actions: [
    {
      name:  'back',
      label: ' <-- ',
      help:  'Go to previous view',

      isEnabled: function(stackSize_) { return !! stackSize_; },
      code: function() {
        this.dumpState('preBack');
        this.redo.push(this.memento);
        this.restore(this.stack.pop());
        this.updateSizes();
        this.dumpState('postBack');
      }
    },
    {
      name:  'forth',
      label: ' --> ',
      help:  'Undo the previous back.',

      isEnabled: function(redoSize_) { return !! redoSize_; },
      code: function() {
        this.dumpState('preForth');
        this.remember(this.memento);
        this.restore(this.redo.pop());
        this.updateSizes();
        this.dumpState('postForth');
      }
    }
  ],

  listeners: [
    function onMementoChange(_,__,___,memento$) {
      if ( this.ignore_ ) return;

      // console.log('MementoMgr.onChange', oldValue, newValue);
      this.remember(memento$.oldValue);
      this.redo = [];
      this.updateSizes();
    }
  ]
});
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

foam.CLASS({
  package: 'foam.input',
  name: 'TouchEvent',

  properties: [
    {
      class: 'Float',
      name: 'x'
    },
    {
      class: 'Float',
      name: 'y'
    },
    {
      class: 'Boolean',
      name: 'claimed',
      value: false
    }
  ]
});


foam.CLASS({
  package: 'foam.input',
  name: 'Mouse',

  topics: [
    'down',
    'up',
    'move',
    'touch'
  ],

  properties: [
    'lastTouch',
    'x',
    'y',
    {
      name: 'element',
      postSet: function(old, e) {
        if ( old ) {
          old.removeEventListener('mousedown', this.onMouseDown);
          old.removeEventListener('mouseup',   this.onMouseUp);
          old.removeEventListener('mousemove', this.onMouseMove);
        }
        e.addEventListener('mousedown', this.onMouseDown);
        e.addEventListener('mouseup',   this.onMouseUp);
        e.addEventListener('mousemove', this.onMouseMove);
      }
    }
  ],

  methods: [
    function install(element) {
      this.ref = element;
    }
  ],

  listeners: [
    {
      name: 'onMouseDown',
      code: function(e) {
        var bounds = this.element.getBoundingClientRect();

        this.x = e.clientX - bounds.left;
        this.y = e.clientY - bounds.top;

        this.down.pub();

        if ( this.touch.hasListeners() ) {
          if ( this.lastTouch ) this.lastTouch.detach();

          this.lastTouch = foam.input.TouchEvent.create();
          this.lastTouch.onDetach(this.lastTouch.x$.follow(this.x$));
          this.lastTouch.onDetach(this.lastTouch.y$.follow(this.y$));

          this.touch.pub(this.lastTouch);

          if ( this.lastTouch && this.lastTouch.claimed ) e.preventDefault();
        }
      }
    },
    {
      name: 'onMouseUp',
      code: function(e) {
        this.up.pub();

        if ( this.lastTouch ) {
          this.lastTouch.detach();
          this.lastTouch = undefined;
        }
      }
    },
    {
      name: 'onMouseMove',
      code: function(e) {
        if ( this.lastTouch ||
             this.hasListeners('propertyChange') ||
             this.move.hasListeners() ) {

          var bounds = this.element.getBoundingClientRect();

          this.x = e.clientX - bounds.left;
          this.y = e.clientY - bounds.top;

          this.move.pub();

          if ( this.lastTouch && this.lastTouch.claimed ) e.preventDefault();
        }
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.input',
  name: 'Touch',

  topics: [
    'touch'
  ],

  properties: [
    {
      name: 'touches',
      factory: function() { return {}; }
    },
    {
      name: 'element',
      postSet: function(old, e) {
        if ( old ) {
          old.removeEventListener('touchstart', this.onTouchStart);
          old.removeEventListener('touchmove',  this.onTouchMove);
          old.removeEventListener('touchend',   this.onTouchEnd);
        }
        e.addEventListener('touchstart', this.onTouchStart);
        e.addEventListener('touchmove',  this.onTouchMove);
        e.addEventListener('touchend',   this.onTouchEnd);
      }
    }
  ],

  listeners: [
    function onTouchStart(e) {
      var newTouches = e.changedTouches;
      var bounds     = this.element.getBoundingClientRect();

      for ( var i = 0 ; i < newTouches.length ; i++ ) {
        var touch = newTouches.item(i);

        var touchEvent = foam.input.TouchEvent.create({
          x: touch.clientX - bounds.left,
          y: touch.clientY - bounds.top
        });

        this.touch.pub(touchEvent);
        if ( touchEvent.claimed ) e.preventDefault();

        this.touches[touch.identifier] = touchEvent;
      }
    },

    function onTouchMove(e) {
      var changed = e.changedTouches;
      var bounds  = this.element.getBoundingClientRect();

      for ( var i = 0 ; i < changed.length ; i++ ) {
        var touch = changed.item(i);

        var event = this.touches[touch.identifier];
        event.x = touch.clientX - bounds.left;
        event.y = touch.clientY - bounds.top;
        if ( event.claimed ) e.preventDefault();
      }
    },

    function onTouchEnd(e) {
      var changed = e.changedTouches;
      for ( var i = 0 ; i < changed.length ; i++ ) {
        var touch = changed.item(i);

        this.touches[touch.identifier].detach();
        delete this.touches[touch.identifier];
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.input',
  name: 'Pointer',

  requires: [
    'foam.input.Mouse',
    'foam.input.Touch'
  ],

  topics: [
    'touch'
  ],

  properties: [
    {
      name: 'element',
      required: true
    },
    {
      name: 'mouseInput',
      factory: function() {
        var m = this.Mouse.create();
        this.onDetach(m.element$.follow(this.element$));
        this.onDetach(m.touch.sub(this.onTouch));
      }
    },
    {
      name: 'touchInput',
      factory: function() {
        var t = this.Touch.create();
        this.onDetach(t.element$.follow(this.element$));
        this.onDetach(t.touch.sub(this.onTouch));
      }
    }
  ],

  methods: [
    function init() {
      // Assigning to unused variables to make Closure happy.
      var mi = this.mouseInput;
      var ti = this.touchInput;
    }
  ],

  listeners: [
    function onTouch(e, _, t) {
      this.touch.pub(t);
    }
  ]
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.u2',
  name: 'AttrSlot',
  implements: [ 'foam.core.Slot' ],

  documentation: 'A Value bound to an Element attribute. Used to bind values to DOM.',

  properties: [
    {
      name: 'element',
      required: true
    },
    'value',
    [ 'property', 'value'  ],
    [ 'event',    'change' ]
  ],

  methods: [
    function get() {
      return this.element.getAttribute(this.property);
    },

    function set(value) {
      this.element.setAttribute(this.property, value);

      // The next line is necessary to fire a change event.
      // This is necessary because DOM isn't proper MVC and
      // doesn't fire a change event when the value is explicitly set.
      this.value = value;
    },

    function sub(l) {
      // TODO: remove listener on unsubscribe. But how?
      if ( ! this.hasListeners() ) {
        var self = this;
        this.element.on(this.event, function() {
          self.value = self.get();
        });
      }
      return this.SUPER('propertyChange', 'value', l);
    },

    function toString() {
      return 'AttrSlot(' + this.event + ', ' + this.property + ')';
    }
  ]
});
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

foam.CLASS({
  package: 'foam.u2',
  name: 'ViewSpec',
  extends: 'foam.core.Property',

  documentation: 'Set a ViewFactory to be a string containing a class name, ' +
      'a Class object, or a factory function(args, context). ' +
      'Useful for rowViews and similar.',

  axioms: [
    {
      installInClass: function(cls) {
        cls.createView = function(spec, args, self, ctx) {
          if ( foam.u2.Element.isInstance(spec) )
            return spec;

          if ( foam.core.Slot.isInstance(spec) )
            return spec;

          if ( spec && spec.toE )
            return spec.toE(args, ctx);

          if ( foam.Function.isInstance(spec) )
            return foam.u2.ViewSpec.createView(spec.call(self, args, ctx), args, self, ctx);

          if ( foam.Object.isInstance(spec) ) {
            var ret = spec.create ?
                spec.create(args, ctx) :
                ctx.lookup(spec.class).create(spec, ctx).copyFrom(args || {});

            foam.assert(foam.u2.Element.isInstance(ret), 'ViewSpec result must extend foam.u2.Element or be toE()-able.');

            return ret;
          }

          if ( foam.core.FObject.isSubClass(spec) ) {
            var ret = spec.create(args, ctx);

            foam.assert(foam.u2.Element.isInstance(ret), 'ViewSpec class must extend foam.u2.Element or be toE()-able.');

            return ret;
          }

          if ( foam.String.isInstance(spec) || spec === undefined || spec === null )
            return foam.u2.Element.create({ nodeName: spec || 'div' }, ctx);

          throw 'Invalid ViewSpec, must provide an Element, Slot, toE()-able, Function, {create: function() {}}, {class: \'name\'}, Class, or String, but received: ' + spec;
        };
      }
    }
  ],

  properties: [
    [ 'adapt', function(_, spec, prop) {
      return foam.String.isInstance(spec) ? { class: spec } : spec ;
    } ]
    /*
    [ 'toJSON', function(value) {
      Output as string if 'class' is only defined value.
    } ]
    */
  ]
});
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

/*
TODO:
 - Remove use of E() and replace with create-ing axiom to add same behaviour.
 - create 'inner' element which defaults to this. add() adds to inner to make
   creating borders simple
 - start('leftPanel') should work for locating pre-existing named spaces
 - start, tag, and add() should use standard helper method
 - Fix handling of Slots that return arrays.
 - Properly handle insertBefore_ of an element that's already been inserted?
*/

foam.ENUM({
  package: 'foam.u2',
  name: 'ControllerMode',

  documentation: 'CRUD controller modes: CREATE/VIEW/EDIT.',

  values: [
    { name: 'CREATE', label: 'Create' },
    { name: 'VIEW',   label: 'View'   },
    { name: 'EDIT',   label: 'Edit'   }
  ]
});


foam.ENUM({
  package: 'foam.u2',
  name: 'Visibility',

  documentation: 'View visibility mode combines with current ControllerModel to determine DisplayMode.',

  values: [
    { name: 'RW',       label: 'Read-Write' },
    { name: 'FINAL',    label: 'Final',     documentation: 'FINAL views are editable only in CREATE ControllerMode.' },
    { name: 'DISABLED', label: 'Disabled',  documentation: 'DISABLED views are visible but not editable.' },
    { name: 'RO',       label: 'Read-Only'  },
    { name: 'HIDDEN',   label: 'Hidden'     }
  ]
});


foam.ENUM({
  package: 'foam.u2',
  name: 'DisplayMode',

  documentation: 'View display mode; how or if a view is displayed.',

  values: [
    { name: 'RW',       label: 'Read-Write' },
    { name: 'DISABLED', label: 'Disabled'   },
    { name: 'RO',       label: 'Read-Only'  },
    { name: 'HIDDEN',   label: 'Hidden'     }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'Entity',
  // TODO: Make both Entity and Element extend a common base-Model (Node?)

  documentation: 'Virtual-DOM Entity.',

  properties: [
    {
      name: 'name',
      // parser: seq(alphaChar, repeat0(wordChar)),
      // TODO(adamvy): This should be 'pattern' or 'regex', if those are ever
      // added.
      assertValue: function(nu) {
        if ( ! nu.match(/^[a-z#]\w*$/i) ) {
          throw new Error('Invalid Entity name: ' + nu);
        }
      }
    }
  ],

  methods: [
    function output(out) { out('&', this.name, ';'); },
    function toE() { return this; }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'CSS',

  documentation: 'Axiom to install CSS.',

  properties: [
    {
      class: 'String',
      name: 'code'
    },
    {
      name: 'name',
      factory: function() { return 'CSS-' + this.$UID; }
    },
    {
      name: 'installedDocuments_',
      factory: function() { return new WeakMap(); }
    }
  ],

  methods: [
    function installInClass(cls) {
      // Install myself in this Window, if not already there.
      var oldCreate = cls.create;
      var axiom     = this;

      cls.create = function(args, opt_parent) {
        // TODO: move this functionality somewhere reusable
        var X = opt_parent ?
          ( opt_parent.__subContext__ || opt_parent.__context__ || opt_parent ) :
          foam.__context__;

        // Install our own CSS, and then all parent models as well.
        if ( ! axiom.installedDocuments_.has(X.document) ) {
          X.installCSS(axiom.expandCSS(this, axiom.code));
          axiom.installedDocuments_.set(X.document, true);
        }

        // Now call through to the original create.
        return oldCreate.call(this, args, X);
      };
    },

    function expandCSS(cls, text) {
      /* Performs expansion of the ^ shorthand on the CSS. */
      // TODO(braden): Parse and validate the CSS.
      // TODO(braden): Add the automatic prefixing once we have the parser.
      var base = '.' + foam.String.cssClassize(cls.id);
      return text.replace(/\^(.)/g, function(match, next) {
        var c = next.charCodeAt(0);
        // Check if the next character is an uppercase or lowercase letter,
        // number, - or _. If so, add a - because this is a modified string.
        // If not, there's no extra -.
        if ( (65 <= c && c <= 90) || (97 <= c && c <= 122) ||
            (48 <= c && c <= 57) || c === 45 || c === 95 ) {
          return base + '-' + next;
        }

        return base + next;
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'DefaultValidator',

  documentation: 'Default Element validator.',

  axioms: [ foam.pattern.Singleton.create() ],

  methods: [
    function validateNodeName(name) {
      return true;
    },

    function validateClass(cls) {
      // TODO
    },

    function validateAttributeName(name) {
      // TODO
    },

    function validateAttributeValue(value) {
      // TODO
    },

    function validateStyleName(name) {
      // TODO
    },

    function validateStyleValue(value) {
      // TODO
    },

    function sanitizeText(text) {
      if ( ! text ) return text;
      text = text.toString();
      return text.replace(/[&<"']/g, function(m) {
        switch ( m ) {
          case '&': return '&amp;';
          case '<': return '&lt;';
          case '"': return '&quot;';
          case "'": return '&#039';
        }
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'ElementState',

  documentation: 'Current lifecycle state of an Element.',

  methods: [
    function output(out) {},
    function load() {},
    function unload() {},
    function onRemove() {},
    // function detach() {},
    function onSetClass() {},
    function onFocus() {},
    function onAddListener() {},
    function onRemoveListener() {},
    function onSetStyle() {},
    function onSetAttr() {},
    function onRemoveAttr() {},
    function onAddChildren() {},
    function onInsertChildren() {},
    function onReplaceChild() {},
    function onRemoveChild() {},
    function getBoundingClientRect() {
      return {
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
        width: 0,
        height: 0
      };
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'UnloadedElementState',
  extends: 'foam.u2.ElementState',

  documentation: 'State of an unloaded Element.',

  methods: [
    function output(out) {
      this.state = this.OUTPUT;
      this.output_(out);
      return out;
    },
    function load() {
      this.error('Must output before loading.');
    },
    function unload() {
      this.error('Must output and load before unloading.');
    },
    function toString() { return 'UNLOADED'; }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'InitialElementState',
  extends: 'foam.u2.UnloadedElementState',

  documentation: 'Initial state of a newly created Element.',

  methods: [
    function output(out) {
      this.initE();
      return this.SUPER(out);
    },
    function toString() { return 'INITIAL'; }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'OutputElementState',
  extends: 'foam.u2.ElementState',

  documentation: 'State of Element after it has been output to DOM, but not yet loaded.',

  methods: [
    function output(out) {
      // TODO: raise a real error
      this.warn('ERROR: Duplicate output.');
      return this.UNLOADED.output.call(this, out);
    },
    function load() {
      if ( this.hasOwnProperty('elListeners') ) {
        var ls = this.elListeners;
        for ( var i = 0 ; i < ls.length ; i+=2 ) {
          this.addEventListener_(ls[i], ls[i+1]);
        }
      }

      this.visitChildren('load');
      this.state = this.LOADED;
      if ( this.focused ) this.el().focus();
      // Allows you to take the DOM element and map it back to a
      // foam.u2.Element object.  This is expensive when building
      // lots of DOM since it adds an extra DOM call per Element.
      // But you could use it to cut down on the number of listeners
      // in something like a table view by doing per table listeners
      // rather than per-row listeners and in the event finding the right
      // U2 view by walking the DOM tree and checking e_.
      // This could save more time than the work spent here adding e_ to each
      // DOM element.
      // this.el().e_ = this;
    },
    function unload() {
      this.state = this.UNLOADED;
      this.visitChildren('unload');
    },
    function error() {
      throw new Error('Mutations not allowed in OUTPUT state.');
    },
    function onSetClass(cls, enabled) { this.error(); },
    function onFocus(cls, enabled) { this.error(); },
    function onAddListener(topic, listener) { this.error(); },
    function onRemoveListener(topic, listener) { this.error(); },
    function onSetStyle(key, value) { this.error(); },
    function onSetAttr(key, value) { this.error(); },
    function onRemoveAttr(key) { this.error(); },
    function onAddChildren(c) { this.error(); },
    function onInsertChildren() { this.error(); },
    function onReplaceChild() { this.error(); },
    function onRemoveChild() { this.error(); },
    function toString() { return 'OUTPUT'; }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'LoadedElementState',
  extends: 'foam.u2.ElementState',

  documentation: 'State of an Element after it has been output to the DOM and loaded.',

  methods: [
    function output(out) {
      this.warn('Duplicate output.');
      return this.UNLOADED.output.call(this, out);
    },
    function load() { this.error('Duplicate load.'); },
    function unload() {
      if ( ! this.parentNode || this.parentNode.state === this.LOADED ) {
        var e = this.el();
        if ( e ) e.remove();
      }

      this.state = this.UNLOADED;
      this.visitChildren('unload');
    },
    function onRemove() { this.unload(); },
    function onSetClass(cls, enabled) {
      var e = this.el();
      if ( e ) {
        e.classList[enabled ? 'add' : 'remove'](cls);
      } else {
        this.warn('Missing Element: ', this.id);
      }
    },
    function onFocus() {
      this.el().focus();
    },
    function onAddListener(topic, listener) {
      this.addEventListener_(topic, listener);
    },
    function onRemoveListener(topic, listener) {
      this.addRemoveListener_(topic, listener);
    },
    function onSetStyle(key, value) {
      this.el().style[key] = value;
    },
    function onSetAttr(key, value) {
      if ( this.PSEDO_ATTRIBUTES[key] ) {
        this.el()[key] = value;
      } else {
        this.el().setAttribute(key, value === true ? '' : value);
      }
    },
    function onRemoveAttr(key) {
      if ( this.PSEDO_ATTRIBUTES[key] ) {
        this.el()[key] = '';
      } else {
        this.el().removeAttribute(key);
      }
    },
    function onAddChildren() {
      var e = this.el();
      if ( ! e ) {
        this.warn('Missing Element: ', this.id);
        return;
      }
      var out = this.createOutputStream();
      for ( var i = 0 ; i < arguments.length ; i++ ) {
        out(arguments[i]);
      }
      e.insertAdjacentHTML('beforeend', out);
      for ( var i = 0 ; i < arguments.length ; i++ ) {
        arguments[i].load && arguments[i].load();
      }
    },
    function onInsertChildren(children, reference, where) {
      var e = this.el();
      if ( ! e ) {
        this.warn('Missing Element: ', this.id);
        return;
      }
      var out = this.createOutputStream();
      for ( var i = 0 ; i < children.length ; i++ ) {
        out(children[i]);
      }

      reference.el().insertAdjacentHTML(where, out);

      // EXPERIMENTAL:
      // TODO(kgr): This causes some elements to get stuck in OUTPUT state
      // forever. It can be resurrected if that problem is fixed.
      // Load (mostly adding listeners) on the next frame
      // to allow the HTML to be shown more quickly.
      // this.__context__.window.setTimeout(function() {
      for ( var i = 0 ; i < children.length ; i++ ) {
        children[i].load && children[i].load();
      }
      // }, 33);
    },
    function onReplaceChild(oldE, newE) {
      var e = this.el();
      if ( ! e ) {
        this.warn('Missing Element: ', this.id);
        return;
      }
      var out = this.createOutputStream();
      out(newE);
      oldE.el().outerHTML = out.toString();
      newE.load && newE.load();
    },
    function onRemoveChild(child, index) {
      if ( typeof child === 'string' ) {
        this.el().childNodes[index].remove();
      } else {
        child.remove();
      }
    },
    function getBoundingClientRect() {
      return this.el().getBoundingClientRect();
    },
    function toString() { return 'LOADED'; }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'RenderSink',
  properties: [
    {
      class: 'Function',
      name: 'addRow'
    },
    {
      class: 'Function',
      name: 'cleanup'
    },
    'dao',
    {
      class: 'Int',
      name: 'batch'
    }
  ],
  methods: [
    function put(obj, s) {
      this.reset();
    },
    function remove(obj, s) {
      this.reset();
    },
    function reset() {
      this.paint();
    }
  ],
  listeners: [
    {
      name: 'paint',
      isMerged: 100,
      code: function() {
        var batch = ++this.batch;
        var self = this;
        this.dao.select().then(function(a) {
          // Check if this is a stale render
          if ( self.batch !== batch ) return;

          var objs = a.a;
          self.cleanup();
          for ( var i = 0 ; i < objs.length ; i++ ) {
            self.addRow(objs[i]);
          }
        });
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'Element',

  documentation: 'Virtual-DOM Element. Root model for all U2 UI components.',

  requires: [
    'foam.u2.AttrSlot',
    'foam.u2.DefaultValidator',
    'foam.u2.Entity',
    'foam.u2.ViewSpec'
  ],

  imports: [
    'document',
    'elementValidator',
    'framed',
    'getElementById'
  ],

  topics: [
    'onload',
    'onunload'
  ],

  constants: {
    // Psedo-attributes don't work consistently with setAttribute()
    // so need to be set on the real DOM element directly.
    PSEDO_ATTRIBUTES: {
      value: true,
      checked: true
    },

    DEFAULT_VALIDATOR: foam.u2.DefaultValidator.create(),

    // State of an Element after it has been output (to a String) but before it is loaded.
    // This should be only a brief transitory state, as the Element should be loaded
    // almost immediately after being output. It is an error to try and mutate the Element
    // while in the OUTPUT state.
    OUTPUT: foam.u2.OutputElementState.create(),

    // State of an Element after it has been loaded.
    // A Loaded Element should be visible in the DOM.
    LOADED: foam.u2.LoadedElementState.create(),

    // State of an Element after it has been removed from the DOM.
    // An unloaded Element can be readded to the DOM.
    UNLOADED: foam.u2.UnloadedElementState.create(),

    // Initial state of an Element before it has been added to the DOM.
    INITIAL: foam.u2.InitialElementState.create(),

    // ???: Add DESTROYED State?

    // TODO: Don't allow these as they lead to ambiguous markup.
    OPTIONAL_CLOSE_TAGS: {
      BODY: true,
      COLGROUP: true,
      DD: true,
      DT: true,
      HEAD: true,
      HTML: true,
      LI: true,
      OPTION: true,
      P: true,
      TBODY: true,
      TD: true,
      TFOOT: true,
      TH: true,
      THEAD: true,
      TR: true
    },

    // Element nodeName's that are self-closing.
    // Used to generate valid HTML output.
    // Used by ElementParser for valid HTML parsing.
    ILLEGAL_CLOSE_TAGS: {
      AREA: true,
      BASE: true,
      BASEFONT: true,
      BR: true,
      COL: true,
      FRAME: true,
      HR: true,
      IMG: true,
      INPUT: true,
      ISINDEX: true,
      LINK: true,
      META: true,
      PARAM: true
    },

    __ID__: [ 0 ],

    NEXT_ID: function() {
      return 'v' + this.__ID__[ 0 ]++;
    },

    // Keys which respond to keydown but not keypress
    KEYPRESS_CODES: { 8: true, 13: true, 33: true, 34: true, 37: true, 38: true, 39: true, 40: true },

    NAMED_CODES: {
      '13': 'enter',
      '37': 'left',
      '38': 'up',
      '39': 'right',
      '40': 'down'
    }
  },

  axioms: [
    foam.u2.CSS.create({
      // We hide Elements by adding this style rather than setting
      // 'display: none' directly because then when we re-show the
      // Element we don't need to remember it's desired 'display' value.
      code: '.foam-u2-Element-hidden { display: none !important; }'
    })
  ],

  properties: [
    {
      name: 'id',
      transient: true,
      factory: function() { return this.NEXT_ID(); }
    },
    {
      name: 'state',
      class: 'Proxy',
      of: 'foam.u2.ElementState',
      transient: true,
      topics: [],
      delegates: foam.u2.ElementState.getOwnAxiomsByClass(foam.core.Method).
          map(function(m) { return m.name; }),
      factory: function() { return this.INITIAL; },
      postSet: function(oldState, state) {
        if ( state === this.LOADED ) {
          this.pub('onload');
        } else if ( state === this.UNLOADED ) {
          this.pub('onunload');
        }
      }
    },
    {
      name: 'content',
      preSet: function(o, n) {
        // Prevent setting to 'this', which wouldn't change the behaviour.
        return n === this ? null : n ;
      }
    },
    {
      name: 'parentNode',
      transient: true
    },
    {
      class: 'Boolean',
      name: 'shown',
      value: true,
      postSet: function(o, n) {
        if ( o === n ) return;
        if ( n ) {
          this.removeClass('foam-u2-Element-hidden');
        } else {
          this.addClass('foam-u2-Element-hidden');
        }
      }
    },
    {
      class: 'Proxy',
      of: 'foam.u2.DefaultValidator',
      name: 'validator',
      topics: [],
      factory: function() {
        return this.elementValidator$ ? this.elementValidator : this.DEFAULT_VALIDATOR;
      }
    },
    {
      name: 'nodeName',
      adapt: function(_, v) {
        // Convert to uppercase so that checks against OPTIONAL_CLOSE_TAGS
        // and ILLEGAL_CLOSE_TAGS work.
        return foam.String.toUpperCase(v);
      },
      value: 'DIV'
    },
    {
      name: 'attributeMap',
      // documentation: 'Same information as "attributes", but in map form for faster lookup',
      transient: true,
      factory: function() { return {}; }
    },
    {
      name: 'attributes',
      // documentation: 'Array of {name: ..., value: ...} attributes.',
      factory: function() { return []; },
      postSet: function(_, attrs) {
        this.attributeMap = {};
        for ( var i = 0 ; i < attrs.length ; i++ ) {
          this.attributeMap[attrs[i].name] = attrs[i];
        }
      }
    },
    {
      name: 'classes',
      // documentation: 'CSS classes assigned to this Element. Stored as a map of true values.',
      factory: function() { return {}; }
    },
    {
      name: 'css',
      // documentation: 'Styles added to this Element.',
      factory: function() { return {}; }
    },
    {
      name: 'childNodes',
      // documentation: 'Children of this Element.',
      factory: function() { return []; }
    },
    {
      name: 'elListeners',
      // documentation: 'DOM listeners of this Element. Stored as topic then listener.',
      factory: function() { return []; }
    },
    {
      name: 'children',
      // documentation: 'Virtual property of non-String childNodes.',
      transient: true,
      getter: function() {
        return this.childNodes.filter(function(c) {
          return typeof c !== 'string';
        });
      }
    },
    {
      class: 'Boolean',
      name: 'focused'
    },
    {
      name: 'outerHTML',
      transient: true,
      hidden: true,
      getter: function() {
        return this.output(this.createOutputStream()).toString();
      }
    },
    {
      name: 'innerHTML',
      transient: true,
      hidden: true,
      getter: function() {
        return this.outputInnerHTML(this.createOutputStream()).toString();
      }
    },
    {
      name: 'scrollHeight',
    },
    {
      name: 'clickTarget_'
    },
    {
      name: '__subSubContext__',
      factory: function() { return this.__subContext__; }
    },
    'keyMap_'
  ],

  methods: [
    function init() {
      this.onDetach(this.visitChildren.bind(this, 'detach'));
    },

    function initE() {
      this.initKeyboardShortcuts();
      /*
        Template method for adding addtion element initialization
        just before Element is output().
      */
    },

    function observeScrollHeight() {
      // TODO: This should be handled by an onsub event when someone subscribes to
      // scroll height changes.
      var self = this;
      this.onload.sub(function(s) {
        s.detach();
        var observer = new MutationObserver(function(mutations) {
          self.scrollHeight = self.el().scrollHeight;
        });
        var config = { attributes: true, childList: true, characterData: true };
        observer.observe(self.el(), config);
        self.onDetach(function() { observer.disconnect() });
      });
      return this;
    },

    function evtToCharCode(evt) {
      /* Maps an event keycode to a string */
      var s = '';
      if ( evt.altKey   ) s += 'alt-';
      if ( evt.ctrlKey  ) s += 'ctrl-';
      if ( evt.shiftKey && evt.type === 'keydown' ) s += 'shift-';
      if ( evt.metaKey  ) s += 'meta-';
      s += evt.type === 'keydown' ?
          this.NAMED_CODES[evt.which] || String.fromCharCode(evt.which) :
          String.fromCharCode(evt.charCode);
      return s;
    },

    function initKeyMap_(keyMap, cls) {
      var count = 0;

      var as = cls.getAxiomsByClass(foam.core.Action);

      for ( var i = 0 ; i < as.length ; i++ ) {
        var a = as[i];

        for ( var j = 0 ; a.keyboardShortcuts && j < a.keyboardShortcuts.length ; j++, count++ ) {
          var key = a.keyboardShortcuts[j];

          // First, lookup named codes, then convert numbers to char codes,
          // otherwise, assume we have a single character string treated as
          // a character to be recognized.
          if ( this.NAMED_CODES[key] ) {
            key = this.NAMED_CODES[key];
          } else if ( typeof key === 'number' ) {
            key = String.fromCharCode(key);
          }

          keyMap[key] = a.maybeCall.bind(a, this.__subContext__, this);
          /*
          keyMap[key] = opt_value ?
            function() { a.maybeCall(this.__subContext__, opt_value.get()); } :
            a.maybeCall.bind(action, self.X, self) ;
          */
        }
      }

      return count;
    },

    function initKeyboardShortcuts() {
      /* Initializes keyboard shortcuts. */
      var keyMap = {}
      var count = this.initKeyMap_(keyMap, this.cls_);

      //      if ( this.of ) count += this.initKeyMap_(keyMap, this.of);

      if ( count ) {
        this.keyMap_ = keyMap;
        var target = this.parentNode || this;

        // Ensure that target is focusable, and therefore will capture keydown
        // and keypress events.
        target.setAttribute('tabindex', target.tabIndex || 1);

        target.on('keydown',  this.onKeyboardShortcut);
        target.on('keypress', this.onKeyboardShortcut);
      }
    },

    function el() {
      /* Return this Element's real DOM element, if loaded. */
      return this.getElementById(this.id);
    },

    function findChildForEvent(e) {
      var src  = e.srcElement;
      var el   = this.el();
      var cMap = {};
      var cs   = this.children;

      if ( ! el ) return;

      for ( var i = 0 ; i < cs.length ; i++ ) {
        var c = cs[i];
        cMap[c.id] = c;
      }

      while ( src !== el ) {
        var c = cMap[src.id];
        if ( c ) return c;
        src = src.parentElement;
      }
    },

    function E(opt_nodeName) {
      return this.__subSubContext__.E(opt_nodeName);
    },

    // function XXXE(opt_nodeName /* | DIV */) {
    //   /* Create a new Element */
    //   var Y = this.__subContext__;
    //
    //   // ???: Is this needed / a good idea?
    //   if ( this.data && ! Y.data ) Y = Y.createSubContext({ data: this.data });
    //
    //   // Some names have sub-Models registered for them.
    //   // Example 'input'
    //   var e = Y.elementForName(opt_nodeName);
    //
    //   if ( ! e ) {
    //     e = foam.u2.Element.create(null, Y);
    //     if ( opt_nodeName ) e.nodeName = opt_nodeName;
    //   }
    //
    //   return e;
    // },

    function attrSlot(opt_name, opt_event) {
      /* Convenience method for creating an AttrSlot's. */
      var args = { element: this };

      if ( opt_name  ) args.property = opt_name;
      if ( opt_event ) args.event    = opt_event;

      return this.AttrSlot.create(args);
    },

    function myCls(opt_extra) {
      console.warn('Deprecated use of Element.myCls(). Use myClass() instead.');
      return this.myClass(opt_extra);
    },

    function myClass(opt_extra) {
      var f = this.cls_.myClass_;

      if ( ! f ) {
        var base = foam.String.cssClassize(this.cls_.id).split(/ +/);

        f = this.cls_.myClass_ = foam.Function.memoize1(function(e) {
          return base.map(function(c) { return c + (e ? '-' + e : ''); }).join(' ');
        });
      }

      return f(opt_extra);
    },

    function visitChildren(methodName) {
      /*
        Call the named method on all children.
        Typically used to transition state of all children at once.
        Ex.: this.visitChildren('load');
      */
      var cs = this.childNodes;
      for ( var i = 0 ; i < cs.length ; i++ ) {
        var c = cs[i];
        c[methodName] && c[methodName].call(c);
      }
    },


    //
    // Focus
    //

    function focus() {
      this.focused = true;
      this.onFocus();
      return this;
    },

    function blur() {
      this.focused = false;
      return this;
    },


    //
    // Visibility
    //
    // Fluent methods for setting 'shown' property.

    function show(opt_shown) {
      if ( opt_shown === undefined ) {
        this.shown = true;
      } else if ( foam.core.Slot.isInstance(opt_shown) ) {
        this.shown$.follow(opt_shown);
      } else {
        this.shown = !! opt_shown;
      }

      return this;
    },

    function hide(opt_hidden) {
      return this.show(
          opt_hidden === undefined              ? false :
          foam.core.Slot.isInstance(opt_hidden) ? opt_hidden.map(function(s) { return ! s; }) :
          ! opt_hidden);
    },


    //
    // DOM Compatibility
    //
    // Methods with the same interface as the real DOM.

    function setAttribute(name, value) {
      /*
        Set an Element attribute or property.

        If this model has a property named 'name' which has 'attribute: true',
        then the property will be updated with value.
        Otherwise, the DOM attribute will be set.

        Value can be either a string, a Value, or an Object.
        If Value is undefined, null or false, the attribute will be removed.
      */

      // TODO: type checking

      // handle slot binding, ex.: data$: ...,
      // Remove if we add a props() method
      if ( name.endsWith('$') ) {
        this[name] = value;
        return;
      }

      var prop = this.cls_.getAxiomByName(name);

      if ( prop &&
           foam.core.Property.isInstance(prop) &&
           prop.attribute )
      {
        if ( typeof value === 'string' ) {
          // TODO: remove check when all properties have fromString()
          this[name] = prop.fromString ? prop.fromString(value) : value;
        } else if ( foam.core.Slot.isInstance(value) ) {
          this.slot(name).follow(value);
        } else {
          this[name] = value;
        }
      } else {
        if ( value === undefined || value === null || value === false ) {
          this.removeAttribute(name);
          return;
        }

        if ( foam.core.Slot.isInstance(value) ) {
          this.slotAttr_(name, value);
        } else {
          foam.assert(
              typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || foam.Date.isInstance(value),
              'Attribute value must be a primitive type.');

          var attr = this.getAttributeNode(name);

          if ( attr ) {
            attr.value = value;
          } else {
            attr = { name: name, value: value };
            this.attributes.push(attr);
            this.attributeMap[name] = attr;
          }

          this.onSetAttr(name, value);
        }
      }
    },

    function removeAttribute(name) {
      /* Remove attribute named 'name'. */
      for ( var i = 0 ; i < this.attributes.length ; i++ ) {
        if ( this.attributes[i].name === name ) {
          this.attributes.splice(i, 1);
          delete this.attributeMap[name];
          this.onRemoveAttr(name);
          return;
        }
      }
    },

    function getAttributeNode(name) {
      /*
        Get {name: ..., value: ...} attributeNode associated
        with 'name', if exists.
      */
      return this.attributeMap[name];
    },

    function getAttribute(name) {
      // TODO: add support for other dynamic attributes also
      // TODO: don't lookup in real DOM if listener present
      if ( this.PSEDO_ATTRIBUTES[name] && this.el() ) {
        var value = this.el()[name];
        var attr  = this.getAttributeNode(name);

        if ( attr ) {
          attr[name] = value;
        } else {
          attr = { name: name, value: value };
          this.attributes.push(attr);
          this.attributeMap[name] = attr;
        }

        return value;
      }

      /*
        Get value associated with attribute 'name',
        or undefined if attribute not set.
      */
      var attr = this.getAttributeNode(name);
      return attr && attr.value;
    },

    function appendChild(c) {
      // TODO: finish implementation
      this.childNodes.push(c);
    },

    function removeChild(c) {
      /* Remove a Child node (String or Element). */
      var cs = this.childNodes;
      for ( var i = 0 ; i < cs.length ; ++i ) {
        if ( cs[i] === c ) {
          cs.splice(i, 1);
          this.state.onRemoveChild.call(this, c, i);
          return;
        }
      }
    },

    function replaceChild(newE, oldE) {
      /* Replace current child oldE with newE. */
      var cs = this.childNodes;
      for ( var i = 0 ; i < cs.length ; ++i ) {
        if ( cs[i] === oldE ) {
          cs[i] = newE;
          newE.parentNode = this;
          this.state.onReplaceChild.call(this, oldE, newE);
          oldE.unload && oldE.unload();
          return;
        }
      }
    },

    function insertBefore(child, reference) {
      /* Insert a single child before the reference element. */
      return this.insertAt_(child, reference, true);
    },

    function insertAfter(child, reference) {
      /* Insert a single child after the reference element. */
      return this.insertAt_(child, reference, false);
    },

    function remove() {
      /*
        Remove this Element from its parent Element.
        Will transition to UNLOADED state.
      */
      this.onRemove();

      if ( this.parentNode ) {
        var cs = this.parentNode.childNodes;
        for ( var i = 0 ; i < cs.length ; i++ ) {
          if ( cs[i] === this ) {
            cs.splice(i, 1);
            return;
          }
        }
        this.parentNode = undefined;
      }
    },

    function addEventListener(topic, listener) {
      /* Add DOM listener. */
      this.elListeners.push(topic, listener);
      this.onAddListener(topic, listener);
    },

    function removeEventListener(topic, listener) {
      /* Remove DOM listener. */
      var ls = this.elListeners;
      for ( var i = 0 ; i < ls.length ; i+=2 ) {
        var t = ls[i], l = ls[i+1];
        if ( t === topic && l === listener ) {
          ls.splice(i, 2);
          this.onRemoveListener(topic, listener);
          return;
        }
      }
    },


    //
    // Fluent Methods
    //
    // Methods which return 'this' so they can be chained.

    function setNodeName(name) {
      this.nodeName = name;
      return this;
    },

    function setID(id) {
      /*
        Explicitly set Element's id.
        Normally id's are automatically assigned.
        Setting specific ID's hinders composability.
      */
      this.id = id;
      return this;
    },

    function entity(name) {
      /* Create and add a named entity. Ex. .entity('gt') */
      this.add(this.Entity.create({ name: name }));
      return this;
    },

    function nbsp() {
      return this.entity('nbsp');
    },

    function cssClass(cls) {
      return this.addClass(cls);
    },

    function addClass(cls) { /* Slot | String */
      /* Add a CSS cls to this Element. */
      var self = this;
      if ( foam.core.Slot.isInstance(cls) ) {
        var lastValue = null;
        var l = function() {
          var v = cls.get();
          self.addClass_(lastValue, v);
          lastValue = v;
        };
        cls.sub(l);
        l();
      } else if ( typeof cls === 'string' ) {
        this.addClass_(null, cls);
      } else {
        this.error('cssClass type error. Must be Slot or String.');
      }

      return this;
    },

    function enableCls(cls, enabled, opt_negate) {
      console.warn('Deprecated use of Element.enableCls(). Use enableClass() instead.');
      return this.enableClass(cls, enabled, opt_negate);
    },

    function enableClass(cls, enabled, opt_negate) {
      /* Enable/disable a CSS class based on a boolean-ish dynamic value. */
      function negate(a, b) { return b ? ! a : a; }

      // TODO: add type checking
      if ( foam.core.Slot.isInstance(enabled) ) {
        var self = this;
        var value = enabled;
        var l = function() { self.enableClass(cls, value.get(), opt_negate); };
        value.sub(l);
        l();
      } else {
        enabled = negate(enabled, opt_negate);
        var parts = cls.split(' ');
        for ( var i = 0 ; i < parts.length ; i++ ) {
          this.classes[parts[i]] = enabled;
          this.onSetClass(parts[i], enabled);
        }
      }
      return this;
    },

    function removeCls(cls) {
      console.warn('Deprecated use of Element.removeCls(). Use removeClass() instead.');
      return this.removeClass(cls);
    },

    function removeClass(cls) {
      /* Remove specified CSS class. */
      if ( cls ) {
        delete this.classes[cls];
        this.onSetClass(cls, false);
      }
      return this;
    },

    function on(topic, listener) {
      /* Shorter fluent version of addEventListener. Prefered method. */
      this.addEventListener(topic, listener);
      return this;
    },

    function attr(key, value) {
      this.setAttribute(key, value);
      return this;
    },

    function attrs(map) {
      /* Set multiple attributes at once. */
      for ( var key in map ) this.setAttribute(key, map[key]);
      return this;
    },

    function style(map) {
      /*
        Set CSS styles.
        Map values can be Objects or dynamic Values.
      */
      for ( var key in map ) {
        var value = map[key];
        if ( foam.core.Slot.isInstance(value) ) {
          this.slotStyle_(key, value);
        } else {
          this.style_(key, value);
        }
        // TODO: add type checking for this
      }

      return this;
    },

    function tag(spec, args, slot) {
      /* Create a new Element and add it as a child. Return this. */
      var c = this.createChild_(spec, args);
      this.add(c);
      if ( slot ) slot.set(c);
      return this;
    },

    function br() {
      return this.tag('br');
    },

    function startContext(map) {
      var m = {};
      Object.assign(m, map);
      m.__oldAddContext__ = this.__subSubContext__;
      this.__subSubContext__ = this.__subSubContext__.createSubContext(m);
      return this;
    },

    function endContext() {
      this.__subSubContext__ = this.__subSubContext__.__oldAddContext__;
      return this;
    },

    function createChild_(spec, args) {
      return foam.u2.ViewSpec.createView(spec, args, this, this.__subSubContext__);
    },

    function start(spec, args, slot) {
      /* Create a new Element and add it as a child. Return the child. */
      var c = this.createChild_(spec, args);
      this.add(c);
      if ( slot ) slot.set(c);
      return c;
    },

    function end() {
      /* Return this Element's parent. Used to terminate a start(). */
      return this.parentNode;
    },

    function add() {
      if ( this.content ) {
        this.content.add_(arguments, this);
      } else {
        this.add_(arguments, this);
      }
      return this;
    },

    function toE() {
      return this;
    },

    function add_(cs, parentNode) {
      /* Add Children to this Element. */
      var es = [];
      var Y = this.__subSubContext__;

      for ( var i = 0 ; i < cs.length ; i++ ) {
        var c = cs[i];

        // Remove null values
        if ( c === undefined || c === null ) {
          // nop
        } else if ( Array.isArray(c) ) {
          for ( var j = 0 ; j < c.length ; j++ ) {
            var v = c[j];
            es.push(v.toE ? v.toE(null, Y) : v);
          }
        } else if ( c.toE ) {
          var e = c.toE(null, Y);
          if ( foam.core.Slot.isInstance(e) ) {
            e = this.slotE_(e);
          }
          es.push(e);
        } else if ( typeof c === 'function' ) {
          throw new Error('Unsupported');
        } else if ( foam.core.Slot.isInstance(c) ) {
          var v = this.slotE_(c);
          if ( Array.isArray(v) ) {
            for ( var j = 0 ; j < v.length ; j++ ) {
              var u = v[j];
              es.push(u.toE ? u.toE(null, Y) : u);
            }
          } else {
            es.push(v.toE ? v.toE(null, Y) : v);
          }
        } else {
          es.push(c);
        }
      }

      if ( es.length ) {
        for ( var i = 0 ; i < es.length ; i++ ) {
          if ( foam.u2.Element.isInstance(es[i]) ) {
            es[i].parentNode = parentNode;
          } else if ( es[i].cls_ && es[i].cls_.id === 'foam.u2.Entity' ) {
            // NOP
          } else {
            es[i] = this.sanitizeText(es[i]);
          }
        }

        this.childNodes.push.apply(this.childNodes, es);
        this.onAddChildren.apply(this, es);
      }

      return this;
    },

    function addBefore(reference) { /*, vargs */
      /* Add a variable number of children before the reference element. */
      var children = [];
      for ( var i = 1 ; i < arguments.length ; i++ ) {
        children.push(arguments[i]);
      }
      return this.insertAt_(children, reference, true);
    },

    function removeAllChildren() {
      /* Remove all of this Element's children. */
      var cs = this.childNodes;
      while ( cs.length ) {
        this.removeChild(cs[0]);
      }
      return this;
    },

    function setChildren(slot) {
      /**
         slot -- a Slot of an array of children which set this element's
         contents, replacing old children
      **/
      var l = function() {
        this.removeAllChildren();
        this.add.apply(this, slot.get());
      }.bind(this);

      slot.sub(l);
      l();

      return this;
    },

    function repeat(s, e, f) {
      // TODO: support descending
      for ( var i = s ; i <= e ; i++ ) {
        f.call(this, i);
      }
      return this;
    },

    function select(dao, f, update) {
      var es   = {};
      var self = this;

      var listener = foam.u2.RenderSink.create({
        dao: dao,
        addRow: function(o) {
          if ( update ) o = o.clone();

          self.startContext({data: o});

          var e = f.call(self, o);

          if ( update ) {
            o.propertyChange.sub(function(_,__,prop,slot) {
              dao.put(o.clone());
            });
          }

          self.endContext();

          if ( es[o.id] ) {
            self.replaceChild(es[o.id], e);
          } else {
            self.add(e);
          }
          es[o.id] = e;
        },
        cleanup: function() {
          for ( var key in es ) {
            es[key].remove();
          }

          es = {};
        }
      })

      this.onDetach(dao.listen(listener));
      listener.paint();

      return this;
    },

    function call(f, args) {
      f.apply(this, args);

      return this;
    },

    function forEach(a, f) {
      for ( var i = 0 ; i < a.length ; i++ ) {
        f.call(this, a[i], i);
      }

      return this;
    },

    //
    // Output Methods
    //

    function outputInnerHTML(out) {
      var cs = this.childNodes;
      for ( var i = 0 ; i < cs.length ; i++ ) {
        out(cs[i]);
      }
      return out;
    },

    function createOutputStream() {
      /*
        Create an OutputStream.
        Suitable for providing to the output() method for
        serializing an Element hierarchy.
        Call toString() on the OutputStream to get output.
      */
      var self = this;
      var buf = [];
      var Element = foam.u2.Element;
      var Entity  = self.Entity;
      var f = function templateOut(/* arguments */) {
        for ( var i = 0 ; i < arguments.length ; i++ ) {
          var o = arguments[i];
          if ( o === null || o === undefined ) {
            // NOP
          } else if ( typeof o === 'string' ) {
            buf.push(o);
          } else if ( typeof o === 'number' ) {
            buf.push(o);
          } else if ( Element.isInstance(o) || Entity.isInstance(o) ) {
            o.output(f);
          } else if ( o === null || o === undefined ) {
            buf.push(o);
          }
        }
      };

      f.toString = function() {
        if ( buf.length === 0 ) return '';
        if ( buf.length > 1 ) return buf.join('');
        return buf[0];
      };

      return f;
    },

    function write() {
      /* Write Element to document. */
      this.document.body.insertAdjacentHTML('beforeend', this.outerHTML);
      this.load();
      return this;
    },

    function toString() {
      return this.cls_.id + '(nodeName=' + this.nodeName + ', state=' + this.state + ')';
      /* Converts Element to HTML String without transitioning state. */
      /*
        TODO: put this somewhere useful for debugging
      var s = this.createOutputStream();
      this.output_(s);
      return s.toString();
      */
    },


    //
    // Internal (DO NOT USE)
    //

    // (Element[], Element, Boolean)
    function insertAt_(children, reference, before) {
      var i = this.childNodes.indexOf(reference);

      if ( i === -1 ) {
        this.warn("Reference node isn't a child of this.");
        return this;
      }

      if ( ! Array.isArray(children) ) children = [ children ];

      var Y = this.__subSubContext__;
      children = children.map(function(e) {
        e = e.toE ? e.toE(null, Y) : e;
        e.parentNode = this;
        return e;
      }.bind(this));

      var index = before ? i : (i + 1);
      this.childNodes.splice.apply(this.childNodes,
          [ index, 0 ].concat(children));

      this.state.onInsertChildren.call(
        this,
        children,
        reference,
        before ? 'beforebegin' : 'afterend');

      return this;
    },

    function addClass_(oldClass, newClass) {
      /* Replace oldClass with newClass. Called by cls(). */
      if ( oldClass === newClass ) return;
      this.removeClass(oldClass);
      if ( newClass ) {
        this.classes[newClass] = true;
        this.onSetClass(newClass, true);
      }
    },

    function slotAttr_(key, value) {
      /* Set an attribute based off of a dynamic Value. */
      var self = this;
      var l = function() { self.setAttribute(key, value.get()); };
      value.sub(l);
      l();
    },

    function slotStyle_(key, v) {
      /* Set a CSS style based off of a dynamic Value. */
      var self = this;
      var l = function(value) { self.style_(key, v.get()); };
      v.sub(l);
      l();
    },

    function style_(key, value) {
      /* Set a CSS style based off of a literal value. */
      this.css[key] = value;
      this.onSetStyle(key, value);
      return this;
    },

    // TODO: add same context capturing behviour to other slotXXX_() methods.
    function slotE_(slot) {
      /*
        Return an Element or an Array of Elements which are
        returned from the supplied dynamic Slot.
        The Element(s) are replaced when the Slot changes.
      */
      var self = this;
      var ctx  = this.__subSubContext__;

      function nextE() {
        // Run Slot in same subSubContext that it was created in.
        var oldCtx = self.__subSubContext__;
        self.__subSubContext__ = ctx;
        var e = slot.get();

        // Convert e or e[0] into a SPAN if needed,
        // So that it can be located later.
        if ( e === undefined || e === null || e === '' ) {
          e = self.E('SPAN');
        } else if ( Array.isArray(e) ) {
          if ( e.length ) {
            if ( typeof e[0] === 'string' ) {
              e[0] = self.E('SPAN').add(e[0]);
            }
          } else {
            e = self.E('SPAN');
          }
        } else if ( ! foam.u2.Element.isInstance(e) ) {
          e = self.E('SPAN').add(e);
        }

        self.__subSubContext__ = oldCtx;

        return e;
      }

      var e = nextE();
      var l = function() {
        if ( self.state !== self.LOADED ) {
          s && s.detach();
          return;
        }
        var first = Array.isArray(e) ? e[0] : e;
        var tmp = self.E();
        self.insertBefore(tmp, first);
        if ( Array.isArray(e) ) {
          for ( var i = 0 ; i < e.length ; i++ ) { e[i].remove(); e[i].detach(); }
        } else {
          if ( e.state === e.LOADED ) { e.remove(); e.detach(); }
        }
        var e2 = nextE();
        self.insertBefore(e2, tmp);
        tmp.remove();
        e = e2;
      };

      var s = slot.sub(this.framed(l));
      this.sub('onunload', foam.Function.bind(s.detach, s));

      return e;
    },

    function addEventListener_(topic, listener) {
      var el = this.el();
      el && el.addEventListener(topic, listener, false);
    },

    function removeEventListener_(topic, listener) {
      this.el() && this.el().removeEventListener(topic, listener);
    },

    function output_(out) {
      /** Output the element without transitioning to the OUTPUT state. **/
      out('<', this.nodeName);
      if ( this.id !== null ) out(' id="', this.id, '"');

      var first = true;
      if ( this.hasOwnProperty('classes') ) {
        var cs = this.classes;
        for ( var key in cs ) {
          if ( ! cs[key] ) continue;
          if ( first ) {
            out(' class="');
            first = false;
          } else {
            out(' ');
          }
          out(key);
        }
        if ( ! first ) out('"');
      }

      if ( this.hasOwnProperty('css') ) {
        first = true;
        var cs = this.css;
        for ( var key in cs ) {
          var value = cs[key];

          if ( first ) {
            out(' style="');
            first = false;
          }
          out(key, ':', value, ';');
        }
        if ( ! first ) out('"');
      }

      if ( this.hasOwnProperty('attributes') ) {
        var as = this.attributes;
        for ( var i = 0 ; i < as.length ; i++ ) {
          var attr  = as[i];
          var name  = attr.name;
          var value = attr.value;

          out(' ', name);
          if ( value !== false ) out('="', value, '"');
        }
      }

      if ( ! this.ILLEGAL_CLOSE_TAGS[this.nodeName] ) {
        var hasChildren = this.hasOwnProperty('childNodes') && this.childNodes.length;
        if ( hasChildren || ! this.OPTIONAL_CLOSE_TAGS[this.nodeName] ) {
          out('>');
          if ( hasChildren ) this.outputInnerHTML(out);
          out('</', this.nodeName);
        }
      }

      out('>');
    }
  ],

  listeners: [
    {
      name: 'onKeyboardShortcut',
      documentation: function() {/*
          Automatic mapping of keyboard events to $$DOC{ref:'Action'} trigger.
          To handle keyboard shortcuts, create and attach $$DOC{ref:'Action',usePlural:true}
          to your $$DOC{ref:'foam.ui.View'}.
      */},
      code: function(evt) {
        if ( evt.type === 'keydown' && ! this.KEYPRESS_CODES[evt.which] ) return;
        var action = this.keyMap_[this.evtToCharCode(evt)];
        if ( action ) {
          action();
          evt.preventDefault();
          evt.stopPropagation();
        }
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'U2Context',

  documentation: 'Context which includes U2 functionality.',

  exports: [
    'E',
    'registerElement',
    'elementForName'
  ],

  properties: [
    {
      name: 'elementMap',
      documentation: 'Map of registered Elements.',
      factory: function() { return {}; }
    }
  ],

  methods: [
    {
      class: 'foam.core.ContextMethod',
      name: 'E',
      code: function E(ctx, opt_nodeName) {
        var nodeName = (opt_nodeName || 'div').toUpperCase();

        return (
          ctx.elementForName(nodeName) || foam.u2.Element).
          create({nodeName: nodeName}, ctx);
      }
    },

    function registerElement(elClass, opt_elName) {
      /* Register a View class against an abstract node name. */
      var key = opt_elName || elClass.name;
      this.elementMap[key.toUpperCase()] = elClass;
    },

    function elementForName(nodeName) {
      /* Find an Element Class for the specified node name. */
      return this.elementMap[nodeName];
    }
  ]
});

foam.__context__ = foam.u2.U2Context.create().__subContext__;


foam.CLASS({
  refines: 'foam.core.FObject',
  methods: [
    function toE(args, X) {
      return foam.u2.ViewSpec.createView(
        { class: 'foam.u2.DetailView', showActions: true, data: this },
        args, this, X);
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Slot',
  methods: [
    function toE() { return this; }
  ]
});


foam.CLASS({
  refines: 'foam.core.ExpressionSlot',
  methods: [
    function toE() { return this; }
  ]
});


foam.CLASS({
  refines: 'foam.core.Property',

  requires: [
    'foam.u2.TextField'
  ],

  properties: [
    {
      // If true, this property is treated as a psedo-U2 attribute.
      name: 'attribute',
      value: false
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'view',
      value: { class: 'foam.u2.TextField' }
    },
    {
      class: 'Enum',
      of: 'foam.u2.Visibility',
      name: 'visibility',
      value: foam.u2.Visibility.RW
    }
  ],

  methods: [
    function toE(args, X) {
      var e = foam.u2.ViewSpec.createView(this.view, args, this, X);

      e.fromProperty && e.fromProperty(this);

      if ( X.data$ && ! ( args && ( args.data || args.data$ ) ) ) {
        e.data$ = X.data$.dot(this.name);
      }

      return e;
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.String',
  properties: [
    {
      class: 'Int',
      name: 'displayWidth',
      expression: function(width) { return width; }
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.StringArray',
  properties: [
    [ 'view', { class: 'foam.u2.view.StringArrayView' } ]
  ]
});

foam.CLASS({
  refines: 'foam.core.Date',
  requires: [ 'foam.u2.DateView' ],
  properties: [
    [ 'view', { class: 'foam.u2.DateView' } ]
  ]
});


foam.CLASS({
  refines: 'foam.core.DateTime',
  requires: [ 'foam.u2.DateTimeView' ],
  properties: [
    [ 'view', { class: 'foam.u2.DateTimeView' } ]
  ]
});


foam.CLASS({
  refines: 'foam.core.Float',
  requires: [ 'foam.u2.FloatView' ],
  properties: [
    [ 'view', { class: 'foam.u2.FloatView' } ]
  ]
});


foam.CLASS({
  refines: 'foam.core.Int',
  requires: [ 'foam.u2.IntView' ],
  properties: [
    [ 'view', { class: 'foam.u2.IntView' } ]
  ]
});


foam.CLASS({
  refines: 'foam.core.Boolean',
  requires: [ 'foam.u2.CheckBox' ],
  properties: [
    [ 'view', { class: 'foam.u2.CheckBox' } ],
  ]
});


foam.CLASS({
  refines: 'foam.core.Color',
  properties: [
    {
      name: 'view',
      value: {
        class: 'foam.u2.view.DualView',
        viewa: 'foam.u2.TextField',
        viewb: { class: 'foam.u2.view.ColorPicker', onKey: true }
      }
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Class',
  properties: [
    [ 'view', { class: 'foam.u2.ClassView' } ]
  ]
});


foam.CLASS({
  refines: 'foam.core.Reference',
  properties: [
    {
      name: 'view',
      value: {
        class: 'foam.u2.view.ReferenceView'
      }
    }
  ]
})


foam.CLASS({
  package: 'foam.u2',
  name: 'ControllerViewTrait',

  documentation: 'Trait for adding a ControllerMode controllerMode Property.',

  exports: [ 'controllerMode' ],

  properties: [
    {
      class: 'Enum',
      of: 'foam.u2.ControllerMode',
      name: 'controllerMode'
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'View',
  extends: 'foam.u2.Element',

  documentation: 'A View is an Element used to display data.',

  exports: [ 'data' ],

  properties: [
    {
      class: 'Enum',
      of: 'foam.u2.ControllerMode',
      name: 'controllerMode',
      factory: function() { return this.__context__.controllerMode || foam.u2.ControllerMode.CREATE; }
    },
    {
      name: 'data',
      attribute: true
    },
    {
      class: 'Enum',
      of: 'foam.u2.Visibility',
      name: 'visibility',
      postSet: function() { this.updateMode_(this.mode); },
      attribute: true,
      value: foam.u2.Visibility.RW
    },
    {
      class: 'Enum',
      of: 'foam.u2.DisplayMode',
      name: 'mode',
      attribute: true,
      postSet: function(_, mode) { this.updateMode_(mode); },
      expression: function(visibility, controllerMode) {
        if ( visibility === foam.u2.Visibility.RO ) {
          return foam.u2.DisplayMode.RO;
        }

        if ( visibility === foam.u2.Visibility.FINAL &&
             controllerMode !== foam.u2.ControllerMode.CREATE ) {
          return foam.u2.DisplayMode.RO;
        }

        return controllerMode === foam.u2.ControllerMode.VIEW ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.RW ;
      },
      attribute: true
    }/*,
    {
      type: 'Boolean',
      name: 'showValidation',
      documentation: 'Set to false if you want to ignore any ' +
          '$$DOC{ref:"Property.validate"} calls. On by default.',
      defaultValue: true
    },
    {
      type: 'String',
      name: 'validationError_',
      documentation: 'The actual error message. Null or the empty string ' +
          'when there is no error.',
    }
    */
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.updateMode_(this.mode);
    },

    function updateMode_() {
      // Template method, to be implemented in sub-models
    },

    function fromProperty(p) {
      this.visibility = p.visibility;
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'Controller',
  extends: 'foam.u2.Element',

  documentation: 'A Controller is an Element which exports itself as "data".',

  exports: [ 'as data' ]
});


foam.CLASS({
  refines: 'foam.core.Action',

  requires: [
    'foam.u2.ActionView'
  ],

  methods: [
    function toE(args, X) {
      var view = foam.u2.ViewSpec.createView(
        { class: 'foam.u2.ActionView', action: this }, args, this, X);

      if ( X.data$ && ! ( args && ( args.data || args.data$ ) ) ) {
        view.data$ = X.data$;
      }

      return view;
    }
  ]
});

// TODO: make a tableProperties property on AbstractClass

foam.CLASS({
  package: 'foam.u2',
  name: 'TableColumns',

  documentation: 'Axiom for storing Table Columns information in Class. Unlike most Axioms, doesn\'t modify the Class, but is just used to store information.',

  properties: [
    [ 'name', 'tableColumns' ],
    'columns'
  ]
});


foam.CLASS({
  refines: 'foam.core.Model',
  properties: [
    {
      // TODO: remove when all code ported
      name: 'tableProperties',
      setter: function(_, ps) {
        console.warn("Deprecated use of tableProperties. Use 'tableColumns' instead.");
        this.tableColumns = ps;
      }
    },
    {
      name: 'tableColumns',
      postSet: function(_, cs) {
        this.axioms_.push(foam.u2.TableColumns.create({columns: cs}));
      }
    }
  ]
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.u2',
  name: 'ProgressView',
  extends: 'foam.u2.View',

  axioms: [
    foam.u2.CSS.create({
      code: function() {/*
        ^ {
          margin: 2px 0 0 10px;
          height: 23px;
          width: 183px;
        }
      */}
    })
  ],

  properties: [
    [ 'nodeName', 'progress' ]
  ],

  methods: [
    function initE() {
      this.
        addClass(this.myClass()).
        attrs({max: 100});

      this.attrSlot().follow(this.data$);
    }
  ]
});
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

foam.INTERFACE({
  package: 'foam.dao',
  name: 'Sink',

  documentation: 'Interface for receiving information updates. Primarily used as the target for DAO.select() calls.',

  methods: [
    {
      name: 'put',
      returns: '',
      args: [
        'obj',
        'sub'
      ],
      code: function() {}
    },
    {
      name: 'remove',
      returns: '',
      args: [
        'obj',
        'sub'
      ],
      code: function() {}
    },
    {
      name: 'eof',
      returns: '',
      args: [],
      code: function() {}
    },
    {
      name: 'reset',
      returns: '',
      args: [ 'sub' ],
      code: function() {}
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'ProxySink',
  implements: [ 'foam.dao.Sink' ],

  documentation: 'Proxy for Sink interface.',

  properties: [
    {
      class: 'Proxy',
      of: 'foam.dao.Sink',
      name: 'delegate',
      factory: function() { return foam.dao.ArraySink.create(); }
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'AbstractSink',
  implements: [ 'foam.dao.Sink' ],

  documentation: 'Abstract base class for implementing Sink interface.',

  methods: [
    {
      name: 'put',
      code: function() {}
    },
    {
      name: 'remove',
      code: function() {}
    },
    {
      name: 'eof',
      code: function() {}
    },
    {
      name: 'reset',
      code: function() {}
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'PipeSink',
  extends: 'foam.dao.ProxySink',
  properties: [
    'dao'
  ],
  methods: [
    function reset(sub) {
      this.SUPER(sub);
      this.dao.select(this.delegate);
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'ResetListener',
  extends: 'foam.dao.ProxySink',
  documentation: 'Turns all sink events into a reset event.',
  methods: [
    function put(_, sub) {
      this.reset(sub);
    },
    function remove(_, sub) {
      this.reset(sub);
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'QuickSink',

  extends: 'foam.dao.AbstractSink',

  properties: [
    {
      class: 'Function',
      name: 'putFn'
    },
    {
      class: 'Function',
      name: 'removeFn'
    },
    {
      class: 'Function',
      name: 'eofFn'
    },
    {
      class: 'Function',
      name: 'resetFn'
    }
  ],

  methods: [
    function put() {
      return this.putFn && this.putFn.apply(this, arguments);
    },

    function remove() {
      return this.removeFn && this.removeFn.apply(this, arguments);
    },

    function eof() {
      return this.eofFn && this.eofFn.apply(this, arguments);
    },

    function reset() {
      return this.resetFn && this.resetFn.apply(this, arguments);
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'AnonymousSink',
  implements: [ 'foam.dao.Sink' ],

  properties: [ 'sink' ],

  methods: [
    function put(obj, sub) {
      var s = this.sink;
      s && s.put && s.put(obj, sub);
    },
    function remove(obj, sub) {
      var s = this.sink;
      s && s.remove && s.remove(obj, sub);
    },

    function eof() {
      var s = this.sink;
      s && s.eof && s.eof();
    },
    function reset(sub) {
      var s = this.sink;
      s && s.reset && s.reset(sub);
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'PredicatedSink',
  extends: 'foam.dao.ProxySink',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'predicate'
    }
  ],

  methods: [
    {
      name: 'put',
      code: function put(obj, sub) {
        if ( this.predicate.f(obj) ) this.delegate.put(obj, sub);
      }
    },
    {
      name: 'remove',
      code: function remove(obj, sub) {
        if ( this.predicate.f(obj) ) this.delegate.remove(obj, sub);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'LimitedSink',
  extends: 'foam.dao.ProxySink',

  properties: [
    {
      class: 'Int',
      name: 'limit'
    },
    {
      name: 'count',
      class: 'Int',
      value: 0
    }
  ],

  methods: [
    {
      name: 'put',
      code: function put(obj, sub) {
        if ( this.count++ >= this.limit ) {
          sub && sub.detach();
        } else {
          this.delegate.put(obj, sub);
        }
      }
    },
    {
      name: 'remove',
      code: function remove(obj, sub) {
        if ( this.count++ >= this.limit ) {
          sub && sub.detach();
        } else {
          this.delegate.remove(obj, sub);
        }
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'SkipSink',
  extends: 'foam.dao.ProxySink',

  properties: [
    {
      class: 'Int',
      name: 'skip'
    },
    {
      name: 'count',
      class: 'Int',
      value: 0
    }
  ],

  methods: [
    {
      name: 'put',
      code: function put(obj, sub) {
        if ( this.count < this.skip ) {
          this.count++;
          return;
        }

        this.delegate.put(obj, sub);
      }
    },
    {
      name: 'remove',
      code: function remove(obj, sub) {
        this.reset(sub);
      }
    },
    {
      name: 'reset',
      code: function(sub) {
        this.count = 0;
        this.delegate.reset(sub);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'OrderedSink',
  extends: 'foam.dao.ProxySink',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.order.Comparator',
      name: 'comparator'
    },
    {
      class: 'List',
      name: 'array',
      factory: function() { return []; }
    }
  ],

  methods: [
    {
      name: 'put',
      code: function put(obj, sub) {
        this.array.push(obj);
      }
    },
    {
      name: 'eof',
      code: function eof() {
        var comparator = this.comparator;
        this.array.sort(function(o1, o2) {
          return comparator.compare(o1, o2);
        });

        for ( var i = 0 ; i < this.array.length ; i++ ) {
          this.delegate.put(this.array[i]);
        }
      }
    },

    function remove(obj, sub) {
      // TODO
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'DedupSink',
  extends: 'foam.dao.ProxySink',

  properties: [
    {
      /** @private */
      name: 'results_',
      hidden: true,
      factory: function() { return {}; }
    }
  ],

  methods: [
    {
      /** If the object to be put() has already been seen by this sink,
        ignore it */
      name: 'put',
      code: function put(obj, sub) {
        if ( ! this.results_[obj.id] ) {
          this.results_[obj.id] = true;
          return this.delegate.put(obj, sub);
        }
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'DescribeSink',
  documentation: 'Calls .describe() on every object.  Useful for debugging to quickly see what items are in a DAO.',
  implements: [ 'foam.dao.Sink' ],
  methods: [
    function put(o) {
      o.describe();
    },
    function remove() {},
    function eof() {},
    function reset() {}
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'FnSink',
  documentation: 'Converts all sink events to call to a singular function.' +
    '  Useful for subscribing a listener method to a DAO',
  properties: [
    'fn'
  ],
  methods: [
    function put(obj, s) {
      this.fn('put', obj, s);
    },
    function remove(obj, s) {
      this.fn('remove', obj, s);
    },
    function eof() {
      this.fn('eof');
    },
    function reset(s) {
      this.fn('reset', s);
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'FramedSink',
  extends: 'foam.dao.ProxySink',
  documentation: 'A proxy that waits until the next frame to flush the calls to the delegate.',
  properties: [
    { class: 'Array', name: 'calls' },
  ],
  methods: [
    {
      name: 'put',
      code: function(obj, s) {
        this.calls.push(['put', [obj, s]]);
        this.flushCalls();
      }
    },
    {
      name: 'remove',
      code: function(obj, s) {
        this.calls.push(['remove', [obj, s]]);
        this.flushCalls();
      }
    },
    {
      name: 'eof',
      code: function() {
        this.calls.push(['eof', []]);
        this.flushCalls();
      }
    },
    {
      name: 'reset',
      code: function(s) {
        this.calls = [['reset', [s]]];
        this.flushCalls();
      }
    }
  ],
  listeners: [
    {
      name: 'flushCalls',
      isMerged: 100,
      code: function() {
        var calls = this.calls;
        this.calls = [];
        for (var i = 0, o; o = calls[i]; i++) {
          this.delegate[o[0]].apply(this.delegate, o[1]);
        }
      }
    },
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'DAOSink',
  implements: ['foam.dao.Sink'],
  properties: [
    { class: 'foam.dao.DAOProperty', name: 'dao' },
  ],
  methods: [
    {
      name: 'put',
      code: function(o) {
        this.dao.put(o);
      }
    },
    {
      name: 'remove',
      code: function(o) {
        this.dao.remove(o);
      }
    },
    {
      name: 'eof',
      code: function() {},
    },
    {
      name: 'reset',
      code: function() {
        this.dao.removeAll();
      }
    }
  ],
});
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

foam.INTERFACE({
  package: 'foam.dao',
  name: 'DAO',

  documentation: 'DAO Interface',

  methods: [
    {
      name: 'put',
      returns: 'Promise',
      args: [ 'obj' ]
    },
    {
      name: 'remove',
      returns: 'Promise',
      args: [ 'obj' ]
    },
    {
      name: 'find',
      returns: 'Promise',
      args: [ 'id' ]
    },
    {
      name: 'select',
      returns: 'Promise',
      args: [ 'sink', 'skip', 'limit', 'order', 'predicate' ]
    },
    {
      name: 'removeAll',
      returns: '',
      args: [ 'skip', 'limit', 'order', 'predicate' ]
    },
    {
      name: 'listen',
      returns: '',
      args: [ 'sink', 'skip', 'limit', 'order', 'predicate' ]
    },
    {
      name: 'pipe', // TODO: return a promise? don't put pipe and listen here?
      returns: '',
      args: [ 'sink', 'skip', 'limit', 'order', 'predicate' ]
    },
    {
      name: 'where',
      returns: 'foam.dao.DAO',
      args: [ 'predicate' ]
    },
    {
      name: 'orderBy',
      returns: 'foam.dao.DAO',
      args: [ 'comparator' ]
    },
    {
      name: 'skip',
      returns: 'foam.dao.DAO',
      args: [ 'count' ]
    },
    {
      name: 'limit',
      returns: 'foam.dao.DAO',
      args: [ 'count' ]
    }
  ]
});
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

foam.CLASS({
  package: 'foam.dao',
  name: 'ProxyDAO',
  extends: 'foam.dao.AbstractDAO',
  requires: [
    'foam.dao.ProxyListener'
  ],

  documentation: 'Proxy implementation for the DAO interface.',

  properties: [
    {
      class: 'Proxy',
      of: 'foam.dao.DAO',
      name: 'delegate',
      forwards: [ 'put', 'remove', 'find', 'select', 'removeAll' ],
      topics: [ 'on' ], // TODO: Remove this when all users of it are updated.
      factory: function() { return foam.dao.NullDAO.create() },
      postSet: function(old, nu) {
        if ( old ) this.on.reset.pub();
      }
    },
    {
      name: 'of',
      factory: function() {
        return this.delegate.of;
      }
    }
  ],
  methods: [
    function listen(sink, skip, limit, order, predicate) {
      var listener = this.ProxyListener.create({
        delegate: sink,
        args: [skip, limit, order, predicate]
      });

      listener.onDetach(listener.dao$.follow(this.delegate$));

      return listener;
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'ProxyListener',
  implements: ['foam.dao.Sink'],
  properties: [
    'args',
    'delegate',
    {
      name: 'innerSub',
      postSet: function(_, s) {
        if (s) this.onDetach(s);
      }
    },
    {
      name: 'dao',
      postSet: function(old, nu) {
        this.innerSub && this.innerSub.detach();
        this.innerSub = nu && nu.listen.apply(nu, [this].concat(this.args));
        if ( old ) this.reset();
      }
    }
  ],
  methods: [
    function put(obj, s) {
      this.delegate.put(this, obj);
    },
    function remove(obj, s) {
      this.delegate.remove(this, obj);
    },
    function reset(s) {
      this.delegate.reset(this);
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'ArraySink',
  extends: 'foam.dao.AbstractSink',

  properties: [
    {
      class: 'Array',
      name: 'a'
    }
  ],

  methods: [
    function put(o, sub) {
      this.a.push(o);
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'PromisedDAO',
  extends: 'foam.dao.AbstractDAO',
  properties: [
    {
      class: 'Promised',
      of: 'foam.dao.DAO',
      methods: [ 'put', 'remove', 'find', 'select', 'removeAll', 'listen' ],
      name: 'promise'
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'LocalStorageDAO',
  extends: 'foam.dao.ArrayDAO',

  properties: [
    {
      name:  'name',
      label: 'Store Name',
      class:  'foam.core.String'
    }
  ],

  methods: [
    function init() {
      var objs = localStorage.getItem(this.name);
      if ( objs ) this.array = foam.json.parseString(objs, this);

      this.on.put.sub(this.updated);
      this.on.remove.sub(this.updated);

      // TODO: base on an indexed DAO
    }
  ],

  listeners: [
    {
      name: 'updated',
      isMerged: true,
      mergeDelay: 100,
      code: function() {
        localStorage.setItem(this.name, foam.json.stringify(this.array));
      }
    }
  ]
});


foam.LIB({
  name: 'foam.String',
  methods: [
    {
      name: 'daoize',
      code: foam.Function.memoize1(function(str) {
        // Turns SomeClassName into someClassNameDAO,
        // of package.ClassName into package.ClassNameDAO
        return str.substring(0, 1).toLowerCase() + str.substring(1) + 'DAO';
      })
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'InvalidArgumentException',
  extends: 'foam.dao.ExternalException',
  properties: [
    {
      class: 'String',
      name: 'message'
    }
  ]
});
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

foam.INTERFACE({
  package: 'foam.dao',
  name: 'DAODecorator',

  methods: [
    {
      name: 'write',
      returns: 'Promise',
      javaReturns: 'foam.core.FObject',
      args: [
        {
          name: 'context'
        },
        {
          name: 'dao'
        },
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        },
        {
          name: 'existing',
          javaType: 'foam.core.FObject'
        }
      ]
    },
    {
      name: 'read',
      returns: 'Promise',
      javaReturns: 'foam.core.FObject',
      args: [
        {
          name: 'context'
        },
        {
          name: 'dao'
        },
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        }
      ]
    },
    {
      name: 'remove',
      returns: 'Promise',
      javaReturns: 'foam.core.FObject',
      args: [
        {
          name: 'context'
        },
        {
          name: 'dao'
        },
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        }
      ]
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'AbstractDAODecorator',
  implements: ['foam.dao.DAODecorator'],
  methods: [
    function write(X, dao, obj, existing) {
      return Promise.resolve(obj);
    },
    function read(X, dao, obj) {
      return Promise.resolve(obj);
    },
    function remove(X, dao, obj) {
      return Promise.resolve(obj);
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'CompoundDAODecorator',
  implements: ['foam.dao.DAODecorator'],
  properties: [
    {
      class: 'Array',
      name: 'decorators'
    }
  ],
  methods: [
    function write(X, dao, obj, existing) {
      var i = 0;
      var d = this.decorators;

      return Promise.resolve(obj).then(function a(obj) {
        return d[i] ? d[i++].write(X, dao, obj, existing).then(a) : obj;
      });
    },
    function read(X, dao, obj) {
      var i = 0;
      var d = this.decorators;

      return Promise.resolve(obj).then(function a(obj) {
        return d[i] ? d[i++].read(X, dao, obj).then(a) : obj;
      });
    },
    function remove(X, dao, obj) {
      var i = 0;
      var d = this.decorators;

      return Promise.resolve(obj).then(function a(obj) {
        return d[i] ? d[i++].remove(X, dao, obj).then(a) : obj;
      });
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'DecoratedDAO',
  extends: 'foam.dao.ProxyDAO',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.dao.DAODecorator',
      name: 'decorator'
    },
    {
      name: 'dao'
    }
  ],

  methods: [
    {
      name: 'put',
      code: function(obj) {
        // TODO: obj.id can generate garbase, would be
        // slightly faster if DAO.find() could take an object
        // as well.
        var self = this;
        return ( ( ! obj.id ) ? Promise.resolve(null) : this.dao.find(obj.id) ).then(function(existing) {
          return self.decorator.write(self.__context__, self.dao, obj, existing);
        }).then(function(obj) {
          return self.delegate.put(obj);
        });
      }
    },
    {
      name: 'remove',
      code: function(obj) {
        var self = this;
        return this.decorator.remove(self.__context__, self.dao, self.obj).then(function(obj) {
          self.delegate.remove(obj);
        });
      }
    },
    {
      name: 'find',
      code: function(id) {
        var self = this;
        return this.delegate.find(id).then(function(obj) {
          return self.decorator.read(self.__context__, self.dao, obj);
        });
      }
    }
    // TODO: Select/removeAll support.  How do we do select
    // without breaking MDAO optimizations?
    // {
    //   name: 'select',
    //   code: function() {
    //   }
    // },
    // {
    //   name: 'removeAll',
    //   code: function() {
    //   }
    // }
  ]
});
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

foam.CLASS({
  package: 'foam.dao',
  name: 'AbstractDAO',
  implements: [ 'foam.dao.DAO' ],

  documentation: 'Abstract base class for implementing DAOs.',

  requires: [
    'foam.dao.ExternalException',
    'foam.dao.InternalException',
    'foam.dao.ObjectNotFoundException',
    'foam.dao.LimitedSink',
    'foam.dao.SkipSink',
    'foam.dao.OrderedSink',
    'foam.dao.PredicatedSink',
    'foam.dao.PipeSink',
    'foam.dao.ResetListener',
    'foam.dao.PredicatedListener',
    'foam.dao.SkipListener',
    'foam.dao.LimitedListener',
    'foam.dao.OrderedListener',
    'foam.dao.FilteredDAO',
    'foam.dao.OrderedDAO',
    'foam.dao.SkipDAO',
    'foam.dao.LimitedDAO'
  ],

  topics: [
    {
      name: 'on',
      topics: [
        'put',
        'remove',
        'reset'
      ]
    }
  ],

  properties: [
    {
      /**
        Set to the name or class instance of the type of object the DAO
        will store.
      */
      class: 'Class',
      name: 'of'
    }
  ],

  methods: [
    {
      /**
        Returns a filtered DAO that only returns objects which match the
        given predicate.
      */
      name: 'where',
      code: function where(p) {
        return this.FilteredDAO.create({
          delegate: this,
          predicate: p
        });
      }
    },

    {
      /**
        Returns a filtered DAO that orders select() by the given
        ordering.
      */
      name: 'orderBy',
      code: function orderBy() {
        return this.OrderedDAO.create({
          delegate: this,
          comparator: foam.compare.toCompare(Array.from(arguments))
        });
      }
    },

    {
      /**
        Returns a filtered DAO that skips the given number of items
        on a select()
      */
      name: 'skip',
      code: function skip(/* Number */ s) {
        return this.SkipDAO.create({
          delegate: this,
          skip_: s
        });
      }
    },

    {
      /**
        Returns a filtered DAO that stops producing items after the
        given count on a select().
      */
      name: 'limit',
      code: function limit(/* Number */ l) {
        return this.LimitedDAO.create({
          delegate: this,
          limit_: l
        });
      }
    },

    /**
      Selects the contents of this DAO into a sink, then listens to keep
      the sink up to date. Returns a promise that resolves with the subscription.
      TODO: This will probably miss events that happen during the select but before the
      listen call.  We should check if this is the case and fix it if so.
    */
    function pipe(sink) {//, skip, limit, order, predicate) {
      var dao = this;

      var sink = this.PipeSink.create({
        delegate: sink,
        dao: this
      });

      var sub = this.listen(sink); //, skip, limit, order, predicate);
      sink.reset();

      return sub;
    },

    /**
      Keeps the given sink up to date with changes to this DAO.
    */
    function listen(sink, skip, limit, order, predicate) {
      var mySink = this.decorateListener_(sink, skip, limit, order, predicate);

      var sub = foam.core.FObject.create();

      sub.onDetach(this.on.sub(function(s, on, e, obj) {
        switch(e) {
          case 'put':
            mySink.put(obj, sub);
            break;
          case 'remove':
            mySink.remove(obj, sub);
            break;
          case 'reset':
            mySink.reset(sub);
            break;
        }
      }));

      return sub;
    },

    function decorateListener_(sink, skip, limit, order, predicate) {
      // TODO: There are probably optimizations we can make here
      // but every time I try it comes out broken.  So for the time being,
      // if you have any sort of skip/limit/order/predicate we will just
      // issue reset events for everything.
      if ( skip != undefined || limit != undefined || order != undefined || predicate != undefined ) {
        return this.ResetListener.create({ delegate: sink });
      }

      return sink;
    },

    /**
      Used by DAO implementations to apply filters to a sink, often in a
      select() or removeAll() implementation.
      @private
    */
    function decorateSink_(sink, skip, limit, order, predicate) {
      if ( limit != undefined ) {
        sink = this.LimitedSink.create({
          limit: limit,
          delegate: sink
        });
      }

      if ( skip != undefined ) {
        sink = this.SkipSink.create({
          skip: skip,
          delegate: sink
        });
      }

      if ( order != undefined ) {
        sink = this.OrderedSink.create({
          comparator: order,
          delegate: sink
        });
      }

      if ( predicate != undefined ) {
        sink = this.PredicatedSink.create({
          predicate: predicate.partialEval ?
            predicate.partialEval() :
            predicate,
          delegate: sink
        });
      }

      return sink;
    },

    function compareTo(other) {
      if ( ! other ) return 1;
      return this === other ? 0 : foam.util.compare(this.$UID, other.$UID);
    },

    // Placeholder functions to that selecting from DAO to DAO works.
    /** @private */
    function eof() {},

    /** @private */
    function reset() {}
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'Exception',
  properties: [
    'message'
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'InternalException',
  extends: 'Exception'
});


foam.CLASS({
  package: 'foam.dao',
  name: 'ExternalException',
  extends: 'Exception'
})

foam.CLASS({
  package: 'foam.dao',
  name: 'FilteredDAO',
  extends: 'foam.dao.AbstractDAO',

  requires: [
    'foam.mlang.predicate.And'
  ],

  properties: [
    {
      name: 'predicate',
      required: true
    },
    {
      name: 'of',
      factory: function() {
        return this.delegate.of;
      }
    },
    {
      class: 'Proxy',
      of: 'foam.dao.DAO',
      name: 'delegate',
      topics: [ 'on' ], // TODO: Remove this when all users of it are updated.
      forwards: [ 'put', 'remove', 'find', 'select', 'removeAll' ]
    }
  ],

  methods: [
    function find(key) {
      var predicate = this.predicate;
      return this.delegate.find(key).then(function(o) {
        return predicate.f(o) ? o : null;
      });
    },
    function select(sink, skip, limit, order, predicate) {
      return this.delegate.select(
        sink, skip, limit, order,
        predicate ?
          this.And.create({ args: [this.predicate, predicate] }) :
          this.predicate);
    },

    function removeAll(skip, limit, order, predicate) {
      return this.delegate.removeAll(
        skip, limit, order,
        predicate ?
          this.And.create({ args: [this.predicate, predicate] }) :
          this.predicate);
    },

    function listen(sink, skip, limit, order, predicate) {
      return this.delegate.listen(
        sink,
        skip, limit, order,
        predicate ?
          this.And.create({ args: [this.predicate, predicate] }) :
          this.predicate);
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'OrderedDAO',
  extends: 'foam.dao.ProxyDAO',

  properties: [
    {
      name: 'comparator'
    }
  ],

  methods: [
    function select(sink, skip, limit, order, predicate) {
      return this.delegate.select(sink, skip, limit, order ? order : this.comparator, predicate);
    },
    function removeAll(skip, limit, order, predicate) {
      return this.delegate.removeAll(skip, limit, order ? order : this.comparator, predicate);
    },
    function listen(sink, skip, limit, order, predicate) {
      return this.delegate.listen(sink, skip, limit, order ? order : this.comparator, predicate);
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'SkipDAO',
  extends: 'foam.dao.ProxyDAO',

  properties: [
    {
      name: 'skip_'
    }
  ],

  methods: [
    function select(sink, skip, limit, order, predicate) {
      return this.delegate.select(sink, this.skip_, limit, order, predicate);
    },
    function removeAll(skip, limit, order, predicate) {
      return this.delegate.removeAll(this.skip_, limit, order, predicate);
    },
    function listen(sink, skip, limit, order, predicate) {
      return this.delegate.listen(sink, this.skip_, limit, order, predicate);
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'LimitedDAO',
  extends: 'foam.dao.ProxyDAO',

  properties: [
    {
      name: 'limit_'
    }
  ],

  methods: [
    function select(sink, skip, limit, order, predicate) {
      return this.delegate.select(
        sink, skip,
        limit !== undefined ? Math.min(this.limit_, limit) : this.limit_,
        order, predicate);
    },

    function removeAll(skip, limit, order, predicate) {
      return this.delegate.removeAll(
        skip,
        limit !== undefined ? Math.min(this.limit_, limit) : this.limit_,
        order, predicate);
    },

    function listen(sink, skip, limit, order, predicate) {
      return this.delegate.listen(
        sink, skip,
        limit !== undefined ? Math.min(this.limit_, limit) : this.limit_,
        order, predicate);
    }
  ]
});
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

foam.CLASS({
  package: 'foam.dao',
  name: 'DAOProperty',
  extends: 'Property',

  documentation: 'Property for storing a reference to a DAO.',

  requires: [ 'foam.dao.ProxyDAO' ],

  properties: [
    {
      name: 'view',
      value: {class: 'foam.comics.InlineBrowserView'},
    }
  ],

  methods: [
    function installInProto(proto) {
      this.SUPER(proto);

      var name = this.name;
      var prop = this;

      Object.defineProperty(proto, name + '$proxy', {
        get: function daoProxyGetter() {
          var proxy = prop.ProxyDAO.create({delegate: this[name]});
          this[name + '$proxy'] = proxy;

          this.sub('propertyChange', name, function(_, __, ___, s) {
            proxy.delegate = s.get();
          });

          return proxy;
        },
        configurable: true
      });
    }
  ]
});
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

// TODO(braden): Port the partialEval() code over here.

foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Count',
  extends: 'foam.dao.AbstractSink',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Sink which counts number of objects put().',

  properties: [
    {
      class: 'Int',
      name: 'value'
    }
  ],

  methods: [
    function put() { this.value++; },
    function remove() { this.value--; },
    function reset() { this.value = 0; },
    function toString() { return 'COUNT()'; }
  ]
});


foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'NullSink',
  extends: 'foam.dao.AbstractSink',
  implements: ['foam.core.Serializable'],

  documentation: 'Null Pattern (do-nothing) Sink.',

  axioms: [
    foam.pattern.Singleton.create()
  ]
});


foam.INTERFACE({
  package: 'foam.mlang',
  name: 'Expr',

  documentation: 'Expression interface: f(obj) -> val.',

  methods: [
    {
      name: 'f',
      args: [ 'obj' ]
    },
    {
      name: 'partialEval'
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang',
  name: 'ExprProperty',
  extends: 'FObjectProperty',

  documentation: 'Property for Expr values.',

  properties: [
    {
      name: 'adapt',
      value: function(_, o) {
        if ( o === null )                       return foam.mlang.Constant.create({ value: null });
        if ( ! o.f && typeof o === 'function' ) return foam.mlang.predicate.Func.create({ fn: o });
        if ( typeof o !== 'object' )            return foam.mlang.Constant.create({ value: o });
        if ( o instanceof Date )                return foam.mlang.Constant.create({ value: o });
        if ( Array.isArray(o) )                 return foam.mlang.Constant.create({ value: o });
        if ( foam.core.FObject.isInstance(o) )  return o;

        console.error('Invalid expression value: ', o);
      }
    }
  ]
});


foam.INTERFACE({
  package: 'foam.mlang.predicate',
  name: 'Predicate',

  documentation: 'Predicate interface: f(obj) -> boolean.',

  methods: [
    {
      name: 'f',
      args: [
        'obj'
      ]
    },
    {
      name: 'partialEval'
    },
    {
      name: 'toIndex',
      args: [
        'tail'
      ]
    },
    {
      name: 'toDisjunctiveNormalForm'
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'PredicateProperty',
  extends: 'FObjectProperty',

  documentation: 'Property for Predicate values.',

  properties: [
    ['of', 'foam.mlang.predicate.Predicate'],
    {
      name: 'adapt',
      value: function(_, o) {
        if ( ! o.f && typeof o === "function" ) return foam.mlang.predicate.Func.create({ fn: o });
        return o;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'PredicateArray',
  extends: 'FObjectArray',

  documentation: 'Property for storing arrays of Predicates.',

  properties: [
    {
      name: 'of',
      value: 'foam.mlang.predicate.Predicate'
    },
    {
      name: 'adaptArrayElement',
      // TODO?: Make into a multi-method?
      value: function(o) {
        if ( o === null ) return foam.mlang.Constant.create({ value: o });
        if ( ! o.f && typeof o === "function" ) return foam.mlang.predicate.Func.create({ fn: o });
        if ( typeof o !== "object" ) return foam.mlang.Constant.create({ value: o });
        if ( Array.isArray(o) ) return foam.mlang.Constant.create({ value: o });
        if ( o === true ) return foam.mlang.predicate.True.create();
        if ( o === false ) return foam.mlang.predicate.False.create();
        if ( foam.core.FObject.isInstance(o) ) return o;
        console.error('Invalid expression value: ', o);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'AbstractPredicate',
  abstract: true,
  implements: [ 'foam.mlang.predicate.Predicate' ],

  documentation: 'Abstract Predicate base-class.',

  methods: [
    function toIndex() { },

    function toDisjunctiveNormalForm() { return this; },

    function partialEval() { return this; },

    function toString() { return this.cls_.name; }
  ]
});


foam.CLASS({
  package: 'foam.mlang',
  name: 'AbstractExpr',
  abstract: true,
  implements: [ 'foam.mlang.Expr' ],

  documentation: 'Abstract Expr base-class.',

  methods: [
    function partialEval() { return this; }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'True',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Expression which always returns true.',

  axioms: [ foam.pattern.Singleton.create() ],

  methods: [
    function f() { return true; }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'False',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Expression which always returns false.',

  axioms: [ foam.pattern.Singleton.create() ],

  methods: [
    function f() { return false; }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Unary',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  abstract: true,

  documentation: 'Abstract Unary (single-argument) Predicate base-class.',

  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg1'
    }
  ],

  methods: [
    function toIndex(tail) {
      return this.arg1 && this.arg1.toIndex(tail);
    },

    function toString() {
      return foam.String.constantize(this.cls_.name) +
          '(' + this.arg1.toString() + ')';
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Binary',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  abstract: true,

  documentation: 'Abstract Binary (two-argument) Predicate base-class.',

  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg1'
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg2'
    }
  ],

  methods: [
    function toIndex(tail) {
      return this.arg1 && this.arg1.toIndex(tail);
    },

    function toString() {
      return foam.String.constantize(this.cls_.name) + '(' +
          this.arg1.toString() + ', ' +
          this.arg2.toString() + ')';
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Nary',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  abstract: true,

  documentation: 'Abstract n-ary (many-argument) Predicate base-class.',

  properties: [
    {
      class: 'foam.mlang.predicate.PredicateArray',
      name: 'args'
    }
  ],

  methods: [
    function toString() {
      var s = foam.String.constantize(this.cls_.name) + '(';
      for ( var i = 0 ; i < this.args.length ; i++ ) {
        var a = this.args[i];
        s += a.toString();
        if ( i < this.args.length - 1 ) s += ', ';
      }
      return s + ')';
    },
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Or',
  extends: 'foam.mlang.predicate.Nary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Logical Or n-ary Predicate.',

  requires: [
    'foam.mlang.predicate.False',
    'foam.mlang.predicate.True'
  ],

  methods: [
    {
      name: 'f',
      code: function f(o) {
        for ( var i = 0 ; i < this.args.length ; i++ ) {
          if ( this.args[i].f(o) ) return true;
        }
        return false;
      }
    },

    function partialEval() {
      var newArgs = [];
      var updated = false;

      var TRUE  = this.True.create();
      var FALSE = this.False.create();

      for ( var i = 0 ; i < this.args.length ; i++ ) {
        var a    = this.args[i];
        var newA = this.args[i].partialEval();

        if ( newA === TRUE ) return TRUE;

        if ( this.cls_.isInstance(newA) ) {
          // In-line nested OR clauses
          for ( var j = 0 ; j < newA.args.length ; j++ ) {
            newArgs.push(newA.args[j]);
          }
          updated = true;
        }
        else {
          if ( newA !== FALSE ) {
            newArgs.push(newA);
          }
          if ( a !== newA ) updated = true;
        }
      }

      /*
      TODO(braden): Implement partialOr and PARTIAL_OR_RULES, for full partial
      eval support. Currently this is only dropping FALSE, and short-circuiting
      on TRUE.

      for ( var i = 0 ; i < newArgs.length-1 ; i++ ) {
        for ( var j = i+1 ; j < newArgs.length ; j++ ) {
          var a = this.partialOr(newArgs[i], newArgs[j]);
          if ( a ) {
            if ( a === TRUE ) return TRUE;
            newArgs[i] = a;
            newArgs.splice(j, 1);
          }
        }
      }
      */

      if ( newArgs.length === 0 ) return FALSE;
      if ( newArgs.length === 1 ) return newArgs[0];

      return updated ? this.cls_.create({ args: newArgs }) : this;
    },

    function toIndex(tail) { },

    function toDisjunctiveNormalForm() {
      // TODO: memoization around this process?
      // DNF our args, note if anything changes
      var oldArgs = this.args;
      var newArgs = [];
      var changed = false;
      for (var i = 0; i < oldArgs.length; i++ ) {
        var a = oldArgs[i].toDisjunctiveNormalForm();
        if ( a !== oldArgs[i] ) changed = true;
        newArgs[i] = a;
      }

      // partialEval will take care of nested ORs
      var self = this;
      if ( changed ) {
        self = this.clone();
        self.args = newArgs;
        self = self.partialEval();
      }

      return self;
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'And',
  extends: 'foam.mlang.predicate.Nary',
  implements: ['foam.core.Serializable'],

  documentation: 'Logical And n-ary Predicate.',

  requires: [
    'foam.mlang.predicate.Or'
  ],

  methods: [
    {
      name: 'f',
      code: function(o) {
        for ( var i = 0 ; i < this.args.length ; i++ ) {
          if ( ! this.args[i].f(o) ) return false;
        }
        return true;
      }
    },

    function partialEval() {
      var newArgs = [];
      var updated = false;

      var FALSE = foam.mlang.predicate.False.create();
      var TRUE = foam.mlang.predicate.True.create();

      for ( var i = 0; i < this.args.length; i++ ) {
        var a    = this.args[i];
        var newA = this.args[i].partialEval();

        if ( newA === FALSE ) return FALSE;

        if ( this.cls_.isInstance(newA) ) {
          // In-line nested AND clauses
          for ( var j = 0 ; j < newA.args.length ; j++ ) {
            newArgs.push(newA.args[j]);
          }
          updated = true;
        }
        else {
          if ( newA === TRUE ) {
            updated = true;
          } else {
            newArgs.push(newA);
            if ( a !== newA ) updated = true;
          }
        }
      }

      /*
      TODO(braden): Implement partialAnd and PARTIAL_AND_RULES, for full partial
      eval support. Currently it just drops TRUE and bails on FALSE.

      for ( var i = 0; i < newArgs.length - 1; i++ ) {
        for ( var j = i + 1; j < newArgs.length; j++ ) {
          var a = this.partialAnd(newArgs[i], newArgs[j]);
          if ( a ) {
            if ( a === FALSE ) return FALSE;
            newArgs[i] = a;
            newArgs.splice(j, 1);
          }
        }
      }
      */

      if ( newArgs.length === 0 ) return TRUE;
      if ( newArgs.length === 1 ) return newArgs[0];

      return updated ? this.cls_.create({ args: newArgs }) : this;
    },

    function toIndex(tail, depth) {
      /** Builds the ideal index for this predicate. The indexes will be chained
          in order of index uniqueness (put the most indexable first):
          This prevents dropping to scan mode too early, and restricts
          the remaning set more quickly.
           i.e. EQ, IN,... CONTAINS, ... LT, GT...
        @param depth {number} The maximum number of sub-indexes to chain.
      */
      depth = depth || 99;

      if ( depth === 1 ) {
        // generate indexes, find costs, use the fastest
        var bestCost = Number.MAX_VALUE;
        var bestIndex;
        var args = this.args;
        for (var i = 0; i < args.length; i++ ) {
          var arg = args[i];
          var idx = arg.toIndex(tail);
          if ( ! idx ) continue;

          var idxCost = Math.floor(idx.estimate(
             1000, undefined, undefined, undefined, undefined, arg));

          if ( bestCost > idxCost ) {
            bestIndex = idx;
            bestCost = idxCost;
          }
        }
        return bestIndex;

      } else {
        // generate indexes, sort by estimate, chain as requested
        var sortedArgs = Object.create(null);
        var costs = [];
        var args = this.args;
        var dupes = {}; // avoid duplicate indexes
        for (var i = 0; i < args.length; i++ ) {
          var arg = args[i];
          var idx = arg.toIndex(tail);
          if ( ! idx ) continue;

          // duplicate check
          var idxString = idx.toString();
          if ( dupes[idxString] ) continue;
          dupes[idxString] = true;

          var idxCost = Math.floor(idx.estimate(
             1000, undefined, undefined, undefined, undefined, arg));
          // make unique with a some extra digits
          var costKey = idxCost + i / 1000.0;
          sortedArgs[costKey] = arg;
          costs.push(costKey);
        }
        costs = costs.sort(foam.Number.compare);

        // Sort, build list up starting at the end (most expensive
        //   will end up deepest in the index)
        var tailRet = tail;
        var chainDepth = Math.min(costs.length - 1, depth - 1);
        for ( var i = chainDepth; i >= 0; i-- ) {
          var arg = sortedArgs[costs[i]];
          //assert(arg is a predicate)
          tailRet = arg.toIndex(tailRet);
        }

        return tailRet;
      }
    },

    function toDisjunctiveNormalForm() {
      // for each nested OR, multiply:
      // AND(a,b,OR(c,d),OR(e,f)) -> OR(abce,abcf,abde,abdf)

      var andArgs = [];
      var orArgs  = [];
      var oldArgs = this.args;
      for (var i = 0; i < oldArgs.length; i++ ) {
        var a = oldArgs[i].toDisjunctiveNormalForm();
        if ( this.Or.isInstance(a) ) {
          orArgs.push(a);
        } else {
          andArgs.push(a);
        }
      }

      if ( orArgs.length > 0 ) {
        var newAndGroups = [];
        // Generate every combination of the arguments of the OR clauses
        // orArgsOffsets[g] represents the array index we are lookig at
        // in orArgs[g].args[offset]
        var orArgsOffsets = new Array(orArgs.length).fill(0);
        var active = true;
        var idx = orArgsOffsets.length - 1;
        orArgsOffsets[idx] = -1; // compensate for intial ++orArgsOffsets[idx]
        while ( active ) {
          while ( ++orArgsOffsets[idx] >= orArgs[idx].args.length ) {
            // reset array index count, carry the one
            if ( idx === 0 ) { active = false; break; }
            orArgsOffsets[idx] = 0;
            idx--;
          }
          idx = orArgsOffsets.length - 1;
          if ( ! active ) break;

          // for the last group iterated, read back up the indexes
          // to get the result set
          var newAndArgs = [];
          for ( var j = orArgsOffsets.length - 1; j >= 0; j-- ) {
            newAndArgs.push(orArgs[j].args[orArgsOffsets[j]]);
          }
          newAndArgs = newAndArgs.concat(andArgs);

          newAndGroups.push(
            this.cls_.create({ args: newAndArgs })
          );
        }
        return this.Or.create({ args: newAndGroups }).partialEval();
      } else {
        // no OR args, no DNF transform needed
        return this;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Contains',
  extends: 'foam.mlang.predicate.Binary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Predicate returns true iff second arg found in first array argument.',

  methods: [
    {
      name: 'f',
      code: function(o) {
        var s1 = this.arg1.f(o);
        return s1 ? s1.indexOf(this.arg2.f(o)) !== -1 : false;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'ContainsIC',
  extends: 'foam.mlang.predicate.Binary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Predicate returns true iff second arg found in first array argument, ignoring case.',

  methods: [
    function f(o) {
      var s1 = this.arg1.f(o);
      var s2 = this.arg2.f(o);
      if ( typeof s1 !== 'string' || typeof s2 !== 'string' ) return false;
      // TODO(braden): This is faster if we use a regex with the ignore-case
      // option. That requires regex escaping arg2, though.
      // TODO: port faster version from FOAM1
      var uc1 = s1.toUpperCase();
      var uc2 = s2.toUpperCase();
      return uc1.indexOf(uc2) !== -1;
    },
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'StartsWith',
  extends: 'foam.mlang.predicate.Binary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Predicate returns true iff arg1 starts with arg2 or if arg1 is an array, if an element starts with arg2.',

  methods: [
    {
      name: 'f',
      code: function(o) {
        var arg1 = this.arg1.f(o);
        var arg2 = this.arg2.f(o);

        if ( Array.isArray(arg1) ) {
          return arg1.some(function(arg) {
            return arg.startsWith(arg2);
          });
        }

        return arg1.startsWith(arg2);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'StartsWithIC',
  extends: 'foam.mlang.predicate.Binary',
  implements: ['foam.core.Serializable'],

  documentation: 'Predicate returns true iff arg1 starts with arg2 or if arg1 is an array, if an element starts with arg2, ignoring case.',

  methods: [
    {
      name: 'f',
      code: function f(o) {
        var arg1 = this.arg1.f(o);
        var arg2 = this.arg2.f(o);

        if ( Array.isArray(arg1) ) {
          return arg1.some(function(arg) {
            return foam.String.startsWithIC(arg, arg2);
          });
        }

        return foam.String.startsWithIC(arg1, arg2);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'In',
  extends: 'foam.mlang.predicate.Binary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Predicate returns true iff arg1 is a substring of arg2, or if arg2 is an array, is an element of arg2.',

  properties: [
    {
      name: 'arg1',
      postSet: function(old, nu) {
        // this is slightly slower when an expression on upperCase_
        this.upperCase_ = nu && foam.core.Enum.isInstance(nu);
      }
    },
    {
      name: 'arg2',
      postSet: function() {
        this.valueSet_ = null;
      }
    },
    {
      // TODO: simpler to make an expression
      name: 'valueSet_'
    },
    {
      name: 'upperCase_',
    }
  ],

  methods: [
    function f(o) {
      var lhs = this.arg1.f(o);
      var rhs = this.arg2.f(o);

      // If arg2 is a constant array, we use valueSet for it.
      if ( foam.mlang.Constant.isInstance(this.arg2) ) {
        if ( ! this.valueSet_ ) {
          var set = {};
          for ( var i = 0 ; i < rhs.length ; i++ ) {
            var s = rhs[i];
            if ( this.upperCase_ ) s = s.toUpperCase();
            set[s] = true;
          }
          this.valueSet_ = set;
        }

        return !! this.valueSet_[lhs];
      }

      return rhs ? rhs.indexOf(lhs) !== -1 : false;
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'InIC',
  extends: 'foam.mlang.predicate.Binary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Predicate returns true iff arg1 is a substring of arg2, or if arg2 is an array, is an element of arg2, case insensitive.',

  properties: [
    {
      name: 'arg2',
      postSet: function() { this.valueSet_ = null; }
    },
    {
      // TODO: simpler to make an expression
      name: 'valueSet_'
    }
  ],

  methods: [
    function f(o) {
      var lhs = this.arg1.f(o).toUpperCase();
      var rhs = this.arg2.f(o);

      // If arg2 is a constant array, we use valueSet for it.
      if ( foam.mlang.Constant.isInstance(this.arg2) ) {
        if ( ! this.valueSet_ ) {
          var set = {};
          for ( var i = 0 ; i < rhs.length ; i++ ) {
            set[rhs[i].toUpperCase()] = true;
          }
          this.valueSet_ = set;
        }

        return !! this.valueSet_[lhs];
      } else {
        if ( ! rhs ) return false;
        return rhs.toUpperCase().indexOf(lhs) !== -1;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang',
  name: 'Constant',
  extends: 'foam.mlang.AbstractExpr',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'An Expression which always returns the same constant value.',

  properties: [
    {
      class: 'Object',
      name: 'value'
    }
  ],

  methods: [
    function f() { return this.value; },

    function toString_(x) {
      return typeof x === 'number' ? '' + x :
        typeof x === 'string' ? '"' + x + '"' :
        Array.isArray(x) ? '[' + x.map(this.toString_.bind(this)).join(', ') + ']' :
        x.toString ? x.toString() :
        x;
    },

    function toString() { return this.toString_(this.value); },

    // TODO(adamvy): Re-enable when we can parse this in java more correctly.
    function xxoutputJSON(os) {
      os.output(this.value);
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Func',
  extends: 'foam.mlang.predicate.AbstractPredicate',

  documentation: 'A function to Predicate adapter.',

  // TODO: rename FunctionPredicate

  properties: [
    {
      /** The function to apply to objects passed to this expression */
      name: 'fn'
    }
  ],

  methods: [
    function f(o) { return this.fn(o); },
    function toString() {
      return 'FUNC(' + fn.toString() + ')';
    }
  ]
});


/** Binary expression for equality of two arguments. */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Eq',
  extends: 'foam.mlang.predicate.Binary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Binary Predicate returns true iff arg1 EQUALS arg2.',

  methods: [
    {
      name: 'f',
      code: function(o) {
        var v1 = this.arg1.f(o);
        var v2 = this.arg2.f(o);

        // First check is so that EQ(Class.PROPERTY, null | undefined) works.
        return ( v1 === undefined && v2 === null ) || foam.util.equals(v1, v2);
      }
    }
  ]
});


/** Binary expression for inequality of two arguments. */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Neq',
  extends: 'foam.mlang.predicate.Binary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Binary Predicate returns true iff arg1 does NOT EQUAL arg2.',

  methods: [
    {
      name: 'f',
      code: function(o) {
        return ! foam.util.equals(this.arg1.f(o), this.arg2.f(o));
      }
    }
  ]
});


/** Binary expression for "strictly less than". */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Lt',
  extends: 'foam.mlang.predicate.Binary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Binary Predicate returns true iff arg1 is LESS THAN arg2.',

  methods: [
    {
      name: 'f',
      code: function(o) {
        return foam.util.compare(this.arg1.f(o), this.arg2.f(o)) < 0;
      }
    }
  ]
});


/** Binary expression for "less than or equal to". */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Lte',
  extends: 'foam.mlang.predicate.Binary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Binary Predicate returns true iff arg1 is LESS THAN or EQUAL to arg2.',

  methods: [
    {
      name: 'f',
      code: function(o) {
        return foam.util.compare(this.arg1.f(o), this.arg2.f(o)) <= 0;
      }
    }
  ]
});


/** Binary expression for "strictly greater than". */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Gt',
  extends: 'foam.mlang.predicate.Binary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Binary Predicate returns true iff arg1 is GREATER THAN arg2.',

  methods: [
    {
      name: 'f',
      code: function(o) {
        return foam.util.compare(this.arg1.f(o), this.arg2.f(o)) > 0;
      }
    }
  ]
});


/** Binary expression for "greater than or equal to". */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Gte',
  extends: 'foam.mlang.predicate.Binary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Binary Predicate returns true iff arg1 is GREATER THAN or EQUAL to arg2.',


  methods: [
    {
      name: 'f',
      code: function(o) {
        return foam.util.compare(this.arg1.f(o), this.arg2.f(o)) >= 0;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Has',
  extends: 'foam.mlang.predicate.Unary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Unary Predicate that returns true iff the given property has a value other than null, undefined, \'\', or [].',

  methods: [
    function f(obj) {
      var value = this.arg1.f(obj);

      return ! (
        value === undefined ||
        value === null      ||
        value === ''        ||
        (Array.isArray(value) && value.length === 0) );
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Not',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Unary Predicate which negates the value of its argument.',

  properties: [
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'arg1'
    }
  ],

  methods: [
    function f(obj) { return ! this.arg1.f(obj); },

    function toString() {
      return foam.String.constantize(this.cls_.name) +
          '(' + this.arg1.toString() + ')';
    },

    /*
      TODO: this isn't ported to FOAM2 yet.
    function partialEval() {
      return this;
      var newArg = this.arg1.partialEval();

      if ( newArg === TRUE ) return FALSE;
      if ( newArg === FALSE ) return TRUE;
      if ( NotExpr.isInstance(newArg) ) return newArg.arg1;
      if ( EqExpr.isInstance(newArg)  ) return NeqExpr.create(newArg);
      if ( NeqExpr.isInstance(newArg) ) return EqExpr.create(newArg);
      if ( LtExpr.isInstance(newArg)  ) return GteExpr.create(newArg);
      if ( GtExpr.isInstance(newArg)  ) return LteExpr.create(newArg);
      if ( LteExpr.isInstance(newArg) ) return GtExpr.create(newArg);
      if ( GteExpr.isInstance(newArg) ) return LtExpr.create(newArg);

      return this.arg1 === newArg ? this : NOT(newArg);
    }*/
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Keyword',
  extends: 'foam.mlang.predicate.Unary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Unary Predicate for generic keyword search (searching all String properties for argument substring).',

  requires: [
    'foam.core.String'
  ],

  methods: [
    function f(obj) {
      var arg = this.arg1.f(obj);
      if ( ! arg || typeof arg !== 'string' ) return false;

      arg = arg.toLowerCase();

      var props = obj.cls_.getAxiomsByClass(this.String);
      for ( var i = 0; i < props.length; i++ ) {
        var s = props[i].f(obj);
        if ( ! s || typeof s !== 'string' ) continue;
        if ( s.toLowerCase().indexOf(arg) >= 0 ) return true;
      }

      return false;
    }
  ]
});


/** Map sink transforms each put with a given mapping expression. */
foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Map',
  extends: 'foam.dao.ProxySink',

  implements: [
    'foam.mlang.predicate.Unary',
    'foam.core.Serializable'
  ],

  documentation: 'Sink Decorator which applies a map function to put() values before passing to delegate.',

  methods: [
    function f(o) { return this.arg1.f(o); },

    function put(o, sub) { this.delegate.put(this.f(o), sub); }
  ]
});


foam.CLASS({
  package: 'foam.mlang.expr',
  name: 'Mul',

  implements: [
    'foam.mlang.predicate.Binary',
    'foam.core.Serializable'
  ],

  documentation: 'Multiplication Binary Expression.',

  methods: [
    function f(o) { return this.arg1.f(o) * this.arg2.f(o); }
  ]
});


foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'GroupBy',
  extends: 'foam.dao.AbstractSink',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Sink which behaves like the SQL group-by command.',

  // TODO: it makes no sense to name the arguments arg1 and arg2
  // because this isn't an expression, so they should be more meaningful
  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg1'
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg2'
    },
    {
      name: 'groups',
      factory: function() { return {}; }
    },
    {
      class: 'StringArray',
      name: 'groupKeys',
      factory: function() { return []; }
    },
    {
      class: 'Boolean',
      name: 'processArrayValuesIndividually',
      documentation: 'If true, each value of an array will be entered into a separate group.',
      factory: function() {
        // TODO: it would be good if it could also detect RelationshipJunction.sourceId/targetId
        return ! foam.core.MultiPartID.isInstance(this.arg1);
      }
    }
  ],

  methods: [
    function sortedKeys(opt_comparator) {
      this.groupKeys.sort(opt_comparator || this.arg1.comparePropertyValues);
      return this.groupKeys;
    },

    function putInGroup_(sub, key, obj) {
      var group = this.groups.hasOwnProperty(key) && this.groups[key];
      if ( ! group ) {
        group = this.arg2.clone();
        this.groups[key] = group;
        this.groupKeys.push(key);
      }
      group.put(obj, sub);
    },

    function put(obj, sub) {
      var key = this.arg1.f(obj);
      if ( this.processArrayValuesIndividually && Array.isArray(key) ) {
        if ( key.length ) {
          for ( var i = 0; i < key.length; i++ ) {
            this.putInGroup_(sub, key[i], obj);
          }
        } else {
          // Perhaps this should be a key value of null, not '', since '' might
          // actually be a valid key.
          this.putInGroup_(sub, '', obj);
        }
      } else {
        this.putInGroup_(sub, key, obj);
      }
    },

    function eof() { },

    function clone() {
      // Don't use the default clone because we don't want to copy 'groups'.
      return this.cls_.create({ arg1: this.arg1, arg2: this.arg2 });
    },

    function toString() {
      return this.groups.toString();
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Unique',
  extends: 'foam.dao.ProxySink',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Sink decorator which only put()\'s a single obj for each unique expression value.',

  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'expr'
    },
    {
      name: 'values',
      factory: function() { return {}; }
    }
  ],

  methods: [
    function putInGroup_(key, obj) {
      var group = this.groups.hasOwnProperty(key) && this.groups[key];
      if ( ! group ) {
        group = this.arg2.clone();
        this.groups[key] = group;
        this.groupKeys.push(key);
      }
      group.put(obj);
    },

    function put(sub, obj) {
      var value = this.expr.f(obj);
      if ( Array.isArray(value) ) {
        throw 'Unique doesn\'t Array values.';
      } else {
        if ( ! this.values.hasOwnProperty(value) ) {
          this.values[value] = obj;
          this.delegate.put(obj);
        }
      }
    },

    function eof() { },

    function clone() {
      // Don't use the default clone because we don't want to copy 'uniqueValues'.
      return this.cls_.create({ expr: this.expr, delegate: this.delegate });
    },

    function toString() {
      return this.uniqueValues.toString();
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Explain',
  extends: 'foam.dao.ProxySink',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Pseudo-Sink which outputs a human-readable description of an MDAO\'s execution plan for evaluating it.',

  properties: [
    {
      class: 'String',
      name:  'plan',
      help:  'Execution Plan'
    }
  ],

  methods: [
    function toString() { return this.plan; },
  ]
});


foam.INTERFACE({
  package: 'foam.mlang.order',
  name: 'Comparator',

  documentation: 'Interface for comparing two values: -1: o1 < o2, 0: o1 == o2, 1: o1 > o2.',

  methods: [
    {
      name: 'compare',
      args: [
        'o1',
        'o2'
      ]
    },
    {
      name: 'toIndex',
      args: [
        'tail'
      ]
    },
    {
      /** Returns remaning ordering without this first one, which may be the
        only one. */
      name: 'orderTail'
    },
    {
      /** The property, if any, sorted by this ordering. */
      name: 'orderPrimaryProperty'
    },
    {
      /** Returns 1 or -1 for ascending/descending */
      name: 'orderDirection'
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Property',

  implements: [ 'foam.mlang.order.Comparator' ],

  methods: [
    {
      name: 'orderTail',
      code: function() { return; }
    },
    {
      name: 'orderPrimaryProperty',
      code: function() { return this; }
    },
    {
      name: 'orderDirection',
      code: function() { return 1; }
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.order',
  name: 'Desc',

  implements: [
    'foam.mlang.order.Comparator',
    'foam.core.Serializable'
  ],

  documentation: 'Comparator Decorator which reverses direction of comparison. Short for "descending".',

  properties: [
    {
      class: 'FObjectProperty',
      name: 'arg1',
      of: 'foam.mlang.order.Comparator',
      adapt: function(_, c) { return foam.compare.toCompare(c); }
    }
  ],

  methods: [
    function compare(o1, o2) {
      return -1 * this.arg1.compare(o1, o2);
    },
    function toString() { return 'DESC(' + this.arg1.toString() + ')'; },
    function toIndex(tail) { return this.arg1 && this.arg1.toIndex(tail); },
    function orderTail() { return; },
    function orderPrimaryProperty() { return this.arg1; },
    function orderDirection() { return -1 * this.arg1.orderDirection(); }
  ]
});


foam.CLASS({
  package: 'foam.mlang.order',
  name: 'ThenBy',

  implements: [
    'foam.mlang.order.Comparator',
    'foam.core.Serializable'
  ],

  documentation: 'Binary Comparator, which sorts for first Comparator, then second.',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.order.Comparator',
      adapt: function(_, a) {
        // TODO(adamvy): We should fix FObjectProperty's default adapt when the
        // of parameter is an interface rather than a class.
        return a;
      },
      name: 'arg1'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.order.Comparator',
      adapt: function(_, a) {
        // TODO(adamvy): We should fix FObjectProperty's default adapt when the
        // of parameter is an interface rather than a class.
        return a;
      },
      name: 'arg2'
    },
    {
      name: 'compare',
      transient: true,
      documentation: 'Is a property so that it can be bound to "this" so that it works with Array.sort().',
      factory: function() { return this.compare_.bind(this); }
    }
  ],

  methods: [
    function compare_(o1, o2) {
      // an equals of arg1.compare is falsy, which will then hit arg2
      return this.arg1.compare(o1, o2) || this.arg2.compare(o1, o2);
    },

    function toString() {
      return 'THEN_BY(' + this.arg1.toString() + ', ' +
        this.arg2.toString() + ')';
    },

    function toIndex(tail) {
      return this.arg1 && this.arg2 && this.arg1.toIndex(this.arg2.toIndex(tail));
    },

    function orderTail() { return this.arg2; },

    function orderPrimaryProperty() { return this.arg1.orderPrimaryProperty(); },

    function orderDirection() { return this.arg1.orderDirection(); }
  ]
});


foam.CLASS({
  package: 'foam.mlang.order',
  name: 'CustomComparator',
  implements: [ 'foam.mlang.order.Comparator' ],

  // TODO: rename FunctionComparator

  documentation: 'A function to Comparator adapter.',

  properties: [
    {
      class: 'Function',
      name: 'compareFn'
    }
  ],

  methods: [
    {
      name: 'compare',
      code: function(o1, o2) {
        return this.compareFn(o1, o2);
      }
    },
    {
      name: 'toString',
      code: function() {
        return 'CUSTOM_COMPARE(' + this.compareFn.toString() + ')';
      }
    },
    {
      name: 'orderTail',
      code: function() { return undefined; }
    },
    {
      /** TODO: allow user to set this to match the given function */
      name: 'orderPrimaryProperty',
      code: function() { return undefined; }
    },
    {
      name: 'orderDirection',
      code: function() { return 1; }
    }
  ]
});


foam.LIB({
  name: 'foam.compare',

  methods: [
    function desc(c) {
      return foam.mlang.order.Desc.create({ arg1: c });
    },

    function toCompare(c) {
      return foam.Array.isInstance(c) ? foam.compare.compound(c) :
        foam.Function.isInstance(c)   ? foam.mlang.order.CustomComparator.create({ compareFn: c }) :
        c ;
    },

    function compound(args) {
      /* Create a compound comparator from an array of comparators. */
      var cs = args.map(foam.compare.toCompare);

      if ( cs.length === 0 ) return;
      if ( cs.length === 1 ) return cs[0];

      var ThenBy = foam.mlang.order.ThenBy;
      var ret, tail;

      ret = tail = ThenBy.create({arg1: cs[0], arg2: cs[1]});

      for ( var i = 2 ; i < cs.length ; i++ ) {
        tail = tail.arg2 = ThenBy.create({arg1: tail.arg2, arg2: cs[i]});
      }

      return ret;
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Max',
  extends: 'foam.dao.AbstractSink',

  implements: [
    'foam.mlang.predicate.Unary',
    'foam.core.Serializable'
  ],

  documentation: 'A Sink which remembers the maximum value put().',

  properties: [
    {
      name: 'value',
      value: 0
    }
  ],

  methods: [
    function put(obj, sub) {
      if ( ! this.hasOwnProperty('value') || foam.util.compare(this.value, this.arg1.f(obj)) < 0 ) {
        this.value = this.arg1.f(obj);
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Min',
  extends: 'foam.dao.AbstractSink',

  implements: [
    'foam.mlang.predicate.Unary',
    'foam.core.Serializable'
  ],

  documentation: 'A Sink which remembers the minimum value put().',

  properties: [
    {
      name: 'value',
      value: 0
    }
  ],

  methods: [
    function put(obj, s) {
      if ( ! this.hasOwnProperty('value') || foam.util.compare(this.value, this.arg1.f(obj) ) > 0) {
        this.value = this.arg1.f(obj);
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Sum',
  extends: 'foam.dao.AbstractSink',

  implements: [
    'foam.mlang.predicate.Unary',
    'foam.core.Serializable',
  ],

  documentation: 'A Sink which sums put() values.',

  properties: [
    {
      name: 'value',
      value: 0
    }
  ],

  methods: [
    function put(obj, sub) { this.value += this.arg1.f(obj); }
  ]
});


foam.CLASS({
  package: 'foam.mlang.expr',
  name: 'Dot',
  extends: 'foam.mlang.predicate.Binary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'A Binary Predicate which applies arg2.f() to arg1.f().',

  methods: [
    function f(o) {
      return this.arg2.f(this.arg1.f(o));
    },

    function comparePropertyValues(o1, o2) {
      /**
         Compare property values using arg2's property value comparator.
         Used by GroupBy
      **/
      return this.arg2.comparePropertyValues(o1, o2);
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang',
  name: 'Expressions',

  documentation: 'Convenience mix-in for requiring all mlangs.',

  requires: [
    'foam.mlang.Constant',
    'foam.mlang.expr.Dot',
    'foam.mlang.expr.Mul',
    'foam.mlang.order.Desc',
    'foam.mlang.order.ThenBy',
    'foam.mlang.predicate.And',
    'foam.mlang.predicate.Contains',
    'foam.mlang.predicate.ContainsIC',
    'foam.mlang.predicate.Eq',
    'foam.mlang.predicate.False',
    'foam.mlang.predicate.Func',
    'foam.mlang.predicate.Gt',
    'foam.mlang.predicate.Gte',
    'foam.mlang.predicate.Has',
    'foam.mlang.predicate.In',
    'foam.mlang.predicate.Keyword',
    'foam.mlang.predicate.Lt',
    'foam.mlang.predicate.Lte',
    'foam.mlang.predicate.Neq',
    'foam.mlang.predicate.Not',
    'foam.mlang.predicate.Or',
    'foam.mlang.predicate.StartsWith',
    'foam.mlang.predicate.StartsWithIC',
    'foam.mlang.predicate.True',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.Explain',
    'foam.mlang.sink.GroupBy',
    'foam.mlang.sink.Map',
    'foam.mlang.sink.Max',
    'foam.mlang.sink.Min',
    'foam.mlang.sink.Sum',
    'foam.mlang.sink.Unique'
  ],

  constants: {
    FALSE: foam.mlang.predicate.False.create(),
    TRUE: foam.mlang.predicate.True.create()
  },

  methods: [
    function _nary_(name, args) {
      return this[name].create({ args: Array.from(args) });
    },

    function _unary_(name, arg) {
      return this[name].create({ arg1: arg });
    },

    function _binary_(name, arg1, arg2) {
      return this[name].create({ arg1: arg1, arg2: arg2 });
    },

    function OR() { return this._nary_("Or", arguments); },
    function AND() { return this._nary_("And", arguments); },
    function CONTAINS(a, b) { return this._binary_("Contains", a, b); },
    function CONTAINS_IC(a, b) { return this._binary_("ContainsIC", a, b); },
    function EQ(a, b) { return this._binary_("Eq", a, b); },
    function NEQ(a, b) { return this._binary_("Neq", a, b); },
    function IN(a, b) { return this._binary_("In", a, b); },
    function LT(a, b) { return this._binary_("Lt", a, b); },
    function GT(a, b) { return this._binary_("Gt", a, b); },
    function LTE(a, b) { return this._binary_("Lte", a, b); },
    function GTE(a, b) { return this._binary_("Gte", a, b); },
    function HAS(a) { return this._unary_("Has", a); },
    function NOT(a) { return this._unary_("Not", a); },
    function KEYWORD(a) { return this._unary_("Keyword", a); },
    function STARTS_WITH(a, b) { return this._binary_("StartsWith", a, b); },
    function STARTS_WITH_IC(a, b) { return this._binary_("StartsWithIC", a, b); },
    function FUNC(fn) { return this.Func.create({ fn: fn }); },
    function DOT(a, b) { return this._binary_("Dot", a, b); },
    function MUL(a, b) { return this._binary_("Mul", a, b); },

    function UNIQUE(expr, sink) { return this.Unique.create({ expr: expr, delegate: sink }); },
    function GROUP_BY(expr, sinkProto) { return this.GroupBy.create({ arg1: expr, arg2: sinkProto }); },
    function MAP(expr, sink) { return this.Map.create({ arg1: expr, delegate: sink }); },
    function EXPLAIN(sink) { return this.Explain.create({ delegate: sink }); },
    function COUNT() { return this.Count.create(); },
    function MAX(arg1) { return this.Max.create({ arg1: arg1 }); },
    function MIN(arg1) { return this.Min.create({ arg1: arg1 }); },
    function SUM(arg1) { return this.Sum.create({ arg1: arg1 }); },

    function DESC(a) { return this._unary_("Desc", a); },
    function THEN_BY(a, b) { return this._binary_("ThenBy", a, b); }
  ]
});


foam.CLASS({
  package: 'foam.mlang',
  name: 'ExpressionsSingleton',
  extends: 'foam.mlang.Expressions',

  documentation: 'A convenience object which provides access to all mlangs.',
  // TODO: why is this needed?

  axioms: [
    foam.pattern.Singleton.create()
  ]
});

// TODO(braden): We removed Expr.pipe(). That may still be useful to bring back,
// probably with a different name. It doesn't mean the same as DAO.pipe().
// remove eof()
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

foam.CLASS({
  package: 'foam.mlang',
  name: 'LabeledValue',

  documentation: 'A basic model for any id-label-value triple. This is ' +
      'useful when you need essentially a DAO of strings, and need to wrap ' +
      'those strings into a modeled object.',

  properties: [
    {
      name: 'id',
      expression: function(label) { return label; }
    },
    {
      class: 'String',
      name: 'label',
      required: true
    },
    {
      name: 'value'
    }
  ]
});
/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.dao.index',
  name: 'Plan',

  properties: [
    {
      name: 'cost',
      value: 0
    }
  ],

  methods: [
    function execute(promise, state, sink, skip, limit, order, predicate) {},
    function toString() { return this.cls_.name+"(cost="+this.cost+")"; }
  ]
});


/** Plan indicating that there are no matching records. **/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'NotFoundPlan',
  extends: 'foam.dao.index.Plan',

  axioms: [ foam.pattern.Singleton.create() ],

  properties: [
    { name: 'cost', value: 0 }
  ],

  methods: [
    function toString() { return 'no-match(cost=0)'; }
  ]
});


/** Plan indicating that an index has no plan for executing a query. **/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'NoPlan',
  extends: 'foam.dao.index.Plan',

  axioms: [ foam.pattern.Singleton.create() ],

  properties: [
    { name: 'cost', value: Number.MAX_VALUE }
  ],

  methods: [
    function toString() { return 'no-plan'; }
  ]
});


/** Convenience wrapper for indexes that want to create a closure'd function
    for each plan instance */
foam.CLASS({
  package: 'foam.dao.index',
  name: 'CustomPlan',
  extends: 'foam.dao.index.Plan',

  properties: [
    {
      class: 'Function',
      name: 'customExecute'
    },
    {
      class: 'Function',
      name: 'customToString'
    }
  ],

  methods: [
    function execute(promise, state, sink, skip, limit, order, predicate) {
      this.customExecute.call(
          this,
          promise,
          state,
          sink,
          skip,
          limit,
          order,
          predicate);
    },

    function toString() {
      return this.customToString.call(this);
    }
  ]
});


foam.CLASS({
  package: 'foam.dao.index',
  name: 'CountPlan',
  extends: 'foam.dao.index.Plan',

  properties: [
    {
      class: 'Int',
      name: 'count'
    }
  ],

  methods: [
    function execute(promise, sink /*, skip, limit, order, predicate*/) {
      sink.value += this.count;
    },

    function toString() {
      return 'short-circuit-count(' + this.count + ')';
    }
  ]
});


foam.CLASS({
  package: 'foam.dao.index',
  name: 'AltPlan',
  extends: 'foam.dao.index.Plan',

  properties: [
    {
      name: 'subPlans',
      factory: function() { return []; },
      postSet: function(o, nu) {
        this.cost = 1;
        for ( var i = 0; i < nu.length; ++i ) {
          this.cost += nu[i].cost;
        }
      }
    },
    'prop'
  ],

  methods: [
    function execute(promise, sink, skip, limit, order, predicate) {
      var sp = this.subPlans;
      for ( var i = 0 ; i < sp.length ; ++i) {
        sp[i].execute(promise, sink, skip, limit, order, predicate);
      }
    },

    function toString() {
      return ( ! this.subPlans || this.subPlans.length <= 1 ) ?
        'IN(key=' + ( this.prop && this.prop.name ) + ', cost=' + this.cost + ', ' +
          ', size=' + ( this.subPlans ? this.subPlans.length : 0 ) + ')' :
        'lookup(key=' + this.prop && this.prop.name + ', cost=' + this.cost + ', ' +
          this.subPlans[0].toString();
    }
  ]
});

/**
  Merges results from multiple sub-plans and deduplicates, sorts, and
  filters the results.

  TODO: account for result sorting in cost?
*/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'MergePlan',
  extends: 'foam.dao.index.AltPlan',

  requires: [
    'foam.dao.DedupSink',
    'foam.dao.LimitedSink',
    'foam.dao.SkipSink',
    'foam.dao.OrderedSink',
    'foam.dao.FlowControl'
  ],

  properties: [
    {
      class: 'Class',
      name: 'of',
      required: true
    }
  ],

  methods: [
    /**
      Executes sub-plans, limiting results from each, then merges results,
      removes duplicates, sorts, skips, and limits.
    */
    function execute(promise, sink, skip, limit, order, predicate) {
      if ( order ) return this.executeOrdered.apply(this, arguments);
      return this.executeFallback.apply(this, arguments);
    },

    function executeOrdered(promise, sink, skip, limit, order, predicate) {
      /**
       * Executes a merge where ordering is specified, therefore
       * results from the subPlans are also sorted, and can be merged
       * efficiently.
       */

      // quick linked list
      var NodeProto = { next: null, data: null };

      var head = Object.create(NodeProto);
      // TODO: track list size, cut off if above skip+limit

      var sp = this.subPlans;
      var predicates = predicate ? predicate.args : [];
      var subLimit = ( limit ? limit + ( skip ? skip : 0 ) : undefined );
      var promises = []; // track any async subplans
      var dedupCompare = this.of.ID.compare.bind(this.of.ID);
      // TODO: FIX In the case of no external ordering, a sort must be imposed
      //   (fall back to old dedupe sink impl?)
      var compare = order ? order.compare.bind(order) : foam.util.compare;

      // Each plan inserts into the list
      for ( var i = 0 ; i < sp.length ; ++i) {
        var insertPlanSink;
        (function() { // capture new insertAfter for each sink
          // set new insert position to head.
          // Only bump insertAfter forward when the next item is smaller,
          //   since we need to scan all equal items every time a new item
          //   comes in.
          // If the next item is larger, we insert before it
          //   and leave the insertion point where it is, so the next
          //   item can check if it is equal to the just-inserted item.
          var insertAfter = head;
          // TODO: refactor with insertAfter as a property of a new class?
          insertPlanSink = foam.dao.QuickSink.create({
            putFn: function(o) {
              function insert() {
                var nu = Object.create(NodeProto);
                nu.next = insertAfter.next;
                nu.data = o;
                insertAfter.next = nu;
              }

              // Skip past items that are less than our new item
              while ( insertAfter.next &&
                      compare(o, insertAfter.next.data) > 0 ) {
                 insertAfter = insertAfter.next;
              }

              if ( ! insertAfter.next ) {
                // end of list case, no equal items, so just append
                insert();
                return;
              } else if ( compare(o, insertAfter.next.data) === 0 ) {
                // equal items case, check for dupes
                // scan through any items that are equal, dupe check each
                var dupeAfter = insertAfter;
                while ( dupeAfter.next &&
                        compare(o, dupeAfter.next.data) === 0 ) {
                  if ( dedupCompare(o, dupeAfter.next.data) === 0 ) {
                    // duplicate found, ignore the new item
                    return;
                  }
                  dupeAfter = dupeAfter.next;
                }
                // No dupes found, so insert at position dupeAfter
                // dupeAfter.next is either end-of-list or a larger item
                var nu = Object.create(NodeProto);
                nu.next = dupeAfter.next;
                nu.data = o;
                dupeAfter.next = nu;
                dupeAfter = null;
                return;
              } else { // comp < 0
                 // existing-is-greater-than-new case, insert before it
                 insert();
              }
            }
          });
        })();
        // restart the promise chain, if a promise is added we collect it
        var nuPromiseRef = [];
        sp[i].execute(
          nuPromiseRef,
          insertPlanSink,
          undefined,
          subLimit,
          order,
          predicates[i]
        );
        if ( nuPromiseRef[0] ) promises.push(nuPromiseRef[0]);
      }

      // result reading may by async, so define it but don't call it yet
      var resultSink = this.decorateSink_(sink, skip, limit);

      var sub = foam.core.FObject.create();
      var detached = false;
      sub.onDetach(function() { detached = true; });

      function scanResults() {
        // The list starting at head now contains the results plus possible
        //  overflow of skip+limit
        var node = head.next;
        while ( node && ! detached ) {
          resultSink.put(node.data, sub);
          node = node.next;
        }
      }

      // if there is an async index in the above, wait for it to finish
      //   before reading out the results.
      if ( promises.length ) {
        var thisPromise = Promise.all(promises).then(scanResults);
        // if an index above us is also async, chain ourself on
        promise[0] = promise[0] ? promise[0].then(function() {
          return thisPromise;
        }) : thisPromise;
      } else {
        // In the syncrhonous case we don't have to wait on our subplans,
        //  and can ignore promise[0] as someone else is responsible for
        //  waiting on it if present.
        scanResults();
      }
    },

    function executeFallback(promise, sink, skip, limit, unusedOrder, predicate) {
       /**
        * Executes a merge where ordering is unknown, therefore no
        * sorting is done and deduplication must be done separately.
        */
       var resultSink = this.DedupSink.create({
         delegate: this.decorateSink_(sink, skip, limit)
       });

       var sp = this.subPlans;
       var predicates = predicate ? predicate.args : [];
       var subLimit = ( limit ? limit + ( skip ? skip : 0 ) : undefined );

       for ( var i = 0 ; i < sp.length ; ++i) {
         sp[i].execute(
           promise,
           resultSink,
           undefined,
           subLimit,
           undefined,
           predicates[i]
         );
       }
       // Since this execute doesn't collect results into a temporary
       // storage list, we don't need to worry about the promises. Any
       // async subplans will add their promise on, and when they are
       // resolved their results will have already put() straight into
       // the resultSink. Only the MDAO calling the first execute() needs
       // to respect the referenced promise chain.
    },

    function decorateSink_(sink, skip, limit) {
      /**
       * TODO: Share with AbstractDAO? We never need to use predicate or order
       * @private
       */
      if ( limit != undefined ) {
        sink = this.LimitedSink.create({
          limit: limit,
          delegate: sink
        });
      }
      if ( skip != undefined ) {
        sink = this.SkipSink.create({
          skip: skip,
          delegate: sink
        });
      }

      return sink;
    },

  ]
});
/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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
  The Index interface for an ordering, fast lookup, single value,
  index multiplexer, or any other MDAO select() assistance class.

  Each Index subclass also defines an IndexNode class. Index defines
  the structure of the index, including estimate() to gauge its
  probable performance for a query, while IndexNode implements the
  data nodes that hold the indexed items and plan and execute
  queries. For any particular operational Index, there may be
  many IndexNode instances:

<pre>
                 1---------> TreeIndex(id)
  MDAO: AltIndex 2---------> TreeIndex(propA) ---> TreeIndex(id) -------------> ValueIndex
        | 1x AltIndexNode    | 1x TreeIndexNode    | 14x TreeIndexNodes         | (DAO size)x ValueIndexNodes
           (2 alt subindexes)     (14 nodes)             (each has 0-5 nodes)
</pre>
  The base AltIndex has two complete subindexes (each holds the entire DAO).
  The TreeIndex on property A has created one TreeIndexNode, holding one tree of 14 nodes.
  Each tree node contains a tail instance of the next level down, thus
  the TreeIndex on id has created 14 TreeIndexNodes. Each of those contains some number
  of tree nodes, each holding one tail instance of the ValueIndex at the end of the chain.

*/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'Index',

  properties: [
    {
      /**
       * The class type of the data nodes this index creates with
       * createNode(). By default it will be the Index class' name
       * with Node appended:
       * <p><code>MyIndex => MyIndexNode</code>
       */
      class: 'Class',
      name: 'nodeClass',
      factory: function() {
        return this.cls_.id + 'Node';
      }
    }
  ],

  methods: [
    function estimate(size, sink, skip, limit, order, predicate) {
      /** Estimates the performance of this index given the number of items
        it will hold and the planned parameters. */
      return size * size; // n^2 is a good worst-case estimate by default
    },

    function toPrettyString(indent) {
      /** Output a minimal, human readable, indented (2 spaces per level)
        description of the index structure */
    },

    function createNode(args) {
      args = args || {};
      args.index = this;
      return this.nodeClass.create(args, this);
    }
  ]
});


/**
  The IndexNode interface represents a piece of the index that actually
  holds data. A tree will create an index-node for each tree-node, so one
  Index will manage many IndexNode instances, each operating on part of
  the data in the DAO.

  For creation speed, do not require or import anything in a node class.
  Use the 'index' property to access requires and imports on the
  Index that created the node instance.
*/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'IndexNode',

  properties: [
    {
      class: 'Simple',
      name: 'index'
    }
  ],

  methods: [
    /** Adds or updates the given value in the index */
    function put(obj) {},

    /** Removes the given value from the index */
    function remove(obj) {},

    /** @return a Plan to execute a select with the given parameters */
    function plan(sink, skip, limit, order, predicate, root) {},

    /** @return the tail index instance for the given key. */
    function get(key) {},

    /** @return the integer size of this index. */
    function size() {},

    /** Selects matching items from the index and puts them into sink.
        cache allows indexes to store query state that is discarded once
        the select() is complete.
      <p>Note: order checking has replaced selectReverse().  */
    function select(sink, skip, limit, order, predicate, cache) { },

    /** Efficiently (if possible) loads the contents of the given DAO into the index */
    function bulkLoad(dao) {}
  ]
});
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

foam.CLASS({
  package: 'foam.dao.index',
  name: 'ProxyIndex',
  extends: 'foam.dao.index.Index',

  properties: [
    {
      name: 'delegate',
      required: true,
    }
  ],
  methods: [
    function estimate(size, sink, skip, limit, order, predicate) {
      return this.delegate.estimate(size, sink, skip, limit, order, predicate);
    },

    function toPrettyString(indent) {
      return this.delegate.toPrettyString(indent);
    },

    function toString() {
      return '[' + this.cls_.name + ': ' + this.delegate.toString() + ']'
    }
  ]
});

foam.CLASS({
  package: 'foam.dao.index',
  name: 'ProxyIndexNode',
  extends: 'foam.dao.index.IndexNode',

  properties: [
    {
      class: 'Simple',
      name: 'delegate',
    },
  ],

  methods: [
    function init() {
      this.delegate = this.delegate || this.index.delegate.createNode();
    },

    function put(o) { return this.delegate.put(o); },

    function remove(o) { return this.delegate.remove(o); },

    function plan(sink, skip, limit, order, predicate, root) {
      return this.delegate.plan(sink, skip, limit, order, predicate, root);
    },

    function get(key) { return this.delegate.get(key); },

    function size() { return this.delegate.size(); },

    function select(sink, skip, limit, order, predicate, cache) {
      return this.delegate.select(sink, skip, limit, order, predicate, cache);
    },

    function bulkLoad(dao) { return this.delegate.bulkLoad(dao); },

  ]
});

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
  Provides for hetergenious indexes, where not all potential delegates
  of this AltIndex actually get populated for each instance. Each instance
  always populates an ID index, so it can serve queries even if no
  delegate indexes are explicitly added.

  Index: Alt[ID, TreeA, TreeB]
  IndexNodes: [id, a,b], [id, a], [id, b], [id, a], [id]
*/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'AltIndex',
  extends: 'foam.dao.index.Index',

  requires: [
    'foam.dao.index.NoPlan',
    'foam.mlang.sink.NullSink',
  ],

  constants: {
    /** Maximum cost for a plan which is good enough to not bother looking at the rest. */
    GOOD_ENOUGH_PLAN: 10 // put to 10 or more when not testing
  },

  properties: [
    {
      /** delegate factories */
      name: 'delegates',
      factory: function() { return []; }
    },
    {
      /** factory quick lookup */
      name: 'delegateMap_',
      factory: function() { return {}; }
    },
  ],

  methods: [

    /** Returns smallest estimate from the delegates */
    function estimate(size, sink, skip, limit, order, predicate) {
      var cost = Number.MAX_VALUE;
      for ( var i = 0; i < this.delegates.length; i++ ) {
        cost = Math.min(
          cost,
          this.delegates[i].estimate(
            size, sink, skip, limit, order, predicate)
        );
      }
      return cost;
    },

    function toPrettyString(indent) {
      var ret = "";
      for ( var i = 0; i < this.delegates.length; i++ ) {
          ret += this.delegates[i].toPrettyString(indent + 1);
      }
      return ret;
    },

    function toString() {
      return 'Alt([' + (this.delegates.join(',')) + '])';
    },
  ]
});

foam.CLASS({
  package: 'foam.dao.index',
  name: 'AltIndexNode',
  extends: 'foam.dao.index.IndexNode',

  properties: [
    {
      /** the delegate instances for each Alt instance */
      class: 'Simple',
      name: 'delegates'
    },
  ],

  methods: [
    function init() {
      this.delegates = this.delegates || [ this.index.delegates[0].createNode() ];
    },

    function addIndex(index) {
      // check for existing factory
      var dfmap = this.index.delegateMap_;
      var indexKey = index.toString();
      if ( ! dfmap[indexKey] ) {
        this.index.delegates.push(index);
        dfmap[indexKey] = index;
      } else {
        // ensure all tails are using the same factory instance
        index = dfmap[indexKey];
      }

      var newSubInst = index.createNode();
      var wrapped = foam.dao.DAOSink.create({ dao: newSubInst });
      this.delegates[0].plan(wrapped).execute([], wrapped);
      this.delegates.push(newSubInst);
    },

    function bulkLoad(a) {
      for ( var i = 0 ; i < this.delegates.length ; i++ ) {
        this.delegates[i].bulkLoad(a);
      }
    },

    function get(key) {
      return this.delegates[0].get(key);
    },

    function pickDelegate(order, cache) {
      // NOTE: this assumes one of the delegates is capable of ordering
      //  properly for a scan. We should not be asked for a select unless
      //  a previous estimate indicated one of our options was sorted properly.
      // NOTE: unbuilt portions of the index will be built immediately
      //  if picked for ordering.
      var delegates = this.delegates;
      if ( ! order ) return delegates[0];

      var c = cache[this];
      // if no cached index estimates, generate estimates
      // for each factory for this ordering
      if ( ! c ) {
        var nullSink = this.index.NullSink.create();
        var dfs = this.index.delegates;
        var bestEst = Number.MAX_VALUE;
        // Pick the best factory for the ordering, cache it
        for ( var i = 0; i < dfs.length; i++ ) {
          var est = dfs[i].estimate(1000, nullSink, undefined, undefined, order);
          if ( est < bestEst ) {
            c = dfs[i];
            bestEst = est;
          }
        }
        cache[this] = c;
      }

      // check if we have a delegate instance for the best factory
      for ( var i = 0; i < delegates.length; i++ ) {
        // if we do, it's the best one
        if ( delegates[i].index === c ) return delegates[i];
      }

      // we didn't have the right delegate generated, so add and populate it
      // as per addIndex, but we skip checking the factory as we know it's stored
      var newSubInst = c.createNode();
      var wrapped = foam.dao.DAOSink.create({ dao: newSubInst });
      this.delegates[0].plan(wrapped).execute([], wrapped);
      this.delegates.push(newSubInst);

      return newSubInst;
    },


    function select(sink, skip, limit, order, predicate, cache) {
      // find and cache the correct subindex to use
      this.pickDelegate(order, cache)
        .select(sink, skip, limit, order, predicate, cache);
    },

    function put(newValue) {
      for ( var i = 0 ; i < this.delegates.length ; i++ ) {
        this.delegates[i].put(newValue);
      }
    },

    function remove(obj) {
      for ( var i = 0 ; i < this.delegates.length ; i++ ) {
        this.delegates[i].remove(obj);
      }
    },

    function plan(sink, skip, limit, order, predicate, root) {
      var bestPlan;
      for ( var i = 0 ; i < this.delegates.length ; i++ ) {
        var p = this.delegates[i].plan(sink, skip, limit, order, predicate, root);
        if ( p.cost <= this.index.GOOD_ENOUGH_PLAN ) {
          bestPlan = p;
          break;
        }
        if ( ! bestPlan || p.cost < bestPlan.cost ) {
          bestPlan = p;
        }
      }
      if ( ! bestPlan ) {
        return this.index.NoPlan.create();
      }
      return bestPlan;
    },

    function size() { return this.delegates[0].size(); },

    function toString() {
      return 'Alt([' + (this.index.delegates.join(',')) + this.size() + '])';
    },
  ]
});
/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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
  An Index which holds only a single value. This class also functions as its
  own execution Plan, since it only has to return the single value.
**/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'ValueIndex',
  extends: 'foam.dao.index.Index',

  methods: [
    function estimate(size, sink, skip, limit, order, predicate) {
      return 1;
    },

    function toPrettyString(indent) {
      return '';
    },

  ]
});
foam.CLASS({
  package: 'foam.dao.index',
  name: 'ValueIndexNode',
  extends: 'foam.dao.index.IndexNode',
  implements: [ 'foam.dao.index.Plan' ],

  properties: [
    { class: 'Simple', name: 'value' },
    { class: 'Simple', name: 'cost' }
  ],

  methods: [
    // from plan
    function execute(promise, sink) {
      /** Note that this will put(undefined) if you remove() the item but
        leave this ValueIndex intact. Usages of ValueIndex should clean up
        the ValueIndex itself when the value is removed. */
      sink.put(this.value);
    },

    function toString() {
      return 'ValueIndex_Plan(cost=1, value:' + this.value + ')';
    },

    // from Index
    function put(s) { this.value = s; },
    function remove() { this.value = undefined; },
    function get() { return this.value; },
    function size() { return typeof this.value === 'undefined' ? 0 : 1; },
    function plan() { this.cost = 1; return this; },

    function select(sink, skip, limit, order, predicate, cache) {
      if ( predicate && ! predicate.f(this.value) ) return;
      if ( skip && skip[0]-- > 0 ) return;
      if ( limit && limit[0]-- <= 0 ) return;
      sink.put(this.value);
    },
  ]
});
/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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
  Represents one node's state in a binary tree. Each tree operation
  can rebalance the subtree or create a new node, so those methods
  return a tree node reference to replace the one called. It may be the
  same node, a different existing node, or a new node.
  <p>
  <code>
    // replace s.right with result of operations on s.right
    s.right = s.right.maybeClone(locked).split(locked);
  </code>
*/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'TreeNode',

  properties: [
    // per node properties
    { class: 'Simple', name: 'key'   },
    { class: 'Simple', name: 'value' },
    { class: 'Simple', name: 'size'  },
    { class: 'Simple', name: 'level' },
    { class: 'Simple', name: 'left'  },
    { class: 'Simple', name: 'right' }
  ],

  methods: [

    /**
       Clone is only needed if a select() is active in the tree at the
       same time we are updating it.
    */
    function maybeClone(locked) {
      return locked ? this.clone() : this;
    },

    function clone() {
      var c = this.cls_.create();
      c.key   = this.key;
      c.value = this.value;
      c.size  = this.size;
      c.level = this.level;
      c.left  = this.left;
      c.right = this.right;
      return c;
    },

    function updateSize() {
      this.size = this.left.size + this.right.size + this.value.size();
    },

    /** @return Another node representing the rebalanced AA tree. */
    function skew(locked) {
      if ( this.left.level === this.level ) {
        // Swap the pointers of horizontal left links.
        var l = this.left.maybeClone(locked);

        this.left = l.right;
        l.right = this;

        this.updateSize();
        l.updateSize();

        return l;
      }

      return this;
    },

    /** @return a node representing the rebalanced AA tree. */
    function split(locked) {
      if (
          this.right.level       &&
          this.right.right.level &&
          this.level === this.right.right.level
      ) {
        // We have two horizontal right links.
        // Take the middle node, elevate it, and return it.
        var r = this.right.maybeClone(locked);

        this.right = r.left;
        r.left = this;
        r.level++;

        this.updateSize();
        r.updateSize();

        return r;
      }

      return this;
    },

    function predecessor() {
      if ( ! this.left.level ) return this;
      for ( var s = this.left ; s.right.level ; s = s.right ) {}
      return s;
    },

    function successor() {
      if ( ! this.right.level ) return this;
      for ( var s = this.right ; s.left.level ; s = s.left ) {}
      return s;
    },

    /**
       Removes links that skip levels.
       @return the tree with its level decreased.
    */
    function decreaseLevel(locked) {
      var expectedLevel = Math.min(
          this.left.level  ? this.left.level  : 0,
          this.right.level ? this.right.level : 0) + 1;

      if ( expectedLevel < this.level ) {
        this.level = expectedLevel;
        if ( this.right.level && expectedLevel < this.right.level ) {
          this.right = this.right.maybeClone(locked);
          this.right.level = expectedLevel;
        }
      }

      return this;
    },

    /** extracts the value with the given key from the index */
    function get(key, compare) {
      var r = compare(this.key, key);

      if ( r === 0 ) return this.value; // TODO... tail.get(this.value) ???

      return r > 0 ? this.left.get(key, compare) : this.right.get(key, compare);
    },

    /** scans the entire tree and returns all matches */
    function getAll(key, compare, retArray) {
      var r = compare(this.key, key);

      if ( r === 0 ) retArray.push(this.value);

      this.left.getAll(key, compare, retArray);
      this.right.getAll(key, compare, retArray);
    },

    function putKeyValue(key, value, compare, dedup, locked) {
      var s = this.maybeClone(locked);

      var r = compare(s.key, key);

      if ( r === 0 ) {
        dedup(value, s.key);

        s.size -= s.value.size();
        s.value.put(value);
        s.size += s.value.size();
      } else {
        var side = r > 0 ? 'left' : 'right';

        if ( s[side].level ) s.size -= s[side].size;
        s[side] = s[side].putKeyValue(key, value, compare, dedup, locked);
        s.size += s[side].size;
      }

      return s.split(locked).skew(locked);
    },

    function removeKeyValue(key, value, compare, locked, nullNode) {
      var s = this.maybeClone(locked);
      var side;
      var r = compare(s.key, key);

      if ( r === 0 ) {
        s.size -= s.value.size();
        s.value.remove(value);

        // If the sub-Index still has values, then don't
        // delete this node.
        if ( s.value && s.value.size() > 0 ) {
          s.size += s.value.size();
          return s;
        }

        // If we're a leaf, easy, otherwise reduce to leaf case.
        if ( ! s.left.level && ! s.right.level ) {
          return nullNode;
        }

        side = s.left.level ? 'left' : 'right';

        // TODO: it would be faster if successor and predecessor also deleted
        // the entry at the same time in order to prevent two traversals.
        // But, this would also duplicate the delete logic.
        var l = side === 'left' ?
            s.predecessor() :
            s.successor()   ;

        s.key = l.key;
        s.value = l.value;

        s[side] = s[side].removeNode(l.key, compare, locked);
      } else {
        side = r > 0 ? 'left' : 'right';

        s.size -= s[side].size;
        s[side] = s[side].removeKeyValue(key, value, compare, locked, nullNode);
        s.size += s[side].size;
      }

      // Rebalance the tree. Decrease the level of all nodes in this level if
      // necessary, and then skew and split all nodes in the new level.
      s = s.decreaseLevel(locked).skew(locked);
      if ( s.right.level ) {
        s.right = s.right.maybeClone(locked).skew(locked);
        if ( s.right.right.level ) {
          s.right.right = s.right.right.maybeClone(locked).skew(locked);
        }
      }

      s = s.split(locked);
      s.right = s.right.maybeClone(locked).split(locked);

      return s;
    },

    function removeNode(key, compare, locked) {
      var s = this.maybeClone(locked);

      var r = compare(s.key, key);

      if ( r === 0 ) return s.left.level ? s.left : s.right;

      var side = r > 0 ? 'left' : 'right';

      s.size -= s[side].size;
      s[side] = s[side].removeNode(key, compare, locked);
      s.size += s[side].size;

      return s;
    },


    function select(sink, skip, limit, order, predicate, cache) {
      if ( limit && limit[0] <= 0 ) return;

      if ( skip && skip[0] >= this.size && ! predicate ) {
        skip[0] -= this.size;
        return;
      }

      this.left.select(sink, skip, limit, order, predicate, cache);

      this.value.select(sink, skip, limit,
        order && order.orderTail(), predicate, cache);

      this.right.select(sink, skip, limit, order, predicate, cache);
    },


    function selectReverse(sink, skip, limit, order, predicate, cache) {
      if ( limit && limit[0] <= 0 ) return;

      if ( skip && skip[0] >= this.size && ! predicate ) {
        //console.log('reverse skipping: ', this.key);
        skip[0] -= this.size;
        return;
      }

      this.right.selectReverse(sink, skip, limit, order, predicate, cache);

      // select() will pick reverse or not based on order
      this.value.select(sink, skip, limit,
        order && order.orderTail(), predicate, cache);

      this.left.selectReverse(sink,  skip, limit, order, predicate, cache);
    },

    function gt(key, compare) {
      var s = this;
      var r = compare(key, s.key);

      if ( r < 0 ) {
        var l = s.left.gt(key, compare);
        var copy = s.clone();
        copy.size = s.size - s.left.size + l.size;
        copy.left = l;
        return copy;
      }

      if ( r > 0 ) return s.right.gt(key, compare);

      return s.right;
    },

    function gte(key, compare, nullNode) {
      var s = this;
      var copy;
      var r = compare(key, s.key);

      if ( r < 0 ) {
        var l = s.left.gte(key, compare, nullNode);
        copy = s.clone();
        copy.size = s.size - s.left.size + l.size;
        copy.left = l;
        return copy;
      }

      if ( r > 0 ) return s.right.gte(key, compare, nullNode);

      copy = s.clone();
      copy.size = s.size - s.left.size;
      copy.left = nullNode;
      return copy;
    },

    function lt(key, compare) {
      var s = this;
      var r = compare(key, s.key);

      if ( r > 0 ) {
        var rt = s.right.lt(key, compare);
        var copy = s.clone();
        copy.size = s.size - s.right.size + rt.size;
        copy.right = rt;
        return copy;
      }

      if ( r < 0 ) return s.left.lt(key, compare);

      return s.left;
    },

    function lte(key, compare, nullNode) {
      var s = this;
      var copy;
      var r = compare(key, s.key);

      if ( r > 0 ) {
        var rt = s.right.lte(key, compare, nullNode);
        copy = s.clone();
        copy.size = s.size - s.right.size + rt.size;
        copy.right = rt;
        return copy;
      }

      if ( r < 0 ) return s.left.lte(key, compare, nullNode);

      copy = s.clone();
      copy.size = s.size - s.right.size;
      copy.right = nullNode;
      return copy;
    }
  ]
});


/**
  Guards the leaves of the tree. Once instance is created per instance of
  TreeIndex, and referenced by every tree node. Most of its methods are
  no-ops, cleanly terminating queries and other tree operations.
  <p>
  NullTreeNode covers creation of new nodes: when a put value hits the
  nullNode, a new TreeNode is returned and the caller replaces the
  nullNode reference with the new node.
*/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'NullTreeNode',

  properties: [
    {
      /**
        The nullNode for a given tree creates all the new nodes, so it needs
        the factory for the tail index to create inside each new node.
      */
      class: 'Simple',
      name: 'tail'
    },
    {
      /**
        The tree node factory is used to create new, empty tree nodes. They
        will be initialized with a new tail index from tail.
      */
      class: 'Simple',
      name: 'treeNode'
    },
    {
      class: 'Simple',
      name: 'left',
      //getter: function() { return undefined; }
    },
    {
      class: 'Simple',
      name: 'right',
      //getter: function() { return undefined; }
    },
    {
      class: 'Simple',
      name: 'size',
      //getter: function() { return 0; }
    },
    {
      class: 'Simple',
      name: 'level',
      //getter: function() { return 0; }
    }
  ],

  methods: [
    function init() {
      this.left  = undefined;
      this.right = undefined;
      this.size  = 0;
      this.level = 0;
    },

    function clone()         { return this; },
    function maybeClone()    { return this; },
    function skew(locked)    { return this; },
    function split(locked)   { return this; },
    function decreaseLevel() { return this; },
    function get()           { return undefined; },
    function updateSize()    {  },

    /** Add a new value to the tree */
    function putKeyValue(key, value) {
      var subIndex = this.tail.createNode();
      subIndex.put(value);
      var n = this.treeNode.create();
      n.left  = this;
      n.right = this;
      n.key   = key;
      n.value = subIndex;
      n.size  = 1;
      n.level = 1;
      return n;
    },

    function removeKeyValue() { return this; },
    function removeNode()     { return this; },
    function select()         { },
    function selectReverse()  { },

    function gt()   { return this; },
    function gte()  { return this; },
    function lt()   { return this; },
    function lte()  { return this; },

    function getAll()  { return; },

    function bulkLoad_(a, start, end, keyExtractor) {
      if ( end < start ) return this;

      var tree = this;
      var m    = start + Math.floor((end-start+1) / 2);
      tree = tree.putKeyValue(keyExtractor(a[m]), a[m]);

      tree.left  = tree.left.bulkLoad_(a, start, m-1, keyExtractor);
      tree.right = tree.right.bulkLoad_(a, m+1, end, keyExtractor);
      tree.size += tree.left.size + tree.right.size;

      return tree;
    }
  ]
});
/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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

foam.CLASS({
  refines: 'foam.core.Property',

  requires: [
    'foam.dao.index.TreeIndex',
  ],

  methods: [
    function toIndex(tail) {
      /** Creates the correct type of index for this property, passing in the
          tail factory (sub-index) provided. */
      return this.TreeIndex.create({ prop: this, tail: tail });
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.FObjectArray',

  requires: [
    'foam.dao.index.SetIndex',
  ],

  methods: [
    function toIndex(tail) {
       return this.SetIndex.create({ prop: this, tail: tail });
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.AxiomArray',

  requires: [
    'foam.dao.index.SetIndex',
  ],

  methods: [
    function toIndex(tail) {
       return this.SetIndex.create({ prop: this, tail: tail });
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.StringArray',

  requires: [
    'foam.dao.index.SetIndex',
  ],

  methods: [
    function toIndex(tail) {
       return this.SetIndex.create({ prop: this, tail: tail });
    }
  ]
});


/** A tree-based Index. Defaults to an AATree (balanced binary search tree) **/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'TreeIndex',
  extends: 'foam.dao.index.Index',

  requires: [
    'foam.core.Property',
    'foam.dao.ArraySink',
    'foam.mlang.sink.NullSink',
    'foam.dao.index.AltPlan',
    'foam.dao.index.CountPlan',
    'foam.dao.index.CustomPlan',
    'foam.dao.index.NotFoundPlan',
    'foam.dao.index.NullTreeNode',
    'foam.dao.index.TreeNode',
    'foam.dao.index.ValueIndex',
    'foam.mlang.order.Desc',
    'foam.mlang.order.Comparator',
    'foam.mlang.order.ThenBy',
    'foam.mlang.predicate.And',
    'foam.mlang.predicate.Eq',
    'foam.mlang.predicate.False',
    'foam.mlang.predicate.Gt',
    'foam.mlang.predicate.Gte',
    'foam.mlang.predicate.Lt',
    'foam.mlang.predicate.Lte',
    'foam.mlang.predicate.Or',
    'foam.mlang.predicate.True',
    'foam.mlang.predicate.In',
    'foam.mlang.predicate.Contains',
    'foam.mlang.predicate.ContainsIC',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.Explain',
  ],

  constants: {
    IS_EXPR_MATCH_FN: function isExprMatch(predicate, prop, model) {
      var self = this.index || this;
      if ( predicate && model && prop ) {
        // util.equals catches Properties that were cloned if the predicate has
        //  been cloned.
        if ( model.isInstance(predicate) &&
            ( predicate.arg1 === prop || foam.util.equals(predicate.arg1, prop) )
        ) {
          var arg2 = predicate.arg2;
          predicate = undefined;
          return { arg2: arg2, predicate: predicate };
        }

        if ( predicate.args && self.And.isInstance(predicate) ) {
          for ( var i = 0 ; i < predicate.args.length ; i++ ) {
            var q = predicate.args[i];
            // Util.equals to catch clones again
            if ( model.isInstance(q) &&
                (q.arg1 === prop || foam.util.equals(q.arg1, prop)) ) {
              predicate = predicate.clone();
              predicate.args[i] = self.True.create();
              predicate = predicate.partialEval();
              if ( self.True.isInstance(predicate) ) predicate = undefined;
              return { arg2: q.arg2, predicate: predicate };
            }
          }
        }
      }
      return undefined;
    }
  },

  properties: [
    {
      name: 'prop',
      required: true
    },
    {
      name: 'nullNode',
      factory: function() {
        var nn = this.NullTreeNode.create({
          tail: this.tail,
          treeNode: this.treeNode
        });
        return nn;
      }
    },
    {
      name: 'treeNode',
      factory: function() { return this.TreeNode; }
    },
    {
      name: 'tail',
      required: true
    }
  ],

  methods: [
    function init() {
      this.dedup = this.dedup.bind(this, this.prop.name);
    },

    /** Set the value's property to be the same as the key in the index.
        This saves memory by sharing objects. */
    function dedup(propName, obj, value) {
      obj[propName] = value;
    },

    function compare(o1, o2) {
      return foam.util.compare(o1, o2);
    },

    function isOrderSelectable(order) {
      // no ordering, no problem
      if ( ! order ) return true;

      // if this index can sort, it's up to our tail to sub-sort
      if ( foam.util.equals(order.orderPrimaryProperty(), this.prop) ) {
        // If the subestimate is less than sort cost (N*lg(N) for a dummy size of 1000)
        return 9965 >
          this.tail.estimate(1000, this.NullSink.create(), 0, 0, order.orderTail())
      }
      // can't use select() with the given ordering
      return false;
    },

    function estimate(size, sink, skip, limit, order, predicate) {
      // small sizes don't matter
      if ( size <= 16 ) return Math.log(size) / Math.log(2);

      // if only estimating by ordering, just check if we can scan it
      //  otherwise return the sort cost.
      // NOTE: This is conceptually the right thing to do, but also helps
      //   speed up isOrderSelectable() calls on this:
      //   a.isOrderSelectable(o) -> b.estimate(..o) -> b.isOrderSelectable(o) ...
      //   Which makes it efficient but removes the need for Index to
      //   have an isOrderSelectable() method forwarding directly.
      if ( order && ! ( predicate || skip || limit ) ) {
        return this.isOrderSelectable(order) ? size :
          size * Math.log(size) / Math.log(2);
      }

      var self = this;
      predicate = predicate ? predicate.clone() : null;
      var property = this.prop;
      // TODO: validate this assumption:
      var nodeCount = Math.floor(size * 0.25); // tree node count will be a quarter the total item count

      var isExprMatch = this.IS_EXPR_MATCH_FN.bind(this, predicate, property);

      var tail = this.tail;
      var subEstimate = ( tail ) ? function() {
          return Math.log(nodeCount) / Math.log(2) +
            tail.estimate(size / nodeCount, sink, skip, limit, order, predicate);
        } :
        function() { return Math.log(nodeCount) / Math.log(2); };

      var expr = isExprMatch(this.In);
      if ( expr ) {
        // tree depth * number of compares
        return subEstimate() * expr.arg2.f().length;
      }

      expr = isExprMatch(this.Eq);
      if ( expr ) {
        // tree depth
        return subEstimate();
      }

      expr = isExprMatch(this.ContainsIC);
      if ( expr ) ic = true;
      expr = expr || isExprMatch(this.Contains);
      if ( expr ) {
        // TODO: this isn't quite right. Tree depth * query string length?
        // If building a trie to help with this, estimate becomes easier.
        return subEstimate() * expr.arg2.f().length;
      }

      // At this point we are going to scan all or part of the tree
      //  with select()
      var cost = size;

      // These cases are just slightly better scans, but we can't estimate
      //   how much better... maybe half
      if ( isExprMatch(this.Gt) || isExprMatch(this.Gte) ||
          isExprMatch(this.Lt) || isExprMatch(this.Lte) ) {
        cost /= 2;
      }

      // Ordering
      // if sorting required, add the sort cost
      if ( ! this.isOrderSelectable(order) ) {
        // this index or a tail index can't sort this ordering,
        // manual sort required
        if ( cost > 0 ) cost *= Math.log(cost) / Math.log(2);
      }

      return cost;
    },

    function toString() {
      return '[' + this.cls_.name + ': ' + this.prop.name + ' ' + this.tail.toString() + ']';
    },

    function toPrettyString(indent) {
      var ret = '';
      //ret += "  ".repeat(indent) + this.cls_.name + "( " + this.prop.name + "\n";
      //ret += this.tail.toPrettyString(indent + 1);
      //ret += "  ".repeat(indent) + ")\n";
      var tail = this.tail.toPrettyString(indent + 1);
      ret = '  '.repeat(indent) + this.prop.name + '(' + this.$UID + ')\n';
      if ( tail.trim().length > 0 ) ret += tail;
      return ret;
    }
  ]
});


/** A tree-based Index. Defaults to an AATree (balanced binary search tree) **/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'TreeIndexNode',
  extends: 'foam.dao.index.IndexNode',

  properties: [
    {
      class: 'Simple',
      name: 'selectCount',
    },
    {
      class: 'Simple',
      name: 'root',
    }
  ],

  methods: [
    function init() {
      this.root = this.root || this.index.nullNode;
      this.selectCount = this.selectCount || 0;
    },

    /**
     * Bulk load an unsorted array of objects.
     * Faster than loading individually, and produces a balanced tree.
     **/
    function bulkLoad(a) {
      a = a.a || a;
      this.root = this.index.nullNode;

      // Only safe if children aren't themselves trees
      // TODO: should this be !TreeIndex.isInstance? or are we talking any
      // non-simple index, and is ValueIndex the only simple index?
      // It's the default, so ok for now
      if ( this.index.ValueIndex.isInstance(this.tail) ) {
        var prop = this.index.prop;
        a.sort(prop.compare.bind(prop));
        this.root = this.root.bulkLoad_(a, 0, a.length-1, prop.f);
      } else {
        for ( var i = 0 ; i < a.length ; i++ ) {
          this.put(a[i]);
        }
      }
    },

    function put(newValue) {
      this.root = this.root.putKeyValue(
          this.index.prop.f(newValue),
          newValue,
          this.index.compare,
          this.index.dedup,
          this.selectCount > 0);
    },

    function remove(value) {
      this.root = this.root.removeKeyValue(
          this.index.prop.f(value),
          value,
          this.index.compare,
          this.selectCount > 0,
          this.index.nullNode);
    },

    function get(key) {
      // does not delve into sub-indexes
      return this.root.get(key, this.index.compare);
    },

    function select(sink, skip, limit, order, predicate, cache) {
      // AATree node will extract orderDirs.next for the tail index
      if ( order && order.orderDirection() < 0 ) {
        this.root.selectReverse(sink, skip, limit, order, predicate, cache);
      } else {
        this.root.select(sink, skip, limit, order, predicate, cache);
      }
    },

    function size() { return this.root.size; },

    function plan(sink, skip, limit, order, predicate, root) {
      var index = this;
      var m = this.index;


      if ( m.False.isInstance(predicate) ) return m.NotFoundPlan.create();

      if ( ! predicate && m.Count.isInstance(sink) ) {
        var count = this.size();
        //        console.log('**************** COUNT SHORT-CIRCUIT ****************', count, this.toString());
        return m.CountPlan.create({ count: count });
      }

      var prop = m.prop;

      if ( foam.mlang.sink.GroupBy.isInstance(sink) && sink.arg1 === prop ) {
      // console.log('**************** GROUP-BY SHORT-CIRCUIT ****************');
      // TODO: allow sink to split up, for GroupBy passing one sub-sink to each tree node
      //  for grouping. Allow sink to suggest order, if order not defined
      //    sink.subSink(key) => sink
      //    sink.defaultOrder() => Comparator
      }

      var result, subPlan, cost;

      var isExprMatch = m.IS_EXPR_MATCH_FN.bind(this, predicate, prop);

      var expr = isExprMatch(m.In);
      if ( expr ) {
        predicate = expr.predicate;
        var keys = expr.arg2.f();
        // Just scan if that would be faster.
        if ( Math.log(this.size())/Math.log(2) * keys.length < this.size() ) {
          var subPlans = [];
          cost = 1;

          for ( var i = 0 ; i < keys.length ; ++i) {
            result = this.get(keys[i]);

            if ( result ) { // TODO: could refactor this subindex recursion into .plan()
              subPlan = result.plan(sink, skip, limit, order, predicate, root);

              cost += subPlan.cost;
              subPlans.push(subPlan);
            }
          }

          if ( subPlans.length === 0 ) return m.NotFoundPlan.create();

          // TODO: If ordering, AltPlan may need to sort like MergePlan.
          return m.AltPlan.create({
            subPlans: subPlans,
            prop: prop
          });
        }
      }

      expr = isExprMatch(m.Eq);
      if ( expr ) {
        predicate = expr.predicate;
        var key = expr.arg2.f();
        result = this.get(key, this.index.compare);

        if ( ! result ) return m.NotFoundPlan.create();

        subPlan = result.plan(sink, skip, limit, order, predicate, root);

        // TODO: If ordering, AltPlan may need to sort like MergePlan.
        return m.AltPlan.create({
          subPlans: [subPlan],
          prop: prop
        });
      }

      var ic = false;
      expr = isExprMatch(m.ContainsIC);
      if ( expr ) ic = true;
      expr = expr || isExprMatch(m.Contains);
      if ( expr ) {
        predicate = expr.predicate;
        var key = ic ? expr.arg2.f().toLowerCase() : expr.arg2.f();

        // Substring comparison function:
        // returns 0 if nodeKey contains masterKey.
        // returns -1 if nodeKey is shorter than masterKey
        // returns 1 if nodeKey is longer or equal length, but does not contain masterKey
        var compareSubstring = function compareSubstring(nodeKey, masterKey) {
          // nodeKey can't contain masterKey if it's too short
          if ( ( ! nodeKey ) || ( ! nodeKey.indexOf ) || ( nodeKey.length < masterKey.length ) ) return -1;

          if ( ic ) nodeKey = nodeKey.toLowerCase(); // TODO: handle case-insensitive better

          return nodeKey.indexOf(masterKey) > -1 ? 0 : 1;
        }

        var indexes = [];
        if ( ! key || key.length === 0 ) {
          // everything contains 'nothing'
          this.root.getAll('', function() { return 0; }, indexes);
        } else {
          this.root.getAll(key, compareSubstring, indexes);
        }
        var subPlans = [];
        // iterate over all keys
        for ( var i = 0; i < indexes.length; i++ ) {
          subPlans.push(indexes[i].plan(sink, skip, limit, order, predicate, root));
        }

        // TODO: If ordering, AltPlan may need to sort like MergePlan.
        return m.AltPlan.create({
          subPlans: subPlans,
          prop: prop
        });
      }

      // Restrict the subtree to search as necessary
      var subTree = this.root;

      expr = isExprMatch(m.Gt);
      if ( expr ) subTree = subTree.gt(expr.arg2.f(), this.index.compare);

      expr = isExprMatch(m.Gte);
      if ( expr ) subTree = subTree.gte(expr.arg2.f(), this.index.compare, this.index.nullNode);

      expr = isExprMatch(m.Lt);
      if ( expr ) subTree = subTree.lt(expr.arg2.f(), this.index.compare);

      expr = isExprMatch(m.Lte);
      if ( expr ) subTree = subTree.lte(expr.arg2.f(), this.index.compare, this.index.nullNode);

      cost = subTree.size;
      var sortRequired = ! this.index.isOrderSelectable(order);
      var reverseSort = false;

      var subOrder;
      var orderDirections;
      if ( order && ! sortRequired ) {
        // we manage the direction of the first scan directly,
        // tail indexes will use the order.orderTail()
        if ( order.orderDirection() < 0 ) reverseSort = true;
      }

      if ( ! sortRequired ) {
        if ( skip ) cost -= skip;
        if ( limit ) cost = Math.min(cost, limit);
      } else {
        // add sort cost
        if ( cost !== 0 ) cost *= Math.log(cost) / Math.log(2);
      }

      return m.CustomPlan.create({
        cost: cost,
        customExecute: function(promise, sink, skip, limit, order, predicate) {
          if ( sortRequired ) {
            var arrSink = m.ArraySink.create();
            index.selectCount++;
            subTree.select(arrSink, null, null, null, predicate, {});
            index.selectCount--;
            var a = arrSink.a;
            a.sort(order.compare.bind(order));

            skip = skip || 0;
            limit = Number.isFinite(limit) ? limit : a.length;
            limit += skip;
            limit = Math.min(a.length, limit);

            for ( var i = skip; i < limit; i++ )
              sink.put(a[i]);
          } else {
            index.selectCount++;
            // Note: pass skip and limit by reference, as they are modified in place
            reverseSort ?
              subTree.selectReverse(
                sink,
                skip != null ? [skip] : null,
                limit != null ? [limit] : null,
                order, predicate, {}) : subTree.select(
                  sink,
                  skip != null ? [skip] : null,
                  limit != null ? [limit] : null,
                  order, predicate, {}) ;
            index.selectCount--;
          }
        },
        customToString: function() {
          return 'scan(key=' + prop.name + ', cost=' + this.cost +
              (predicate && predicate.toSQL ? ', predicate: ' + predicate.toSQL() : '') +
              ')';
        }
      });
    },

    function toString() {
      return 'TreeIndex(' + (this.index || this).prop.name + ', ' + (this.index || this).tail + ')';
    }
  ]
});


/** Case-Insensitive TreeIndex **/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'CITreeIndex',
  extends: 'foam.dao.index.TreeIndex',
});


foam.CLASS({
  package: 'foam.dao.index',
  name: 'CITreeIndexNode',
  extends: 'foam.dao.index.TreeIndexNode',

  methods: [
    function put(newValue) {
      this.root = this.root.putKeyValue(
          this.index.prop.f(newValue).toLowerCase(),
          newValue,
          this.index.compare,
          this.index.dedup,
          this.selectCount > 0);
    },

    function remove(value) {
      this.root = this.root.removeKeyValue(
          this.index.prop.f(value).toLowerCase(),
          value,
          this.index.compare,
          this.selectCount > 0,
          this.index.nullNode);
    },

    /**
     * Do not optimize bulkload
     **/
    function bulkLoad(a) {
      a = a.a || a;
      this.root = this.index.nullNode;
      for ( var i = 0 ; i < a.length ; i++ ) {
        this.put(a[i]);
      }
    }
  ]
});


/** An Index for storing multi-valued properties. **/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'SetIndex',
  extends: 'foam.dao.index.TreeIndex',
});


foam.CLASS({
  package: 'foam.dao.index',
  name: 'SetIndexNode',
  extends: 'foam.dao.index.TreeIndexNode',

  methods: [
    // TODO: see if this can be done some other way
    function dedup() {
      // NOP, not safe to do here
    },

    /**
     * Do not optimize bulkload to SetIndex
     **/
    function bulkLoad(a) {
      a = a.a || a;
      this.root = this.index.nullNode;
      for ( var i = 0 ; i < a.length ; i++ ) {
        this.put(a[i]);
      }
    },

    function put(newValue) {
      var a = this.index.prop.f(newValue);

      if ( a.length ) {
        for ( var i = 0 ; i < a.length ; i++ ) {
          this.root = this.root.putKeyValue(
              a[i],
              newValue,
              this.index.compare,
              this.index.dedup);
        }
      } else {
        this.root = this.root.putKeyValue('', newValue, this.index.compare, this.index.dedup);
      }
    },

    function remove(value) {
      var a = this.index.prop.f(value);

      if ( a.length ) {
        for ( var i = 0 ; i < a.length ; i++ ) {
          this.root = this.root.removeKeyValue(a[i], value, this.index.compare, this.index.nullNode);
        }
      } else {
        this.root = this.root.removeKeyValue('', value, this.index.compare, this.index.nullNode);
      }
    }
  ]
});
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


/** An Index which adds other indices as needed. **/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'AutoIndex',
  extends: 'foam.dao.index.ProxyIndex',

  requires: [
    'foam.core.Property',
    'foam.dao.index.NoPlan',
    'foam.dao.index.CustomPlan',
    'foam.mlang.predicate.And',
    'foam.mlang.predicate.Or',
    'foam.dao.index.AltIndex',
    'foam.dao.index.ValueIndex',
    'foam.mlang.predicate.True',
    'foam.mlang.predicate.False',
  ],

  constants: {
    /** Maximum cost for a plan which is good enough to not bother looking at the rest. */
    GOOD_ENOUGH_PLAN: 20
  },

  properties: [
    {
      /** Used to create the delegate ID index for new instances of AutoIndex */
      name: 'idIndex',
      required: true
    },
    {
      name: 'delegate',
      factory: function() {
        return this.AltIndex.create({ delegates: [ this.idIndex ] });
      }
    }
  ],

  methods: [
    function estimate(size, sink, skip, limit, order, predicate) {
      return this.delegate.estimate(size, sink, skip, limit, order, predicate);
    },

    function toPrettyString(indent) {
      var ret = '';
      ret = '  '.repeat(indent) + 'Auto(' + this.$UID + ')\n';
      ret += this.delegate.toPrettyString(indent + 1);
      return ret;
    }

  ]
});


foam.CLASS({
  package: 'foam.dao.index',
  name: 'AutoIndexNode',
  extends: 'foam.dao.index.ProxyIndexNode',

  methods: [
    function addPropertyIndex(prop, root) {
      this.addIndex(prop.toIndex(this.index.cls_.create({
        idIndex: this.index.idIndex
      })), root);
    },

    function addIndex(index, root) {
      this.delegate.addIndex(index, root);
    },

    // TODO: mlang comparators should support input collection for
    //   index-building cases like this
    function plan(sink, skip, limit, order, predicate, root) {
      // NOTE: Using the existing index's plan as its cost when comparing
      //  against estimates is bad. An optimistic estimate from an index
      //  will cause it to always appear better than its real world
      //  performance, leading AutoIndex to keep creating new instances
      //  of the offending index. Comparing estimates to estimates is much
      //  more consistent and allows estimate() to be arbitrarily bad
      //  as long as it is indicative of relative performance of each
      //  index type.
      var existingPlan = this.delegate.plan(sink, skip, limit, order, predicate, root);
      var thisSize = this.size();

      // No need to try to auto-index if:
      //  - The existing plan is better than scanning already TODO: how much better?
      //  - We are too small to matter
      //  - There are no order/predicate constraints to optimize for
      if ( existingPlan.cost < thisSize ||
           thisSize < this.index.GOOD_ENOUGH_PLAN ||
           ! order &&
           ( ! predicate ||
             this.index.True.isInstance(predicate) ||
             this.index.False.isInstance(predicate)
           )
      ) {
        return existingPlan;
      }

      // add autoindex overhead
      existingPlan.cost += 10;

      var ARBITRARY_INDEX_CREATE_FACTOR = 1.5;
      var ARBITRARY_INDEX_CREATE_CONSTANT = 20;

      var self = this;
      var newIndex;

      var bestEstimate = this.delegate.index.estimate(this.delegate.size(), sink, skip, limit, order, predicate);
//console.log(self.$UID, "AutoEst OLD:", bestEstimate, this.delegate.toString().substring(0,20), this.size());
      if ( bestEstimate < this.index.GOOD_ENOUGH_PLAN ) {
        return existingPlan;
      }

      // Base planned cost on the old cost for the plan, to avoid underestimating and making this
      //  index build look too good
      var existingEstimate = bestEstimate;
      var idIndex = this.index.idIndex;

      if ( predicate ) {
        var candidate = predicate.toIndex(
          this.index.cls_.create({ idIndex: idIndex }), 1); // depth 1
        if ( candidate ) {
          var candidateEst = candidate.estimate(this.delegate.size(), sink,
            skip, limit, order, predicate)
            * ARBITRARY_INDEX_CREATE_FACTOR
            + ARBITRARY_INDEX_CREATE_CONSTANT;

//console.log(self.$UID, "AutoEst PRD:", candidateEst, candidate.toString().substring(0,20));
          //TODO: must beat by factor of X? or constant?
          if ( bestEstimate > candidateEst ) {
            newIndex = candidate;
            bestEstimate = candidateEst;
          }
        }
      }

      //  The order index.estimate gets the order AND predicate,
      //   so the predicate might make this index worse
      if ( order ) {
        var candidate = order.toIndex(
          this.index.cls_.create({ idIndex: idIndex }), 1); // depth 1
        if ( candidate ) {
          var candidateEst = candidate.estimate(this.delegate.size(), sink,
            skip, limit, order, predicate)
            * ARBITRARY_INDEX_CREATE_FACTOR
            + ARBITRARY_INDEX_CREATE_CONSTANT;
//console.log(self.$UID, "AutoEst ORD:", candidateEst, candidate.toString().substring(0,20));
          if ( bestEstimate > candidateEst ) {
            newIndex = candidate;
            bestEstimate = candidateEst;
          }
        }
      }


      if ( newIndex ) {
        // Since estimates are only valid compared to other estimates, find the ratio
        //  of our existing index's estimate to our new estimate, and apply that ratio
        //  to the actual cost of the old plan to determine our new index's assumed cost.
        var existingPlanCost = existingPlan.cost;
        var estimateRatio = bestEstimate / existingEstimate;

        return this.index.CustomPlan.create({
          cost: existingPlanCost * estimateRatio,
          customExecute: function autoIndexAdd(apromise, asink, askip, alimit, aorder, apredicate) {

console.log(self.$UID, "BUILDING INDEX", existingPlanCost, estimateRatio, this.cost, predicate && predicate.toString());
//console.log(newIndex.toPrettyString(0));
//console.log(self.$UID, "ROOT          ");
//console.log(root.index.toPrettyString(0));

            self.addIndex(newIndex, root);
            // Avoid a recursive call by hitting our delegate.
            // It should pick the new optimal index.
            self.delegate
              .plan(sink, skip, limit, order, predicate, root)
              .execute(apromise, asink, askip, alimit, aorder, apredicate);
          },
          customToString: function() { return 'AutoIndexAdd cost=' + this.cost + ', ' + newIndex.cls_.name; }
        });
      } else {
        return existingPlan;
      }
    },

    function toString() {
      return 'AutoIndex(' + (this.index || this).delegate.toString() + ')';
    },

  ]
});

/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.dao',
  name: 'MDAO',
  label: 'Indexed DAO',
  extends: 'foam.dao.AbstractDAO',

  documentation: 'Indexed in-Memory DAO.',

  requires: [
    'foam.dao.ArraySink',
    'foam.dao.ExternalException',
    'foam.dao.InternalException',
    'foam.dao.InvalidArgumentException',
    'foam.dao.ObjectNotFoundException',
    'foam.dao.index.AltIndex',
    'foam.dao.index.AutoIndex',
    'foam.dao.index.SetIndex',
    'foam.dao.index.TreeIndex',
    'foam.dao.index.ValueIndex',
    'foam.mlang.predicate.Eq',
    'foam.mlang.predicate.True',
    'foam.mlang.predicate.Or',
    'foam.mlang.sink.Explain',
    'foam.dao.index.MergePlan'
  ],

  properties: [
    {
      class: 'Class',
      name:  'of',
      required: true,
      postSet: function() {
        foam.assert(this.of.ID, "MDAO.of must be assigned a FOAM Class " +
          "with an 'id' Property or 'ids' array specified. Missing id in " +
          "class: " + ( this.of && this.of.id ));
      }
    },
    {
      class: 'Boolean',
      name: 'autoIndex',
      value: false
    },
    {
      name: 'idIndex'
    },
    {
      /** The root IndexNode of our index. */
      name: 'index'
    }
  ],

  methods: [
    function init() {
      // adds the primary key(s) as an index, and stores it for fast find().
      this.addPropertyIndex();
      this.idIndex = this.index;

      if ( this.autoIndex ) {
        this.addIndex(this.AutoIndex.create({ idIndex: this.idIndex.index }));
      }
    },

    /**
     * Add a non-unique index
     * args: one or more properties
     **/
    function addPropertyIndex() {
      var props = Array.from(arguments);

      // Add ID to make each sure the object is uniquely identified
      props.push(this.of.ID);

      return this.addUniqueIndex_.apply(this, props);
    },

    /**
     * Add a unique index
     * args: one or more properties
     * @private
     **/
    function addUniqueIndex_() {
      var index = this.ValueIndex.create();

      for ( var i = arguments.length-1 ; i >= 0 ; i-- ) {
        var prop = arguments[i];

        // Pass previous index as the sub-index of the next level up.
        // (we are working from leaf-most index up to root index in the list)
        index = prop.toIndex(index);
      }

      return this.addIndex(index);
    },

    function addIndex(index) {
      if ( ! this.index ) {
        this.index = index.createNode();
        return this;
      }

      // Upgrade single Index to an AltIndex if required.
      if ( ! this.AltIndex.isInstance(this.index.index) ) {
        this.index = this.AltIndex.create({
          delegates: [ this.index.index ] // create factory
        }).createNode({
          delegates: [ this.index ] // create an instance
        });
      }

      this.index.addIndex(index, this.index);

      return this;
    },

    /**
     * Bulk load data from another DAO.
     * Any data already loaded into this DAO will be lost.
     * @param sink (optional) eof is called when loading is complete.
     **/
    function bulkLoad(dao) {
      var self = this;
      var sink = self.ArraySink.create();
      return dao.select(sink).then(function() {
        var a = sink.a;
        self.index.bulkLoad(a);
        for ( var i = 0; i < a.length; ++i ) {
          var obj = a[i];
        }
      });
    },

    function put(obj) {
      var oldValue = this.find_(obj.id);
      if ( oldValue ) {
        this.index.remove(oldValue);
      }
      this.index.put(obj);
      this.pub('on', 'put', obj);
      return Promise.resolve(obj);
    },

    function find(objOrKey) {
      if ( objOrKey === undefined ) {
        return Promise.reject(this.InvalidArgumentException.create({
          message: '"key" cannot be undefined/null'
        }));
      }

      return Promise.resolve(this.find_(
          this.of.isInstance(objOrKey) ? objOrKey.id : objOrKey));
    },

    /** internal, synchronous version of find, does not throw */
    function find_(key) {
      var index = this.idIndex;
      index = index.get(key);

      if ( index && index.get() ) return index.get();

      return null;
    },

    function remove(obj) {
      if ( ! obj || obj.id === undefined ) {
        return Promise.reject(this.ExternalException.create({ id: 'no_id' })); // TODO: err
      }

      var id   = obj.id;
      var self = this;

      var found = this.find_(id);
      if ( found ) {
        self.index.remove(found);
        self.pub('on', 'remove', found);
      }

      return Promise.resolve();
    },

    function removeAll(skip, limit, order, predicate) {
      if ( ! predicate ) predicate = this.True.create();
      var self = this;
      return self.where(predicate).select(self.ArraySink.create()).then(
        function(sink) {
          var a = sink.a;
          for ( var i = 0 ; i < a.length ; i++ ) {
            self.index.remove(a[i]);
            self.pub('on', 'remove', a[i]);
          }
          return Promise.resolve();
        }
      );
    },

    function select(sink, skip, limit, order, predicate) {
      sink = sink || this.ArraySink.create();
      var plan;
//console.log("----select");
      if ( this.Explain.isInstance(sink) ) {
        plan = this.index.plan(sink.arg1, skip, limit, order, predicate, this.index);
        sink.plan = 'cost: ' + plan.cost + ', ' + plan.toString();
        sink && sink.eof && sink.eof();
        return Promise.resolve(sink);
      }

      predicate = predicate && predicate.toDisjunctiveNormalForm();
      if ( ! predicate || ! this.Or.isInstance(predicate) ) {
        plan = this.index.plan(sink, skip, limit, order, predicate, this.index);
      } else {
        plan = this.planForOr(sink, skip, limit, order, predicate);
      }

      var promise = [Promise.resolve()];
      plan.execute(promise, sink, skip, limit, order, predicate);
      return promise[0].then(
        function() {
          sink && sink.eof && sink.eof();
          return Promise.resolve(sink);
        },
        function(err) {
          return Promise.reject(err);
        }
      );
    },

    function planForOr(sink, skip, limit, order, predicate) {
      // if there's a limit, add skip to make sure we get enough results
      //   from each subquery. Our sink will throw out the extra results
      //   after sorting.
      var subLimit = ( limit ? limit + ( skip ? skip : 0 ) : undefined );

      // This is an instance of OR, break up into separate queries
      var args = predicate.args;
      var plans = [];
      for ( var i = 0; i < args.length; i++ ) {
        // NOTE: we pass sink here, but it's not going to be the one eventually
        // used.
        plans.push(
          this.index.plan(sink, undefined, subLimit, undefined, args[i], this.index)
        );
      }

      return this.MergePlan.create({ of: this.of, subPlans: plans });
    },

    function toString() {
      return 'MDAO(' + this.cls_.name + ',' + this.index + ')';
    }
  ]
});
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

foam.CLASS({
  package: 'foam.dao',
  name: 'ArrayDAO',
  extends: 'foam.dao.AbstractDAO',

  documentation: 'DAO implementation backed by an array.',

  requires: [
    'foam.dao.ArraySink',
    'foam.mlang.predicate.True'
  ],

  properties: [
    {
      class: 'Class',
      name: 'of',
      factory: function() {
        if (this.array.length === 0) return this.lookup('foam.core.FObject');
        return this.array[0].cls_;
      },
    },
    {
      name: 'array',
      factory: function() { return []; }
    }
  ],

  methods: [
    function put(obj) {
      for ( var i = 0 ; i < this.array.length ; i++ ) {
        if ( obj.ID.compare(obj, this.array[i]) === 0 ) {
          this.array[i] = obj;
          break;
        }
      }

      if ( i == this.array.length ) this.array.push(obj);
      this.on.put.pub(obj);

      return Promise.resolve(obj);
    },

    function remove(obj) {
      for ( var i = 0 ; i < this.array.length ; i++ ) {
        if ( foam.util.equals(obj.id, this.array[i].id) ) {
          var o2 = this.array.splice(i, 1)[0];
          this.on.remove.pub(o2);
          break;
        }
      }

      return Promise.resolve();
    },

    function select(sink, skip, limit, order, predicate) {
      var resultSink = sink || this.ArraySink.create();

      sink = this.decorateSink_(resultSink, skip, limit, order, predicate);

      var detached = false;
      var sub = foam.core.FObject.create();
      sub.onDetach(function() { detached = true; });

      var self = this;

      return new Promise(function(resolve, reject) {
        for ( var i = 0 ; i < self.array.length ; i++ ) {
          if ( detached ) break;

          sink.put(self.array[i], sub);
        }

        sink.eof();

        resolve(resultSink);
      });
    },

    function removeAll(skip, limit, order, predicate) {
      predicate = predicate || this.True.create();
      skip = skip || 0;
      limit = foam.Number.isInstance(limit) ? limit : Number.MAX_VALUE;

      for ( var i = 0; i < this.array.length && limit > 0; i++ ) {
        if ( predicate.f(this.array[i]) ) {
          if ( skip > 0 ) {
            skip--;
            continue;
          }
          var obj = this.array.splice(i, 1)[0];
          i--;
          limit--;
          this.on.remove.pub(obj);
        }
      }

      return Promise.resolve();
    },

    function find(key) {
      var id = this.of.isInstance(key) ? key.id : key;
      for ( var i = 0 ; i < this.array.length ; i++ ) {
        if ( foam.util.equals(id, this.array[i].id) ) {
          return Promise.resolve(this.array[i]);
        }
      }

      return Promise.resolve(null);
    }
  ]
});
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

foam.CLASS({
  package: 'foam.dao',
  name: 'TimestampDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'DAO decorator that sets the current time on each put() object, provided not already set. By default, the .id proeprty is set.',

  properties: [
    {
      /**
        The property of incoming objects to set.
      */
      class: 'String',
      name: 'property',
      value: 'id'
    }
  ],

  methods: [
    /** For each put() object, set the timestamp if .property is not
      set for that object. */
    function put(obj) {
      if ( ! obj.hasOwnProperty(this.property) ) obj[this.property] = this.nextTimestamp();
      return this.delegate.put(obj);
    },

    /** Generates a timestamp. Override to change the way timestamps are
      created. */
    function nextTimestamp() {
      return Date.now();
    }
  ]
});
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

foam.CLASS({
  package: 'foam.dao',
  name: 'GUIDDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: function() {/*
    DAO Decorator that sets a property to a new random GUID (globally unique identifier) on put(), unless value already set.
    By default, the .id property is used.
    <p>
    Use a foam.dao.EasyDAO with guid:true to automatically set GUIDs. Set
    EasyDAO.seqProperty to the desired property name or use the default
    of 'id'.
  */},

  properties: [
    {
      /** The property to set with a random GUID value, if not already set
        on put() objects. */
      class: 'String',
      name: 'property',
      value: 'id'
    }
  ],

  methods: [
    /** Ensures all objects put() in have a unique id set.
      @param obj the object to process. */
    function put(obj) {
      if ( ! obj.hasOwnProperty(this.property) ) {
        obj[this.property] = foam.uuid.randomGUID();
      }

      return this.delegate.put(obj);
    }
  ]
});
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

foam.CLASS({
  package: 'foam.dao',
  name: 'ReadOnlyDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: 'DAO decorator that throws errors on put and remove.',
  methods: [
    function put() {
      return Promise.reject('Cannot put into ReadOnlyDAO');
    },
    function remove() {
      return Promise.reject('Cannot remove from ReadOnlyDAO');
    },
    function removeAll() {
      return Promise.reject('Cannot removeAll from ReadOnlyDAO');
    },
  ]
});
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

foam.INTERFACE({
  package: 'foam.dao',
  name: 'Journal',
  extends: 'foam.dao.Sink',
  methods: [
    function replay(dao) {}
  ]
});

if ( foam.isServer ) {
  foam.CLASS({
    package: 'foam.dao',
    name: 'NodeFileJournal',
    implements: ['foam.dao.Journal'],
    properties: [
      {
        name: 'fd',
        required: true
      },
      {
        name: 'offset',
        factory: function() {
          var stat = this.fs.fstatSync(this.fd);
          return stat.size;
        }
      },
      {
        name: 'fs',
        factory: function() { return require('fs'); }
      }
    ],
    methods: [
      function put(obj) {
        this.write_(
          new Buffer("put(foam.json.parse(" +
                     foam.json.Storage.stringify(obj) + "));\n"));
      },
      function remove(obj) {
        this.write_(
          new Buffer("remove(foam.json.parse(" +
                     foam.json.Storage.stringify(obj) + "));\n"));
      },
      function write_(data) {
        var offset = this.offset;
        this.offset += data.length;
        this.fs.write(this.fd, data, 0, data.length, offset, function(err, written, buffer){
          if ( written != data.length ) throw "What";
          if ( err ) throw err;
        });
      },
      function replay(dao) {
        var self = this;
        return new Promise(function(resolve, reject) {
          self.fs.readFile(self.fd, 'utf8', function(err, data_) {
            if ( err ) {
              reject(err);
              return;
            }

            with(dao) eval(data_);

            resolve(dao);
          });
        });
      },
      function eof() {}
    ]
  });
}

foam.CLASS({
  package: 'foam.dao',
  name: 'JournaledDAO',
  extends: 'foam.dao.PromisedDAO',
  properties: [
    'delegate',
    'journal',
    {
      name: 'promise',
      factory: function() {
        var self = this;
        return this.journal.replay(this.delegate).then(function(dao) {
          dao.listen(self.journal);
          return dao;
        });
      }
    }
  ]
});
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

foam.CLASS({
  package: 'foam.dao',
  name: 'Relationship',
  implements: [ 'foam.mlang.Expressions' ],

  documentation: 'An Axiom for defining Relationships between models.',

  requires: [
    'foam.dao.RelationshipDAO',
    'foam.dao.ManyToManyRelationshipDAO',
    'foam.dao.ReadOnlyDAO',
  ],

  properties: [
    {
      name: 'id',
      hidden: true,
      transient: true,
      getter: function() {
        return this.package ? this.package + '.' + this.name : this.name;
      }
    },
    {
      name: 'package',
      // Default to sourceModel's package if not specified.
      factory: function() {
        return this.lookup(this.sourceModel).package;
      }
    },
    {
      name: 'name',
      transient: true,
      hidden: true,
      getter: function() {
        return this.lookup(this.sourceModel).name +
          foam.String.capitalize(this.forwardName) + 'Relationship';
      }
    },
    'forwardName',
    'inverseName',
    {
      name: 'cardinality',
      assertValue: function(value) {
        foam.assert(value === '1:*' || value === '*:*',
          'Supported cardinalities are 1:* and *:*');
      },
      value: '1:*'
    },
    {
      class: 'String',
      name: 'sourceModel'
    },
    {
      class: 'String',
      name: 'targetModel'
    },
    {
      class: 'FObjectArray',
      name: 'sourceProperties',
      of: 'Property',
      adaptArrayElement: foam.core.Model.PROPERTIES.adaptArrayElement
    },
    {
      class: 'FObjectArray',
      name: 'targetProperties',
      of: 'Property',
      adaptArrayElement: foam.core.Model.PROPERTIES.adaptArrayElement
    },
    {
      class: 'String',
      name: 'junctionModel',
      expression: function(sourceModel, targetModel) {
        return ( this.package ? this.package + '.' : '' ) + foam.lookup(sourceModel).name + foam.lookup(targetModel).name + 'Junction'; }
    },
    {
      class: 'String',
      name: 'sourceDAOKey',
      expression: function(sourceModel) {
        return foam.String.daoize(foam.lookup(sourceModel).name);
      }
    },
    {
      class: 'String',
      name: 'targetDAOKey',
      expression: function(targetModel) {
        return foam.String.daoize(foam.lookup(targetModel).name);
      }
    },
    {
      class: 'String',
      name: 'junctionDAOKey',
      expression: function(junctionModel) {
        return foam.String.daoize(foam.lookup(junctionModel).name);
      }
    },
    {
      name: 'adaptTarget',
      factory: function() {
        var inverseName = this.inverseName;

        return function(source, target) {
          target[inverseName] = source.id;

          return target;
        }
      }
    },
    {
      class: 'Boolean',
      name: 'oneWay'
    },
    {
      class: 'Map',
      name: 'sourceProperty'
    },
    {
      class: 'Map',
      name: 'targetProperty'
    },
    /* FUTURE:
    {
      name: 'deleteStrategy'
      // prevent, cascade, orphan
    }
    */
  ],

  methods: [
    function init() {
      var sourceProps   = this.sourceProperties || [];
      var targetProps   = this.targetProperties || [];
      var cardinality   = this.cardinality;
      var forwardName   = this.forwardName;
      var inverseName   = this.inverseName;
      var relationship  = this;
      var sourceModel   = this.sourceModel;
      var targetModel   = this.targetModel;
      var junctionModel = this.junctionModel;
      var source        = this.lookup(sourceModel);
      var target        = this.lookup(targetModel);
      var junction      = this.lookup(junctionModel, true);

      var sourceDAOKey   = this.sourceDAOKey;
      var targetDAOKey   = this.targetDAOKey;

      if ( cardinality === '1:*' ) {
        if ( ! sourceProps.length ) {
          sourceProps = [
            foam.dao.DAOProperty.create({
              name: forwardName,
              cloneProperty: function(value, map) {},
              transient: true,
              expression: function(id) {
                return foam.dao.RelationshipDAO.create({
                  obj: this,
                  relationship: relationship
                }, this);
              },
            }).copyFrom(this.sourceProperty)
          ];
        }

        if ( ! targetProps.length ) {
          targetProps = [
            foam.core.Reference.create({
              name: inverseName,
              of: sourceModel,
              targetDAOKey: sourceDAOKey
            }).copyFrom(this.targetProperty)
          ];
        }
      } else { /* cardinality === '*.*' */
        if ( ! junction ) {
          var name = this.junctionModel.substring(
            this.junctionModel.lastIndexOf('.') + 1);
          var id = this.package + '.' + name;
          foam.CLASS({
            package: this.package,
            name: name,
            ids: [ 'sourceId', 'targetId' ],
            properties: [
              { name: 'sourceId', shortName: 's' },
              { name: 'targetId', shortName: 't' }
            ]
          });

          junction = foam.lookup(this.junctionModel);
        }

        var junctionDAOKey = this.junctionDAOKey;

        if ( ! sourceProps.length ) {
          sourceProps = [
            foam.dao.RelationshipProperty.create({
              name: forwardName,
              cloneProperty: function(value, map) {},
              transient: true,
              expression: function(id) {
                return  foam.dao.RelationshipPropertyValue.create({
                  sourceId: id,
                  dao: foam.dao.ReadOnlyDAO.create({
                    delegate: foam.dao.ManyToManyRelationshipDAO.create({
                      delegate: this.__context__[targetDAOKey],
                      junctionProperty: junction.TARGET_ID,
                      junctionDAOKey: junctionDAOKey,
                      junctionKeyFactory: function(a) { return [id, a]; },
                      junctionCls: junction,
                      sourceKey: id,
                      sourceProperty: junction.SOURCE_ID,
                      targetProperty: target.ID
                    }, this)
                  }, this),
                  targetDAO: this.__context__[targetDAOKey],
                  junctionDAO: this.__context__[junctionDAOKey]
                }, this);
              },
            }).copyFrom(this.sourceProperty)
          ];
        }

        if ( ! targetProps.length ) {
          targetProps = [
            foam.dao.RelationshipProperty.create({
              name: inverseName,
              cloneProperty: function(value, map) {},
              transient: true,
              expression: function(id) {
                return  foam.dao.RelationshipPropertyValue.create({
                  targetId: id,
                  dao: foam.dao.ReadOnlyDAO.create({
                    delegate: foam.dao.ManyToManyRelationshipDAO.create({
                      delegate: this.__context__[sourceDAOKey],
                      junctionProperty: junction.SOURCE_ID,
                      junctionDAOKey: junctionDAOKey,
                      junctionKeyFactory: function(a) { return [a, id]; },
                      junctionCls: junction,
                      sourceKey: id,
                      sourceProperty: junction.TARGET_ID,
                      targetProperty: source.ID
                    }, this)
                  }, this),
                  targetDAO: this.__context__[sourceDAOKey],
                  junctionDAO: this.__context__[junctionDAOKey]
                }, this);
              },
            }).copyFrom(this.targetProperty)
          ];
        }
      }

      foam.assert(
        sourceProps.length === targetProps.length,
        'Relationship source/target property list length mismatch.');

      for ( var i = 0 ; i < sourceProps.length ; i++ ) {
        var sp = sourceProps[i];
        var tp = targetProps[i];

        if ( ! source.getAxiomByName(sp.name) ) {
          source.installAxiom(sp);
        }

        if ( ! this.oneWay && ! target.getAxiomByName(tp.name) ) {
          target.installAxiom(tp);
        }
      }

      /*
      if ( ! this.oneWay ) {
        sourceProperty.preSet = function(_, newValue) {
          if ( newValue ) {
            for ( var i = 0 ; i < sourceProps.length ; i++ ) {
              newValue[targetProps[i].name] = this[sourceProps[i]];
            }
          }
          return newValue;
        };
      }
      */
    },

    function targetQueryFromSource(obj) {
      var targetClass = this.lookup(this.targetModel);
      var name        = this.inverseName;
      var targetProp  = targetClass[foam.String.constantize(name)];

      if ( obj.id === undefined ) {
        this.warn('Attempted to read relationship from object with no id.');
        return this.FALSE;
      }

      return this.EQ(targetProp, obj.id);
    }
  ]
});


foam.LIB({
  name: 'foam',
  methods: [
    function RELATIONSHIP(m, opt_ctx) {
      var r = foam.dao.Relationship.create(m, opt_ctx);

      r.validate && r.validate();
      foam.package.registerClass(r);

      return r;
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'RelationshipPropertyValue',
  properties: [
    'sourceId',
    'targetId',
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'junctionDAO'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'targetDAO'
    },
  ],
  methods: [
    function add(obj) {
      var junction = this.junctionDAO.of.create({
        sourceId: this.sourceId || obj.id,
        targetId: this.targetId || obj.id
      });
      return this.junctionDAO.put(junction);
    },

    function remove(obj) {
      var junction = this.junctionDAO.of.create({
        sourceId: this.sourceId || obj.id,
        targetId: this.targetId || obj.id
      });
      return this.junctionDAO.remove(junction);
    }
  ],
});

foam.CLASS({
  package: 'foam.dao',
  name: 'RelationshipProperty',
  extends: 'foam.core.FObjectProperty',
  properties: [
    {
      name: 'of',
      value: 'foam.dao.RelationshipPropertyValue',
    },
    {
      name: 'view',
      value: { class: 'foam.comics.RelationshipView' },
    },
  ],
});
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

foam.CLASS({
  package: 'foam.dao',
  name: 'RelationshipDAO',
  extends: 'foam.dao.FilteredDAO',

  documentation: 'Adapts a DAO based on a Relationship.',

  properties: [
    {
      name: 'obj'
    },
    {
      name: 'relationship',
      required: true
    },
    {
      name: 'predicate',
      getter: function() {
        return this.relationship.targetQueryFromSource(this.obj);
      }
    },
    {
      name: 'delegate',
      factory: function() {
        var key      = this.relationship.targetDAOKey;
        var delegate = this.__context__[key];

        foam.assert(delegate, 'Missing relationship DAO:', key);

        return delegate;
      }
    }
  ],

  methods: [
    function put(obj) {
      return this.SUPER(this.relationship.adaptTarget(this.obj, obj));
    },
    function clone() {
      // Prevent cloneing
      return this;
    }
  ]
});
/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.dao',
  name: 'ManyToManyRelationshipDAO',
  extends: 'foam.dao.ProxyDAO',

  implements: [ 'foam.mlang.Expressions' ],

  documentation: 'Adapts a DAO based on a *:* Relationship.',

  properties: [
    'junctionProperty',
    'junctionDAOKey',
    'junctionCls',
    'targetProperty',
    'sourceKey',
    'sourceProperty',
    'junctionKeyFactory',
    {
      name: 'junctionDAO',
      getter: function() {
        return this.__context__[this.junctionDAOKey];
      }
    }
  ],

  methods: [
    function find(key) {
      var id = foam.core.FObject.isInstance(key) ? key.id : key;
      var self = this;
      return self.junctionDAO.find(self.junctionKeyFactory(id)).then(function(a) {
        return a && self.delegate.find(id);
      });
    },
    function select(sink, skip, limit, order, predicate) {
      var self = this;

      return self.junctionDAO.
        where(self.EQ(self.sourceProperty, self.sourceKey)).
        select(self.MAP(self.junctionProperty)).then(function(map) {
          return self.delegate.select(sink, skip, limit, order, self.AND(
            predicate || self.TRUE,
            self.IN(self.targetProperty, map.delegate.a)));
        });
    }
  ]
});
/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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
  LazyCacheDAO can cache successful results from find() and select() on its
  delegate. It only updates after new queries come in, and returns cached
  results immediately, even if new results arrive from the delegate.
  listen or pipe from this DAO to stay up to date.
*/
foam.CLASS({
  package: 'foam.dao',
  name: 'LazyCacheDAO',
  extends: 'foam.dao.ProxyDAO',

  implements: [ 'foam.mlang.Expressions' ],

  requires: [
    'foam.dao.ArraySink',
    'foam.dao.DAOSink'
  ],

  properties: [
    {
      /** Set to the desired cache, such as a foam.dao.MDAO. */
      name: 'cache',
      required: true
    },
    {
      /**
        TODO: This is attempting to express a link between two other properties,
        and a side-effect (subscription) is what is desired, not a value. Also
        the cacheSync_ prop needs to be tickled to ensure the link exists.
        Change this to define an expression that defines a run-time 'thing'
        to be done between properties, and allows cleanup when re-evaluating.
        @private
      */
      name: 'cacheSync_',
      expression: function(delegate, cache) {
        var s = this.cacheSyncSub_ = delegate.on.remove.sub(
          function(sub_, on_, remove_, obj) {
            cache.remove(obj);
          }
        );
        return s;
      }
    },
    {
      /** Stores cleanup info for the cache sychronization subscription.
        @private */
      name: 'cacheSyncSub_',
      postSet: function(old, nu) {
        if ( old && old.detach ) old.detach();
      }
    },
    {
      /**
        When true, makes a network call in the background to
        update the record, even on a cache hit.
      */
      class: 'Boolean',
      name: 'refreshOnCacheHit',
      value: false,
    },
    {
      /**
        Whether to populate the cache on select().
      */
      class: 'Boolean',
      name: 'cacheOnSelect',
      value: false
    },
    {
      /**
        Time in milliseconds before we consider the delegate
        results to be stale for a particular predicate and will issue a new
        select.
      */
      class: 'Int',
      name: 'staleTimeout',
      value: 500,
      //units: 'ms',
    },
    {
      /**
        The active promises for remote finds in progress, for re-use
        by subsequent finds made before the previous resolves.
        @private
      */
      name: 'finds_',
      hidden: true,
      transient: true,
      factory: function() { return {}; }
    },
    {
      /**
        The active promises for remote selects in progress, for re-use
        by subsequent selects made before the previous resolves.
        @private
      */
      name: 'selects_',
      hidden: true,
      transient: true,
      factory: function() { return {}; }
    },
    {
      /**
        Generates an internal key to uniquely identify a select.
        @private
      */
      class: 'Function',
      name: 'selectKey',
      value: function(sink, skip, limit, order, predicate /*string*/) {
        return ( predicate && predicate.toString() ) || "" + "," +
          limit + "," + skip + "," + ( order && order.toString() ) || "";
      }
    }
  ],

  methods: [
    /** Ensures removal from both cache and delegate before resolving. */
    function remove(obj) {
      var self = this;
      return self.cache.remove(obj).then(function() {
        return self.delegate.remove(obj);
      });
    },

    /**
      Executes the find on the cache first, and if it fails triggers an
      update from the delegate.
    */
    function find(id) {
      var self = this;
      // TODO: Express this better.
      // Assigning to unused variable to keep Closure happy.
      var _ = self.cacheSync_; // ensures listeners are set
      // TODO: stale timeout on find?

      // Check the in-flight remote finds_
      if ( self.finds_[id] ) {
        // Attach myself if there's one for this id, since the cache must
        // have already failed
        return self.finds_[id];
      } else {
        // Try the cache
        return self.cache.find(id).then(

          function (val) {
            // Cache hit, but create background request if required
            if ( val ) {
              if ( self.refreshOnCacheHit ) {
                // Don't record in finds_, since we don't want anyone waiting for it
                self.delegate.find(id).then(function (val) {
                  val && self.cache.put(val);
                });
              }
              return val;
            }
            // Failed to find in cache, so try remote.
            // Another request may have come in the meantime, so check again for
            // an in-flight find for this ID.
            if ( ! self.finds_[id] ) {
              self.finds_[id] = self.delegate.find(id);
              // we created the remote request, so clean up finds_ later
              var errorHandler = function(err) {
                delete self.finds_[id]; // in error case, still clean up
                throw err;
              };

              return self.finds_[id].then(function (val) {
                // once the cache is updated, remove this stale promise
                if ( ! val ) {
                  delete self.finds_[id];
                  return null;
                }

                return self.cache.put(val).then(function(val) {
                  delete self.finds_[id];
                  return val;
                }, errorHandler);
              }, errorHandler);
            } else {
              // piggyback on an existing update request, cleanup already handled
              return self.finds_[id];
            }
          }
        );
      }
    },

    /**
      Executes the select on the cache first, and if it fails triggers an
      update from the delegate.
      <p>
      If .cacheOnSelect is false, the select()
      bypasses the cache and goes directly to the delegate.
    */
    function select(sink, skip, limit, order, predicate) {
      if ( ! this.cacheOnSelect ) {
        return this.SUPER(sink, skip, limit, order, predicate);
      }
      sink = sink || this.ArraySink.create();
      var key = this.selectKey(sink, skip, limit, order, predicate);
      var self = this;
      // Assigning to unused variable to keep Closure happy.
      // TODO: Express this better.
      var _ = self.cacheSync_; // Ensures listeners are set.

      // Check for missing or stale remote request. If needed, immediately
      // start a new one that will trigger a reset of this when complete.
      // TODO: Entries are retained for every query, never deleted. Is that ok?
      var entry = self.selects_[key];
      if ( ! entry || ( Date.now() - entry.time ) > self.staleTimeout ) {
        self.selects_[key] = entry = {
          time: Date.now(),
          promise:
            self.delegate.select(self.DAOSink.create({ dao: self.cache }), skip, limit, order, predicate)
              .then(function(cache) {
                //self.pub('on', 'reset'); //FIXME: triggering repeated/cyclic onDAOUpdate in caller.
                return cache;
              })
        }
      }

      function readFromCache() {
        return self.cache.select(sink, skip, limit, order, predicate);
      }

      // If anything exists in the cache for this query, return it (updates
      // may arrive later and trigger a reset notification). If nothing,
      // wait on the pending cache update.
      return self.cache.select(this.COUNT(), skip, limit, order, predicate)
        .then(function(c) {
          if ( c.value > 0 ) {
            return readFromCache();
          } else {
            return entry.promise.then(readFromCache);
          }
        });
    }
  ]
});
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
  CachingDAO will do all queries from its fast cache. Writes
  are sent through to the src and cached before resolving any put() or
  remove().
  <p>
  You can use a foam.dao.EasyDAO with caching:true to use caching
  automatically with an indexed MDAO cache.
  <p>
  The cache maintains full copy of the src, but the src is considered the
  source of truth.
*/
foam.CLASS({
  package: 'foam.dao',
  name: 'CachingDAO',
  extends: 'foam.dao.ProxyDAO',

  requires: [
    'foam.dao.PromisedDAO',
    'foam.dao.DAOSink',
  ],

  properties: [
    {
      /** The source DAO on which to add caching. Writes go straight
        to the src, and cache is updated to match.
      */
      class: 'foam.dao.DAOProperty',
      name: 'src'
    },
    {
      /** The cache to read items quickly. Cache contains a complete
        copy of src. */
      name: 'cache',
    },
    {
      /**
        Set .cache rather than using delegate directly.
        Read operations and notifications go to the cache, waiting
        for the cache to preload the complete src state. 'Unforward'
        ProxyDAO's default forwarding of put/remove/removeAll.
        @private
      */
      class: 'Proxy',
      of: 'foam.dao.DAO',
      name: 'delegate',
      hidden: true,
      topics: [ 'on' ],
      forwards: [ 'find', 'select' ],
      expression: function(src, cache) {
        // Preload src into cache, then proxy everything to cache that we
        // don't override explicitly.
        var self = this;
        var cacheFilled = cache.removeAll().then(function() {
          // First clear cache, then load the src into the cache
          return src.select(self.DAOSink.create({dao: cache})).then(function() {
            return cache;
          });
        });
        // The PromisedDAO resolves as our delegate when the cache is ready to use
        return this.PromisedDAO.create({
          promise: cacheFilled
        });
      }
    },
  ],

  methods: [
    function init() {
      this.SUPER();

      var proxy = this.src$proxy;
      proxy.sub('on', 'put',    this.onSrcPut);
      proxy.sub('on', 'remove', this.onSrcRemove);
      proxy.sub('on', 'reset',  this.onSrcReset);
    },

    /** Puts are sent to the cache and to the source, ensuring both
      are up to date. */
    function put(o) {
      var self = this;
      // ensure the returned object from src is cached.
      return self.src.put(o).then(function(srcObj) {
        return self.delegate.put(srcObj);
      })
    },

    /** Removes are sent to the cache and to the source, ensuring both
      are up to date. */
    function remove(o) {
      var self = this;
      return self.src.remove(o).then(function() {
        return self.delegate.remove(o);
      })
    },
   /** removeAll is executed on the cache and the source, ensuring both
      are up to date. */
    function removeAll(skip, limit, order, predicate) {
      var self = this;
      return self.src.removeAll(skip, limit, order, predicate).then(function() {
        return self.delegate.removeAll(skip, limit, order, predicate);
      })
    }
  ],

  listeners: [
    /** Keeps the cache in sync with changes from the source.
      @private */
    function onSrcPut(s, on, put, obj) {
      this.delegate.put(obj);
    },

    /** Keeps the cache in sync with changes from the source.
      @private */
    function onSrcRemove(s, on, remove, obj) {
      this.delegate.remove(obj);
    },

    /** Keeps the cache in sync with changes from the source.
      @private */
    function onSrcReset() {
      // TODO: Should this removeAll from the cache?
    }
  ]
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.dao',
  name: 'DeDupDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: function() {/*
    DeDupDAO is a decorator that internalizes strings in put() objects to save memory.
    Useful for indexed or cached data.
    <p>
    Use a foam.dao.EasyDAO with dedup:true to automatically apply deduplication.
  */},

  methods: [
    /** Scan each object for strings and internalize them. */
    function put(obj) {
      this.dedup(obj);
      return this.delegate.put(obj);
    },

    /** Internalizes strings in the given object.
      @private */
    function dedup(obj) {
      var inst = obj.instance_;
      for ( var key in inst ) {
        var val = inst[key];
        if ( typeof val === 'string' ) {
          inst[key] = foam.String.intern(val);
        }
      }
    }
  ]
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.dao',
  name: 'LRUDAOManager',
  implements: [ 'foam.mlang.Expressions' ],

  documentation: 'Manages a DAO\'s size by removing old items. Commonly applied inside a cache to limit the cache\'s size. Item freshness is tracked in a separate DAO.',

  requires: [ 'foam.dao.MDAO' ],

  classes: [
    {
      /** Links an object id to a last-accessed timestamp */
      name: 'LRUCacheItem',
      properties: [
        {
          name: 'id',
        },
        {
          class: 'Int',
          name: 'timestamp'
        }
      ]
    }
  ],

  properties: [
    {
      /** The maximum size to allow the target dao to be. */
      class: 'Int',
      name: 'maxSize',
      value: 100
    },
    {
      /** Tracks the age of items in the target dao. */
      name: 'trackingDAO',
      factory: function() {
        return this.MDAO.create({ of: this.LRUCacheItem });
      }
    },
    {
      /** The DAO to manage. Items will be removed from this DAO as needed. */
      class: 'foam.dao.DAOProperty',
      name: 'dao'
    },
    {
      /** By starting at the current time, this should always be higher
        than previously stored timestamps. (only relevant if trackingDAO
        is persisted.) */
      class: 'Int',
      name: 'lastTimeUsed_',
      factory: function() { return Date.now(); }
    }
  ],

  methods: [
    function init() {
      this.SUPER();

      var proxy = this.dao$proxy;
      proxy.sub('on', 'put',    this.onPut);
      proxy.sub('on', 'remove', this.onRemove);
      proxy.sub('on', 'reset',  this.onReset);
    },

    /** Calculates a timestamp to use in the tracking dao. Override to
      provide a different timestamp calulation. */
    function getTimestamp() {
      // Just increment on each request.
      return this.lastTimeUsed_++;
    },

    function cleanup() {
      var self = this;
      self.trackingDAO
        .orderBy(this.DESC(self.LRUCacheItem.TIMESTAMP))
        .skip(self.maxSize)
        .select({
          put: function(obj) {
            self.dao.remove(obj);
          }
        });
    }
  ],

  listeners: [
    /** Adds the put() item to the tracking dao, runs cleanup() to check
      the dao size. */
    function onPut(s, on, put, obj) {
      var self = this;
      this.trackingDAO.put(
        this.LRUCacheItem.create({
          id: obj.id,
          timestamp: self.getTimestamp()
        })
      ).then(function() {
        self.cleanup();
      });
    },

    /** Clears the remove()'d item from the tracking dao. */
    function onRemove(s, on, remove, obj) {
      // ensure tracking DAO is cleaned up
      this.trackingDAO.remove(obj);
    },

    /** On reset, clear the tracking dao. */
    function onReset(s, on, reset, obj) {
      this.trackingDAO.removeAll(obj);
    }
  ]
});
/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.dao',
  name: 'SequenceNumberDAO',
  extends: 'foam.dao.ProxyDAO',

  implements: [
    'foam.mlang.Expressions'
  ],

  documentation: 'DAO Decorator which sets a specified property\'s value with an auto-increment sequence number on DAO.put() if the value is set to the default value.',

  requires: [
    'foam.dao.InternalException'
  ],

  properties: [
    {
      /** The property to set uniquely. */
      class: 'String',
      name: 'property',
      value: 'id'
    },
    {
      /** The starting sequence value. This will be calclated from the
        existing contents of the delegate DAO, so it is one greater
        than the maximum existing value. */
      class: 'Int',
      name: 'value',
      value: 1
    },
    { /** Returns a promise that fulfills when the maximum existing number
          has been found and assigned to this.value */
      name: 'calcDelegateMax_',
      hidden: true,
      expression: function(delegate, property) {
        // TODO: validate property self.of[self.property.toUpperCase()]
        var self = this;
        return self.delegate.select( // TODO: make it a pipe?
          self.MAX(self.property_)
        ).then(
          function(max) {
            if ( max.value ) self.value = max.value + 1;
          }
        );
      }
    },
    {
      /** @private */
      name: 'property_',
      hidden: true,
      expression: function(property, of) {
        var a = this.of.getAxiomByName(property);
        if ( ! a ) {
          throw this.InternalException.create({message:
              'SequenceNumberDAO specified with invalid property ' +
              property + ' for class ' + this.of
          });
        }
        return a;
      }
    }
  ],

  methods: [
    /** Sets the property on the given object and increments the next value.
      If the unique starting value has not finished calculating, the returned
      promise will not resolve until it is ready. */
    function put(obj) {
      var self = this;
      return this.calcDelegateMax_.then(function() {
        var val = self.property_.f(obj);

        if ( ! val || val == self.property_.value ) {
          obj[self.property_.name] = self.value++;
        } else if ( val && ( val >= self.value ) ) {
          // if the object has a value, and it's greater than our current value,
          // bump up the next value we try to auto-assign.
          self.value = val + 1;
        }

        return self.delegate.put(obj);
      });
    }
  ]
});
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

foam.CLASS({
  package: 'foam.dao',
  name: 'ContextualizingDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: function() {/*
    ContextualizingDAO recreates objects returned by find(), giving them
    access to the exports that this ContextualizingDAO has access to.
    <p>
    If using a foam.dao.EasyDAO, set contextualize:true to automatically
    contextualize objects returned by find().
  */},

  methods: [
    /** Found objects are cloned into the same context as this DAO */
    function find(id) {
      var self = this;
      return self.delegate.find(id).then(function(obj) {
        if ( obj ) return obj.clone(self);
        return null;
      });
    }
    // TODO: select() too?
  ]
});
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

foam.CLASS({
  package: 'foam.dao.sync',
  name: 'SyncRecord',

  documentation: 'Used by foam.dao.SyncDAO to track object updates and deletions.',

  properties: [
    'id',
    {
      class: 'Int',
      name: 'syncNo',
      value: -1
    },
    {
      class: 'Boolean',
      name: 'deleted',
      value: false
    }
  ]
});


/**
  SyncDAO synchronizes data between multiple client's offline caches and a server.
  When syncronizing, each client tracks the last-seen version of each object,
  or if the object was deleted. The most recent version is retained.
  <p>
  Make sure to set the syncProperty to use to track each object's version.
  It will automatically be incremented as changes are put() into the SyncDAO.
*/
foam.CLASS({
  package: 'foam.dao',
  name: 'SyncDAO',
  extends: 'foam.dao.ProxyDAO',

  requires: [
    'foam.dao.sync.SyncRecord'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'setInterval'
  ],

  properties: [
    {
      /**
        The shared server DAO to synchronize through.
      */
      class: 'foam.dao.DAOProperty',
      name: 'remoteDAO',
      transient: true,
      required: true
    },
    {
      /** The local cache to sync with the server DAO. */
      name: 'delegate',
    },
    {
      /**
        The DAO in which to store SyncRecords for each object. Each client
        tracks their own sync state in a separate syncRecordDAO.
      */
      name: 'syncRecordDAO',
      transient: true,
      required: true
    },
    {
      /**
        The property to use to store the object version. This value on each
        object will be incremented each time it is put() into the SyncDAO.
      */
      name: 'syncProperty',
      required: true,
      transient: true
    },
    {
      /**
        The class of object this DAO will store.
      */
      name: 'of',
      required: true,
      transient: true
    },
    {
      /**
        If using a remote DAO without push capabilities, such as an HTTP
        server, polling will periodically attempt to synchronize.
      */
      class: 'Boolean',
      name: 'polling',
      value: false
    },
    {
      /**
        If using polling, pollingFrequency will determine the number of
        milliseconds to wait between synchronization attempts.
      */
      class: 'Int',
      name: 'pollingFrequency',
      value: 1000
    }
  ],

  methods: [
    /** @private */
    function init() {
      this.SUPER();

      this.remoteDAO$proxy.sub('on', this.onRemoteUpdate);

      this.delegate.on.sub(this.onLocalUpdate);

      if ( this.polling ) {
        this.setInterval(function() {
          this.sync();
        }.bind(this), this.pollingFrequency);
      }
    },

    /**
      Updates the object's last seen info.
    */
    function put(obj) {
      return this.delegate.put(obj).then(function(o) {
        this.syncRecordDAO.put(
          this.SyncRecord.create({
            id: o.id,
            syncNo: -1
          }));
        return o;
      }.bind(this));
    },

    /**
      Marks the object as deleted.
    */
    function remove(obj) {
      return this.delegate.remove(obj).then(function(o) {
        this.syncRecordDAO.put(
          this.SyncRecord.create({
            id: obj.id,
            deleted: true,
            syncNo: -1
          }));
      }.bind(this));
    },

    /**
      Marks all the removed objects' sync records as deleted.
    */
    function removeAll(skip, limit, order, predicate) {
      this.delegate.select(null, skip, limit, order, predicate).then(function(a) {
        a = a.a;
        for ( var i = 0 ; i < a.length ; i++ ) {
          this.remove(a[i]);
        }
      }.bind(this));
    },

    /** @private */
    function processFromServer(obj) {
      this.delegate.put(obj).then(function(obj) {
        this.syncRecordDAO.put(
          this.SyncRecord.create({
            id: obj.id,
            syncNo: obj[this.syncProperty.name]
          }));
      }.bind(this));
    },

    /** @private */
    function syncFromServer() {
      var E = this;

      this.syncRecordDAO.select(E.MAX(this.SyncRecord.SYNC_NO)).then(function(m) {
        this.remoteDAO
          .where(
            E.GT(this.syncProperty, m.value))
          .select().then(function(a) {
            a = a.a;
            for ( var i = 0 ; i < a.length ; i++ ) {
              this.processFromServer(a[i]);
            }
          }.bind(this));
      }.bind(this));
    },

    /** @private */
    function syncToServer() {
      var E = this;
      var self = this;

      this.syncRecordDAO
        .where(E.EQ(this.SyncRecord.SYNC_NO, -1))
        .select().then(function(records) {
          records = records.a;

          for ( var i = 0 ; i < records.length ; i++ ) {
            var record = records[i]
            var id = record.id;
            var deleted = record.deleted;

            if ( deleted ) {
              var obj = self.of.create(undefined, self);
              obj.id = id;
              self.remoteDAO.remove(obj);
            } else {
              // TODO: Stop sending updates if the first one fails.
              self.delegate.find(id).then(function(obj) {
                if ( obj ) return self.remoteDAO.put(obj).then(function(obj) {
                  self.processFromServer(obj);
                });
                return null;
              });
            }
          }
        });
    },

    /** @private */
    function sync() {
      this.syncToServer();
      this.syncFromServer();
    }
  ],

  listeners: [
    /** @private */
    function onRemoteUpdate(s, on, event, obj) {
      if ( event == 'put' ) {
        this.processFromServer(obj);
      } else if ( event === 'remove' ) {
        this.delegate.remove(obj);
      } else if ( event === 'reset' ) {
        this.delegate.removeAll();
      }
    },

    {
      /** @private */
      name: 'onLocalUpdate',
      isMerged: true,
      mergeDelay: 100,
      code: function() {
        this.sync();
      }
    }
  ]
});
/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.dao',
  name: 'EasyDAO',
  extends: 'foam.dao.ProxyDAO',
  implements: [ 'foam.mlang.Expressions' ],

  documentation: function() {/*
    Facade for easily creating decorated DAOs.
    <p>
    Most DAOs are most easily created and configured with EasyDAO.
    Simply require foam.dao.EasyDAO and create() with the flags
    to indicate what behavior you're looking for. Under the hood, EasyDAO
    will create one or more DAO instances to service your requirements and then
  */},

  requires: [
    'foam.dao.MDAO',
    'foam.dao.JournaledDAO',
    'foam.dao.GUIDDAO',
    'foam.dao.IDBDAO',
    'foam.dao.SequenceNumberDAO',
    'foam.dao.CachingDAO',
    'foam.dao.SyncDAO',
    'foam.dao.ContextualizingDAO',
    'foam.dao.DecoratedDAO',
    'foam.dao.CompoundDAODecorator',
    'foam.dao.DeDupDAO',
    'foam.dao.ClientDAO',
    'foam.dao.PromisedDAO',
    'foam.box.Context',
    'foam.box.HTTPBox',
    'foam.box.SocketBox',
    //'foam.core.dao.MergeDAO',
    //'foam.core.dao.MigrationDAO',
    //'foam.core.dao.VersionNoDAO',
    //'foam.dao.EasyClientDAO',
    'foam.dao.LoggingDAO',
    'foam.dao.TimingDAO'
  ],

  imports: [ 'document', 'log' ],

  constants: {
    // Aliases for daoType
    ALIASES: {
      ARRAY:  'foam.dao.ArrayDAO',
      MDAO:   'foam.dao.MDAO',
      IDB:    'foam.dao.IDBDAO',
      LOCAL:  'foam.dao.LocalStorageDAO',
      CLIENT: 'foam.dao.ClientDAO'
    }
  },

  properties: [
    {
      /** The developer-friendly name for this EasyDAO. */
      name: 'name',
      factory: function() { return this.of.id; }
    },
    {
      /** This is set automatically when you create an EasyDAO.
        @private */
      name: 'delegate'
    },
    {
      /** Have EasyDAO use a sequence number to index items. Note that
        .seqNo and .guid features are mutually
        exclusive. */
      class: 'Boolean',
      name: 'seqNo',
      value: false
    },
    {
      /** Have EasyDAO generate guids to index items. Note that .seqNo and .guid features are mutually exclusive. */
      class: 'Boolean',
      name: 'guid',
      label: 'GUID',
      value: false
    },
    {
      /** The property on your items to use to store the sequence number or guid. This is required for .seqNo or .guid mode. */
      name: 'seqProperty',
      class: 'Property'
    },
    {
      /** Enable local in-memory caching of the DAO. */
      class: 'Boolean',
      name: 'cache',
      value: false
    },
    {
      /** Enable value de-duplication to save memory when caching. */
      class: 'Boolean',
      name: 'dedup',
      value: false,
    },
    {
      /** Keep a history of all state changes to the DAO. */
      class: 'FObjectProperty',
      of: 'foam.dao.Journal',
      name: 'journal'
    },
    {
      /** Enable logging on the DAO. */
      class: 'Boolean',
      name: 'logging',
      value: false,
    },
    {
      /** Enable time tracking for concurrent DAO operations. */
      class: 'Boolean',
      name: 'timing',
      value: false
    },
    {
      /** Contextualize objects on .find, re-creating them with this EasyDAO's
        exports, as if they were children of this EasyDAO. */
      class: 'Boolean',
      name: 'contextualize',
      value: false
    },
//     {
//       class: 'Boolean',
//       name: 'cloning',
//       value: false,
//       //documentation: "True to clone results on select"
//     },
    {
      /**
        <p>Selects the basic functionality this EasyDAO should provide.
        You can specify an instance of a DAO model definition such as
        MDAO, or a constant indicating your requirements.</p>
        <p>Choices are:</p>
        <ul>
          <li>IDB: Use IndexDB for storage.</li>
          <li>LOCAL: Use local storage.</li>
          <li>MDAO: Use non-persistent in-memory storage.</li>
        </ul>
      */
      name: 'daoType',
      value: 'foam.dao.IDBDAO'
    },
    {
      /** Automatically generate indexes as necessary, if using an MDAO or cache. */
      class: 'Boolean',
      name: 'autoIndex',
      value: false
    },
//     {
//       /** Creates an internal MigrationDAO and applies the given array of MigrationRule. */
//       class: 'FObjectArray',
//       name: 'migrationRules',
//       of: 'foam.core.dao.MigrationRule',
//     },
    {
      /** Turn on to activate synchronization with a server. Specify serverUri
        and syncProperty as well. */
      class: 'Boolean',
      name: 'syncWithServer',
      value: false
    },
    {
      /** Setting to true activates polling, periodically checking in with
        the server. If sockets are used, polling is optional as the server
        can push changes to this client. */
      class: 'Boolean',
      name: 'syncPolling',
      value: true
    },
    {
      /** Set to true if you are running this on a server, and clients will
        synchronize with this DAO. */
      class: 'Boolean',
      name: 'isServer',
      value: false
    },
    {
      /** The property to synchronize on. This is typically an integer value
        indicating the version last seen on the remote. */
      name: 'syncProperty'
    },
    {
      /** Destination address for server. */
      name: 'serverBox'
    },
    {
      class: 'FObjectArray',
      of: 'foam.dao.DAODecorator',
      name: 'decorators'
    },
    'testData'
  ],

  methods: [
    function init() {
      /**
        <p>On initialization, the EasyDAO creates an appropriate chain of
        internal EasyDAO instances based on the EasyDAO
        property settings.</p>
        <p>This process is transparent to the developer, and you can use your
        EasyDAO like any other DAO.</p>
      */
      this.SUPER.apply(this, arguments);

      var daoType = typeof this.daoType === 'string' ?
        this.ALIASES[this.daoType] || this.daoType :
        this.daoType;

      var daoModel = typeof daoType === 'string' ?
        this.lookup(daoType) || global[daoType] :
        daoType;

      var params = { of: this.of };

      if ( daoType == 'foam.dao.ClientDAO' ) {
        foam.assert(this.serverBox, 'EasyDAO client type requires a server box');
        params.delegate = this.serverBox;
      }

      if ( ! daoModel ) {
        this.warn(
          "EasyDAO: Unknown DAO Type.  Add '" + daoType + "' to requires: list."
        );
      }

      if ( this.name && daoModel.getAxiomByName('name') ) params.name = this.name;
      if ( daoModel.getAxiomByName('autoIndex') ) params.autoIndex = this.autoIndex;
      //if ( this.seqNo || this.guid ) params.property = this.seqProperty;

      var dao = daoModel.create(params, this.__subContext__);

      // Not used by decorators.
      delete params['name'];

      if ( this.MDAO.isInstance(dao) ) {
        this.mdao = dao;
        if ( this.dedup ) dao = this.DeDupDAO.create({delegate: dao});
      } else {
//         if ( this.migrationRules && this.migrationRules.length ) {
//           dao = this.MigrationDAO.create({
//             delegate: dao,
//             rules: this.migrationRules,
//             name: this.model.id + "_" + daoModel.id + "_" + this.name
//           });
//         }
        if ( this.cache ) {
          this.mdao = this.MDAO.create(params);
          dao = this.CachingDAO.create({
            cache: this.dedup ?
              this.mdao :
              this.DeDupDAO.create({delegate: this.mdao}),
            src: dao,
            of: this.model});
        }
      }

      if ( this.journal ) {
        dao = this.JournaledDAO.create({
          delegate: dao,
          journal: this.journal
        });
      }

      if ( this.seqNo && this.guid ) throw "EasyDAO 'seqNo' and 'guid' features are mutually exclusive.";

      if ( this.seqNo ) {
        var args = {__proto__: params, delegate: dao, of: this.of};
        if ( this.seqProperty ) args.property = this.seqProperty;
        dao = this.SequenceNumberDAO.create(args);
      }

      if ( this.guid ) {
        var args = {__proto__: params, delegate: dao, of: this.of};
        if ( this.seqProperty ) args.property = this.seqProperty;
        dao = this.GUIDDAO.create(args);
      }

      var cls = this.of;

      if ( this.syncWithServer && this.isServer ) throw "isServer and syncWithServer are mutually exclusive.";

      if ( this.syncWithServer || this.isServer ) {
        if ( ! this.syncProperty ) {
          this.syncProperty = cls.SYNC_PROPERTY;
          if ( ! this.syncProperty ) {
            throw "EasyDAO sync with class " + cls.id + " invalid. Sync requires a sync property be set, or be of a class including a property 'sync_property'.";
          }
        }
      }

      if ( this.syncWithServer ) {
        foam.assert(this.serverBox, 'syncWithServer requires serverBox');

        dao = this.SyncDAO.create({
          remoteDAO: this.ClientDAO.create({
              name: this.name,
              delegate: this.serverBox
          }, boxContext),
          syncProperty: this.syncProperty,
          delegate: dao,
          pollingFrequency: 1000
        });
        dao.syncRecordDAO = foam.dao.EasyDAO.create({
          of: dao.SyncRecord,
          cache: true,
          daoType: this.daoType,
          name: this.name + '_SyncRecords'
        });
      }

//       if ( this.isServer ) {
//         dao = this.VersionNoDAO.create({
//           delegate: dao,
//           property: this.syncProperty,
//           version: 2
//         });
//       }

      if ( this.contextualize ) {
        dao = this.ContextualizingDAO.create({delegate: dao});
      }

      if ( this.decorators.length ) {
        var decorated = this.DecoratedDAO.create({
          decorator: this.CompoundDAODecorator.create({
            decorators: this.decorators
          }),
          delegate: dao
        });
        dao = decorated;
      }

      if ( this.timing  ) {
        dao = this.TimingDAO.create({ name: this.name + 'DAO', delegate: dao });
      }

      if ( this.logging ) {
        dao = this.LoggingDAO.create({ delegate: dao });
      }

      var self = this;

      if ( decorated ) decorated.dao = dao;

      if ( this.testData ) {
        var delegate = dao;

        dao = this.PromisedDAO.create({
          promise: new Promise(function(resolve, reject) {
            delegate.select(self.COUNT()).then(function(c) {
              // Only load testData if DAO is empty
              if ( c.value ) {
                resolve(delegate);
                return;
              }

              self.log("Loading test data");
              Promise.all(foam.json.parse(self.testData, self.of).map(
                function(o) { return delegate.put(o); }
              )).then(function() {
                self.log("Loaded", self.testData.length, "records.");
                resolve(delegate);
              }, reject);
            });
          })
        });
      }

      this.delegate = dao;
    },

    /** Only relevant if cache is true or if daoType
       was set to MDAO, but harmless otherwise. Generates an index
       for a query over all specified properties together.
       @param var_args specify any number of Properties to be indexed.
    */
    function addPropertyIndex() {
      this.mdao && this.mdao.addPropertyIndex.apply(this.mdao, arguments);
      return this;
    },

    /** Only relevant if cache is true or if daoType
      was set to MDAO, but harmless otherwise. Adds an existing index
      to the MDAO.
      @param index The index to add.
    */
    function addIndex(index) {
      this.mdao && this.mdao.addIndex.apply(this.mdao, arguments);
      return this;
    }
  ]
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.dao',
  name: 'NoSelectAllDAO',
  extends: 'foam.dao.ProxyDAO',

  requires: [
    'foam.dao.ArraySink',
    'foam.mlang.predicate.True',
    'foam.mlang.predicate.False'
  ],

  documentation: 'DAO Decorator which prevents \'select all\', ie. a select() with no query, limit, or skip.',

  methods: [
    function select(sink, skip, limit, order, predicate) {
        if ( predicate &&
             ( ! this.True.isInstance(predicate) &&
               ! this.False.isInstance(predicate) ) ||
          ( foam.Number.isInstance(limit) && Number.isFinite(limit) && limit != 0 ) ||
          ( foam.Number.isInstance(skip) && Number.isFinite(skip) && skip != 0 ) ) {
        return this.delegate.select(sink, skip, limit, order, predicate);
      } else {
        sink && sink.eof();
        return Promise.resolve(sink || this.ArraySink.create());
      }
    }
    // TODO: removeAll?
  ]
});
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

foam.CLASS({
  package: 'foam.dao',
  name: 'NullDAO',
  extends: 'foam.dao.AbstractDAO',

  documentation: 'A Null pattern (do-nothing) DAO implementation.',

  requires: [
    'foam.dao.ExternalException',
    'foam.dao.ObjectNotFoundException'
  ],

  methods: [
    function put(obj) {
      this.pub('on', 'pub', obj);
      return Promise.resolve(obj);
    },

    function remove(obj) {
      this.pub('on', 'remove', obj);
      return Promise.resolve();
    },

    function find(id) {
      return Promise.resolve(null);
    },

    function select(sink) {
      sink = sink || foam.dao.ArraySink.create();
      sink.eof();
      return Promise.resolve(sink);
    },

    function removeAll() {
      return Promise.resolve();
    }
  ]
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.dao',
  name: 'TimingDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Times access to the delegate DAO; useful for debugging and profiling.',

  properties: [
    'name',
    {
      name: 'id',
      value: 0
    },
    ['activeOps', {put: 0, remove:0, find: 0, select: 0}],
    {
      /** High resolution time value function */
      class: 'Function',
      name: 'now',
      factory: function() {
        if ( global.window && global.window.performance ) {
          return function() {
            return window.performance.now();
          }
        } else if ( global.process && global.process.hrtime ) {
          return function() {
            var hr = global.process.hrtime();
            return ( hr[0] * 1000 ) + ( hr[1] / 1000000 );
          }
        } else {
          return function() { return Date.now(); }
        }
      }
    }
  ],

  methods: [
    function start(op) {
      var str = this.name + '-' + op;
      var key = this.activeOps[op]++ ? str + '-' + (this.id++) : str;
      console.time(key);
      return [key, str, this.now(), op];
    },

    function end(act) {
      this.activeOps[act[3]]--;
      this.id--;
      console.timeEnd(act[0]);
      console.log('Timing: ', act[1], ' ', (this.now()-act[2]).toFixed(3), ' ms');
    },

    function put(obj) {
      var act = this.start('put');
      var self = this;
      return this.SUPER(obj).then(function(o) { self.end(act); return o; });
    },
    function remove(obj) {
      var act = this.start('remove');
      var self = this;
      return this.SUPER(obj).then(function() { self.end(act); });
    },
    function find(key) {
      var act = this.start('find');
      var self = this;
      return this.SUPER(key).then(function(o) { self.end(act); return o; });
    },
    function select() {
      var act = this.start('select');
      var self = this;
      return this.SUPER.apply(this, arguments).then(function(s) {
        self.end(act);
        return s;
      })
    }
  ]
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.dao',
  name: 'LoggingDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'DAO Decorator which logs access to the delegate; useful for debugging.',

  requires: [ 'foam.dao.ArraySink' ],

  properties: [
    {
      name: 'name',
    },
    {
      name: 'logger',
      expression: function(name) {
        return console.log.bind(console, name);
      }
    },
    {
      class: 'Boolean',
      name: 'logReads',
      value: false
    },
  ],

  methods: [
    function put(obj) {
      this.logger('put', obj);
      return this.SUPER(obj);
    },

    function remove(obj) {
      this.logger('remove', obj);
      return this.SUPER(obj);
    },

    function select(sink, skip, limit, order, predicate) {
      this.logger('select', skip, limit, order, predicate);
      sink = sink || this.ArraySink.create();
      if ( this.logReads ) {
        var put = sink.put.bind(sink);
        var newSink = { __proto__: sink };
        newSink.put = function(o) {
          this.logger('read', o);
          return put.apply(null, arguments);
        }.bind(this);
        return this.SUPER(newSink, skip, limit, order, predicate).then(function() {
          return sink;
        });
      }
      return this.SUPER(sink, skip, limit, order, predicate);
    },

    function removeAll(sink, skip, limit, order, predicate) {
      this.logger('removeAll', skip, limit, order, predicate);
      return this.SUPER(sink, skip, limit, order, predicate);
    },

    function find(id) {
      this.logger('find', id);
      return this.SUPER(id);
    }
  ]
});
/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.dao',
  name: 'IDBInternalException',
  extends: 'foam.dao.InternalException',

  // TODO: Which errors are internal (system problems) vs. external
  // (i.e. invalid data for clone, but you can try again with different data)
  properties: [
    'id',
    'error',
    {
      name: 'message',
      expression: function(id, error) {
        return "IndexedDB Error for " + id +
          ( error ? ": " + error.toString() : "" );
      }
    }
  ]
});


/*
TODO:
-verify that multi part keys work properly
*/
foam.CLASS({
  package: 'foam.dao',
  name: 'IDBDAO',
  extends: 'foam.dao.AbstractDAO',

  requires: [
    'foam.dao.FlowControl',
    'foam.dao.ArraySink',
    'foam.dao.IDBInternalException',
    'foam.mlang.predicate.True',
    'foam.mlang.predicate.Eq'
  ],

  imports: [
    'async'
  ],

  properties: [
    {
      name: 'of',
      required: true
    },
    {
      name:  'name',
      label: 'Store Name',
      factory: function() { return this.of.id; }
    },
    {
      name: 'indicies',
      factory: function() { return []; }
    },
    {
      name: 'version',
      value: 1
    },
    {
      /** The future that holds the open DB. Call this.withDB.then(function(db) { ... }); */
      name: 'withDB',
      factory: function() {
        var self = this;

        return new Promise(function(resolve, reject) {
          var indexedDB = global.indexedDB ||
            global.webkitIndexedDB         ||
            global.mozIndexedDB;

          var request = indexedDB.open("FOAM:" + self.name, self.version);

          request.onupgradeneeded = function(e) {
            var db = e.target.result;

            // FUTURE: Provide migration support here?  Or just have people create a new dao?
            if ( db.objectStoreNames.contains(self.name) ) {
              db.deleteObjectStore(self.name);
            }

            var store = e.target.result.createObjectStore(self.name);
            for ( var i = 0; i < self.indicies.length; i++ ) {
              store.createIndex(
                  self.indicies[i][0],
                  self.indicies[i][0],
                  { unique: self.indicies[i][1] });
            }
          }

          request.onsuccess = function(e) {
            resolve(e.target.result);
          }

          request.onerror = function (e) {
            reject(self.IDBInternalException.create({ id: 'open', error: e }));
          };
        });
      }
    },
  ],

  methods: [
    function deserialize(json) {
      return foam.json.parse(json, this.of, this.__subContext__);
    },

    function serialize(obj) {
      return foam.json.Storage.objectify(obj);
    },

    function withStore(mode, fn) {
      return this.withStore_(mode, fn);
      if ( mode !== 'readwrite' ) return this.withStore_(mode, fn);

      var self = this;

      if ( ! this.q_ ) {
        var q = [fn];
        this.q_ = q;
        this.async(function() {
          self.withStore_(mode, function(store) {
            // console.log('q length: ', q.length);
            if ( self.q_ == q ) self.q_ = undefined;
            for ( var i = 0 ; i < q.length ; i++ ) q[i](store);
          });
        })();
      } else {
        this.q_.push(fn);
        // Diminishing returns after 10000 per batch
        if ( this.q_.length == 10000 ) this.q_ = undefined;
      }
    },

    function withStore_(mode, fn) {
      // NOTE: Large numbers of insertions can be made
      // faster by keeping the transaction between puts.
      // But due to Promises being async, the transaction
      // is usually closed by the next put.
      var self = this;
      self.withDB.then(function (db) {
        var tx = db.transaction([self.name], mode);
        var os = tx.objectStore(self.name);
        fn.call(self, os);
      });
    },

    function put(value) {
      var self = this;
      return new Promise(function(resolve, reject) {
        self.withStore("readwrite", function(store) {
          var request = store.put(self.serialize(value), value.id);
          request.transaction.addEventListener(
            'complete',
            function(e) {
              self.pub('on','put', value);
              resolve(value);
            });
          request.transaction.addEventListener(
            'error',
            function(e) {
              reject(self.IDBInternalException.create({ id: value.id, error: e }));
            });
        });
      });
    },

    function find(key) {
      var self = this;

      return new Promise(function(resolve, reject) {
        self.withStore("readwrite", function(store) {
          var request = store.get(key);
          request.transaction.addEventListener(
            'complete',
            function() {
              if (!request.result) {
                resolve(null);
                return;
              }
              var result = self.deserialize(request.result);
              resolve(result);
            });
          request.onerror = function(e) {
            reject(self.IDBInternalException.create({ id: key, error: e }));
          };
        });
      });
    },

    function remove(obj) {
      var self = this;
      var key = obj.id != undefined ? obj.id : obj;
      return new Promise(function(resolve, reject) {
        self.withStore("readwrite", function(store) {
          var getRequest = store.get(key);
          getRequest.onsuccess = function(e) {
            if (!getRequest.result) {
              // not found? as good as removed!
              resolve();
              return;
            }
            var data = self.deserialize(getRequest.result);
            var delRequest = store.delete(key);
            delRequest.transaction.addEventListener('complete', function(e) {
              self.pub('on','remove', data);
              resolve();
            });

            delRequest.onerror = function(e) {
              reject(self.IDBInternalException.create({ id: key, error: e }));
            };
          };
          getRequest.onerror = function(e) {
            reject(self.IDBInternalException.create({ id: key, error: e }));
          };
        });
      });
    },

    function removeAll(skip, limit, order, predicate) {
      var query = predicate || this.True.create();

      var self = this;

      // If the caller doesn't care to see the objects as they get removed,
      // then just nuke them in one go.
      if ( ! predicate && ! self.hasListeners('on', 'remove') ) {
        return new Promise(function(resolve, reject) {
          self.withStore('readwrite', function(store) {
            var req = store.clear();
            req.onsuccess = function() {
              resolve();
            };
            req.onerror = function(e) {
              reject(self.IDBInternalException.create({ id: 'remove_all', error: e }));
            };
          });
        });
      } else {
        // send items to the sink and remove one by one
        return new Promise(function(resolve, reject) {
          self.withStore('readwrite', function(store) {
            var request = store.openCursor();
            request.onsuccess = function(e) {
              var cursor = e.target.result;
              if (cursor) {
                var value = self.deserialize(cursor.value);
                if (query.f(value)) {
                  var deleteReq = cursor.delete();
                  deleteReq.addEventListener(
                    'success',
                    function() {
                      self.pub('on','remove', value);
                    });
                  deleteReq.onerror = function(e) {
                  };
                }
                cursor.continue();
              }
            };
            request.transaction.addEventListener('complete', function() {
              resolve();
            });
            request.onerror = function(e) {
              reject(self.IDBInternalException.create({ id: 'remove_all', error: e }));
            };
          });
        });
      }
    },

    function select(sink, skip, limit, order, predicate) {
      var resultSink = sink || this.ArraySink.create();
      sink = this.decorateSink_(resultSink, skip, limit, order, predicate);

      var sub = foam.core.FObject.create();
      var detached = false;
      sub.onDetach(function() { detached = true; });

      var self = this;

      return new Promise(function(resolve, reject) {
        self.withStore("readwrite", function(store) {
          var useIndex = predicate &&
            this.Eq.isInstance(predicate) &&
            store.indexNames.contains(predicate.arg1.name);

          var request = useIndex ?
            store.index(predicate.arg1.name).openCursor(IDBKeyRange.only(predicate.arg2.f())) :
            store.openCursor() ;

          request.onsuccess = function(e) {
            var cursor = e.target.result;
            if ( e.target.error ) {
              reject(e.target.error);
              return;
            }

            if ( ! cursor || detached ) {
              sink.eof && sink.eof();
              resolve(resultSink);
              return;
            }

            var value = self.deserialize(cursor.value);
            sink.put(value, sub);
            cursor.continue();
          };
          request.onerror = function(e) {
            reject(self.IDBInternalException.create({ id: 'select', error: e }));
          };
        });
      });
    },

    function addIndex(prop) {
      this.indicies.push([prop.name, false]);
      return this;
    }
  ]
});
/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.dao',
  name: 'RestDAO',
  extends: 'foam.dao.AbstractDAO',

  documentation: function() {/*
    A client-side DAO for interacting with a REST endpoint.

    Sinks are managed on the client (i.e., sinks passed to
    select() will not serialize the sink and send it to the
    endpoint for server-side logic implementation).
  */},

  requires: [
    'foam.core.Serializable',
    'foam.dao.ArraySink',
    'foam.net.HTTPRequest'
  ],

  properties: [
    {
      class: 'String',
      name: 'baseURL',
      documentation: 'URL for most rest calls. Some calls add "/<some-info>".',
      final: true,
      required: true
    }
  ],

  methods: [
    function put(o) {
      /**
       * PUT baseURL
       * <network-foam-jsonified FOAM object>
       */
      return this.createRequest_({
        method: 'PUT',
        url: this.baseURL,
        payload: this.jsonify_(o)
      }).send().then(this.onResponse.bind(this, 'put'))
          .then(this.onPutResponse);
    },

    function remove(o) {
      /**
       * DELETE baseURL/<network-foam-jsonified FOAM object id>
       */
      return this.createRequest_({
        method: 'DELETE',
        url: this.baseURL + '/' + encodeURIComponent(this.jsonify_(o.id))
      }).send().then(this.onResponse.bind(this, 'remove'))
          .then(this.onRemoveResponse);
    },

    function find(key) {
      /**
       * GET baseURL/<network-foam-jsonified FOAM object id>
       */
      var id = this.of.isInstance(key) ? key.id : key;
      return this.createRequest_({
        method: 'GET',
        url: this.baseURL + '/' + encodeURIComponent(this.jsonify_(id))
      }).send().then(this.onResponse.bind(this, 'find'))
          .then(this.onFindResponse);
    },

    function select(sink, skip, limit, order, predicate) {
      /**
       * GET baseURL
       * { skip, limit, order, predicate }
       *
       * Each key's value is network-foam-jsonified.
       */
      var payload = {};

      var networkSink = this.Serializable.isInstance(sink) && sink;
      if ( networkSink )
        payload.sink = networkSink;

      if ( typeof skip !== 'undefined' )
        payload.skip = skip;
      if ( typeof limit !== 'undefined' )
        payload.limit = limit;
      if ( typeof order !== 'undefined' )
        payload.order = order;
      if ( typeof predicate !== 'undefined' )
        payload.predicate = predicate;

      return this.createRequest_({
        method: 'POST',
        url: this.baseURL + ':select',
        payload: this.jsonify_(payload)
      }).send().then(this.onResponse.bind(this, 'select'))
          .then(this.onSelectResponse.bind(
              this, sink || this.ArraySink.create()));
    },

    function removeAll(skip, limit, order, predicate) {
      /**
       * POST baseURL/removeAll
       * { skip, limit, order, predicate }
       *
       * Each key's value is network-foam-jsonified.
       */
      var payload = {};
      if ( typeof skip  !== 'undefined' ) payload.skip = skip;
      if ( typeof limit !== 'undefined' ) payload.limit = limit;
      if ( typeof order !== 'undefined' ) payload.order = order;
      if ( typeof predicate !== 'undefined' ) payload.predicate = predicate;

      return this.createRequest_({
        method: 'POST',
        url: this.baseURL + ':removeAll',
        payload: this.jsonify_(payload)
      }).send().then(this.onResponse.bind(this, 'removeAll'))
          .then(this.onRemoveAllResponse);
    },

    function createRequest_(o) {
      // Demand that required properties are set before using DAO.
      this.validate();
      // Each request should default to a json responseType.
      return this.HTTPRequest.create(Object.assign({responseType: 'json'}, o));
    },

    function jsonify_(o) {
      // What's meant by network-foam-jsonified for HTTP/JSON/REST APIs:
      // Construct JSON-like object using foam's network strategy, then
      // construct well-formed JSON from the object.
      return JSON.stringify(foam.json.Network.objectify(o));
    }
  ],

  listeners: [
    function onResponse(name, response) {
      if ( response.status !== 200 ) {
        throw new Error(
          'Unexpected ' + name + ' response code from REST DAO endpoint: ' +
            response.status);
      }
      return response.payload;
    },

    function onPutResponse(payload) {
      var o = foam.json.parse(payload);
      this.pub('on', 'put', o);
      return o;
    },

    function onRemoveResponse(payload) {
      var o = foam.json.parse(payload);
      if ( o !== null ) this.pub('on', 'remove', o);
      return o;
    },

    function onFindResponse(payload) {
      return foam.json.parse(payload);
    },

    function onSelectResponse(localSink, payload) {
      var wasSerializable = this.Serializable.isInstance(localSink);
      var remoteSink = foam.json.parse(payload);

      // If not proxying a local unserializable sink, just return the remote.
      if ( wasSerializable ) return remoteSink;

      var array = remoteSink.a;
      if ( ! array )
        throw new Error('Expected ArraySink from REST endpoint when proxying local sink');

      if ( localSink.put ) {
        for ( var i = 0; i < array.length; i++ ) {
          localSink.put(array[i]);
        }
      }
      if ( localSink.eof ) localSink.eof();

      return localSink;
    },

    function onRemoveAllResponse(payload) {
      return undefined;
    }
  ]
});
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

foam.CLASS({
  package: 'foam.parse',
  name: 'QueryParser',

  documentation:
      'Create a query strings to MLangs parser for a particular class.',

  axioms: [
    // Reuse parsers if created for same 'of' class.
    foam.pattern.Multiton.create({ property: 'of' })
  ],

  // TODO(braden): Support KEYWORD predicates and queries on them.

  requires: [
    'foam.mlang.predicate.And',
    'foam.mlang.predicate.ContainsIC',
    'foam.mlang.predicate.Eq',
    'foam.mlang.predicate.Gt',
    'foam.mlang.predicate.Gte',
    'foam.mlang.predicate.Has',
    'foam.mlang.predicate.In',
    'foam.mlang.predicate.InIC',
    'foam.mlang.predicate.Lt',
    'foam.mlang.predicate.Lte',
    'foam.mlang.predicate.Not',
    'foam.mlang.predicate.Or',
    'foam.mlang.predicate.True',
    'foam.parse.Alternate',
    'foam.parse.ImperativeGrammar',
    'foam.parse.LiteralIC',
    'foam.parse.Parsers',
    'foam.parse.PropertyRefinement',
    'foam.parse.StringPS'
  ],

  properties: [
    {
      class: 'Class',
      name: 'of'
    },
    /** An optional input. If this is defined, 'me' is a keyword in the search
     * and can be used for queries like <tt>owner:me</tt>. Note that since
     * there is exactly one parser instance per 'of' value, the value of 'me' is
     * also shared.
     */
    {
      class: 'String',
      name: 'me'
    },
    {
      // The core query parser. Needs a fieldname symbol added to function
      // properly.
      name: 'baseGrammar_',
      value: function(alt, literal, literalIC, not, notChars, optional, range,
          repeat, seq, seq1, str, sym) {
        return {
          START: sym('query'),
          query: sym('or'),

          or: repeat(sym('and'), alt(literalIC(' OR '), literal(' | ')), 1),

          and: repeat(
              sym('expr'),
              alt(literalIC(' AND '),
                  not(alt(literalIC(' OR'), literal(' |')), literal(' '))),
              1),

          expr: alt(
              sym('paren'),
              sym('negate'),
              sym('has'),
              sym('is'),
              sym('equals'),
              sym('before'),
              sym('after'),
              sym('id')
          ),

          paren: seq1(1, '(', sym('query'), ')'),

          negate: alt(
              seq(literal('-'), sym('expr')),
              seq(literalIC('NOT '), sym('expr'))
          ),

          id: sym('number'),

          has: seq(literalIC('has:'), sym('fieldname')),

          is: seq(literalIC('is:'), sym('fieldname')),

          equals: seq(sym('fieldname'), alt(':', '='), sym('valueList')),

          // TODO(kgr): Merge with 'equals'.
          before: seq(sym('fieldname'), alt('<=', '<', literalIC('-before:')),
              sym('value')),
          after: seq(sym('fieldname'), alt('>=', '>', literalIC('-after:')),
              sym('value')),

          value: alt(
              sym('me'),
              sym('date'),
              sym('string'),
              sym('number')
          ),

          compoundValue: alt(
              sym('negateValue'),
              sym('orValue'),
              sym('andValue')
          ),

          negateValue: seq(
              '(',
              alt('-', literalIC('not ')),
              sym('value'),
              ')'
          ),

          orValue: seq(
              '(',
              repeat(sym('value'), alt('|', literalIC(' or '), ' | '), 1),
              ')'
          ),

          andValue: seq(
              '(',
              repeat(sym('value'), alt(literalIC(' and '), ' '), 1),
              ')'
          ),

          valueList: alt(sym('compoundValue'), repeat(sym('value'), ',', 1)),

          me: seq(literalIC('me'), not(sym('char'))),

          date: alt(
              sym('range date'),
              sym('literal date'),
              sym('relative date')
          ),

          'range date': seq(
              alt(sym('literal date'), sym('number')),
              '..',
              alt(sym('literal date'), sym('number'))),

          'literal date': alt(
              // YYYY-MM-DDTHH:MM
              seq(sym('number'), '-', sym('number'), '-', sym('number'), 'T',
                  sym('number'), ':', sym('number')),
              // YYYY-MM-DDTHH
              seq(sym('number'), '-', sym('number'), '-', sym('number'), 'T',
                  sym('number')),
              // YYYY-MM-DD
              seq(sym('number'), '-', sym('number'), '-', sym('number')),
              // YYYY-MM
              seq(sym('number'), '-', sym('number')),
              // YY/MM/DD
              seq(sym('number'), '/', sym('number'), '/', sym('number'))
          ),

          'relative date': seq(literalIC('today'),
                optional(seq('-', sym('number')))),

          string: alt(sym('word'), sym('quoted string')),

          'quoted string': seq1(1, '"',
                repeat(alt(literal('\\"', '"'), notChars('"'))),
                '"'),

          word: repeat(sym('char'), null, 1),

          char: alt(range('a', 'z'), range('A', 'Z'), range('0', '9'), '-', '^',
              '_', '@', '%', '.'),
          number: repeat(range('0', '9'), null, 1)
        };
      }
    },
    {
      name: 'grammar_',
      factory: function() {
        var cls = this.of;
        var fields = [];
        var properties = cls.getAxiomsByClass(foam.core.Property);
        for ( var i = 0; i < properties.length; i++ ) {
          var prop = properties[i];
          fields.push(this.LiteralIC.create({
            s: prop.name,
            value: prop
          }));
          if ( prop.shortName ) {
            fields.push(this.LiteralIC.create({
              s: prop.shortName,
              value: prop
            }));
          }
          if ( prop.aliases ) {
            for ( var j = 0; j < prop.aliases.length; j++ ) {
              fields.push(this.LiteralIC.create({
                s: prop.aliases[j],
                value: prop
              }));
            }
          }
        }
        fields.sort(function(a, b) {
          var d = b.lower.length - a.lower.length;
          if ( d !== 0 ) return d;
          if ( a.lower === b.lower ) return 0;
          return a.lower < b.lower ? 1 : -1;
        });

        var base = foam.Function.withArgs(this.baseGrammar_,
            this.Parsers.create(), this);
        var grammar = {
          __proto__: base,
          fieldname: this.Alternate.create({ args: fields })
        };

        // This is a closure that's used by some of the actions that follow.
        // If a Date-valued field is set to a single number, it expands into a
        // range spanning that whole year.
        var maybeConvertYearToDateRange = function(prop, num) {
          var isDateField = foam.core.Date.isInstance(prop) ||
              foam.core.Date.isInstance(prop);
          var isDateRange = Array.isArray(num) && num[0] instanceof Date;

          if ( isDateField && ! isDateRange ) {
            // Convert the number, a single year, into a date.
            var start = new Date(0); // Jan 1 1970, midnight UTC.
            var end   = new Date(0);
            start.setUTCFullYear(+num);
            end.setUTCFullYear(+num + 1);
            return [ start, end ];
          }
          return num;
        };

        var compactToString = function(v) {
          return v.join('');
        };

        var self = this;

        // TODO: Fix me to just build the object directly.
        var actions = {
          id: function(v) {
            return self.Eq.create({
              arg1: cls.ID,
              arg2: v
            });
          },

          or: function(v) {
            return self.Or.create({ args: v });
          },

          and: function(v) {
            return self.And.create({ args: v });
          },

          negate: function(v) {
            return self.Not.create({ arg1: v[1] });
          },

          number: function(v) {
            return parseInt(compactToString(v));
          },

          me: function() {
            return self.me || '';
          },

          has: function(v) {
            return self.Has.create({ arg1: v[1] });
          },

          is: function(v) {
            return self.Eq.create({
              arg1: v[1],
              arg2: self.True.create()
            });
          },

          before: function(v) {
            // If the property (v[0]) is a Date(Time)Property, and the value
            // (v[2]) is a single number, expand it into a Date range for that
            // whole year.
            v[2] = maybeConvertYearToDateRange(v[0], v[2]);

            // If the value (v[2]) is a Date range, use the appropriate end point.
            if ( Array.isArray(v[2]) && v[2][0] instanceof Date ) {
              v[2] = v[1] === '<=' ? v[2][1] : v[2][0];
            }
            return (v[1] === '<=' ? self.Lte : self.Lt).create({
              arg1: v[0],
              arg2: v[2]
            });
          },

          after: function(v) {
            // If the property (v[0]) is a Date(Time)Property, and the value
            // (v[2]) is a single number, expand it into a Date range for that
            // whole year.
            v[2] = maybeConvertYearToDateRange(v[0], v[2]);

            // If the value (v[2]) is a Date range, use the appropriate end point.
            if ( Array.isArray(v[2]) && v[2][0] instanceof Date ) {
              v[2] = v[1] === '>=' ? v[2][0] : v[2][1];
            }
            return (v[1] === '>=' ? self.Gte : self.Gt).create({
              arg1: v[0],
              arg2: v[2]
            });
          },

          equals: function(v) {
            // v[2], the values, is an array, which might have an 'and', 'or' or
            // 'negated' property on it. The default is 'or'. The partial
            // evaluator for expressions can simplify the resulting Mlang further.
            var prop = v[0];
            var values = v[2];
            // Int is actually the parent of Float and Long, so this captures all
            // numeric properties.
            var isNum = foam.core.Int.isInstance(prop);
            var isFloat = foam.core.Float.isInstance(prop);

            var isDateField = foam.core.Date.isInstance(prop) ||
                foam.core.DateTime.isInstance(prop);
            var isDateRange = Array.isArray(values[0]) &&
                values[0][0] instanceof Date;

            if ( isDateField || isDateRange ) {
              if ( ! isDateRange ) {
                // Convert the single number, representing a year, into a
                // date.
                var start = new Date(0); // Jan 1 1970 at midnight UTC
                var end = new Date(0);
                start.setUTCFullYear(values[0]);
                end.setUTCFullYear(+values[0] + 1);
                values = [ [ start, end ] ];
              }
              return self.And.create({
                args: [
                  self.Gte.create({ arg1: prop, arg2: values[0][0] }),
                  self.Lt.create({ arg1: prop, arg2: values[0][1] })
                ]
              });
            }

            var expr;

            if ( isNum ) {
              for ( var i = 0; i < values.length; i++ ) {
                values[i] = isFloat ? parseFloat(values[i]) :
                    parseInt(values[i]);
              }

              expr = self.In.create({ arg1: prop, arg2: values });
            } else if ( foam.core.Enum.isInstance(prop) ) {
              expr = self.In.create({ arg1: prop, arg2: values });
            } else {
              expr = (v[1] === '=') ?
                  self.InIC.create({ arg1: prop, arg2: values }) :
                  self.Or.create({
                    args: values.map(function(v) {
                      return self.ContainsIC.create({ arg1: prop, arg2: v });
                    })
                  });
            }

            if ( values.negated ) {
              return self.Not.create({ arg1: expr });
            } else if ( values.and ) {
              return self.And.create({
                args: values.map(function(x) {
                  expr.class_.create({ arg1: expr.arg1, arg2: [ x ] });
                })
              });
            } else {
              return expr;
            }
          },

          negateValue: function(v) {
            v.negated = true;
            return v;
          },

          orValue: function(v) {
            v = v[1];
            v.or = true;
            return v;
          },

          andValue: function(v) {
            v = v[1];
            v.and = true;
            return v;
          },

          // All dates are actually treated as ranges. These are arrays of Date
          // objects: [start, end]. The start is inclusive and the end exclusive.
          // Using these objects, both ranges (date:2014, date:2014-05..2014-06)
          // and open-ended ranges (date > 2014-01-01) can be computed higher up.
          // Date formats:
          // YYYY-MM-DDTHH:MM, YYYY-MM-DDTHH, YYYY-MM-DD, YYYY-MM, YY/MM/DD, YYYY
          'literal date': function(v) {
            var start;
            var end;

            // Previously we used just new Date() (ie. right now). That breaks
            // when the current date is eg. 31 but the parsed date wants to be a
            // shorter month (eg. April with 30 days). We would set the month to
            // April, but "April 31" gets corrected to "May 1" and then our
            // parsed dates are wrong.
            //
            // We fix that by using a fixed starting date that won't get
            // adjusted like that.
            start = new Date(2000, 0, 1);
            end   = new Date(2000, 0, 1);
            var ops = [ 'FullYear', 'Month', 'Date', 'Hours', 'Minutes',
                'Seconds' ];
            var defaults = [ 0, 1, 1, 0, 0, 0 ];
            for ( var i = 0; i < ops.length; i++ ) {
              var x = i * 2 > v.length ? defaults[i] : v[i * 2];
              // Adjust for months being 0-based.
              var val = x - (i === 1 ? 1 : 0);
              start['setUTC' + ops[i]](val);
              end['setUTC' + ops[i]](val);
            }

            start.setUTCMilliseconds(0);
            end.setUTCMilliseconds(0);

            // start and end are currently clones of each other. We bump the last
            // portion of the date and set it in end.
            var last = Math.floor(v.length / 2);
            var op = 'UTC' + ops[last];
            end['set' + op](end['get' + op]() + 1);

            return [ start, end ];
          },

          'relative date': function(v) {
            // We turn this into a Date range for the current day, or a day a few
            // weeks before.
            var d = new Date();
            var year  = d.getFullYear();
            var month = d.getMonth();
            var date  = d.getDate();
            if ( v[1] ) date -= v[1][1];

            return actions['literal date']([ year, '-', month + 1, '-', date ]);
          },

          'range date': function(v) {
            // This gives two dates, but each has already been converted to a
            // range. So we take the start of the first and the end of the second.
            var start = Array.isArray(v[0]) ? v[0][0] :
                typeof v[0] === 'number' ? new Date(v[0], 0, 1) : v[0];
            var end = Array.isArray(v[2]) ? v[2][1] :
                typeof v[2] === 'number' ? new Date(+v[2] + 1, 0, 1) : v[2];
            return [ start, end ];
          },

          'quoted string': compactToString,
          word: compactToString
        };

        var g = this.ImperativeGrammar.create({
          symbols: grammar
        });

        g.addActions(actions);
        return g;
      }
    }
  ],

  methods: [
    function parseString(str, opt_name) {
      var query = this.grammar_.parseString(str, opt_name);
      return query && query.partialEval ? query.partialEval() : query;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'PropertyRefinement',
  refines: 'foam.core.Property',

  properties: [
    {
      class: 'StringArray',
      name: 'aliases'
    }
  ]
});
/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.physics',
  name: 'Physical',

  documentation: 'A Physical object has velocity and mass and may optionally be subject to friction and gravity.',

  constants: {
    INFINITE_MASS: 10000
  },

  properties: [
    { class: 'Float', name: 'friction' },
    { class: 'Float', name: 'gravity', value: 1 },
    { class: 'Float', name: 'vx', value: 0 },
    { class: 'Float', name: 'vy', value: 0 },
    {
      class: 'Float',
      name: 'velocity',
      getter: function() { return this.distance(this.vx, this.vy); },
      setter: function(v) { this.setVelocityAndAngle(v, this.angleOfVelocity); }
    },
    {
      class: 'Float',
      name: 'angleOfVelocity',
      getter: function() { return Math.atan2(this.vy, this.vx); },
      setter: function(a) { this.setVelocityAndAngle(this.velocity, a); }
    },
    { class: 'Float', name: 'mass', value: 1 }
  ],

  methods: [
    function distance(dx, dy) {
      return Math.sqrt(dx*dx + dy*dy);
    },

    function applyMomentum(m, a) {
      this.vx += (m * Math.cos(a) / this.mass);
      this.vy += (m * Math.sin(a) / this.mass);
    },

    function momentumAtAngle(a) {
      if ( this.mass === this.INFINITE_MASS ) return 0;
      var v = this.velocityAtAngle(a);
      return v * this.mass;
    },

    function velocityAtAngle(a) {
      if ( this.mass === this.INFINITE_MASS ) return 0;
      return Math.cos(a-this.angleOfVelocity) * this.velocity;
    },

    function setVelocityAndAngle(v, a) {
      this.vx = v * Math.cos(a);
      this.vy = v * Math.sin(a);

      return this;
    },

    function distanceTo(other) {
      return this.distance(this.x-other.x, this.y-other.y);
    }
  ]
});
/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

/** Collision detection manager. **/
foam.CLASS({
  package: 'foam.physics',
  name: 'Collider',

  documentation: 'Apply physics when objects collide.',

  topics: [ 'onTick' ],

  properties: [
    {
      class: 'Boolean',
      name: 'bounceOnWalls'
    },
    {
      name: 'bounds',
      hidden: true
    },
    {
      name: 'children',
      factory: function() { return []; },
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'stopped_',
      value: true,
      hidden: true
    }
  ],

  methods: [
    function updateChild(c) {
      if ( this.bounceOnWalls && this.bounds ) {

        if ( c.left_   < this.bounds.x      ) { c.vx =  Math.abs(c.vx); c.x++; }
        if ( c.top_    < this.bounds.y      ) { c.vy =  Math.abs(c.vy); c.y++; }
        if ( c.right_  > this.bounds.width  ) { c.vx = -Math.abs(c.vx); c.x--; }
        if ( c.bottom_ > this.bounds.height ) { c.vy = -Math.abs(c.vy); c.y--; }
      }
    },

    function updateChildren() {
      var cs = this.children;
      for ( var i = 0 ; i < cs.length ; i++ ) {
        this.updateChild(cs[i]);
      }
    },

    function detectCollisions() {
      /* implicit k-d-tree divide-and-conquer algorithm */
            this.detectCollisions_(0, this.children.length-1, 'x', false, '');

      // TODO: put back above line when properly supports mixing circles and squares
      //this.detectCollisions__(0, this.children.length-1, 'x', false, '');
    },

    function detectCollisions__(start, end) {
      /*
        Simple O(n^2) algorithm, used by more complex algorithm
        once data is partitioned.
      */
      var cs = this.children;
      for ( var i = start ; i <= end ; i++ ) {
        var c1 = cs[i];
        for ( var j = i+1 ; j <= end ; j++ ) {
          var c2 = cs[j];
          if ( c1.intersects && c1.intersects(c2) ) this.collide(c1, c2);
        }
      }
    },

    function choosePivot(start, end, axis) {
      var p = 0, cs = this.children, n = end-start;
      for ( var i = start ; i <= end ; i++ ) p += cs[i][axis] / n;
      return p;
    },

    // TODO: Add support for rectangular objects
    function detectCollisions_(start, end, axis, oneD) {
      if ( start >= end ) return;

      var cs = this.children;
      var pivot = this.choosePivot(start, end, axis);
      var nextAxis = oneD ? axis : axis === 'x' ? 'y' : 'x' ;

      var p = start;
      for ( var i = start ; i <= end ; i++ ) {
        var c = cs[i];
        if ( c[axis] - c.radius < pivot ) {
          var t = cs[p];
          cs[p] = c;
          cs[i] = t;
          p++;
        }
      }

      if ( p === end + 1 ) {
        if ( oneD ) {
          this.detectCollisions__(start, end);
        } else {
          this.detectCollisions_(start, end, nextAxis, true);
        }
      } else {
        this.detectCollisions_(start, p-1, nextAxis, oneD);

        p--;
        for ( var i = p ; i >= start ; i-- ) {
          var c = cs[i];
          if ( c[axis] + c.radius > pivot ) {
            var t = cs[p];
            cs[p] = c;
            cs[i] = t;
            p--;
          }
        }
        if ( p === start-1 ) {
          if ( oneD ) {
            this.detectCollisions__(start, end);
          } else {
            this.detectCollisions_(start, end, nextAxis, true);
          }
        } else {
          this.detectCollisions_(p+1, end, nextAxis, oneD);
        }
      }
    },

    // TODO: add support for rectangles
    function collide(c1, c2) {
      c1.collideWith && c1.collideWith(c2);
      c2.collideWith && c2.collideWith(c1);

      if ( ! c1.mass || ! c2.mass ) return;

      var a  = Math.atan2(c2.y-c1.y, c2.x-c1.x);
      var m1 =  c1.momentumAtAngle(a);
      var m2 = -c2.momentumAtAngle(a);
      var m  = ( m1 + m2 )/2;

      // ensure a minimum amount of momentum so that objects don't overlap
      if ( m >= 0 ) {
        m = Math.max(1, m);
        var tMass = c1.mass + c2.mass;
        c1.applyMomentum(-m * c2.mass/tMass, a);
        c2.applyMomentum( m * c1.mass/tMass, a);
      }
    },

    // add one or more components to be monitored for collisions
    function add() {
      for ( var i = 0 ; i < arguments.length ; i++ ) {
        this.children.push(arguments[i]);
      }
      return this;
    },

    function findChildAt(x, y) {
      var c2 = { x: x, y: y, r: 1 };

      var cs = this.children;
      // Start from the end to find the child in the foreground
      for ( var i = cs.length-1 ; i >= 0 ; i-- ) {
        var c1 = cs[i];
        if ( c1.intersects(c2) ) return c1;
      }
    },

    function selectChildrenAt(x, y) {
      var c2 = { x: x, y: y, r: 1 };

      var children = [];
      var cs = this.children;
      for ( var i = 0 ; i < cs.length ; i++ ) {
        var c1 = cs[i];
        if ( c1.intersects(c2) ) children.push(c1);
      }
      return children;
    },

    function remove() {
      for ( var i = 0 ; i < arguments.length ; i++ ) {
        foam.Array.remove(this.children, arguments[i]);
      }
      return this;
    },

    function detach() {
      this.stopped_ = true;
      this.children = [];
    }
  ],

  actions: [
    {
      name: 'start',
      isEnabled: function(stopped_) { return stopped_; },
      code: function start() {
        this.stopped_ = false;
        this.tick();
      }
    },
    {
      name: 'stop',
      isEnabled: function(stopped_) { return ! stopped_; },
      code: function start() { this.stopped_ = true; }
    }
  ],

  listeners: [
    {
      name: 'tick',
      isFramed: true,
      code: function tick() {
        if ( this.stopped_ ) return;
        this.onTick.pub();
        this.detectCollisions();
        this.updateChildren();

        this.tick();
      }
    }
  ]
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.physics',
  name: 'PhysicsEngine',
  extends: 'foam.physics.Collider',

  documentation: 'PhysicsEngine is a sub-type of Collider which adds support for friction and gravity.',

  properties: [
    {
      class: 'Boolean',
      name: 'gravity',
      value: false
    },
    {
      class: 'Float',
      name: 'gravityStrength',
      value: 1
    }
  ],

  methods: [
    function updateChild(c) {
      this.SUPER(c);

      var gravity  = c.gravity;
      var friction = c.friction;

      if ( gravity && this.gravity ) {
        c.vy += gravity * this.gravityStrength;
      }

      if ( friction ) {
        c.vx = Math.abs(c.vx) < 0.001 ? 0 : c.vx * friction;
        c.vy = Math.abs(c.vy) < 0.001 ? 0 : c.vy * friction;
      }

      // Inertia
      if ( Math.abs(c.vx) > 0.001 ) c.x += c.vx;
      if ( Math.abs(c.vy) > 0.001 ) c.y += c.vy;
    }
  ]
});
/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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

foam.INTERFACE({
  package: 'foam.blob',
  name: 'Blob',

  properties: [
    {
      class: 'Long',
      name: 'size'
    }
  ],

  methods: [
    {
      name: 'read',
      returns: 'Promise',
      args: [
        {
          name: 'buffer',
        },
        {
          name: 'offset',
          of: 'Long'
        }
      ]
    }
  ]
});

foam.CLASS({
  package: 'foam.blob',
  name: 'AbstractBlob',
  implements: ['foam.blob.Blob'],
  methods: [
    function pipe(writeFn) {
      var self = this;

      var offset = 0;
      var buf = new Buffer(8192 * 4);
      var limit = self.size;

      function a() {
        if ( offset > limit ) {
          throw 'Offest beyond limit?';
        }

        if ( offset == limit ) return;

        return self.read(buf, offset).then(function(buf2) {
          offset += buf2.length;
          return writeFn(new Buffer(buf2));
        }).then(a);
      };

      return a();
    },
    function slice(offset, length) {
      return foam.blob.SubBlob.create({
        parent: this,
        offset: offset,
        size: length
      });
    }
  ]
});

foam.CLASS({
  package: 'foam.blob',
  name: 'SubBlob',
  extends: 'foam.blob.AbstractBlob',
  properties: [
    {
      name: 'parent',
    },
    {
      name: 'offset'
    },
    {
      name: 'size',
      assertValue: function(value) {
        foam.assert(this.offset + value <= this.parent.size, 'Cannot create sub blob beyond end of parent.');
      }
    }
  ],
  methods: [
    function read(buffer, offset) {
      if ( buffer.length > this.size - offset) {
        buffer = buffer.slice(0, this.size - offset);
      }

      return this.parent.read(buffer, offset + this.offset);
    },
    function slice(offset, length) {
      return foam.blob.SubBlob.create({
        parent: this.parent,
        offset: this.offset + offset,
        size: length
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.blob',
  name: 'BlobBlob',
  extends: 'foam.blob.AbstractBlob',
  properties: [
    'blob',
    {
      name: 'size',
      factory: function() {
        return this.blob.size;
      }
    }
  ],
  methods: [
    function read(buffer, offset) {
      var self = this;
      var reader = new FileReader();

      var b = this.blob.slice(offset, offset + buffer.length);

      return new Promise(function(resolve, reject) {
        reader.onload = function(e) {
          resolve(e.result);
        };

        reader.onerror = function(e) {
          reject(e);
        };

        reader.readAsArrayBuffer(b);
      });
    }
  ]
});

foam.CLASS({
  package: 'foam.blob',
  name: 'IdentifiedBlob',
  extends: 'foam.blob.AbstractBlob',
  imports: [
    'blobService?'
  ],
  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      name: 'delegate',
      transient: true,
      factory: function() {
        return this.blobService.find(this.id);
      }
    }
  ],
  methods: [
    function compareTo(other) {
      return foam.blob.IdentifiedBlob.isInstance(other) && other.id == this.id;
    },
    function read(buffer, offset) {
      return this.delegate.then(function(d) {
        return d.read(buffer, offset);
      });
    }
  ]
});

foam.CLASS({
  package: 'foam.core',
  name: 'Blob',
  extends: 'foam.core.FObjectProperty',

  properties: [
    [ 'of', 'foam.blob.Blob' ],
    [ 'tableCellView', function() {} ],
    [ 'view', { class: 'foam.u2.view.BlobView' } ]
  ]
});


foam.CLASS({
  package: 'foam.blob',
  name: 'ClientBlob',
  extends: 'foam.blob.AbstractBlob',

  properties: [
    {
      class: 'Stub',
      of: 'foam.blob.Blob',
      name: 'box'
    }
  ]
});

foam.CLASS({
  package: 'foam.blob',
  name: 'FdBlob',
  extends: 'foam.blob.AbstractBlob',

  properties: [
    {
      name: 'fd'
    },
    {
      class: 'Long',
      name: 'size',
      expression: function(fd) {
        return require('fs').fstatSync(fd).size;
      }
    }
  ],

  methods: [
    function read(buffer, inOffset) {
      inOffset = inOffset || 0;
      var self = this;
      var outOffset = 0;
      var length = Math.min(buffer.length, this.size - inOffset);

      if ( length < buffer.length ) buffer = buffer.slice(0, length);

      return new Promise(function(resolve, reject) {
        function onRead(err, bytesRead, buffer) {
          if ( err ) {
            reject(err);
            return;
          }

          outOffset += bytesRead;
          inOffset += bytesRead;

          if ( outOffset < length ) {
            throw new Error('Does this ever happen.');
//            require('fs').read(self.fd, buffer, outOffset, length - outOffset, inOffset, onRead);
          } else {
            resolve(buffer);
          }
        }

        require('fs').read(self.fd, buffer, outOffset, length - outOffset, inOffset, onRead);
      });
    }
  ]
});


if ( foam.isServer ) {

foam.CLASS({
  package: 'foam.blob',
  name: 'BlobStore',

  properties: [
    {
      class: 'String',
      name: 'root'
    },
    {
      class: 'String',
      name: 'tmp',
      expression: function(root) {
        return root + require('path').sep + 'tmp';
      }
    },
    {
      class: 'String',
      name: 'sha256',
      expression: function(root) {
        return root + require('path').sep + 'sha256';
      }
    },
    {
      class: 'Boolean',
      name: 'isSet',
      value: false
    }
  ],

  methods: [
    function setup() {
      if ( this.isSet ) return;

      var parsed = require('path').parse(this.root);

      if ( ! require('fs').statSync(parsed.dir).isDirectory() ) {
        throw new Error(parsed.dir + ' is not a directory.');
      }

      this.ensureDir(this.root);
      this.ensureDir(this.tmp);
      this.ensureDir(this.sha256);

      this.isSet = true;
    },

    function ensureDir(path) {
      var stat;

      try {
        stat = require('fs').statSync(path);
        if ( stat && stat.isDirectory() ) return;
      } catch(e) {
        if ( e.code === 'ENOENT' ) return require('fs').mkdirSync(path);

        throw e;
      }
    },

    function allocateTmp() {
      var fd;
      var path;
      //      var name = Math.floor(Math.random() * 0xFFFFFF)
      var name = 1;
      var self = this;

      return new Promise(function aaa(resolve, reject) {
        path = self.tmp + require('path').sep + (name++);
        fd = require('fs').open(path, 'wx', function onOpen(err, fd) {
          if ( err && err.code !== 'EEXIST' ) {
            reject(err);
            return;
          }

          if ( err ) aaa(resolve, reject);
          else resolve({ path: path, fd: fd});
        });
      });
    },

    function put(obj) {
      this.setup();
      // This process could probably be sped up a bit by
      // requesting chunks of the incoming blob in advance,
      // currently we wait until they're put into the write-stream's
      // buffer before requesitng the next chunk.

      var hash = require('crypto').createHash('sha256');

      var bufsize = 8192;
      var buffer = new Buffer(bufsize);

      var size = obj.size
      var remaining = size;
      var offset = 0;
      var self = this;

      var chunks = Math.ceil(size / bufsize);

      function chunkOffset(i) {
        return i * bufsize;
      }

      var tmp;

      function writeChunk(chunk) {
        return obj.read(buffer, chunkOffset(chunk)).then(function(buf) {
          hash.update(buf);
          return new Promise(function(resolve, reject) {
            require('fs').write(tmp.fd, buf, 0, buf.length, function cb(err, written, buffer) {
              if ( err ) {
                reject(err);
                return;
              }

              if ( written !== buf.length ) {
                console.warn("Didn't write entire chunk, does this ever happen?");
                require('fs').write(tmp.fd, buf.slice(written), cb);
                return;
              }

              resolve();
            });
          });
        });
      }

      var chunk = 0;
      return this.allocateTmp().then(function(tmpfile) {
        tmp = tmpfile;
      }).then(function a() {
        if ( chunk < chunks ) return writeChunk(chunk++).then(a);
      }).then(function() {
        return new Promise(function(resolve, reject) {
          require('fs').close(tmp.fd, function() {
            var digest = hash.digest('hex');
            require('fs').rename(tmp.path, self.sha256 + require('path').sep + digest, function(err) {
              if ( err ) {
                reject(err);
                return;
              }
              resolve(digest);
            });
          });
        });
      });
    },

    function find(id) {
      this.setup();
      if ( id.indexOf(require('path').sep) != -1 ) {
        return Promise.reject(new Error("Invalid file name"));
      }

      var self = this;

      return new Promise(function(resolve, reject) {
        require('fs').open(self.sha256 + require('path').sep + id, "r", function(err, fd) {
          if ( err ) {
            if ( err.code == 'ENOENT' ) {
              resolve(null);
              return;
            }

            reject(err);
            return;
          }
          resolve(foam.blob.FdBlob.create({ fd: fd }));
        });
      });
    }
  ]
});

}

foam.CLASS({
  package: 'foam.blob',
  name: 'RestBlobService',
  documentation: 'Implementation of a BlobService against a REST interface.',
  requires: [
    'foam.net.HTTPRequest',
    'foam.blob.BlobBlob',
    'foam.blob.IdentifiedBlob'
  ],
  properties: [
    {
      class: 'String',
      name: 'address'
    }
  ],
  methods: [
    function put(blob) {
      if ( this.IdentifiedBlob.isInstance(blob) ) {
        // Already stored.
        return Promise.resolve(blob);
      }

      var req = this.HTTPRequest.create();
      req.fromUrl(this.address);
      req.method = 'PUT';
      req.payload = blob;

      var self = this;

      return req.send().then(function(resp) {
        return resp.payload;
      }).then(function(id) {
        return self.IdentifiedBlob.create({ id: id });
      });
    },
    function urlFor(blob) {
      if ( ! foam.blob.IdentifiedBlob.isInstance(blob) ) {
        return null;
      }

      return this.address + '/' + blob.id;
    },
    function find(id) {
      var req = this.HTTPRequest.create();
      req.fromUrl(this.address + '/' + id);
      req.method = 'GET';
      req.responseType = 'blob';

      var self = this;
      return req.send().then(function(resp) {
        return resp.payload;
      }).then(function(blob) {
        return self.BlobBlob.create({
          blob: blob
        });
      });
    }
  ]
});

foam.CLASS({
  package: 'foam.blob',
  name: 'BlobServiceDecorator',
  implements: ['foam.dao.DAODecorator'],
  imports: [
    'blobService'
  ],
  properties: [
    {
      class: 'Class',
      name: 'of'
    },
    {
      name: 'props',
      expression: function(of) {
        return of.getAxiomsByClass(foam.core.Blob);
      }
    }
  ],
  methods: [
    function write(X, dao, obj, existing) {
      var i = 0;
      var props = this.props;
      var self = this;

      return Promise.resolve().then(function a() {
        var prop = props[i++];

        if ( ! prop ) return obj;

        var blob = prop.f(obj);

        if ( ! blob ) return obj;

        return self.blobService.put(blob).then(function(b) {
          prop.set(obj, b);
          return a();
        });
      });
    },
    function read(X, dao, obj) {
      return Promise.resolve(obj);
    },
    function remove(X, dao, obj) {
      return Promise.resolve(obj);
    }
  ]
});


foam.CLASS({
  package: 'foam.blob',
  name: 'TestBlobService',
  requires: [
    'foam.blob.IdentifiedBlob'
  ],
  properties: [
    {
      class: 'Map',
      name: 'blobs'
    },
    {
      class: 'Int',
      name: 'nextId',
      value: 1
    }
  ],
  methods: [
    function put(file) {
      var id = this.nextId++;
      this.blobs[id] = file;
      return Promise.resolve(this.IdentifiedBlob.create({ id }));
    },
    function find(id) {
      return Promise.resolve(this.blobs[id] || null);
    },
    function urlFor(id) {
      return URL.createObjectURL(this.blobs[id]);
    }
  ]
});
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

foam.CLASS({
  package: 'foam.encodings',
  name: 'UTF8',

  properties: [
    {
      name: 'charcode'
    },
    {
      class: 'Int',
      name: 'remaining',
      value: 0
    },
    {
      class: 'String',
      name: 'string'
    }
  ],

  methods: [
    function reset() {
      this.string = '';
      this.remaining = 0;
      this.charcode = null;
    },

    function put(byte) {
      if ( byte instanceof ArrayBuffer ) {
        var data = new Uint8Array(byte);
        this.put(data);
        return;
      }

      if ( byte instanceof Uint8Array ) {
        for ( var i = 0 ; i < byte.length ; i++ ) {
          this.put(byte[i]);
        }
        return;
      }

      if (this.charcode == null) {
        this.charcode = byte;
        if (!(this.charcode & 0x80)) {
          this.remaining = 0;
          this.charcode = (byte & 0x7f) << (6 * this.remaining);
        } else if ((this.charcode & 0xe0) == 0xc0) {
          this.remaining = 1;
          this.charcode = (byte & 0x1f) << (6 * this.remaining);
        } else if ((this.charcode & 0xf0) == 0xe0) {
          this.remaining = 2;
          this.charcode = (byte & 0x0f) << (6 * this.remaining);
        } else if ((this.charcode & 0xf8) == 0xf0) {
          this.remaining = 3;
          this.charcode = (byte & 0x07) << (6 * this.remaining);
        } else if ((this.charcode & 0xfc) == 0xf8) {
          this.remaining = 4;
          this.charcode = (byte & 0x03) << (6 * this.remaining);
        } else if ((this.charcode & 0xfe) == 0xfc) {
          this.remaining = 5;
          this.charcode = (byte & 0x01) << (6 * this.remaining);
        } else throw 'Bad charcode value';
      } else if ( this.remaining > 0 ) {
        this.remaining--;
        this.charcode |= (byte & 0x3f) << (6 * this.remaining);
      }

      if ( this.remaining == 0 ) {
        this.string += String.fromCodePoint(this.charcode);
        this.charcode = undefined;
      }
    }
   ]
});
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

foam.CLASS({
  package: 'foam.net.web',
  name: 'WebSocket',

  topics: [
    'message',
    'connected',
    'disconnected'
  ],

  properties: [
    {
      name: 'uri'
    },
    {
      name: 'socket',
      transient: true
    }
  ],

  methods: [
    function send(msg) {
      // Apparently you can't catch exceptions from calling .send()
      // when the socket isn't open.  So we'll try to predict an exception
      // happening and throw early.
      //
      // There could be a race condition here if the socket
      // closes between our check and .send().
      if ( this.socket.readyState !== this.socket.OPEN ) {
        throw new Error('Socket is not open');
      }
      this.socket.send(foam.json.Network.stringify(msg));
    },

    function connect() {
      var socket = this.socket = new WebSocket(this.uri);
      var self = this;

      return new Promise(function(resolve, reject) {
        function onConnect() {
          socket.removeEventListener('open', onConnect);
          resolve(self);
        }
        function onConnectError(e) {
          socket.removeEventListener('error', onConnectError);
          reject();
        }
        socket.addEventListener('open', onConnect);
        socket.addEventListener('error', onConnectError);

        socket.addEventListener('open', function() {
          self.connected.pub();
        });
        socket.addEventListener('message', self.onMessage);
        socket.addEventListener('close', function() {
          self.disconnected.pub();
        });
      });
    }
  ],

  listeners: [
    {
      name: 'onMessage',
      code: function(msg) {
        this.message.pub(msg.data);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.net.web',
  name: 'WebSocketService',

  requires: [
    'foam.net.web.WebSocket',
    'foam.box.RegisterSelfMessage',
    'foam.box.Message'
  ],

  properties: [
    {
      name: 'delegate'
    }
  ],

  methods: [
    function addSocket(socket) {
      var sub1 = socket.message.sub(function onMessage(s, _, msg) {
        msg = foam.json.parseString(msg, this);

        if ( ! this.Message.isInstance(msg) ) {
          console.warn("Got non-message object.", msg);
        }

        if ( this.RegisterSelfMessage.isInstance(msg.object) ) {
          var named = foam.box.NamedBox.create({
            name: msg.object.name
          });

          named.delegate = foam.box.RawWebSocketBox.create({
            socket: socket
          });
        } else {
          this.delegate.send(msg);
        }
      }.bind(this));

      socket.disconnected.sub(function(s) {
        s.detach();
        sub1.detach();
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.net.web',
  name: 'HTTPResponse',

  topics: [
    'data',
    'err',
    'end'
  ],

  properties: [
    {
      class: 'Int',
      name: 'status'
    },
    {
      class: 'String',
      name: 'responseType'
    },
    {
      class: 'Map',
      name: 'headers'
    },
    {
      name: 'payload',
      factory: function() {
        if ( this.streaming ) {
          return null;
        }

        switch ( this.responseType ) {
          case 'text':        return this.resp.text();
          case 'blob':        return this.resp.blob();
          case 'arraybuffer': return this.resp.arraybuffer();
          case 'json':        return this.resp.json();
        }

        // TODO: responseType should be an enum and/or have validation
        throw new Error('Unsupported response type: ' + this.responseType);
      }
    },
    {
      class: 'Boolean',
      name: 'streaming',
      value: false
    },
    {
      class: 'Boolean',
      name: 'success',
      expression: function(status) {
        return status >= 200 && status <= 299;
      }
    },
    {
      name: 'resp',
      postSet: function(_, r) {
        var iterator = r.headers.entries();
        var next = iterator.next();
        while ( ! next.done ) {
          this.headers[next.value[0]] = next.value[1];
          next = iterator.next();
        }
        this.status = r.status;
      }
    }
  ],

  methods: [
    function start() {
      var reader = this.resp.body.getReader();
      this.streaming = true;

      var onError = foam.Function.bind(function(e) {
        this.err.pub();
        this.end.pub();
      }, this);

      var onData = foam.Function.bind(function(e) {
        if ( e.value ) {
          this.data.pub(e.value);
        }

        if ( e.done || ! this.streaming) {
          this.end.pub();
          return this;
        }
        return reader.read().then(onData, onError);
      }, this);

      return reader.read().then(onData, onError);
    },

    function stop() {
      this.streaming = false;
    }
  ]
});


foam.CLASS({
  package: 'foam.net.web',
  name: 'HTTPRequest',

  requires: [
    'foam.net.web.HTTPResponse',
    'foam.blob.Blob',
    'foam.blob.BlobBlob'
  ],

  topics: [
    'data'
  ],

  properties: [
    {
      class: 'String',
      name: 'hostname'
    },
    {
      class: 'Int',
      name: 'port'
    },
    {
      class: 'String',
      name: 'protocol',
      preSet: function(old, nu) {
        return nu.replace(':', '');
      }
    },
    {
      class: 'String',
      name: 'path',
      preSet: function(old, nu) {
        if ( ! nu.startsWith('/') ) return '/' + nu;
        return nu;
      }
    },
    {
      class: 'String',
      name: 'url'
    },
    {
      class: 'String',
      name: 'method',
      value: 'GET'
    },
    {
      class: 'Map',
      name: 'headers'
    },
    {
      name: 'payload'
    },
    {
      // TODO: validate acceptable types
      class: 'String',
      name: 'responseType',
      value: 'text'
    },
    {
      class: 'String',
      name: 'contentType',
      factory: function() { return this.responseType; }
    },
    {
      class: 'String',
      name: 'mode',
      value: 'cors'
    }
  ],

  methods: [
    function fromUrl(url) {
      var u = new URL(url);
      this.protocol = u.protocol.substring(0, u.protocol.length-1);
      this.hostname = u.hostname;
      if ( u.port ) this.port = u.port;
      this.path = u.pathname + u.search;
    },

    function send() {
      if ( this.url ) {
        this.fromUrl(this.url);
      }
      this.addContentHeaders();

      var self = this;

      var headers = new Headers();
      for ( var key in this.headers ) {
        headers.set(key, this.headers[key]);
      }

      var options = {
        method: this.method,
        headers: headers,
        mode: this.mode,
        redirect: "follow",
        credentials: "same-origin"
      };

      if ( this.payload ) {
        if ( this.BlobBlob.isInstance(this.payload) ) {
          options.body = this.payload.blob;
        } else if ( this.Blob.isInstance(this.payload) ) {
          foam.assert(false, 'TODO: Implemented sending of foam.blob.Blob over HTTPRequest.');
        } else {
          options.body = this.payload;
        }
      }

      var request = new Request(
          this.protocol + "://" +
          this.hostname +
          ( this.port ? ( ':' + this.port ) : '' ) +
          this.path,
          options);

      return fetch(request).then(function(resp) {
        var resp = this.HTTPResponse.create({
          resp: resp,
          responseType: this.responseType
        });

        if ( resp.success ) return resp;
        throw resp;
      }.bind(this));
    },
    function addContentHeaders() {
      // Specify Content-Type header when it can be deduced.
      if ( ! this.headers['Content-Type'] ) {
        switch ( this.contentType ) {
          case 'text':
          this.headers['Content-Type'] = 'text/plain';
          break;
          case 'json':
          this.headers['Content-Type'] = 'application/json';
          break;
        }
      }
      // Specify this.contentType when it can be deduced.
      if ( ! this.headers['Accept'] ) {
        switch ( this.contentType ) {
          case 'json':
          this.headers['Accept'] = 'application/json';
          break;
        }
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.net.web',
  name: 'EventSource',

  requires: [
    'foam.parse.Grammar',
    'foam.net.web.HTTPRequest',
    'foam.encodings.UTF8'
  ],

  imports: [
    'setTimeout',
    'clearTimeout'
  ],

  topics: [
    {
      name: 'message'
    }
  ],

  properties: [
    {
      name: 'grammar',
      factory: function() {
        var self = this;
        return this.Grammar.create({
          symbols: function(repeat, alt, sym, notChars, seq) {
            return {
              START: sym('line'),

              line: alt(
                sym('event'),
                sym('data')),

              event: seq('event: ', sym('event name')),
              'event name': repeat(notChars('\r\n')),

              data: seq('data: ', sym('data payload')),
              'data payload': repeat(notChars('\r\n'))
            }
          }
        }).addActions({
          'event name': function(v) {
            self.eventName = v.join('');
          },
          'data payload': function(p) {
            self.eventData = p.join('');
          }
        });
      }
    },
    {
      class: 'String',
      name: 'uri'
    },
    {
      class: 'Boolean',
      name: 'running',
      value: false
    },
    {
      name: 'resp'
    },
    {
      name: 'decoder',
      factory: function() {
        return this.UTF8.create()
      }
    },
    {
      name: 'retryTimer'
    },
    {
      class: 'Int',
      name: 'delay',
      preSet: function(_, a) {
        if ( a > 30000 ) return 30000;
        return a;
      },
      value: 1
    },
    'eventData',
    'eventName'
  ],

  methods: [
    function start() {
      var req = this.HTTPRequest.create({
        method: "GET",
        url: this.uri,
        headers: {
          'accept': 'text/event-stream'
        }
      });

      this.running = true;
      this.keepAlive();
      req.send().then(function(resp) {
        if ( ! resp.success ) {
          this.onError();
          return;
        }

        this.clearProperty('decoder');
        resp.data.sub(this.onData);
        resp.end.sub(this.onError);
        this.resp = resp;
        resp.start();
      }.bind(this), this.onError);
    },

    function keepAlive() {
      if ( this.retryTimer ) {
        this.clearTimeout(this.retryTimer);
      }

      this.retryTimer = this.setTimeout(foam.Function.bind(function() {
        this.retryTimer = 0;
        this.onError();
      }, this), 30000);
    },

    function close() {
      this.running = false;
      this.resp.stop();
    },

    function dispatchEvent() {
      // Known possible events names
      // put
      // patch
      // keep-alive
      // cancel
      // auth revoked

      this.message.pub(this.eventName, this.eventData);
      this.eventName = null;
      this.eventData = null;
    },

    function processLine(line) {
      // TODO: This can probably be simplified by using state machine based
      // parsers, but in the interest of saving time we're going to do it line
      // by line for now.  Something we know works from previous interations.

      if ( line.length == 0 ) {
        this.dispatchEvent();
        return;
      }

      this.grammar.parseString(line);
    }
  ],

  listeners: [
    function onData(s, _, data) {
      this.delay = 1;
      this.keepAlive();

      this.decoder.put(data);
      var string = this.decoder.string;
      while ( string.indexOf('\n') != -1 ) {
        var line = string.substring(0, string.indexOf('\n'));
        this.processLine(line);
        string = string.substring(string.indexOf('\n') + 1);
      }
      this.decoder.string = string;
    },

    function onError() {
      this.delay *= 2;
      this.setTimeout(this.onEnd, this.delay);
    },

    function onEnd() {
      if ( this.running ) {
        this.start();
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.net.web',
  name: 'XMLHTTPRequest',
  extends: 'foam.net.web.HTTPRequest',

  requires: [
    'foam.net.web.XMLHTTPResponse as HTTPResponse'
  ],

  methods: [
    function send() {
      if ( this.url ) {
        this.fromUrl(this.url);
      }

      var xhr = new XMLHttpRequest();
      xhr.open(
          this.method,
          this.protocol + "://" +
          this.hostname + ( this.port ? ( ':' + this.port ) : '' ) +
          this.path);
      xhr.responseType = this.responseType;
      for ( var key in this.headers ) {
        xhr.setRequestHeader(key, this.headers[key]);
      }

      var self = this;
      return new Promise(function(resolve, reject) {
        xhr.addEventListener('readystatechange', function foo() {
          if ( this.readyState === this.LOADING ||
               this.readyState === this.DONE ) {
            this.removeEventListener('readystatechange', foo);
            var resp = self.HTTPResponse.create({
              xhr: this
            });

            if ( resp.success ) resolve(resp);
            else reject(resp);
          }
        });
        xhr.send(self.payload);
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.net.web',
  name: 'XMLHTTPResponse',
  extends: 'foam.net.web.HTTPResponse',

  constants: {
    STREAMING_LIMIT: 10 * 1024 * 1024
  },

  properties: [
    {
      name: 'xhr',
      postSet: function(_, xhr) {
        this.status = xhr.status;
        var headers = xhr.getAllResponseHeaders().split('\r\n');
        for ( var i = 0 ; i < headers.length ; i++ ) {
          var sep = headers[i].indexOf(':');
          var key = headers[i].substring(0, sep);
          var value = headers[i].substring(sep+1);
          this.headers[key.trim()] = value.trim();
        }
        this.responseType = xhr.responseType;
      }
    },
    {
      name: 'payload',
      factory: function() {
        if ( this.streaming ) {
          return null;
        }

        var self = this;
        var xhr = this.xhr;

        if ( xhr.readyState === xhr.DONE )
          return Promise.resolve(xhr.response);
        else
          return new Promise(function(resolve, reject) {
            xhr.addEventListener('readystatechange', function() {
              if ( this.readyState === this.DONE )
                resolve(this.response);
            });
          });
      }
    },
    {
      class: 'Int',
      name: 'pos',
      value: 0
    }
  ],

  methods: [
    function start() {
      this.streaming = true;
      this.xhr.addEventListener('loadend', function() {
        this.done.pub();
      }.bind(this));

      this.xhr.addEventListener('progress', function() {
        var substr = this.xhr.responseText.substring(this.pos);
        this.pos = this.xhr.responseText.length;
        this.data.pub(substr);

        if ( this.pos > this.STREAMING_LIMIT ) {
          this.xhr.abort();
        }
      }.bind(this));
    }
  ]
});


foam.CLASS({
  package: 'foam.net.web',
  name: 'SafariEventSource',
  extends: 'foam.net.web.EventSource',

  requires: [
    'foam.net.web.XMLHTTPRequest as HTTPRequest'
  ],

  properties: [
    {
      class: 'String',
      name: 'buffer'
    }
  ],

  listeners: [
    function onData(s, _, data) {
      this.delay = 1;
      this.keepAlive();

      this.buffer += data;
      var string = this.buffer;

      while ( string.indexOf('\n') != -1 ) {
        var line = string.substring(0, string.indexOf('\n'));
        this.processLine(line);
        string = string.substring(string.indexOf('\n') + 1);
      }

      this.buffer = string;
    }
  ]
});
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

foam.CLASS({
  package: 'foam.messageport',
  name: 'MessagePortService',

  requires: [
    'foam.box.RegisterSelfMessage',
    'foam.box.RawMessagePortBox',
    'foam.box.NamedBox'
  ],

  properties: [
    {
      name: 'source',
      postSet: function() {
        this.source.addEventListener('connect', this.onConnect);
        this.source.addEventListener('message', this.onConnect);
      }
    },
    {
      name: 'delegate',
      required: true
    }
  ],

  methods: [
    function addPort(p) {
      p.onmessage = this.onMessage.bind(this, p);
    }
  ],

  listeners: [
    function onConnect(e) {
      for ( var i = 0 ; i < e.ports.length ; i++ ) {
        this.addPort(e.ports[i]);
      }
    },

    function onMessage(port, e) {
      var msg = foam.json.parseString(e.data, this);

      if ( this.RegisterSelfMessage.isInstance(msg.object) ) {
        var named = this.NamedBox.create({ name: msg.object.name });
        named.delegate = this.RawMessagePortBox.create({
          port: port
        });
        return;
      }

      this.delegate && this.delegate.send(msg);
    }
  ]
});
/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

/*
TODO:
-better serialization/deserialization
-error handling if firebase contains malformed data, since we're not the only
ones who can write to it.
-multi part keys
*/

foam.CLASS({
  package: 'com.firebase',
  name: 'ExpectedObjectNotFound',
  extends: 'foam.dao.InternalException'
});

foam.CLASS({
  package: 'com.firebase',
  name: 'FirebaseDAO',
  extends: 'foam.dao.AbstractDAO',

  requires: [
    'foam.dao.ArraySink',
    'foam.net.web.HTTPRequest',
    'com.firebase.FirebaseEventSource',
    'foam.mlang.predicate.Gt',
    'foam.mlang.Constant'
  ],

  properties: [
    'of',
    'apppath',
    'secret',
    'eventSource_',
    {
      name: 'timestampProperty'
    },
    {
      name: 'basepath',
      expression: function(apppath, of) {
        return apppath + of.id.replace(/\./g, '/');
      }
    },
    {
      class: 'Boolean',
      name: 'enableStreaming',
      value: true
    },
    'startEventsAt_'
  ],

  methods: [
    function put(obj) {
      var req = this.HTTPRequest.create();

      if ( obj.id ) {
        req.method = "PUT";
        req.url = this.basepath
          + "/"
          + encodeURIComponent(obj.id) + ".json";
      } else {
        throw new Error('Server generated IDs not supported.');
        // req.method = 'POST';
        // req.url = this.basepath + '.json';
      }

      if ( this.secret ) {
        req.url += '?auth=' + encodeURIComponent(this.secret);
      }

      req.payload = JSON.stringify({
        data: foam.json.stringify(obj),
        lastUpdate: {
          ".sv": "timestamp"
        }
      });
      req.headers['content-type'] = 'application/json';
      req.headers['accept']       = 'application/json';

      return req.send().then(function(resp) {
        return resp.payload;
      }).then(function(payload) {
        payload = JSON.parse(payload);

        //        if ( obj.id ) {
          var o2 = foam.json.parse(foam.json.parseString(payload.data));
          if ( this.timestampProperty ) {
            this.timestampProperty.set(o2, payload.lastUpdate);
          }
          return o2;
        //        } else {
        //           Server created id
        //        }
      }.bind(this), function(resp) {
        // TODO: Handle various errors.
        return Promise.reject(foam.dao.InternalException.create());
      });
    },

    function remove(obj) {
      var req = this.HTTPRequest.create();
      req.method = 'DELETE',
      req.url = this.basepath + "/" + encodeURIComponent(obj.id) + ".json";

      if ( this.secret ) {
        req.url += "?auth=" + encodeURIComponent(this.secret);
      }

      return req.send().then(function() {
        return Promise.resolve();
      }, function() {
        return Promise.reject(foam.dao.InternalException.create());
      });
    },

    function find(id) {
      var req = this.HTTPRequest.create();
      req.method = "GET";
      req.url = this.basepath + "/" + encodeURIComponent(id) + ".json";
      if ( this.secret ) {
        req.url += "?auth=" + encodeURIComponent(this.secret);
      }

      return req.send().then(function(resp) {
        return resp.payload;
      }).then(function(data) {
        if ( data == "null" ) {
          return Promise.resolve(null);
        }
        try {
          data = JSON.parse(data);

          var obj = foam.json.parse(
            foam.json.parseString(data.data));

          if ( this.timestampProperty ) {
            this.timestampProperty.set(obj, data.lastUpdate);
          }

          return obj;
        } catch(e) {
          return Promise.reject(foam.dao.InternalException.create());
        }
      }.bind(this));
    },

    function startEvents() {
      if ( this.eventSource_ || ! this.enableStreaming ) {
        return;
      }

      var params = [];
      if ( this.secret ) params.push(['auth', this.secret]);
      if ( this.startEventsAt_ ) {
        params.push(['orderBy', '"lastUpdate"']);
        params.push(['startAt', this.startEventsAt_]);
      }

      var uri = this.basepath + '.json';
      if ( params.length ) {
        uri += '?' + params.map(function(p) { return p.map(encodeURIComponent).join('='); }).join('&');
      }

      this.eventSource_ = this.FirebaseEventSource.create({
        uri: uri
      });

      this.eventSource_.put.sub(this.onPut);
      this.eventSource_.patch.sub(this.onPatch);
      this.eventSource_.start();
    },

    function stopEvents() {
      if ( this.eventSource_ ) {
        this.eventSource_.close();
        this.eventSource_.message.put.unsub(this.onPut);
        this.eventSource_.message.patch.unsub(this.onPatch);
        this.clearProperty('eventSource_');
      }
    },

    function select(sink, skip, limit, order, predicate) {
      var req = this.HTTPRequest.create();
      req.method = "GET";

      var params = [];
      if ( this.secret ) params.push(['auth', this.secret]);

      // Efficiently handle GT(lastupdate, #) queries.  Used by the SyncDAO to get
      // all changes.

      if ( predicate && this.timestampProperty &&
           this.Gt.isInstance(predicate) &&
           this.Constant.isInstance(predicate.arg2) &&
           predicate.arg1 === this.timestampProperty ) {

        // TODO: This is a hack to ensure that
        if ( ! this.startEventsAt_ )  {
          this.startEventsAt_ = predicate.arg2.f() + 1;
          this.startEvents();
        }

        params.push(['orderBy', '"lastUpdate"']);
        params.push(['startAt', predicate.arg2.f() + 1]);
      }

      var url = this.basepath + '.json';
      if ( params.length ) {
        url += '?' + params.map(function(p) { return p.map(encodeURIComponent).join('='); }).join('&');
      }

      req.url = url;

      var resultSink = sink || this.ArraySink.create();
      sink = this.decorateSink_(resultSink, skip, limit, order, predicate);

      // TODO: This should be streamed for better handling of large responses.
      return req.send().then(function(resp) {
        if ( ! resp.success ) {
          return Promise.reject(foam.dao.InternalException.create());
        }
        return resp.payload;
      }).then(function(payload) {
        var data = JSON.parse(payload);

        var detached = false;
        var sub = foam.core.FObject.create();
        sub.onDetach(function() { detached = true; });

        for ( var key in data ) {
          if ( detached ) break;

          var obj = foam.json.parse(
            foam.json.parseString(data[key].data));
          if ( this.timestampProperty ) {
            this.timestampProperty.set(obj, data[key].lastUpdate);
          }

          sink.put(obj, sub);
        }
        sink.eof();

        return resultSink;
      }.bind(this), function(resp) {
        var e = foam.dao.InternalException.create();
        return Promise.reject(e);
      });
    }
  ],

  listeners: [
    function onPut(s, _, data) {
      // PATH is one of
      // / -> new objects
      // /key -> new object
      // /key/data -> updated object

      var path = data.path;
      if ( path == "/" ) {
        // All data removed?
        if ( data.data == null ) {
          this.on.reset.pub();
          return;
        }

        for ( var key in data.data ) {
          var obj = foam.json.parse(foam.json.parseString(data.data[key].data));
          if ( this.timestampProperty ) {
            this.timestampProperty.set(obj, data.data[key].lastUpdate);
          }
          this.on.put.pub(obj);
        }
        return;
      } else if ( path.lastIndexOf('/') === 0 ) {
        if ( data.data == null ) {
          var obj = this.of.create();
          obj.id = path.substring(1)
          this.on.remove.pub(obj);
          return;
        }
        var obj = foam.json.parse(foam.json.parseString(data.data.data));
        if ( this.timestampProperty ) {
          this.timestampProperty.set(obj, data.data.lastUpdate);
        }
        this.on.put.pub(obj);
      } else if ( path.indexOf('/data') === path.length - 5 ) {
        // These last two events shouldn't happen unless somebody is editing
        // the underlying firebase data by hand.

        // Data of an existing row updated.
        debugger;
        var id = path.substring(1);
        id = id.substring(0, id.indexOf('/'));
        this.find(id).then(function(obj) {
          if ( ! obj ) throw com.firebase.ExpectedObjectNotFound.create();
          this.on.put.pub(obj);
        }.bind(this));

        // var obj = foam.json.parse(foam.json.parseString(data.data));
        // this.on.put.pub(obj);
      } else if ( path.indexOf('/lastUpdate') === path.length - 11 ) {
        // Timestamp of an existing row updated, do anything?
        // presumably if the object itself hasn't been updated we don't care
        // if it has been updated we should get an event for that.

        debugger;
        var id = path.substring(1);
        id = id.substring(0, id.indexOf('/'));
        this.find(id).then(function(obj) {
          if ( ! obj ) throw com.firebase.ExpectedObjectNotFound.create();
          this.on.put.pub(obj);
        }.bind(this));
      }
    },

    function onPatch(s, _, __, data) {
          // TODO: What does a patch even look like?
      debugger;
    }
  ]
});


foam.CLASS({
  package: 'com.firebase',
  name: 'SafariFirebaseDAO',
  extends: 'com.firebase.FirebaseDAO',

  requires: [
    'foam.net.web.XMLHTTPRequest as HTTPRequest',
    'foam.net.web.SafariEventSource as EventSource'
  ],

  properties: [
    [ 'enableStreaming', false ]
  ]
});


foam.CLASS({
  package: 'com.firebase',
  name: 'FirebaseEventSource',

  requires: [
    'foam.net.web.EventSource'
  ],

  topics: [
    'put',
    'patch',
    'keep-alive',
    'cancel',
    'auth_revoked'
  ],

  properties: [
    {
      name: 'uri',
      required: true
    },
    {
      name: 'eventSource',
      postSet: function(old, nu) {
        nu.message.sub(this.onMessage);
      },
      factory: function() {
        return this.EventSource.create({
          uri: this.uri
        });
      }
    },
    {
      class: 'String',
      name: 'buffer'
    }
  ],

  methods: [
    function start() {
      this.eventSource.start();
    }
  ],

  listeners: [
    function onMessage(s, msg, name, data) {
      switch (name) {
      case 'put':
        this.onPut(name, data);
        break;
      case 'patch':
        this.onPatch(name, data);
        break;
      case 'keep-alive':
        this.onKeepAlive(name, data);
        break;
      case 'cancel':
        this.onCancel(name, data);
        break;
      case 'auth_revoked':
        this.onAuthRevoked(name, data);
        break;
      default:
        this.onUnknown(name, data);
      }
    },

    function onPut(name, data) {
      this.put.pub(JSON.parse(data));
      return;

      // this.buffer += data;
      // try {
      //   var payload = JSON.parse(this.buffer);
      // } catch(e) {
      //   this.warn('Failed to parse payload, assuming its incomplete.', e, this.buffer.length);
      //   return;
      // }

      // this.buffer = '';
      // this.put.pub(payload);
    },

    function onPatch() {
      debugger;
    },

    function onKeepAlive() {
    },

    function onCancel() {
    },

    function onUnknown(name, data) {
      this.warn('Unknown firebase event', name, data);
    }
  ]
});
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

// TODO: doc
foam.CLASS({
  package: 'com.firebase',
  name: 'CloudMessaging',

  requires: [
    'foam.net.node.HTTPRequest',
  ],

  properties: [
    {
      name: 'serverKey'
    }
  ],

  methods: [
    function send(id, payload, collapseKey) {
      return this.HTTPRequest.create({
        url: 'https://fcm.googleapis.com/fcm/send',
        method: 'POST',
        headers: {
          "content-type": "application/json",
          "Authorization": "key=" + this.serverKey
        },
        responseType: 'json',
        payload: JSON.stringify({
          to: id,
          data: payload
        })
      }).send().then(function(resp) {
        if ( ! resp.success ) {
          return resp.payload.then(function(p) { return Promise.reject(p); });
        }
      });
    }
  ]
});
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

foam.CLASS({
  package: 'foam.core',
  name: 'StubMethod',
  extends: 'Method',
  properties: [
    'replyPolicyName',
    'boxPropName',
    {
      name: 'code',
      factory: function() {
        var returns = this.returns;
        var replyPolicyName = this.replyPolicyName;
        var boxPropName = this.boxPropName;
        var name = this.name;

        return function() {
          if ( returns ) {
            var replyBox = this.ReplyBox.create({
              delegate: this.RPCReturnBox.create()
            });

            var ret = replyBox.delegate.promise;

            replyBox = this.registry.register(
              replyBox.id,
              this[replyPolicyName],
              replyBox);

            // TODO: Move this into RPCReturnBox ?
            if ( returns !== 'Promise' ) {
              ret = foam.lookup(returns).create({ delegate: ret });
            }
          }

          var msg = this.Message.create({
            object: this.RPCMessage.create({
              name: name,
              args: Array.from(arguments)
            })
          });

          if ( replyBox ) {
            msg.attributes.replyBox = replyBox;
            msg.attributes.errorBox = replyBox;
          }

          this[boxPropName].send(msg);

          return ret;
        };
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.core',
  name: 'StubAction',
  extends: 'Action',
  properties: [
    'replyPolicyName',
    'boxPropName',
    {
      name: 'stubMethod',
      factory: function() {
        return foam.core.StubMethod.create({
          name: this.name,
          replyPolicyName: this.replyPolicyName,
          boxPropName: this.boxPropName
        });
      }
    },
    {
      name: 'code',
      factory: function() {
        return function(ctx, action) {
          action.stubMethod.code.call(this);
        };
      }
    }
  ],
  methods: [
    function installInProto(proto) {
      proto[this.name] = this.stubMethod.code;
    }
  ]
});

foam.CLASS({
  package: 'foam.core',
  name: 'Stub',
  extends: 'Property',

  properties: [
    'of',
    {
      name: 'replyPolicyName',
      expression: function(name) {
        return name + 'ReplyPolicy'
      }
    },
    {
      class: 'StringArray',
      name: 'methods',
      factory: function() { return null; }
    },
    {
      name: 'methods_',
      expression: function(of, name, methods, replyPolicyName) {
        var cls = foam.lookup(of);

        return (
          methods ?
            methods.map(function(m) { return cls.getAxiomByName(m); }) :
          cls.getAxiomsByClass(foam.core.Method).filter(function (m) { return cls.hasOwnAxiom(m.name); }) ).
          map(function(m) {
            var returns = m.returns;
            if ( m.returns && m.returns !== 'Promise' ) {
              var id = m.returns.split('.');
              id[id.length - 1] = 'Promised' + id[id.length - 1];
              returns = id.join('.');
            }

            return foam.core.StubMethod.create({
              name: m.name,
              replyPolicyName: replyPolicyName,
              boxPropName: name,
              returns: returns
            });
          });
      }
    },
    {
      class: 'StringArray',
      name: 'actions',
      factory: function() { return null; }
    },
    {
      name: 'actions_',
      expression: function(of, name, actions, replyPolicyName) {
        var cls = foam.lookup(of);

        return (
          actions ? actions.map(function(a) { return cls.getAxiomByName(a); }) :
          cls.getAxiomsByClass(foam.core.Action).filter(function(m) { return cls.hasOwnAxiom(m.name); }) ).
          map(function(m) {
            return foam.core.StubAction.create({
              name: m.name,
              isEnabled: m.isEnabled,
              replyPolicyName: replyPolicyName,
              boxPropName: name
            })
          });
      }
    }
  ],

  methods: [
    function installInClass(cls) {
      var model = foam.lookup(this.of);
      var propName = this.name;

      cls.installAxiom(foam.core.Property.create({
        name: this.replyPolicyName,
        hidden: true
      }));

      for ( var i = 0 ; i < this.methods_.length ; i++ ) {
        cls.installAxiom(this.methods_[i]);
      }

      for ( i = 0 ; i < this.actions_.length ; i++ ) {
        cls.installAxiom(this.actions_[i]);
      }

      [
        'foam.box.RPCReturnBox',
        'foam.box.ReplyBox',
        'foam.box.RPCMessage',
        'foam.box.Message'
      ].map(function(s) {
        var path = s.split('.');
        return foam.core.Requires.create({
          path: s,
          name: path[path.length - 1]
        });
      }).forEach(function(a) {
        cls.installAxiom(a);
      });

      [
        'registry'
      ].map(function(s) {
        cls.installAxiom(foam.core.Import.create({
          key: s,
          name: s
        }));
      });
    }
  ]
});
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

foam.INTERFACE({
  package: 'foam.box',
  name: 'Box',

  methods: [
    {
      name: 'send',
      args: [
        'message'
      ]
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'PromisedBox',

  properties: [
    {
      class: 'Promised',
      of: 'foam.box.Box',
      transient: true,
      name: 'delegate'
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'ProxyBox',
  implements: ['foam.box.Box'],

  properties: [
    {
      class: 'Proxy',
      of: 'foam.box.Box',
      name: 'delegate'
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'Message',

  properties: [
    {
      class: 'Map',
      name: 'attributes'
    },
    {
      class: 'Object',
      name: 'object'
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'SubBoxMessage',

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'Object',
      name: 'object'
    }
  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'HelloMessage'
});

foam.CLASS({
  package: 'foam.box',
  name: 'SubBox',
  extends: 'foam.box.ProxyBox',

  requires: [
    'foam.box.SubBoxMessage'
  ],

  properties: [
    {
      class: 'String',
      name: 'name'
    }
  ],

  methods: [
    {
      name: 'send',
      code: function(msg) {
        msg.object = this.SubBoxMessage.create({
          name: this.name,
          object: msg.object
        });
        this.delegate.send(msg);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'NameAlreadyRegisteredException',

  properties: [
    {
      class: 'String',
      name: 'name'
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'NoSuchNameException',

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'message',
      transient: true,
      expression: function(name) {
        return 'Could not find registration for ' + name;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'BoxRegistry',

  requires: [
    'foam.box.NoSuchNameException',
    'foam.box.SubBox'
  ],

  imports: [
    'me'
  ],

  properties: [
    {
      name: 'registry',
      hidden: true,
      factory: function() { return {}; }
    }
  ],

  classes: [
    {
      name: 'Registration',
      properties: [
        {
          class: 'FObjectProperty',
          of: 'foam.box.Box',
          name: 'exportBox'
        },
        {
          class: 'FObjectProperty',
          of: 'foam.box.Box',
          name: 'localBox'
        }
      ]
    }
  ],

  methods: [
    {
      name: 'doLookup',
      returns: 'foam.box.Box',
      code: function doLookup(name) {
        if ( this.registry[name] &&
             this.registry[name].exportBox )
          return this.registry[name].exportBox;

        throw this.NoSuchNameException.create({ name: name });
      },
      args: [
        'name'
      ]
    },
    {
      name: 'register',
      returns: 'foam.box.Box',
      code: function(name, service, localBox) {
        name = name || foam.next$UID();

        var exportBox = this.SubBox.create({ name: name, delegate: this.me });
        exportBox = service ? service.clientBox(exportBox) : exportBox;

        this.registry[name] = {
          exportBox: exportBox,
          localBox: service ? service.serverBox(localBox) : localBox
        };

        return this.registry[name].exportBox;
      },
      args: [ 'name', 'service', 'box' ]
    },
    {
      name: 'unregister',
      returns: '',
      code: function(name) {
        if ( foam.box.Box.isInstance(name) ) {
          for ( var key in this.registry ) {
            if ( this.registry[key] === name ) {
              delete this.registry[key];
              return;
            }
          }
          return;
        }

        delete this.registry[name];
      },
      args: [
        'name'
      ]
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'BoxRegistryBox',
  extends: 'foam.box.BoxRegistry',

  implements: [ 'foam.box.Box' ],

  requires: [
    'foam.box.SubBoxMessage',
    'foam.box.Message',
    'foam.box.HelloMessage',
    'foam.box.SkeletonBox'
  ],

  properties: [
    {
      name: 'registrySkeleton',
      factory: function() {
        return this.SkeletonBox.create({ data: this });
      }
    }
  ],

  methods: [
    {
      name: 'send',
      code: function(msg) {
        if ( this.SubBoxMessage.isInstance(msg.object) ) {
          var name = msg.object.name;

          if ( this.registry[name].localBox ) {
            // Unpack sub box object... is this right?
            msg.object = msg.object.object;
            this.registry[name].localBox.send(msg);
          } else {
            if ( msg.attributes.errorBox ) {
              msg.attributes.errorBox.send(
                this.Message.create({
                  object: this.NoSuchNameException.create({ name: name })
                }));
            }
          }
        } else if ( this.HelloMessage.isInstance(msg.object) ) {
        } else {
          this.registrySkeleton.send(msg);
        }
      }
    }
  ]
});


// TODO: Use ContextFactories to create these on demand.
foam.CLASS({
  package: 'foam.box',
  name: 'ClientBoxRegistry',

  properties: [
    {
      class: 'Stub',
      of: 'foam.box.BoxRegistry',
      name: 'delegate'
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'PromisedBoxRegistry',

  properties: [
    {
      class: 'Promised',
      of: 'foam.box.BoxRegistry',
      name: 'delegate'
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'LookupBox',
  extends: 'foam.box.ProxyBox',

  requires: [
    'foam.box.ClientBoxRegistry',
    'foam.box.LookupRetryBox'
  ],

  properties: [
    {
      name: 'name'
    },
    {
      name: 'parentBox'
    },
    {
      name: 'registry',
      transient: true,
      factory: function() {
        return this.ClientBoxRegistry.create({
          delegate: this.parentBox
        });
      }
    },
    {
      name: 'delegate',
      transient: true,
      factory: function() {
        return this.registry.doLookup(this.name)
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'NamedBox',

  implements: [ 'foam.box.Box' ],

  requires: [
    'foam.box.LookupBox',
  ],

  axioms: [
    foam.pattern.Multiton.create({ property: 'name' })
  ],

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      name: 'delegate',
      transient: true,
      factory: function() {
        // RetryBox(LookupBox(name, NamedBox(subName)))
        // TODO Add retry box
        return this.LookupBox.create({
          name: this.getBaseName(),
          parentBox: this.getParentBox()
        });
      }
    }
  ],

  methods: [
    function send(msg) {
      this.delegate.send(msg);
    },

    function getParentBox() {
      return this.cls_.create({
        name: this.name.substring(0, this.name.lastIndexOf('/'))
      }, this);
    },

    function getBaseName() {
      return this.name.substring(this.name.lastIndexOf('/') + 1);
    }
  ]
});


// Retry on local errors.
foam.CLASS({
  package: 'foam.box',
  name: 'RetryBox',

  properties: [
    'attempts',
    'errorBox',
    'delegate',
    'message',
    {
      name: 'maxAttempts',
      value: 3
    }
  ],
  methods: [
    function send(msg) {
      if ( this.attempts == this.maxAttempts ) {
        this.errorBox && this.errorBox.send(msg);
        return;
      }

      this.delegate.send(this.message);
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'ReplyBox',
  extends: 'foam.box.ProxyBox',

  imports: [
    'registry'
  ],

  properties: [
    {
      name: 'id',
      factory: function() {
        // TODO: Do these need to be long lived?
        // Someone could store a box for days and then use it
        // at that point the ID might no longer be valid.
        return foam.next$UID();
      }
    }
  ],

  methods: [
    function send(msg) {
      this.registry.unregister(this.id);
      this.delegate.send(msg);
    }
  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'FunctionBox',
  implements: ['foam.box.Box'],
  properties: [
    {
      class: 'Function',
      name: 'fn'
    }
  ],
  methods: [
    function send(m) {
      this.fn(m.object);
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'RPCReturnMessage',
  properties: [
    {
      class: 'Object',
      name: 'data'
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'SubscribeMessage',
  properties: [
    {
      name: 'topic'
    },
    {
      name: 'destination'
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'RPCReturnBox',

  implements: ['foam.box.Box'],

  requires: [
    'foam.box.RPCReturnMessage'
  ],

  properties: [
    {
      name: 'promise',
      factory: function() {
        return new Promise(function(resolve, reject) {
          this.resolve_ = resolve;
          this.reject_ = reject;
        }.bind(this));
      }
    },
    {
      name: 'resolve_'
    },
    {
      name: 'reject_'
    }
  ],

  methods: [
    function send(msg) {
      if ( this.RPCReturnMessage.isInstance(msg.object) ) {
        this.resolve_(msg.object.data);
        return;
      }
      this.reject_(msg.object);
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'RPCMessage',
  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'Array',
      name: 'args'
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'BaseClientDAO',
  extends: 'foam.dao.AbstractDAO',
  properties: [
    {
      class: 'Stub',
      of: 'foam.dao.DAO',
      name: 'delegate',
      methods: [
        'put',
        'remove',
        'removeAll',
        'select',
        'find'
      ]
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'DAOEvent',
  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'FObjectProperty',
      name: 'obj'
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'BoxDAOListener',
  implements: [
    'foam.dao.Sink'
  ],
  requires: [
    'foam.dao.DAOEvent'
  ],
  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.box.Box',
      name: 'box',
    }
  ],
  methods: [
    function put(obj) {
      this.box.send(this.DAOEvent.create({
        name: 'put', obj: obj
      }));
    },
    function remove(obj) {
      this.box.send(this.DAOEvent.create({
        name: 'remove', obj: obj
      }));
    },
    function reset() {
      this.box.send(this.DAOEvent.create({
        name: 'reset'
      }));
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'MergeBox',
  extends: 'foam.box.ProxyBox',
  properties: [
    {
      class: 'Int',
      name: 'delay',
      value: 100
    },
    {
      name: 'msg',
      transient: true
    },
    {
      class: 'Array',
      name: 'queue',
      transient: true
    }
  ],
  methods: [
    function send(m) {
      if ( ! this.timeout ) {
      }
    }
  ],
  listeners: [
    function doSend() {
      var queue = this.queue;
      this.queue = undefined;
      this.timeout = undefined;
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'ClientDAO',
  extends: 'foam.dao.BaseClientDAO',
  requires: [
    'foam.core.Serializable',
    'foam.dao.BoxDAOListener'
  ],
  methods: [
    function select(sink, skip, limit, order, predicate) {
      if ( ! this.Serializable.isInstance(sink) ) {
        var self = this;

        return this.SUPER(null, skip, limit, order, predicate).then(function(result) {
          var items = result.a;

          if ( ! sink ) return result;

          var sub = foam.core.FObject.create();
          var detached = false;
          sub.onDetach(function() { detached = true; });

          for ( var i = 0 ; i < items.length ; i++ ) {
            if ( detached ) break;

            sink.put(items[i], sub);
          }

          sink.eof();

          return sink;
        });
      }

      return this.SUPER(sink, skip, limit, order, predicate);
    },
    function listen(sink, predicate) {
      // TODO: This should probably just be handled automatically via a RemoteSink/Listener
      // TODO: Unsubscribe support.
      var id = foam.next$UID();
      var replyBox = this.__context__.registry.register(
        id,
        this.delegateReplyPolicy,
        {
          send: function(m) {
            switch(m.object.name) {
              case 'put':
              case 'remove':
                sink[m.object.name](null, m.object.obj);
              break;
              case 'reset':
                sink.reset(null);
            }
          }
        });

      this.SUPER(this.BoxDAOListener.create({
        box: replyBox
      }), predicate);
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'EventlessClientDAO',
  extends: 'foam.dao.AbstractDAO',

  properties: [
    {
      class: 'Stub',
      of: 'foam.dao.DAO',
      name: 'delegate',
      methods: [
        'put',
        'remove',
        'select',
        'removeAll',
        'find'
      ],
      eventProxy: false
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'PollingClientDAO',
  extends: 'foam.dao.ClientDAO',

  requires: [
    'foam.dao.ArraySink'
  ],

  methods: [
    function put(obj) {
      var self = this;
      return this.SUPER(obj).then(function(o) {
        self.on.put.pub(o);
        return o;
      });
    },

    function remove(obj) {
      var self = this;
      return this.SUPER(obj).then(function(o) {
        self.on.remove.pub(obj);
        return o;
      });
    },

    function removeAll(skip, limit, order, predicate) {
      this.SUPER(skip, limit, order, predicate);
      this.on.reset.pub();
    }
  ]
});


foam.CLASS({
  package :'foam.box',
  name: 'InvalidMessageException',

  properties: [
    'messageType'
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'EventMessage',

  properties: [
    {
      class: 'Array',
      name: 'args'
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'EventDispatchBox',

  implements: ['foam.box.Box'],

  requires: [
    'foam.box.EventMessage',
    'foam.box.InvalidMessageException'
  ],

  properties: [
    {
      name: 'target'
    }
  ],

  methods: [
    function send(msg) {
      if ( ! this.EventMessage.isInstance(msg.object) ) {
        throw this.InvalidMessageException.create({
          messageType: message.cls_.id
        });
      }

      this.target.pub.apply(this.target, msg.object.args);
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'SkeletonBox',

  requires: [
    'foam.box.Message',
    'foam.box.RPCMessage',
    'foam.box.RPCReturnMessage',
    'foam.box.InvalidMessageException'
  ],

  properties: [
    {
      name: 'data'
    }
  ],

  methods: [
    function call(message) {
      var p;

      try {
        p = this.data[message.object.name].apply(this.data, message.object.args);
      } catch(e) {
        message.attributes.errorBox && message.attributes.errorBox.send(this.Message.create({
          object: e
        }));

        return;
      }

      var replyBox = message.attributes.replyBox;

      var self = this;

      if ( p instanceof Promise ) {
        p.then(
          function(data) {
            replyBox.send(self.Message.create({
              object: self.RPCReturnMessage.create({ data: data })
            }));
          },
          function(error) {
            message.attributes.errorBox && message.attributes.errorBox.send(
              self.Message.create({
                object: error
              }));
          });
      } else {
        replyBox && replyBox.send(this.Message.create({
          object: this.RPCReturnMessage.create({ data: p })
        }));
      }
    },

    function send(message) {
      if ( this.RPCMessage.isInstance(message.object) ) {
        this.call(message);
        return;
      }

      throw this.InvalidMessageException.create({
        messageType: message.cls_ && message.cls_.id
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'NullBox',

  implements: ['foam.box.Box'],

  methods: [
    {
      name: 'send',
      code: function() {}
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'SocketBox',
  extends: 'foam.box.ProxyBox',

  requires: [
    'foam.box.SocketConnectBox'
  ],

  axioms: [
    foam.pattern.Multiton.create({
      property: 'address'
    })
  ],

  properties: [
    {
      name: 'address'
    },
    {
      name: 'delegate',
      factory: function() {
        return foam.box.SocketConnectBox.create({
          address: this.address
        }, this);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'SocketBox2',

  imports: [
    'socketService',
  ],

  axioms: [
    foam.pattern.Multiton.create({
      property: 'address'
    })
  ],

  properties: [
    {
      class: 'String',
      name: 'address'
    },
    {
      name: 'promise',
      transient: true,
      factory: function() {
      }
    }
  ],

  methods: [
    function send(m) {
    }
  ],

  listeners: [
    function onConnect() {
      this.socketService.addSocket(this);
      this.send(this.RegisterSelfMessage.create({
        name: this.me.name
      }));
      this.connect.pub();
    },
    function onError() {
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'SocketConnectBox',
  extends: 'foam.box.PromisedBox',

  requires: [
    'foam.net.node.Socket',
    'foam.box.RawSocketBox'
  ],

  properties: [
    {
      name: 'address'
    },
    {
      name: 'delegate',
      factory: function() {
        return this.Socket.create().connectTo(this.address).then(function(s) {
          return this.RawSocketBox.create({ socket: s });
        }.bind(this));
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'RawSocketBox',

  properties: [
    'socket'
  ],

  methods: [
    function send(msg) {
      this.socket.write(msg);
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'SendFailedError',
  extends: 'foam.box.Message',

  properties: [
    {
      name: 'original'
    },
    {
      name: 'error'
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'RegisterSelfMessage',
  extends: 'foam.box.Message',

  properties: [
    {
      class: 'String',
      name: 'name'
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'RawWebSocketBox',

  properties: [
    'socket'
  ],

  methods: [
    function send(msg) {
      try {
        this.socket.send(msg);
      } catch(e) {
        if ( msg.errorBox ) msg.errorBox.send(foam.box.SendFailedError.create());
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'RawMessagePortBox',
  implements: [ 'foam.box.Box' ],
  properties: [
    {
      name: 'port'
    }
  ],
  methods: [
    function send(m) {
      this.port.postMessage(foam.json.Network.stringify(m));
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'WebSocketBox',

  requires: [
    'foam.net.web.WebSocket',
    'foam.box.Message',
    'foam.box.RegisterSelfMessage'
  ],

  imports: [
    'webSocketService',
    'me'
  ],

  axioms: [
    foam.pattern.Multiton.create({
      property: 'uri'
    })
  ],

  properties: [
    {
      name: 'uri',
    },
    {
      name: 'socket',
      factory: function() {
        var ws = this.WebSocket.create({ uri: this.uri });

        return ws.connect().then(function(ws) {

          ws.disconnected.sub(function(sub) {
            sub.detach();
            this.socket = undefined;
          }.bind(this));

          ws.send(this.Message.create({
            object: this.RegisterSelfMessage.create({ name: this.me.name })
          }));

          this.webSocketService.addSocket(ws);

          return ws;
        }.bind(this));
      }
    }
  ],

  methods: [
    function send(msg) {
      this.socket.then(function(s) {
        try {
          s.send(msg);
        } catch(e) {
          this.socket = undefined;
          if ( msg.errorBox ) {
            msg.errorBox.send(foam.box.SendFailedError.create());
          }
        }
      }.bind(this), function(e) {
        if ( msg.errorBox ) {
          msg.errorBox.send(e);
        }
        this.socket = undefined;
      }.bind(this));
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'Context',

  requires: [
    'foam.box.BoxRegistryBox',
    'foam.box.NamedBox'
  ],

  exports: [
    'messagePortService',
    'socketService',
    'webSocketService',
    'registry',
    'root',
    'me'
  ],

  properties: [
    {
      name: 'messagePortService',
      hidden: true,
      factory: function() {
        var model = foam.lookup('foam.messageport.MessagePortService', true);
        if ( model ) {
          return model.create({
            delegate: this.registry
          }, this);
        }
      }
    },
    {
      name: 'socketService',
      hidden: true,
      factory: function() {
        var model = foam.lookup('foam.net.node.SocketService', true);
        if ( model ) {
          return model.create({
            delegate: this.registry
          }, this);
        }
      }
    },
    {
      name: 'webSocketService',
      hidden: true,
      factory: function() {
        var model = foam.lookup('foam.net.node.WebSocketService', true) ||
            foam.lookup('foam.net.web.WebSocketService', true);

        if ( model ) {
          return model.create({
            delegate: this.registry
          }, this);
        }
      }
    },
    {
      name: 'registry',
      hidden: true,
      factory: function() {
        return this.BoxRegistryBox.create();
      }
    },
    {
      name: 'root',
      hidden: true,
      postSet: function(_, root) {
        foam.box.NamedBox.create({ name: '' }).delegate = root;
      }
    },
    {
      class: 'String',
      name: 'myname',
      hidden: true,
    },
    {
      name: 'me',
      hidden: true,
      factory: function() {
        var me = this.NamedBox.create({
          name: this.myname || ( '/com/foamdev/anonymous/' + foam.uuid.randomGUID() )
        });
        me.delegate = this.registry;
        return me;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'BoxService',

  properties: [
    {
      class: 'Class',
      name: 'server'
    },
    {
      class: 'Class',
      name: 'client'
    }
  ],

  methods: [
    function serverBox(box) {
      box = this.next ? this.next.serverBox(box) : box;
      return this.server.create({ delegate: box })
    },

    function clientBox(box) {
      box = this.client.create({ delegate: box });
      return this.next ?
        this.next.clientBox(box) :
        box;
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'HTTPReplyBox',
  implements: ['foam.box.Box'],

  imports: [
    // Optional import.
    //    'httpResponse'
  ],

  methods: [
    {
      name: 'send',
      code: function(m) {
        throw 'unimplemented';
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'AuthenticatedBox',
  extends: 'foam.box.ProxyBox',

  imports: [
    'idToken'
  ],

  methods: [
    function send(m) {
      m.attributes.idToken = this.idToken;
      this.SUPER(m);
    }
  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'CheckAuthenticationBox',
  extends: 'foam.box.ProxyBox',

  imports: [
    'tokenVerifier'
  ],

  methods: [
    {
      name: 'send',
      code: function send() {
        throw new Error('Unimplemented.');
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'HTTPBox',

  implements: ['foam.box.Box'],

  requires: [
    'foam.net.web.HTTPRequest'
  ],

  imports: [
    'me'
  ],

  properties: [
    {
      name: 'url'
    },
    {
      name: 'method'
    }
  ],

  classes: [
    {
      name: 'JSONOutputter',
      extends: 'foam.json.Outputer',
      requires: [
        'foam.box.HTTPReplyBox'
      ],
      imports: [
        'me'
      ],
      methods: [
        function output(o) {
          if ( o === this.me ) {
            return this.SUPER(this.HTTPReplyBox.create());
          }
          return this.SUPER(o);
        }
      ]
    }
  ],

  methods: [
    {
      name: 'send',
      code: function(msg) {
        var outputter = this.JSONOutputter.create().copyFrom(foam.json.Network);

        var req = this.HTTPRequest.create({
          url: this.url,
          method: this.method,
          payload: outputter.stringify(msg)
        }).send();

        req.then(function(resp) {
          return resp.payload;
        }).then(function(p) {
          this.me.send(foam.json.parseString(p, this));
        }.bind(this));
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'MessagePortBox',
  extends: 'foam.box.ProxyBox',
  requires: [
    'foam.box.RawMessagePortBox',
    'foam.box.RegisterSelfMessage',
    'foam.box.Message'
  ],
  imports: [ 'messagePortService', 'me' ],
  properties: [
    {
      name: 'target'
    },
    {
      name: 'delegate',
      factory: function() {
	var channel = new MessageChannel();
	this.messagePortService.addPort(channel.port1);

	this.target.postMessage('', '*', [channel.port2]);

        channel.port1.postMessage(foam.json.Network.stringify(this.Message.create({
          object: this.RegisterSelfMessage.create({ name: this.me.name })
        })));

	return this.RawMessagePortBox.create({ port: channel.port1 });
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'ForwardedMessage',
  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.box.Box',
      name: 'destination'
    },
    {
      class: 'FObjectProperty',
      name: 'payload'
    }
  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'ForwardBox',
  extends: 'foam.box.ProxyBox',
  requires: [
    'foam.box.ForwardedMessage'
  ],
  properties: [
    {
      name: 'destination'
    }
  ],
  methods: [
    function send(m) {
      m.object = this.ForwardedMessage.create({
        destination: this.destination,
        payload: m.object
      });
      this.SUPER(m);
    }
  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'ForwardingBox',
  implements: [ 'foam.box.Box' ],
  requires: [
    'foam.box.ForwardedMessage'
  ],
  methods: [
    function send(m) {
      if ( ! this.ForwardedMessage.isInstance(m.object) ) throw foam.box.InvalidMessageException.create();

      var wrapper = m.object;
      m.object = wrapper.payload;

      wrapper.destination.describe();


      wrapper.destination.send(m);
    }
  ]
});
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
Async functions compose other asynchronous functions that return promises.

<p>One key to using these functions is to note that they return a function
that does the real work, so calling foam.async.sequence(myFuncArray),
for instance, doesn't create a promise or call any of the functions passed
to it. It instead sets up and returns a function that will return a promise
and evaluate arguments as needed.

<p>To use the returned function, pass it to a Promise.then call:
<pre>Promise.resolve().then(foam.async.sequence( [ fn1, fn2 ] ));</pre>
<p>Or create a new promise:
<pre>var p = new Promise(foam.async.sequence( [ fn1, fn2 ] ));</pre>

<p>Async functions can also be nested:
<pre>
var seq = foam.async.sequence([
  foam.async.log("Starting..."),
  foam.async.repeat(10, foam.async.sequence([
    function(i) { console.log("iteration", i); }),
    foam.async.sleep(1000)
  ])
]);
Promise.resolve().then(seq).then(foam.async.log("Done!"));
</pre>
 */
foam.LIB({
  name: 'foam.async',

  methods: [
    function sequence(s) {
      /** Takes an array of functions (that may return a promise) and runs
        them one after anther. Functions that return a promise will have that
        promise chained, such that the next function will not run until the
        previous function's returned promise is resolved.

        <p>Errors are not handled, so chain any desired error handlers
        onto the promise returned.

        <p>You can use sequence's returned function directly in a then call:
        <pre>promise.then(foam.async.sequence(...));</pre>
        <p>Or call it directly:
        <pre>(foam.async.sequence(...))().then(...);</pre>

        @param {Array} s An array of functions that return Promises
        @returns {Function}  A function that returns a promise that will
                       resolve after the last function's return is resolved.
      */
      return function() {
        if ( ! s.length ) return Promise.resolve();

        var p = Promise.resolve();
        for ( var i = 0; i < s.length; ++i ) {
          p = p.then(s[i]);
        }
        return p;
      }
    },

    function repeat(times, fn) {
      /** Takes a function (that may return a promise) and runs it multiple
        times. A function that returns a promise will have that
        promise chained, such that the next call will not run until the
        previous call's returned promise is resolved. The function passed in
        will be called with one argument, the number of the iteration, from
        0 to times - 1.

        <p>Errors are not handled, so chain any desired error handlers
        onto the promise returned.

        <p>You can use repeat's returned function directly in a then call:
        <pre>promise.then(foam.async.repeat(...));</pre>
        <p>Or call it directly:
        <pre>(foam.async.repeat(...))().then(...);</pre>

        @param {Number} times number of times to repeat in sequence.
        @param {Function} fn Function that returns a Promise.
        @returns {Function}  A function that returns a Promise that will resolve
                       after the last repetition's return resolves.
      */
      return function() {
        var p = Promise.resolve();
        var n = 0;
        for ( var i = 0; i < times; ++i ) {
          p = p.then(function() { return fn(n++); });
        }
        return p;
      };
    },

    /**
      Takes a function (that may return a promise) and runs it multiple
      times in parallel. A function that returns a promise will have that
      promise chained, such that the entire group will not resolve until
      all returned promises have resolved (as in the standard Promise.all);
      The function passed in
      will be called with one argument, the number of the iteration, from
      0 to times - 1.

      <p>Errors are not handled, so chain any desired error handlers
      onto the promise returned.

      <p>You can use repeatParallel's returned function directly in a then call:
      <pre>promise.then(foam.async.repeatParallel(...));</pre>
      <p>Or call it directly:
      <pre>(foam.async.repeatParallel(...))().then(...);</pre>


      @param {Number} times number of times to repeat in sequence.
      @param {Function} fn Function that returns a Promise.
      @returns {Function}  A function that returns a Promise that will resolve
                   after every repetition's return resolves
    */
    function repeatParallel(times, fn) {
      return function() {
        var promises = [];
        for ( var i = 0; i < times; ++i ) {
          promises[i] = fn(i); // TODO: what if not returned a promise?
        }
        return Promise.all(promises);
      };
    },

    function log() {
      /** Returns a function you can pass to a .then call, or other foam.async
        functions. Takes variable arguments that are passed to console.log. */
      var args = arguments;
      return function() {
        console.log.apply(console, args);
        return Promise.resolve();
      };
    },

    function sleep(/* Number */ time) {
      /** Returns a function that returns a promise that delays by the given
        time before resolving. */
      return function() {
        return new Promise(function(resolve, reject) {
          setTimeout(function() { resolve(); }, time);
        });
      };
    }
  ]
});
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

foam.CLASS({
  package: 'foam.u2',
  name: 'ViewFactory',
  extends: 'foam.core.Property',

  documentation: 'Set a ViewFactory to be a string containing a class name, ' +
      'a Class object, or a factory function(args, context). this.myFactory ' +
      'is the original value, but you can call this.myFactory$f(args, ctx) ' +
      'to create an instance. Useful for rowViews and similar.',

  methods: [
    function installInProto(proto) {
      this.SUPER(proto);

      var name = this.name;

      proto[name + '$f'] = function(args, ctx) {
        console.warn('Deprecated use of ViewFactory; use ViewSpec instead!');
        ctx = ctx || this;
        var raw = this[name];

        if ( typeof raw === 'function' ) {
          return raw.call(this, args, ctx);
        }

        if ( typeof raw === 'string' ) {
          return ctx.lookup(raw).create(args, ctx);
        }

        return raw.create(args, ctx);
      };
    }
  ]
});
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

foam.CLASS({
  package: 'foam.u2',
  name: 'DAOList',
  extends: 'foam.u2.Element',

  topics: [ 'rowClick' ],

  exports: [
    'selection',
    'hoverSelection'
  ],

  imports: [
    'editRecord?',
    'selection? as importSelection'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
    },
    {
      name: 'rowView'
    },
    {
      // deprecated
      class: 'foam.u2.ViewFactory',
      name: 'rowFactory'
    },
    'selection',
    'hoverSelection'
  ],

  methods: [
    function initE() {
      var view = this;
      this.
        select(this.data$proxy, function(obj) {
          return this.E().
            start(this.rowView || this.rowFactory$f({data: obj}), {data: obj}).
              on('mouseover', function() { view.hoverSelection = obj; }).
              on('click', function() {
                view.selection = obj;
                if ( view.importSelection$ ) view.importSelection = obj;
                if ( view.editRecord$ ) view.editRecord(obj);
                view.rowClick.pub(obj)
              }).
              addClass(this.slot(function(selection) {
                if ( obj === selection ) return view.myClass('selected');
                  return '';
                }, view.selection$)
              ).
            end();
        });
    }
  ]
});

foam.CLASS({
  refines: 'foam.dao.RelationshipDAO',

  requires: [
    'foam.u2.CitationView',
    'foam.u2.DAOList'
  ],

  methods: [
    function toE(args, ctx) {
      args = args || {};
      args.data = this;
      args.rowView = this.CitationView;
      return this.DAOList.create(args, ctx);
    }
  ]

})
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

foam.CLASS({
  package: 'foam.u2',
  name: 'TableCellPropertyRefinement',
  refines: 'foam.core.Property',
  properties: [
    {
      name: 'columnLabel',
      factory: function() {
        return this.label;
      }
    },
    {
      name: 'tableCellView',
      value: function(obj) {
        return obj[this.name];
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'TableCellActionRefinement',
  refines: 'foam.core.Action',
  properties: [
    {
      class: 'String',
      name: 'columnLabel'
    },
    {
      name: 'tableCellView',
      value: function(obj, e) {
        //       return foam.u2.ActionView.create({action: this, data: obj});

        return this.toE(null, e.__subContext__.createSubContext({data: obj}));
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'TableBody',
  extends: 'foam.u2.Element',

  requires: [
    // TODO(braden): This should implement Expressions instead.
    'foam.mlang.predicate.And',
    'foam.mlang.predicate.Eq',
    'foam.mlang.predicate.Not',
    'foam.mlang.predicate.Or',
    'foam.u2.CheckBox',
    'foam.u2.TableCellRefinement'
  ],

  imports: [
    'selectionQuery', // Optional. Installed by the TableSelection decorator.
    'tableView'
  ],

  properties: [
    [ 'nodeName', 'tbody' ],
    [ 'columns_' ],
    'selectionFeedback_',
    {
      name: 'rows_',
      factory: function() { return {}; }
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.on('click', function(event) {
        var me = self.el();
        var e = event.target;
        while ( e.nodeName !== 'TR' && e !== me ) {
          e = e.parentNode;
        }

        // If we managed to click between rows, do nothing.
        if ( e === me ) return;
        // Otherwise, we found the tr.
        var obj = self.rows_[e.id];
        if ( obj ) self.tableView.selection = obj;
      });
    },

    function addObj(obj) {
      var e = this.start('tr')
          .enableClass(this.tableView.myClass('selected'),
              this.tableView.selection$.map(function(sel) {
                return sel === obj;
              }));

      if ( this.selectionQuery$ ) {
        var cb;
        e.start('td')
            .start(this.CheckBox).call(function() { cb = this; }).end()
        .end();

        this.selectionQuery$.sub(foam.Function.bind(this.selectionUpdate, this,
            cb, obj));
        this.selectionUpdate(cb, obj);
        cb.data$.sub(foam.Function.bind(this.selectionClick, this, obj));
      }

      for ( var j = 0 ; j < this.columns_.length ; j++ ) {
        var prop = this.columns_[j];
        e = e.start('td').add(prop.tableCellView(obj, e)).end();
      }
      e.end();
      this.rows_[e.id] = obj;
    }
  ],

  listeners: [
    {
      name: 'selectionUpdate',
      code: function(checkbox, obj) {
        var selected = this.selectionQuery.f(obj);
        if ( selected !== checkbox.data ) {
          // Need to prevent feedback between these two listeners.
          this.selectionFeedback_ = true;
          checkbox.data = selected;
          this.selectionFeedback_ = false;
        }
      }
    },
    {
      name: 'selectionClick',
      code: function(obj, _, __, ___, slot) {
        if ( this.selectionFeedback_ ) return;

        var q = this.Eq.create({ arg1: obj.ID, arg2: obj.id });
        if ( slot.get() ) {
          this.selectionQuery = this.Or.create({
            args: [ q, this.selectionQuery ]
          }).partialEval();
        } else {
          this.selectionQuery = this.And.create({
            args: [ this.Not.create({ arg1: q }), this.selectionQuery ]
          }).partialEval();
        }
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'TableBodySink',
  extends: 'foam.dao.AbstractSink',

  requires: [
    'foam.u2.TableBody'
  ],

  properties: [
    'columns_',
    {
      name: 'body',
      factory: function() { return this.TableBody.create({ columns_: this.columns_ }); }
    }
  ],
  methods: [
    function put(obj) {
      this.body.addObj(obj);
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'TableHeader',
  extends: 'foam.u2.Element',

  requires: [
    'foam.mlang.order.Desc',
    'foam.u2.Entity'
  ],

  imports: [
    'selectionQuery', // Optional. Exported by TableSelection.
    'tableView'
  ],

  properties: [
    {
      name: 'columns_',
      required: true
    },
    'sortOrder'
  ],

  methods: [
    function initE() {
      var self = this;
      this.nodeName = 'thead';

      var e = this.start('tr');
      if ( this.selectionQuery$ ) {
        e.tag('td');
      }

      for ( var i = 0 ; i < this.columns_.length ; i++ ) {
        var sorting$ = this.sortOrder$.map(function(prop, order) {
          if ( ! order ) return '';
          var desc = this.Desc.isInstance(order);
          var baseOrder = desc ? order.arg1 : order;
          return prop.name === baseOrder.name ?
              this.Entity.create({ name: desc ? 'darr' : 'uarr' }) : '';
        }.bind(this, this.columns_[i]));

        e.start('td')
            .enableClass(this.myClass('sorting'), sorting$)
            .start('span')
                .addClass(this.myClass('sort-direction'))
                .add(sorting$)
            .end()
            .add(this.columns_[i].columnLabel)
            .on('click', this.tableView.sortBy.bind(this.tableView,
                  this.columns_[i]))
            .end();
      }
      e.end();
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'TableView',
  extends: 'foam.u2.Element',

  requires: [
    'foam.mlang.order.Desc',
    'foam.u2.TableBodySink',
    'foam.u2.TableHeader'
  ],

  exports: [
    'as tableView'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^sorting {
          font-weight: bold;
        }

        ^sort-direction {
          display: none;
          margin-right: 8px;
        }
        ^sorting ^sort-direction {
          display: initial;
        }
      */}
    })
  ],

  properties: [
    {
      class: 'Class',
      name: 'of',
      factory: function() { return this.data.of; }
    },
    [ 'nodeName', 'table' ],
    {
      name: 'columns_',
      expression: function(columns, of) {
        var cls = this.of;
        return columns.map(function(p) {
          // Lookup String values as Axiom names, otherwise,
          // treat the object as the column object itself.
          return typeof p === 'string' ?
              cls.getAxiomByName(p) :
              p ;
        });
      }
    },
    {
      // TODO: remove when all code ported
      name: 'properties',
      setter: function(_, ps) {
        console.warn("Deprecated use of TableView.properties. Use 'columns' instead.");
        this.columns = ps;
      }
    },
    {
      name: 'columns',
      expression: function(of) {
        if ( ! this.of ) return [];

        var tableColumns = this.of.getAxiomByName('tableColumns');

        if ( tableColumns ) return tableColumns.columns;

        return this.of.getAxiomsByClass(foam.core.Property)
            .filter(function(p) { return ! p.hidden; })
            .map(foam.core.Property.NAME.f);
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
    },
    {
      name: 'header',
      expression: function(columns_) {
        return this.TableHeader.create({
          columns_: columns_,
          sortOrder$: this.sortOrder$
        });
      }
    },
    {
      name: 'body',
      factory: function() { return this.E('tbody'); }
    },
    {
      name: 'sortOrder'
    },
    {
      name: 'selection'
    }
  ],

  methods: [
    function initE() {
      this.onDAOUpdate();
      this.data$proxy.sub('on', this.onDAOUpdate);

      return this.
          addClass(this.myClass()).
          add(this.header$, this.body$);
    },

    function sortBy(prop) {
      // Two cases: same as the current prop, or different.
      var sortName = this.sortOrder ?
          (this.Desc.isInstance(this.sortOrder) ? this.sortOrder.arg1.name :
              this.sortOrder.name) :
          '';
      if ( sortName === prop.name ) {
        // Invert the previous order.
        this.sortOrder = this.Desc.isInstance(this.sortOrder) ?
            prop : this.Desc.create({ arg1: prop });
      } else {
        // Set it to the new column.
        this.sortOrder = prop;
      }
      this.onDAOUpdate();
    }
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        var dao = this.data;
        if ( this.sortOrder ) {
          dao = dao.orderBy(this.sortOrder);
        }
        dao.select(this.TableBodySink.create({
          columns_: this.columns_
        })).then(function(a) {
          this.body = a.body;
        }.bind(this));
      }
    }
  ]
});
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

foam.CLASS({
  package: 'foam.u2',
  name: 'TableSelection',
  extends: 'foam.u2.Element',

  requires: [
    'foam.dao.ArraySink',
    'foam.mlang.predicate.False',
    'foam.mlang.predicate.In',
    'foam.mlang.predicate.Or',
    'foam.mlang.predicate.Not',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.Map',
    'foam.u2.TableView'
  ],

  imports: [
    'unfilteredDAO'
  ],

  exports: [
    'bulkActions',
    'selectionQuery'
  ],

  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( this.daoSub_ ) {
          this.daoSub_.detach();
          this.daoSub_ = null;
        }
        if ( nu ) this.daoSub_ = nu.on.sub(this.updateCounts);
        this.updateCounts();
      }
    },
    'daoSub_',
    {
      class: 'Class',
      name: 'of',
      expression: function(data) { return data.of; }
    },
    {
      name: 'selectionQuery',
      factory: function() { return this.False.create(); }
    },
    'filteredCount_',
    'totalCount_',
    {
      class: 'String',
      name: 'selectionText_',
      expression: function(filteredCount_, totalCount_) {
        if ( ! totalCount_ ) return '';
        var s = (totalCount_ || '0') + ' selected';
        if ( totalCount_ !== filteredCount_ ) {
          s += ' (' + (filteredCount_ || '0') + ' shown)';
        }
        return s;
      }
    },
    'selectAllState',
    {
      class: 'FObjectArray',
      of: 'Action',
      name: 'bulkActions'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'view',
      value: { class: 'foam.u2.TableView' }
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.start()
          .start('div')
              .add('Select')
              .start('a')
                  .attrs({ href: 'javascript:' })
                  .on('click', this.selectAll)
                  .addClass(this.myClass('link'))
                  .add('All')
              .end()
              .start('a')
                  .attrs({ href: 'javascript:' })
                  .on('click', this.selectNone)
                  .addClass(this.myClass('link'))
                  .add('None')
              .end()
          .end()
          .start('span').add(this.selectionText_$).end()
          .start()
              .addClass(this.myClass('actions'))
              .add(this.bulkActions)
          .end()
      .end()
      .start(this.view, {
        of: this.of,
        data$: this.data$
      }).end();

      this.selectionQuery$.sub(this.updateCounts);
    }
  ],

  listeners: [
    {
      name: 'selectNone',
      isFramed: true,
      code: function() {
        this.selectionQuery = this.False.create();
      }
    },
    {
      name: 'selectAll',
      isFramed: true,
      code: function() {
        var self = this;
        this.data.select(this.Map.create({
          arg1: this.of.ID,
          delegate: this.ArraySink.create()
        })).then(function(array) {
          var q = self.In.create({
            arg1: self.of.ID,
            arg2: array.delegate.a
          });

          self.selectionQuery = self.Or.create({
            args: [ self.selectionQuery, q ]
          }).partialEval();
        });
      }
    },
    {
      name: 'updateCounts',
      isFramed: true,
      code: function() {
        var self = this;
        this.unfilteredDAO.where(this.selectionQuery)
            .select(this.Count.create())
            .then(function(c) { self.totalCount_ = c.value; });
        this.data.where(this.selectionQuery)
            .select(this.Count.create())
            .then(function(c) { self.filteredCount_ = c.value; });
      }
    }
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^link {
          color: #00c;
          margin: 0 8px;
          text-decoration: none;
        }
      */}
    })
  ]
});
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

foam.CLASS({
  package: 'foam.u2',
  name: 'Scroller',
  extends: 'foam.u2.Element',

  /**
   * Wraps a TableView or similar and adds a ScrollView to it.
   * Configure the table view with the tableView property, and the scrollbar
   * with the scrollView property.
   * Set data to the DAO, and the tableView will receive that DAO with skip
   * applied correctly.
   *
   * This view needs to know the size of its container, in order to size the
   * tableView and scrollbar accordingly. Therefore it needs a fixed row height
   * to use for the table. Set rowHeight to the number of pixels per row.
   */
  requires: [
    'foam.graphics.Canvas',
    'foam.graphics.ScrollCView',
    'foam.mlang.sink.Count',
    'foam.u2.TableView',
    'foam.u2.ViewSpec'
  ],

  imports: [
    'window'
  ],

  properties: [
    {
      name: 'of',
      expression: function(data) { return data.of; }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'data',
      required: true
    },
    {
      class: 'Int',
      name: 'rowHeight',
      value: 36
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'tableView',
      value: { class: 'foam.u2.TableView' }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'scrollView',
      value: { class: 'foam.graphics.ScrollCView' }
    },
    {
      /** The actual TableView instance. */
      name: 'table'
    },
    {
      /** The actual ScrollCView instance. */
      name: 'scrollBar'
    },
    'scrollValue_',
    'scrollHeight_',
    'scrollExtent_',
    'pointer'
  ],

  methods: [
    function initE() {
      var self = this;

      this.data$proxy.sub('on', this.onDAOUpdate);
      this.onDAOUpdate();

      this.scrollBar = this.createChild_(this.scrollView, {
        value$: this.scrollValue_$,
        extent$: this.scrollExtent_$,
        height$: this.scrollHeight_$
      });

      this.addClass(this.myClass())
          .start()
              .addClass(this.myClass('container'))
              .call(function() { self.table = this; })
              .start(this.tableView, {
                of: this.of,
                data$: this.slot(function(dao, extent, value) {
                  return dao.limit(extent).skip(value);
                }, this.data$, this.scrollExtent_$, this.scrollValue_$)
              }).end()
          .end()
          .start(this.Canvas)
              .attrs({ height: this.scrollHeight_$ })
              .call(function() { this.cview = self.scrollBar; })
          .end()
          .on('wheel', function(e) {
            var negative = e.deltaY < 0;
            // Convert to rows, rounding up. (Therefore minumum 1.)
            var rows = Math.ceil(Math.abs(e.deltaY) / self.rowHeight);
            self.scrollValue_ += negative ? -rows : rows;
          });

      this.onload.sub(function() {
        self.onResize();
        self.window.addEventListener('resize', self.onResize);
      });
      this.onunload.sub(function() {
        self.window.removeEventListener('resize', self.onResize);
      });
    }
  ],

  listeners: [
    {
      name: 'onResize',
      isFramed: true,
      code: function() {
        if ( ! this.el() ) return;

        // Determine the height of the table's space.
        var height = this.el().getBoundingClientRect().height;
        this.scrollHeight_ = height;
        this.scrollExtent_ = Math.floor(height / this.rowHeight);
      }
    },
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        var self = this;
        this.data.select(this.Count.create()).then(function(c) {
          self.scrollBar.size = c.value;
        });
      }
    }
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          display: flex;
          flex-grow: 1;
          overflow: hidden;
        }
        ^container {
          flex-grow: 1;
          overflow-x: auto;
          overflow-y: hidden;
        }
        ^ canvas {
          align-self: flex-start;
          flex-grow: 0;
          flex-shrink: 0;
        }
      */}
    })
  ]
});
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

foam.CLASS({
  package: 'foam.u2',
  name: 'ActionView',
  extends: 'foam.u2.Element',

  documentation: 'A button View for triggering Actions.',

  axioms: [
    foam.u2.CSS.create({code: function() {/*
      ^ button {
        -webkit-box-shadow: inset 0 1px 0 0 #ffffff;
        box-shadow: inset 0 1px 0 0 #ffffff;
        background: -webkit-gradient( linear, left top, left bottom, color-stop(0.05, #ededed), color-stop(1, #dfdfdf) );
        background: -moz-linear-gradient( center top, #ededed 5%, #dfdfdf 100% );
        background-color: #ededed;
        -moz-border-radius: 3px;
        -webkit-border-radius: 3px;
        border-radius: 3px;
        border: 1px solid #dcdcdc;
        display: inline-block;
        color: #777777;
        font-family: Arial;
        font-size: 12px;
        font-weight: bold;
        margin: 2px;
        padding: 4px 16px;
        text-decoration: none;
      }

      ^unavailable {
        visibility: hidden;
      }

      ^:hover {
        background: -webkit-gradient( linear, left top, left bottom, color-stop(0.05, #dfdfdf), color-stop(1, #ededed) );
        background: -moz-linear-gradient( center top, #dfdfdf 5%, #ededed 100% );
        background-color: #dfdfdf;
      }

      ^ img {
        vertical-align: middle;
      }

      ^:disabled { color: #bbb; -webkit-filter: grayscale(0.8); }
    */}})
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'showLabel',
      value: true
    },
    {
      class: 'URL',
      name: 'icon',
      factory: function(action) { return this.action.icon; }
    },
    'data',
    'action',
    [ 'nodeName', 'button' ],
    {
      name: 'label',
      factory: function(action) { return this.action.label; }
    }
  ],

  methods: [
    function initE() {
      this.initCls();

      this.
        on('click', this.click);

      if ( this.icon ) {
        // this.nodeName = 'a';
        this.start('img').attr('src', this.icon).end();
      }
      if ( this.showLabel )
        this.add(this.label$);

      if ( this.action ) {
        if ( this.action.isAvailable ) {
          this.enableClass(this.myClass('unavailable'), this.action.createIsAvailable$(this.data$), true);
        }

        if ( this.action.isEnabled ) {
          this.attrs({disabled: this.action.createIsEnabled$(this.data$).map(function(e) { return e ? false : 'disabled'; })});
        }
      }
    },

    function initCls() {
      this.addClass(this.myClass());
    }
  ],

  listeners: [
    function click(e) {
      this.action && this.action.maybeCall(this.__subContext__, this.data);
      e.stopPropagation();
    }
  ]
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.u2',
  name: 'DetailPropertyView',
  extends: 'foam.u2.Element',

  documentation: 'View for one row/property of a DetailView.',

  properties: [
    'prop',
    [ 'nodeName', 'tr' ]
  ],

  axioms: [
    foam.u2.CSS.create({code: `
      .foam-u2-PropertyView-label {
        color: #444;
        display: block;
        float: left;
        font-size: 13px;
        padding: 2px 8px 2px 6px;
        text-align: right;
        vertical-align: top;
      }
      .foam-u2-PropertyView-view {
        padding: 2px 8px 2px 6px;
      }
      .foam-u2-PropertyView-units  {
        color: #444;
        font-size: 12px;
        padding: 4px;
        text-align: right;
      }
    `})
  ],

  methods: [
    function initE() {
      var prop = this.prop;

      // TODO: hide this element if the prop changes it's mode to HIDDEN.
      this.
        addClass('foam-u2-PropertyView').
        start('td').addClass('foam-u2-PropertyView-label').add(prop.label).end().
        start('td').addClass('foam-u2-PropertyView-view').add(
          prop,
          prop.units && this.E('span').addClass('foam-u2-PropertyView-units').add(' ', prop.units)).
        end();
    }
  ]
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.u2',
  name: 'DetailView',
  extends: 'foam.u2.View',

  documentation: 'A generic property-sheet style View for editing an FObject.',

  requires: [
    'foam.core.Property',
    'foam.u2.DetailPropertyView'
  ],

  exports: [
    'currentData as data',
    'controllerMode'
  ],

  axioms: [
    foam.pattern.Faceted.create()
  ],

  properties: [
    {
      name: 'data',
      attribute: true,
      preSet: function(_, data) {
        var of = data && data.cls_;
        if ( of !== this.of ) {
          this.of = of;
        } else {
          this.currentData = data;
        }
        return data;
      }
    },
    'currentData',
    {
      class: 'Class',
      name: 'of'
    },
    {
      class: 'Boolean',
      name: 'showActions'
    },
    {
      name: 'properties',
      // TODO: Make an FObjectArray when it validates properly
      preSet: function(_, ps) {
        foam.assert(ps, 'Properties required.');
        for ( var i = 0 ; i < ps.length ; i++ ) {
          foam.assert(
              foam.core.Property.isInstance(ps[i]),
              "Non-Property in 'properties' list:",
              ps);
        }
        return ps;
      },
      expression: function(of) {
        if ( ! of ) return [];
        return this.of.getAxiomsByClass(foam.core.Property).
          // TODO: this is a temporary fix, but Visibility.HIDDEN should be included and could be switched
          filter(function(p) { return ! ( p.hidden || p.visibility === foam.u2.Visibility.HIDDEN ); });
      }
    },
    {
      name: 'config'
      // Map of property-name: {map of property overrides} for configuring properties
      // values include 'label', 'units', and 'view'
    },
    {
      name: 'actions',
      expression: function(of) {
        return this.of.getAxiomsByClass(foam.core.Action);
      }
    },
    {
      name: 'title',
      attribute: true,
      expression: function(of) { return this.of ? this.of.model_.label : ''; },
      // documentation: function() {/*
      //  <p>The display title for the $$DOC{ref:'foam.ui.View'}.
      //  </p>
      //*/}
    },
    [ 'nodeName', 'div' ]
  ],

  templates: [
    function CSS() {/*
      ^ {
        background: #fdfdfd;
        border: solid 1px #dddddd;
        box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
        display: inline-block;
        margin: 5px;
        padding: 3px;
      }
      ^ table {
        padding-bottom: 2px;
      }
      ^title {
        color: #333;
        float: left;
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 8px;
        padding: 2px;
      }
      ^toolbar {
        margin-left: 5px;
      }
      ^ input {
        border: solid 1px #aacfe4;
        font-size: 10px;
        margin: 2px 0 0px 2px;
        padding: 4px 2px;
      }
      ^ textarea {
        border: solid 1px #aacfe4;
        float: left;
        font-size: 10px;
        margin: 2px 0 0px 2px;
        overflow: auto;
        padding: 4px 2px;
        width: 98%;
      }
      ^ select {
        border: solid 1px #aacfe4;
        font-size: 10px;
        margin: 2px 0 0px 2px;
        padding: 4px 2px;
      }
    */}
  ],

  methods: [
    function initE() {
      var self = this;
      this.add(this.slot(function(of, properties) {
        if ( ! of ) return '';

        // Binds view to currentData instead of data because there
        // is a delay from when data is updated until when the UI
        // is rebuilt if the data's class changes. Binding directly
        // to data causes views and actions from the old class to get
        // bound to data of a new class, which causes problems.
        self.currentData = self.data;

        var title = self.title && this.E('tr').
          start('td').addClass(this.myClass('title')).attrs({colspan: 2}).
            add(self.title$).
          end();

        return self.actionBorder(
          this.
            E('table').
            addClass(this.myClass()).
            add(title).
            forEach(properties, function(p) {
              var config = self.config && self.config[p.name];

              if ( config ) {
                p = p.clone();
                for ( var key in config ) {
                  p[key] = config[key];
                }
              }

              this.tag(self.DetailPropertyView, { prop: p });
            }));
      }));
    },

    function actionBorder(e) {
      if ( ! this.showActions || ! this.actions.length ) return e;

      return this.E().add(e).
        start('div').addClass(this.myClass('toolbar')).add(this.actions).end();
    }
  ]
});
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

foam.CLASS({
  package: 'foam.u2.tag',
  name: 'Image',
  extends: 'foam.u2.View',

  properties: [
    {
      name: 'displayWidth',
      attribute: true
    },
    {
      name: 'displayHeight',
      attribute: true
    },
    ['alpha', 1.0],
    ['nodeName', 'img']
  ],

  methods: [
    function initE() {
      this.
        attrs({ src: this.data$ }).
        style({
          height:  this.displayHeight$,
          width:   this.displayWidth$,
          opacity: this.alpha$
        });
    }
  ]
});

foam.__context__.registerElement(foam.u2.tag.Image);
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.u2.tag',
  name: 'Input',
  extends: 'foam.u2.View',

  properties: [
    [ 'nodeName', 'input' ],
    {
      name: 'data',
      preSet: function(o, d) {
        var f = ! d || typeof d === 'string' || typeof d === 'number' || typeof d === 'boolean' || foam.Date.isInstance(d);
        if ( ! f ) {
          this.warn('Set Input data to non-primitive:' + d);
          return o;
        }
        return d;
      }
      /*
      assertValue: function(d) {
        foam.assert(! d || typeof d === 'string' || typeof d === 'number' || typeof d === 'boolean' || foam.Date.isInstance(d), 'Set Input data to non-primitive.');
      }*/
    },
    {
      class: 'Boolean',
      name: 'onKey',
      attribute: true,
      // documentation: 'When true, $$DOC{ref:".data"} is updated on every keystroke, rather than on blur.'
    },
    'type'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^:read-only { border: none; background: rgba(0,0,0,0); }
      */}
    })
  ],

  methods: [
    function initE() {
      this.SUPER();
      if ( this.type ) this.attrs({ type: this.type });
      this.initCls();
      this.link();
    },

    function initCls() {
      // Template method, can be overriden by sub-classes
      this.addClass(this.myClass());
    },

    function link() {
      // Template method, can be overriden by sub-classes
      this.attrSlot(null, this.onKey ? 'input' : null).linkFrom(this.data$);
    },

    function updateMode_(mode) {
      // TODO: make sure that DOM is updated if values don't change
      this.setAttribute('readonly', mode === foam.u2.DisplayMode.RO);
      this.setAttribute('disabled', mode === foam.u2.DisplayMode.DISABLED);
    }
  ]
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.u2.tag',
  name: 'TextArea',
  extends: 'foam.u2.View',

  properties: [
    [ 'nodeName', 'textarea' ],
    {
      class: 'Int',
      name: 'rows',
      value: 4
    },
    {
      class: 'Int',
      name: 'cols',
      value: 60
    },
    {
      class: 'Boolean',
      name: 'onKey',
      attribute: true,
      documentation: 'When true, $$DOC{ref:".data"} is updated on every ' +
          'keystroke, rather than on blur.',
    },
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass());
      this.attrs({rows: this.rows, cols: this.cols});

      // This is required because textarea accepts setting the 'value'
      // after it's output, but before requires output to be between
      // the tags when it's first output.
      this.add(this.data + '');

      this.attrSlot(
        'value',
        this.onKey ? 'input' : 'change').linkFrom(this.data$);
    },

    function updateMode_(mode) {
      // TODO: make sure that DOM is updated if values don't change
      this.setAttribute('readonly', mode === foam.u2.DisplayMode.RO);
      this.setAttribute('disabled', mode === foam.u2.DisplayMode.DISABLED);
    }
  ]
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.u2',
  name: 'TextField',
  extends: 'foam.u2.tag.Input',

  axioms: [
    foam.u2.CSS.create({
      code: '^:read-only { border: none; background: rgba(0,0,0,0); }'
    })
  ],

  properties: [
    {
      class: 'Int',
      name: 'displayWidth'
    },
    'type'
  ],

  methods: [
    function initE() {
      this.SUPER();

      if ( this.type         ) this.setAttribute('type', this.type);
      if ( this.displayWidth ) this.setAttribute('size', this.displayWidth);
    },

    function fromProperty(prop) {
      this.SUPER(prop);

      if ( ! this.displayWidth ) {
        this.displayWidth = prop.displayWidth;
      }

      if ( prop.visibility ) {
        this.visibility = prop.visibility;
      }
    }
  ]
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.u2',
  name: 'IntView',
  extends: 'foam.u2.TextField',

  axioms: [
    foam.u2.CSS.create({
      code: '^:read-only { border: none; background: rgba(0,0,0,0); }'
    })
  ],

  properties: [
    [ 'type', 'number' ],
    { class: 'Int', name: 'data' }
  ],

  methods: [
    function link() {
      this.attrSlot(null, this.onKey ? 'input' : null).linkFrom(this.data$)
    }
  ]
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.u2',
  name: 'FloatView',
  extends: 'foam.u2.TextField',

  documentation: 'View for editing Float Properties.',

  axioms: [
    foam.u2.CSS.create({
      code: '^:read-only { border: none; background: rgba(0,0,0,0); }'
    })
  ],

  properties: [
    [ 'type', 'number' ],
    { class: 'Float', name: 'data' },
    'precision'
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass());
    },

    function link() {
      this.attrSlot(null, this.onKey ? 'input' : null).relateFrom(
          this.data$,
          this.textToData.bind(this),
          this.dataToText.bind(this));
    },

    function fromProperty(p) {
      this.precision = p.precision;
    },

    function formatNumber(val) {
      if ( ! val ) return '0';
      val = val.toFixed(this.precision);
      var i = val.length - 1;
      for ( ; i > 0 && val.charAt(i) === '0' ; i-- ) {}
      return val.substring(0, val.charAt(i) === '.' ? i : i + 1);
    },

    function dataToText(val) {
      return this.precision !== undefined ?
        this.formatNumber(val) :
        '' + val ;
    },

    function textToData(text) {
      return parseFloat(text) || 0;
    }
  ]
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.u2',
  name: 'CheckBox',
  extends: 'foam.u2.tag.Input',

  documentation: 'Checkbox View.',

  properties: [
    { class: 'Boolean', name: 'data' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.setAttribute('type', 'checkbox');
    },
    function link() {
      this.data$.linkTo(this.attrSlot('checked'));
    }
  ]
});
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

foam.CLASS({
  package: 'foam.u2',
  name: 'CitationView',
  extends: 'foam.u2.Element',

  documentation: 'A simple default View to display the ID of an object.',

  properties: [
    'data',
    [ 'nodeName', 'span' ],
  ],

  methods: [
   function initE() {
      this.SUPER();
      this.add(this.data$.dot('id')).add(' ');
    }
  ]
});

//    TODO: name/label detection */
/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.u2',
  name: 'PopupView',
  extends: 'foam.u2.Element',

  axioms: [
    foam.u2.CSS.create({
      code: function() {/*
      ^ {
        background: #999;
        box-shadow: 3px 3px 6px 0 gray;
        color: white;
        font-size: 18px;
        opacity: 0.9;
        padding: 20px;
        position: absolute;
        box-sizing: border-box;
        z-index: 999;
      }
      */}
    })
  ],

  properties: [
    'x',
    'y',
    'width',
    'height',
    'maxWidth',
    'maxHeight'
  ],

  methods: [
    function initE() {
      var self     = this;
      var parent   = this.parentNode;
      var close    = function() {
        self.remove();
        bg.remove();
      };

      if ( ! this.y       ) this.y = (parent.el().clientHeight - this.height)/2;
      if ( ! this.x       ) this.x = (parent.el().clientWidth  - this.width )/2;
      if ( this.width     ) this.style({width    : this.width     + 'px'});
      if ( this.height    ) this.style({height   : this.height    + 'px'});
      if ( this.maxWidth  ) this.style({maxWidth : this.maxWidth  + 'px'});
      if ( this.maxHeight ) this.style({maxHeight: this.maxHeight + 'px'});

      // Make a full-screen transparent background, which when clicked,
      // closes this Popup
      var bg = this.E('div').
        style({
          position: 'absolute',
          width: '10000px',
          height: '10000px',
          opacity: 0,
          top: 0,
          zIndex: 998
        }).
        on('click', close).
        write();

      this.
        addClass(this.myClass()).
        style({
          left: this.x + 'px',
          top:  this.y + 'px'
        }).
        onunload.sub(close);

      parent.style({position: 'relative'});
    }
  ]
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

// TODO: Add datalist support.

foam.CLASS({
  package: 'foam.u2',
  name: 'DateView',
  extends: 'foam.u2.tag.Input',

  documentation: 'View for editing Date values.',

  axioms: [
    foam.u2.CSS.create({
      code: '^:read-only { border: none; background: rgba(0,0,0,0); }'
    })
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.setAttribute('type', 'date');
    },

    function link() {
      this.data$.relateTo(
          this.attrSlot(null, this.onKey ? 'input' : null),
          function(date) {
            return date ? date.toISOString().substring(0,10) : date;
          },
          function(value) {
            return new Date(value);
          }
      );
    }
  ]
});
/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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

// TODO: Add datalist support.

foam.CLASS({
  package: 'foam.u2',
  name: 'DateTimeView',
  extends: 'foam.u2.tag.Input',

  documentation: 'View for editing DateTime values.',

  methods: [
    function initE() {
      this.SUPER();
      this.setAttribute('type', 'datetime-local');
    },

    function link() {
      this.data$.relateTo(
          this.attrSlot(null, this.onKey ? 'input' : null),
          function(date) {
            return date ? date.toISOString().substring(0,16) : date;
          },
          function(value) {
            return new Date(value);
          }
      );
    }
  ]
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.u2',
  name: 'RangeView',
  extends: 'foam.u2.tag.Input',

  properties: [
    [ 'type', 'range' ],
    [ 'step', 0 ],
    [ 'minValue', 0 ],
    [ 'maxValue', 100 ]
  ],

  methods: [
    function initE() {
      this.SUPER();
      if ( this.step ) this.attrs({step: this.step});
      this.attrs({min: this.minValue, max: this.maxValue$});
    }
  ]
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

// TODO: doc
foam.CLASS({
  package: 'foam.u2',
  name: 'ReadWriteView',
  extends: 'foam.u2.View',

  requires: [ 'foam.u2.tag.Input' ],

  methods: [
    function initE() {
      // Don't create ReadView if no data (saves memory and startup time).
      if ( this.isLoaded() ) {
        this.initReadView();
      } else {
        this.listenForLoad();
      }
    },

    // Template Methods

    function isLoaded() {
      /** Return true iff data is available for this view. **/
      return this.data;
    },

    function listenForLoad() {
      this.data$.sub(this.onDataLoad);
    },

    function toReadE() {
      return this.E('span').add(this.data$);
    },

    function toWriteE() {
      this.data$.sub(this.onDataLoad);
      return this.Input.create({data$: this.data$});
    }
  ],

  listeners: [
    function onDataLoad(s) {
      s.detach();
      this.initReadView();
    },

    function initReadView() {
      this.removeAllChildren().add(this.toReadE().on('click', this.initWriteView));
    },

    function initWriteView() {
      this.removeAllChildren().add(this.toWriteE().on('blur', this.initReadView).focus());
    }
  ]
});
/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'HTMLValidator',
  extends: 'foam.u2.DefaultValidator',

  axioms: [ foam.pattern.Singleton.create() ],

  methods: [
    function sanitizeText(text) {
      // TODO: validate text
      return text;
    }
  ]
});


// An Element which does not escape HTML content
foam.CLASS({
  package: 'foam.u2',
  name: 'HTMLElement',
  extends: 'foam.u2.Element',

  exports: [ 'validator as elementValidator' ],

  properties: [
    {
      class: 'Proxy',
      of: 'foam.u2.DefaultValidator',
      name: 'validator',
      value: foam.u2.HTMLValidator.create()
    }
  ]
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.u2.tag',
  name: 'Select',
  extends: 'foam.u2.View',

  axioms: [
    foam.u2.CSS.create({
      code: function() {/*
        ^:disabled {
          appearance: none;
          -moz-appearance:none;
          -webkit-appearance:none;
          border: none;
          background: rgba(0,0,0,0);
          color: initial;
        }
      */}
    })
  ],

  properties: [
    [ 'nodeName', 'select' ],
    {
      name: 'choices',
      factory: function() {
        return [];
      }
    },
    {
      name: 'placeholder',
      factory: function() {
        return undefined;
      }
    },
    {
      name: 'size'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .attrs({size: this.size$})
        .attrSlot().linkFrom(this.data$);

      this.setChildren(this.slot(function(choices, placeholder) {
        var cs = [];

        if ( placeholder ) {
          cs.push(self.E('option').attrs({
            value: -1,
            selected: self.data == -1 ? true : undefined
          }).add(self.placeholder));
        }

        for ( var i = 0 ; i < choices.length ; i++ ) {
          var c = choices[i];
          cs.push(self.E('option').attrs({
            value: i,
            selected: self.data === i ? true : undefined
          }).add(c[1]));
        }

        return cs;
      }));
    },

    function updateMode_(mode) {
      this.setAttribute(
        'disabled',
        mode === foam.u2.DisplayMode.DISABLED || mode === foam.u2.DisplayMode.RO);
    }

  ]
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

// TODO: don't instantiate tabs until viewed

foam.CLASS({
  package: 'foam.u2',
  name: 'Tab',
  extends: 'foam.u2.Element',

  properties: [
    { class: 'String',  name: 'label' },
    { class: 'Boolean', name: 'selected' }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'Tabs',
  extends: 'foam.u2.Element',

  requires: [ 'foam.u2.Tab' ],

  axioms: [
    foam.u2.CSS.create({
      code: function() {/*
        ^ {
          display: block;
        }
        ^tabRow { height: 37px; }
        ^tab {
          background: lightgray;
          border-bottom: none;
          border-top: 1px solid black;
          border-left: 1px solid black;
          border-right: 1px solid black;
          border-top-right-radius: 4px;
          border-top-left-radius: 4px;
          float: left;
          padding: 5px;
        }
        ^tab.selected {
          background: white;
          position: relative;
          z-index: 1;
        }
        ^content {
          background: white;
          border: 1px solid black;
          box-shadow: 3px 3px 6px 0 gray;
          left: -4px;
          margin: 4px;
          padding: 0;
          position: relative;
          top: -13px;
        }
      */}
    })
  ],

  properties: [
    /* not used
    {
      name: 'tabs',
      factory: function() { return []; }
    },
    */
    {
      name: 'selected',
      postSet: function(o, n) {
        if ( o ) o.selected = false;
        n.selected = true;
      }
    },
    'tabRow'
  ],

  methods: [
    function init() {
      this.
          addClass(this.myClass()).
          start('div', null, this.tabRow$).
            addClass(this.myClass('tabRow')).
          end().
          start('div', null, this.content$).
            addClass(this.myClass('content')).
          end();
    },

    function add(tab) {
      if ( this.Tab.isInstance(tab) ) {

        if ( ! this.selected ) this.selected = tab;

        this.tabRow.start('span').
            addClass(this.myClass('tab')).
            enableClass('selected', tab.selected$).
            on('click', function() { this.selected = tab; }.bind(this)).
            add(tab.label).
        end();

        tab.shown$ = tab.selected$;
      }

      this.SUPER(tab);
    }
  ]
});
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

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ChoiceView',
  extends: 'foam.u2.View',

  documentation: 'Wraps a tag that represents a singular choice. That is, ' +
      'this controller shows the user a fixed, probably small set of ' +
      'choices, and the user picks one. ' +
      'The choices are [value, label] pairs. this.choice is the current ' +
      'pair, this.data the current value. this.text is the current label, ' +
      'this.label is the label for the whole view (eg. "Medal Color", not ' +
      '"Gold"). ' +
      'The choices can be provided either as an array (this.choices) or as ' +
      'a DAO plus the function this.objToChoice which turns objects from the ' +
      'DAO into [value, label] pairs. ' +
      'this.selectSpec is a ViewSpec for the inner view. It defaults to ' +
      'foam.u2.tag.Select.',

  properties: [
    {
      class: 'String',
      name: 'label',
      documentation: 'User-visible label. Not to be confused with "text", ' +
          'which is the user-visible name of the currently selected choice.'
    },
    {
      name: 'choice',
      // 'choice' is the canonical source of truth. Updating 'choice' is
      // responsible for updating 'index', 'data', and 'text'. Updating any
      // of those properties calls back to updating 'choice'.
      documentation: 'The current choice. (That is, a [value, text] pair.)',
      postSet: function(o, n) {
        if ( o === n || this.feedback_ ) return;

        this.feedback_ = true;

        if ( ! n && this.placeholder ) {
          this.data = undefined;
          this.text = this.placeholder;
          this.index = -1;
        } else {
          this.data  = n && n[0];
          this.text  = n && n[1];
          this.index = this.findIndexOfChoice(n);
        }
        this.feedback_ = false;
      }
    },
    {
      name: 'choices',
      documentation: 'Array of [value, text] choices. You can pass in just ' +
          'an array of strings, which are expanded to [str, str]. Can also ' +
          'be a map, which results in [key, value] pairs listed in ' +
          'enumeration order.',
      factory: function() { return []; },
      adapt: function(old, nu) {
        if ( typeof nu === 'object' && ! Array.isArray(nu) ) {
          var out = [];
          for ( var key in nu ) {
            if ( nu.hasOwnProperty(key) ) out.push([ key, nu[key] ]);
          }
          return out;
        }

        nu = foam.Array.clone(nu);

        // Upgrade single values to [value, value].
        for ( var i = 0; i < nu.length; i++ ) {
          if ( ! Array.isArray(nu[i]) ) {
            nu[i] = [ nu[i], nu[i] ];
          }
        }

        return nu;
      },
      postSet: function() {
        var d = this.data;
        if ( this.choices.length ) {
          this.choice = ( d && this.findChoiceByData(d) ) || this.defaultValue;
        }
      }
    },
    {
      class: 'Int',
      name: 'index',
      documentation: 'The index of the current choice in the choices array.',
      transient: true,
      value: -1,
      preSet: function(old, nu) {
        if ( this.choices.length === 0 && this.dao ) return nu;
        if ( nu < 0 && this.placeholder ) return nu;
        if ( nu < 0 || this.choices.length === 0 ) return 0;
        if ( nu >= this.choices.length ) return this.choices.length - 1;
        return nu;
      },
      postSet: function(o, n) {
        if ( o !== n ) this.choice = n === -1 ? null : this.choices[n];
      }
    },
    {
      class: 'String',
      name: 'placeholder',
      factory: function() { return undefined; },
      documentation: 'When provided the placeholder will be prepended to the selection list, and selected if the choices array is empty or no choice in the choices array is selected.'
    },
    {
      class: 'Function',
      name: 'objToChoice',
      documentation: 'A function which adapts an object from the DAO to a ' +
          '[key, value] choice. Required when a DAO is provided.'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao'
    },
    {
      name: 'text',
      postSet: function(o, n) {
        if ( o !== n ) this.choice = this.findChoiceByText(n);
      }
    },
    {
      name: 'data',
      postSet: function(o, n) {
        if ( o !== n ) this.choice = this.findChoiceByData(n) || [ n, n ];
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'selectSpec',
      value: { class: 'foam.u2.tag.Select' }
    },
    {
      class: 'Boolean',
      name: 'alwaysFloatLabel'
    },
    {
      name: 'view_'
    },
    'feedback_',
    'defaultValue',
    'size'
  ],

  methods: [
    function initE() {
      // If no item is selected, and data has not been provided, select the 0th
      // entry.
      if ( ! this.data && ! this.index ) {
        this.index = 0;
      }

      if ( this.dao ) this.onDAOUpdate();

      this.start(this.selectSpec, {
        data$: this.index$,
        label$: this.label$,
        alwaysFloatLabel: this.alwaysFloatLabel,
        choices$: this.choices$,
        placeholder$: this.placeholder$,
        mode$: this.mode$,
        size: this.size
      }).end();

      this.dao$proxy.on.sub(this.onDAOUpdate);
    },

    function findIndexOfChoice(choice) {
      if ( ! choice ) return -1;
      var choices = this.choices;
      var data = choice[0];
      for ( var i = 0 ; i < choices.length ; i++ ) {
        if ( foam.util.equals(choices[i][0], data) ) return i;
      }
      var text = choice[1];
      for ( var i = 0 ; i < choices.length ; i++ ) {
        if ( choices[i][1] === text ) return i;
      }
      return -1;
    },

    function findChoiceByData(data) {
      var choices = this.choices;
      for ( var i = 0 ; i < choices.length ; i++ ) {
        if ( foam.util.equals(choices[i][0], data) ) return choices[i];
      }
      return null;
    },

    function findChoiceByText(text) {
      var choices = this.choices;
      for ( var i = 0 ; i < choices.length ; i++ ) {
        if ( choices[i][1] === text ) return choices[i];
      }
      return null;
    },

    function fromProperty(p) {
      this.SUPER(p);
      this.defaultValue = p.value;
    }
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        this.dao.select().then(function(s) {
          this.choices = s.a.map(this.objToChoice);
          if ( ! this.data && this.index === -1 ) this.index = this.placeholder ? -1 : 0;
        }.bind(this));
      }
    }
  ]
});
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

foam.CLASS({
  package: 'foam.u2.view',
  name: 'RadioView',
  extends: 'foam.u2.view.ChoiceView',

  methods: [
    function initE() {
      // If no item is selected, and data has not been provided, select the 0th
      // entry.
      if ( ! this.data && ! this.index ) {
        this.index = 0;
      }

      if ( this.dao ) this.onDAOUpdate();
      this.choices$.sub(this.onChoicesUpdate);
      this.onChoicesUpdate();
    }
  ],

  listeners: [
    function onChoicesUpdate() {
      var self = this;

      this.removeAllChildren();

      this.add(this.choices.map(function(c) {
        return this.E('div').
          start('input').
            attrs({
              type: 'radio',
              name: this.id,
              value: c[0],
              checked: self.slot(function (data) { return data === c[0]; })
            }).
            on('change', function(evt) {
              self.data = evt.srcElement.value;
            }).
          end().
          add(c[1]);
      }.bind(this)));
    }
  ]
});
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

foam.CLASS({
  package: 'foam.u2.view',
  name: 'TextField',
  extends: 'foam.u2.Element',

  requires: [
    'foam.u2.tag.Input'
  ],

  properties: [
    'data',
    {
      class: 'Boolean',
      name: 'onKey',
      attribute: true
      // documentation: 'When true, $$DOC{ref:".data"} is updated on every keystroke, rather than on blur.'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'view',
      value: { class: 'foam.u2.tag.Input' }
    },
    'label',
    'alwaysFloatLabel',
    'type',
    'autocompleter',
    'autocompleteList_'
  ],

  methods: [
    function initE() {
      var e = this.start(this.view, {
        data$:            this.data$,
        label$:           this.label$,
        alwaysFloatLabel: this.alwaysFloatLabel,
        type:             this.type,
        onKey:            this.onKey
      });
      e.end();

      if ( this.autocompleter ) {
        this.onload.sub(function() {
          var list = foam.u2.Element.create({ nodeName: 'datalist' });
          this.autocompleteList_ = list;
          this.autocompleter.dao.on.sub(this.updateAutocompleteList);
          this.updateAutocompleteList();
          this.document.body.insertAdjacentHTML('beforeend', list.outerHTML);
          list.load();

          // Actually set the list attribute on our input field.
          e.attrs({ list: list.id });
        }.bind(this));

        this.onunload.sub(function() {
          this.autocompleteList_.remove();
        }.bind(this));
      }
    }
  ],

  listeners: [
    {
      name: 'updateAutocompleteList',
      isFramed: true,
      code: function() {
        var list = this.autocompleteList_;
        this.autocompleteList_.removeAllChildren();
        this.autocompleter.dao.select(foam.dao.ArraySink.create())
            .then(function(sink) {
              sink.a.forEach(function(x) {
                list.start('option').attrs({ value: x.label }).end();
              });
            });
      }
    }
  ]
});
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

foam.CLASS({
  package: 'foam.u2.view',
  name: 'TreeViewRow',
  extends: 'foam.u2.Element',

  requires: [
    'foam.mlang.ExpressionsSingleton'
  ],

  exports: [
    'data'
  ],

  imports: [
    'selection',
    'onObjDrop'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function() {/*
        ^ { white-space: nowrap; margin-left:16px; }
        ^selected { outline: 2px solid #dddd00; }
      */}
    })
  ],

  properties: [
    {
      name: 'data'
    },
    {
      name: 'relationship'
    },
    {
      class: 'Boolean',
      name: 'expanded',
      value: false
    },
    {
      class: 'Function',
      name: 'formatter'
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.
        addClass(this.myClass()).
        addClass(this.slot(function(selected, id) {
          if ( selected && foam.util.equals(selected.id, id) ) {
            return this.myClass('selected');
          }
          return '';
        }, this.selection$, this.data$.dot('id'))).
        attrs({ draggable: 'true' }).
        start('span').
          on('click', this.toggleExpanded).
          add(this.expanded$.map(function(v) { return v ? '\u25BD' : '\u25B7'; })).
          entity('nbsp').
        end().
        on('click', this.selected).
        on('dragstart', this.onDragStart).
        on('dragenter', this.onDragOver).
        on('dragover', this.onDragOver).
        on('drop', this.onDrop).
        call(this.formatter).
        add(this.slot(function(e) {
          if ( ! e ) return this.E('div');
          var e2 = this.E('div');
          e2.select(this.data[self.relationship.forwardName].dao, function(obj) {
            return self.cls_.create({
              data: obj,
              formatter: self.formatter,
              relationship: self.relationship
            }, this);
          });
          return e2;
        }, this.expanded$));
    }
  ],

  listeners: [
    function onDragStart(e) {
      e.dataTransfer.setData('application/x-foam-obj-id', this.data.id);
      e.stopPropagation();
    },

    function onDragOver(e) {
      if ( ! e.dataTransfer.types.some(function(m) { return m === 'application/x-foam-obj-id'; }) )
        return;

      var id = e.dataTransfer.getData('application/x-foam-obj-id');

      if ( foam.util.equals(id, this.data.id) )
        return;

      e.preventDefault();
      e.stopPropagation();
    },

    function onDrop(e) {
      if ( ! e.dataTransfer.types.some(function(m) { return m === 'application/x-foam-obj-id'; }) )
        return;

      var id = e.dataTransfer.getData('application/x-foam-obj-id');

      if ( foam.util.equals(id, this.data.id) ) return;

      e.preventDefault();
      e.stopPropagation();

      var self = this;
      var dao  = this.__context__[this.relationship.targetDAOKey];
      dao.find(id).then(function(obj) {
        if ( ! obj ) return null;

        // TODO: We shouldn't have to remove then put,
        // We currently have to because the FLOW editor is not updating properly
        // on a put event for an object that it already has.
        dao.remove(obj).then(function() {
          self.data[self.relationship.forwardName].dao.put(obj).then(function(obj) {
            self.onObjDrop(obj, id);
          });
        });
      });
    },

    function selected(e) {
      this.selection = this.data;
      e.preventDefault();
      e.stopPropagation();
    },

    function toggleExpanded(e) {
      this.expanded = ! this.expanded;
      e.preventDefault();
      e.stopPropagation();
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.view',
  name: 'TreeView',
  extends: 'foam.u2.Element',

  requires: [
    'foam.mlang.ExpressionsSingleton',
    'foam.u2.view.TreeViewRow'
  ],

  exports: [
    'onObjDrop',
    'selection'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
    },
    {
      name: 'relationship'
    },
    {
      name: 'selection'
    },
    {
      class: 'Function',
      name: 'formatter'
    },
    {
      class: 'Boolean',
      name: 'startExpanded',
      value: false
    }
  ],

  methods: [
    function initE() {
      var M = this.ExpressionsSingleton.create();
      var of = foam.lookup(this.relationship.sourceModel);

      var dao = this.data$proxy.where(
        M.NOT(M.HAS(of.getAxiomByName(this.relationship.inverseName))));

      var self = this;
      this.addClass(this.myClass()).
        select(dao, function(obj) {
          return self.TreeViewRow.create({
            data: obj,
            relationship: self.relationship,
            expanded: self.startExpanded,
            formatter: self.formatter
          }, this);
        });
    },

    function onObjDrop(obj, target) {
      // Template Method
    }
  ]
});
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

foam.CLASS({
  package: 'foam.u2.view',
  name: 'DualView',
  extends: 'foam.u2.Element',

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'viewa'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'viewb'
    },
    'data',
    'prop'
  ],

  methods: [
    function initE() {
      var a = foam.u2.ViewSpec.createView(this.viewa, {
        data$: this.data$ }, this, this);
      var b = foam.u2.ViewSpec.createView(this.viewb, {
        data$: this.data$ }, this, this);

      if ( this.prop ) {
        a.fromProperty && a.fromProperty(this.prop);
        b.fromProperty && b.fromProperty(this.prop);
      }

      this.add(a).nbsp().add(b);
    },

    function fromProperty(prop) {
      this.prop  = prop;
    }
  ]
});
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

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ColorPicker',
  extends: 'foam.u2.tag.Input',

  constants: {
    NAME_TO_COLOR: {
      black: "#000000",
      navy: "#000080",
      darkblue: "#00008b",
      mediumblue: "#0000cd",
      blue: "#0000ff",
      darkgreen: "#006400",
      green: "#008000",
      teal: "#008080",
      darkcyan: "#008b8b",
      deepskyblue: "#00bfff",
      darkturquoise: "#00ced1",
      mediumspringgreen: "#00fa9a",
      lime: "#00ff00",
      springgreen: "#00ff7f",
      aqua: "#00ffff",
      cyan: "#00ffff",
      midnightblue: "#191970",
      dodgerblue: "#1e90ff",
      lightseagreen: "#20b2aa",
      forestgreen: "#228b22",
      seagreen: "#2e8b57",
      darkslategray: "#2f4f4f",
      darkslategrey: "#2f4f4f",
      limegreen: "#32cd32",
      mediumseagreen: "#3cb371",
      turquoise: "#40e0d0",
      royalblue: "#4169e1",
      steelblue: "#4682b4",
      darkslateblue: "#483d8b",
      mediumturquoise: "#48d1cc",
      indigo: "#4b0082",
      darkolivegreen: "#556b2f",
      cadetblue: "#5f9ea0",
      cornflowerblue: "#6495ed",
      rebeccapurple: "#663399",
      mediumaquamarine: "#66cdaa",
      dimgray: "#696969",
      dimgrey: "#696969",
      slateblue: "#6a5acd",
      olivedrab: "#6b8e23",
      slategray: "#708090",
      slategrey: "#708090",
      lightslategray: "#778899",
      lightslategrey: "#778899",
      mediumslateblue: "#7b68ee",
      lawngreen: "#7cfc00",
      chartreuse: "#7fff00",
      aquamarine: "#7fffd4",
      maroon: "#800000",
      purple: "#800080",
      olive: "#808000",
      gray: "#808080",
      grey: "#808080",
      skyblue: "#87ceeb",
      lightskyblue: "#87cefa",
      blueviolet: "#8a2be2",
      darkred: "#8b0000",
      darkmagenta: "#8b008b",
      saddlebrown: "#8b4513",
      darkseagreen: "#8fbc8f",
      lightgreen: "#90ee90",
      mediumpurple: "#9370db",
      darkviolet: "#9400d3",
      palegreen: "#98fb98",
      darkorchid: "#9932cc",
      yellowgreen: "#9acd32",
      sienna: "#a0522d",
      brown: "#a52a2a",
      darkgray: "#a9a9a9",
      darkgrey: "#a9a9a9",
      lightblue: "#add8e6",
      greenyellow: "#adff2f",
      paleturquoise: "#afeeee",
      lightsteelblue: "#b0c4de",
      powderblue: "#b0e0e6",
      firebrick: "#b22222",
      darkgoldenrod: "#b8860b",
      mediumorchid: "#ba55d3",
      rosybrown: "#bc8f8f",
      darkkhaki: "#bdb76b",
      silver: "#c0c0c0",
      mediumvioletred: "#c71585",
      indianred: "#cd5c5c",
      peru: "#cd853f",
      chocolate: "#d2691e",
      tan: "#d2b48c",
      lightgray: "#d3d3d3",
      lightgrey: "#d3d3d3",
      thistle: "#d8bfd8",
      orchid: "#da70d6",
      goldenrod: "#daa520",
      palevioletred: "#db7093",
      crimson: "#dc143c",
      gainsboro: "#dcdcdc",
      plum: "#dda0dd",
      burlywood: "#deb887",
      lightcyan: "#e0ffff",
      lavender: "#e6e6fa",
      darksalmon: "#e9967a",
      violet: "#ee82ee",
      palegoldenrod: "#eee8aa",
      lightcoral: "#f08080",
      khaki: "#f0e68c",
      aliceblue: "#f0f8ff",
      honeydew: "#f0fff0",
      azure: "#f0ffff",
      sandybrown: "#f4a460",
      wheat: "#f5deb3",
      beige: "#f5f5dc",
      whitesmoke: "#f5f5f5",
      mintcream: "#f5fffa",
      ghostwhite: "#f8f8ff",
      salmon: "#fa8072",
      antiquewhite: "#faebd7",
      linen: "#faf0e6",
      lightgoldenrodyellow: "#fafad2",
      oldlace: "#fdf5e6",
      red: "#ff0000",
      fuchsia: "#ff00ff",
      magenta: "#ff00ff",
      deeppink: "#ff1493",
      orangered: "#ff4500",
      tomato: "#ff6347",
      hotpink: "#ff69b4",
      coral: "#ff7f50",
      darkorange: "#ff8c00",
      lightsalmon: "#ffa07a",
      orange: "#ffa500",
      lightpink: "#ffb6c1",
      pink: "#ffc0cb",
      gold: "#ffd700",
      peachpuff: "#ffdab9",
      navajowhite: "#ffdead",
      moccasin: "#ffe4b5",
      bisque: "#ffe4c4",
      mistyrose: "#ffe4e1",
      blanchedalmond: "#ffebcd",
      papayawhip: "#ffefd5",
      lavenderblush: "#fff0f5",
      seashell: "#fff5ee",
      cornsilk: "#fff8dc",
      lemonchiffon: "#fffacd",
      floralwhite: "#fffaf0",
      snow: "#fffafa",
      yellow: "#ffff00",
      lightyellow: "#ffffe0",
      ivory: "#fffff0",
      white: "#ffffff"
    },
    COLOR_TO_NAME: { '#000000': 'black',
      '#000080': 'navy',
      '#00008b': 'darkblue',
      '#0000cd': 'mediumblue',
      '#0000ff': 'blue',
      '#006400': 'darkgreen',
      '#008000': 'green',
      '#008080': 'teal',
      '#008b8b': 'darkcyan',
      '#00bfff': 'deepskyblue',
      '#00ced1': 'darkturquoise',
      '#00fa9a': 'mediumspringgreen',
      '#00ff00': 'lime',
      '#00ff7f': 'springgreen',
      '#00ffff': 'cyan',
      '#191970': 'midnightblue',
      '#1e90ff': 'dodgerblue',
      '#20b2aa': 'lightseagreen',
      '#228b22': 'forestgreen',
      '#2e8b57': 'seagreen',
      '#2f4f4f': 'darkslategrey',
      '#32cd32': 'limegreen',
      '#3cb371': 'mediumseagreen',
      '#40e0d0': 'turquoise',
      '#4169e1': 'royalblue',
      '#4682b4': 'steelblue',
      '#483d8b': 'darkslateblue',
      '#48d1cc': 'mediumturquoise',
      '#4b0082': 'indigo',
      '#556b2f': 'darkolivegreen',
      '#5f9ea0': 'cadetblue',
      '#6495ed': 'cornflowerblue',
      '#663399': 'rebeccapurple',
      '#66cdaa': 'mediumaquamarine',
      '#696969': 'dimgrey',
      '#6a5acd': 'slateblue',
      '#6b8e23': 'olivedrab',
      '#708090': 'slategrey',
      '#778899': 'lightslategrey',
      '#7b68ee': 'mediumslateblue',
      '#7cfc00': 'lawngreen',
      '#7fff00': 'chartreuse',
      '#7fffd4': 'aquamarine',
      '#800000': 'maroon',
      '#800080': 'purple',
      '#808000': 'olive',
      '#808080': 'grey',
      '#87ceeb': 'skyblue',
      '#87cefa': 'lightskyblue',
      '#8a2be2': 'blueviolet',
      '#8b0000': 'darkred',
      '#8b008b': 'darkmagenta',
      '#8b4513': 'saddlebrown',
      '#8fbc8f': 'darkseagreen',
      '#90ee90': 'lightgreen',
      '#9370db': 'mediumpurple',
      '#9400d3': 'darkviolet',
      '#98fb98': 'palegreen',
      '#9932cc': 'darkorchid',
      '#9acd32': 'yellowgreen',
      '#a0522d': 'sienna',
      '#a52a2a': 'brown',
      '#a9a9a9': 'darkgrey',
      '#add8e6': 'lightblue',
      '#adff2f': 'greenyellow',
      '#afeeee': 'paleturquoise',
      '#b0c4de': 'lightsteelblue',
      '#b0e0e6': 'powderblue',
      '#b22222': 'firebrick',
      '#b8860b': 'darkgoldenrod',
      '#ba55d3': 'mediumorchid',
      '#bc8f8f': 'rosybrown',
      '#bdb76b': 'darkkhaki',
      '#c0c0c0': 'silver',
      '#c71585': 'mediumvioletred',
      '#cd5c5c': 'indianred',
      '#cd853f': 'peru',
      '#d2691e': 'chocolate',
      '#d2b48c': 'tan',
      '#d3d3d3': 'lightgrey',
      '#d8bfd8': 'thistle',
      '#da70d6': 'orchid',
      '#daa520': 'goldenrod',
      '#db7093': 'palevioletred',
      '#dc143c': 'crimson',
      '#dcdcdc': 'gainsboro',
      '#dda0dd': 'plum',
      '#deb887': 'burlywood',
      '#e0ffff': 'lightcyan',
      '#e6e6fa': 'lavender',
      '#e9967a': 'darksalmon',
      '#ee82ee': 'violet',
      '#eee8aa': 'palegoldenrod',
      '#f08080': 'lightcoral',
      '#f0e68c': 'khaki',
      '#f0f8ff': 'aliceblue',
      '#f0fff0': 'honeydew',
      '#f0ffff': 'azure',
      '#f4a460': 'sandybrown',
      '#f5deb3': 'wheat',
      '#f5f5dc': 'beige',
      '#f5f5f5': 'whitesmoke',
      '#f5fffa': 'mintcream',
      '#f8f8ff': 'ghostwhite',
      '#fa8072': 'salmon',
      '#faebd7': 'antiquewhite',
      '#faf0e6': 'linen',
      '#fafad2': 'lightgoldenrodyellow',
      '#fdf5e6': 'oldlace',
      '#ff0000': 'red',
      '#ff00ff': 'magenta',
      '#ff1493': 'deeppink',
      '#ff4500': 'orangered',
      '#ff6347': 'tomato',
      '#ff69b4': 'hotpink',
      '#ff7f50': 'coral',
      '#ff8c00': 'darkorange',
      '#ffa07a': 'lightsalmon',
      '#ffa500': 'orange',
      '#ffb6c1': 'lightpink',
      '#ffc0cb': 'pink',
      '#ffd700': 'gold',
      '#ffdab9': 'peachpuff',
      '#ffdead': 'navajowhite',
      '#ffe4b5': 'moccasin',
      '#ffe4c4': 'bisque',
      '#ffe4e1': 'mistyrose',
      '#ffebcd': 'blanchedalmond',
      '#ffefd5': 'papayawhip',
      '#fff0f5': 'lavenderblush',
      '#fff5ee': 'seashell',
      '#fff8dc': 'cornsilk',
      '#fffacd': 'lemonchiffon',
      '#fffaf0': 'floralwhite',
      '#fffafa': 'snow',
      '#ffff00': 'yellow',
      '#ffffe0': 'lightyellow',
      '#fffff0': 'ivory',
      '#ffffff': 'white'
    }
  },

  properties: [
    {
      name: 'type',
      value: 'color'
    }
  ],

  methods: [
    function link() {
      var self = this;
      this.attrSlot(null, this.onKey ? 'input' : null).relateFrom(this.data$,
        function(value) {
          if ( typeof value !== 'string' ) return value;

          var v = value.toLowerCase();
          if ( self.COLOR_TO_NAME[v] ) return self.COLOR_TO_NAME[v];
          return value;
        },
        function (value) {
          if ( typeof value !== 'string' ) return value;

          var v = value.toLowerCase();
          if ( self.NAME_TO_COLOR[v] ) return self.NAME_TO_COLOR[v];
          return value;
        });
    }
  ]
});
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

foam.CLASS({
  package: 'foam.u2.view',
  name: 'TableCellPropertyRefinement',

  refines: 'foam.core.Property',

  properties: [
    {
      name: 'tableHeaderFormatter',
      value: function(axiom) {
        this.add(axiom.label);
      }
    },
    {
      name: 'tableCellFormatter',
      value: function(value, obj, axiom) {
        this.add(value);
      }
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Action',

  properties: [
    {
      name: 'tableCellFormatter',
      value: function(_, obj, axiom) {
        this.
          startContext({ data: obj }).
          add(axiom).
          endContext();
      }
    },
    {
      name: 'tableHeaderFormatter',
      value: function(axiom) {
        this.add(axiom.label);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.view',
  name: 'TableView',
  extends: 'foam.u2.Element',

  implements: [ 'foam.mlang.Expressions' ],

  exports: [
    'columns',
    'selection',
    'hoverSelection'
  ],

  imports: [
    'editRecord?',
    'selection? as importSelection'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ th {
          text-align: left;
          white-space: nowrap;
        }

        ^row:hover {
          background: #eee;
        }

        ^selected {
          background: #eee;
          outline: 1px solid #f00;
        }
    */}
    })
  ],

  properties: [
    {
      class: 'Class',
      name: 'of'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'orderedDAO',
      expression: function(data, order) {
        return data ? data.orderBy(order) : foam.dao.NullDAO.create();
      }
    },
    {
      name: 'order'
    },
    {
      name: 'columns_',
      expression: function(columns, data, of) {
        var of = this.of || ( data && data.of);
        if ( ! of ) return [];

        return columns.map(function(p) {
          return typeof p == 'string' ?
            of.getAxiomByName(p) :
            p ;
        });
      }
    },
    {
      name: 'columns',
      expression: function(data, of) {
        var of = this.of || ( data && data.of);
        if ( ! of ) return [];

        var tableColumns = of.getAxiomByName('tableColumns');

        if ( tableColumns ) return tableColumns.columns;

        return of.getAxiomsByClass(foam.core.Property).
          filter(function(p) { return ! p.hidden; }).
          map(foam.core.Property.NAME.f);
      }
    },
    'selection',
    'hoverSelection'
  ],

  methods: [
    function sortBy(column) {
      this.order = this.order === column ?
        this.DESC(column) :
        column;
    },

    function initE() {
      var view = this;

      this.
        addClass(this.myClass()).
        setNodeName('table').
        start('thead').
        add(this.slot(function(columns_) {
          return this.E('tr').
            forEach(columns_, function(column) {
              this.
                start('th').
                on('click', function(e) { view.sortBy(column); }).
                call(column.tableHeaderFormatter, [column]).
                add(' ', this.slot(function(order) {
                  return column === order ? this.Entity.create({ name: '#9651' }) :
                      (view.Desc.isInstance(order) && order.arg1 === column) ? this.Entity.create({ name: '#9661' }) :
                      ''
                }, view.order$)).
                end();
            });
        })).
        add(this.slot(function(columns_) {
          return this.
            E('tbody').
            select(this.orderedDAO$proxy, function(obj) {
              return this.
                E('tr').
                start('tr').
                on('mouseover', function() { view.hoverSelection = obj; }).
                on('click', function() {
                  view.selection = obj;
                  if ( view.importSelection$ ) view.importSelection = obj;
                  if ( view.editRecord$ ) view.editRecord(obj);
                }).
                addClass(this.slot(function(selection) {
                  if ( obj === selection ) return view.myClass('selected');
                  return '';
                }, view.selection$)).
                addClass(view.myClass('row')).
                forEach(columns_, function(column) {
                  this.
                    start('td').
                    call(column.tableCellFormatter, [
                      column.f ? column.f(obj) : null, obj, column
                    ]).
                    end();
                });
            });
        }));
    }
  ]
});
/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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

 foam.CLASS({
  package: 'foam.u2.view',
  name: 'ScrollTableView',
  extends: 'foam.u2.Element',

  requires: [
    'foam.u2.view.TableView',
    'foam.graphics.ScrollCView',
    'foam.dao.FnSink',
    'foam.mlang.sink.Count',
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
    },
    {
      class: 'Int',
      name: 'limit',
      value: 30,
      // TODO make this a funciton of the height.
    },
    {
      class: 'Int',
      name: 'skip',
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'scrolledDao',
      expression: function(data, limit, skip) {
        return data.limit(limit).skip(skip);
      },
    },
    {
      name: 'scrollView',
      factory: function() {
        var self = this;
        return this.ScrollCView.create({
          value$: this.skip$,
          extent$: this.limit$,
          height: 600, // TODO use window height.
          width: 40,
          handleSize: 40,
          // TODO wire up mouse wheel
          // TODO clicking away from scroller should deselect it.
        });
      },
    },
    {
      name: 'tableView',
      factory: function() {
        return this.TableView.create({data$: this.scrolledDao$});
      },
    },
  ],

  listeners: [
    {
      // TODO Avoid onDaoUpdate approaches.
      name: 'onDaoUpdate',
      isFramed: true,
      code: function() {
        var self = this;
        this.data$proxy.select(this.Count.create()).then(function(s) {
          self.scrollView.size = s.value;
        })
      },
    },
  ],

  methods: [
    function init() {
      this.onDetach(this.data$proxy.pipe(this.FnSink.create({fn:this.onDaoUpdate})));
    },
    function initE() {
      // TODO probably shouldn't be using a table.
      this.start('table').
        start('tr').
          start('td').style({ 'vertical-align': 'top' }).add(this.tableView).end().
          start('td').add(this.scrollView).end().
        end().
      end();
    }
  ]
});
/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.u2.view',
  name: 'BlobView',
  extends: 'foam.u2.Element',
  requires: [
    'foam.blob.BlobBlob'
  ],
  imports: [
    'blobService'
  ],
  properties: [
    'data',
    {
      class: 'String',
      name: 'filename'
    },
    {
      class: 'String',
      name: 'type'
    },
    {
      class: 'DateTime',
      name: 'timestamp'
    }
  ],
  methods: [
    function initE() {
      var view = this;
      this.
        setNodeName('span').
        start('input').attrs({ type: 'file' }).on('change', this.onChange).end().
        add(this.slot(function(data) {
          var url = data && view.blobService.urlFor(data);
          return ! url ? this.E('span') :
            this.E('a').attrs({ href: url }).add('Download')
        }, this.data$));
    }
  ],
  listeners: [
    function onChange(e) {
      var file = e.target.files[0];

      this.data = this.BlobBlob.create({
        blob: file
      });
      this.filename = file.name;
      this.timestamp = new Date(file.lastModified);
      this.type = file.type;
    }
  ]
});
/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.u2.view',
  name: 'StringArrayView',
  extends: 'foam.u2.tag.Input',
  properties: [
    {
      name: 'data',
      preSet: function(o, d) {
        return d;
      }
    },
    {
      class: 'Function',
      name: 'valueToText',
      value: function(value) {
        return value.map(function(m) {
          return m.replace("\\", "\\\\").replace(",", "\\,");
        }).join(',');
      }
    },
    {
      class: 'Function',
      name: 'textToValue',
      value: function(text) {
        if ( ! text ) return [];

        var value = [];
        var escape = false;
        var start = 0;
        for ( var i = 0 ; i < text.length ; i++ ) {
          if ( escape ) {
            escape = false;
            continue;
          }

          if ( i == text.length - 1 ) {
            value.push(text.substring(start, i+1).replace(/\\(.)/, "$0"));
          } else if ( text[i] == ',' || i == text.length - 1 ) {
            value.push(text.substring(start, i).replace(/\\(.)/, "$0"));
            start = ++i;
          } else if ( text[i] == '\\' ) {
            escape = true;
          }
        }

        return value;
      }
    }
  ],
  methods: [
    function link() {
      this.attrSlot().relateFrom(this.data$, this.textToValue, this.valueToText);
    }
  ]
});
/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ImageView',
  extends: 'foam.u2.Element',
  properties: [
    'data',
    ['nodeName', 'img']
  ],
  methods: [
    function initE() {
      this.attrs({ src: this.data$ });
    }
  ]
});
/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.u2',
  name: 'ClassView',
  extends: 'foam.u2.TextField',

  documentation: 'View for editing a Class Property.',

  properties: [
    { class: 'Class', name: 'data' }
  ],

  methods: [
    function link() {
      this.attrSlot(null, null).relateFrom(
          this.data$,
          this.textToData.bind(this),
          this.dataToText.bind(this));
    },

    function dataToText(c) {
      return c ? c.id : '';
    },

    function textToData(text) {
      return text.trim();
    }
  ]
});
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

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ReferenceView',
  extends: 'foam.u2.view.ChoiceView',

  imports: [
    'data as parentObj',
  ],

  properties: [
    {
      name: 'objToChoice',
      factory: function() {
        var f;
        return function(obj) {
          if ( f ) return f(obj);
        };
      }
    }
  ],

  methods: [
    function fromProperty(prop) {
      this.SUPER(prop);
      if ( ! this.hasOwnProperty('objToChoice') ) {
        var of = prop.of;

        var props = of.getAxiomsByClass(foam.core.String);
        var f;

        // Find the first non-hidden string property.
        for ( var i = 0 ; i < props.length ; i++ ) {
          var p = props[i];
          if ( ! p.hidden ) {
            this.objToChoice = function(obj) {
              return [obj.id, p.f(obj)];
            };
            break;
          }
        }

        if ( i === props.length ) {
          this.objToChoice = function(obj) {
            return [obj.id, obj.id];
          };
        }
      }

      var dao = this.parentObj.__context__[prop.targetDAOKey];
      this.dao = dao;
    }
  ]
});
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
foam.CLASS({
  package: 'foam.u2.tag',
  name: 'Card',
  extends: 'foam.u2.Element',

  documentation: 'This is a simple div in non-MD. Likely to be overridden ' +
      'later with Polymer\'s <paper-card> or similar.'
});
/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.u2.dialog',
  name: 'Popup',
  extends: 'foam.u2.Element',

  documentation: 'This is a container for a whole-screen, modal overlay. It ' +
      'fills the viewport with a transparent grey background, and then ' +
      'centers the "content" element. Clicking the background closes the ' +
      'dialog. Exports itself as "overlay", for use by OK and CANCEL buttons.',

  exports: [
    'close as closeDialog'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function() {/*
        ^ {
          align-items: center;
          bottom: 0;
          display: flex;
          justify-content: space-around;
          left: 0;
          position: fixed;
          right: 0;
          top: 0;
          z-index: 1000;
        }
        ^container {
          align-items: center;
          display: flex;
          height: 100%;
          justify-content: space-around;
          position: relative;
          width: 100%;
        }
        ^background {
          background-color: #000;
          bottom: 0;
          left: 0;
          opacity: 0.4;
          position: absolute;
          right: 0;
          top: 0;
        }
        ^inner {
          z-index: 3;
        }
      */}
    })
  ],

  properties: [
    [ 'backgroundColor', '#fff' ]
  ],

  methods: [
    function init() {
      this.SUPER();
      var content;

      this.addClass(this.myClass())
          .start()
          .addClass(this.myClass('container'))
          .start()
              .addClass(this.myClass('background'))
              .on('click', this.close)
          .end()
          .start()
              .call(function() { content = this; })
              .addClass(this.myClass('inner'))
              .style({ 'background-color': this.backgroundColor })
          .end()
      .end();

      this.content = content;
    },

    function open() {
      this.document.body.insertAdjacentHTML('beforeend', this.outerHTML);
      this.load();
    }
  ],

  listeners: [
    function close() {
      this.remove();
    }
  ]
});
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

foam.CLASS({
  package: 'foam.u2',
  name: 'Autocompleter',

  documentation: 'Basic autocomplete controller. Supports simple ' +
      'autocomplete, defaulting to querying by Keyword. Use this as a base ' +
      'class for other, more sophisticated autocompleters.',

  properties: [
    {
      name: 'dao',
      required: true,
      documentation: 'The DAO to complete against.'
    },
    {
      class: 'String',
      name: 'partial',
      documentation: 'The string the user has entered so far. Usually bound ' +
          'to some text field.'
    },
    {
      name: 'queryFactory',
      documentation: 'Turns the user\'s string into an mLang query. Defaults ' +
          'to Keyword.',
      value: function(str) {
        return foam.mlang.predicate.Keyword.create({ arg1: str });
      }
    },
    {
      class: 'Function',
      name: 'objToString',
      documentation: 'When the user has selected an object from the DAO as ' +
          'the chosen completion, we need to turn it back into a string for ' +
          'the text field.',
      required: true
    },
    'filteredDAO'
  ],

  methods: [
    function init() {
      this.SUPER();
      this.slot(function(dao, partial) {
        this.onUpdate();
      }.bind(this), this.dao$, this.partial$);
    }
  ],

  listeners: [
    {
      name: 'onUpdate',
      isFramed: true,
      code: function onUpdate() {
        if ( ! this.dao ) return;
        this.filteredDAO = this.partial ?
            this.dao.where(this.queryFactory(this.partial)) : this.dao;
      }
    }
  ]
});
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

foam.CLASS({
  package: 'foam.u2.search',
  name: 'FilterController',
  extends: 'foam.u2.View',

  requires: [
    'foam.mlang.sink.Count',
    'foam.u2.TableView',
    'foam.u2.ViewSpec',
    'foam.u2.tag.Card',
    'foam.u2.tag.Input',
    'foam.u2.view.ChoiceView',
    //'foam.u2.search.DateFieldSearchView',
    'foam.u2.search.BooleanRefinement',
    'foam.u2.search.EnumRefinement',
    'foam.u2.search.GroupAutocompleteSearchView',
    'foam.u2.search.GroupBySearchView',
    'foam.u2.search.PropertyRefinement',
    'foam.u2.search.SearchManager',
    'foam.u2.search.TextSearchView'
  ],

  exports: [
    'as filterController',
    'data as unfilteredDAO'
  ],


  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          display: flex;
          overflow: hidden;
          flex-grow: 1;
          width: 100%;
        }
        ^search-panel {
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          overflow: hidden;
          min-width: 250px;
        }
        ^adding {
          border: none;
          flex-shrink: 0;
          flex-grow: 0;
          padding: 8px;
        }
        ^add-filter {
          align-items: center;
          display: flex;
          justify-content: space-between;
        }
        ^count {
          align-items: center;
          display: flex;
          justify-content: space-between;
        }
        ^results {
          display: flex;
          flex-grow: 1;
          overflow: hidden;
        }

        ^filter-area {
          flex-grow: 1;
          overflow-y: auto;
        }

        ^filter-header {
          align-items: center;
          display: flex;
        }
        ^filter-label {
          flex-grow: 1;
        }
        ^filter-container {
          margin: 6px 8px 0px;
        }
      */}
    })
  ],

  properties: [
    'count',
    'totalCount',
    {
      name: 'countString',
      expression: function(count, totalCount) {
        return (count || '0') + ' of ' + (totalCount || '0');
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'data',
      required: true
    },
    'filteredDAO',
    {
      name: 'filterChoice',
      label: 'New Filter',
      factory: function() {
        return this.defaultFilter;
      }
    },
    {
      name: 'filters',
      adapt: function(old, nu) {
        // Convert from a list of strings to the full set of filters.
        if ( nu && nu.length && typeof nu[0] === 'string' ) {
          var out = [];
          for ( var i = 0; i < nu.length; i++ ) {
            var f = this.data.of.getAxiomByName(nu[i]);
            out.push([ f.name, f.label ]);
          }
          return out;
        }

        return nu;
      },
      factory: function() {
        var props = this.data.of.getAxiomsByClass(foam.core.Property)
            .filter(function(p) { return ! p.hidden; });
        return props.sort(function(a, b) {
          return a.LABEL.compare(a, b);
        }).map(function(p) {
          return [ p.name, p.label ];
        });
      }
    },
    {
      class: 'Boolean',
      name: 'allowDuplicateFilters',
      help: 'When this is true, you can create multiple filters for one ' +
          'property.',
      value: false
    },
    {
      class: 'Boolean',
      name: 'allowAddingFilters',
      help: 'When this is true, the controls for adding new filters is shown ' +
          'at the top. When it is false, just the CLEAR button and count are ' +
          'present.',
      value: true
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'filterAreaSpec',
      value: 'div'
    },
    {
      class: 'Boolean',
      name: 'textSearch',
      help: 'Set this to true to enable freeform text search.',
      value: false
    },
    {
      class: 'Function',
      name: 'buildFilter',
      value: function buildFilter(args) {
        var e = this.Card.create();
        e.style({
          'margin-bottom': '0',
          overflow: 'visible'
        }).addClass(this.myClass('filter-container'))
            .start('div')
                .addClass(this.myClass('filter-header'))
                .add(args.label)
            .end()
            .startContext({ data: args.key })
                .add(args.showRemove ? this.REMOVE_FILTER : undefined)
            .endContext()
        .end();

        e.start('div')
            .addClass(this.myClass('filter-body'))
            .add(args.view)
        .end();
        return e;
      }
    },
    {
      name: 'searchMgr_',
      factory: function() {
        return this.SearchManager.create({
          dao$: this.data$,
          filteredDAO$: this.filteredDAO$
        });
      }
    },
    {
      class: 'StringArray',
      name: 'searchFields',
      documentation: 'Property names that are currently selected as filters.',
      factory: function() {
        return ( this.data && this.data.of && this.data.of.tableColumns ) || [];
      }
    },
    {
      name: 'searchViews_',
      factory: function() { return {}; }
    },
    {
      name: 'search',
      factory: function() {
        var of = this.data.of;
        if ( of.id ) of = of.id;
        return this.TextSearchView.create({
          of: of,
          richSearch: true,
          keywordSearch: true
        });
      }
    },
    {
      name: 'filtersE_'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'tableView',
      value: { class: 'foam.u2.TableView' }
    },
    {
      name: 'table'
    },
    {
      name: 'loaded_',
      value: false
    },
    [ 'oldSearchFields_', null ],
    [ 'addingSpec', undefined ]
  ],

  methods: [
    function initE() {
      // Assigning to unused variable to keep Closure happy.
      var _ = this.searchMgr_; // Force the factory to run.
      this.filteredDAO$.sub(this.onPredicateChange);
      this.onPredicateChange();

      this.addClass(this.myClass());
      this.startContext({ data: this });
      var searchPanel = this.start().addClass(this.myClass('search-panel'));
      var topPanel = searchPanel.start(this.addingSpec)
          .addClass(this.myClass('adding'));
      if ( this.allowAddingFilters ) {
        topPanel.start()
            .addClass(this.myClass('add-filter'))
            .start(this.ChoiceView, {
              data$: this.filterChoice$,
              choices: this.filters
            }).end()
            .add(this.NEW_FILTER)
        .end();
      }

      topPanel.start()
          .addClass(this.myClass('count'))
          .start('span')
              .addClass(this.myClass('count-text'))
              .add(this.countString$)
          .end()
          .start(this.CLEAR, { raised: true }).end()
      .end();
      this.filtersE_ = searchPanel.start(this.filterAreaSpec)
          .addClass(this.myClass('filter-area'));
      this.filtersE_.end();
      this.endContext();
      searchPanel.end();

      this.start().addClass(this.myClass('results'))
          .start(this.tableView, { of: this.data.of, data$: this.filteredDAO$ })
          .end()
      .end();

      var self = this;
      this.onload.sub(function() {
        if ( self.textSearch ) {
          self.filtersE_.add(self.buildFilter({
            label: 'Search',
            showRemove: false,
            view: self.search
          }));
          self.searchMgr_.add(self.search);
        }

        self.loaded_ = true;
      });

      this.data$.sub(this.updateSearchFields);
      this.loaded_$.sub(this.updateSearchFields);
      this.searchFields$.sub(this.updateSearchFields);

      this.data$proxy.on.reset.sub(this.updateCount);
      if ( this.data ) this.updateCount();
    },

    function addGroup(spec, prop, opt_map) {
      var map = opt_map || {};
      map.property = prop;
      map.size = map.size || 1;
      map.dao = this.data;

      var e = this.ViewSpec.createView(spec, map, this, this.searchMgr_);
      var view = this.searchMgr_.add(e);
      var filterView = this.buildFilter({
        key: view.name,
        label: prop.label,
        prop: prop,
        showRemove: this.allowAddingFilters,
        view: view
      });

      this.searchViews_[view.name] = filterView;
      return filterView;
    },

    function renderFilter(key) {
      this.filtersE_.add(this.searchViews_[key]);
    },

    function addFilter_(name) {
      // Look for existing filters for this property, and count the total
      // filters to ensure we can build a unique key.
      // This is how the multiple-fields-for-one-property support is achieved.
      var highestCount = 0;
      var alreadyExists = false;
      for ( var i = 0; i < this.searchFields.length; i++ ) {
        var split = this.splitName(this.searchFields[i]);
        if ( split.count > highestCount ) highestCount = split.count;
        if ( split.name === name ) alreadyExists = true;
      }

      if ( alreadyExists && ! this.allowDuplicateFilters ) return undefined;

      var key = name + (highestCount === 0 ? '' : '_' + (+highestCount + 1));
      var temp = foam.Array.clone(this.searchFields);
      temp.push(key);
      this.searchFields = temp;
      return key;
    },

    function addFilter(name) {
      var key = this.addFilter_(name);
    },

    function removeFilter(key) {
      var temp = foam.Array.clone(this.searchFields);
      for ( var i = 0; i < temp.length; i++ ) {
        if ( temp[i] === key ) {
          temp.splice(i, 1);
          break;
        }
      }
      this.searchFields = temp;
    },

    function splitName(key) {
      var match = key.match(/^(.*)_(\d+)$/);
      return match ? { name: match[1], count: match[2] } :
          { name: key, count: 1 };
    }
  ],

  listeners: [
    {
      name: 'onPredicateChange',
      isFramed: true,
      code: function() {
        this.filteredDAO.select(this.Count.create())
            .then(function(c) { this.count = c.value; }.bind(this));
      }
    },
    {
      name: 'updateCount',
      isFramed: true,
      code: function() {
        this.data.select(this.Count.create()).then(function(c) {
          this.totalCount = c.value;
        }.bind(this));
        this.onPredicateChange();
      }
    },
    {
      name: 'updateSearchFields',
      isFramed: true,
      code: function() {
        if ( ! this.loaded_ || ! this.data ) return;
        var fields = this.searchFields;
        var oldFields = this.oldSearchFields_;

        // Check for every filter that has been removed, and every filter that
        // is freshly added.
        // This function is responsible for choosing the view for each property.
        // Eg. drop-downs for Booleans and Enums, before/after for dates, etc.
        if ( oldFields ) {
          for ( var i = 0; i < oldFields.length; i++ ) {
            if ( ! fields || fields.indexOf(oldFields[i]) < 0 ) {
              this.searchMgr_.remove(oldFields[i]);
              this.searchViews_[oldFields[i]].remove();
              delete this.searchViews_[oldFields[i]];
            }
          }
        }

        if ( fields ) {
          for ( var i = 0; i < fields.length; i++ ) {
            if ( ! oldFields || oldFields.indexOf(fields[i]) < 0 ) {
              var split = this.splitName(fields[i]);
              var prop = this.data.of.getAxiomByName(split.name);
              var spec = prop.searchView;
              // TODO(braden): Bring in date support when it's ready.
              var options = {
                name: fields[i]
              };
              if ( prop.tableSeparator ) {
                options.split = prop.tableSeparator;
              }
              this.addGroup(spec, prop, options);
              this.renderFilter(fields[i]);
            }
          }
        }

        this.oldSearchFields_ = fields;
      }
    }
  ],

  actions: [
    {
      name: 'clear',
      code: function() { this.searchMgr_.clear(); }
    },
    {
      name: 'newFilter',
      code: function() {
        this.addFilter_(this.filterChoice);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.search',
  name: 'PropertyRefinement',
  refines: 'foam.core.Property',

  properties: [
    {
      // Set this field to override the default logic for choosing a view.
      class: 'foam.u2.ViewSpec',
      name: 'searchView',
      value: { class: 'foam.u2.search.GroupAutocompleteSearchView' }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.search',
  name: 'BooleanRefinement',
  refines: 'foam.core.Boolean',

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'searchView',
      value: { class: 'foam.u2.search.GroupBySearchView' }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.search',
  name: 'EnumRefinement',
  refines: 'foam.core.Enum',

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'searchView',
      value: { class: 'foam.u2.search.GroupBySearchView' }
    }
  ]
});
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

foam.CLASS({
  package: 'foam.u2.search',
  name: 'GroupCompleter',
  extends: 'foam.u2.Autocompleter',

  requires: [
    'foam.dao.MDAO',
    'foam.dao.ProxyDAO',
    'foam.mlang.LabeledValue',
    'foam.mlang.predicate.ContainsIC'
  ],

  documentation: 'Expects "groups" to be an array of strings, and ' +
      'autocompletes on them.',

  properties: [
    'groups',
    {
      name: 'dao',
      factory: function() {
        return this.ProxyDAO.create({
          of: this.LabeledValue,
          delegate$: this.innerDAO_$
        });
      }
    },
    {
      name: 'innerDAO_',
      expression: function(groups) {
        var dao = this.MDAO.create({ of: this.LabeledValue });
        if ( ! groups || ! groups.length ) return dao;

        for ( var i = 0; i < groups.length; i++ ) {
          var str = '' + groups[i];
          if ( ! str ) continue;
          dao.put(this.LabeledValue.create({
            id: str,
            label: str,
            value: groups[i]
          }));
        }
        return dao;
      }
    },
    {
      name: 'queryFactory',
      value: function(str) {
        return this.ContainsIC.create({
          arg1: this.LabeledValue.LABEL,
          arg2: str
        });
      }
    },
    {
      name: 'objToString',
      value: function(lv) {
        return lv.value;
      }
    }
  ]
});
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

foam.CLASS({
  package: 'foam.u2.search',
  name: 'GroupAutocompleteSearchView',
  extends: 'foam.u2.View',

  documentation: 'Uses a TextField with autocomplete driven by a list. This ' +
      'depends on the browser\'s native support for the input.list ' +
      'attribute, which is also polyfilled by Polymer.',

  requires: [
    'foam.mlang.predicate.True',
    'foam.u2.search.GroupCompleter',
    // TODO(braden): Implement and uncomment the split-completer.
    //'foam.u2.search.GroupSplitCompleter',
    'foam.u2.view.TextField'
  ],

  properties: [
    {
      class: 'String',
      name: 'split',
      documentation: 'Set this to a string, and group values will be split ' +
          'on it. This can be used to split a comma-separated string into ' +
          'its component parts.',
      value: ''
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'viewSpec',
      value: { class: 'foam.u2.view.TextField', onKey: true }
    },
    {
      name: 'dao',
      label: 'DAO',
      required: true,
      postSet: function() {
        this.updateDAO();
      }
    },
    {
      name: 'property',
      required: true,
      postSet: function(o, property) {
        if ( ! this.op ) this.op = foam.core.Int.isInstance(property) ? foam.mlang.predicate.Eq : foam.mlang.predicate.ContainsIC;
      }
    },
    {
      name: 'name',
      documentation: 'All SearchViews require a name. Defaults to the ' +
          'property name.',
      expression: function(property) {
        return property.name;
      }
    },
    {
      class: 'Class',
      name: 'op'/*,
      expression: function(property) {
        // TODO: broken by CLASS, fix
        // All the numeric types extend from Int, so I'll use that as my base.
        return foam.core.Int.isInstance(property) ? foam.mlang.predicate.Eq :
            foam.mlang.predicate.ContainsIC;
      }*/
    },
    {
      name: 'predicate',
      documentation: 'My filter for the SearchManager to read.',
      factory: function() {
        return this.True.create();
      }
    },
    {
      name: 'label',
      expression: function(property) {
        return property.label;
      }
    },
    {
      name: 'groups',
      documentation: 'List of groups found the last time the DAO was updated.'
    },
    {
      name: 'autocompleter',
      factory: function() {
        var model = this.GroupCompleter;
        var args = { groups$: this.groups$ };
        if ( this.split ) {
          model = this.GroupSplitCompleter;
          args.split = this.split;
        }

        return model.create(args, this);
      }
    },
    {
      name: 'view'
    }
  ],

  methods: [
    function clear() {
      this.view.data = '';
    },

    function initE() {
      this.view = this.start(this.viewSpec, {
        prop: this.property,
        label$: this.label$,
        alwaysFloatLabel: true,
        autocompleter: this.autocompleter
      });

      this.dao.on.sub(this.updateDAO);
      this.view.data$.sub(this.updatePredicate);
    }
  ],

  listeners: [
    {
      name: 'updateDAO',
      isMerged: true,
      mergeDelay: 100,
      code: function() {
        // Makes a select query, grouping by the value of this.property.
        // That builds the this.groups list, which is what we're autocompleting
        // against.
        this.dao.select(foam.mlang.sink.GroupBy.create({
          arg1: this.property,
          arg2: foam.mlang.sink.Count.create()
        })).then(function(groups) {
          this.groups = groups.sortedKeys();
        }.bind(this));
      }
    },
    {
      name: 'updatePredicate',
      code: function(sub, _, __, slot) {
        var str = slot.get();
        this.predicate = str ? this.op.create({
          arg1: this.property,
          arg2: this.property.fromString ? this.property.fromString(str) : str
        }) : this.True.create();
      }
    }
  ]
});
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

foam.CLASS({
  package: 'foam.u2.search',
  name: 'GroupBySearchView',
  extends: 'foam.u2.View',

  requires: [
    'foam.mlang.Constant',
    'foam.mlang.predicate.True',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.GroupBy',
    'foam.dao.FnSink',
    'foam.u2.view.ChoiceView'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ select {
          min-width: 220px;
        }
      */}
    })
  ],

  properties: [
    {
      name: 'view'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'viewSpec',
      value: { class: 'foam.u2.view.ChoiceView', size: 10 }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      required: true,
    },
    {
      name: 'property',
      required: true
    },
    {
      name: 'name',
      expression: function(property) {
        return property.name;
      }
    },
    {
      class: 'Class',
      name: 'op',
      value: 'foam.mlang.predicate.Eq'
    },
    {
      name: 'predicate',
      factory: function() {
        return this.True.create();
      }
    },
    {
      class: 'Int',
      name: 'width',
      value: 17
    },
    {
      class: 'String',
      name: 'label',
      expression: function(property) {
        return property.label;
      }
    }
  ],

  methods: [
    function clear() {
      this.view.data = '';
    },
    function initE() {
      this.addClass(this.myClass());
      this.view = this.start(this.viewSpec, {
        label$: this.label$,
        alwaysFloatLabel: true
      });
      this.view.end();

      this.onDetach(
        this.dao$proxy.listen(
          this.FnSink.create({fn: this.updateDAO})
        )
      );
      this.updateDAO();

      this.view.data$.sub(this.updatePredicate);
    },
    function updatePredicate_(choice) {
      var exists = typeof choice !== 'undefined' && choice !== '';
      this.predicate = exists ? this.op.create({
        arg1: this.property,
        arg2: this.Constant.create({ value: choice })
      }) : this.True.create();
    }
  ],

  listeners: [
    {
      name: 'updateDAO',
      isMerged: true,
      mergeDelay: 100,
      code: function() {
        var self = this;
        this.dao.select(this.GroupBy.create({
          arg1: this.property,
          arg2: this.Count.create()
        })).then(function(groups) {
          var options = [];
          var selected;
          var sortedKeys = groups.sortedKeys();
          for ( var i = 0; i < sortedKeys.length; i++ ) {
            var key = sortedKeys[i];
            if ( typeof key === 'undefined' ) continue;
            if ( key === '' ) continue;
            var count = foam.String.intern(
                '(' + groups.groups[key].value + ')');
            var subKey = ('' + key)
                .substring(0, self.width - count.length - 3);
            var cleanKey = foam.core.Enum.isInstance(self.property) ?
                self.property.of[key].label :
                subKey.replace(/</g, '&lt;').replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;');

            if ( self.view && self.view.data === key ) {
              selected = key;
            }

            options.push([
              key,
              cleanKey + foam.String.intern(
                  Array(self.width - subKey.length - count.length).join(' ')) +
                  count
            ]);
          }

          options.splice(0, 0, [ '', '--' ]);

          self.view.choices = options;
          if ( typeof selected !== 'undefined' ) {
            var oldData = self.view.data;
            self.view.data = selected;
            if ( typeof oldData === 'undefined' || oldData === '' ) {
              self.updatePredicate_(selected);
            }
          }
        });
      }
    },
    {
      name: 'updatePredicate',
      code: function(_, __, ___, slot) {
        this.updatePredicate_(slot.get());
      }
    }
  ]
});
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

foam.CLASS({
  package: 'foam.u2.search',
  name: 'SearchManager',

  requires: [
    'foam.mlang.predicate.And',
    'foam.mlang.predicate.True'
  ],

  properties: [
    {
      name: 'views',
      factory: function() { return {}; }
    },
    {
      name: 'subs_',
      factory: function() { return {}; }
    },
    // TODO(braden): See if there's a clever way to write the memento logic as
    // an expression, instead of a set of clever postSets.
    {
      name: 'predicate',
      factory: function() {
        return foam.mlang.predicate.True.create();
      }
    },
    {
      name: 'dao'
    },
    {
      name: 'filteredDAO',
      expression: function(dao, predicate) {
        if ( ! dao ) return;
        var d = dao.where(predicate);
        this.updateViews();
        return d;
      }
    }
  ],

  methods: [
    function and(views) {
      return this.And.create({
        args: Object.keys(views).map(function(k) { return views[k].predicate; })
      }).partialEval();
    },

    function add(view) {
      // Check the view's name, and if it's a duplicate, change its name to add
      // a number.
      if ( this.views[view.name] ) {
        var num = 2;
        while ( this.views[view.name + '_' + num] ) {
          num++;
        }
        view.name = view.name + '_' + num;
      }

      this.views[view.name] = view;
      this.subs_[view.name] = view.predicate$.sub(this.onViewUpdate);
      this.updateViews();
      return view;
    },

    function remove(viewOrName) {
      var view;
      var name;
      if ( typeof viewOrName === 'string' ) {
        name = viewOrName;
        view = this.views[viewOrName];
      } else {
        view = viewOrName;
        name = view.name;
      }

      if ( ! this.views[name] ) return;

      view.clear();
      this.subs_[name].detach();
      delete this.views[name];
      delete this.subs_[name];
    },

    function removeAll() {
      this.clear();
      foam.Object.forEach(this.subs_, function(sub) {
        sub.detach();
      });
      this.views = {};
      this.subs_ = {};
    },
    function clear() {
      foam.Object.forEach(this.views, function(view) { view.clear(); });
    }
  ],

  listeners: [
    {
      name: 'onViewUpdate',
      isMerged: true,
      mergeDelay: 10,
      code: function() {
        this.predicate = this.and(this.views);
        // That will tickle the expression for filteredDAO.
        this.updateViews();
      }
    },
    {
      name: 'updateViews',
      isMerged: true,
      mergeDelay: 20,
      code: function() {
        // Deliberately a longer delay than onViewUpdate, since updating the
        // views is less important.
        foam.Object.forEach(this.views, function(view, name) {
          var temp = {};
          foam.Object.forEach(this.views, function(v, n) {
            if ( name === n ) return;
            temp[n] = v;
          });
          // Temp now holds all the other views. Combine all their predicates to
          // get the reciprocal predicate for this view.
          this.views[name].dao = this.dao.where(this.and(temp));
        }.bind(this));
      }
    }
  ]
});
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

foam.CLASS({
  package: 'foam.u2.search',
  name: 'TextSearchView',
  extends: 'foam.u2.View',

  requires: [
    'foam.mlang.predicate.ContainsIC',
    'foam.mlang.predicate.True',
    'foam.parse.QueryParser',
    'foam.u2.tag.Input'
  ],

  properties: [
    {
      class: 'Class',
      name: 'of'
    },
    {
      class: 'Boolean',
      name: 'richSearch',
      value: false
    },
    {
      class: 'Boolean',
      name: 'keywordSearch',
      value: false
    },
    {
      name: 'queryParser',
      factory: function() {
        return this.QueryParser.create({ of: this.of });
      }
    },
    {
      class: 'Int',
      name: 'width',
      value: 47
    },
    'property',
    {
      name: 'predicate',
      factory: function() { return this.True.create(); }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'viewSpec',
      value: { class: 'foam.u2.tag.Input' }
    },
    {
      name: 'view'
    },
    {
      name: 'label',
      expression: function(property) {
        return property && property.label ? property.label : 'Search';
      }
    },
    {
      // All search views (in the SearchManager) need a name.
      // This defaults to 'query'.
      name: 'name',
      value: 'query'
    }
  ],

  methods: [
    function initE() {
      this.view = this.addClass(this.myClass()).start(this.viewSpec, {
        alwaysFloatLabel: true,
        label$: this.label$
      });
      this.view.end();
      this.view.data$.sub(this.updateValue);
    },

    function clear() {
      this.view.data = '';
      this.predicate = this.True.create();
    }
  ],

  listeners: [
    {
      name: 'updateValue',
      code: function() {
        var value = this.view.data;
        this.predicate = ! value ?
            this.True.create() :
            this.richSearch ?
                this.queryParser.parseString(value) :
                this.ContainsIC(this.property, value);
      }
    }
  ]
});
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

foam.CLASS({
  package: 'foam.u2.stack',
  name: 'Stack',

  properties: [
    {
      name: 'stack_',
      hidden: true,
      factory: function() { return []; }
    },
    {
      class: 'Int',
      name: 'depth',
      value: 0
    },
    {
      class: 'Int',
      name: 'pos',
      value: -1,
      preSet: function(_, p) {
        if ( isNaN(p) || p > this.depth ) return this.depth - 1;
        if ( p < 0 ) return 0;
        return p;
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'top',
      hidden: true,
      expression: function(pos) {
        return this.stack_[pos];
      }
    }
  ],

  methods: [
    function slotAt(i) {
      return this.StackSlot.create({
        pos: i,
        stack: this
      });
    },

    function at(i) {
      return i < 0 ? this.stack_[this.pos + i + 1] : this.stack_[i];
    },

    function push(v, parent) {
      // "parent" is the parent object for this view spec.  A view of this stack
      // should ensure that the context that "v" is rendered in extends from
      // both the u2.Element is it being rendered under, and from the "parent"
      // parameter.  This way views on the stack can export values to views
      // that get rendered after them.
      var pos = this.pos + 1;

      this.depth = pos + 1;
      this.stack_.length = this.depth;
      this.stack_[pos] = [v, parent];
      this.pos = pos;
    }
  ],

  actions: [
    {
      name: 'back',
      isEnabled: function(pos) { return pos > 0; },
      code: function() { this.pos--; }
    },
    {
      name: 'forward',
      isEnabled: function(pos, depth) { return pos < depth - 1; },
      code: function() { this.pos++; }
    }
  ],

  classes: [
    {
      name: 'StackSlot',

      implements: [ 'foam.core.Slot' ],

      properties: [
        {
          name: 'stack'
        },
        {
          class: 'Int',
          name: 'pos'
        }
      ],

      methods: [
        function init() {
          this.onDetach(this.stack.pos$.sub(this.onStackChange));
        },

        function get() {
          return this.stack.at(this.pos);
        },

        function set() {
          // unimplemnted.
        },

        function sub(l) {
          return this.SUPER('update', l);
        },

        function toString() {
          return 'StackSlot(' + this.pos + ')';
        }
      ],

      listeners: [
        function onStackChange(s) {
          if ( this.pos < 0 || this.pos === this.stack.pos ) {
            this.pub('update');
          }
        }
      ]
    }
  ]
});
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

foam.CLASS({
  package: 'foam.u2.stack',
  name: 'StackView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.stack.Stack'
  ],

  exports: [ 'data as stack' ],

  properties: [
    {
      name: 'data',
      factory: function() { return this.Stack.create(); }
    },
    {
      class: 'Boolean',
      name: 'showActions',
      value: true
    }
  ],

  methods: [
    // TODO: Why is this init() instead of initE()? Investigate and maybe fix.
    function init() {
      this.setNodeName('div');

      if ( this.showActions )
        this.add(this.Stack.BACK, this.Stack.FORWARD);

      this.add(this.slot(function(s) {
        if ( ! s ) return this.E('span');

        var view = s[0];
        var parent = s[1];


        // Do a bit of a dance with the context, to ensure that exports from "parent"
        // are available to "view"
        var X = parent ? this.__subSubContext__.createSubContext(parent) : this.__subSubContext__;

        return foam.u2.ViewSpec.createView(view, null, this, X);

      }, this.data$.dot('top')));
    }
  ]
});
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

foam.CLASS({
  package: 'foam.graphics',
  name: 'Transform',

  documentation: 'Affine transform.',

  properties: [
    { class: 'Simple', name: 'a' },
    { class: 'Simple', name: 'b' },
    { class: 'Simple', name: 'c' },
    { class: 'Simple', name: 'd' },
    { class: 'Simple', name: 'e' },
    { class: 'Simple', name: 'f' },
    { class: 'Simple', name: 'g' },
    { class: 'Simple', name: 'h' },
    { class: 'Simple', name: 'i' },
    {
      name: 'inverse_',
      factory: function() { return this.cls_.create(); },
      // Exclude from compareTo()
      compare: function() { return 0; }
    }
  ],

  methods: [
    function initArgs() {
      this.a = 1; this.b = 0; this.c = 0;
      this.d = 0; this.e = 1; this.f = 0;
      this.g = 0; this.h = 0; this.i = 1;
    },

    function mul(a, b, c, d, e, f, g, h, i) {
      var ta = this.a, tb = this.b, tc = this.c,
          td = this.d, te = this.e, tf = this.f,
          tg = this.g, th = this.h, ti = this.i;

      this.a = ta * a + tb * d + tc * g;
      this.b = ta * b + tb * e + tc * h;
      this.c = ta * c + tb * f + tc * i;

      this.d = td * a + te * d + tf * g;
      this.e = td * b + te * e + tf * h;
      this.f = td * c + te * f + tf * i;

      this.g = tg * a + th * d + ti * g;
      this.h = tg * b + th * e + ti * h;
      this.i = tg * c + th * f + ti * i;

      return this;
    },

    function mulT(t) {
      return this.mul(t.a, t.b, t.c, t.d, t.e, t.f, t.g, t.h, t.i);
    },

    function mulP(p) {
      var ta = this.a, tb = this.b, tc = this.c,
          td = this.d, te = this.e, tf = this.f,
          tg = this.g, th = this.h, ti = this.i;

      var a = p.x;
      var d = p.y;
      var g = p.w;

      p.x = ta * a + tb * d + tc * g;
      p.y = td * a + te * d + tf * g;
      p.w = tg * a + th * d + ti * g;

      return this;
    },

    function affine(m) {
      return this.mul(m.a, m.b, m.c, m.d, m.e, m.f, m.g, m.h, m.i);
    },

    function transpose() {
      // a b c    a d g
      // d e f -> b e h
      // g h i    c f i
      var tmp = this.b;
      this.b = this.d;
      this.d = tmp;

      tmp = this.c;
      this.c = this.g;
      this.g = tmp;

      tmp = this.f;
      this.f = this.h;
      this.h = tmp;
      return this;
    },

    function invert() {
      var ta = this.a, tb = this.b, tc = this.c,
          td = this.d, te = this.e, tf = this.f,
          tg = this.g, th = this.h, ti = this.i;

      var det = ta*(te*ti  - tf*th) - tb*(td*ti - tf*tg) + tc*(td*th-te*tg);
      var detinv = 1 / det;

      var inv = this.inverse_;

      inv.a = detinv * (te*ti - tf*th);
      inv.b = detinv * (tc*th - tb*ti);
      inv.c = detinv * (tb*tf - tc*te);

      inv.d = detinv * (tf*tg - td*ti);
      inv.e = detinv * (ta*ti - tc*tg);
      inv.f = detinv * (tc*td - ta*tf);

      inv.g = detinv * (td*th - te*tg);
      inv.h = detinv * (tb*tg - ta*th);
      inv.i = detinv * (ta*te - tb*td);

      return inv;
    },

    function det() {
      // Compute the determinant
      var a = this.a, b = this.b, c = this.c,
          d = this.d, e = this.e, f = this.f,
          g = this.g, h = this.h, i = this.i;

      return a*(e*i  - f*h) - b*(d*i - f*g) + c*(d*h-e*g);
    },

    function reset() {
      this.initArgs();
      return this;
    },

    function translate(dx, dy) {
      if ( dx || dy ) this.mul(1, 0, dx, 0, 1, dy, 0, 0, 1);
      return this;
    },

    function skew(x, y) {
      if ( x || y ) this.mul(1, x, 0, y, 1, 0, 0, 0, 1);
      return this;
    },

    function scale(x, y) {
      if ( y === undefined ) y = x;
      if ( x != 1 || y != 1 ) this.mul(x, 0, 0, 0, y, 0, 0, 0, 1);
      return this;
    },

    function rotate(a) {
      if ( a ) this.mul(Math.cos(a), Math.sin(a), 0, -Math.sin(a), Math.cos(a), 0, 0, 0, 1);
      return this;
    },

    function rotateAround(a, x, y) {
      return this.translate(-x, -y).rotate(a).translate(x, y);
    }
  ]
});


foam.CLASS({
  package: 'foam.graphics',
  name: 'Transform3D',

  documentation: 'Three-dimensional affine transform.',

  properties: [
    { class: 'Simple', name: 'a' },
    { class: 'Simple', name: 'b' },
    { class: 'Simple', name: 'c' },
    { class: 'Simple', name: 'd' },

    { class: 'Simple', name: 'e' },
    { class: 'Simple', name: 'f' },
    { class: 'Simple', name: 'g' },
    { class: 'Simple', name: 'h' },

    { class: 'Simple', name: 'i' },
    { class: 'Simple', name: 'j' },
    { class: 'Simple', name: 'k' },
    { class: 'Simple', name: 'l' },

    { class: 'Simple', name: 'm' },
    { class: 'Simple', name: 'n' },
    { class: 'Simple', name: 'o' },
    { class: 'Simple', name: 'p' }
  ],

  methods: [
    function init() {
      this.a = 1; this.b = 0; this.c = 0; this.d = 0;
      this.e = 0; this.f = 1; this.g = 0; this.h = 0;
      this.i = 0; this.j = 0; this.k = 1; this.l = 0;
      this.m = 0; this.n = 0; this.o = 0; this.p = 1;
    },

    function mulM(o) {
      return this.mul(
        o.a, o.b, o.c, o.d,
        o.e, o.f, o.h, o.i,
        o.j, o.j, o.k, o.l,
        o.m, o.n, o.o, o.p);
    },

    function mulP(p) {
      var ta = this.a, tb = this.b, tc = this.c, td = this.d,
          te = this.e, tf = this.f, tg = this.g, th = this.h,
          ti = this.i, tj = this.j, tk = this.k, tl = this.l,
          tm = this.m, tn = this.n, to = this.o, tp = this.p;

      var a = p.x;
      var b = p.y;
      var c = p.z
      var d = p.w;

      p.x = ta * a + tb * b + tc * c + td * d;
      p.y = te * a + tf * b + tg * c + th * d;
      p.z = ti * a + tj * b + tk * c + tl * d;
      p.w = tm * a + tn * b + to * c + tp * d;

      return this;
    },

    function mul(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p) {
      var ta = this.a, tb = this.b, tc = this.c, td = this.d,
          te = this.e, tf = this.f, tg = this.g, th = this.h,
          ti = this.i, tj = this.j, tk = this.k, tl = this.l,
          tm = this.m, tn = this.n, to = this.o, tp = this.p;

      this.a = ta * a + tb * e + tc * i + td * m;
      this.b = ta * b + tb * f + tc * j + td * n;
      this.c = ta * c + tb * g + tc * k + td * o;
      this.d = ta * d + tb * h + tc * l + td * p;

      this.e = te * a + tf * e + tg * i + th * m;
      this.f = te * b + tf * f + tg * j + th * n;
      this.g = te * c + tf * g + tg * k + th * o;
      this.h = te * d + tf * h + tg * l + th * p;

      this.i = ti * a + tj * e + tk * i + tl * m;
      this.j = ti * b + tj * f + tk * j + tl * n;
      this.k = ti * c + tj * g + tk * k + tl * o;
      this.l = ti * d + tj * h + tk * l + tl * p;

      this.m = tm * a + tn * e + to * i + tp * m;
      this.n = tm * b + tn * f + to * j + tp * n;
      this.o = tm * c + tn * g + to * k + tp * o;
      this.p = tm * d + tn * h + to * l + tp * p;

      return this;
    },

    function affine(m) {
      return this.mul(m.a, m.b, m.c, m.d,
                      m.e, m.f, m.g, m.h,
                      m.i, m.j, m.k, m.l,
                      m.m, m.n, m.o, m.p);
    },

    function invert() {
      // a b c d    a e i m
      // e f g h -> b f j n
      // i j k l    c g k o
      // m n o p    d h l p
      var tmp = this.b;
      this.b = this.e;
      this.e = tmp;

      tmp = this.c;
      this.c = this.i;
      this.i = tmp;

      tmp = this.d;
      this.d = this.m;
      this.m = tmp;

      tmp = this.g;
      this.g = this.j;
      this.j = tmp;

      tmp = this.h;
      this.h = this.n;
      this.n = tmp;

      tmp = this.l;
      this.l = this.o;
      this.o = tmp;

      return this;
    },

    function reset() {
      this.init();
      return this;
    },

    function translate(dx, dy, dz) {
      if ( ! dx && ! dy && ! dz ) return;
      this.mul(1, 0, 0, dx,
               0, 1, 0, dy,
               0, 0, 1, dz,
               0, 0, 0, 1);
    },

    function skew(x, y, z) {
      if ( ! x && ! y && ! z ) return;
      throw new Error('not implemented yet.');
    },

    function scale(x, y, z) {
      if ( x === 1 && y === 1 && z == 1 ) return;
      this.mul(x, 0, 0, 0,
               0, y, 0, 0,
               0, 0, z, 0,
               0, 0, 0, 1);
    },

    function rotateX(a) {
      if ( ! a ) return;
      var c = Math.cos(a);
      var s = Math.sin(a);

      this.mul(
        1,  0,  0,  0,
        0,  c, -s,  0,
        0,  s,  c,  0,
        0,  0,  0,  1);
    },

    function rotateY(a) {
      if ( ! a ) return;
      var c = Math.cos(a);
      var s = Math.sin(a);

      this.mul(
        c,  0,  s,  0,
        0,  1,  0,  0,
       -s,  0,  c,  0,
        0,  0,  0,  1);
    },


    function rotateZ(a) {
      if ( ! a ) return;
      var c = Math.cos(a);
      var s = Math.sin(a);

      this.mul(
        c, -s,  0,  0,
        s,  c,  0,  0,
        0,  0,  1,  0,
        0,  0,  0,  1);
    },

    function rotate(x, y, z, r) {
      var d = Math.sqrt(x*x + y*y + z*z);
      x /= d;
      y /= d;
      z /= d;

      var cos = Math.cos(r);
      var sin = Math.sin(r);

      this.mul(
        cos + x*x*(1 - cos),     x*y*(1 - cos) - z*sin,   x*z*(1 - cos) + y*sin,  0,
        y*x*(1 - cos) + z*sin,   cos + y*y*(1-cos),       y*z*(1 - cos) - x*sin,  0,
        z*x*(1 - cos) - y*sin,   z*y*(1 - cos) + x*sin,   cos + z*z*(1 - cos),    0,
        0,                       0,                       0,                      1);

    }
  ]
});


foam.CLASS({
  package: 'foam.graphics',
  name: 'CView',

  documentation: 'A Canvas-View; base-class for all graphical view components.',

  requires: [
    'foam.graphics.Canvas',
    'foam.graphics.Transform'
  ],

  // Fires when this CView is invalidated and needs a repaint.
  // Is listened to a foam.u2.Canvas() if one was created for
  // this CView.
  topics: [ 'invalidated' ],

  properties: [
    {
      class: 'Float',
      name: 'width'
    },
    {
      class: 'Float',
      name: 'height'
    },
    {
      class: 'Float',
      name: 'rotation',
      preSet: function(_, r) {
        if ( r > 2 * Math.PI  ) return r - 2 * Math.PI;
        if ( r < -2 * Math.PI ) return r + 2 * Math.PI;
        return r;
      },
      view: {
        class: 'foam.u2.view.DualView',
        viewa: { class: 'foam.u2.FloatView', precision: 4, onKey: true },
        viewb: { class: 'foam.u2.RangeView', step: 0.00001, minValue: -Math.PI*2, maxValue: Math.PI*2, onKey: true }
      }
    },
    {
      name: 'originX',
      class: 'Float'
    },
    {
      name: 'originY',
      class: 'Float'
    },
    {
      name: 'scaleX',
      class: 'Float',
      value: 1
    },
    {
      name: 'scaleY',
      class: 'Float',
      value: 1
    },
    {
      name: 'skewX',
      class: 'Float',
      hidden: true
    },
    {
      name: 'skewY',
      class: 'Float',
      hidden: true
    },
    {
      name: 'x',
      class: 'Float'
    },
    {
      name: 'y',
      class: 'Float'
    },
    {
      name: 'alpha',
      class: 'Float',
      view: {
        class: 'foam.u2.view.DualView',
        viewa: { class: 'foam.u2.FloatView', precision: 4, onKey: true },
        viewb: { class: 'foam.u2.RangeView', step: 0.0001, maxValue: 1, onKey: true }
      },
      value: 1
    },
    {
      class: 'Color',
      name: 'border'
    },
    {
      class: 'Color',
      name: 'color'
    },
    {
      class: 'Color',
      name: 'shadowColor'
    },
    {
      class: 'Int',
      name: 'shadowBlur',
      units: 'pixels'
    },
    {
      name: 'children',
      factory: function() { return []; },
      postSet: function(o, n) {
        for ( var i = 0 ; o && i < o.length ; i++ ) this.removeChild_(o[i]);
        for ( var i = 0 ; n && i < n.length ; i++ ) this.addChild_(n[i]);
      },
      hidden: true
    },
    {
      name: 'state',
      value: 'initial',
      hidden: 'true',
      transient: true
    },
    {
      name: 'parent',
      hidden: 'true',
      transient: true
    },
    {
      name: 'canvas',
      hidden: 'true',
      transient: true
    },
    {
      name: 'transform_',
      hidden: 'true',
      transient: true,
      factory: function() { return this.Transform.create(); }
    },
    {
      name: 'transform',
      hidden: 'true',
      expression: function getTransform(x, originX, y, originY, rotation, skewX, skewY, scaleX, scaleY) {
        var t = this.transform_.reset();

        t.translate(x+originX, y+originY);
        t.rotate(rotation);
        t.skew(skewX, skewY);
        t.scale(scaleX, scaleY);
        t.translate(-originX, -originY);

        return t;
      }
    },
    {
      // If set to true, then this CView will automatically repaint
      // whenever a child is added or removed, a property changes, or
      // a property of a child changes. Only works if this CView has
      // an associated Canvas (by calling toE()).
      class: 'Boolean',
      name: 'autoRepaint',
      hidden: true,
      value: true
    },
    { name: 'top_',    hidden: true, transient: true, getter: function() { return this.y; } },
    { name: 'left_',   hidden: true, transient: true, getter: function() { return this.x; } },
    { name: 'bottom_', hidden: true, transient: true, getter: function() { return this.y+this.height; } },
    { name: 'right_',  hidden: true, transient: true, getter: function() { return this.x+this.width; } },
    {
      name: 'invalidate_',
      transient: true,
      hidden: true,
      // TODO: Would be more efficient to be a factory, but doesn't work. Investigate.
      getter: function() {
        return this.parent ? this.parent.invalidate_ :
          this.autoRepaint ? this.invalidated.pub    :
          null ;
      }
    }
  ],

  methods: [
    function initCView() {
      this.invalidate_ && this.propertyChange.sub(this.invalidate_);
    },

    function invalidate() {
      this.invalidate_ && this.invalidate_();
    },

    function parentToLocalCoordinates(p) {
      this.transform.invert().mulP(p);
      p.x /= p.w;
      p.y /= p.w;
      p.w = 1;
    },

    function globalToLocalCoordinates(p) {
      if ( this.parent ) this.parent.globalToLocalCoordinates(p);
      this.parentToLocalCoordinates(p);
    },

    function findFirstChildAt(p) {
      if ( arguments.length > 1 ) {
        var tmp = foam.graphics.Point.create();
        tmp.x = arguments[0];
        tmp.y = arguments[1];
        tmp.w = 1;
        p = tmp;
      }

      this.parentToLocalCoordinates(p);

      if ( this.children.length ) {
        var p2 = foam.graphics.Point.create();

        for ( var i = 0 ; i < this.children.length ; i++ ) {
          p2.x = p.x;
          p2.y = p.y;
          p2.w = p.w;

          var c = this.children[i].findFirstChildAt(p2);
          if ( c ) return c;
        }
      }

      if ( this.hitTest(p) ) return this;
    },

    // p must be in local coordinates.
    function hitTest(p) {
      return p.x >= 0 && p.y >= 0 && p.x < this.width && p.y < this.height;
    },

    function maybeInitCView(x) {
      if ( this.state === 'initial' ) {
        this.state = 'initailized'
        this.initCView(x);
      }
    },

    function paint(x) {
      this.maybeInitCView(x);

      x.save();

      var
        alpha       = this.alpha,
        border      = this.border,
        color       = this.color,
        shadowColor = this.shadowColor,
        shadowBlur  = this.shadowBlur;

      if ( alpha !== 1 ) {
        x.globalAlpha *= alpha;
      }

      if ( border ) {
        x.strokeStyle = border.toCanvasStyle ?
          border.toCanvasStyle(x) :
          border ;
      }

      if ( color ) {
        x.fillStyle = color.toCanvasStyle ?
          color.toCanvasStyle(x) :
          color ;
      }

      this.doTransform(x);

      if ( shadowColor && shadowBlur ) {
        x.shadowColor = shadowColor;
        x.shadowBlur  = shadowBlur;
      }

      this.paintSelf(x);
      this.paintChildren(x);

      x.restore();
    },

    function doTransform(x) {
      var t = this.transform;
      x.transform(t.a, t.d, t.b, t.e, t.c, t.f);
    },

    function paintChildren(x) {
      for ( var i = 0 ; i < this.children.length ; i++ ) {
        this.children[i].paint(x);
      }
    },

    function remove(c) {
      for ( var i = 0 ; i < this.children.length ; i++ ) {
        if ( this.children[i] === c ) {
          this.children.splice(i, 1);
          this.removeChild_(c);
          return;
        }
      }
    },

    function removeAllChildren() {
      var children = this.children;
      this.children = [];
      for ( var i = 0 ; i < children.length ; i++ ) {
        this.removeChild_(children[i]);
      }
    },

    function removeChild(c) {
      console.log('Deprecated use of CView.removeChild(). Use .remove() instead.');
      this.remove(c);
    },

    function addChild_(c) {
      c.parent = this;
      c.canvas = this.canvas;
      return c;
    },

    function removeChild_(c) {
      c.parent = undefined;
      c.canvas = undefined;
      this.invalidate();
      return c;
    },

    function add() {
      for ( var i = 0 ; i < arguments.length ; i++ ) {
        this.children.push(arguments[i]);
        this.addChild_(arguments[i]);
      }
      this.invalidate();
      return this;
    },

    function addChildren() {
      console.warn('Deprecated use of CView.addChildren(). Use add() instead.');
      return this.add.apply(this, arguments);
    },

    function paintSelf(x) {},

    function hsl(h, s, l) {
      return 'hsl(' + h + ',' + s + '%,' + l + '%)';
    },

    function write() {
      return this.toE().write();
    },

    function toE(args, X) {
      return this.Canvas.create({ cview: this }, X).attrs({
        width:  this.slot(function(x, width,  scaleX) { return x + width*scaleX; }),
        height: this.slot(function(y, height, scaleY) { return y + height*scaleY; })
      });
    },

    function intersects(c) {
      if ( c.radius ) {
        return ! (
            this.x + this.width  < c.x - c.radius ||
            this.y + this.height < c.y - c.radius ||
            c.x    + c.radius    < this.x         ||
            c.y    + c.radius    < this.y );
      }
      return ! (
          this.x + this.width  < c.x ||
          this.y + this.height < c.y ||
          c.x    + c.width  < this.x ||
          c.y    + c.height < this.y );
    },

    function equals(b) { return this === b; }
  ]
});


foam.CLASS({
  package: 'foam.graphics',
  name: 'CView3D',

  requires: [
    'foam.graphics.Transform3D'
  ],

  properties: [
    { class: 'Float', name: 'x' },
    { class: 'Float', name: 'y' },
    { class: 'Float', name: 'z' },
    { class: 'Float', name: 'rotateX' },
    { class: 'Float', name: 'rotateY' },
    { class: 'Float', name: 'rotateZ' },
    { class: 'Float', name: 'scaleX', value: 1 },
    { class: 'Float', name: 'scaleY', value: 1 },
    { class: 'Float', name: 'scaleZ', value: 1 },
    {
      name: 'transform_',
      factory: function() {
        return this.Transform3D.create();
      }
    },
    {
      name: 'transform',
      getter: function() {
        var t = this.transform_.reset();

        t.translate(this.x, this.y, this.z);
        t.rotateX(this.rotateX);
        t.rotateY(this.rotateY);
        t.rotateZ(this.rotateZ);
        t.scale(this.scaleX, this.scaleY, this.scaleZ);

        return t;
      }
    }
  ],

  methods: [
    function paint3D(gl) {
      // TODO: transform
      this.paintSelf(gl);
    },

    function paintSelf(gl) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      gl.enableVertexAttribArray(this.positionAttribute);
      gl.vertexAttribPoint(this.positionAttribute);
      gl.drawArrays(this.drawType, 0, this.vertexCount);
    }
  ]
});


foam.CLASS({
  package: 'foam.graphics',
  name: 'Box',
  extends: 'foam.graphics.CView',

  documentation: 'A CView for drawing a rectangular box.',

  properties: [
    {
      class: 'Float',
      name: 'width'
    },
    {
      class: 'Float',
      name: 'height'
    },
    {
      class: 'Float',
      name: 'borderWidth',
      value: 1
    },
    {
      name: 'border',
      value: '#000000'
    }
  ],

  methods: [
    function paintSelf(x) {
      x.beginPath();
      x.rect(0, 0, this.width, this.height);
      if ( this.border && this.borderWidth ) {
        x.lineWidth = this.borderWidth;
        x.stroke();
      }
      if ( this.color  ) x.fill();
    }
  ]
});


foam.CLASS({
  package: 'foam.graphics',
  name: 'Line',
  extends: 'foam.graphics.CView',

  documentation: 'A CView for drawing a line.',

  properties: [
    {
      class: 'Float',
      name: 'startX',
      getter: function() { return this.x; },
      setter: function(v) { this.x = v; }
    },
    {
      class: 'Float',
      name: 'startY',
      getter: function() { return this.y; },
      setter: function(v) { this.y = v; }
    },
    { class: 'Float',  name: 'endX' },
    { class: 'Float',  name: 'endY' },
    { class: 'Float',  name: 'lineWidth', value: 1 },
    { class: 'String', name: 'color',     value: '#000000' }
  ],

  methods: [
    function paintSelf(x) {
      x.beginPath();
      x.moveTo(0, 0);
      x.lineTo(this.endX-this.x, this.endY-this.y);
      x.lineWidth = this.lineWidth;
      x.strokeStyle = this.color;
      x.stroke();
    },

    function hitTest(p) {
      // There is probably a better way to do this.
      // This checks if the given point is

      // A is the vector from the start of the line to point p
      var ax = p.x - this.startX;
      var ay = p.y - this.startY;

      // B a vector representing the line (from start to end).
      var bx = this.endX - this.startX;
      var by = this.endY - this.startY;
      var blen = Math.sqrt(bx * bx + by * by);

      // Project A onto B
      var scalarProj = (ax * bx + ay * by ) / blen;
      var factor = scalarProj / blen;
      var projX = bx * factor;
      var projY = by * factor;

      // Calculate vector rejection "perpendicular distance"
      var rejX = ax - projX;
      var rejY = ay - projY;

      // Hit's if the perpendicular distance is less than some factor,
      // and the point is within some factor of the line start/finish

      var distance = Math.sqrt(rejX * rejX + rejY * rejY);
      var pos = scalarProj;

      return distance < 5 && pos > -5 && pos < (blen + 5)

      return false;
    }
  ]
});


foam.CLASS({
  package: 'foam.graphics',
  name: 'Polygon',
  extends: 'foam.graphics.CView',

  documentation: 'A CView for drawing a polygon.',

  properties: [
    { class: 'Array', of: 'Float', name: 'xCoordinates' },
    { class: 'Array', of: 'Float', name: 'yCoordinates' },
    { class: 'String', name: 'color', value: '#000' },
    { class: 'Float', name: 'lineWidth', value: 1 }
  ],

  methods: [
    function paintSelf(x) {
      x.beginPath();
      x.moveTo(this.xCoordinates[0], this.yCoordinates[0]);
      for ( var i = 1; i < this.xCoordinates.length; i++ ) {
        x.lineTo(this.xCoordinates[i], this.yCoordinates[i]);
      }
      x.lineWidth = this.lineWidth;
      x.strokeStyle = this.color;
      x.stroke();
    }
  ]
});


foam.CLASS({
  package: 'foam.graphics',
  name: 'Arc',
  extends: 'foam.graphics.CView',

  documentation: 'A CView for drawing an arc.',

  properties: [
    {
      name: 'radius',
      class: 'Float',
      preSet: function(_, r) { return Math.max(0, r); }
    },
    {
      name: 'start',
      class: 'Float'
    },
    {
      name: 'end',
      class: 'Float'
    },
    {
      // TODO: rename this
      name: 'arcWidth',
      class: 'Float'
    },
    {
      name: 'border',
      value: '#000000'
    },
    { name: 'top_',    hidden: true, transient: true, getter: function() { return this.y-this.radius; } },
    { name: 'left_',   hidden: true, transient: true, getter: function() { return this.x-this.radius; } },
    { name: 'bottom_', hidden: true, transient: true, getter: function() { return this.y+this.radius; } },
    { name: 'right_',  hidden: true, transient: true, getter: function() { return this.x+this.radius; } }
  ],

  methods: [
    function paintSelf(x) {
      x.beginPath();
      x.arc(0, 0, this.radius, this.start, this.end);

      if ( this.color ) x.fill();

      if ( this.border ) {
        x.lineWidth = this.arcWidth;
        x.stroke();
      }
    },

    function toE(X) {
      return this.Canvas.create({ cview: this }, X).attrs({
        width: this.x + this.radius + this.arcWidth,
        height: this.y + this.radius + this.arcWidth
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.graphics',
  name: 'Circle',
  extends: 'foam.graphics.Arc',

  documentation: 'A CView for drawing a Circle.',

  properties: [
    {
      name: 'start',
      value: 0,
      view: {
        class: 'foam.u2.view.DualView',
        viewa: { class: 'foam.u2.FloatView', precision: 4, onKey: true },
        viewb: { class: 'foam.u2.RangeView', maxValue: Math.PI*2, step: 0.01, onKey: true }
      }
    },
    {
      name: 'end',
      value: 2*Math.PI,
      view: {
        class: 'foam.u2.view.DualView',
        viewa: { class: 'foam.u2.FloatView', precision: 4, onKey: true },
        viewb: { class: 'foam.u2.RangeView', maxValue: Math.PI*2, step: 0.01, onKey: true }
      }
    }
  ],

  methods: [
    function hitTest(p) {
      var r = this.radius + this.arcWidth/2 - 1;
      return p.x*p.x + p.y*p.y <= r*r;
    },

    function intersects(c) {
      if ( ! c.radius ) return c.intersects(this);
      var r = this.radius + c.radius;
      if ( this.border ) r += this.arcWidth/2-1;
      if ( c.border    ) r += c.arcWidth/2-1;
      var dx = this.x-c.x;
      var dy = this.y-c.y;
      return dx * dx + dy * dy <= r * r;
    }
  ]
});


foam.CLASS({
  package: 'foam.graphics',
  name: 'Ellipse',
  extends: 'foam.graphics.CView',

  documentation: 'A CView for drawing an ellipse.',

  properties: [
    {
      class: 'Float',
      name: 'radiusX',
      preSet: function(_, r) { return Math.max(0, r); }
    },
    {
      class: 'Float',
      name: 'radiusY',
      preSet: function(_, r) { return Math.max(0, r); }
    },
    {
      name: 'start',
      value: 0,
      view: {
        class: 'foam.u2.view.DualView',
        viewa: { class: 'foam.u2.FloatView', precision: 4, onKey: true },
        viewb: { class: 'foam.u2.RangeView', maxValue: Math.PI*2, step: 0.01, onKey: true }
      }
    },
    {
      name: 'end',
      value: 2*Math.PI,
      view: {
        class: 'foam.u2.view.DualView',
        viewa: { class: 'foam.u2.FloatView', precision: 4, onKey: true },
        viewb: { class: 'foam.u2.RangeView', maxValue: Math.PI*2, step: 0.01, onKey: true }
      }
    },
    {
      name: 'borderWidth',
      class: 'Float'
    },
    {
      name: 'border',
      value: '#000000'
    },
    {
      class: 'Float',
      name: 'width',
      getter: function() { return 2 * this.radiusX; },
      setter: function(w) { this.radiusX = w / 2; }
    },
    {
      class: 'Float',
      name: 'height',
      getter: function() { return 2 * this.radiusY; },
      setter: function(h) { this.radiusY = h / 2; }
    },
    { name: 'top_',    hidden: true, transient: true, getter: function() { return this.y; } },
    { name: 'left_',   hidden: true, transient: true, getter: function() { return this.x; } },
    { name: 'bottom_', hidden: true, transient: true, getter: function() { return this.y+2*this.radiusY; } },
    { name: 'right_',  hidden: true, transient: true, getter: function() { return this.x+2*this.radiusX; } },
  ],

  methods: [
    function paintSelf(x) {
      x.beginPath();
      x.ellipse(this.radiusX, this.radiusY, this.radiusX, this.radiusY, 0, this.start, this.end);

      if ( this.color ) x.fill();

      if ( this.border ) {
        x.lineWidth = this.borderWidth;
        x.stroke();
      }
    }

    // TODO: implement intersects()
  ]
});


foam.CLASS({
  package: 'foam.graphics',
  name: 'Point',

  // TODO: where/how is this used?
  // documentation: '',

  properties: [
    {
      class: 'Simple',
      name: 'x'
    },
    {
      class: 'Simple',
      name: 'y'
    },
    {
      class: 'Simple',
      name: 'w'
    }
  ],

  methods: [
    function clone() {
      var p = this.cls_.create();
      p.x = this.x;
      p.y = this.y;
      p.w = this.w;
      return p;
    },

    function toCartesian() {
      // TODO: What is the right name for this function?
      // It's related to perspective transformations
      // It transforms this point from the homogeneous coordinate space
      // to the cartesian coordiate space.

      this.x = this.x / this.w;
      this.y = this.y / this.w;
      this.w = 1;
    }
  ]
});


foam.CLASS({
  package: 'foam.graphics',
  name: 'Canvas',
  extends: 'foam.u2.Element',

  documentation: 'A Canvas U2 Element for drawing CViews in.',

  requires: [
    'foam.input.Pointer'
  ],

  properties: [
    [ 'nodeName', 'CANVAS' ],
    {
      name: 'context',
      factory: function() {
        return this.el().getContext('2d');
      }
    },
    {
      name: 'context3D',
      factory: function() {
        return this.el().getContext('webgl');
      }
    },
    {
      name: 'cview',
      postSet: function(o, n) {
        n.canvas = this;

        if ( this.attributeMap.width === undefined || this.attributeMap.height === undefined ) {
          this.setAttribute('width', n.width);
          this.setAttribute('height', n.height);
        }

        this.paint();
      }
    },
    {
      name: 'pointer',
      factory: function() {
        return this.Pointer.create({ element: this });
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.on('load', this.paint);
      this.cview$.valueSub('invalidated', this.paint);
    },

    function erase() {
      this.el().width = this.el().width;
    }
  ],

  listeners: [
    {
      name: 'paint',
      isFramed: true,
      code: function paintCanvas() {
        // Only paint after being loaded
        if ( this.state !== this.LOADED || ! this.cview ) return;

        var ctx = this.cview.paint3D ? this.context3D : this.context;
        this.erase(ctx);
        if ( this.cview.paint3D ) {
          this.cview.paint3D(ctx);
        } else {
          this.cview.paint(ctx);
        }
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.graphics',
  name: 'Gradient',

  // TODO: where/how is this used?
//   documentation: '',

  properties: [
    'x0', 'y0', 'r0',
    'x1', 'y1', 'r1',
    {
      name: 'radial',
      class: 'Boolean',
      value: false
    },
    {
      name: 'colors',
      factory: function() {
        return [];
      }
    }
  ],

  methods: [
    function toCanvasStyle(x) {
      var t = this;
      var g = this.radial ?
        x.createRadialGradient(t.x0, t.y0, t.r0, t.x1, t.y1, t.r1) :
        x.createLinearGradient(t.x0, t.y0, t.x1, t.y1) ;

      for ( var i = 0 ; i < t.colors.length ; i++ )
        g.addColorStop(t.colors[i][0], t.colors[i][1]);

      return g;
    }
  ]
});

// TODO: add configurable repaint strategy. Ex. explicit, on property change, on child change


foam.CLASS({
  package: 'foam.graphics',
  name:  'Label',
  extends: 'foam.graphics.CView',

  documentation: 'A CView drawing text.',

  properties: [
    {
      class: 'String',
      name:  'text',
      view: { class: 'foam.u2.TextField', onKey: true }
    },
    {
      name:  'align',
      label: 'Alignment',
      value: 'start',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [ 'start', /*'left',*/ 'center', /*'right',*/ 'end' ]
      }
    },
    {
      class: 'String',
      name:  'font'
    },
    {
      class: 'Color',
      name:  'color',
      value: '#000000'
    },
    {
      class: 'Color',
      name: 'border',
      label: 'Border Color'
    },
    {
      class: 'Float',
      name:  'maxWidth',
      label: 'Maximum Width',
      value: -1
    }
  ],

  methods: [
    function paintSelf(c) {
      if ( this.font ) c.font = this.font;

      c.textAlign = this.align;
      c.fillStyle = this.color;

      c.fillText(
        this.text,
          this.align === 'start'  ? 0 :
          this.align === 'center' ? this.width/2 :
          this.width,
        this.height/2+10);

      if ( this.border ) {
        c.strokeStyle = this.border;
        c.strokeRect(0, 0, this.width-1, this.height-1);
      }
    }
  ]
});

/*
a : 1 // H scale
b : 0 // V skew
c : 3821.142407877334 // H move
d : 0 // H skew
e : 1 // V scale
f : -6796.176219640322 // V move
g : 0
h : 0
i : 1
*/
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

foam.CLASS({
  package: 'foam.graphics',
  name: 'ScrollCView',
  extends: 'foam.graphics.CView',

  properties: [
    {
      class: 'Float',
      name: 'width',
      value: 20
    },
    {
      class: 'Float',
      name: 'height',
      value: 100
    },
    {
      class: 'Boolean',
      name: 'vertical',
      value: true
    },
    {
      class: 'Int',
      name: 'value',
//      help: 'The first element being shown, starting at zero.',
      preSet: function(_, value) {
        return Math.max(0, Math.min(this.size-this.extent, value));
      },
      postSet: function(old, nu) {
        if ( old !== nu ) this.invalidated.pub();
      }
    },
    {
      class: 'Int',
      name: 'extent',
//      help: 'Number of elements shown.',
//      minValue: 1, // TODO: add back when minValue supported
      value: 10,
      postSet: function(old, nu) {
        if ( old !== nu ) this.invalidated.pub();
      }
    },
    {
      class: 'Int',
      name: 'size',
//      help: 'Total number of elements being scrolled through.',
      value: 0,
      postSet: function(old, size) {
        if ( old !== size ) this.invalidated.pub();
        // Trigger the preSet for value, so it stays within range.
        this.value = this.value;
      }
    },
    {
      class: 'Int',
      name: 'minHandleSize',
//      help: 'Minimum size to make the drag handle.'
      value: 10
    },
    {
      class: 'Float',
      name: 'handleSize',
      expression: function(minHandleSize, size, extent, height, innerBorder) {
        var h = height - 2 * innerBorder;
        var hs = size > 0 ? extent * h / size : 0;
        return hs < minHandleSize ? minHandleSize : hs;
      }
    },
    {
      class: 'Int',
      name: 'innerBorder',
      value: 2
    },
    {
      class: 'String',
      name: 'handleColor',
      value: 'rgb(107,136,173)'
    },
    {
      class: 'String',
      name: 'borderColor',
      value: '#999'
    },
    {
      name: 'yMax',
      expression: function(height, innerBorder, handleSize)  {
        return height - innerBorder - handleSize;
      }
    },
    {
      name: 'rate',
      expression: function(size, extent, yMax, innerBorder) {
        return size ? ( yMax - innerBorder ) / (size - extent) : 0;
      }
    }
  ],

  methods: [
    function initCView() {
      this.canvas.pointer.touch.sub(this.onTouch);
    },

    function yToValue(y) {
      return ( y - this.innerBorder ) / this.rate;
    },

    function valueToY(value) {
      return value * this.rate + this.innerBorder;
    },

    function paintSelf(c) {
      if ( ! this.size ) return;

      if ( ! c ) return;

      if ( this.extent >= this.size ) return;

      c.strokeStyle = this.borderColor;
      c.lineWidth = 0.4;
      c.strokeRect(0, 0, this.width-7, this.height);

      c.fillStyle = this.handleColor;

      c.fillRect(
        2,
        this.valueToY(this.value),
        this.width - 11,
        this.handleSize);
    }
  ],

  listeners: [
    {
      name: 'onTouch',
      code: function(s, _, touch) {
        var self = this;
        var p = foam.graphics.Point.create();

        touch.claimed = true;

        function updateValue() {
          p.x = touch.x;
          p.y = touch.y - (self.handleSize/2);
          p.w = 1;

          self.globalToLocalCoordinates(p);

          self.value = self.yToValue(p.y);
        }

        touch.onDetach(touch.sub('propertyChange', updateValue));
        updateValue();
      }
    }
  ]
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.physics',
  name: 'PhysicalCircle',
  extends: 'foam.graphics.Circle',
  implements: [ 'foam.physics.Physical' ],

  documentation: 'A Circle with Physical support.'
});
/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.comics',
  name: 'DAOController',

  topics: [
    'finished'
  ],

  properties: [
    {
      name: 'data',
      hidden: true
    },
    {
      name: 'predicate',
      view: { class: 'foam.u2.view.RecipricalSearch' }
    },
    {
      name: 'filteredDAO',
      view: { class: 'foam.u2.view.ScrollTableView' },
      expression: function(data, predicate) {
        return predicate ? data.where(predicate) : data;
      }
    },
    {
      name: 'relationship'
    },
    {
      name: 'selection',
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'isSelecting',
      documentation: "True if we are in a state where we're selecting an item from the DAO.  This enables the 'Add' button.",
      value: false
    }
  ],

  actions: [
    {
      name: 'create',
      code: function() { }
    },
    {
      name: 'edit',
      isEnabled: function(selection) { return !! selection; },
      code: function() {
        this.pub('edit', this.selection.id);
      }
    },
    {
      name: 'findRelatedObject',
      label: 'Add',
      isAvailable: function(relationship, isSelecting) {
        return !! ( relationship && relationship.junctionDAO ) && ! isSelecting;
      },
      code: function() { }
    },
    {
      name: 'addSelection',
      label: 'Add',
      isAvailable: function(isSelecting) { return isSelecting; },
      code: function() {
        var self = this;
        this.relationship.add(this.selection).then(function() {
          self.finished.pub();
        });
      }
    },
    {
      name: 'select',
      isAvailable: function() { },
      code: function() {
        this.pub('select', this.selection.id);
      }
    }
  ]
});
/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.comics',
  name: 'DAOControllerView',
  extends: 'foam.u2.View',

  requires: [
    'foam.comics.DAOController'
  ],

  imports: [
    'stack',
    'data? as importedData'
  ],

  exports: [
    'data.selection as selection',
    'data.data as dao'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.comics.DAOController',
      name: 'data',
      expression: function(importedData) { return importedData; },
    },
    {
      name: 'cls',
      expression: function(data) { return data.cls_; }
    }
  ],

  reactions: [
    [ 'data', 'action.create', 'onCreate' ],
    [ 'data', 'edit', 'onEdit' ],
    [ 'data', 'action.findRelatedObject', 'onFindRelated' ],
    [ 'data', 'finished', 'onFinished']
  ],

  methods: [
    function initE() {
      this.
        start('table').
          start('tr').
            start('td').add(this.cls.PREDICATE).end().
            start('td').style({ 'vertical-align': 'top', 'width': '100%' }).
              add(this.cls.FILTERED_DAO).
            end().
          end().
          start('tr').
            show(this.mode$.map(function(m) { return m == foam.u2.DisplayMode.RW; })).
            start('td').add(this.cls.getAxiomsByClass(foam.core.Action)).end().
          end().
        end();
    }
  ],

  listeners: [
    function onCreate() {
      this.stack.push({
        class: 'foam.comics.DAOCreateControllerView'
      }, this);
    },

    function onEdit(s, edit, id) {
      this.stack.push({
        class: 'foam.comics.DAOUpdateControllerView',
        key: id
      }, this);
    },

    function onFindRelated() {
      var data = this.DAOController.create({
        data: this.data.relationship.targetDAO,
        isSelecting: true,
        relationship: this.data.relationship
      });

      this.stack.push({
        class: 'foam.comics.DAOControllerView',
        data: data
      }, this);
    },

    function onFinished() {
      this.stack.back();
    }
  ],
});
/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.comics',
  name: 'InlineDAOControllerView',
  extends: 'foam.comics.DAOControllerView',
  methods: [
    function initE() {
      this.
        add(this.cls.FILTERED_DAO).
        start('span').
          show(this.mode$.map(function(m) { return m == foam.u2.DisplayMode.RW; })).
          add(this.cls.getAxiomsByClass(foam.core.Action)).
        end();
    }
  ]
});
/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.comics',
  name: 'DAOCreateController',

  topics: [
    'finished'
  ],

  properties: [
    {
      name: 'dao'
    },
    {
      name: 'data',
      view: { class: 'foam.u2.DetailView' },
      factory: function() {
        return this.dao.of.create();
      }
    }
  ],

  actions: [
    {
      name: 'save',
      code: function() {
        var self = this;
        this.dao.put(this.data.clone()).then(function() {
          self.finished.pub();
        }, function(e) {
          // TODO: Display error in view.
          console.error(e);
        });
      }
    },
    {
      name: 'cancel',
      code: function() {
        this.finished.pub();
      }
    }
  ]
});
/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.comics',
  name: 'DAOCreateControllerView',
  extends: 'foam.u2.View',
  requires: [
    'foam.comics.DAOCreateController',
  ],

  imports: [
    'stack',
    'dao'
  ],

  exports: [
    'data'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.comics.DAOCreateController',
      name: 'data',
      factory: function() {
        return this.DAOCreateController.create({ dao: this.dao });
      }
    }
  ],

  reactions: [
    [ 'data', 'finished', 'onFinished' ]
  ],

  methods: [
    function initE() {
      this.
        add(this.DAOCreateController.DATA,
            this.DAOCreateController.SAVE,
            this.DAOCreateController.CANCEL);
    }
  ],

  listeners: [
    function onFinished() {
      this.stack.back();
    }
  ]
});
/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.comics',
  name: 'DAOUpdateController',

  topics: [
    'finished'
  ],

  properties: [
    {
      name: 'dao'
    },
    {
      name: 'data'
    },
    {
      name: 'obj',
      view: { class: 'foam.u2.DetailView', showActions: true },
      factory: function() {
        var self = this;
        this.dao.find(this.data).then(function(obj) {
          self.obj = obj.clone();
        });
        return null;
      }
    }
  ],

  actions: [
    {
      name: 'save',
      isEnabled: function(obj) { return !! obj; },
      code: function() {
        var self = this;
        this.dao.put(this.obj.clone()).then(function() {
          self.finished.pub();
        }, function(e) {
          // TODO: Display error in view.
          console.error(e);
        });
      }
    },
    {
      name: 'delete',
      isEnabled: function(obj) { return !! obj; },
      code: function() {
        var self = this;
        this.dao.remove(this.obj).then(function() {
          self.finished.pub();
        }, function(e) {
          // TODO: Display error in view.
          console.error(e);
        });
      }
    }
  ]
});
/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.comics',
  name: 'DAOUpdateControllerView',
  extends: 'foam.u2.View',
  requires: [
    'foam.comics.DAOUpdateController'
  ],

  imports: [
    'stack',
    'dao'
  ],

  exports: [
    'data'
  ],

  properties: [
    {
      name: 'key'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.DAOUpdateController',
      name: 'data',
      factory: function() {
        return this.DAOUpdateController.create({
          data: this.key,
          dao: this.dao
        });
      }
    }
  ],

  reactions: [
    [ 'data', 'finished', 'onFinished' ]
  ],

  methods: [
    function initE() {
      this.
        add(this.DAOUpdateController.OBJ,
            this.DAOUpdateController.SAVE,
            this.DAOUpdateController.DELETE);
    }
  ],

  listeners: [
    function onFinished() {
      this.stack.back();
    }
  ]
});
/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.comics',
  name: 'BrowserView',
  extends: 'foam.u2.View',
  requires: [
    'foam.comics.DAOController',
    'foam.comics.DAOControllerView'
  ],
  exports: [
    'controller as data'
  ],
  properties: [
    {
      name: 'data',
    },
    {
      name: 'controller',
      expression: function(data) {
        return this.DAOController.create({ data: data });
      }
    }
  ],
  methods: [
    function initE() {
      this.tag(this.DAOControllerView);
    }
  ]
});
/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.comics',
  name: 'InlineBrowserView',
  extends: 'foam.comics.BrowserView',
  requires: [
    'foam.comics.InlineDAOControllerView as DAOControllerView'
  ]
});
/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.comics',
  name: 'RelationshipView',
  extends: 'foam.comics.InlineBrowserView',
  properties: [
    {
      name: 'controller',
      expression: function(data) {
        return this.DAOController.create({
          data: data.dao,
          relationship: data
        });
      }
    }
  ]
});
/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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
foam.CLASS({
  package: 'foam.u2.view',
  name: 'RecipricalSearch',
  extends: 'foam.u2.Element',
  requires: [
    'foam.u2.search.SearchManager'
  ],
  imports: [
    'dao'
  ],
  exports: [
    'as filterController',
    'as data'
  ],
  properties: [
    {
      class: 'Class',
      name: 'of'
    },
    {
      name: 'data'
    },
    {
      class: 'Array',
      name: 'filters',
      factory: null,
      expression: function(dao) {
        var of = dao && dao.of;
        return ! of ? [] :
          of.model_.tableColumns ? of.model_.tableColumns :
          of.getAxiomsByClass(foam.core.Property).
          filter(function(p) { return ! p.hidden }).
          map(foam.core.Property.NAME.f);
      }
    }
  ],
  methods: [
    function initE() {
      var self = this;

      // TODO: Add "n of m selected" header.
      this.
        add(this.slot(function(filters) {
          var searchManager = self.SearchManager.create({
            dao$: self.dao$,
            predicate$: self.data$
          });

          var e = this.E('div');

          e.onDetach(searchManager);

          e.forEach(filters, function(f) {
            // TODO: See if this can be cleaned up somehow, if searchView didn't require the proprety explicitly, or
            // could find the search manager via the context and add itself to that.
            var axiom = self.dao.of.getAxiomByName(f);
            var spec  = axiom.searchView;
            var view  = foam.u2.ViewSpec.createView(spec, { property: axiom, dao: self.dao }, this, this.__subSubContext__);

            searchManager.add(view);
            this.add(axiom.label, view);
          });

          return e;
        }, this.filters$), this.CLEAR);
    },
    function addFilter(key) {
      this.filters = this.filters.concat(key);
    },
    function removeFilter(key) {
      this.filters = this.filters.filter(function(k) {
        return key !== k;
      });
    }
  ],
  actions: [
    {
      name: 'clear',
      code: function() {
        this.data = undefined;
        this.filters = this.filters.slice();
      }
    }
  ]
});
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

foam.CLASS({
  package: 'foam.net',
  name: 'HTTPMethod',
  extends: 'foam.core.Method',

  documentation: `
  A method that is configured to call a service over HTTP.
  No code or function body is required here, as the actual body is generated to
  call the remote service. This will always return a promise that supplies the
  return value of the service call.

  <p>Overriding by an HTTPMethod is not supported. You can override an
  HTTPMethod with a normal one.
  `,

  requires: [
    'foam.net.HTTPArgument',
    'foam.core.Imports'
  ],

  constants: {
    OUTPUTTER: {
      __proto__: foam.json.Strict,
      outputDefaultValues: false,
      outputClassNames: false
    }
  },

  properties: [
    {
      /** The path prefix. Parameters may add to the path */
      name: 'path'
    },
    {
      name: 'httpMethod',
      value: 'GET',
    },
    {
      /** The args to call with, in order */
      class: 'FObjectArray',
      name: 'args',
      of: 'foam.net.HTTPArgument',
      factory: function() { return []; }
    },
    {
      /** If the request should build a request body object and fill in the
        supplied args, the request object's Class is specified here. */
      class: 'Class',
      name: 'buildRequestType',
    },
    {
      /** HTTPMethods will always return a Promise, but the Promise will pass
        along a parameter of the type specified here. */
      name: 'promisedType',
      of: 'foam.core.Argument'
    },
    [ 'returns', 'Promise' ],
    {
      /** The name of the HTTP factory to import at run time. Instances of
        HTTPMethod on a class will cause the class to import this name, and
        when called will call hostInstance.yourHttpFactoryName.create() to
        create a partially filled request object. */
      name: 'HTTPRequestFactoryName',
      value: 'HTTPRequestFactory'
    },
    {
      name: 'code',
      required: false,
      transient: true,
      expression: function(args) {
        // set up function with correct args, pass them into the
        // actual implementation, callRemote_()
        var axiom = this;
        // Get list of argument names
        var argNames = args.map(axiom.HTTPArgument.NAME.f);
        // load named values into opt_args object and pass to the generic callRemote_()
        return function() {
          var opt_args = {};
          for ( var i = 0; i < arguments.length && i < argNames.length; i ++ ) {
            opt_args[argNames[i]] = arguments[i];
          }
          return axiom.callRemote_(opt_args, this);
        }

      }
    }
  ],

  methods: [
    function installInClass(c) {
      // add an import for the HTTPRequestFactory on our host class

      // May have many HTTPMethods in a host class, but only do service import once.
      var existing = c.getAxiomByName(this.HTTPRequestFactoryName);
      foam.assert( existing,
        "HTTPMethod installInClass did not find an import or property", this.HTTPRequestFactoryName, ".",
        "Provide one, or set HTTPMethod.HTTPRequestFactoryName to the name of your request factory function.");
    },

    function installInProto(p) {
      // set code on proto
      p[this.name] = this.code;
    },

    function callRemote_(opt_args, host) {
      foam.assert( typeof host[this.HTTPRequestFactoryName] === 'function',
        "HTTPMethod call can't find HTTPRequestFactory",
        this.HTTPRequestFactoryName, "on", host);

      // 'this' is the axiom instance
      var self = this;
      var path = this.path;
      var query = "";
      var request = host[this.HTTPRequestFactoryName]();

      // if building a request object, start with an empty instance
      var requestObject = self.buildRequestType ?
        self.buildRequestType.create(undefined, foam.__context__) : null;

      // add on args passed as part of the path or query
      self.args.forEach(function(param) {
        var val = opt_args[param.name];
        if ( typeof val === 'undefined' ) return; // skip missing args // TODO: assert non-optional

        // put the dot back if we removed one from the name
        var pname = param.name.replace('__dot__','.');
        if ( param.location === 'body' ) {
          // set the request body content
          // TODO: assert it's the first param, no more than one body
          if ( requestObject ) {
            throw "Can't set both RequestObject " +
              self.buildRequestType + " and param.location==body for " + pname;
          }
          request.payload = self.OUTPUTTER.stringify(val);
        } else if ( param.location === 'path' ) {
          // find the placeholder and replace it
          path = path.replace("{"+pname+"}", val.toString());
          if ( requestObject ) requestObject[pname] = val;
        } else if ( param.location === 'query' ) {
          // add to query string
          query += "&" + pname + "=" + val.toString();
          if ( requestObject ) requestObject[pname] = val;
        }
      });
      path = path + ( query ? "?" + query.substring(1) : "" );
      request.path += path;
      request.method = self.httpMethod;
      if ( requestObject ) {
        request.payload = self.OUTPUTTER.stringify(requestObject);
      }

      return request.send().then(function(response) {
        if ( response.status >= 400 ) {
          throw "HTTP error status: " + response.status;
        }
        foam.assert(response.responseType === 'json', "HTTPMethod given a request not configured to return JSON", request);
        return response.payload.then(function(json) {
          if ( ! self.promisedType ) {
            // no return
            return;
          }
          if ( ! self.promisedType.type ) { // TODO: should not need this check. Getter in Arg.type?
            self.promisedType.type = foam.lookup(self.promisedType.typeName, true);
          }
          if ( self.promisedType.type ) {
            // a modelled return type
            return self.promisedType.type.create(json, host);
          }
          // else return raw json
          return json;
        });
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.net',
  name: 'HTTPArgument',
  extends: 'foam.core.Argument',

  properties: [
    {
      /** The location to put this value in the request: 'query', 'path', or 'body' */
      name: 'location',
      value: 'query',
    }
  ]
});
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

(function() {
  var pkg = 'foam.net.' + (foam.isServer ? 'node' : 'web');
  var clss = [
    'HTTPRequest',
    'HTTPResponse',
    'WebSocket',
    'WebSocketService'
  ];

  // For each class with a "web" (browser) and "node" (Node JS)
  // implementation, register "foam.net.[environment].[class]" as
  // "foam.net.[class]".
  //
  // TODO: This should be provided via a sort of "ContextFactory" or similar.
  for ( var i = 0; i < clss.length; i++ ) {
    foam.register(foam.lookup(pkg + '.' + clss[i]), 'foam.net.' + clss[i]);
  }
})();
/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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

(function() {
  // By decree of:
  // http://xahlee.info/js/html5_non-closing_tag.html
  var selfClosingNodeNames = {
    area: true,
    base: true,
    br: true,
    col: true,
    command: true,
    embed: true,
    hr: true,
    img: true,
    input: true,
    keygen: true,
    link: true,
    meta: true,
    param: true,
    source: true,
    track: true,
    wbr: true
  };

  // By decree of:
  // http://www.theukwebdesigncompany.com/articles/entity-escape-characters.php
  var escapes = {
    '#100': 'd',
    '#101': 'e',
    '#102': 'f',
    '#103': 'g',
    '#104': 'h',
    '#105': 'i',
    '#106': 'j',
    '#107': 'k',
    '#108': 'l',
    '#109': 'm',
    '#110': 'n',
    '#111': 'o',
    '#112': 'p',
    '#113': 'q',
    '#114': 'r',
    '#115': 's',
    '#116': 't',
    '#117': 'u',
    '#118': 'v',
    '#119': 'w',
    '#120': 'x',
    '#121': 'y',
    '#122': 'z',
    '#123': '{',
    '#124': '|',
    '#125': '}',
    '#126': '~',
    '#160': ' ',
    '#161': '¡',
    '#162': '¢',
    '#163': '£',
    '#164': '¤',
    '#165': '¥',
    '#166': '¦',
    '#167': '§',
    '#168': '¨',
    '#169': '©',
    '#170': 'ª',
    '#171': '«',
    '#172': '¬',
    '#174': '®',
    '#175': '¯',
    '#176': '°',
    '#177': '±',
    '#178': '²',
    '#179': '³',
    '#180': '´',
    '#181': 'µ',
    '#182': '¶',
    '#183': '·',
    '#184': '¸',
    '#185': '¹',
    '#186': 'º',
    '#187': '»',
    '#188': '¼',
    '#189': '½',
    '#19': 'Å',
    '#190': '¾',
    '#191': '¿',
    '#192': 'À',
    '#193': 'Á',
    '#194': 'Â',
    '#195': 'Ã',
    '#196': 'Ä',
    '#198': 'Æ',
    '#199': 'Ç',
    '#200': 'È',
    '#201': 'É',
    '#202': 'Ê',
    '#203': 'Ë',
    '#204': 'Ì',
    '#205': 'Í',
    '#206': 'Î',
    '#207': 'Ï',
    '#208': 'Ð',
    '#209': 'Ñ',
    '#210': 'Ò',
    '#211': 'Ó',
    '#212': 'Ô',
    '#213': 'Õ',
    '#214': 'Ö',
    '#215': '×',
    '#216': 'Ø',
    '#217': 'Ù',
    '#218': 'Ú',
    '#219': 'Û',
    '#220': 'Ü',
    '#221': 'Ý',
    '#222': 'Þ',
    '#223': 'ß',
    '#224': 'à',
    '#225': 'á',
    '#226': 'â',
    '#227': 'ã',
    '#228': 'ä',
    '#229': 'å',
    '#23': 'í',
    '#230': 'æ',
    '#231': 'ç',
    '#232': 'è',
    '#233': 'é',
    '#234': 'ê',
    '#235': 'ë',
    '#236': 'ì',
    '#238': 'î',
    '#239': 'ï',
    '#240': 'ð',
    '#241': 'ñ',
    '#242': 'ò',
    '#243': 'ó',
    '#244': 'ô',
    '#245': 'õ',
    '#246': 'ö',
    '#247': '÷',
    '#248': 'ø',
    '#249': 'ù',
    '#250': 'ú',
    '#251': 'û',
    '#252': 'ü',
    '#253': 'ý',
    '#254': 'þ',
    '#255': 'ÿ',
    '#256': 'Ā',
    '#257': 'ā',
    '#258': 'Ă',
    '#259': 'ă',
    '#260': 'Ą',
    '#261': 'ą',
    '#262': 'Ć',
    '#263': 'ć',
    '#264': 'Ĉ',
    '#265': 'ĉ',
    '#266': 'Ċ',
    '#267': 'ċ',
    '#268': 'Č',
    '#269': 'č',
    '#27': 'ĕ',
    '#270': 'Ď',
    '#271': 'ď',
    '#272': 'Đ',
    '#273': 'đ',
    '#274': 'Ē',
    '#275': 'ē',
    '#276': 'Ĕ',
    '#278': 'Ė',
    '#279': 'ė',
    '#280': 'Ę',
    '#281': 'ę',
    '#282': 'Ě',
    '#283': 'ě',
    '#284': 'Ĝ',
    '#285': 'ĝ',
    '#286': 'Ğ',
    '#287': 'ğ',
    '#288': 'Ġ',
    '#289': 'ġ',
    '#290': 'Ģ',
    '#291': 'ģ',
    '#292': 'Ĥ',
    '#293': 'ĥ',
    '#294': 'Ħ',
    '#295': 'ħ',
    '#296': 'Ĩ',
    '#297': 'ĩ',
    '#298': 'Ī',
    '#299': 'ī',
    '#300': 'Ĭ',
    '#301': 'ĭ',
    '#302': 'Į',
    '#303': 'į',
    '#304': 'İ',
    '#305': 'ı',
    '#306': 'Ĳ',
    '#307': 'ĳ',
    '#308': 'Ĵ',
    '#309': 'ĵ',
    '#31': 'Ľ',
    '#310': 'Ķ',
    '#311': 'ķ',
    '#312': 'ĸ',
    '#313': 'Ĺ',
    '#314': 'ĺ',
    '#315': 'Ļ',
    '#316': 'ļ',
    '#318': 'ľ',
    '#319': 'Ŀ',
    '#32': ' ',
    '#320': 'ŀ',
    '#321': 'Ł',
    '#322': 'ł',
    '#323': 'Ń',
    '#324': 'ń',
    '#325': 'Ņ',
    '#326': 'ņ',
    '#327': 'Ň',
    '#328': 'ň',
    '#329': 'ŉ',
    '#33': '!',
    '#330': 'Ŋ',
    '#331': 'ŋ',
    '#332': 'Ō',
    '#333': 'ō',
    '#334': 'Ŏ',
    '#335': 'ŏ',
    '#336': 'Ő',
    '#337': 'ő',
    '#338': 'Œ',
    '#339': 'œ',
    '#34': '"',
    '#340': 'Ŕ',
    '#340': 'Ŕ',
    '#341': 'ŕ',
    '#341': 'ŕ',
    '#342': 'Ŗ',
    '#342': 'Ŗ',
    '#343': 'ŗ',
    '#343': 'ŗ',
    '#344': 'Ř',
    '#344': 'Ř',
    '#345': 'ř',
    '#345': 'ř',
    '#346': 'Ś',
    '#346': 'Ś',
    '#347': 'ś',
    '#347': 'ś',
    '#348': 'Ŝ',
    '#348': 'Ŝ',
    '#349': 'ŝ',
    '#349': 'ŝ',
    '#35': '#',
    '#35': 'ť',
    '#350': 'Ş',
    '#350': 'Ş',
    '#351': 'ş',
    '#351': 'ş',
    '#352': 'Š',
    '#352': 'Š',
    '#353': 'š',
    '#353': 'š',
    '#354': 'Ţ',
    '#354': 'Ţ',
    '#355': 'ţ',
    '#355': 'ţ',
    '#356': 'Ť',
    '#356': 'Ť',
    '#358': 'Ŧ',
    '#358': 'Ŧ',
    '#359': 'ŧ',
    '#359': 'ŧ',
    '#36': '$',
    '#360': 'Ũ',
    '#360': 'Ũ',
    '#361': 'ũ',
    '#361': 'ũ',
    '#362': 'Ū',
    '#362': 'Ū',
    '#363': 'ū',
    '#363': 'ū',
    '#364': 'Ŭ',
    '#364': 'Ŭ',
    '#365': 'ŭ',
    '#365': 'ŭ',
    '#366': 'Ů',
    '#366': 'Ů',
    '#367': 'ů',
    '#367': 'ů',
    '#368': 'Ű',
    '#368': 'Ű',
    '#369': 'ű',
    '#369': 'ű',
    '#37': '%',
    '#37': 'Ź',
    '#370': 'Ų',
    '#370': 'Ų',
    '#371': 'ų',
    '#371': 'ų',
    '#372': 'Ŵ',
    '#372': 'Ŵ',
    '#373': 'ŵ',
    '#373': 'ŵ',
    '#374': 'Ŷ',
    '#374': 'Ŷ',
    '#375': 'ŷ',
    '#375': 'ŷ',
    '#376': 'Ÿ',
    '#376': 'Ÿ',
    '#377': 'Ź',
    '#378': 'ź',
    '#378': 'ź',
    '#379': 'Ż',
    '#379': 'Ż',
    '#38': '&',
    '#380': 'ż',
    '#380': 'ż',
    '#381': 'Ž',
    '#381': 'Ž',
    '#382': 'ž',
    '#382': 'ž',
    '#383': 'ſ',
    '#383': 'ſ',
    '#39': '\'',
    '#40': '(',
    '#41': ')',
    '#42': '*',
    '#43': '+',
    '#44': ',',
    '#45': '-',
    '#46': '.',
    '#47': '/',
    '#48': '0',
    '#49': '1',
    '#50': '2',
    '#51': '3',
    '#52': '4',
    '#53': '5',
    '#54': '6',
    '#55': '7',
    '#56': '8',
    '#57': '9',
    '#577': 'ť',
    '#58': ':',
    '#59': ';',
    '#60': '<',
    '#61': '=',
    '#62': '>',
    '#63': '?',
    '#64': '@',
    '#65': 'A',
    '#66': 'B',
    '#67': 'C',
    '#68': 'D',
    '#69': 'E',
    '#70': 'F',
    '#71': 'G',
    '#72': 'H',
    '#73': 'I',
    '#74': 'J',
    '#75': 'K',
    '#76': 'L',
    '#77': 'M',
    '#78': 'N',
    '#79': 'O',
    '#80': 'P',
    '#81': 'Q',
    '#82': 'R',
    '#83': 'S',
    '#84': 'T',
    '#8482': '™',
    '#85': 'U',
    '#86': 'V',
    '#87': 'W',
    '#88': 'X',
    '#89': 'Y',
    '#90': 'Z',
    '#91': '[',
    '#92': '\\',
    '#93': ']',
    '#94': '^',
    '#95': '_',
    '#96': '`',
    '#97': 'a',
    '#98': 'b',
    '#99': 'c',
    '&#173;': '',
    'AElig': 'Æ',
    'Aacute': 'Á',
    'Acirc': 'Â',
    'Agrave': 'À',
    'Aring': 'Å',
    'Atilde': 'Ã',
    'Auml': 'Ä',
    'Ccedil': 'Ç',
    'ETH': 'Ð',
    'Eacute': 'É',
    'Ecirc': 'Ê',
    'Egrave': 'È',
    'Euml': 'Ë',
    'Iacute': 'Í',
    'Icirc': 'Î',
    'Igrave': 'Ì',
    'Iuml': 'Ï',
    'Ntilde': 'Ñ',
    'Oacute': 'Ó',
    'Ocirc': 'Ô',
    'Ograve': 'Ò',
    'Oslash': 'Ø',
    'Otilde': 'Õ',
    'Ouml': 'Ö',
    'THORN': 'Þ',
    'Uacute': 'Ú',
    'Ucirc': 'Û',
    'Ugrave': 'Ù',
    'Uuml': 'Ü',
    'Yacute': 'Ý',
    'aacute': 'á',
    'acirc': 'â',
    'acute': '´',
    'aelig': 'æ',
    'agrave': 'à',
    'amp': '&',
    'aring': 'å',
    'atilde': 'ã',
    'auml': 'ä',
    'brvbar': '¦',
    'ccedil': 'ç',
    'cedil': '¸',
    'cent': '¢',
    'copy': '©',
    'curren': '¤',
    'deg': '°',
    'divide': '÷',
    'eacute': 'é',
    'ecirc': 'ê',
    'egrave': 'è',
    'eth': 'ð',
    'euml': 'ë',
    'euro': '€',
    'frac12': '½',
    'frac14': '¼',
    'frac34': '¾',
    'gt': '>',
    'iacute': 'í',
    'icirc': 'î',
    'iexcl': '¡',
    'igrave': 'ì',
    'iquest': '¿',
    'iuml': 'ï',
    'lt': '<',
    'macr': '¯',
    'micro': 'µ',
    'middot': '·',
    'nbsp': ' ',
    'nbsp': '',
    'not': '¬',
    'ntilde': 'ñ',
    'oacute': 'ó',
    'ocirc': 'ô',
    'ograve': 'ò',
    'ordf': 'ª',
    'ordm': 'º',
    'oslash': 'ø',
    'otilde': 'õ',
    'ouml': 'ö',
    'para': '¶',
    'plusmn': '±',
    'pound': '£',
    'quot': '"',
    'raquo': '»',
    'reg': '®',
    'sect': '§',
    'shy': '',
    'sup1': '¹',
    'sup2': '²',
    'sup3': '³',
    'szlig': 'ß',
    'thorn': 'þ',
    'times': '×',
    'uacute': 'ú',
    'ucirc': 'û',
    'ugrave': 'ù',
    'uml': '¨',
    'uuml': 'ü',
    'yacute': 'ý',
    'yen': '¥',
  };

  foam.LIB({
    name: 'foam.parsers.html',

    methods: [
      function getHtmlEscapeChar(id) {
        return escapes[id];
      },
      function isSelfClosing(nodeName) {
        return selfClosingNodeNames[nodeName];
      }
    ]
  });
})();
/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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

foam.ENUM({
  package: 'foam.parsers',
  name: 'TagType',

  values: [
    { name: 'OPEN',       label: 'Open' },
    { name: 'CLOSE',      label: 'Close' },
    { name: 'OPEN_CLOSE', label: 'Open & Close' }
  ]
});


foam.CLASS({
  package: 'foam.parsers',
  name: 'Tag',

  properties: [
    {
      class: 'Enum',
      of: 'foam.parsers.TagType',
      name: 'type',
      factory: function() { return foam.parser.TagType.OPEN; }
    },
    {
      class: 'String',
      name: 'nodeName',
      value: 'div'
    }
    // TODO(markdittmer): Add attributes.
  ]
});


foam.CLASS({
  package: 'foam.parsers',
  name: 'Embed',
  extends: 'foam.parsers.Tag',

  properties: [
    {
      name: 'type',
      factory: function() { return foam.parser.TagType.OPEN_CLOSE; }
    },
    'content'
  ]

});


foam.CLASS({
  package: 'foam.parsers',
  name: 'HTMLLexer',

  documentation: `Parse an HTML string into a flat sequence of tags and
      strings.`,

  requires: [
    'foam.parse.ImperativeGrammar',
    'foam.parse.Parsers',
    'foam.parse.StringPS',
    'foam.parsers.Embed',
    'foam.parsers.Tag',
    'foam.parsers.TagType'
  ],

  axioms: [
    foam.pattern.Singleton.create()
  ],

  properties: [
    {
      name: 'lib',
      factory: function() { return foam.parsers.html; }
    },
    {
      name: 'symbolsFactory',
      value: function(
          seq1, sym, seq, repeat, alt, optional, str, plus, notChars, repeat0,
          not, anyChar, range, literalIC) {
        var openTag = this.openTag_.bind(this, seq, sym);
        var closeTag = this.closeTag_.bind(this, seq, sym);

        return {
          START: seq1(1, optional(sym('header')), sym('html')),

          html: repeat(sym('htmlPart')),

          htmlPart: alt(
              sym('cdata'),
              sym('comment'),
              sym('text'),

              // "embed" is specific tag types; must come before "openTag".
              sym('embed'),
              sym('maybeEmbed'),

              sym('closeTag'),
              sym('openTag')),

          openTag: seq(
              '<',
              sym('whitespace'),
              sym('tagName'),
              sym('whitespace'),
              sym('attributes'),
              sym('whitespace'),
              optional('/'),
              sym('whitespace'),
              '>'),

          closeTag: seq1(3,
                       '<',
                       sym('whitespace'),
                       '/',
                       sym('tagName'),
                       sym('whitespace'),
                       '>'),

          header: seq(
            sym('whitespace'),
            optional(sym('langTag')),
            sym('whitespace'),
            optional(sym('doctype')),
            sym('whitespace')),

          langTag: seq('<?', repeat0(notChars('?')), '?>'),

          doctype: seq('<!', literalIC('DOCTYPE'), sym('whitespace'),
                       repeat0(sym('doctypePart')), '>'),

          doctypePart: alt(plus(notChars('[>', anyChar())),
                           seq('[', repeat0(notChars(']', anyChar())), ']')),

          cdata: seq1(1,
                      '<![CDATA[', str(repeat(not(']]>', anyChar()))), ']]>'),

          comment: seq('<!--', repeat0(not('-->', anyChar())), '-->'),

          attributes: repeat(sym('attribute'), sym('whitespace')),

          label: str(plus(notChars(' =/\t\r\n<>'))),

          tagName: sym('label'),

          text: str(plus(alt(sym('escape'), notChars('<')))),

          escape: str(seq1(1, '&', repeat(range('a', 'z')), ';')),

          attribute: seq(sym('label'), optional(
              seq1(3, sym('whitespace'), '=', sym('whitespace'),
                   sym('value')))),

          value: str(alt(
              plus(notChars('\'" \t\r\n<>')),
              // TODO(markdittmer): Support proper escaping inside strings.
              seq1(1, '"', repeat(notChars('"', anyChar())), '"'),
              seq1(1, "'", repeat(notChars("'", anyChar())), "'"))),

          embed: alt(sym('script'), sym('style'), sym('xmp')),

          maybeEmbed: alt(sym('pre'), sym('code')),

          script: seq(
              openTag('script'),
              str(repeat(not(closeTag('script'), anyChar()))),
              closeTag('script')),

          style: seq(
              openTag('style'),
              str(repeat(not(closeTag('style'), anyChar()))),
              closeTag('style')),

          xmp: seq(
              openTag('xmp'),
              str(repeat(not(closeTag('xmp'), anyChar()))),
              closeTag('xmp')),

          pre: seq(
              openTag('pre'),
              str(repeat(not(closeTag('pre'), anyChar()))),
              closeTag('pre')),

          code: seq(
              openTag('code'),
              str(repeat(not(closeTag('code'), anyChar()))),
              closeTag('code')),

          whitespace: repeat0(alt(' ', '\t', '\r', '\n'))
        };
      }
    },
    {
      name: 'symbols',
      factory: function() {
        return foam.Function.withArgs(
          this.symbolsFactory,
          this.Parsers.create(),
          this
        );
      }
    },
    {
      name: 'actions',
      factory: function() {
        var self  = this;
        var lib   = self.lib;
        var Tag   = self.Tag;
        var Embed = self.Embed;
        var OPEN  = self.TagType.OPEN;
        var CLOSE = self.TagType.CLOSE;
        var OPEN_CLOSE = self.TagType.OPEN_CLOSE;

        return {
          openTag: function(v) {
            // TODO(markdittmer): Add attributes.
            return Tag.create({
              type: v[6] || lib.isSelfClosing(v[2]) ? OPEN_CLOSE : OPEN,
              nodeName: v[2]
            });
          },

          closeTag: function(v) {
            return Tag.create({ type: CLOSE, nodeName: v });
          },

          escape: function(v) {
            var char = lib.getHtmlEscapeChar(v);
            if ( char || typeof char === 'string' ) return char;
            return '&' + v + ';';
          },

          embed: function(v) {
            // v = [
            //   deconstructed open tag,
            //   content string,
            //   deconstructed close tag
            // ]
            return Embed.create({ nodeName: v[0][2], content: [ v[1] ] });
          },

          maybeEmbed: function(v) {
            // v = [
            //   deconstructed open tag,
            //   content string,
            //   deconstructed close tag
            // ]
            var nodeName = v[0][2];
            var str = v[1];
            var ret = Embed.create({ nodeName: nodeName });

            // Attempt to parse maybeEmbeds. Returns "html" parse or string.
            var ps = self.StringPS.create();
            ps.setString(str);
            var start  = self.grammar.getSymbol('html');
            var result = start.parse(ps, self.grammar);
            ret.content = ( result && result.value && result.pos === str.length ) ?
                result.value :
                [ str ];
            return ret;
          },

          // TODO(markdittmer): Do something with these values.
          header: function(v) { return null; },
          langTag: function(v) { return null; },
          doctype: function(v) { return null; },
          doctypePart: function(v) { return null; },
          cdata: function(v) { return null; },
          comment: function(v) { return null; },
          attributes: function(v) { return null; },
          attribute: function(v) { return null; },
          value: function(v) { return null; }
        };
      }
    },
    {
      name: 'grammar',
      factory: function() {
        var grammar = this.ImperativeGrammar.create({symbols: this.symbols});
        grammar.addActions(this.actions);
        return grammar;
      }
    },
    {
      name: 'ps',
      factory: function() {
        return this.StringPS.create();
      }
    }
  ],

  methods: [
    function parseString(str, opt_name) {
      opt_name = opt_name || 'START';

      this.ps.setString(str);
      var start = this.grammar.getSymbol(opt_name);
      foam.assert(start, 'No symbol found for', opt_name);

      return start.parse(this.ps, this.grammar);
    },

    function openTag_(seq, sym, tagName) {
      return seq(
          '<',
          sym('whitespace'),
          tagName,
          sym('whitespace'),
          sym('attributes'),
          sym('whitespace'),
          '>');
    },

    function closeTag_(seq, sym, tagName) {
      return seq(
          '<',
          sym('whitespace'),
          '/',
          sym('whitespace'),
          tagName,
          sym('whitespace'),
          '>');
    }
  ]
});
