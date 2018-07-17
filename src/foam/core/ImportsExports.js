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
    'of',
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
      foam.assert(this.key, 'No key for import: ' + this.name);

      var name     = this.name;
      var key      = foam.String.toSlotName(this.key);
      var slotName = this.slotName_;
      var required = this.required;

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
          if ( required ) console.warn('Access missing import:', name);
          return undefined;
        },
        set: function importsSetter(v) {
          var slot = this[slotName];
          if ( slot )
            slot.set(v);
          else
            console.warn('Attempt to set missing import:', name);
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
