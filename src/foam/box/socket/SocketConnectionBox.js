/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box.socket',
  name: 'SocketConnectionBox',

  implements: [
    'foam.box.Box',
    'foam.core.ContextAgent'
  ],

  javaImports: [
    'foam.box.Box',
    'foam.box.Message',
    'foam.box.ReplyBox',
    'foam.core.FObject',
    'foam.core.X',
    'foam.lib.json.JSONParser',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'java.net.Socket',
    'java.io.DataInputStream',
    'java.io.DataOutputStream',
    'java.io.InputStream',
    'java.io.InputStreamReader',
    'java.io.IOException',
    'java.io.OutputStream',
    'java.io.OutputStreamWriter',
    'java.nio.ByteBuffer',
    'java.nio.charset.StandardCharsets',
    'java.util.Map',
    'java.util.HashMap',
    'java.util.Collections',
    'java.util.concurrent.atomic.AtomicLong',
  ],
    
  constants: [
    {
      name: 'REPLY_BOX_ID',
      value: 'REPLY_BOX_ID',
      type: 'String'
    }
  ],

  properties: [
    {
      name: 'host',
      class: 'String'
    },
    {
      name: 'port',
      class: 'Int'
    },
    {
      name: 'socket',
      class: 'Object',
      visibility: 'HIDDEN'
    },
    {
      documentation: 'Set to false when send exits, triggering execute to exit',
      name: 'valid',
      class: 'Boolean',
      value: true,
      visibility: 'HIDDEN'
    },
    {
      name: 'replyBoxes',
      class: 'Map',
      javaFactory: `return new HashMap();`,
      visibility: 'HIDDEN',
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName(),
          getHost(),
          getPort()
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
  public SocketConnectionBox(X x, Socket socket, String host, int port)
    throws IOException
  {
    setX(x);
    setHost(host);
    setPort(port);
    setSocket(socket);

    // NOTE: raw socket InputStream does not block on read.
    out_ = new DataOutputStream(socket.getOutputStream());
    in_ = new DataInputStream(socket.getInputStream());
  }

  protected DataInputStream in_;
  protected DataOutputStream out_;
  private static AtomicLong replyBoxId_ = new AtomicLong(0);

  protected static final ThreadLocal<foam.lib.formatter.FObjectFormatter> formatter_ = new ThreadLocal<foam.lib.formatter.FObjectFormatter>() {
    @Override
    protected foam.lib.formatter.JSONFObjectFormatter initialValue() {
      foam.lib.formatter.JSONFObjectFormatter formatter = new foam.lib.formatter.JSONFObjectFormatter();
      formatter.setQuoteKeys(true);
      formatter.setPropertyPredicate(new foam.lib.NetworkPropertyPredicate());
      return formatter;
    }

    @Override
    public foam.lib.formatter.FObjectFormatter get() {
      foam.lib.formatter.FObjectFormatter formatter = super.get();
      formatter.reset();
      return formatter;
    }
  };
        `
        }));
      }
    }
  ],

  methods: [
    {
      name: 'send',
      javaCode: `
      Long replyBoxId = replyBoxId_.incrementAndGet();
      Box replyBox = (Box) msg.getAttributes().get("replyBox");
      getReplyBoxes().put(replyBoxId, replyBox);
      SocketClientReplyBox box = new SocketClientReplyBox(replyBoxId);
      if ( replyBox instanceof ReplyBox ) {
        ((ReplyBox)replyBox).setDelegate(box);
        getLogger().debug("send", "replyBox.setDelegate");
      } else {
        replyBox = box;
      }
      msg.getAttributes().put("replyBox", replyBox);
      String message = null;
      try {
        foam.lib.formatter.FObjectFormatter formatter = formatter_.get();
        formatter.setX(getX());
        formatter.output(msg);
        message = formatter.builder().toString();

        byte[] messageBytes = message.getBytes(StandardCharsets.UTF_8);
        synchronized (out_) {
          out_.writeInt(messageBytes.length);
          out_.write(messageBytes);
          // out_.flush();
          if ( replyBoxId == replyBoxId_.get() ) {
            getLogger().debug("flush");
            out_.flush();
          } else {
            getLogger().debug("flush", "skip", replyBoxId, replyBoxId_.get());
          }
        }
      } catch ( Exception e ) {
        if ( message != null ) {
          int length = message.length();
          int chunk = Math.max(0, Math.min(length, 100) - 1);
          getLogger().info("send", length, message.substring(0, chunk), "...", message.substring(length-chunk));
        }
        getLogger().error(e);
        setValid(false);
        ((SocketConnectionBoxManager) getX().get("socketConnectionBoxManager")).remove(this);
        throw new RuntimeException(e);
      }
      `
    },
    {
      name: 'execute',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      while ( getValid() ) {
        try {
          int length = in_.readInt();
          byte[] bytes = new byte[length];
          StringBuilder data = new StringBuilder();
          int total = 0;
          while ( true ) {
            int bytesRead = in_.read(bytes, 0, length - total);
            if ( bytesRead == -1 ) {
              getLogger().debug("eof,-1");
              break;
            }
            data.append(new String(bytes, 0, bytesRead, StandardCharsets.UTF_8));
            total += bytesRead;
            if ( total == length ) {
              break;
            }
            if ( total > length ) {
              getLogger().error("read too much", length, total);
              break;
            }
          }
          String message = data.toString();
          if ( foam.util.SafetyUtil.isEmpty(message) ) {
            Socket socket = (Socket) x.get("socket");
            getLogger().error("Received empty message from", socket != null ? socket.getRemoteSocketAddress() : "NA");
            throw new RuntimeException("Received empty message.");
          }
          Message msg = (Message) x.create(JSONParser.class).parseString(message);
          if ( msg == null ) {
            int chunk = Math.max(0, Math.min(length, 100) - 1);
            String start = new String(java.util.Arrays.copyOfRange(bytes, 0, chunk), StandardCharsets.UTF_8);
            String end = new String(java.util.Arrays.copyOfRange(bytes, length-chunk, length-1), StandardCharsets.UTF_8);
            getLogger().debug("bytes", getSocket() != null ? ((Socket) getSocket()).getRemoteSocketAddress() : "NA", length, start, "...", end);
            throw new RuntimeException("Failed to parse message.");
          }
          Long replyBoxId = (Long) msg.getAttributes().get(REPLY_BOX_ID);
          Box replyBox = (Box) getReplyBoxes().get(replyBoxId);
          if ( replyBox != null ) {
            getReplyBoxes().remove(replyBoxId);
            replyBox.send(msg);
          } else {
            getLogger().error("ReplyBox not found.");
            throw new RuntimeException("ReplyBox not found.");
          }
        } catch ( java.net.SocketTimeoutException e ) {
          continue;
        } catch ( java.io.EOFException | java.net.SocketException e ) {
          getLogger().error(e);
          break;
        } catch ( Throwable t ) {
          // REVIEW: remove this catch when understand all exceptions
          getLogger().error(t);
          break;
        } finally {
          ((SocketConnectionBoxManager) getX().get("socketConnectionBoxManager")).remove(this);
          Socket socket = (Socket) getSocket();
          if ( socket != null ) {
            try {
              getLogger().debug("execute,socket,close", getValid());
              socket.close();
            } catch ( java.io.IOException e ) {
              // nop
            }
          }
        }
      }
      `
    }
  ]
});
