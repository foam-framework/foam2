foam.CLASS({
  package: 'foam.nanos.mrac',
  name: 'ElectoralServiceServer',

  implements: [
    'foam.nanos.mrac.ElectoralService',
    // 'foam.nanos.NanoService'
  ],

  javaImports: [
    'foam.box.HTTPBox',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.util.ArrayList',
    'java.util.concurrent.*',
    'java.util.concurrent.Callable',
    'java.util.concurrent.ExecutorService',
    'java.util.concurrent.Executors',
    'java.util.concurrent.ThreadLocalRandom',
    'java.util.Date',
    'java.util.List',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      name: 'state',
      class: 'Enum',
      of: 'foam.nanos.mrac.ElectoralServiceState',
      value: 'foam.nanos.mrac.ElectoralServiceState.IN_SESSION'
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
      return getVotes() >= (total / 2 + 1);
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
      if ( result >= 0 ) {
        setVotes(getVotes() + 1);
        if ( result > getCurrentSeq() ) {
          setCurrentSeq(result);
          setWinner(config);
        }
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
    // if ( getState().equals(ElectoralServiceState.IN_SESSION) ) {
      setElectionTime(new Date());
      setState(ElectoralServiceState.ELECTION);
      recordResult(vote(getElectionTime()), config);

      List arr = (ArrayList) ((ArraySink) ((DAO) getX().get("clusterConfigDAO"))
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
            NEQ(ClusterConfig.NODE_TYPE,NodeType.REPLICA)
          )
        )
        .select(new ArraySink())).getArray();

        ExecutorService pool = Executors.newFixedThreadPool(arr.size());
        List<Callable<Integer>> voteCallables = new ArrayList<>();
  
        for (int i = 0; i < arr.size(); i++) {
          ClusterConfig clientConfig = (ClusterConfig) arr.get(i);
          if ( clientConfig.getId().equals(config.getId())) {
            continue;
          }
          ClientElectoralService electoralService = new ClientElectoralService.Builder(getX()).setDelegate(new HTTPBox.Builder(getX()).setUrl(buildURL(clientConfig)).build()).build();
          
          voteCallables.add(() -> {
            int result = electoralService.vote(getElectionTime());
            recordResult(result, clientConfig);
            return result;
          });
        }

        try {
          List<Future<Integer>> voteResults =  pool.invokeAll(voteCallables);
          for( Future<Integer> voteResult : voteResults ) {
            try {
              int vote = voteResult.get(5, TimeUnit.SECONDS);
            } catch(Exception e) {
              e.printStackTrace();
            }
            if (getState().equals(ElectoralServiceState.VOTING)) {
              break;
            }
            if (getState().equals(ElectoralServiceState.ELECTION) && hasQuorum(arr.size())) {
              ClusterConfig winner = getWinner();
              report(winner);
              List<Callable<String>> reportCallables = new ArrayList<>();
              for (int j = 0; j < arr.size(); j++) {
                ClusterConfig clientConfig2 = (ClusterConfig) arr.get(j);
                if ( ! clientConfig2.getId().equals(config.getId())) {
                  ClientElectoralService electoralService2 = new ClientElectoralService.Builder(getX()).setDelegate(new HTTPBox.Builder(getX()).setUrl(buildURL(clientConfig2)).build()).build();
                  reportCallables.add(() -> {
                    electoralService2.report(winner);
                    return clientConfig2.getId();
                  });
                }
              }
              try {
                List<Future<String>> reportResults =  pool.invokeAll(reportCallables);
                for( Future<String> reportResult : reportResults ) {
                  try {
                    String reportConfig = reportResult.get(5, TimeUnit.SECONDS);
                  } catch(Exception e) {
                    e.printStackTrace();
                  }
                }
              } catch ( Exception e) {
          
              }
              break;
            }
          }

        } catch ( Exception e) {
          
        }
        pool.shutdown();
      // }
     `
    },
    {
      name: 'vote',
      javaCode: `
      if ( findConfig(getX()).getStatus().equals(Status.ONLINE) ) {
        if ( getState().equals(ElectoralServiceState.ELECTION) && getElectionTime() != null && time.before(getElectionTime()) ) {
          setState(ElectoralServiceState.VOTING);
        }
        return ThreadLocalRandom.current().nextInt(255);
      }
      return -1;
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
            EQ(ClusterConfig.REALM, config.getRealm()),
            EQ(ClusterConfig.REGION, config.getRegion())
          )
        )
        .select(new ArraySink())).getArray();
      for (int i = 0; i < arr.size(); i++) {
        ClusterConfig clientConfig = (ClusterConfig) arr.get(i);
        if ( winner.getId().equals(clientConfig.getId()) ) {
          ClusterConfig newConfig = (ClusterConfig) (clientConfig.fclone());
          newConfig.setNodeType(NodeType.PRIMARY);
          dao.put_(getX(), newConfig);
        } else if (clientConfig.getNodeType().equals(NodeType.PRIMARY)) {
          ClusterConfig newConfig = (ClusterConfig) (clientConfig.fclone());
          newConfig.setNodeType(NodeType.SECONDARY);
          dao.put_(getX(), newConfig);
        }
      }  
     `
    },
  ]
});
