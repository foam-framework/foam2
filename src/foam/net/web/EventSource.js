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
  package: 'foam.net.web',
  name: 'EventSource',

  requires: [
    'foam.parse.Grammar',
    'foam.net.web.HTTPRequest',
    'foam.encodings.UTF8'
  ],

  imports: [
    'setTimeout',
    'clearTimeout'
  ],

  topics: [
    {
      name: 'message'
    }
  ],

  properties: [
    {
      name: 'grammar',
      factory: function() {
        var self = this;
        return this.Grammar.create({
          symbols: function(repeat, alt, sym, notChars, seq) {
            return {
              START: sym('line'),

              line: alt(
                sym('event'),
                sym('data')),

              event: seq('event: ', sym('event name')),
              'event name': repeat(notChars('\r\n')),

              data: seq('data: ', sym('data payload')),
              'data payload': repeat(notChars('\r\n'))
            }
          }
        }).addActions({
          'event name': function(v) {
            self.eventName = v.join('');
          },
          'data payload': function(p) {
            self.eventData = p.join('');
          }
        });
      }
    },
    {
      class: 'String',
      name: 'uri'
    },
    {
      class: 'Boolean',
      name: 'running',
      value: false
    },
    {
      name: 'resp'
    },
    {
      name: 'decoder',
      factory: function() {
        return this.UTF8.create()
      }
    },
    {
      name: 'retryTimer'
    },
    {
      class: 'Int',
      name: 'delay',
      preSet: function(_, a) {
        if ( a > 30000 ) return 30000;
        return a;
      },
      value: 1
    },
    'eventData',
    'eventName'
  ],

  methods: [
    function start() {
      var req = this.HTTPRequest.create({
        method: "GET",
        url: this.uri,
        headers: {
          'accept': 'text/event-stream'
        }
      });

      this.running = true;
      this.keepAlive();
      req.send().then(function(resp) {
        if ( ! resp.success ) {
          this.onError();
          return;
        }

        this.clearProperty('decoder');
        resp.data.sub(this.onData);
        resp.end.sub(this.onError);
        this.resp = resp;
        resp.start();
      }.bind(this), this.onError);
    },

    function keepAlive() {
      if ( this.retryTimer ) {
        this.clearTimeout(this.retryTimer);
      }

      this.retryTimer = this.setTimeout(foam.Function.bind(function() {
        this.retryTimer = 0;
        this.onError();
      }, this), 30000);
    },

    function close() {
      this.running = false;
      this.resp.stop();
    },

    function dispatchEvent() {
      // Known possible events names
      // put
      // patch
      // keep-alive
      // cancel
      // auth revoked

      this.message.pub(this.eventName, this.eventData);
      this.eventName = null;
      this.eventData = null;
    },

    function processLine(line) {
      // TODO: This can probably be simplified by using state machine based
      // parsers, but in the interest of saving time we're going to do it line
      // by line for now.  Something we know works from previous interations.

      if ( line.length == 0 ) {
        this.dispatchEvent();
        return;
      }

      this.grammar.parseString(line);
    }
  ],

  listeners: [
    function onData(s, _, data) {
      this.delay = 1;
      this.keepAlive();

      this.decoder.put(data);
      var string = this.decoder.string;
      while ( string.indexOf('\n') != -1 ) {
        var line = string.substring(0, string.indexOf('\n'));
        this.processLine(line);
        string = string.substring(string.indexOf('\n') + 1);
      }
      this.decoder.string = string;
    },

    function onError() {
      this.delay *= 2;
      this.setTimeout(this.onEnd, this.delay);
    },

    function onEnd() {
      if ( this.running ) {
        this.start();
      }
    }
  ]
});
