/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.box',
  name: 'HTTPException',
  implements: [ 'foam.core.Exception' ],
  properties: [
    'response'
  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'HTTPBox',

  implements: [ 'foam.box.Box' ],

  requires: [
    {
      path: 'foam.json.Parser',
      flags: ['js'],
    },
    {
      path: 'foam.net.web.HTTPRequest',
      flags: ['js'],
    },
    {
      path: 'foam.json.Outputter',
      flags: ['js'],
    },
    {
      path: 'foam.swift.parse.json.FObjectParser',
      flags: ['swift'],
    },
    {
      name: 'SwiftOutputter',
      path: 'foam.swift.parse.json.output.Outputter',
      flags: ['swift'],
    },
    'foam.box.HTTPReplyBox',
    'foam.box.HTTPException',
    'foam.box.Message',
  ],

  javaImports: [
    'javax.servlet.http.HttpServletRequest'
  ],

  imports: [
    'creationContext',
    {
      name: 'me',
      key: 'me',
      type: 'foam.box.Box'
    },
    'window'
  ],

  constants: [
    {
      name: 'SESSION_KEY',
      value: 'sessionId',
      type: 'String'
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'sessionName',
      value: 'defaultSession'
    },
    {
      class: 'String',
      name: 'sessionID',
      factory: function() {
        return localStorage[this.sessionName] ||
          ( localStorage[this.sessionName] = foam.uuid.randomGUID() );
      }
    },
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
      documentation: 'Calling http url, used when explicitly making cross site requests.',
      name: 'origin',
      class: 'String',
      factory: function() {
        return this.window && this.window.location.origin;
      },
      javaFactory: `
      HttpServletRequest req = getX().get(HttpServletRequest.class);
      if ( req != null ) {
        return req.getScheme()+"://"+req.getServerName();
      }
      return null;
      `
    },
    {
      class: 'Enum',
      of: 'foam.box.HTTPAuthorizationType',
      name: 'authorizationType',
      value: foam.box.HTTPAuthorizationType.NONE
    },
    {
      class: 'FObjectProperty',
      of: 'foam.json.Parser',
      swiftType: 'foam_swift_parse_json_FObjectParser',
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
      swiftFactory: 'return FObjectParser_create()',
    },
    {
      class: 'FObjectProperty',
      of: 'foam.json.Outputter',
      swiftType: 'foam_swift_parse_json_output_Outputter',
      name: 'outputter',
      generateJava: false,
      swiftFactory: 'return SwiftOutputter_create()',
      factory: function() {
        return this.Outputter.create().copyFrom(foam.json.Network);
      }
    },
    {
      class: 'Int',
      name: 'connectTimeout',
      value: 0
    },
    {
      class: 'Int',
      name: 'readTimeout',
      value: 0
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  protected static final ThreadLocal<foam.lib.formatter.FObjectFormatter> formatter_ = new ThreadLocal<foam.lib.formatter.FObjectFormatter>() {
    @Override
    protected foam.lib.formatter.JSONFObjectFormatter initialValue() {
      foam.lib.formatter.JSONFObjectFormatter formatter = new foam.lib.formatter.JSONFObjectFormatter();
      formatter.setQuoteKeys(true);
      formatter.setOutputShortNames(true);
      formatter.setPropertyPredicate(new foam.lib.AndPropertyPredicate(new foam.lib.PropertyPredicate[] {new foam.lib.NetworkPropertyPredicate(), new foam.lib.PermissionedPropertyPredicate()}));
      return formatter;
    }

    @Override
    public foam.lib.formatter.FObjectFormatter get() {
      foam.lib.formatter.FObjectFormatter formatter = super.get();
      formatter.reset();
      return formatter;
    }
  };

protected class ResponseThread implements Runnable {
  protected java.net.URLConnection conn_;
  public ResponseThread(java.net.URLConnection conn) {
    conn_ = conn;
  }

  public void run() {
    /* Template method. */
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
        msg.attributes[this.SESSION_KEY] = this.sessionID;

        // TODO: We should probably clone here, but often the message
        // contains RPC arguments that don't clone properly.  So
        // instead we will mutate replyBox and put it back after.
        var replyBox = msg.attributes.replyBox;

        msg.attributes.replyBox = this.getReplyBox();

        var payload = this.outputter.stringify(msg);

        msg.attributes.replyBox = replyBox;

        var headers = {
          'Content-Type': 'application/json; charset=utf-8',
          'Origin': this.origin
        };

        if ( this.authorizationType === foam.box.HTTPAuthorizationType.BEARER ) {
          headers['Authorization'] = 'BEARER ' + this.sessionID;
        }

        var req = this.HTTPRequest.create({
          url:     this.prepareURL(this.url),
          method: this.method,
          payload: payload,
          headers: headers
        }).send();

        req.then(function(resp) {
          return resp.payload;
        }).then(function(p) {
          return this.parser.aparse(p);
        }.bind(this)).then(function(rmsg) {
          rmsg && replyBox && replyBox.send(rmsg);
        }.bind(this), function(r) {
          replyBox && replyBox.send(foam.box.Message.create({ object: foam.box.HTTPException.create({ response: r }) }));
        });
      },
      swiftCode: function() {/*
let msg = msg!
let replyBox = msg.attributes["replyBox"] as? foam_box_Box
msg.attributes["replyBox"] = getReplyBox()

var request = URLRequest(url: Foundation.URL(string: self.url)!)
request.httpMethod = "POST"
request.httpBody = outputter.swiftStringify(msg)!.data(using: .utf8)

msg.attributes["replyBox"] = replyBox

let task = URLSession.shared.dataTask(with: request) { data, response, error in
  do {
    guard let data = data else {
      throw FoamError("HTTPBox no response")
    }
    guard let str = String(data: data, encoding: .utf8),
          let obj = self.parser.parseString(str) as? foam_box_Message else {
      throw FoamError("Failed to parse HTTPBox response")
    }
    try replyBox?.send(obj)
  } catch let e {
    try? replyBox?.send(self.__context__.create(foam_box_Message.self, args: ["object": e])!)
  }
}
task.resume()
      */},
      javaCode: `
      // TODO: Go async and make request in a separate thread.

      java.net.HttpURLConnection conn;
      foam.box.Box replyBox = (foam.box.Box)msg.getAttributes().get("replyBox");

      try {
        conn = getConnection();
        java.io.OutputStreamWriter output =
          new java.io.OutputStreamWriter(conn.getOutputStream(),
                                            java.nio.charset.StandardCharsets.UTF_8);

        // TODO: Clone message or something when it clones safely.
        msg.getAttributes().put("replyBox", getReplyBox());

        foam.lib.formatter.FObjectFormatter formatter = formatter_.get();
        formatter.setX(getX());
        formatter.output(msg);
        output.write(formatter.builder().toString());

        msg.getAttributes().put("replyBox", replyBox);
        output.close();

        replyBox.send((foam.box.Message)getResponseMessage(conn));

      } catch(java.io.IOException e) {
        foam.box.Message replyMessage = getX().create(foam.box.Message.class);
        replyMessage.setObject(e);
        replyBox.send(replyMessage);
      }
      `
    },
    {
      name: 'getReplyBox',
      type: 'foam.box.Box',
      code: function() {
        return this.HTTPReplyBox.create();
      },
      swiftCode: function() {/*
      return HTTPReplyBox_create()
                             */},
      javaCode: `
        return getX().create(foam.box.HTTPReplyBox.class);
      `
    },
    {
      name: 'getConnection',
      javaType: 'java.net.HttpURLConnection',
      javaThrows: ['java.io.IOException'],
      javaCode: `
      java.net.URL url = new java.net.URL(getUrl());
      java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
      conn.setDoOutput(true);
      conn.setRequestMethod("POST");
      conn.setRequestProperty("Accept", "application/json");
      conn.setRequestProperty("Content-Type", "application/json");
      if ( getOrigin() != null ) {
        conn.setRequestProperty("Origin", getOrigin());
      }
      if ( getAuthorizationType() == HTTPAuthorizationType.BEARER ) {
        conn.setRequestProperty("Authorization", "BEARER "+getSessionID());
      }
      conn.setConnectTimeout(getConnectTimeout());
      conn.setReadTimeout(getReadTimeout());
      return conn;
      `
    },
    {
      name: 'getResponseMessage',
      args: [
        {
          name: 'conn',
          type: 'java.net.HttpURLConnection'
        }
      ],
      javaType: 'foam.core.FObject',
      javaThrows: ['java.io.IOException'],
      javaCode: `
      // TODO: Switch to ReaderPStream when https://github.com/foam-framework/foam2/issues/745 is fixed.
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
        ((foam.nanos.logger.Logger) getX().get("logger")).error("HTTPBox", "Error parsing response.", str);
        throw new RuntimeException("Error parsing response.");
      }
      if ( ! ( responseMessage instanceof foam.box.Message ) ) {
        throw new RuntimeException("Invalid response type: " + responseMessage.getClass().getName() + " expected foam.box.Message.");
      }
      return responseMessage;
      `
    }
  ]
});
