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
    {
      name: 'Outputter',
      path: 'foam.json.Outputter',
      swiftPath: 'foam.swift.parse.json.output.HTTPBoxOutputter',
    },
    {
      name: 'Parser',
      path: 'foam.json.Parser',
      swiftPath: 'foam.swift.parse.json.FObjectParser',
    },
    {
      name: 'HTTPRequest',
      path: 'foam.net.web.HTTPRequest',
      swiftPath: '',
    },
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
      swiftEnabled: false,
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
      class: 'String',
      name: 'url'
    },
    {
      class: 'String',
      name: 'method',
      value: 'POST'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.json.Parser',
      swiftType: 'FObjectParser',
      name: 'parser',
      factory: function() {
        return this.Parser.create({
          strict:          true,
          creationContext: this.creationContext
        });
      },
      swiftFactory: 'return Parser_create()',
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
      },
      swiftFactory: 'return Outputter_create()',
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

    {
      name: 'send',
      code: function(msg) {
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
      },
      swiftCode: function() {/*
let semaphore = DispatchSemaphore(value: 0)

var request = URLRequest(url: Foundation.URL(string: self.url)!)
request.httpMethod = "POST"
request.httpBody = outputter?.swiftStringify(msg).data(using: .utf8)
let task = URLSession.shared.dataTask(with: request) { data, response, error in
  semaphore.signal()
}
task.resume()
semaphore.wait()
      */},
    },
  ]
});
