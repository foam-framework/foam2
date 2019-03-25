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
    'static foam.mlang.MLang.*',
    'foam.nanos.boot.NSpec',
    'foam.nanos.logger.Logger',
    'java.util.List',
    'java.util.ArrayList',
  ],

  implements: [
    'foam.nanos.boot.NSpecAware'
  ],

  properties: [
    {
      // REVIEW - this may no longer be required
      documentation: `nSpec of the DAO to be clustered.`,
      name: 'nSpec',
      class: 'FObjectProperty',
      type: 'foam.nanos.boot.NSpec',
      visibility: 'HIDDEN'
    },
    {
      documentation: `Cluster configuration for 'this' (localhost) node.`,
      name: 'config',
      class: 'FObjectProperty',
      type: 'foam.nanos.mrac.ClusterConfig',
      visibility: 'RO'
    },
    {
      documentation: `Array of all clients to put/remove to after a non-server operation.`,
      name: 'clients',
      class: 'FObjectArray',
      of: 'foam.dao.DAO',
      visibility: 'HIDDEN'
    },
    {
      documentation: `Reference to the ClusterConfigDAO to which we are subscribed/listening for updates to reconfigure.`,
      name: 'clusterConfigDAO',
      class: 'foam.dao.DAOProperty',
      visibility: 'HIDDEN'
    }
  ],

  methods: [
    {
      documentation: `Upon initialization create the ClusterServer configuration and register nSpec.`,
      name: 'init_',
      javaCode: `
        reconfigure(getX());

        /* register ClusterConfig Listener */
        DAO clusterConfigDAO = (DAO) getX().get("clusterConfigDAO");
        clusterConfigDAO.listen(new ClusterConfigSink(getX(), this), TRUE);
        /* REVIEW: need to keep a reference to the dao?*/
        setClusterConfigDAO(clusterConfigDAO);
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
      logger.debug(this.getClass().getSimpleName(), "reconfigure", getNSpec().getName());
      DAO dao = (DAO) x.get("clusterConfigDAO");
      List arr = (ArrayList) ((ArraySink) dao
       .where(
         AND(
           EQ(ClusterConfig.ENABLED, true),
           EQ(ClusterConfig.STATUS, Status.ONLINE)
         )
       )
       .select(new ArraySink())).getArray();
      DAO[] newClients = new DAO[arr.size()];
      for ( int i = 0; i < arr.size(); i++ ) {
        ClusterConfig config = (ClusterConfig) arr.get(i);
        if ( "localhost".equals(config.getId()) ) {
          setConfig(config);
          continue;
        }
        // DAO client = new ClusterClientDAO.Builder(x).setServiceName(getNSpec().getName()).setConfig(config).build();
        DAO client = new ClientDAO.Builder(x).setDelegate(new HTTPBox.Builder(x).build()).build();
        newClients[i] = client;
      }
      setClients(newClients);
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
      if ( ! this.getConfig().getNodeType().equals(NodeType.PRIMARY) ) {
        List arr = (ArrayList) ((ArraySink) this.getClusterConfigDAO()
          .where(
            AND(
              AND(
                EQ(ClusterConfig.ENABLED, true),
                EQ(ClusterConfig.STATUS, Status.ONLINE)
               ),
               EQ(ClusterConfig.NODE_TYPE, NodeType.SECONDARY)
            )
          )
          .select(new ArraySink())).getArray();
          if ( arr.isEmpty() ) {
            throw new NullPointerException("No primary node is found.");
          }
          
          ClusterConfig primaryConfig = (ClusterConfig) arr.get(0);
          ClusterDAO primary = new ClusterDAO();
          primary.setConfig(primaryConfig);
          return primary.put_(x, obj);
      } else {
        foam.core.FObject o = getDelegate().put_(x, obj);
        for ( DAO client : getClients() ) {
          client.cmd_(x, new ClusterCommand(x, "PUT", o));
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
      if ( ! this.getConfig().getNodeType().equals(NodeType.PRIMARY) ) {
        List arr = (ArrayList) ((ArraySink) this.getClusterConfigDAO()
          .where(
            AND(
              AND(
                EQ(ClusterConfig.ENABLED, true),
                EQ(ClusterConfig.STATUS, Status.ONLINE)
               ),
               EQ(ClusterConfig.NODE_TYPE, NodeType.SECONDARY)
            )
          )
          .select(new ArraySink())).getArray();
          if ( arr.isEmpty() ) {
            throw new NullPointerException("No primary node is found.");
          }
          
          ClusterConfig primaryConfig = (ClusterConfig) arr.get(0);
          ClusterDAO primary = new ClusterDAO();
          primary.setConfig(primaryConfig);
          return primary.remove_(x, obj);
      } else {
        foam.core.FObject o = getDelegate().remove_(x, obj);
        for ( DAO client : getClients() ) {
          client.cmd_(x, new ClusterCommand(x, "REMOVE", o));
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
        logger.debug(this.getClass().getSimpleName(), "cmd_", request);
        if ( "put".equals(request.getCmd()) ) {
          return getDelegate().put_(x, request.getObj());
        } else if ( "remove".equals(request.getCmd()) ) {
          return getDelegate().remove_(x, request.getObj());
        } else {
          throw new UnsupportedOperationException(request.getCmd());
        }
      }
      return getDelegate().cmd_(x, obj);
      `
    }
 ]
});
