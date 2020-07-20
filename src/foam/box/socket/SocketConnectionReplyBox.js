/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box.socket',
  name: 'SocketConnectionReplyBox',

  implements: [
    'foam.box.Box'
  ],

  javaImports: [
    'foam.core.X',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'java.io.DataOutputStream',
    'java.io.IOException',
    'java.io.OutputStream',
    'java.net.Socket',
    'java.nio.ByteBuffer',
    'java.nio.charset.StandardCharsets',
    'java.util.concurrent.atomic.AtomicLong',
  ],

  properties: [
    {
      documentation: 'managed by SocketConnectionBoxManager',
      name: 'key',
      class: 'String',
      transient: true,
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      transient: true,
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName(),
          getKey()
        }, (Logger) getX().get("logger"));
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  public SocketConnectionReplyBox(X x, String key) {
    setX(x);
    setKey(key);
  }

  protected static final ThreadLocal<foam.lib.formatter.FObjectFormatter> formatter_ = new ThreadLocal<foam.lib.formatter.FObjectFormatter>() {
    @Override
    protected foam.lib.formatter.JSONFObjectFormatter initialValue() {
      foam.lib.formatter.JSONFObjectFormatter formatter = new foam.lib.formatter.JSONFObjectFormatter();
      formatter.setQuoteKeys(true);
      formatter.setPropertyPredicate(new foam.lib.ClusterPropertyPredicate());
      return formatter;
    }

    @Override
    public foam.lib.formatter.FObjectFormatter get() {
      foam.lib.formatter.FObjectFormatter formatter = super.get();
      formatter.reset();
      return formatter;
    }
  };

  private static AtomicLong flushId_ = new AtomicLong(0);
        `
        }));
      }
    }
  ],

  methods: [
    {
      name: 'send',
      javaCode: `
      // TODO/REVIEW: request context with socket, in, out is in message
      // but not box.
      // test for correct context
      DataOutputStream out = (DataOutputStream) getX().get("socketOutputStream");
      if ( out == null ) {
        out = (DataOutputStream) msg.getX().get("socketOutputStream");
        if ( out != null ) {
          getLogger().warning("Using msg context");
          setX(msg.getX());
        }
      }

      Long flushId = flushId_.incrementAndGet();
      try {
        foam.lib.formatter.FObjectFormatter formatter = formatter_.get();
        formatter.setX(getX());
        formatter.output(msg);
        String message = formatter.builder().toString();
        // getLogger().debug("message", message);
        // int length = message.length();
        // int chunk = Math.max(0, Math.min(length, 200) - 1);
        // getLogger().debug("send", length, message.substring(0, chunk), "...", message.substring(length-chunk));

        byte[] messageBytes = message.getBytes(StandardCharsets.UTF_8);
        synchronized( out ) {
          out.writeInt(messageBytes.length);
          out.writeLong(System.currentTimeMillis());
          out.write(messageBytes);
          // // out.flush();
          // if ( flushId == flushId_.get() ) {
          //   getLogger().debug("flush");
          //   out.flush();
          // } else {
          //   getLogger().debug("flush", "skip", flushId, flushId_.get());
          // }
        }
      } catch (Throwable t) {
        getLogger().error(t);
        throw new RuntimeException(t);
      } finally {
        ((SocketConnectionBoxManager) getX().get("socketConnectionBoxManager")).removeReplyBox(this);
      }
      `
    }
  ]
});
