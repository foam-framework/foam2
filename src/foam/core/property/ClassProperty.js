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
  package: 'foam.core.property',
  name: 'ClassProperty',
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
