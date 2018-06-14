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

  documentation: `
    Set a ViewFactory to be a string containing a class name,
    a Class object, or a factory function(args, context).
    Useful for rowViews and similar.`
  ,

  axioms: [
    {
      installInClass: function(cls) {
        cls.createView = function(spec, args, self, ctx) {
          if ( foam.u2.Element.isInstance(spec) )
            return spec.copyFrom(args);

          if ( foam.core.Slot.isInstance(spec) )
            return spec;

          if ( spec && spec.toE )
            return spec.toE(args, ctx);

          if ( foam.Function.isInstance(spec) )
            return foam.u2.ViewSpec.createView(spec.call(self, args, ctx), args, self, ctx);

          if ( foam.Object.isInstance(spec) ) {
            var ret = spec.create ?
                spec.create(args, ctx) :
                ctx.lookup(spec.class).create(spec, ctx).copyFrom(args || {});

            foam.assert(
                foam.u2.Element.isInstance(ret) || ret.toE,
                'ViewSpec result must extend foam.u2.Element or be toE()-able.');

            return ret;
          }

          if ( foam.core.FObject.isSubClass(spec) ) {
            var ret = spec.create(args, ctx);

            foam.assert(foam.u2.Element.isInstance(ret), 'ViewSpec class must extend foam.u2.Element or be toE()-able.');

            return ret;
          }

          if ( foam.String.isInstance(spec) || spec === undefined || spec === null )
            return foam.u2.Element.create({ nodeName: spec || 'div' }, ctx);

          throw 'Invalid ViewSpec, must provide an Element, Slot, toE()-able, Function, {create: function() {}}, {class: \'name\'}, Class, or String, but received: ' + spec;
        };
      }
    }
  ],

  properties: [
    /* TODO: uncomment this to fix ViewSpecs converting into Views when loading.
    [
      'fromJSON',
      function fromJSON(value, ctx, prop, json) {
        return value;
      }
    ],
    */
    [ 'adapt', function(_, spec, prop) {
      return foam.String.isInstance(spec) ? { class: spec } : spec ;
    } ]
    /*
    [ 'toJSON', function(value) {
      Output as string if 'class' is only defined value.
    } ]
    */
  ]
});
