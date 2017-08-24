/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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

/**
 * Manual standalone test script for stress testing foam.dao.SyncDAO. To tweak
 * test operation, jump to comment "Test configuration".
 */

require('../../src/foam.js');

var AdapterDAO;
var BaseDAO;
var Item;
var ProxyDAO;
var QuickSink;
var StoreAndForwardDAO;
var SyncDAO;
var VersionNoDAO;
var VersionTrait;
var VersionedItem;
var VersionedSyncRecord;

foam.CLASS({
  package: 'foam.dao.test',
  name: 'Item',

  properties: [ 'id', 'data' ]
});

foam.CLASS({
  package: 'foam.dao.test',
  name: 'BaseDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Clone before put()/remove() to delegate (default: MDAO). Also,
      delay up to "maxDelay" milliseconds before passing put()/remove() to
      delegate, and before returning delegate's response.`,

  requires: [ 'foam.dao.MDAO' ],

  properties: [
    {
      name: 'delegate',
      factory: function() {
        return this.MDAO.create({ of: this.of });
      }
    },
    {
      name: 'maxDelay',
      documentation: `Maximum number of milliseconds to delay passing to
          delegate and/or returning value from delegate.`,
      value: 20
    }
  ],

  methods: [
    function put_(x, o) {
      return this.delay_('put_', [ x, o.clone() ]);
    },
    function remove_(x, o) {
      return this.delay_('remove_', [ x, o.clone() ]);
    },
    function delay_(op, args) {
      var self = this;
      return new Promise(function(resolve, reject) {
        // Log to ensure ordering (i.e., no logs such as these should appear
        // after verification step).
        setTimeout(function() {
          return self.delegate[op].apply(self.delegate, args).then(function(o) {
            setTimeout(function() {
              resolve(o);
            }, Math.floor(Math.random() * self.maxDelay));
          }, function(e) {
            setTimeout(function() {
              reject(e);
            }, Math.floor(Math.random() * self.maxDelay));
          });
        }, Math.floor(Math.random() * self.maxDelay));
      });
    }
  ]
});

Item = foam.lookup('foam.dao.test.Item');
AdapterDAO = foam.lookup('foam.dao.AdapterDAO');
BaseDAO = foam.lookup('foam.dao.test.BaseDAO');
ProxyDAO = foam.lookup('foam.dao.ProxyDAO');
QuickSink = foam.lookup('foam.dao.QuickSink');
StoreAndForwardDAO = foam.lookup('foam.dao.StoreAndForwardDAO');
SyncDAO = foam.lookup('foam.dao.SyncDAO');
VersionNoDAO = foam.lookup('foam.dao.VersionNoDAO');
VersionTrait = foam.lookup('foam.version.VersionTrait');
VersionedSyncRecord = foam.lookup('foam.dao.sync.VersionedSyncRecord');
var versionedClassFactory =
    foam.lookup('foam.version.VersionedClassFactorySingleton').create();
VersionedItem = versionedClassFactory.get(Item);

function getData(name) {
  return name + ':' + Math.ceil(Math.random() * 1000);
}

/**
 * Test configuration
 */

// Data in remote before VersionNoDAO is added.
var getInitialDatum = (function() {
  var version = 1;
  return function getInitialDatum(o) {
    o.version_ = version;
    version++;
    o.deleted_ = Math.random() > 0.5;
    return VersionedItem.create(o);
  }
})();
var initialData = [
  getInitialDatum({ id: 0, data: getData('initial') }),
  getInitialDatum({ id: 10, data: getData('initial') }),
  getInitialDatum({ id: 20, data: getData('initial') }),
  getInitialDatum({ id: 30, data: getData('initial') }),
  getInitialDatum({ id: 40, data: getData('initial') })
];

// Number of independent SyncDAOs communicating with remote.
var numActiveAgents = 10;
// Number of non-sync agents just put()/remove()ing to remote.
var numPassiveAgents = 10;

// Record ids span integers: [0, numRecords - 1].
var numRecords = 50;
// Number of times ("rounds") to synchronously put()/remove() records.
var numRounds = 50;
// Number of put()/remove()s per synchronous "round".
var opsPerRound = 20;
// Wait time between rounds.
var waitBetweenRounds = 3000;
// Polling frequency for polling SyncDAOs; should be appreciably less than
// waitBetweenRounds.
var pollingFrequency = 2000;
// Wait time for sync DAOs to finish synchronizing before verifying results.
// NOTE: If this value is too low, then spurious errors will be reported.
var waitToSettle = 10000;

/**
 * DAO setup
 */

// Underlying DAO on remote.
var remoteDelegate = BaseDAO.create({ of: VersionedItem });
initialData.forEach(function(data) { remoteDelegate.put(data); });
// DAO that agents hit when talking to remote.
var remoteDAO = StoreAndForwardDAO.create({
  delegate: VersionNoDAO.create({
    of: VersionedItem,
    delegate: remoteDelegate
  })
});

// Agents using SyncDAOs.
var activeAgents = new Array(numActiveAgents);
for ( var i = 0; i < numActiveAgents; i++ ) {
  // TODO(markdittmer): Add initial unsynced data to agents.
  activeAgents[i] = AdapterDAO.create({
    of: Item,
    to: VersionedItem,
    delegate: SyncDAO.create({
      of: VersionedItem,
      remoteDAO: remoteDAO,
      delegate: BaseDAO.create({ of: VersionedItem }),
      syncRecordDAO: BaseDAO.create({ of: VersionedSyncRecord }),
      polling: Math.floor(Math.random() * 2) === 0,
      pollingFrequency: pollingFrequency
    })
  });
}

// Agents talking directly to remote.
var passiveAgents = new Array(numPassiveAgents);
for ( var i = 0; i < numPassiveAgents; i++ ) {
  passiveAgents[i] = AdapterDAO.create({
    of: Item,
    to: VersionedItem,
    delegate: ProxyDAO.create({ delegate: remoteDAO })
  });
}

// All the agents.
var agents = activeAgents.concat(passiveAgents);

/**
 * Test run(s)
 */

// Setup timers for each round.
for ( var i = 0; i < numRounds; i++ ) {
  setTimeout(function() {
    for ( var j = 0; j < opsPerRound; j++ ) {
      var agentNo = Math.floor(Math.random() * agents.length);
      var agent = agents[agentNo];
      var op = Math.floor(Math.random() * 2) === 0 ? 'put' : 'remove';
      agent[op](Item.create({
        id: Math.floor(Math.random() * numRecords),
        data: getData('agent' + agentNo)
      }));
    }
  }, i * waitBetweenRounds);
}

/**
 * Test result verification.
 */

// Setup timer for verification.
setTimeout(function() {
  var E = foam.lookup('foam.mlang.ExpressionsSingleton').create();
  var errorCount = 0;
  var reference;

  // Add log marker after which no DAO activity should be logged.
  // If DAO activity is logged after this line, results should not be trusted;
  // increase timeouts to let SyncDAOs settle.
  console.log('DONE! (There should be no non-polling BaseDAO logs below)');

  // Exclude deleted records from reference.
  var p = remoteDAO.where(E.EQ(VersionTrait.DELETED_, false)).select().
      then(function(sink) {
        reference = sink.array.map(function(versionedItem) {
          return Item.create(versionedItem);
        });
      });

  for ( var i = 0; i < activeAgents.length; i++ ) {
    // Wait for previous round (or "reference" accumulation) before reporting on
    // next active agent.
    p = p.then(function(i) {
      return activeAgents[i].select().then(function(sink) {
        var array = sink.array;
        if ( array.length !== reference.length ) {
          errorCount++;
          console.error('Agent', i, 'has too many/few records');
        }
        for ( var j = 0; j < array.length; j++ ) {
          if ( ! foam.util.equals(array[j], reference[j]) ) {
            errorCount++;
            console.error('Agent', i, 'does not match reference at', j);
          }
        }
      });
    }.bind(this, i));
  }
  p.then(function() {
    setTimeout(function() {
      console.log('Exiting (found', errorCount, 'errors)');
      require('process').exit(errorCount === 0 ? 0 : 1);
    }, pollingFrequency + 100);
  });
}, numRounds * waitBetweenRounds + waitToSettle);
