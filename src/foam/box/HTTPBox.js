/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box',
  name: 'HTTPBox',

  implements: [ 'foam.box.Box' ],

  requires: [
    'foam.json.Outputter',
    'foam.json.Parser',
    'foam.net.web.HTTPRequest'
  ],

  imports: [
    'creationContext',
    'me',
    'window'
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
          return this.SUPER(o == this.me ? this.HTTPReplyBox.create() : o);
        }
      ]
    }
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
      of: 'foam.json.Parser',
      name: 'parser',
      factory: function() {
        return this.Parser.create({
          strict:          true,
          creationContext: this.creationContext
        });
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.json.Outputter',
      name: 'outputter',
      factory: function() {
        return this.JSONOutputter.create({
          pretty:               false,
          formatDatesAsNumbers: true,
          outputDefaultValues:  false,
          strict:               true,
          propertyPredicate:    function(o, p) { return ! p.networkTransient; }
        });
      }
    }
  ],

  methods: [
    function prepareURL(url) {
      /* Add window's origin if url is not complete. */
      if ( this.window && url.indexOf(':') == -1 ) {
        return this.window.location.origin + '/' + url;
      }

      return url;
    },

    function send(msg) {
      var req = this.HTTPRequest.create({
        url:     this.prepareURL(this.url),
        method:  this.method,
        payload: this.outputter.stringify(msg)
      }).send();

      req.then(function(resp) {
        return resp.payload;
      }).then(function(p) {
        var msg = this.parser.parseString(p);
        msg && this.me.send(msg);
      }.bind(this));
    }
  ]
});
