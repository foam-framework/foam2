/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

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
    'foam.net.Host',
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
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      transient: true,
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) getX().get("logger"));

      `
    },
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
        getLogger().debug("recordResult", config.getName(), result);
        setVotes(getVotes() + 1);
        if ( result > getCurrentSeq() ) {
          getLogger().debug("recordResult", config.getName(), result, "winner");
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
        String address = config.getId();
        DAO hostDAO = (DAO) getX().get("hostDAO");
        Host host = (Host) hostDAO.find(config.getId());
        if ( host != null ) {
          address = host.getAddress();
        }
        java.net.URI uri = new java.net.URI("http", null, address, config.getPort(), "/service/electoralService", null, null);
        // getLogger().debug("buildURL", config.getName(), uri.toURL().toString());
        return uri.toURL().toString();
      } catch (java.net.MalformedURLException | java.net.URISyntaxException e) {
        getLogger().error(e);
        throw new RuntimeException(e);
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
      getLogger().debug("dissolve", getState().getLabel());

      if ( getState() == ElectoralServiceState.ELECTION &&
          getElectionTime() > 0L ) {
        getLogger().debug("dissolve", "Election in progress since", getElectionTime());
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
          getLogger().warning("dissolve", "election, but no members", voters.size());
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
            getLogger().debug("dissove","call", "vote", clientConfig.getId());
            long result = electoralService.vote(clientConfig.getId(), getElectionTime());
            getLogger().debug("dissolve", "call", "vote", clientConfig.getId(), "response", result);
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
              getLogger().error(e);
            }
          }
        } catch ( Exception e) {
          getLogger().error(e);
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
                  getLogger().debug("dissolve", "call", "report", getWinner());
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
                    getLogger().error(e);
                  }
                }
              } catch ( Exception e) {
                getLogger().error(e);
              }

              // call last as this will change the electoral state.
              report(getWinner());
            } else {
              getLogger().debug("dissolve", "no quorum", "votes", getVotes(), "voters", voters.size(), getState().getLabel());
            }
        } catch ( Exception e) {
          getLogger().error(e);
        }

        pool.shutdown();
        pool.awaitTermination(5, TimeUnit.SECONDS);
      } catch (InterruptedException e) {
        getLogger().error(e);
      } finally {
        if ( pool != null ) {
          pool.shutdownNow();
        }
        getLogger().debug("dissolve", "finally", "votes", getVotes(), "voters", voters.size(), getState().getLabel());
      }
        try {
          Thread.sleep(2000);
        } catch ( InterruptedException e ) {
          getLogger().error(e);
          break;
        }
      }
      setElectionTime(0L);
     `
    },
    {
      name: 'vote',
      javaCode: `
      getLogger().debug("vote", id, time);
      if ( findConfig(getX()).getEnabled() ) {
        if ( getState().equals(ElectoralServiceState.ELECTION) &&
            time < getElectionTime() ) {
          // abandone our election.
          setState(ElectoralServiceState.VOTING);
          return -1L;
        }
        // return our vote
        long v = ThreadLocalRandom.current().nextInt(255);
        getLogger().debug("vote", id, time, "response", v);
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
      service.setPrimaryConfigId(winner);
      service.setIsPrimary(service.getConfigId().equals(winner));

      DAO dao = (DAO) getX().get("localClusterConfigDAO");
      List voters = service.getVoters(getX());
      for (int i = 0; i < voters.size(); i++) {
        ClusterConfig config = (ClusterConfig) ((ClusterConfig) voters.get(i)).fclone();
        if ( winner.equals(config.getId()) &&
             ! config.getIsPrimary() ) {
          // found the winner, and it is the 'new' primary, may or may not be us.
          getLogger().debug("report", winner, "new primary", config.getId());
          config.setIsPrimary(true);
          config = (ClusterConfig) dao.put_(getX(), config);
        } else if ( config.getIsPrimary() ) {
          // no longer primary
          getLogger().debug("report", winner, "old primary", config.getId(), config.getName());
          config.setIsPrimary(false);
          config = (ClusterConfig) dao.put_(getX(), config);
        }
      }
      setState(ElectoralServiceState.IN_SESSION);

      getLogger().debug("report", winner, getState().getLabel(), "service", service.getConfigId(), "primary", service.getPrimaryConfigId(), service.getIsPrimary());
     `
    }
  ]
});
