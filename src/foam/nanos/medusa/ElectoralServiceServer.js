foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ElectoralServiceServer',

  implements: [
    'foam.nanos.medusa.ElectoralService',
    'foam.core.ContextAgent'
  ],

  javaImports: [
    'foam.box.HTTPBox',
    'foam.core.Agency',
    'foam.core.ContextAgent',
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
      value: 'foam.nanos.medusa.ElectoralServiceState.ADJOURNED'
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
      class: 'String',
      value: ""
    }
  ],

  methods: [
    {
      name: 'hasQuorum',
      type: 'Boolean',
      args: [
        {
          name: 'voters',
          type: 'Integer',
        }
      ],
      javaCode: `
      return getVotes() >= (voters / 2 + 1);
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
        ((Logger) getX().get("logger")).debug(this.getClass().getSimpleName(), "recordResult", config.getId(), result);
        setVotes(getVotes() + 1);
        if ( result > getCurrentSeq() ) {
          ((Logger) getX().get("logger")).debug(this.getClass().getSimpleName(), "recordResult", config.getId(), result, "winner");
          setCurrentSeq(result);
          setWinner(config.getId());
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
        ((Logger) getX().get("logger")).debug("buildURL", config.getId(), uri.toURL().toString());
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
      ClusterConfigService service = (ClusterConfigService) x.get("clusterConfigService");
      DAO dao = (DAO) x.get("localClusterConfigDAO");
      return (ClusterConfig) dao.find_(x, service.getConfigId());
      `
    },
    {
      documentation: 'Intended for Agency submission, so dissolve can run with  own thread.',
      name: 'dissolve',
      javaCode: `
      ((Agency) x.get("threadPool")).submit(x, (ContextAgent)this, this.getClass().getSimpleName()+".dissolve.");
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
      ClusterConfigService service = (ClusterConfigService) getX().get("clusterConfigService");
      ClusterConfig config = service.getConfig(getX(), service.getConfigId());
      Logger logger = new PrefixLogger(new Object[] {
        this.getClass().getSimpleName(),
        "dissolve"
      }, (Logger) getX().get("logger"));
      logger.debug(getState().getLabel());

      if ( getState() == ElectoralServiceState.ELECTION &&
          getElectionTime() > 0L ) {
        logger.debug("Election in progress since", getElectionTime());
        return;
      }

      setElectionTime(System.currentTimeMillis());
      setState(ElectoralServiceState.ELECTION);

      ExecutorService pool = null;
      List<Callable<Long>> voteCallables = new ArrayList<>();
      List<Future<Long>> voteResults = null;
      List<Callable<Void>> reportCallables = new ArrayList<>();
      List<Future<Void>> reportResults = null;

      while ( getState() == ElectoralServiceState.ELECTION ) {

      setVotes(0);
      recordResult(vote(config.getId(), getElectionTime()), config);

      List voters = service.getVoters(getX());

      try {
        if ( voters.size() <= 1 ) {
          // nothing to do.
          logger.warning("election, but no members", voters.size());
          return;
        }

        // clear previous run
        if ( voteResults != null ) {
          for( Future<Long> voteResult : voteResults ) {
            if ( ! voteResult.isDone() ) {
              voteResult.cancel(true);
            }
          }
          voteResults = null;
        }
        voteCallables.clear();

        if ( reportResults != null ) {
          for( Future<Void> reportResult : reportResults ) {
            if ( ! reportResult.isDone() ) {
              reportResult.cancel(true);
            }
          }
          reportResults = null;
        }
        reportCallables.clear();

        pool = Executors.newFixedThreadPool(voters.size());

        for (int i = 0; i < voters.size(); i++) {
          ClusterConfig clientConfig = (ClusterConfig) voters.get(i);
          if ( clientConfig.getId().equals(config.getId())) {
            continue;
          }
          ClientElectoralService electoralService =
            new ClientElectoralService.Builder(getX())
             .setDelegate(new HTTPBox.Builder(getX())
               .setUrl(buildURL(clientConfig))
               .setAuthorizationType(foam.box.HTTPAuthorizationType.BEARER)
               .setSessionID(clientConfig.getSessionId())
               .setConnectTimeout(3000)
               .setReadTimeout(3000)
               .build())
             .build();
          
          voteCallables.add(() -> {
            logger.debug("call", "vote", clientConfig.getId());
            long result = electoralService.vote(clientConfig.getId(), getElectionTime());
            logger.debug("call", "vote", clientConfig.getId(), "response", result);
            recordResult(result, clientConfig);
            return result;
          });
        }

        try {
          voteResults =  pool.invokeAll(voteCallables);
          for( Future<Long> voteResult : voteResults ) {
            try {
              if ( getState().equals(ElectoralServiceState.VOTING) &&
                   ! voteResult.isDone() ) {
                voteResult.cancel(true);
              } else {
                long vote = voteResult.get(5, TimeUnit.SECONDS);
              }
            } catch(Exception e) {
              logger.error(e);
            }
          }
        } catch ( Exception e) {
          logger.error(e);
        }
        try {
            if (getState().equals(ElectoralServiceState.ELECTION) &&
                hasQuorum(voters.size())) {

              for (int j = 0; j < voters.size(); j++) {
                ClusterConfig clientConfig2 = (ClusterConfig) voters.get(j);
                if ( clientConfig2.getId().equals(config.getId())) {
                  continue;
                }

                ClientElectoralService electoralService2 =
                  new ClientElectoralService.Builder(getX())
                   .setDelegate(new HTTPBox.Builder(getX())
                     .setUrl(buildURL(clientConfig2))
                     .setAuthorizationType(foam.box.HTTPAuthorizationType.BEARER)
                     .setSessionID(clientConfig2.getSessionId())
                     .setConnectTimeout(3000)
                     .setReadTimeout(3000)
                     .build())
                   .build();

                reportCallables.add(() -> {
                  logger.debug("call", "report", getWinner());
                  electoralService2.report(getWinner());
                  return null;
                });
              }

              try {
                reportResults = pool.invokeAll(reportCallables);
                for( Future<Void> reportResult : reportResults ) {
                  try {
                    reportResult.get(5, TimeUnit.SECONDS);
                  } catch(Exception e) {
                    logger.error(e);
                  }
                }
              } catch ( Exception e) {
                logger.error(e);
              }

              // call last as this will change the electoral state.
              report(getWinner());
            } else {
              logger.debug("no quorum", "votes", getVotes(), "voters", voters.size(), getState().getLabel());
            }
        } catch ( Exception e) {
          logger.error(e);
        }

        pool.shutdown();
        pool.awaitTermination(5, TimeUnit.SECONDS);
      } catch (InterruptedException e) {
        logger.error(e);
      } finally {
        if ( pool != null ) {
          pool.shutdownNow();
        }
        logger.debug("finally", "votes", getVotes(), "voters", voters.size(), getState().getLabel());
      }
        try {
          Thread.sleep(2000);
        } catch ( InterruptedException e ) {
          logger.error(e);
          break;
        }
      }
      setElectionTime(0L);
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
          return -1L;
        }
        // return our vote
        long v = ThreadLocalRandom.current().nextInt(255);
        ((Logger) getX().get("logger")).debug(this.getClass().getSimpleName(), "vote", id, time, "response", v);
        return v;
//        return ThreadLocalRandom.current().nextInt(255);
      }
      return -1L;
     `
    },
    {
      name: 'report',
      javaCode: `
      ClusterConfigService service = (ClusterConfigService) getX().get("clusterConfigService");
      // ((Logger) getX().get("logger")).debug(this.getClass().getSimpleName(), "report", winner, getState().getLabel(), "service", service.getConfigId(), "before", "primary", service.getPrimaryConfigId(), service.getIsPrimary());

      //if ( winner != service.getPrimaryConfigId() ) {

      service.setPrimaryConfigId(winner);
      service.setIsPrimary(service.getConfigId().equals(winner));

      DAO dao = (DAO) getX().get("localClusterConfigDAO");
      List voters = service.getVoters(getX());
      for (int i = 0; i < voters.size(); i++) {
        ClusterConfig config = (ClusterConfig) ((ClusterConfig) voters.get(i)).fclone();
        if ( winner.equals(config.getId()) &&
             ! config.getIsPrimary() ) {
          // found the winner, and it is the 'new' primary, may or may not be us.
          ((Logger) getX().get("logger")).debug(this.getClass().getSimpleName(), "report", winner, "new primary", config.getId());
          config.setIsPrimary(true);
          dao.put_(getX(), config);
        } else if ( config.getIsPrimary() ) {
          // no longer primary
          ((Logger) getX().get("logger")).debug(this.getClass().getSimpleName(), "report", winner, "old primary", config.getId());
          config.setIsPrimary(false);
          dao.put_(getX(), config);
        }
      }
      //} 
      setState(ElectoralServiceState.IN_SESSION);

      ((Logger) getX().get("logger")).debug(this.getClass().getSimpleName(), "report", winner, getState().getLabel(), "service", service.getConfigId(), "primary", service.getPrimaryConfigId(), service.getIsPrimary());
     `
    }
  ]
});
