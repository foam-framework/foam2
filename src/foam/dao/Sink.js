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

foam.INTERFACE({
  package: 'foam.dao',
  name: 'Sink',

  documentation: 'Interface for receiving information updates. Primarily used as the target for DAO.select() calls.',

  methods: [
    {
      name: 'put',
      args: [
        {
          name: 'obj',
          type: 'Any'
        },
        {
          name: 'sub',
          type: 'foam.core.Detachable'
        }
      ]
    },
    {
      name: 'remove',
      args: [
        {
          name: 'obj',
          type: 'Any'
        },
        {
          name: 'sub',
          type: 'foam.core.Detachable'
        }
      ]
    },
    {
      name: 'eof'
    },
    {
      name: 'reset',
      args: [
        {
          name: 'sub',
          type: 'foam.core.Detachable'
        }
      ]
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'ProxySink',
  implements: [ 'foam.dao.Sink' ],

  documentation: 'Proxy for Sink interface.',

  properties: [
    {
      class: 'Proxy',
      of: 'foam.dao.Sink',
      name: 'delegate',
      factory: function() { return foam.dao.ArraySink.create(); }
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'AbstractSink',
  implements: [ 'foam.dao.Sink' ],

  documentation: 'Abstract base class for implementing Sink interface.',

  methods: [
    {
      name: 'put',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: '// NOOP'
    },
    {
      name: 'remove',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: '// NOOP'
    },
    {
      name: 'eof',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: '// NOOP'
    },
    {
      name: 'reset',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: '// NOOP'
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'PipeSink',
  extends: 'foam.dao.ProxySink',
  axioms: [
    {
      class: 'foam.box.Remote',
      clientClass: 'foam.dao.ClientSink'
    }
  ],
  properties: [
    'dao'
  ],
  methods: [
    function reset(sub) {
      this.SUPER(sub);
      this.dao.select(this.delegate);
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'ResetListener',
  extends: 'foam.dao.ProxySink',
  documentation: 'Turns all sink events into a reset event.',
  methods: [
    {
      name: 'put',
      code: function put(_, sub) {
        this.reset(sub);
      },
      swiftCode: 'reset(sub)'
    },
    {
      name: 'remove',
      code: function remove(_, sub) {
        this.reset(sub);
      },
      swiftCode: 'reset(sub)'
    },
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'DAOSlot',
  implements: ['foam.core.Slot'],
  extends: 'foam.dao.ResetListener',
  properties: [
    {
      name: 'dao',
      postSet: function() {
        this.start_();
      }
    },
    {
      name: 'sink',
      postSet: function(_, s) {
        this.value = s;
        this.start_();
      }
    },
    {
      name: 'value'
    },
    {
      name: 'subscription',
      postSet: function(old, nu) {
        old && old.detach();
        this.onDetach(nu);
      }
    },
    {
      class: 'Int',
      name: 'batch',
      value: 0
    }
  ],

  methods: [
    function sub(l) {
      return arguments.length === 1 ?
        this.SUPER('propertyChange', 'value', l) :
        this.SUPER.apply(this, arguments);
    },

    function get() { return this.value; },

    function set() {},

    function start_() {
      // Don't start till both sink and dao are set.
      if ( ! this.dao || ! this.sink ) return;

      this.subscription = this.dao.listen(this);
      this.update();
    },

    function reset() {
      this.update();
    }
  ],
  listeners: [
    {
      name: 'update',
      isMerged: 100,
      code: function() {
        var batch = ++this.batch;
        var self = this;
        this.dao.select(this.sink.clone()).then(function(s) {
          if ( self.batch !== batch ) return;

          self.value = s;
        });
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'QuickSink',
  extends: 'foam.dao.AbstractSink',

  axioms: [
    {
      class: 'foam.box.Remote',
      clientClass: 'foam.dao.ClientSink'
    }
  ],
  properties: [
    {
      class: 'Function',
      name: 'putFn'
    },
    {
      class: 'Function',
      name: 'removeFn'
    },
    {
      class: 'Function',
      name: 'eofFn'
    },
    {
      class: 'Function',
      name: 'resetFn'
    }
  ],

  methods: [
    function put() {
      return this.putFn && this.putFn.apply(this, arguments);
    },

    function remove() {
      return this.removeFn && this.removeFn.apply(this, arguments);
    },

    function eof() {
      return this.eofFn && this.eofFn.apply(this, arguments);
    },

    function reset() {
      return this.resetFn && this.resetFn.apply(this, arguments);
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'AnonymousSink',
  implements: [ 'foam.dao.Sink' ],

  axioms: [
    {
      class: 'foam.box.Remote',
      clientClass: 'foam.dao.ClientSink'
    }
  ],

  properties: [ 'sink' ],

  methods: [
    function put(obj, sub) {
      var s = this.sink;
      s && s.put && s.put(obj, sub);
    },
    function remove(obj, sub) {
      var s = this.sink;
      s && s.remove && s.remove(obj, sub);
    },
    function eof() {
      var s = this.sink;
      s && s.eof && s.eof();
    },
    function reset(sub) {
      var s = this.sink;
      s && s.reset && s.reset(sub);
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'PredicatedSink',
  extends: 'foam.dao.ProxySink',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      required: true,
      name: 'predicate'
    }
  ],

  methods: [
    {
      name: 'put',
      code: function put(obj, sub) {
        if ( this.predicate.f(obj) ) this.delegate.put(obj, sub);
      },
      swiftCode: 'if predicate.f(obj) { delegate.put(obj, sub) }',
      javaCode: `
        try {
          if ( getPredicate().f(obj) ) getDelegate().put(obj, sub);
        } catch (ClassCastException exp) {
        }
      `
    },
    {
      name: 'remove',
      code: function remove(obj, sub) {
        if ( this.predicate.f(obj) ) this.delegate.remove(obj, sub);
      },
      swiftCode: 'if predicate.f(obj) { delegate.remove(obj, sub) }',
      javaCode: 'if ( getPredicate().f(obj) ) getDelegate().remove(obj, sub);'
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'LimitedSink',
  extends: 'foam.dao.ProxySink',

  properties: [
    {
      class: 'Long',
      name: 'limit'
    },
    {
      name: 'count',
      class: 'Int',
      value: 0
    }
  ],

  methods: [
    {
      name: 'put',
      code: function put(obj, sub) {
        if ( this.count++ >= this.limit ) {
          sub && sub.detach();
        } else {
          this.delegate.put(obj, sub);
        }
      },
      swiftCode: `count += 1
if count <= limit {
  delegate.put(obj, sub)
}`,
      javaCode: `
if ( getCount() >= getLimit() ) {
  sub.detach();
} else {
  setCount(getCount() + 1);
  getDelegate().put(obj, sub);
}`
    },
    {
      name: 'remove',
      code: function remove(obj, sub) {
        if ( this.count++ >= this.limit ) {
          sub && sub.detach();
        } else {
          this.delegate.remove(obj, sub);
        }
      },
      swiftCode: `count += 1
if count <= limit {
  delegate.remove(obj, sub)
}`,
      javaCode: 'if ( getCount() >= getLimit() ) {\n'
        + '  sub.detach();\n'
        + '} else {'
        + '  setCount(getCount() + 1);\n'
        + '  getDelegate().put(obj, sub);\n'
        + '}\n'
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'SkipSink',
  extends: 'foam.dao.ProxySink',

  properties: [
    {
      class: 'Long',
      name: 'skip'
    },
    {
      name: 'count',
      class: 'Int',
      value: 0
    }
  ],

  methods: [
    {
      name: 'put',
      code: function put(obj, sub) {
        if ( this.count < this.skip ) {
          this.count++;
          return;
        }

        this.delegate.put(obj, sub);
      },
      swiftCode: `if count < skip {
  count += 1
  return
}
delegate.put(obj, sub)`,
      javaCode: 'if ( getCount() < getSkip() ) {\n'
        + '  setCount(getCount() + 1);\n'
        + '  return;'
        + '}\n'
        + 'getDelegate().put(obj, sub);'
    },
    {
      name: 'remove',
      code: function remove(obj, sub) {
        this.reset(sub);
      },
      swiftCode: `if count < skip {
  count += 1
  return
}
delegate.remove(obj, sub)`,
      javaCode: 'if ( getCount() < getSkip() ) {\n'
        + '  setCount(getCount() + 1);\n'
        + '  return;'
        + '}\n'
        + 'getDelegate().remove(obj, sub);'
    },
    {
      name: 'reset',
      code: function(sub) {
        this.count = 0;
        this.delegate.reset(sub);
      },
      swiftCode: `count = 0;
delegate.reset(sub);`,
      javaCode: `setCount(0);getDelegate().reset(sub);`
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'OrderedSink',
  extends: 'foam.dao.ProxySink',

  properties: [
    {
      class: 'FObjectProperty',
      type: 'foam.mlang.order.Comparator',
      required: true,
      name: 'comparator'
    },
    {
      class: 'List',
      name: 'array',
      factory: function() { return []; }
    }
  ],

  methods: [
    {
      name: 'put',
      code: function put(obj, sub) {
        this.array.push(obj);
      },
      swiftCode: 'array.append(obj)',
      javaCode: 'if ( getArray() == null ) setArray(new java.util.ArrayList());\n'
        + 'getArray().add(obj);'
    },
    {
      name: 'eof',
      code: function eof() {
        var comparator = this.comparator;
        this.array.sort(function(o1, o2) {
          return comparator.compare(o1, o2);
        });

        var sub = foam.core.FObject.create();
        var detached = false;
        sub.onDetach(function() { detached = true; });
        for ( var i = 0 ; i < this.array.length ; i++ ) {
          this.delegate.put(this.array[i], sub);
          if ( detached ) break;
        }
      },
      swiftCode: `array.sort(by: {
  return comparator.compare($0, $1) < 0
});

var detached = false
let sub = Subscription { detached = true }
for obj in array {
  delegate.put(obj as! foam_core_FObject, sub)
  if detached { break }
}`,
      javaCode: 'if ( getArray() == null ) setArray(new java.util.ArrayList());\n'
        + 'java.util.Collections.sort(getArray(), getComparator());\n'
        + 'foam.dao.Subscription sub = new foam.dao.Subscription();\n'
        + 'for ( Object o : getArray() ) {\n'
        + '  if ( sub.getDetached() ) {\n'
        + '    break;\n'
        + '  }\n'
        + '  getDelegate().put(o, sub);\n'
        + '}'
    },
    {
      name: 'remove',
      code: function remove(obj, sub) {
        // TODO
      },
      swiftCode: '// TODO',
      javaCode: '// TODO'
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'DedupSink',
  extends: 'foam.dao.ProxySink',

  properties: [
    {
      class: 'Object',
      /** @private */
      name: 'results',
      javaType: 'java.util.HashSet',
      hidden: true,
      factory: function() { return {}; }
    }
  ],

  methods: [
    {
      /** If the object to be put() has already been seen by this sink,
        ignore it */
      name: 'put',
      code: function put(obj, sub) {
        if ( ! this.results[obj.id] ) {
          this.results[obj.id] = true;
          return this.delegate.put(obj, sub);
        }
      },
      javaCode: 'if ( getResults() == null ) setResults(new java.util.HashSet<>());\n' +
        '    if ( ! getResults().contains(((foam.core.FObject)obj).getProperty("id")) ) {\n' +
        '      getDelegate().put(obj, sub);\n' +
        '      getResults().add(((foam.core.FObject)obj).getProperty("id"));\n' +
        '    }'
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'DescribeSink',
  implements: [ 'foam.dao.Sink' ],

  documentation: 'Calls .describe() on every object.  Useful for debugging to quickly see what items are in a DAO.',

  methods: [
    function put(o) {
      o.describe();
    },
    function remove() {},
    function eof() {},
    function reset() {}
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'FnSink',
  implements: [ 'foam.dao.Sink' ],
  documentation: 'Converts all sink events to call to a singular function.' +
    '  Useful for subscribing a listener method to a DAO',

  axioms: [
    {
      class: 'foam.box.Remote',
      clientClass: 'foam.dao.ClientSink'
    }
  ],

  properties: [
    {
      name: 'fn',
      swiftType: '((String?, Any?, foam_core_Detachable?) -> Void)',
      swiftRequiresEscaping: true,
    },
  ],

  methods: [
    {
      name: 'put',
      code: function(obj, s) {
        this.fn('put', obj, s);
      },
      swiftCode: 'fn("put", obj, sub)',
    },
    {
      name: 'remove',
      code: function(obj, s) {
        this.fn('remove', obj, s);
      },
      swiftCode: 'fn("remove", obj, sub)',
    },
    function eof() {
      this.fn('eof');
    },
    {
      name: 'reset',
      code: function(s) {
        this.fn('reset', s);
      },
      swiftCode: 'fn("reset", nil, sub)',
    },
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'FramedSink',
  extends: 'foam.dao.ProxySink',

  documentation: 'A proxy that waits until the next frame to flush the calls to the delegate.',

  properties: [
    { class: 'Array', name: 'calls' },
  ],

  methods: [
    {
      name: 'put',
      code: function(obj, s) {
        this.calls.push(['put', [obj, s]]);
        this.flushCalls();
      }
    },
    {
      name: 'remove',
      code: function(obj, s) {
        this.calls.push(['remove', [obj, s]]);
        this.flushCalls();
      }
    },
    {
      name: 'eof',
      code: function() {
        this.calls.push(['eof', []]);
        this.flushCalls();
      }
    },
    {
      name: 'reset',
      code: function(s) {
        this.calls = [['reset', [s]]];
        this.flushCalls();
      }
    }
  ],

  listeners: [
    {
      name: 'flushCalls',
      isMerged: 100,
      code: function() {
        var calls = this.calls;
        this.calls = [];
        for (var i = 0, o; o = calls[i]; i++) {
          this.delegate[o[0]].apply(this.delegate, o[1]);
        }
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'DAOSink',

  implements: [ 'foam.dao.Sink' ],

  properties: [
    { class: 'foam.dao.DAOProperty', name: 'dao' },
  ],

  axioms: [
    {
      class: 'foam.box.Remote',
      clientClass: 'foam.dao.ClientSink'
    }
  ],

  methods: [
    {
      name: 'put',
      code: function(o) {
        this.dao.put(o);
      },
      javaCode: `getDao().put((foam.core.FObject)obj);`,
      swiftCode: '_ = try? dao?.put(obj as? foam_core_FObject)'
    },
    {
      name: 'remove',
      code: function(o) {
        this.dao.remove(o);
      },
      javaCode: `getDao().remove((foam.core.FObject)obj);`,
      swiftCode: '_ = try? dao?.remove(obj as? foam_core_FObject)'
    },
    {
      name: 'eof',
      code: function() {},
      javaCode: `// NOOP`,
      swiftCode: '// NOOP'
    },
    {
      name: 'reset',
      code: function() {
        this.dao.removeAll();
      },
      javaCode: `getDao().removeAll();`,
      swiftCode: '_ = try? dao?.removeAll()',
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'JournalSink',

  implements: [ 'foam.dao.Sink' ],

  properties: [
    {
      name: 'journal',
      class: 'FObjectProperty',
      of: 'foam.dao.Journal'
    },
    {
      name: 'dao',
      class: 'foam.dao.DAOProperty'
    },
    {
      name: 'prefix',
      class: 'String',
      value: ''
    }
  ],

  methods: [
    {
      name: 'put',
      code: function(o) {
        var x = this.__context__; // TODO: is this always correct?
        this.journal.put(x, '', this.dao, o);
      }
    },
    {
      name: 'remove',
      code: function(o) {
        var x = this.__context__; // TODO: is this always correct?
        this.journal.remove(x, '', this.dao, o);
      },
    },
    {
      name: 'eof',
      code: function() {},
    },
    {
      name: 'reset',
      code: function() {
        console.warn('use of unimplemented JournalSink.reset()');
      }
    }
  ]
});
