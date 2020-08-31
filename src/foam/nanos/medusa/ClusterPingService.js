/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterPingService',
 
  implements: [ 'foam.nanos.http.WebAgent' ],

  requires: [
    'foam.box.HTTPBox',
    'foam.box.Message',
    'foam.box.MessageReplyBox',
    'foam.nanos.http.Ping'
  ],

  javaImports: [
    'foam.box.Box',
    'foam.box.HTTPBox',
    'foam.box.Message',
    'foam.box.MessageReplyBox',
    'foam.box.RemoteException',
    'foam.box.RPCErrorMessage',
    'foam.core.*',
    'foam.dao.DAO',
    'foam.nanos.http.Ping',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.StdoutLogger',
    'foam.nanos.pm.PM',
    'foam.net.Host',
    'java.io.PrintWriter',
    'java.io.IOException'
  ],

  properties: [
    {
      name: 'serviceName',
      class: 'String',
      value: 'mping'
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      transient: true,
      javaFactory: `
        Logger logger = (Logger) getX().get("logger");
        if ( logger == null ) {
          logger = new StdoutLogger();
        }
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, logger);

      `
    },
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  public Status ping(X x, String hostname, int port)
    throws java.io.IOException {
    return ping(x, hostname, port, 3000, false);
  }

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
      name: 'execute',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
    ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
    ClusterConfig config = support.getConfig(x, support.getConfigId());
    Message msg = new Message();

    // getLogger().info(config.getStatus());
    if ( config.getEnabled() &&
         config.getStatus() == Status.ONLINE ) {
      // TODO: send back recieved Ping.
      msg.setObject(config.getStatus());
    } else {
      Throwable t = new java.net.ConnectException("Connection refused: "+Status.OFFLINE.getLabel());
      RemoteException wrapper = new RemoteException();
      wrapper.setId(t.getClass().getName());
      wrapper.setMessage(t.getMessage());

      RPCErrorMessage reply = new RPCErrorMessage();
      reply.setData(wrapper);
      msg.setObject(reply);
    }
    foam.lib.formatter.FObjectFormatter formatter = formatter_.get();
    formatter.output(msg);
    PrintWriter out = x.get(PrintWriter.class);
    out.println(formatter.builder().toString());
      `
    },
    {
      name: 'ping',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'hostname',
          type: 'String'
        },
        {
          name: 'port',
          type: 'int'
        },
        {
          name: 'timeout',
          type: 'int'
        },
        {
          name: 'useHttps',
          type: 'Boolean'
        }
      ],
//      type: 'foam.nanos.http.Ping',
      type: 'foam.nanos.medusa.Status',
      javaThrows: ['java.io.IOException'],
      // code: async function(x, hostname, port = 8080, timeout = 3000, useHttps = false) {
      //   var address = await this.hostDAO && this.hostDAO.find(hostname);
      //   if ( ! address ) {
      //     address = hostname;
      //   }
      //   var url = useHttps ? 'https://' : 'http://' + hostname /*address*/ + ':' + port + '/service/' + this.serviceName;

      //   var box = this.HTTPBox.create({
      //     url: url,
      //     connectionTimeout: timeout,
      //     readTimeout: timeout
      //   });

      //   var msg = this.Message.create({
      //     object: this.Ping.create({})
      //   });
      //   msg.attributes['replyBox', this.MessageReplyBox.create({}, x)];
      //   msg.attributes['startTime', new Date().getTime()];

      //   box.send(msg);
      //   var ping = null;
      //   var latency = 0;
      //   var replyBox = msg.attributes['replyBox'];
      //   if ( replyBox ) {
      //     var response = replyBox.message;
      //     var endTime = new Date().getTime();
      //     latency = endTime - startTime;
      //     console && console.log('response: '+response);
      //     ping = response.object;
      //   } else {
      //     ping = this.Ping.create({
      //       latency: latency
      //     });
      //   }
      //   return ping;
      // },
      javaCode: `
    String address = hostname;
    Host host = (Host) ((DAO) x.get("hostDAO")).find(hostname);
    if ( host != null ) {
      address = host.getAddress();
    }

    String urlString = useHttps ? "https://" : "http://" + address + ":" + port + "/service" + "/"+getServiceName();

    Box box = new HTTPBox.Builder(x)
      .setUrl(urlString)
      .setConnectTimeout(timeout)
      .setReadTimeout(timeout)
      .build();
    Ping ping = new Ping(x, hostname);
    try {
      // TODO: need a PingReplyBox
      Message msg = x.create(Message.class);
      msg.setObject(ping);
      msg.getAttributes().put("replyBox", new MessageReplyBox(x));

      box.send(msg);

      MessageReplyBox reply = (MessageReplyBox) msg.getAttributes().get("replyBox");
      Message response = reply.getMessage();
      Object obj = response.getObject();
      if ( obj != null ) {
        if ( obj instanceof Throwable ) {
          throw (Throwable) obj;
        }
        if ( obj instanceof Status ) {
          Status status = (Status) obj;
          // getLogger().info(hostname, status);
          if ( status != Status.ONLINE ) {
            getLogger().warning(hostname, "responded in state", status.getLabel());
            throw new IOException("Invalid response state: "+status.getLabel());
          }
          return status;
        } else if ( obj instanceof RPCErrorMessage ) {
          RemoteException wrapper = (RemoteException) ((RPCErrorMessage) obj).getData();
          throw new IOException("RemoteException "+wrapper.getId()+" "+wrapper.getMessage());
        } else {
          throw new IOException("Invalid response: "+obj.getClass().getSimpleName()+", expected foam.nanos.medusa.Status");
        }
        //return ping;
      }
      throw new IOException("Invalid response: null");
    } catch (IOException e) {
      ping.getPm().error(x, e);
      throw e;
    } catch (Throwable t) {
      ping.getPm().error(x, t);
      throw new IOException(t.getMessage(), t);
    } finally {
      ping.getPm().log(x);
    }
      `
    }
  ]
});
