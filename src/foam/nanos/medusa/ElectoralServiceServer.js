/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ElectoralServiceServer',

  implements: [
    'foam.core.ContextAgent',
    'foam.nanos.medusa.ElectoralService'
  ],

  javaImports: [
    'foam.box.HTTPBox',
    'foam.core.Agency',
    'foam.core.ContextAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'static foam.mlang.MLang.*',
    'foam.net.Host',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PM',
    'foam.util.SafetyUtil',
    'java.util.ArrayList',
    'java.util.concurrent.*',
    'java.util.concurrent.Callable',
    'java.util.concurrent.LinkedBlockingQueue',
    'java.util.concurrent.ExecutorService',
    'java.util.concurrent.Executors',
    'java.util.concurrent.RejectedExecutionException',
    'java.util.concurrent.ThreadFactory',
    'java.util.concurrent.ThreadLocalRandom',
    'java.util.concurrent.ThreadPoolExecutor',
    'java.util.concurrent.TimeUnit',
    'java.util.concurrent.atomic.AtomicInteger',
    'java.util.Date',
    'java.util.List',
    'java.util.Map',
    'java.util.Random'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  private Object electionLock_ = new Object();
  private Object voteLock_ = new Object();
  protected ThreadPoolExecutor pool_ = null;
        `
        }));
      }
    }
  ],
  
  properties: [
    {
      name: 'state',
      class: 'Enum',
      of: 'foam.nanos.medusa.ElectoralServiceState',
      value: 'foam.nanos.medusa.ElectoralServiceState.ADJOURNED',
      visibility: 'RO'
    },
    {
      name: 'electionTime',
      class: 'Long',
      value: 0,
      visibility: 'RO'
    },
    {
      name: 'votes',
      class: 'Int',
      value: 0,
      visibility: 'RO'
    },
    {
      name: 'currentSeq',
      class: 'Long',
      value: 0,
      visibility: 'RO'
    },
    {
      name: 'winner',
      class: 'String',
      visibility: 'RO'
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      transient: true,
      javaFactory: `
        ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
        ClusterConfig config = support.getConfig(getX(), support.getConfigId());
          return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName(),
          config.getName()
        }, (Logger) getX().get("logger"));
      `
    },
  ],

  methods: [
    {
      name: 'start',
      javaCode: `
    getLogger().debug("start");
    ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
    if ( support.getStandAlone() ) {
      setState(ElectoralServiceState.IN_SESSION);
    } else {
      ((Agency) getX().get(support.getThreadPoolName())).submit(getX(), this, "election");
    }
     `
    },
    {
      name: 'recordResult',
      synchronized: true,
      args: [
        {
          name: 'x',
          type: 'Context',
        },
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
        synchronized ( voteLock_ ) {
          setVotes(getVotes() + 1);
          if ( result > getCurrentSeq() ) {
            getLogger().info("recordResult", config.getName(), result, "leader");
            setCurrentSeq(result);
            setWinner(config.getId());
          }
        }
      }
      getLogger().debug("recordResult", config.getName(), result, "votes", getVotes());
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
        String scheme = config.getUseHttps() ? "https" : "http";
        java.net.URI uri = new java.net.URI(scheme, null, address, config.getPort(), "/service/electoralService", null, null);
        // getLogger().debug("buildURL", config.getName(), uri.toURL().toString());
        return uri.toURL().toString();
      } catch (java.net.MalformedURLException | java.net.URISyntaxException e) {
        getLogger().error(e);
        throw new RuntimeException(e);
      }
      `
    },
    {
      documentation: 'Force an election, if one not already in progress.',
      name: 'register',
      synchronized: true,
      javaCode: `
      getLogger().debug("dissolve", getState().getLabel());
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig config = support.getConfig(x, id);
      if ( config.getStatus() == Status.ONLINE &&
           support.hasQuorum(x) ) {
        setState(ElectoralServiceState.IN_SESSION);
      }
      `
    },
    {
      documentation: 'Force an election, if one not already in progress.',
      name: 'dissolve',
      synchronized: true,
      javaCode: `
      getLogger().debug("dissolve", getState().getLabel());
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");

      if ( ! support.hasQuorum(x) ) {
        setState(ElectoralServiceState.ADJOURNED);
        support.setIsPrimary(false);
        ClusterConfig config = support.getConfig(getX(), support.getConfigId());
        if ( config.getIsPrimary() ) {
          config.setIsPrimary(false);
          ((DAO) x.get("clusterConfigDAO")).put(config);
        }

        getLogger().debug("dissolve", getState().getLabel());
        return;
      }

      if ( getState() == ElectoralServiceState.VOTING ) {
        return;
      }

      if ( getState() == ElectoralServiceState.ELECTION &&
        getElectionTime() > 0L ) {
        getLogger().debug("dissolve", getState().getLabel(), "since", getElectionTime());
        return;
      }

      // run a new campaigne
      setElectionTime(System.currentTimeMillis());
      setState(ElectoralServiceState.ELECTION);
      getLogger().debug("dissolve", getState().getLabel(), "execute");
      ((Agency) x.get(support.getThreadPoolName())).submit(x, (ContextAgent)this, this.getClass().getSimpleName());
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
      getLogger().debug("execute");
      String savedThreadName = Thread.currentThread().getName();
      try {
        Thread.currentThread().setName(this.getClass().getSimpleName());
        while( true ) {
          try {
            synchronized ( electionLock_ ) {
              getLogger().debug("execute", "state", getState().getLabel(), "election time", getElectionTime());
              if ( getState() != ElectoralServiceState.ELECTION ) {
                break;
              }
            }
            callVote(x);
          } catch(Throwable t) {
            getLogger().error(t);
            break;
          }
          PM pm = PM.create(x, this.getClass().getSimpleName(),"execute", "sleep");
          try {
            java.util.Random r = ThreadLocalRandom.current();
            int sleep = r.nextInt(1000) + 1000;
            Thread.currentThread().sleep(sleep);
          } catch (InterruptedException e) {
            break;
          } finally {
            pm.log(x);
          }
        }
      } finally {
        getLogger().debug("execute", "exit", "state", getState().getLabel(), "election time", getElectionTime());
        Thread.currentThread().setName(savedThreadName);
      }
      `
    },
    {
      name: 'callVote',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
     getLogger().debug("callVote", getState().getLabel());
     if ( getState() != ElectoralServiceState.ELECTION ) {
        getLogger().debug("callVote", getState().getLabel(), "exit");
        return;
      }
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig config = support.getConfig(x, support.getConfigId());
      List voters = support.getVoters(x);

      if ( ! support.hasQuorum(x) ) {
        if ( ! support.getHasNodeQuorum() ) {
          getLogger().warning("callVote", getState().getLabel(), "waiting for node quorum", "voters/quorum", voters.size(), support.getMediatorQuorum(), support.getHasNodeQuorum());

          support.outputBuckets(x);
        } else {
          // nothing to do.
          getLogger().warning("callVote", getState().getLabel(), "waiting for mediator quorum", "voters/quorum", voters.size(), support.getMediatorQuorum(), support.getHasNodeQuorum());
        }
        return;
      }
      if ( voters.size() < support.getMediatorQuorum() ) {
        getLogger().debug("callVote", getState().getLabel(), "insuficient votes", "voters", voters.size());
        return;
      }
      getLogger().debug("callVote", getState().getLabel(), "achieved mediator and node quorum", "voters/quorum", voters.size(), support.getMediatorQuorum());
 
      try {
        setVotes(0);

        // record own vote
        recordResult(x, generateVote(x), config);
        if ( voters.size() == 1 &&
             voters.size() == support.getMediatorQuorum() ) {
          callReport(x);
          return;
        }

        Agency agency = (Agency) x.get("threadPool");

        // request votes from others
        for (int i = 0; i < voters.size(); i++) {
          ClusterConfig clientConfig = (ClusterConfig) voters.get(i);
          if ( clientConfig.getId().equals(config.getId())) {
            continue;
          }
          agency.submit(x, new ContextAgent() {
            long result = -1L;
            public void execute(X x) {
              getLogger().debug("callVote", "executeJob", config.getId(), "voter", clientConfig.getId());
              ClientElectoralService electoralService =
                new ClientElectoralService.Builder(x)
                 .setDelegate(new HTTPBox.Builder(x)
                   .setUrl(buildURL(clientConfig))
                   .setAuthorizationType(foam.box.HTTPAuthorizationType.BEARER)
                   .setSessionID(clientConfig.getSessionId())
                   .setConnectTimeout(3000)
                   .setReadTimeout(3000)
                   .build())
                 .build();
              try {
                getLogger().debug("callVote", "executeJob", config.getId(), "voter", clientConfig.getId(), "request");
                result = electoralService.vote(clientConfig.getId(), getElectionTime());
                getLogger().debug("callVote", "executeJob", getState().getLabel(), "voter", clientConfig.getId(), "response", result);
                recordResult(x, result, clientConfig);
                callReport(x);
              } catch (Throwable e) {
                getLogger().debug("callVote", "executeJob", "voter", clientConfig.getId(), clientConfig.getName(), e.getMessage());
              }
            }
          }, this.getClass().getSimpleName()+":callVote");
        }
      } catch ( Exception e) {
        getLogger().error(e);
      } finally {
        getLogger().debug("callVote", getState().getLabel(), "end", "votes", getVotes(), "voters", voters.size());
      }
      `
    },
    {
      documentation: 'Called by the party runing the election, requesting us to vote. A vote is simply a random number. Highest number wins. The caller also sends when they started the election. If we are also in ELECTION state, but the other party started earlier then we abandon our election.',
      name: 'vote',
      synchronized: true,
      javaCode: `
      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      ClusterConfig config = support.getConfig(getX(), support.getConfigId());
      long v = -1L;

      getLogger().debug("vote", getState().getLabel(), id, time, getElectionTime(), config.getStatus().getLabel());
      if ( config.getStatus() != Status.ONLINE ) {
        return v;
      }

      try {
        if ( getState() == ElectoralServiceState.ELECTION &&
            time > 0L && 
            time <= getElectionTime() ) {
          // abandon our election.
          getLogger().info("vote", id, time, "abandon own election", getState().getLabel(), "->", ElectoralServiceState.VOTING.getLabel());
          setState(ElectoralServiceState.VOTING);
          setElectionTime(0L);
          setCurrentSeq(0L);
        } else if ( getState() == ElectoralServiceState.IN_SESSION ||
                    getState() == ElectoralServiceState.ADJOURNED ) {
          getLogger().info("vote", id, time, getState().getLabel(), "->", ElectoralServiceState.VOTING.getLabel());
          setState(ElectoralServiceState.VOTING);
          setElectionTime(0L);
          setCurrentSeq(0L);
        }
        if ( getState() == ElectoralServiceState.VOTING ) { 
          v = generateVote(getX());
        }
      } catch (Throwable t) {
        getLogger().error("vote", id, time, "response", v, t);
      }
      getLogger().debug("vote", getState().getLabel(), id, time, "response", v);
      return v;
     `
    },
    {
      name: 'generateVote',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'int',
      javaCode: `
      return ThreadLocalRandom.current().nextInt(255);
     `
    },
    {
      name: 'callReport',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      getLogger().debug("callReport", getState().getLabel());
      if ( getState() == ElectoralServiceState.IN_SESSION ) {
        getLogger().debug("callReport", getState().getLabel(), "exit");
        return;
      }
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig config = support.getConfig(x, support.getConfigId());
      List voters = support.getVoters(x);
      try {
        synchronized ( electionLock_ ) {
          if ( ! ( getState() == ElectoralServiceState.ELECTION &&
                   support.hasQuorum(x) ) ) {
            getLogger().debug("callReport", getState().getLabel(), "no quorum", "votes", getVotes(), "voters", voters.size());
            return;
          }
        }

        getLogger().debug("callReport", getState().getLabel(), "votes", getVotes(), "voters", voters.size());

        if ( voters.size() < support.getMediatorQuorum() ) {
          getLogger().debug("callReport", getState().getLabel(), "insuficient voters", "votes", getVotes(), "voters", voters.size());
          return;
        }
        if ( getVotes() < voters.size() ) {
          getLogger().debug("callReport", getState().getLabel(), "insuficient votes", "votes", getVotes(), "voters", voters.size());
          return;
        }

        report(getWinner());
        Agency agency = (Agency) x.get("threadPool");
 
        for (int j = 0; j < voters.size(); j++) {
          ClusterConfig clientConfig2 = (ClusterConfig) voters.get(j);
          if ( clientConfig2.getId().equals(config.getId())) {
            continue;
          }
          agency.submit(x, new ContextAgent() {
            public void execute(X x) {
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

              getLogger().debug("callReport", getState().getLabel(), "call", clientConfig2.getId(), "report", getWinner());
              try {
                electoralService2.report(getWinner());
              } catch (Throwable e) {
                getLogger().debug(clientConfig2.getId(), "report", e.getMessage());
              }
            }
          }, this.getClass().getSimpleName()+":callReport");
        }
      } catch ( Exception e) {
        getLogger().error(e);
      }
      `
    },
    {
      name: 'report',
      synchronized: true,
      javaCode: `
      getLogger().debug("report", getState().getLabel());
      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      ClusterConfig config = support.getConfig(getX(), support.getConfigId());

      if ( getState() == ElectoralServiceState.IN_SESSION ) {
        if ( config.getIsPrimary() &&
             ! winner.equals(config.getId())) {
          getLogger().warning("report", getState().getLabel(), "multiple primaries,dissolving", config.getId(), winner);
          dissolve(getX());
        } else {
          getLogger().debug("report", getState().getLabel(), "exit");
        }
        return;
      }

      support.setIsPrimary(support.getConfigId().equals(winner));
      List voters = support.getVoters(getX());
      DAO dao = (DAO) getX().get("localClusterConfigDAO");
      for (int i = 0; i < voters.size(); i++) {
        ClusterConfig cfg = (ClusterConfig) ((ClusterConfig) voters.get(i)).fclone();
        if ( winner.equals(cfg.getId()) ) {
          if ( ! cfg.getIsPrimary() ) {
            // found the winner, and it is the 'new' primary, may or may not be us.
            getLogger().debug("report", getState().getLabel(), "new primary", cfg.getId(), cfg.getName());
            cfg.setIsPrimary(true);
            cfg = (ClusterConfig) dao.put_(getX(), cfg);
          } else {
            getLogger().debug("report", getState().getLabel(), "primary", cfg.getId(), cfg.getName());
          }
        } else if ( cfg.getIsPrimary() ) {
          // no longer primary
          getLogger().debug("report", getState().getLabel(), "old primary", cfg.getId(), cfg.getName());
          cfg.setIsPrimary(false);
          cfg = (ClusterConfig) dao.put_(getX(), cfg);
        }
      }
      setState(ElectoralServiceState.IN_SESSION);
      setElectionTime(0L);
      setCurrentSeq(0L);

      getLogger().info("report", getState().getLabel(), "primary", winner);
     `
    }
  ]
});
