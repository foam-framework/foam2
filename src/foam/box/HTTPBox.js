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
    {
      name: 'me',
      key: 'me',
      javaType: 'foam.box.Box'
    },
    'window'
  ],

  classes: [
    foam.core.InnerClass.create({
      generateSwift: false,
      generateJava: false,
      model: {
        name: 'JSONOutputter',
        extends: 'foam.json.Outputter',
        generateJava: false,
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
    })
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
      generateJava: false,
      factory: function() {
        return this.Parser.create({
          strict:          true,
          // Trust our own server, but force other servers to go through
          // whitelist.
          creationContext: this.url.indexOf(':') == -1 ?
            this.__context__     :
            this.creationContext
        });
      },
      swiftFactory: 'return Parser_create()',
    },
    {
      class: 'FObjectProperty',
      of: 'foam.json.Outputter',
      name: 'outputter',
      generateJava: false,
      factory: function() {
        return this.JSONOutputter.create().copyFrom(foam.json.Network);
      },
      swiftFactory: 'return Outputter_create()',
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
protected class Outputter extends foam.lib.json.Outputter {
  public Outputter() {
    super(foam.lib.json.OutputterMode.NETWORK);
  }

  protected void outputFObject(foam.core.FObject o) {
    if ( o == getMe() ) {
      o = getX().create(foam.box.HTTPReplyBox.class);
    }
    super.outputFObject(o);
  }
}

protected class ResponseThread implements Runnable {
  protected java.net.URLConnection conn_;
  public ResponseThread(java.net.URLConnection conn) {
    conn_ = conn;
  }

  public void run() {
  }
}
`}));
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

    {
      name: 'send',
      code: function(msg) {
        var payload = this.outputter.stringify(msg);
        var req = this.HTTPRequest.create({
          url:     this.prepareURL(this.url),
          method:  this.method,
          payload: payload
        }).send();

        req.then(function(resp) {
          return resp.payload;
        }).then(function(p) {
          var rmsg = this.parser.parseString(p);
          rmsg && this.me.send(rmsg);
        }.bind(this));
      },
      swiftCode: function() {/*
var request = URLRequest(url: Foundation.URL(string: self.url)!)
request.httpMethod = "POST"
request.httpBody = outputter?.swiftStringify(msg).data(using: .utf8)
let task = URLSession.shared.dataTask(with: request) { data, response, error in
  do {
    guard let data = data else {
      throw FoamError("HTTPBox no response")
    }
    guard let str = String(data: data, encoding: .utf8),
          let obj = self.parser.parseString(str) as? Message else {
      throw FoamError("Failed to parse HTTPBox response")
    }
    guard let me = self.me as? Box else {
      throw FoamError("HTTPBox response has nowhere to go")
    }
    try me.send(obj)
  } catch let e {
    if let eBox = msg.attributes["errorBox"] as? Box {
      let eMsg = self.__context__.create(Message.self, args: ["object": e])!
      try? eBox.send(eMsg)
    }
  }
}
task.resume()
      */},
      javaCode: `
java.net.HttpURLConnection conn;
try {
  java.net.URL url = new java.net.URL(getUrl());
  conn = (java.net.HttpURLConnection)url.openConnection();
  conn.setDoOutput(true);
  conn.setRequestMethod("POST");
  conn.setRequestProperty("Accept", "application/json");
  conn.setRequestProperty("Content-Type", "application/json");

  java.io.OutputStreamWriter output = new java.io.OutputStreamWriter(conn.getOutputStream(),
                                                                     java.nio.charset.StandardCharsets.UTF_8);


  Outputter outputter = new Outputter();
  outputter.setX(getX());
  output.write(outputter.stringify(message));
  output.close();

// TODO: There has to be a better way to do this.
byte[] buf = new byte[8388608];
java.io.InputStream input = conn.getInputStream();

int off = 0;
int len = buf.length;
int read = -1;
while ( len != 0 && ( read = input.read(buf, off, len) ) != -1 ) {
  off += read;
  len -= read;
}

if ( len == 0 && read != -1 ) {
  throw new RuntimeException("Message too large.");
}

String str = new String(buf, 0, off, java.nio.charset.StandardCharsets.UTF_8);

foam.core.FObject responseMessage = getX().create(foam.lib.json.JSONParser.class).parseString(str);

if ( responseMessage == null ) {
  throw new RuntimeException("Error parsing response.");
}

if ( ! ( responseMessage instanceof foam.box.Message ) ) {
  throw new RuntimeException("Invalid response type: " + responseMessage.getClass().getName() + " expected foam.box.Message.");
}

getMe().send((foam.box.Message)responseMessage);

} catch(java.io.IOException e) {
  // TODO: Error box?
  throw new RuntimeException(e);
}
`
    }
  ]
});
