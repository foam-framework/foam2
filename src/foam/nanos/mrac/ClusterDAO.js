/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.nanos.mrac',
  name: 'ClusterDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `This DAO:
  1. registers a 'server', via NSpec, to handle cluster Client requests which write directly to the delegate (MDAO).
  2. creates Client DAOs.
  3. on put() write through to delegate (MDAO), then send to Clients.
  4. recreate clients on configuration changes.
  `,

  javaImports: [
    'foam.box.HTTPBox',
    'foam.dao.ClientDAO',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.nanos.mrac.ElectoralServiceServer',
    'foam.nanos.mrac.ElectoralServiceState',
    'foam.util.SafetyUtil',
    'static foam.mlang.MLang.*',
    'foam.nanos.logger.Logger',
    'java.net.HttpURLConnection',
    'java.net.URL',
    'java.util.ArrayList',
    'java.util.concurrent.ThreadLocalRandom',
    'java.util.Date',
    'java.util.List'
  ],

  properties: [
    {
      name: 'cluster',
      class: 'Boolean',
      value: true
    },
    {
      name: 'quorum',
      class: 'Boolean',
      value: true
    },
    {
      name: 'electoralService',
      class: 'foam.core.FObjectProperty',
      of: 'foam.nanos.mrac.ElectoralServiceServer'
    },
    {
      name: 'path',
      class: 'String',
      value: 'service'
    },
    {
      documentation: `nSpec service name at the remote node.`,
      name: 'serviceName',
      class: 'String'
    },
    {
      name: 'primary',
      class: 'foam.dao.DAOProperty',
      visibility: 'HIDDEN'
    },
    {
      documentation: `Array of all clients to put/remove to after a non-server operation.`,
      name: 'clients',
      class: 'FObjectArray',
      of: 'foam.dao.DAO',
      visibility: 'HIDDEN'
    },
  ],

  methods: [
    {
      documentation: `Find the cluster configuration for 'this' (localhost) node.`,
      name: 'findConfig',
      type: 'foam.nanos.mrac.ClusterConfig',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      DAO dao = (DAO) x.get("clusterConfigDAO");
      String hostname = System.getProperty("hostname");
      if ( SafetyUtil.isEmpty(hostname) ) {
        hostname = "localhost";
      }
      return ((ClusterConfig) dao.find_(x, hostname));
      `
    },
    {
      documentation: `Update cluster configuration for 'this' (localhost) node.`,
      name: 'updateConfig',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'config',
          type: 'foam.nanos.mrac.ClusterConfig'
        }
      ],
      javaCode: `
      DAO dao = (DAO) x.get("clusterConfigDAO");
      dao.put_(x, config);
      `
    },
    {
      documentation: `Upon initialization create the ClusterServer configuration and register nSpec.`,
      name: 'init_',
      javaCode: `
        /* register ClusterConfig Listener */
        DAO clusterConfigDAO = (DAO) getX().get("clusterConfigDAO");
        clusterConfigDAO.listen(new ClusterConfigSink(getX(), this), TRUE);

        reconfigure(getX());
      `
    },
    {
      documentation: `Rebuild the client list.`,
      name: 'reconfigure',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      Logger logger = (Logger) x.get("logger");
      logger.debug(this.getClass().getSimpleName(), "reconfigure", getServiceName());
      ClusterConfig config = findConfig(x);
      List arr = (ArrayList) ((ArraySink) ((DAO) x.get("clusterConfigDAO"))
      .where(
        AND(
          AND(
            EQ(ClusterConfig.REALM, config.getRealm()),
            EQ(ClusterConfig.REGION, config.getRegion())
          ),
          AND(
            EQ(ClusterConfig.ENABLED, true),
            EQ(ClusterConfig.STATUS, Status.ONLINE)
          )
        )
      )
       .select(new ArraySink())).getArray();

       if ( arr.size() < 3 ) {
        setCluster(false);
        return;
      } else {
        setCluster(true);
      }

      List<DAO> newClients = new ArrayList<DAO>();
      for ( int i = 0; i < arr.size(); i++ ) {
        ClusterConfig clientConfig = (ClusterConfig) arr.get(i);
        if ( clientConfig.getNodeType() == NodeType.PRIMARY ) {
          DAO primary = new ClientDAO.Builder(x).setDelegate(new HTTPBox.Builder(x).setUrl(buildURL(x, clientConfig, getServiceName())).build()).build();
          setPrimary(primary);
        } else if ( clientConfig.getNodeType() == NodeType.SECONDARY ) {
          DAO client = new ClientDAO.Builder(x).setDelegate(new HTTPBox.Builder(x).setUrl(buildURL(x, clientConfig, getServiceName())).build()).build();
          newClients.add(client);
        } 
      }
      setClients(newClients.toArray(new DAO[newClients.size()]));
      if ( config == null ) {
        logger.error(this.getClass().getSimpleName(), "reconfigure", getServiceName(), "cluster configuration for LOCALHOST not found.");
      } else if ( ! config.getNodeType().equals(NodeType.PRIMARY) &&
        getPrimary() == null ) {
        logger.error(this.getClass().getSimpleName(), "reconfigure", getServiceName(), "cluster configuration for PRIMARY not found.");
      } else if ( getClients().length == 0 ) {
        logger.error(this.getClass().getSimpleName(), "reconfigure", getServiceName(), "cluster configuration for SECONDARY not found.");
      } else {
        logger.info(this.getClass().getSimpleName(), "reconfigure", getServiceName(), "cluster configuration for SECONDARY "+getClients().length+" found");
      }
      `
    },
    {
      name: 'put_',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        }
      ],
      javaCode: `
      if ( ! getCluster() ) {
        return getDelegate().put_(x, obj);
      }

      Logger logger = (Logger) getX().get("logger");

      ClusterConfig config = findConfig(x);

      if ( ! config.getNodeType().equals(NodeType.PRIMARY) ) {
        logger.debug(this.getClass().getSimpleName(), "put_", getServiceName(), "to primary", obj);
        foam.core.FObject o = null;
        
        try {
          o = getPrimary().put_(x, obj);
        } catch ( Exception e ) {
          ClientElectoralService electoralService = (ClientElectoralService) x.get("electoralService");
          electoralService.dissolve();
        }
        return o;
      } else {
        if ( ! config.getStatus().equals(Status.ONLINE) ) {
          throw new RuntimeException("Primary node is offline");
        }
        
        logger.debug(this.getClass().getSimpleName(), "put_", getServiceName(), "to secondaries("+getClients().length+")", obj);
        ClusterCommand cmd = new ClusterCommand.Builder(x).setCommand(ClusterCommand.PUT).setObj(obj).build();
        for ( DAO client : getClients() ) {
          try {
            Object response = client.cmd_(x, cmd);
            logger.debug(this.getClass().getSimpleName(), "put_", getServiceName(), " to secondary, response", response);
          } catch ( Exception e ) {
            logger.debug(this.getClass().getSimpleName(), "put_", getServiceName(), e);
          }
        }
        if ( ! getQuorum() ) {
          config.setStatus(Status.OFFLINE);
          updateConfig(x, config);
          throw new RuntimeException("Quorum is not available");
        }

        foam.core.FObject o = null;
        try {
          o = getDelegate().put_(x, obj);
          int k = 0/0;
        } catch ( Exception e ) {
          config.setStatus(Status.OFFLINE);
          updateConfig(x, config);

          List arr = (ArrayList) ((ArraySink) ((DAO) x.get("clusterConfigDAO"))
            .where(
              AND(
                AND(
                  AND(
                    EQ(ClusterConfig.REALM, config.getRealm()),
                    EQ(ClusterConfig.REGION, config.getRegion())
                  ),
                  AND(
                    EQ(ClusterConfig.ENABLED, true),
                    EQ(ClusterConfig.STATUS, Status.ONLINE)
                  )
                ),
                NEQ(ClusterConfig.ID, config.getId())
              )
            )
            .select(new ArraySink())).getArray();

          ClusterConfig secondary = (ClusterConfig) arr.get(ThreadLocalRandom.current().nextInt(arr.size()));
          ClientElectoralService electoralService = new ClientElectoralService.Builder(getX()).setDelegate(new HTTPBox.Builder(getX()).setUrl(buildURL(x, secondary, "electoralService")).build()).build();
          electoralService.dissolve();

          throw new RuntimeException(e);
        }
        
        return o;
      }
     `
    },
    {
      name: 'remove_',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        }
      ],
      javaCode: `
      Logger logger = (Logger) getX().get("logger");

      ClusterConfig config = findConfig(x);

      if ( ! config.getNodeType().equals(NodeType.PRIMARY) ) {
        logger.debug(this.getClass().getSimpleName(), "remove_", getServiceName(), "to primary", obj);
        return getPrimary().remove_(x, obj);
      } else {
        foam.core.FObject o = getDelegate().remove_(x, obj);
        logger.debug(this.getClass().getSimpleName(), "remove_", getServiceName(), "to secondaries("+getClients().length+")", o);
        ClusterCommand cmd = new ClusterCommand.Builder(x).setCommand(ClusterCommand.REMOVE).setObj(o).build();
        for ( DAO client : getClients() ) {
          try {
            Object response = client.cmd_(x, cmd);
            logger.debug(this.getClass().getSimpleName(), "remove_", getServiceName(), " to secondary, response", response);
          } catch ( Exception e ) {
            logger.debug(this.getClass().getSimpleName(), "remove_", getServiceName(), e);
          }
        }
        return o;
      }
     `
    },
    {
      name: 'cmd_',
      javaCode: `
      if ( obj instanceof ClusterCommand ) {
        ClusterCommand request = (ClusterCommand) obj;
        Logger logger = (Logger) getX().get("logger");
        logger.debug(this.getClass().getSimpleName(), "cmd_", getServiceName(), request);
        if ( ClusterCommand.PUT.equals(request.getCommand()) ) {
          return getDelegate().put_(x, request.getObj());
        } else if ( ClusterCommand.REMOVE.equals(request.getCommand()) ) {
          return getDelegate().remove_(x, request.getObj());
        } else {
          throw new UnsupportedOperationException(request.getCommand());
        }
      }
      return getDelegate().cmd_(x, obj);
      `
    },
    {
      name: 'buildURL',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'config',
          type: 'foam.nanos.mrac.ClusterConfig'
        },
        {
          name: 'name',
          type: 'String'
        }
      ],
      type: 'String',
      javaCode: `
      try {
        // TODO: protocol - http will do for now as we are behind the load balancers.
        java.net.URI uri = new java.net.URI("http", null, config.getId(), config.getPort(), "/"+getPath()+"/"+name, null, null);
        return uri.toURL().toString();
      } catch (java.net.MalformedURLException | java.net.URISyntaxException e) {
        ((Logger) getX().get("logger")).error(e);
        return ""; // TODO: 
      }
      `
    }
  ]
});
