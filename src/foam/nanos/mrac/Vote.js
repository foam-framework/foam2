foam.CLASS({
  package: 'foam.nanos.mrac',
  name: 'Vote',
  implements: [ 'foam.nanos.mrac.ElectoralService' ],
  javaImports: [
    'foam.core.FObject',
    'foam.dao.ClientDAO',
    'foam.dao.DAO',
    'java.util.concurrent.ThreadLocalRandom',
    'java.util.Date'
  ],

  properties: [
    {
      name: 'state',
      class: 'foam.nanos.mrac.State'
    },
    {
      name: 'electionTime',
      class: 'DateTime'
    },
    {
      name: 'currentSeq',
      class: 'Int',
      value: 0
    },
    {
      name: 'winner',
      class: 'foam.dao.DAO'
    }
  ],

  methods: [
    {
      name: 'dissolve',
      javaCode: `
      if ( getState().equals(State.IN_SESSION) ) {
        setElectionTime(new Date());
        for ( DAO client : clients ) {
          ClusterCommand vote = new ClusterCommand.Builder(getX()).setCommand(ClusterCommand.VOTE).setObj((FObject) getElectionTime()).build();
          int result = (int) client.cmd_(getX(), vote);
  
          if ( result > getCurrentSeq() ) {
            setCurrentseq(result);
            setWinner(result);
          }
  
          if ( getState().equals(State.VOTING) ) {
            break;
          }
          if ( getState().equals(State.ELECTION) && hasQuorum() ) {
            report(clients);
          }
        }
      }
     `
    },
    {
      name: 'vote',
      javaCode: `
      if ( getState().equals(State.ELECTION) && ( time.before(getElectionTime()) ) ) {
        setState(State.VOTING);
      }
      return ThreadLocalRandom.current().nextInt();
     `
    },
    {
      name: 'report',
      javaCode: `
      DAO dao = (DAO) getX().get("clusterConfigDAO");
      getWinner.cmd_(getX(), new ClusterCommand.Builder(getX()).setCommand(ClusterCommand.UPDATE_CONFIG).setObj((FObject) NodeType.PRIMARY).build());
      for ( DAO client : clients ) {
        if ( ! ((ClientDAO) client).equals(getWinner()) ) {
          client.cmd_(getX(), new ClusterCommand.Builder(getX()).setCommand(ClusterCommand.UPDATE_CONFIG).setObj((FObject) NodeType.SECONDARY).build());
        }
      }
     `
    },
  ]
});
