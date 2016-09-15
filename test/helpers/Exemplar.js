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
  Serves to generate executable examples and unit test cases.
*/
foam.CLASS({
  package: 'test.helpers',
  name: 'Exemplar',

  imports: [ 'exemplarRegistry as registry' ],

  properties: [
    {
      /** this Example's unique name */
      name: 'name',
      required: true
    },
    {
      /** a one-line description of the example */
      name: 'description'
    },
    {
      /** Examplars to load and execute before this one. Output code will
        be the merged result of all dependencies. */
      class: 'StringArray',
      name: 'dependencies'
    },
    {
      /** The code for this example. */
      class: 'String',
      name: 'code',
      adapt: function(old, nu) {
        if ( foam.Function.is(nu) ) {
          return nu.toString();
        }
        return nu;
      }
    }
  ],

  methods: [
    function init() {
      this.registry.register(this);
    },

    function generateExample(indent) {
      if ( ! indent ) indent = { level: 0 };
      var ret = "";

      // output each dependency
      if ( this.dependencies ) {
        this.dependencies.foreach(function(depName) {
          var dep = this.registry.lookup(depName);
          ret += dep.generateExample(indent);
        });
      }

      ret += this.outputSelf(indent);

      return ret;
    },

    function outputSelf(indent) {
      // For non-async code
      var ret = "";
      var lines = this.code.split('\n');
      var tabs = "";
      for ( var i = 0; i < indent.level; i++) { tabs += '\t'; }

      ret += tabs + '//' + this.name + '\n';
      ret += tabs + '//' + this.description + '\n';

      lines.forEach(function(line) {
        ret += tabs + line + '\n';
      });
      ret += '\n';

      return ret;
    }

  ]
});

/**
  Serves to generate executable examples and unit test cases.
*/
foam.CLASS({
  package: 'test.helpers',
  name: 'ExemplarRergistry',

  exports: [ 'as exemplarRegistry' ],

  properties: [
    {
      name: 'registrants',
      factory: function() { return {}; }
    }
  ],

  methods: [
    function lookup(name) {
      var found = this.registrants[name];

      if ( ! found ) throw "Examplar " + name + " not found!";

      return found;
    },
    function register(ex) {
      /** Registers an examplar. Re-registering the same one is allowed, but
        two Examplars with the same name is not. */
      var prev = this.lookup(ex.name);
      if ( prev !== ex ) throw "Exemplar " + ex.name + " already registered!";

      this.registrants[ex.name] = ex;
    }
  ]

});
