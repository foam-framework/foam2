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
  name: 'ViewFactory2',
  extends: 'foam.core.Property',

  documentation: 'Set a ViewFactory to be a string containing a class name, ' +
      'a Class object, or a factory function(args, context). ' +
      'Useful for rowViews and similar.',

  properties: [
    [ 'adapt', function(_, raw, prop) {
      var f = typeof raw === 'function' ? function(ctx, args) {
        return raw.call(this, args, ctx);
      } : typeof raw === 'string' ? function(args, ctx) {
        return ctx.lookup(raw).create(args, ctx);
      } : foam.Object.is(raw) ? function(args, ctx) {
        // TODO: merge args and raw(-class)
        return ctx.lookup(raw.class).create(raw, ctx);
      } : f;

      f.src_ = raw;

      return f;
    } ],
    [ 'toJSON', function(value) {
      return value && value.src_;
    } ]
  ]
});
