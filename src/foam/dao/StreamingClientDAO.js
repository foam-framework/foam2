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
  name: 'StreamingClientDAO',
  extends: 'foam.dao.BaseClientDAO',

  requires: [
    'foam.dao.ArraySink',
    'foam.dao.BoxDAOListener'
  ],
  imports: [ 'registry' ],

  classes: [
    {
      name: 'StreamingReplyBox',

      properties: [
        {
          name: 'id',
          factory: function() { return foam.next$UID(); }
        },
        {
          class: 'FObjectProperty',
          of: 'foam.dao.Sink',
          name: 'sink'
        },
        // TODO(markdittmer): Signal remote of detached and unregister
        // reply box.
        {
          name: 'sinkSub_',
          factory: function() {
            var sub = foam.core.FObject.create();
            sub.onDetach(function() { this.detached_ = true; }.bind(this));
          }
        },
        {
          class: 'Boolean',
          name: 'detached_'
        },
        {
          name: 'promise',
          factory: function() {
            var self = this;
            return new Promise(function(resolve, reject) {
              self.resolve_ = resolve;
              self.reject_ = reject;
            });
          }
        },
        'resolve_',
        'reject_'
      ],

      methods: [
        function send(msg) {
          // TODO(markdittmer): Error check message type.

          if ( this.detached_ ) return;
          switch ( msg.object.name ) {
            case 'put':
              this.sink.put(msg.object.obj, this.sinkSub_);
              break;
            case 'remove':
              this.sink.remove(msg.object.obj, this.sinkSub_);
              break;
            case 'eof':
              this.sink.eof();
              this.resolve_(this.sink);
              break;
            case 'reset':
              this.sink.reset();
              break;
          }
        }
      ]
    }
  ],

  methods: [
    function select_(x, sink, skip, limit, order, predicate) {
      var replyBox = this.StreamingReplyBox.create({
        sink: sink || this.ArraySink.create()
      });
      var promise = replyBox.promise;

      replyBox = this.registry.register(replyBox.id, null, replyBox);

      // TODO(markdittmer): Shouldn't there be an annotation for an errorBox
      // somewhere here?
      this.SUPER(
          null, this.BoxDAOListener.create({ box: replyBox }),
          skip, limit, order, predicate)
              .catch(function(error) { replyBox.reject_(error); });
      return promise;
    },
    function listen_(x, sink, predicate) {
      var replyBox = this.StreamingReplyBox.create({
        sink: sink || this.ArraySink.create()
      });
      replyBox = this.registry.register(replyBox.id, null, replyBox);

      // TODO(markdittmer): Shouldn't there be an annotation for an errorBox
      // somewhere here?
      this.SUPER(null, this.BoxDAOListener.create({ box: replyBox }),
                 predicate);
    }
  ]
});
