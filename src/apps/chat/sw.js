importScripts('bootFOAMWorker.js');

var env = foam.apps.chat.BoxEnvironment.create();
var agent = foam.apps.chat.ServiceWorkerAgent.create(null, env);
agent.execute();
