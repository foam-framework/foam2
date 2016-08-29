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
