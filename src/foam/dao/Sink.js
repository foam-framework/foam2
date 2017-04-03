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

  methods: [
    {
      name: 'put',
      returns: '',
      args: [
        'sub',
        'obj'
      ],
      code: function() {}
    },
    {
      name: 'remove',
      returns: '',
      args: [
        'sub',
        'obj'
      ],
      code: function() {}
    },
    {
      name: 'eof',
      returns: '',
      args: [],
      code: function() {}
    },
    {
      name: 'reset',
      returns: '',
      args: [ 'sub' ],
      code: function() {}
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
      name: 'delegate'
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
      code: function() {}
    },
    {
      name: 'remove',
      code: function() {}
    },
    {
      name: 'eof',
      code: function() {}
    },
    {
      name: 'reset',
      code: function() {}
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'PipeSink',
  extends: 'foam.dao.ProxySink',
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
    function put(sub) {
      this.reset(sub);
    },
    function remove(sub) {
      this.reset(sub);
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'QuickSink',

  extends: 'foam.dao.AbstractSink',

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

  properties: [ 'sink' ],

  methods: [
    function put(sub, obj) {
      var s = this.sink;
      s && s.put && s.put(sub, obj);
    },
    function remove(sub, obj) {
      var s = this.sink;
      s && s.remove && s.remove(sub, obj);
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
      name: 'predicate'
    }
  ],

  methods: [
    {
      name: 'put',
      code: function put(sub, obj) {
        if ( this.predicate.f(obj) ) this.delegate.put(sub, obj);
      }
    },
    {
      name: 'remove',
      code: function remove(sub, obj) {
        if ( this.predicate.f(obj) ) this.delegate.remove(sub, obj);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'LimitedSink',
  extends: 'foam.dao.ProxySink',

  properties: [
    {
      class: 'Int',
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
      code: function put(sub, obj) {
        if ( this.count++ >= this.limit ) {
          sub.detach();
        } else {
          this.delegate.put(sub, obj);
        }
      }
    },
    {
      name: 'remove',
      code: function remove(sub, obj) {
        if ( this.count++ >= this.limit ) {
          sub.detach();
        } else {
          this.delegate.remove(sub, obj);
        }
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'SkipSink',
  extends: 'foam.dao.ProxySink',

  properties: [
    {
      class: 'Int',
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
      code: function put(sub, obj) {
        if ( this.count < this.skip ) {
          this.count++;
          return;
        }

        this.delegate.put(sub, obj);
      }
    },
    {
      name: 'remove',
      code: function remove(sub, obj) {
        this.reset(sub);
      }
    },
    {
      name: 'reset',
      code: function(sub) {
        this.count = 0;
        this.delegate.reset(sub);
      }
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
      of: 'foam.mlang.order.Comparator',
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
      code: function put(sub, obj) {
        this.array.push(obj);
      }
    },
    {
      name: 'eof',
      code: function eof() {
        var comparator = this.comparator;
        this.array.sort(function(o1, o2) {
          return comparator.compare(o1, o2);
        });

        for ( var i = 0 ; i < this.array.length ; i++ ) {
          this.delegate.put(this.array[i]);
        }
      }
    },

    function remove(sub, obj) {
      // TODO
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'DedupSink',
  extends: 'foam.dao.ProxySink',

  properties: [
    {
      /** @private */
      name: 'results_',
      hidden: true,
      factory: function() { return {}; }
    }
  ],

  methods: [
    {
      /** If the object to be put() has already been seen by this sink,
        ignore it */
      name: 'put',
      code: function put(sub, obj) {
        if ( ! this.results_[obj.id] ) {
          this.results_[obj.id] = true;
          return this.delegate.put(sub, obj);
        }
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'DescribeSink',
  documentation: 'Calls .describe() on every object.  Useful for debugging to quickly see what items are in a DAO.',
  implements: [ 'foam.dao.Sink' ],
  methods: [
    function put(_, o) {
      o.describe();
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'FnSink',
  documentation: 'Converts all sink events to call to a singular function.' +
    '  Useful for subscribing a listener method to a DAO',
  properties: [
    'fn'
  ],
  methods: [
    function put(s, obj) {
      this.fn(s, 'put', obj);
    },
    function remove(s, obj) {
      this.fn(s, 'remove', obj);
    },
    function eof(s) {
      this.fn(s, 'eof');
    },
    function reset(s) {
      this.fn(s, 'reset');
    }
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
      code: function() {
        this.calls.push(['put', arguments]);
        this.flushCalls();
      }
    },
    {
      name: 'remove',
      code: function() {
        this.calls.push(['remove', arguments]);
        this.flushCalls();
      }
    },
    {
      name: 'eof',
      code: function() {
        this.calls.push(['eof', arguments]);
        this.flushCalls();
      }
    },
    {
      name: 'reset',
      code: function() {
        this.calls = [['reset', arguments]];
        this.flushCalls();
      }
    }
  ],
  listeners: [
    {
      name: 'flushCalls',
      isFramed: true,
      code: function() {
        var calls = this.calls;
        this.calls = [];
        for (var i = 0, o; o = calls[i]; i++) {
          this.delegate[o[0]].apply(undefined, o[1]);
        }
      }
    },
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'DAOSink',
  implements: ['foam.dao.Sink'],
  properties: [
    { class: 'foam.dao.DAOProperty', name: 'dao' },
  ],
  methods: [
    {
      name: 'put',
      code: function(_, o) {
        this.dao.put(o);
      }
    },
    {
      name: 'remove',
      code: function(_, o) {
        this.dao.remove(o);
      }
    },
    {
      name: 'eof',
      code: function() {},
    },
    {
      name: 'reset',
      code: function() {
        this.dao.removeAll();
      }
    }
  ],
});
