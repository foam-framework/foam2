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
  The base class for most DAOs, defining basic DAO behavior.
*/
foam.CLASS({
  package: 'foam.dao',
  name: 'AbstractDAO',
  implements: [ 'foam.dao.DAO' ],

  requires: [
    'foam.dao.ExternalException',
    'foam.dao.InternalException',
    'foam.dao.ObjectNotFoundException',
    'foam.dao.FlowControl',
    'foam.dao.LimitedSink',
    'foam.dao.SkipSink',
    'foam.dao.OrderedSink',
    'foam.dao.PredicatedSink',
    'foam.dao.FilteredDAO',
    'foam.dao.OrderedDAO',
    'foam.dao.SkipDAO',
    'foam.dao.LimitedDAO'
  ],

  topics: [
    {
      name: 'on',
      topics: [
        'put',
        'remove',
        'reset'
      ]
    }
  ],

  properties: [
    {
      /**
        Set to the name or class instance of the type of object the DAO
        will store.
      */
      class: 'Class',
      name: 'of'
    }
  ],

  methods: [
    {
      /**
        Returns a filtered DAO that only returns objects which match the
        given predicate.
      */
      name: 'where',
      code: function where(p) {
        return this.FilteredDAO.create({
          delegate: this,
          predicate: p
        });
      }
    },

    {
      /**
        Returns a filtered DAO that orders select() by the given
        ordering.
      */
      name: 'orderBy',
      code: function orderBy() {
        return this.OrderedDAO.create({
          delegate: this,
          comparator: foam.compare.toCompare(Array.from(arguments))
        });
      }
    },

    {
      /**
        Returns a filtered DAO that skips the given number of items
        on a select()
      */
      name: 'skip',
      code: function skip(/* Number */ s) {
        return this.SkipDAO.create({
          delegate: this,
          skip_: s
        });
      }
    },

    {
      /**
        Returns a filtered DAO that stops producing items after the
        given count on a select().
      */
      name: 'limit',
      code: function limit(/* Number */ l) {
        return this.LimitedDAO.create({
          delegate: this,
          limit_: l
        });
      }
    },

    /**
      Selects the contents of this DAO into a sink, then listens to keep
      the sink up to date. Returns a promise that resolves with the subscription.
      TODO: This will probably miss events that happen during the select but before the
      listen call.  We should check if this is the case and fix it if so.
    */
    function pipe(sink) {
      var self = this;
      return self.select(sink).then(function() {
        return self.listen(sink);
      });
    },

    /**
      Keeps the given sink up to date with changes to this DAO.
    */
    function listen(sink, predicate
        /* object // The subscription object, with a .detach() to clean up. */
    ) {
      var mySink = this.decorateSink_(sink, undefined, undefined, undefined, predicate);

      var fc = this.FlowControl.create();
      var sub;

      fc.propertyChange.sub(function(s, _, pname) {
        if ( pname == "stopped") {
          if ( sub ) sub.detach();
        } else if ( pname === "errorEvt" ) {
          if ( sub ) sub.detach();
          mySink.error(fc.errorEvt);
        }
      });

      // Note that FilteredDAO, LimitedDAO, OrderedDAO and SkipDAO all
      // pass listen() calls down through the delegate chain, so the
      // topics we subscribe to are not filtered by those DAO decorators.
      // The sink we create in .decorateSink_() is responsible for filtering.
      return this.on.sub(function(s, on, e, obj) {
        sub = s;
        switch(e) {
          case 'put':
            mySink.put(obj, fc);
          break;
          case 'remove':
            mySink.remove(obj, fc);
          break;
          case 'reset':
            mySink.reset();
          break;
        }
      });
    },

    /**
      Used by DAO implementations to apply filters to a sink, often in a
      select() or removeAll() implementation.
      @private
    */
    function decorateSink_(sink, skip, limit, order, predicate) {
      if ( limit != undefined ) {
        sink = this.LimitedSink.create({
          limit: limit,
          delegate: sink
        });
      }

      if ( skip != undefined ) {
        sink = this.SkipSink.create({
          skip: skip,
          delegate: sink
        });
      }

      if ( order != undefined ) {
        sink = this.OrderedSink.create({
          comparator: order,
          delegate: sink
        });
      }

      if ( predicate != undefined ) {
        sink = this.PredicatedSink.create({
          predicate: predicate.partialEval ?
            predicate.partialEval() :
            predicate,
          delegate: sink
        });
      }

      return sink;
    },

    function compareTo(other) {
      if ( ! other ) return 1;
      return this === other ? 0 : foam.util.compare(this.$UID, other.$UID);
    },

    // Placeholder functions to that selecting from DAO to DAO works.
    /** @private */
    function eof() {},

    /** @private */
    function error() {},

    /** @private */
    function reset() {}
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'Exception',
  properties: [
    'message'
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'InternalException',
  extends: 'Exception'
});


foam.CLASS({
  package: 'foam.dao',
  name: 'ExternalException',
  extends: 'Exception'
})


foam.CLASS({
  package: 'foam.dao',
  name: 'ObjectNotFoundException',
  extends: 'foam.dao.ExternalException',

  properties: [
    'id',
    {
      name: 'message',
      expression: function(id) { return "No record found for id: " + id; }
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'FilteredDAO',
  extends: 'foam.dao.AbstractDAO',

  requires: [
    'foam.mlang.predicate.And'
  ],

  properties: [
    {
      name: 'predicate',
      required: true
    },
    {
      name: 'of',
      factory: function() {
        return this.delegate.of;
      }
    },
    {
      class: 'Proxy',
      of: 'foam.dao.DAO',
      name: 'delegate',
      topics: [],
      forwards: [ 'put', 'remove', 'find', 'select', 'removeAll' ],
      postSet: function(old, nu) {
        // Only fire a 'reset' when the delegate is actually changing, not being
        // set for the first time.
        if ( old ) {
          this.on.reset.pub();
        }

        // TODO: replace this with a manually installed ProxySub,
        //   or implement interceptors in Proxy
        if ( this.delegateSub_ ) {
          this.delegateSub_.detach();
          this.delegateSub_ = nu.on.sub(this.onEvent);
        }
      }
    },
    'delegateSub_',
  ],

  listeners: [
    /** If the predicate returns false for the object added or updated, change
      to an on.remove event. If the listener had previously been told about
      the object, it should now remove it since it no longer matches. */
    function onEvent(s, on, putRemoveReset, obj) {
      if ( putRemoveReset === 'put' ) {
        if ( this.predicate.f(obj) ) {
          this.pub(on, 'put', obj);
        } else {
          this.pub(on, 'remove', obj);
        }
      } else {
        this.pub(on, putRemoveReset, obj);
      }
    }
  ],

  methods: [
    function sub(arg1) {
      if ( arg1 === 'on' && ! this.delegateSub_ ) {
        var self = this;
        this.delegateSub_ = this.delegate.on.sub(this.onEvent);
        this.onDetach(function() {
          self.delegateSub_ && self.delegateSub_.detach();
          self.delegateSub_ = null;
        });
      }
      return this.SUPER.apply(this, arguments);
    },

    function select(sink, skip, limit, order, predicate) {
      return this.delegate.select(
        sink, skip, limit, order,
        predicate ?
          this.And.create({ args: [this.predicate, predicate] }) :
          this.predicate);
    },

    function removeAll(skip, limit, order, predicate) {
      return this.delegate.removeAll(
        skip, limit, order,
        predicate ?
          this.And.create({ args: [this.predicate, predicate] }) :
          this.predicate);
    },

    function listen(sink, predicate) {
      return this.delegate.listen(
        sink,
        predicate ?
          this.And.create({ args: [this.predicate, predicate] }) :
          this.predicate);
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'OrderedDAO',
  extends: 'foam.dao.ProxyDAO',

  properties: [
    {
      name: 'comparator'
    }
  ],

  methods: [
    function select(sink, skip, limit, order, predicate) {
      return this.delegate.select(sink, skip, limit, order ? order : this.comparator, predicate);
    },
    function removeAll(skip, limit, order, predicate) {
      return this.delegate.removeAll(skip, limit, order ? order : this.comparator, predicate);
    },
    function listen(sink, predicate) {
      return this.delegate.listen(sink, predicate);
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'SkipDAO',
  extends: 'foam.dao.ProxyDAO',

  properties: [
    {
      name: 'skip_'
    }
  ],

  methods: [
    function select(sink, skip, limit, order, predicate) {
      return this.delegate.select(sink, this.skip_, limit, order, predicate);
    },
    function removeAll(skip, limit, order, predicate) {
      return this.delegate.removeAll(this.skip_, limit, order, predicate);
    },
    function listen(sink, predicate) {
      return this.delegate.listen(sink, predicate);
    },
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'LimitedDAO',
  extends: 'foam.dao.ProxyDAO',

  properties: [
    {
      name: 'limit_'
    }
  ],

  methods: [
    function select(sink, skip, limit, order, predicate) {
      return this.delegate.select(
        sink, skip,
        limit !== undefined ? Math.min(this.limit_, limit) : this.limit_,
        order, predicate);
    },

    function removeAll(skip, limit, order, predicate) {
      return this.delegate.removeAll(
        skip,
        limit !== undefined ? Math.min(this.limit_, limit) : this.limit_,
        order, predicate);
    },

    function listen(sink, predicate) {
      return this.delegate.listen(sink, predicate);
    }
  ]
});
