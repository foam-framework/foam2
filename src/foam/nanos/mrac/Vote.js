foam.CLASS({
  package: 'foam.nanos.mrac',
  name: 'Vote',
  implements: [ 'foam.nanos.mrac.ElectoralService' ],
  javaImports: [
    'foam.box.HTTPBox',
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.dao.ClientDAO',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.util.ArrayList',
    'java.util.List',
    'java.util.concurrent.ThreadLocalRandom',
    'java.util.Date',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      name: 'state',
      class: 'Enum',
      of: 'foam.nanos.mrac.ElectoralServiceState'
    },
    {
      name: 'electionTime',
      class: 'DateTime'
    },
    {
      name: 'votes',
      class: 'Int',
      value: 0
    },
    {
      name: 'currentSeq',
      class: 'Int',
      value: 0
    },
    {
      name: 'winner',
      class: 'FObjectProperty',
      of: 'foam.nanos.mrac.ClusterConfig'
    }
  ],

  methods: [
    {
      name: 'hasQuorum',
      type: 'Boolean',
      args: [
        {
          name: 'total',
          type: 'Integer',
        }
      ],
      javaCode: `
      return getVotes() >= (2 * total + 1);
    `
    },
    {
      name: 'recordResult',
      synchronized: true,
      args: [
        {
          name: 'result',
          type: 'Integer',
        },
        {
          name: 'config',
          type: 'foam.nanos.mrac.ClusterConfig',
        }
      ],
      javaCode: `
      setVotes(getVotes() + 1);
      if ( result > getCurrentSeq() ) {
        setCurrentSeq(result);
        setWinner(config);
      }
    `
    },
    {
      name: 'buildURL',
      args: [
        {
          name: 'config',
          type: 'foam.nanos.mrac.ClusterConfig'
        }
      ],
      type: 'String',
      javaCode: `
      try {
        // TODO: protocol - http will do for now as we are behind the load balancers.
        java.net.URI uri = new java.net.URI("http", null, config.getId(), config.getPort(), "/service/electoralService", null, null);
        return uri.toURL().toString();
      } catch (java.net.MalformedURLException | java.net.URISyntaxException e) {
        ((Logger) getX().get("logger")).error(e);
        return ""; // TODO: 
      }
      `
    },
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
      name: 'dissolve',
      javaCode: `
    ClusterConfig config = findConfig(getX());
    if ( getState().equals(ElectoralServiceState.IN_SESSION) ) {
      setElectionTime(new Date());
      setState(ElectoralServiceState.ELECTION);

      setCurrentSeq(vote(getElectionTime()));
      setWinner(config);

      List arr = (ArrayList) ((ArraySink) ((DAO) getX().get("clusterConfigDAO"))
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
      for (int i = 0; i < arr.size(); i++) {
        ClusterConfig clientConfig = (ClusterConfig) arr.get(i);
        if ( clientConfig.getId().equals(config.getId())) {
          break;
        }
        ClientElectoralService electoralService = new ClientElectoralService.Builder(getX()).setDelegate(new HTTPBox.Builder(getX()).setUrl(buildURL(clientConfig)).build()).build();
        Thread getVote = new Thread(() -> {
          int result = electoralService.vote(getElectionTime());
          recordResult(result, clientConfig);
        });
        getVote.start();

        if (getState().equals(ElectoralServiceState.VOTING)) {
          break;
        }
        if (getState().equals(ElectoralServiceState.ELECTION) && hasQuorum(arr.size())) {
          report(getWinner());
          for (int j = 0; j < arr.size(); j++) {
            ClusterConfig clientConfig2 = (ClusterConfig) arr.get(j);
            if ( clientConfig2.getId().equals(config.getId())) {
              break;
            }
            ClientElectoralService electoralService2 = new ClientElectoralService.Builder(getX()).setDelegate(new HTTPBox.Builder(getX()).setUrl(buildURL(clientConfig2)).build()).build();
            Thread updateConfig = new Thread(() -> {
              electoralService2.report(getWinner());
            });
            updateConfig.start();
          }

          break;
        }
      }
    }
     `
    },
    {
      name: 'vote',
      javaCode: `
      if ( getState().equals(ElectoralServiceState.ELECTION) && ( time.before(getElectionTime()) ) ) {
        setState(ElectoralServiceState.VOTING);
      }
      return ThreadLocalRandom.current().nextInt();
     `
    },
    {
      name: 'report',
      javaCode: `
      ClusterConfig config = findConfig(getX());
      DAO dao = (DAO) getX().get("clusterConfigDAO");
  
      List arr = (ArrayList) ((ArraySink) dao
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
      for (int i = 0; i < arr.size(); i++) {
        ClusterConfig clientConfig = (ClusterConfig) arr.get(i);
        if ( winner.getId().equals(clientConfig.getId()) ) {
          clientConfig.setNodeType(NodeType.PRIMARY);
        } else if (clientConfig.getNodeType().equals(NodeType.PRIMARY)) {
          clientConfig.setNodeType(NodeType.SECONDARY);
        }
        dao.put_(getX(), clientConfig);
      }  
     `
    },
  ]
});
