//Medusa Mediate
p({"class":"foam.nanos.boot.NSpec", "name":"nSpecDAO",                           "serve":true,  "authenticate": false, "serviceClass":"foam.dao.ProxyDAO", "client":"{\"of\":\"foam.nanos.boot.NSpec\",\"cache\":true}"})
p({"class":"foam.nanos.boot.NSpec", "name":"http",                             "lazy":false, "service":{"class":"foam.nanos.jetty.HttpServer","port":8001,"forwardedForProxyWhitelist":[],"welcomeFiles":["/src/foam/nanos/controller/index.html"],"servletMappings":[{"class":"foam.nanos.servlet.ServletMapping","className":"foam.nanos.http.NanoRouter","pathSpec":"/service/*"},{"class":"foam.nanos.servlet.ServletMapping","className":"org.eclipse.jetty.servlet.DefaultServlet","pathSpec":"/*","initParameters":{"dirAllowed":"true","redirectWelcome":"true"}}]}})
p({"class":"foam.nanos.boot.NSpec", "name":"tcpServer",                        "lazy":false,  "serviceClass":"foam.nanos.mrac.TCPNioServer"})
p({"class":"foam.nanos.boot.NSpec", "name":"quorumService", "lazy":false, "serviceClass":"foam.nanos.mrac.quorum.QuorumService"})
//p({"class":"foam.nanos.boot.NSpec", "name":"demoObjectDAO",                    "lazy":false,  "serve":true,  "serviceScript":"return new foam.dao.EasyDAO.Builder(x).setRuler(false).setAuthorize(false).setJournalType(foam.dao.JournalType.SINGLE_JOURNAL).setJournalName(\"demoObjects\").setGuid(true).setOf(foam.nanos.demo.DemoObject.getOwnClassInfo()).build();", "client":"{\"of\":\"foam.nanos.demo.DemoObject\", \"remoteListenerSupport\": false}"})
p({"class":"foam.nanos.boot.NSpec", "name":"clusterNodeDAO",                  "lazy":false,  "serve":true,  "serviceScript":"return new foam.dao.EasyDAO.Builder(x).setRuler(false).setAuthorize(false).setJournalType(foam.dao.JournalType.SINGLE_JOURNAL).setJournalName(\"clusterNodes\").setGuid(true).setOf(foam.nanos.mrac.ClusterNode.getOwnClassInfo()).build();", "client":"{\"of\":\"foam.nanos.demo.DemoObject\", \"remoteListenerSupport\": false}"})
p({"class":"foam.nanos.boot.NSpec", "authenticate":false, "name":"demoObjectDAO",                    "lazy":false,  "serve":true,  "serviceScript":"return new foam.nanos.mrac.MMDAO(x, foam.nanos.demo.DemoObject.getOwnClassInfo(), \"singleJournal\")", "client":"{\"of\":\"foam.nanos.demo.DemoObject\", \"remoteListenerSupport\": false}"})
p({
  "class":"foam.nanos.boot.NSpec",
  "name":"localSessionDAO",
  "serviceScript":"""
    return new foam.dao.EasyDAO.Builder(x)
      .setOf(foam.nanos.session.Session.getOwnClassInfo())
      .setGuid(true)
      .setCreatedAware(true)
      .setCreatedByAware(true)
      .setJournalName("sessions")
      .setJournalType(foam.dao.JournalType.SINGLE_JOURNAL)
      .setAuthorize(false)
      .setDecorator(new foam.dao.ValidatingDAO(x, null))
      .build();
  """
})
p({
  "class": "foam.nanos.boot.NSpec",
  "name": "demoObjectDAO",
  "lazy": false,
  "serve": true,
  "serviceScript":
  """
    import foam.dao.*;
    import foam.nanos.demo.DemoObject;
    import foam.nanos.mrac.*;

    MDAO mdao = new MDAO(DemoObject.getOwnClassInfo());
    MMDAO mmdao = new MMDAO(x, "demoObjectDAO", mdao, "singleJournal");
    ClusterClientDAO clusterClientDAO = new ClusterClientDAO.Builder(x)
                                              .setServiceName("demoObjectDAO")
                                              .setDelegate(mmdao)
                                              .setMdao(mdao)
                                              .build();
    VotingDAO votingDAO = new VotingDAO(x, clusterClientDAO);
    return votingDAO;
  """
})
p({
  "class": "foam.nanos.boot.NSpec",
  "name": "ping",
  "lazy": "false",
  "authenticate": false,
  "serviceClass": "foam.nanos.http.PingService"
})
p({
  "class": "foam.nanos.boot.NSpec",
  "name": "cluster",
  "lazy": false,
  "serve": true,
  "authenticate":true,
  "serviceScript": """
    return new foam.dao.EasyDAO.Builder(x)
      .setOf(foam.nanos.mrac.ClusterServerDAO.getOwnClassInfo())
      .setInnerDAO(new foam.nanos.mrac.ClusterServerDAO.Builder(x).build())
      .setNullify(true)
      .setEnableInterfaceDecorators(false)
      .setRuler(false)
      .setAuthorize(false)
      .build();
  """
})
p({"class":"foam.nanos.boot.NSpec","name":"appConfig",                         "lazy":false, "service":{"class":"foam.nanos.app.AppConfig"}})
