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
  name: 'BackoffBox',
  extends: 'foam.box.ProxyBox',
  imports: [
    'setTimeout'
  ],
  javaImports: [
    'java.lang.InterruptedException'
  ],
  properties: [
    {
      class: 'Int',
      javaType: 'long',
      name: 'delay',
      preSet: function(_, a) {
        return a < this.maxDelay ? a : this.maxDelay;
      },
      value: 1
    },
    {
      class: 'Int',
      name: 'maxDelay',
      value: 20000
    }
  ],
  methods: [
    {
      name: 'send',
      args: [
        {
          name: 'm',
          type: 'foam.box.Message'
        }
      ],
      code: function (m) {
        var self = this;
        this.setTimeout(function() {
          self.delegate.send(m);
        }, this.delay);

        this.delay *= 2;
      },
      javaCode: `
        try {
          Thread.sleep(getDelay());
        } catch (InterruptedException e) {}
        setDelay(getDelay() * 2);
      `
    }
  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'RetryReplyBox',
  extends: 'foam.box.ProxyBox',
  requires: [
    'foam.core.Exception'
  ],
  properties: [
    {
      name: 'attempt',
      value: 0
    },
    {
      name: 'maxAttempts'
    },
    {
      name: 'message'
    },
    {
      name: 'destination'
    }
  ],
  methods: [
    {
      name: 'send',
      args: [
        {
          name: 'msg',
          type: 'foam.box.Message'
        }
      ],
      code: function send(msg) {
        if ( this.Exception.isInstance(msg.object) &&
             ( this.maxAttempts == -1 || this.attempt < this.maxAttempts ) ) {
          this.attempt++;
          this.destination.send(this.message);
          return;
        }

        this.delegate && this.delegate.send(msg);
      },
      javaCode: `
        if (
          m instanceof foam.core.Exception &&
          (
            getMaxAttempts() == -1 ||
            getAttempt() < getMaxAttempts()
          )
        ) {
          setAttempt(getAttempt() + 1);
          getDestination().send(getMessage());
          return;
        }
        if ( getDelegate() != null ) {
          getDelegate().send(msg);
        }
      `
    }
  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'RetryBox',
  extends: 'foam.box.ProxyBox',

  requires: [
    'foam.box.BackoffBox',
    'foam.box.RetryReplyBox'
  ],

  properties: [
    'attempts',
    {
      name: 'maxAttempts',
      documentation: 'Set to -1 to infinitely retry.',
      value: 3
    }
  ],

  methods: [
    {
      name: 'send',
      args: [
        {
          name: 'msg',
          type: 'foam.box.Message'
        }
      ],
      code: function (msg) {
        var replyBox = msg.attributes.replyBox;

        if ( replyBox ) {
          var clone = msg.cls_.create(msg);

          replyBox.localBox = this.RetryReplyBox.create({
            delegate: replyBox.localBox,
            maxAttempts: this.maxAttempts,
            message: clone,
            destination: this.BackoffBox.create({
              delegate: this.delegate
            })
          });

          clone.attributes = {};
          for ( var key in msg.attributes ) {
            clone.attributes[key] = msg.attributes[key];
          }
        }

        this.delegate.send(msg);
      },
      javaCode: `
        Box replyBox = (Box) msg.getAttributes().get("replyBox");

        if ( replyBox == null ) {
          getDelegate().send(msg);
          return;
        }

        // TODO: determine if cloning delegate replyBox is necessary

        replyBox.setLocalBox(new RetryReplyBox.Builder(getX())
          .setDelegate(replyBox.getLocalBox())
          .setMaxAttempts(getMaxAttempts())
          .setMessage(msg) // TODO: cloned?
          .setDestination(new BackoffBox.Builder(getX())
            .setDelegate(getDelegate())
            .build());
          .build());

        getDelegate().send(msg);
      `
    }
  ]
});
