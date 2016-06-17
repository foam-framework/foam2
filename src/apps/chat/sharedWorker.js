importScripts('bootFOAMWorker.js');


foam.CLASS({
  name: 'SharedWorker',
  extends: 'foam.apps.chat.SharedWorkerI',

  imports: [
    'registry'
  ],

  exports: [
    'messageDAO'
  ],

  topics: [
    'journalUpdate'
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

var env = foam.apps.chat.Context.create();
env.messagePortService.source = self;

var agent = SharedWorker.create(null, env);
