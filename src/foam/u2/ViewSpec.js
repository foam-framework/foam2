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
  name: 'ViewSpec',
  extends: 'foam.core.Property',

  axioms: [
    {
      installInClass: function(cls) {
        cls.createView = function(spec, args, that, ctx) {
          return foam.u2.Element.isInstance(spec) ?
            spec :

          (spec && spec.toE) ?
            spec.toE(args, ctx) :

          typeof spec === 'function' ?
            spec.call(that, args, ctx) :

          foam.Object.is(spec) ?
            (spec.create ?
              spec.create(args, ctx) :
              ctx.lookup(spec.class).create(spec, ctx).copyFrom(args || {})) :

          foam.AbstractClass.isSubClass(spec) ?
            spec.create(args, ctx) :

          // TODO: verify a String
          foam.u2.Element.create({ nodeName: spec || 'div' }, ctx);
        };
      }
    }
  ],

  documentation: 'Set a ViewFactory to be a string containing a class name, ' +
      'a Class object, or a factory function(args, context). ' +
      'Useful for rowViews and similar.',

  properties: [
    [ 'adapt', function(_, spec, prop) {
      return foam.String.is(spec) ? { class: spec } : spec ;
    } ]
    /*
    [ 'toJSON', function(value) {
      Output as string if 'class' is only defined value.
    } ]
    */
  ]
});
