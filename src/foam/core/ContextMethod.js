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
 * A Method which has the call-site context added as the first argument
 * when exported.
 * See use in foam.u2.U2Context.E
 */
foam.CLASS({
  package: 'foam.core',
  name: 'ContextMethod',
  extends: 'foam.core.Method',

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
