importScripts('bootFOAMWorker.js');

var env   = foam.apps.chat.Context.create();
var agent = foam.apps.chat.WorkerAgent.create(null, env);
agent.execute();
