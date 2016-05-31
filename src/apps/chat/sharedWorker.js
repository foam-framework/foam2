importScripts('bootFOAMWorker.js');

//var env = foam.apps.chat.SharedWorkerBoxEnvironment.create();

foam.CLASS({
  name: 'Env',
  exports: [
    'registry',
    'root',
    'messagePortService'
  ],
  properties: [
    {
      name: 'messagePortService',
      factory: function() {
        return foam.messaging.SharedWorkerMessagePortService.create({
          source: self,
          delegate: this.registry
        }, this);
      }
    },
    {
      name: 'registry',
      factory: function() {
        return foam.box.BoxRegistryBox.create(null, this);
      }
    },
    {
      name: 'root',
      factory: function() {
        return this.registry;
      }
    }
  ]
});

foam.CLASS({
  name: 'SharedWorker',
  extends: 'foam.apps.chat.SharedWorkerI',
  imports: [
    'registry'
  ],
  exports: [
    'messageDAO'
  ],
  properties: [
    {
      name: 'syncAgent',
      factory: function() {
        return foam.apps.chat.FgSyncAgent.create(null, this);
      }
    },
    {
      name: 'messageDAO',
      factory: function() {
        return foam.apps.chat.MessageDAO.create(null, this);
      }
    },
    {
      name: 'remoteMessageDAO',
      factory: function() {
        return foam.apps.chat.RemoteMessageDAO.create(null, this);
      }
    }
  ],
  topics: [
    'journalUpdate'
  ],
  methods: [
    function init() {
      this.registry.register(
        'messageDAO',
        null,
        foam.box.SkeletonBox.create({
          data: this.messageDAO
        }, this));

      this.registry.register(
        'control',
        null,
        foam.box.SkeletonBox.create({
          data: this,
        }, this));

      this.messageDAO.outboundJournal.on.sub(this.onJournalUpdate);

      this.remoteMessageDAO.on.sub(this.onJournalUpdate);
      this.remoteMessageDAO.delegate.startEvents();

      this.sync();
    },
    function sync() {
      this.syncAgent.sync.sync();
    }
  ],
  listeners: [
    {
      name: 'onJournalUpdate',
      isMerged: 100,
      code: function() {
        this.journalUpdate.pub();
      }
    }
  ]
});

var env = Env.create(null, foam.apps.chat.Env.create());
env.messagePortService.start();
env.registry.me = env.messagePortService.me;

var agent = SharedWorker.create(null, env);
