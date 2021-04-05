/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.box.socket',
  name: 'SocketConnectionBox',

  documentation: `Establishes a socket connection managed by the SocketConnectionBoxManager, with synchronous 'send' and asychronous 'receive'.`,
  
  implements: [
    'foam.box.Box',
    'foam.core.ContextAgent'
  ],

  javaImports: [
    'foam.box.Box',
    'foam.box.Message',
    'foam.box.ReplyBox',
    'foam.box.RPCErrorMessage',
    'foam.core.ContextAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.lib.json.JSONParser',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.om.OMLogger',
    'foam.nanos.pm.PM',
    'java.io.BufferedOutputStream',
    'java.io.DataInputStream',
    'java.io.DataOutputStream',
    'java.io.InputStream',
    'java.io.InputStreamReader',
    'java.io.IOException',
    'java.io.OutputStream',
    'java.io.OutputStreamWriter',
    'java.net.Socket',
    'java.net.SocketException',
    'java.nio.ByteBuffer',
    'java.nio.charset.StandardCharsets',
    'java.util.Map',
    'java.util.HashMap',
    'java.util.Collections',
    'java.util.concurrent.atomic.AtomicInteger',
    'java.util.concurrent.atomic.AtomicLong'
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
      documentation: 'managed by SocketConnectionBoxManager',
      name: 'key',
      class: 'String'
    },
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
      name: 'id',
      class: 'String',
      javaFactory: `return getHost()+":"+getPort();`
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
  public SocketConnectionBox(X x, String key, Socket socket, String host, int port)
    throws IOException
  {
    setX(x);
    setKey(key);
    setHost(host);
    setPort(port);
    setSocket(socket);

    out_ = new DataOutputStream(new BufferedOutputStream(socket.getOutputStream()));
    in_ = new DataInputStream(socket.getInputStream());
  }

  protected DataInputStream in_;
  protected DataOutputStream out_;

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
        `
        }));
      }
    }
  ],

  methods: [
    {
      documentation: `Send format:
timestamp: 4 bytes, // used to generate a PM when received. 
length: 1 byte, // message byte length
message
NOTE: duplicated in SocketConnectionReplyBox
`,
      name: 'send',
      javaCode: `
      PM pm = PM.create(getX(), this.getClass().getSimpleName(), getId()+":send");
      Box replyBox = (Box) msg.getAttributes().get("replyBox");
      String replyBoxId = null;
      if ( replyBox != null ) {
        replyBoxId = java.util.UUID.randomUUID().toString();
        getReplyBoxes().put(replyBoxId, new BoxHolder(replyBox, PM.create(getX(), this.getOwnClassInfo().getId(), getHost()+":"+getPort()+":roundtrip")));
        SocketClientReplyBox box = new SocketClientReplyBox(replyBoxId);
        if ( replyBox instanceof ReplyBox ) {
          ((ReplyBox)replyBox).setDelegate(box);
          getLogger().debug("send", "replyBox.setDelegate");
        } else {
          msg.getAttributes().put("replyBox", box);
        }
      }
      String message = null;
      try {
        OMLogger omLogger = (OMLogger) getX().get("OMLogger");
        foam.lib.formatter.FObjectFormatter formatter = formatter_.get();
        formatter.setX(getX());
        formatter.output(msg);
        message = formatter.builder().toString();
        byte[] messageBytes = message.getBytes(StandardCharsets.UTF_8);
        Socket socket = (Socket) getSocket();
        if ( socket.isClosed() ||
             ! socket.isConnected() ) {
          throw new SocketException("Socket not connected.");
        }
        omLogger.log(this.getClass().getSimpleName(), getId(), "pending");
        synchronized (out_) {
          // NOTE: enable along with send debug call in SocketServerProcessor to monitor all messages.
          // getLogger().debug("send", message);
          out_.writeLong(System.currentTimeMillis());
          out_.writeInt(messageBytes.length);
          out_.write(messageBytes);
          // TODO/REVIEW
          out_.flush();
          omLogger.log(this.getClass().getSimpleName(), getId(), "sent");
        }
      } catch ( Throwable t ) {
        pm.error(getX(), t);
        // TODO: perhaps report last exception on host port via manager.
        getLogger().error("Error sending message", message, t);
        setValid(false);
        if ( replyBox != null ) {
         Message reply = new Message();
         reply.getAttributes().put("replyBox", replyBox);
         reply.replyWithException(t);
         getReplyBoxes().remove(replyBoxId);
        } else {
          throw new RuntimeException(t);
        }
      } finally {
        pm.log(getX());
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
      String pmKey = this.getClass().getSimpleName()+":"+getHost()+":"+getPort();
      String pmName = "receive"; 
      OMLogger omLogger = (OMLogger) x.get("OMLogger");
      try {
        while ( getValid() ) {
          PM pm = null;
          try {
            long sent = in_.readLong();
            PM p = PM.create(getX(), this.getClass().getSimpleName(), getHost()+":"+getPort()+":network");
            p.setStartTime(sent);
            p.log(x);

            pm = PM.create(x, pmKey, pmName);

            int length = in_.readInt();
            byte[] bytes = new byte[length];
            StringBuilder data = new StringBuilder();
            int total = 0;
            while ( true ) {
              int bytesRead = 0;
              try {
                bytesRead = in_.read(bytes, 0, length - total);
                if ( bytesRead == -1 ) {
                  getLogger().debug("eof,-1");
                  break;
                }
              } catch ( java.io.EOFException | java.net.SocketException e ) {
                getLogger().debug(e.getMessage());
                break;
              }
              data.append(new String(bytes, 0, bytesRead, StandardCharsets.UTF_8));
              total += bytesRead;
              if ( total == length ) {
                break;
              }
              if ( total > length ) {
                // REVIEW: can this happen?
                getLogger().error("read too much", length, total);
                break;
              }
            }
            omLogger.log(this.getClass().getSimpleName(), getId(), "received");
            String message = data.toString();
            if ( foam.util.SafetyUtil.isEmpty(message) ) {
              throw new RuntimeException("Received empty message.");
            }
            // NOTE: enable along with send debug call in SocketServerProcessor to monitor all messages.
            // getLogger().debug("receive", message);
            Message msg = (Message) x.create(JSONParser.class).parseString(message);
            if ( msg == null ) {
              throw new RuntimeException("Failed to parse. message: "+message);
            }
            String replyBoxId = (String) msg.getAttributes().get(REPLY_BOX_ID);
            if ( replyBoxId != null ) {
              Box replyBox = null;
              BoxHolder holder = (BoxHolder) getReplyBoxes().get(replyBoxId);
              if ( holder != null ) {
                replyBox = holder.getBox();
                pm = holder.getPm();
                pm.log(x);
              } else {
                getLogger().warning("BoxHolder not found", replyBoxId);
                replyBox = (Box) msg.getAttributes().get("replyBox");
              }
              if ( replyBox == null ) {
                getLogger().error("ReplyBox not found", replyBoxId);
                ((foam.dao.DAO) x.get("alarmDAO")).put(new foam.nanos.alarming.Alarm("ReplyBox not found"));
                throw new RuntimeException("ReplyBox not found. message: "+message);
              }
              getReplyBoxes().remove(replyBoxId);
              replyBox.send(msg);
            } else {
              Object o = msg.getObject();
              if ( o != null &&
                   o instanceof foam.box.RPCErrorMessage ) {
                foam.box.RemoteException re = (foam.box.RemoteException) ((foam.box.RPCErrorMessage) o).getData();
                getLogger().warning("RemoteException", re.getId(), re.getMessage(), re.getException());
                if ( re.getException() != null ) {
                  throw (foam.core.FOAMException) re.getException();
                }
                throw new RuntimeException(re.getMessage());
              }
              getLogger().error("Failed to process reply", message);
              throw new RuntimeException("Failed to process reply. message: "+message);
            }
          } catch ( java.net.SocketTimeoutException e ) {
            // getLogger().debug("SocketTimeoutException", e.getMessage());
            continue;
          } catch ( Throwable t ) {
            getLogger().error(t);
            if ( pm != null ) pm.error(x, t);
            break;
          } finally {
            if ( pm != null) pm.log(x);
          }
        }
      } finally {
        ((SocketConnectionBoxManager) getX().get("socketConnectionBoxManager")).remove(this);
      }
      `
    }
  ]
});
