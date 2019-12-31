//Medusa Mediate
p({"class":"foam.nanos.boot.NSpec", "name":"nSpecDAO",                           "serve":true,  "authenticate": false, "serviceClass":"foam.dao.ProxyDAO", "client":"{\"of\":\"foam.nanos.boot.NSpec\",\"cache\":true}"})
p({"class":"foam.nanos.boot.NSpec", "name":"http",                             "lazy":false, "service":{"class":"foam.nanos.jetty.HttpServer","port":8001,"forwardedForProxyWhitelist":[],"welcomeFiles":["/src/foam/nanos/controller/index.html"],"servletMappings":[{"class":"foam.nanos.servlet.ServletMapping","className":"foam.nanos.http.NanoRouter","pathSpec":"/service/*"},{"class":"foam.nanos.servlet.ServletMapping","className":"org.eclipse.jetty.servlet.DefaultServlet","pathSpec":"/*","initParameters":{"dirAllowed":"true","redirectWelcome":"true"}}]}})
p({"class":"foam.nanos.boot.NSpec", "name":"tcpServer",                        "lazy":false,  "serviceClass":"foam.nanos.mrac.TCPNioServer"})
p({"class":"foam.nanos.boot.NSpec", "name":"demoObjectDAO",                    "lazy":false,  "serve":true,  "serviceScript":"return new foam.dao.EasyDAO.Builder(x).setRuler(false).setAuthorize(false).setJournalType(foam.dao.JournalType.SINGLE_JOURNAL).setJournalName(\"demoObjects\").setGuid(true).setOf(foam.nanos.demo.DemoObject.getOwnClassInfo()).build();", "client":"{\"of\":\"foam.nanos.demo.DemoObject\", \"remoteListenerSupport\": false}"})
p({"class":"foam.nanos.boot.NSpec", "name":"clusterNodeDAO",                  "lazy":false,  "serve":true,  "serviceScript":"return new foam.dao.EasyDAO.Builder(x).setRuler(false).setAuthorize(false).setJournalType(foam.dao.JournalType.SINGLE_JOURNAL).setJournalName(\"clusterNodes\").setGuid(true).setOf(foam.nanos.mrac.ClusterNode.getOwnClassInfo()).build();", "client":"{\"of\":\"foam.nanos.demo.DemoObject\", \"remoteListenerSupport\": false}"})
//p({"class":"foam.nanos.boot.NSpec", "name":"demoObjectDAO",                    "lazy":false,  "serve":true,  "serviceScript":"return new foam.nanos.mrac.MMDAO(x, foam.nanos.demo.DemoObject.getOwnClassInfo(), \"singleJournal\")", "client":"{\"of\":\"foam.nanos.demo.DemoObject\", \"remoteListenerSupport\": false}"})
p({
  "class": "foam.nanos.boot.NSpec",
  "name": "ping",
  "lazy": "false",
  "authenticate": false,
  "serviceClass": "foam.nanos.http.PingService"
})
