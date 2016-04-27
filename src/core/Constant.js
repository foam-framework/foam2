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

  // documentation: 'Constant Axiom',

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
