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
  2. on put() write to primary if not primary, else delegate
  3. recreate clients on configuration changes.
  `,

  javaImports: [
    'foam.box.Box',
    'foam.box.HTTPBox',
    'foam.box.SessionClientBox',
    'foam.core.FObject',
    'foam.dao.ClientDAO',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.util.SafetyUtil',
    'static foam.mlang.MLang.*',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.logger.Logger',
    'java.net.HttpURLConnection',
    'java.net.URL',
    'java.util.List',
    'java.util.ArrayList',
  ],

  properties: [
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
    }
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
      String hostname = System.getProperty("hostname", "localhost");
      ClusterConfig config = (ClusterConfig) dao.find_(x, hostname);
      if ( config == null ) {
        Logger logger = (Logger) x.get("logger");
        logger.error(this.getClass().getSimpleName(), "ClusterConfig not found for hostname:", hostname);
      }
      return config;
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
      List andPredicates = new ArrayList();
      if ( ! SafetyUtil.isEmpty(config.getRealm()) ) {
        andPredicates.add(EQ(ClusterConfig.REALM, config.getRealm()));
      }
      if ( ! SafetyUtil.isEmpty(config.getRegion()) ) {
        andPredicates.add(EQ(ClusterConfig.REGION, config.getRegion()));
      }
      andPredicates.add(EQ(ClusterConfig.ENABLED, true));
      andPredicates.add(EQ(ClusterConfig.STATUS, Status.ONLINE));
      List arr = (ArrayList) ((ArraySink) ((DAO) x.get("clusterConfigDAO"))
      .where(AND((Predicate[]) andPredicates.toArray(new Predicate[andPredicates.size()])))
      .select(new ArraySink())).getArray();
      List<DAO> newClients = new ArrayList<DAO>();
      for ( int i = 0; i < arr.size(); i++ ) {
        ClusterConfig clientConfig = (ClusterConfig) arr.get(i);
        if ( clientConfig.getNodeType() == NodeType.PRIMARY ) {
          DAO primary = new ClientDAO.Builder(x).setDelegate(new SessionClientBox.Builder(x).setSessionID(config.getSessionId()).setDelegate(new HTTPBox.Builder(x).setUrl(buildURL(x, clientConfig)).build()).build()).build();
          setPrimary(primary);
//          setDelegate(primary);
        } 
      }

      if ( config == null ) {
        logger.error(this.getClass().getSimpleName(), "reconfigure", getServiceName(), "cluster configuration not found.");
      } else if ( config.getNodeType().equals(NodeType.PRIMARY) &&
        getPrimary() == null ) {
        logger.error(this.getClass().getSimpleName(), "reconfigure", getServiceName(), "cluster configuration for PRIMARY not found.");
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
          type: 'FObject'
        }
      ],
      javaCode: `
      Logger logger = (Logger) x.get("logger");

      ClusterConfig config = findConfig(x);

      if ( config != null &&
           ! config.getNodeType().equals(NodeType.PRIMARY) ) {
        ClusterCommand cmd = new ClusterCommand.Builder(x).setCommand(ClusterCommand.PUT).setObj(obj).build();
        logger.debug(this.getClass().getSimpleName(), "put_", getServiceName(), "to primary", cmd);
        return (FObject) getPrimary().cmd_(x, cmd);
      } else {
        logger.debug(this.getClass().getSimpleName(), "put_", getServiceName(), "to self", obj);
        return getDelegate().put_(x, obj);
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
          type: 'FObject'
        }
      ],
      javaCode: `
      Logger logger = (Logger) x.get("logger");

      ClusterConfig config = findConfig(x);

      if ( config != null &&
           ! config.getNodeType().equals(NodeType.PRIMARY) ) {
        ClusterCommand cmd = new ClusterCommand.Builder(x).setCommand(ClusterCommand.REMOVE).setObj(obj).build();
        logger.debug(this.getClass().getSimpleName(), "remove_", getServiceName(), "to primary", cmd);
        return (FObject) getPrimary().cmd_(x, cmd);
      } else {
        logger.debug(this.getClass().getSimpleName(), "remove_", getServiceName(), "to self", obj);
        return getDelegate().remove_(x, obj);
      }
     `
    },
    {
      name: 'cmd_',
      javaCode: `
      if ( obj instanceof ClusterCommand ) {
        ClusterCommand request = (ClusterCommand) obj;
        Logger logger = (Logger) x.get("logger");
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
        }
      ],
      type: 'String',
      javaCode: `
      try {
        // TODO: protocol - http will do for now as we are behind the load balancers.
        java.net.URI uri = new java.net.URI("http", null, config.getId(), config.getPort(), "/"+getPath()+"/"+getServiceName(), null, null);
        return uri.toURL().toString();
      } catch (java.net.MalformedURLException | java.net.URISyntaxException e) {
        ((Logger) getX().get("logger")).error(e);
        return ""; // TODO: 
      }
      `
    }
  ]
});
