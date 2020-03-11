foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ElectoralServiceServer',

  implements: [
    'foam.nanos.medusa.ElectoralService'
  ],

  javaImports: [
    'foam.box.HTTPBox',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'static foam.mlang.MLang.*',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.util.ArrayList',
    'java.util.concurrent.*',
    'java.util.concurrent.Callable',
    'java.util.concurrent.ExecutorService',
    'java.util.concurrent.Executors',
    'java.util.concurrent.ThreadLocalRandom',
    'java.util.Date',
    'java.util.List'
  ],

  properties: [
    {
      name: 'state',
      class: 'Enum',
      of: 'foam.nanos.medusa.ElectoralServiceState',
      value: 'foam.nanos.medusa.ElectoralServiceState.NONE' //'IN_SESSION'
    },
    {
      name: 'electionTime',
      class: 'Long',
      value: 0
    },
    {
      name: 'votes',
      class: 'Int',
      value: 0
    },
    {
      name: 'currentSeq',
      class: 'Long',
      value: 0
    },
    {
      name: 'winner',
      class: 'FObjectProperty',
      of: 'foam.nanos.medusa.ClusterConfig'
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
          type: 'Long',
        },
        {
          name: 'config',
          type: 'foam.nanos.medusa.ClusterConfig',
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
          type: 'foam.nanos.medusa.ClusterConfig'
        }
      ],
      type: 'String',
      javaCode: `
      try {
        // TODO: protocol - http will do for now as we are behind the load balancers.
        java.net.URI uri = new java.net.URI("http", null, config.getId(), config.getServicePort(), "/service/electoralService", null, null);
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
      type: 'foam.nanos.medusa.ClusterConfig',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      DAO dao = (DAO) x.get("localClusterConfigDAO");
      return (ClusterConfig) dao.find_(x, System.getProperty("hostname", "localhost"));
      `
    },
    {
      name: 'dissolve',
      javaCode: `
    ClusterConfig config = findConfig(getX());
    Logger logger = new PrefixLogger(new Object[] {
      this.getClass().getSimpleName(),
      "dissolve"
    }, (Logger) getX().get("logger"));
    logger.debug(getState().getLabel());
    // if ( getState().equals(ElectoralServiceState.ELECTION) ) {
    //  logger.debug("election in progress since", getElectionTime());
    //   return;
    // }
      setElectionTime(System.currentTimeMillis());
      setState(ElectoralServiceState.ELECTION);
      recordResult(vote(config.getId(), getElectionTime()), config);

      List arr = getVoters(getX());

        if ( arr.size() <= 1 ) {
          // nothing to do.
          logger.warning("election, but no members", arr.size());
          return;
        }

        ExecutorService pool = Executors.newFixedThreadPool(arr.size());
        List<Callable<Long>> voteCallables = new ArrayList<>();
  
        for (int i = 0; i < arr.size(); i++) {
          ClusterConfig clientConfig = (ClusterConfig) arr.get(i);
          if ( clientConfig.getId().equals(config.getId())) {
            continue;
          }
          ClientElectoralService electoralService =
            new ClientElectoralService.Builder(getX())
             .setDelegate(new HTTPBox.Builder(getX())
               .setUrl(buildURL(clientConfig))
               .setAuthorizationType(foam.box.HTTPAuthorizationType.BEARER)
               .setSessionID(clientConfig.getSessionId())
               .build())
             .build();
          
          voteCallables.add(() -> {
            logger.debug("vote", clientConfig.getId());
            long result = electoralService.vote(clientConfig.getId(), getElectionTime());
            recordResult(result, clientConfig);
            return result;
          });
        }

        try {
          List<Future<Long>> voteResults =  pool.invokeAll(voteCallables);
          for( Future<Long> voteResult : voteResults ) {
            try {
              logger.debug("voteResult");
              long vote = voteResult.get(5, TimeUnit.SECONDS);
            } catch(Exception e) {
              logger.error(e);
            }
            if (getState().equals(ElectoralServiceState.VOTING)) {
              break;
            }
            if (getState().equals(ElectoralServiceState.ELECTION) &&
                hasQuorum(arr.size())) {
              ClusterConfig winner = getWinner();
              report(winner);
              List<Callable<String>> reportCallables = new ArrayList<>();
              for (int j = 0; j < arr.size(); j++) {
                ClusterConfig clientConfig2 = (ClusterConfig) arr.get(j);
                if ( ! clientConfig2.getId().equals(config.getId())) {
          ClientElectoralService electoralService2 =
            new ClientElectoralService.Builder(getX())
             .setDelegate(new HTTPBox.Builder(getX())
               .setUrl(buildURL(clientConfig2))
               .setAuthorizationType(foam.box.HTTPAuthorizationType.BEARER)
               .setSessionID(clientConfig2.getSessionId())
               .build())
             .build();
                  reportCallables.add(() -> {
                    logger.debug("report(winner)", winner.getId());
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
                    logger.error(e);
                  }
                }
              } catch ( Exception e) {
                logger.error(e);
              }
              break;
            } else {
              logger.debug("no quorum", "votes", getVotes(), "arr.size", arr.size(), getState().getLabel());
            }
          }
        } catch ( Exception e) {
          logger.error(e);
        } finally {
          pool.shutdown();
          logger.debug("finally", "votes", getVotes(), "arr.size", arr.size(), getState().getLabel());
        }
      // }
     `
    },
    {
      name: 'vote',
      javaCode: `
      ((Logger) getX().get("logger")).debug(this.getClass().getSimpleName(), "vote", id, time);
      if ( findConfig(getX()).getEnabled() ) {
        if ( getState().equals(ElectoralServiceState.ELECTION) &&
            time < getElectionTime() ) {
          // abandone our election.
          setState(ElectoralServiceState.VOTING);
        }
        // return our vote
        return ThreadLocalRandom.current().nextInt(255);
      }
      return -1L;
     `
    },
    {
      name: 'report',
      javaCode: `
      ((Logger) getX().get("logger")).debug(this.getClass().getSimpleName(), "report", winner.getId(), getState().getLabel());
      ClusterConfigService service = (ClusterConfigService) getX().get("clusterConfigService");
      DAO dao = (DAO) getX().get("localClusterConfigDAO");
      List arr = getVoters(getX());
      for (int i = 0; i < arr.size(); i++) {
        ClusterConfig clientConfig = (ClusterConfig) arr.get(i);
        if ( winner.getId().equals(clientConfig.getId()) ) {
          ClusterConfig newConfig = (ClusterConfig) (clientConfig.fclone());
          newConfig.setIsPrimary(true);
          newConfig = (ClusterConfig) dao.put_(getX(), newConfig);
          service.setPrimaryConfig(newConfig);
        } else if ( clientConfig.getIsPrimary() ) {
          ClusterConfig newConfig = (ClusterConfig) (clientConfig.fclone());
          newConfig.setIsPrimary(false);
          dao.put_(getX(), newConfig);
        }
      }
      ClusterConfig config = findConfig(getX());
      service.setConfig(config);
      if ( config.getId() == service.getPrimaryConfig().getId() ) {
        service.setIsPrimary(true);
      }
      setState(ElectoralServiceState.IN_SESSION);
     `
    },
    {
      name: 'getVoters',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaType: `java.util.List`,
      javaCode: `
      ClusterConfigService service = (ClusterConfigService) x.get("clusterConfigService");
      ClusterConfig config = findConfig(x);
      List arr = (ArrayList) ((ArraySink) ((DAO) x.get("localClusterConfigDAO"))
        .where(
          AND(
            service.getVoterPredicate(x),
//            NEQ(ClusterConfig.ID, config.getId()),
            EQ(ClusterConfig.REALM, config.getRealm()),
            EQ(ClusterConfig.REGION, config.getRegion())
          )
        )
        .select(new ArraySink())).getArray();
     return arr;
      `
    }
  ]
});
