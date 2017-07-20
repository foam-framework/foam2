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
  name: 'ClientDAO',
  extends: 'foam.dao.BaseClientDAO',

  requires: [
    'foam.core.Serializable',
    'foam.dao.BoxDAOListener'
  ],

  methods: [
    function put_(x, obj) {
      return this.SUPER(null, obj);
    },

    function remove_(x, obj) {
      return this.SUPER(null, obj);
    },

    function find_(x, key) {
      return this.SUPER(null, key);
    },

    function select_(x, sink, skip, limit, order, predicate) {
      if ( predicate === foam.mlang.predicate.True.create() ) predicate = null;
      if ( ! skip ) skip = 0;
      if ( ! limit ) limit = Number.MAX_SAFE_INTEGER;

      if ( ! this.Serializable.isInstance(sink) ) {
        var self = this;

        return this.SUPER(null, null, skip, limit, order, predicate).then(function(result) {
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

    function removeAll_(x, skip, limit, order, predicate) {
        return this.SUPER(null, skip, limit, order, predicate);
    },

    function listen_(x, sink, predicate) {
      // TODO: This should probably just be handled automatically via a RemoteSink/Listener
      // TODO: Unsubscribe support.
      var id = foam.next$UID();
      var replyBox = this.__context__.registry.register(
        id,
        this.delegateReplyPolicy,
        {
          send: function(m) {
            switch(m.object.name) {
              case 'put':
              case 'remove':
                sink[m.object.name](null, m.object.obj);
              break;
              case 'reset':
                sink.reset(null);
            }
          }
        });

      this.SUPER(null, this.BoxDAOListener.create({
        box: replyBox
      }), predicate);
    }
  ]
});
