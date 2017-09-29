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
    {
      name: 'me',
      key: 'me',
      javaType: 'foam.box.Box'
    },
    'window'
  ],

  classes: [
    foam.core.InnerClass.create({
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
      name: 'parser',
      generateJava: false,
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
      generateJava: false,
      factory: function() {
        return this.JSONOutputter.create().copyFrom(foam.json.Network);
      }
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
protected class Outputter extends foam.lib.json.Outputter {
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
      code: function send(msg) {
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


  output.write(new Outputter().stringify(message));
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
