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
  name: 'HTTPBox',

  implements: ['foam.box.Box'],

  requires: [
    'foam.net.web.HTTPRequest'
  ],

  imports: [
    'stringifier? as ctxStringifier',
    'me',
    'parser'
  ],

  properties: [
    {
      name: 'url'
    },
    {
      name: 'method'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.json.Stringifier',
      name: 'stringifier',
      factory: function() {
        var stringifier = this.JSONOutputter.create();
        if ( this.ctxStringifier ) stringifier.copyFrom(this.ctxStringifier);
        else                       stringifier.copyFrom(foam.json.Network);
        return stringifier;
      }
    }
  ],

  classes: [
    {
      name: 'JSONOutputter',
      extends: 'foam.json.Outputter',
      requires: [
        'foam.box.HTTPReplyBox'
      ],
      imports: [
        'me'
      ],
      methods: [
        function output(o) {
          if ( o === this.me ) {
            return this.SUPER(this.HTTPReplyBox.create());
          }
          return this.SUPER(o);
        }
      ]
    }
  ],

  methods: [
    {
      name: 'send',
      code: function(msg) {
        var req = this.HTTPRequest.create({
          url: this.url,
          method: this.method,
          payload: this.stringifier.stringify(msg)
        }).send();

        req.then(function(resp) {
          return resp.payload;
        }).then(function(p) {
          var msg = this.parser.parseString(p);
          msg && this.me.send(msg);
        }.bind(this));
      }
    }
  ]
});
