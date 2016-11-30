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
  Implements a namespace (like the Class namespace used by foam.lookup())
  Imports the existing namespace of the same name, if present, and builds
  on it by adding items specified. Exports the new version of the namespace
  or a brand new namespace if none was present in the context.

  Namespaces are inherited, but parent objects do not see the items
  added by child objects. Namespace access should be done through the
  generated property, not by directly accessing the exported cache object.

  TODO: package support with direct access to sub-packages: thing.ns.pkg1.a
*/
foam.CLASS({
  package: 'foam.core',
  name: 'NamespaceAxiom',

  properties: [
    {
      /** The names of the properties to add to the namespace */
      name: 'exports'
    },
    {
      /** The name of the namespace, used to generate the property
        and cache on the context. TODO: add name/key support to avoid
        conflict when necessary. */
      name: 'name'
    }
  ],

  constants: {
    CTX_SUFFIX: "_ns_cache",
  },

  methods: [
    function installInClass(cls) {
      // add import, export, property
      var axioms = [];
      var name = this.name;
      var ctxName = name + this.CTX_SUFFIX;
      var axiom = this;

      axioms.push(foam.core.Property.create({
        name: name,
        setter: function() {
          throw "Namespace cannot be assigned directly: " + name;
        },
        getter: function() {
          // create namespace or extend existing one
          var ns;
          if ( ! this.hasOwnPrivate_(name) ) {
            ns = axiom.extendExisting(this.__context__[ctxName], this);
            this.setPrivate_(name, ns);
          } else {
            ns = this.getPrivate_(name);
          }
          return ns;
        }
      }));

      axioms.push(foam.core.Export.create({
        exportName: ctxName,
        key: name
      }));

      cls.installAxioms(axioms);
    },
    function extendExisting(existing, self) {
      var ns = existing ? Object.create(existing) : { NS_NAME: this.name };

      // add exports
      var exps = this.exports;
      for ( var i = 0; i < exps.length; i++ ) {
        var ex = exps[i];
        // get the property slot (similar to Export axiom)
        var a = self.cls_.getAxiomByName(ex);
        if ( ! a ) {
           console.error(
             'Unknown namespace export: "' +
             exps[i] + '" in model: ' + self.cls_.id);
           continue;
        }
        ns[ex] = a.exportAs ? a.exportAs(self) : self[ex] ;
      }

      return ns;
    },
  ]

});
