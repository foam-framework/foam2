foam.CLASS({
  package: 'foam.net.sw',
  name: 'HTTPResponse',
  extends: 'foam.net.HTTPResponse',
  properties: [
    {
      name: 'resp',
      postSet: function(_, r) {
        var iterator = r.headers.entries();
        var next = iterator.next();
        while ( ! next.done ) {
          this.headers[next.value[0]] = next.value[1];
          next = iterator.next();
        }
        this.status = r.status;
      }
    },
    {
      name: 'payload',
      factory: function() {
        if ( this.streaming ) {
          return null;
        }

        switch (this.responseType) {
        case "text":
          return this.resp.text();
        case "blob":
          return this.resp.blob();
        case "arraybuffer":
          return this.resp.arraybuffer();
        case "json":
          return this.resp.json();
        }
        // TODO: responseType should be an enum and/or have validation
        throw new Error("Unsupported response type");
      }
    },
    {
      class: 'Boolean',
      name: 'streaming',
      value: false
    }
  ],
  methods: [
    function start() {
      var reader = this.resp.body.getReader();
      this.streaming = true;

      var onData = foam.fn.bind(function(e) {
        if ( e.value ) {
          this.data.pub(e.value);
        }

        if ( e.done || ! this.streaming) {
          console.log("Finished");
          this.end.pub();
          return this;
        }
        return reader.read().then(onData);
      }, this);

      return reader.read().then(onData);
    },
    function stop() {
      this.streaming = false;
    }
  ]
});

foam.CLASS({
  package: 'foam.net.sw',
  name: 'HTTPRequest',
  extends: 'foam.net.HTTPRequest',
  requires: [
    'foam.net.sw.HTTPResponse'
  ],
  methods: [
    function send() {
      if ( this.url ) {
        this.fromUrl(this.url);
      }

      var self = this;

      var headers = new Headers();
      for ( var key in this.headers ) {
        headers.set(key, this.headers[key]);
      }

      var options = {
        method: this.method,
        headers: headers,
        mode: "cors",
        redirect: "follow"
      };

      if ( this.payload ) {
        options.body = this.payload;
      }


      var request = new Request(
        this.protocol + "://" + this.hostname + ( this.port ? ( ':' + this.port ) : '' ) + this.path,
        options);

      return fetch(request).then(function(resp) {
        return this.HTTPResponse.create({
          resp: resp,
          responseType: this.responseType
        });
      }.bind(this));
    }
  ]
});

foam.CLASS({
  package: 'foam.net.sw',
  name: 'EventSource',
  requires: [
    'foam.net.sw.HTTPRequest',
    'foam.encodings.UTF8',
    'foam.parse.StringPS'
  ],
  properties: [
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
      name: 'ps',
      factory: function() {
        return this.StringPS.create();
      }
    },
    'eventData',
    'eventName'
  ],
  topics: [
    {
      name: 'message',
      topics: [
        'put',
        'patch',
        'keep-alive',
        'cancel',
        'auth_revoked'
      ]
    }
  ],
  grammar: function(repeat, alt, sym, notChars, seq) {
    return {
      line: alt(
        sym('event'),
        sym('data')
//        sym('separator')
      ),

//      'separator': sym('eol'),

      event: seq('event: ', sym('event name')),//, sym('eol')),
      'event name': repeat(notChars('\r\n')),

      data: seq('data: ', sym('data payload')),//, sym('eol')),
      'data payload': repeat(notChars('\r\n')),

      'eol': alt(
        '\r\n',
        '\r',
        '\n')
    };
  },
  grammarActions: [
    {
      name: 'event name',
      code: function(v) {
        this.eventName = v.join('');
      }
    },
    {
      name: 'data payload',
      code: function(p) {
        this.eventData = JSON.parse(p.join(''));
      }
    }
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
      req.send().then(function(resp) {
        resp.data.sub(this.onData);
        resp.end.sub(this.onEnd);
        this.resp = resp;
        resp.start();
      }.bind(this));
    },
    function close() {
      this.running = false;
      this.resp.stop();
    },
    function dispatchEvent() {
      // Possible events names
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

      this.ps.setString(line);
      this.line(this.ps);
    }
  ],
  listeners: [
    function onData(s, _, data) {
      this.decoder.put(data);
      var string = this.decoder.string;
      while ( string.indexOf('\n') != -1 ) {
        var line = string.substring(0, string.indexOf('\n'));
        this.processLine(line);
        string = string.substring(string.indexOf('\n') + 1);
      }
      this.decoder.string = string;
    },
    function onEnd() {
      // TODO: Exponential backoff in the case of errors.
      if ( this.running ) {
        this.start();
      }
    }
  ]
});
