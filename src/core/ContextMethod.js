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


// A Method which doesn't bind to 'this' when exported.
// TODO: move somewhere else when satisfied with design
foam.CLASS({
  package: 'foam.core',
  name: 'ContextMethod',
  extends: 'foam.core.Method',

  methods: [
    function exportAs(obj) {
      return obj[this.name];
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'U2Context',

  exports: [
    'E',
    'registerElement',
    'elementForName'
  ],

  properties: [
    {
      name: 'elementMap',
      factory: function() { return {}; }
    }
  ],

  methods: [
    {
      class: 'foam.core.ContextMethod',
      name: 'E',
      code: function E(opt_nodeName) {
        var nodeName = (opt_nodeName || 'div').toUpperCase();

        return (
          this.elementForName(nodeName) || foam.u2.Element).
          create({nodeName: nodeName}, this);
      }
    },

    function registerElement(elClass, opt_elName) {
      var key = opt_elName || elClass.name;
      this.elementMap[key.toUpperCase()] = elClass;
    },

    function elementForName(nodeName) {
      if ( this.elementMap[nodeName] ) console.log('NODENAME: ', nodeName, this.elementMap[nodeName]);
      return this.elementMap[nodeName];
    }
  ]
});
