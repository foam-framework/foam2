/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// WeakMap Polyfill, doesn't implement the full interface, just the parts
// that FOAM uses. Only used in Element.js, which is why it's in the u2 package
// rather than in core with other polyfils.
if ( ! global.WeakMap ) {
  Object.defineProperty(window, 'WeakMap', {
    configurable: true,
    writable: true,
    value: function WeakMap() {
      var id = '__WEAK_MAP__' + this.$UID;

      function del(key) { delete key[id]; }
      function get(key) { return key[id]; }
      function set(key, value) { key[id] = value; }
      function has(key) { return !!key[id]; }

      return {
        __proto__: this,
        'delete': del,
        get: get,
        set: set,
        has: has
      };
    }
  });
}
