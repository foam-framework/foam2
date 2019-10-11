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
  package: 'foam.box',
  name: 'TimeoutException',
  implements: ['foam.core.Exception']
});

foam.CLASS({
  package: 'foam.box',
  name: 'TimeoutBox',
  //  implements: ['foam.box.Box'],
  extends: 'foam.box.ProxyBox',
  requires: [
    'foam.box.TimeoutException',
    'foam.box.Message'
  ],
  properties: [
    {
      class: 'Int',
      name: 'timeout',
      // TODO: change this back to 5s once we have the cacheDAO.
      value: 60000,
      preSet: function(old, nu) {
        // TODO: Try to detect CPF-1625
        if ( nu < 5000 ) {
          debugger;
          console.warn("Setting timeout to low value", nu);
          return 5000;
        }
        return nu;
      }
    }
  ],
  methods: [
    function send(msg) {
      var replyBox = msg.attributes.replyBox;
      var localReplyBox = replyBox.localBox;

      if ( ! replyBox ) {
        this.delegate.send(msg);
        return;
      }

      var tooLate = false;
      var timer = setTimeout(function() {
        tooLate = true;
        localReplyBox.send(this.Message.create({
          object: this.TimeoutException.create()
        }));
      }.bind(this), this.timeout);

      var self = this;

      replyBox.localBox = foam.box.AnonymousBox.create({
        f: function(msg) {
          if ( ! tooLate ) {
            clearTimeout(timer);
            localReplyBox.send(msg);
            return;
          }

          // TODO: Is it wise to increase the timeout?  Seems
          // reasonable, if our timeout value is too conservative and
          // the server is just slow we're better to wait longer
          // rather than hit it with additional requests while its
          // still processing our old ones.
          self.timeout *= 2;
        }
      });

      this.delegate.send(msg);
    }
  ]
});
