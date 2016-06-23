/*
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
  extends: 'FObject',

  properties: [
    { name: 'name', required: true },
    { name: 'code', required: true }
  ],

  methods: [
    /**
      Decorate a method so that it can call the
      method it overrides with this.SUPER().
    */
    function override_(proto, method) {
      var super_ = proto.__proto__[this.name];

      if ( ! method ) return;

      // Not using SUPER, so just return original method
      if ( method.toString().indexOf('SUPER') == -1 ) return method;

      // Not overriding, stub out super_
      if ( ! super_ ) super_ = function() {};

      console.assert(
          typeof super_ === 'function',
          'Attempt to override non-method: ',
          this.name);

      function SUPER() { return super_.apply(this, arguments); }

      var f = function() {
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
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'Method',
  extends: 'foam.core.AbstractMethod',

  properties: [ 'returns' ],

  methods: [
    function installInProto(proto) {
      proto[this.name] = this.override_(proto, this.code);
    },

    function exportAs(obj) {
      var m = obj[this.name];
      /** Bind the method to 'this' when exported so that it still works. **/
      return function exportedMethod() { return m.apply(obj, arguments); };
    }
  ]
});

foam.boot.phase2();
