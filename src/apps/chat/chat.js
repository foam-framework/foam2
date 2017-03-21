/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.apps.chat',
  name: 'Context',
  extends: 'foam.box.Context',

  exports: [
    'isSafari'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'isSafari',
      factory: function() {
        return navigator.userAgent.indexOf('Safari') !== -1 &&
          navigator.userAgent.indexOf('Chrome') === -1
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.apps.chat',
  name: 'SharedWorkerI',

  methods: [
    {
      name: 'sync',
      returns: '',
      code: function() {}
    }
  ]
});


foam.CLASS({
  package: 'foam.apps.chat',
  name: 'ClientSharedWorkerI',

  properties: [
    {
      class: 'Stub',
      of: 'foam.apps.chat.SharedWorkerI',
      name: 'box'
    }
  ]
});


foam.CLASS({
  package: 'foam.apps.chat',
  name: 'Message',

  properties: [
    {
      class: 'Int',
      name: 'id'
    },
    {
      class: 'String',
      name: 'from'
    },
    {
      class: 'Int',
      name: 'syncNo',
      value: -1
    },
    {
      class: 'String',
      name: 'message'
    },
    {
      class: 'DateTime',
      name: 'timestamp'
    }
  ]
});


foam.CLASS({
  package: 'foam.apps.chat',
  name: 'ServiceWorker',

  properties: [
    {
      name: 'registration'
    }
  ],

  methods: [
    {
      name: 'init',
      code: function() {
        this.registration.then(function(r) {
          r.sync.register({ id: 'messages' });
        });

        this.registration.then(function(r) {
          r.pushManager.subscribe({
            userVisibleOnly: true
          }).then(function(p) {
          }, function() {
          });
        });
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.apps.chat',
  name: 'ServiceWorkerAgent',

  requires: [
    'foam.apps.chat.BgSyncAgent'
  ],

  properties: [
    {
      name: 'scope',
      required: true
    },
    {
      name: 'bgSync',
      factory: function() {
        return this.BgSyncAgent.create();
      }
    }
  ],
  methods: [
    function execute() {
      this.scope.onsync = this.sync;
      this.scope.onpush = this.push;
    }
  ],
  listeners: [
    function sync(e) {
      e.waitUntil(
        this.bgSync.sync.sync().then(function() {
          return this.scope.clients.matchAll({
            type: 'all',
            includeUncontrolled: true
          }).then(function(clients) {
            for ( var i = 0 ; i < clients.length ; i++ ) {
              if ( clients[i].frameType === 'top-level' ) {
                clients[i].postMessage('NEWDATA');
              }
            }
          });
        }.bind(this)));
    },

    function push(e) {
      this.scope.registration.sync.register({ id: 'messages' });
    }
  ]
});

// foam.CLASS({
//   package: 'foam.apps.chat',
//   name: 'ServiceWorker',
//   imports: [
//     'server'
//   ],
//   properties: [
//     {
//       name: 'box',
//       factory: function() {
//         //        var w = new Worker('sw.js');
//         //        return this.server.connect(w);

//         // return navigator.serviceWorker.register('sw.js').then(function(r) {
//         //   return new Promise(function(resolve, reject) {
//         //     window.setTimeout(function() {
//         //       resolve(this.server.connect(r.active));
//         //     }.bind(this), 0);
//         //   }.bind(this));
//         // }.bind(this));
//       }
//     }
//   ],
//   methods: [
//     function init() {
//       navigator.serviceWorker.register('sw.js')
//     }
//   ]
//});


foam.CLASS({
  package: 'foam.dao.sync',
  name: 'SyncStatus',

  properties: [
    {
      name: 'id'
    },
    {
      name: 'latestServerTimestamp'
    }
  ]
});


foam.CLASS({
  package: 'foam.dao.sync',
  name: 'FgSync',

  properties: [
    {
      name: 'localDAO',
      required: true
    },
    {
      name: 'inboundJournal',
      required: true
    }
  ],

  methods: [
    {
      name: 'sync',
      returns: 'Promise',
      code: function() {
        // Consume inbound journal
        var self = this;
        return this.inboundJournal.select().then(function(a) {
          var records = a.a;
          var i = 0;

          function processRecord() {
            var record = records[i++];
            if ( ! record ) return;

            return self.localDAO.put(record.record).then(function(r) {
              return self.inboundJournal.remove(record);
            }).then(processRecord);
          }

          return processRecord();
        });
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.dao.sync',
  name: 'BgSync',

  requires: [
    'foam.dao.sync.SyncStatus',
    'foam.mlang.E',
    'foam.dao.JournalEntry'
  ],

  properties: [
    {
      name: 'timestampProperty',
      required: true
    },
    {
      name: 'syncStatusId',
      required: true
    },
    {
      name: 'outboundJournal',
      required: true,
    },
    {
      name: 'inboundJournal',
      required: true,
    },
    {
      name: 'syncStatusDAO',
      required: true,
    },
    {
      name: 'remoteDAO',
      required: true
    },
  ],

  methods: [
    {
      name: 'sync',
      returns: 'Promise',
      code: function() {
        var self = this;
        return this.syncToServer().then(function() {
          return self.syncFromServer();
        });
      }
    },

    function syncToServer() {
      // Consume the local journal, sending updates to the server
      // and writing the result to the server journal.
      var self = this;
      return this.outboundJournal.select().then(function(a) {
        var records = a.a;
        var i = 0;

        function processRecord() {
          var record = records[i++];
          if ( ! record ) return;

          return self.remoteDAO[record.isRemove ? 'remove' : 'put'](record.record).then(function(obj) {
            if ( ( record.isRemove ? record.record : obj ) == undefined ) debugger;

            return self.inboundJournal.put(self.JournalEntry.create({
              record: record.isRemove ? record.record : obj,
              isRemove: record.isRemove
            }));
          }).then(function() {
            return self.outboundJournal.remove(record);
          }).then(processRecord);
        }

        return processRecord()
      });
    },

    function syncFromServer() {
      // Downloads updated records from the server and write to the server
      // journal.

      var self = this;
      var E = this.E.create();
      var syncStatus;

      return this.syncStatusDAO.find(this.syncStatusId).then(function(obj) {
        // If not found create a new sync status.
        if ( ! obj ) return self.syncStatusDAO.put(self.SyncStatus.create({
          id: self.syncStatusId,
          latestServerTimestamp: 0
        }));

        return obj;
      }).then(function(s) {
        syncStatus = s;

        return self.remoteDAO
          .where(E.GT(self.timestampProperty, s.latestServerTimestamp))
          .orderBy(self.timestampProperty)
          .select()
      }).then(function(a) {
        var records = a.a;
        var i = 0;
        var last = syncStatus.latestServerTimestamp;

        function processRecord() {
          var record = records[i++];
          if ( ! record ) return last;

          last = self.timestampProperty.get(record);

          return self.inboundJournal.put(self.JournalEntry.create({
            record: record
          })).then(processRecord);
        }

        return processRecord();
      }).then(function(lastTimestamp) {
        return self.syncStatusDAO.put(self.SyncStatus.create({
          id: self.syncStatusId,
          latestServerTimestamp: lastTimestamp
        }));
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.apps.chat',
  name: 'RemoteMessageDAO',
  extends: 'foam.dao.ProxyDAO',

  requires: [
    'com.firebase.SafariFirebaseDAO',
    'com.firebase.FirebaseDAO',
    'foam.apps.chat.Message'
  ],

  imports: [
    'isSafari'
  ],

  properties: [
    {
      name: 'channel',
      value: 'foam'
    },
    {
      name: 'auth'
    },
    {
      name: 'delegate',
      factory: function() {
        var dao = this.isSafari ?
            this.SafariFirebaseDAO.create() :
            this.FirebaseDAO.create();

        dao.of = this.Message;
        dao.timestampProperty = this.Message.SYNC_NO;
        dao.apppath = 'https://glaring-torch-184.firebaseio.com/';

        if ( this.auth ) {
          dao.secret = this.auth;
        }

        dao.basepath = dao.apppath + 'chat/foam'; // + this.channel;

        return dao;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.apps.chat',
  name: 'Journal',
  extends: 'foam.dao.ProxyDAO',

  requires: [
    'foam.dao.JournalEntry',
    'foam.dao.TimestampDAO',
    'foam.dao.IDBDAO'
  ],

  properties: [
    {
      name: 'name',
      required: true
    },
    {
      name: 'delegate',
      factory: function() {
        return this.TimestampDAO.create({
          delegate: this.IDBDAO.create({
            name: this.name,
            of: this.JournalEntry
          })
        });
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.apps.chat',
  name: 'SyncStatusDAO',
  extends: 'foam.dao.ProxyDAO',

  requires: [
    'foam.dao.IDBDAO',
    'foam.dao.sync.SyncStatus'
  ],

  properties: [
    {
      name: 'delegate',
      factory: function() {
        return this.IDBDAO.create({
          of: this.SyncStatus
        })
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.apps.chat',
  name: 'BgSyncAgent',

  requires: [
    'foam.dao.sync.BgSync',
    'foam.apps.chat.Message',
    'foam.apps.chat.Journal',
    'foam.apps.chat.SyncStatusDAO',
    'foam.apps.chat.RemoteMessageDAO'
  ],

  properties: [
    {
      name: 'sync',
      factory: function() {
        return this.BgSync.create({
          timestampProperty: this.Message.SYNC_NO,
          syncStatusId: 'status',
          outboundJournal: this.Journal.create({ name: 'foam-messages-outbound' }),
          inboundJournal: this.Journal.create({ name: 'foam-messages-inbound' }),
          syncStatusDAO: this.SyncStatusDAO.create(),
          remoteDAO: this.RemoteMessageDAO.create()
        });
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.apps.chat',
  name: 'FgSyncAgent',

  requires: [
    'foam.apps.chat.Journal',
    'foam.dao.sync.FgSync'
  ],

  imports: [
    'messageDAO'
  ],

  properties: [
    {
      name: 'sync',
      factory: function() {
        return this.FgSync.create({
          localDAO: this.messageDAO.delegate.delegate,
          inboundJournal: this.Journal.create({ name: 'foam-messages-inbound' })
        });
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.apps.chat',
  name: 'MessageDAO',
  extends: 'foam.dao.ProxyDAO',

  requires: [
    'foam.dao.TimestampDAO',
    'foam.dao.ArrayDAO',
    'foam.dao.IDBDAO',
    'foam.dao.CachingDAO',
    'foam.dao.JournalDAO',
    'foam.apps.chat.Message',
    'foam.apps.chat.Sync',
    'foam.apps.chat.Journal'
  ],

  properties: [
    {
      name: 'outboundJournal',
      factory: function() {
        return this.Journal.create({ name: 'foam-messages-outbound' });
      }
    },
    {
      name: 'delegate',
      factory: function() {
        return this.JournalDAO.create({
          delegate: this.CachingDAO.create({
            src: this.TimestampDAO.create({
              delegate: this.IDBDAO.create({
                of: this.Message,
                version: 3
              })
            }),
            cache: this.ArrayDAO.create({
              of: this.Message
            })
          }),
          journal: this.outboundJournal
        });
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.apps.chat',
  name: 'Client',

  requires: [
    'foam.apps.chat.MessageDAO'
  ],

  imports: [
    'root',
    'registry'
  ],

  exports: [
    'connected',
    'messageDAO'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'connected',
      value: false
    },
    {
      name: 'sharedWorker_',
      factory: function() {
        return foam.box.MessagePortBox.create({
          port: new SharedWorker('sharedWorker.js').port
        }, this);
      }
    },
    {
      name: 'sharedWorker',
      factory: function() {
        return foam.apps.chat.ClientSharedWorkerI.create({
          box: foam.box.SubBox.create({
            name: 'control',
            delegate: this.sharedWorker_
          }, this)
        }, this);
      }
    },
    {
      name: 'messageDAO',
      factory: function() {
        return foam.dao.ClientDAO.create({
          delegate: foam.box.SubBox.create({
            name: 'messageDAO',
            delegate: this.sharedWorker_
          }, this)
        }, this);
      }
    }
  ]
});
