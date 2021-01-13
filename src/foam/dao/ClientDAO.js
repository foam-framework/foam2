/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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
  name: 'ResetSink',
  extends: 'foam.dao.ProxySink',
  methods: [
    {
      name: 'put',
      code: function(obj, sub) { this.reset(sub); },
      javaCode: 'reset(sub);'
    },
    {
      name: 'remove',
      code: function(obj, sub) { this.reset(sub); },
      javaCode: 'reset(sub);'
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'MergedResetSink',
  extends: 'foam.dao.ResetSink',
  methods: [
    {
      name: 'reset',
      code: function(sub) { this.doReset(sub); },
      javaCode: `doReset(sub);`
    }
  ],
  listeners: [
    {
      name: 'doReset',
      isMerged: true,
      mergeDelay: 200,
      code: function(sub) {
        this.delegate.reset(sub);
      },
      javaCode: `
try {
  getDelegate().reset(sub);
} catch(Exception e) {
  sub.detach();
}
`
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'ClientDAO',
  extends: 'foam.dao.BaseClientDAO',

  requires: [
    'foam.box.SkeletonBox',
    'foam.core.Serializable',
    'foam.dao.ArraySink',
    'foam.dao.ClientSink'
  ],

  methods: [
    {
      name: 'put_',
      code:     function put_(x, obj) {
        return this.SUPER(null, obj);
      },
      javaCode: 'return super.put_(null, obj);',
      swiftCode: 'return try super.put_(nil, obj)'
    },
    {
      name: 'remove_',
      code: function remove_(x, obj) {
        return this.SUPER(null, obj);
      },
      javaCode: 'return super.remove_(null, obj);',
      swiftCode: 'return try super.remove_(nil, obj)'
    },
    {
      name: 'find_',
      code:     function find_(x, key) {
        return this.SUPER(null, key);
      },
      javaCode: 'return super.find_(null, id);',
      swiftCode: 'return try super.find_(nil, id)'
    },
    {
      name: 'select_',
      code: function select_(x, sink, skip, limit, order, predicate) {
        if ( predicate === foam.mlang.predicate.True.create() ) predicate = null;
        if ( ! skip ) skip = 0;
        if ( foam.Undefined.isInstance(limit) ) limit = Number.MAX_SAFE_INTEGER;

        if ( ! this.Serializable.isInstance(sink) ) {
          var self = this;

          return this.SUPER(null, foam.dao.ArraySink.create(), skip, limit, order, predicate).then(function(result) {
            var items = result.array;

            if ( ! sink ) return result;

            var sub = foam.core.FObject.create();
            var detached = false;
            sub.onDetach(function() { detached = true; });

            for ( var i = 0 ; i < items.length ; i++ ) {
              if ( detached ) break;

              sink.put(items[i], sub);
            }

            sink.eof();

            return sink;
          });
        }

        return this.SUPER(null, sink, skip, limit, order, predicate);
      },
      javaCode: 'return super.select_(null, sink, skip, limit, order, predicate);',
      swiftCode: `
if sink is foam_core_Serializable {
  return try super.select_(nil, sink, skip, limit, order, predicate)
}
let result = try super.select_(nil, ArraySink_create(), skip, limit, order, predicate) as! foam_dao_ArraySink
var detached = false
let sub = Subscription { detached = true }
for o in result.array {
  if detached { break }
  sink?.put(o!, sub)
}
sink?.eof()
return sink
`
    },

    {
      name: 'removeAll_',
      code: function removeAll_(x, skip, limit, order, predicate) {
        if ( predicate === foam.mlang.predicate.True.create() ) predicate = null;
        if ( ! skip ) skip = 0;
        if ( foam.Undefined.isInstance(limit) ) limit = Number.MAX_SAFE_INTEGER;

        return this.SUPER(null, skip, limit, order, predicate);
      },
      javaCode: 'super.removeAll_(null, skip, limit, order, predicate);',
      swiftCode: 'try super.removeAll_(nil, skip, limit, order, predicate)'
    },

    {
      name: 'listen_',
      code: function listen_(x, sink, predicate) {
        this.SUPER(null, sink, predicate);
        return foam.core.FObject.create();
      },
      javaCode: `super.listen_(null, sink, predicate);`,
      swiftCode: `return try super.listen_(nil, sink, predicate)`
    },
  ]
});
