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
  name: 'ClusterSocketService',

  documentation: ``,

  implements: [
    'foam.nanos.NanoService'
  ],

  javaImports: [
    'foam.core.ContextAwareSupport',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'foam.nanos.NanoService',
    'foam.util.SafetyUtil',
    'static foam.mlang.MLang.*',

    'java.io.File',
    'java.io.IOException',
    'java.net.ServerSocket',
    'java.net.Socket',
    'java.util.concurrent.ExecutorService',
    'java.util.concurrent.Executors',
    'java.util.List',
    'java.util.ArrayList',
  ],

  properties: [
    {
      name: 'port',
      class: 'Int',
      value: 50000
    },
    {
      class: 'FObjectProperty',
      name: 'journal',
      type: 'java.io.File',
      javaFactory: `
        return null; //TODO
      `
    },
  ],

  methods: [
    {
      name: 'start',
      javaCode: `
      System.out.println("Starting ClusterSocketService");
      ClusterConfig config = findConfig();
      if ( null != config ) {
        if (NodeType.PRIMARY == config.getNodeType()) {
          runServer();
        } else if (NodeType.SECONDARY == config.getNodeType()) {
          runClient();
        }
      }
      `
    },
    {
      documentation: `Find the cluster configuration for 'this' (localhost) node.`,
      name: 'findConfig',
      type: 'foam.nanos.mrac.ClusterConfig',
      javaCode: `
      DAO dao = (DAO) getX().get("clusterConfigDAO");
      String hostname = System.getProperty("hostname");
      if ( SafetyUtil.isEmpty(hostname) ) {
        hostname = "localhost";
      }
      return ((ClusterConfig) dao.find_(getX(), hostname));
      `
    },
    {
      documentation: `Find the cluster configuration for 'this' (localhost) node.`,
      name: 'findPrimaryConfig',
      type: 'foam.nanos.mrac.ClusterConfig',
      javaCode: `
      ClusterConfig config = findConfig();
      List arr = (ArrayList) ((ArraySink) ((DAO) getX().get("clusterConfigDAO"))
      .where(
        AND(
          AND(
            EQ(ClusterConfig.REALM, config.getRealm()),
            EQ(ClusterConfig.REGION, config.getRegion())
          ),
          AND(
            EQ(ClusterConfig.ENABLED, true),
            EQ(ClusterConfig.STATUS, Status.ONLINE),
            EQ(ClusterConfig.NODE_TYPE, NodeType.PRIMARY)
          )
        )
      )
       .select(new ArraySink())).getArray();
       if ( arr.size() > 0 ) {
         return (ClusterConfig) arr.get(0);
       }
       return null;
      `
    },
    {
      documentation: `If primary, we should be running Socket Server.`,
      name: 'runServer',
      javaCode: `
      try (ServerSocket listener = new ServerSocket(getPort())) {
        System.out.println("The JournalSyncServer server is running...");
        ExecutorService pool = Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors());
        while (true) {
          pool.execute(new ClusterSocketServer(getX(), listener.accept(), getJournal()));
        }
      } catch(IOException e) {
        ((Logger) getX().get("logger")).error(e);
      }
      `
    },
    {
      documentation: `If secondary, we should be running Socket Client.`,
      name: 'runClient',
      javaCode: `
      try {
        ClusterConfig primaryConfig = findPrimaryConfig();
        if ( null != primaryConfig ) {
          Socket socket = new Socket(primaryConfig.getId(), getPort()); // If no server/primary?
          ClusterSocketClient client = new ClusterSocketClient(getX(), socket, getJournal());
          client.sync();
        }
      } catch (IOException ex) {
        ((Logger) getX().get("logger")).error(ex);
      }
      `
    },
  ]
});