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
  package: 'foam.dao',
  name: 'NullDAO',
  extends: 'foam.dao.AbstractDAO',

  documentation: 'A Null pattern (do-nothing) DAO implementation.',

  methods: [
    {
      name: 'put_',
      code: function put_(x, obj) {
        this.pub('on', 'put', obj);
        return Promise.resolve(obj);
      },
      swiftCode: `
_ = on["put"].pub([obj])
return obj
      `,
      javaCode: `
onPut(obj);
return obj;
      `,
    },

    {
      name: 'remove_',
      code: function remove_(x, obj) {
        this.pub('on', 'remove', obj);
        return Promise.resolve();
      },
      swiftCode: `
_ = on["remove"].pub([obj])
return obj
      `,
      javaCode: `
onRemove(obj);
return null;
      `,
    },

    {
      name: 'find_',
      code: function find_(x, id) {
        return Promise.resolve(null);
      },
      swiftCode: 'return nil',
      javaCode: 'return null;',
    },

    {
      name: 'select_',
      code: function select_(x, sink, skip, limit, order, predicate) {
        sink = sink || foam.dao.ArraySink.create();
        sink.eof();
        return Promise.resolve(sink);
      },
      swiftCode: `
sink?.eof()
return sink
      `,
      javaCode: `
if ( sink == null ) {
  sink = new ArraySink();
}
sink.eof();
return sink;
      `,
    },

    {
      name: 'removeAll_',
      code: function removeAll_(x, skip, limit, order, predicate) {
        return Promise.resolve();
      },
      swiftCode: 'return',
      javaCode: '// NOOP',
    },
  ]
});
