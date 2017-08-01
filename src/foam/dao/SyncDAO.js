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
  package: 'foam.dao',
  name: 'SyncDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `SyncDAO synchronizes data between multiple clients' offline
      caches and a server. When syncronizing, each client tracks the last-seen
      version of each object, or if the object was deleted. The most recent
      version is retained.

      Make sure to set the versionProperty to use to track each object's
      version, and deletedProperty to use to track deleted objects. The version
      property will be automatically be incremented as changes are put() into
      the SyncDAO. The SyncDAO will expect to find objects in remoteDAO that
      have been marked as deleted; this is interpreted as a signal to delete
      records (during initial sync or polling).

      Remote DAOs that interact with SyncDAO clients should be decorated with
      foam.dao.VersionNoDAO, or similar, to provision new version numbers for
      records being written to the server.`,

  requires: [ 'foam.dao.sync.SyncRecord' ],

  implements: [ 'foam.mlang.Expressions' ],

  imports: [ 'setInterval' ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'remoteDAO',
      documentation: 'The shared server DAO to synchronize to.',
      transient: true,
      required: true
    },
    {
      name: 'delegate',
      documentation: 'The local cache to sync with the server DAO.'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'syncRecordDAO',
      documentation: `The DAO in which to store SyncRecords for each object.
          Each client tracks their own sync state in a separate syncRecordDAO.`,
      transient: true,
      required: true
    },
    {
      name: 'versionProperty',
      of: 'Property',
      documentation: `The property to use to store the object version. This
          value on each object will be incremented each time it is put() into
          the SyncDAO.`,
      required: true,
      hidden: true,
      transient: true
    },
    {
      class: 'FObjectProperty',
      of: 'Property',
      name: 'deletedProperty',
      required: true,
      hidden: true,
      transient: true
    },
    {
      name: 'of',
      documentation: 'The class of object this DAO will store.',
      required: true,
      transient: true
    },
    {
      class: 'Boolean',
      name: 'polling',
      documentation: `If using a remote DAO without push capabilities, such as
          an HTTP server, polling will periodically attempt to synchronize.`,
      postSet: function(old, nu) {
        this.sync_ = nu ? this.pollingSync_ : this.syncToRemote_;
      }
    },
    {
      /**

      */
      class: 'Int',
      name: 'pollingFrequency',
      documentation: `If using polling, pollingFrequency will determine the
        number of milliseconds to wait between synchronization attempts.`,
      value: 1000
    },
    {
      name: 'synced',
      documentation: `A promise that resolves after any in-flight
          synchronization pass completes.`,
      factory: function() { return Promise.resolve(); }
    },
    {
      class: 'Int',
      name: 'latestVersion_'
      // TODO(markdittmer): Persist this somehow.
    },
    {
      name: 'syncRecordWriteSync_',
      factory: function() { return Promise.resolve(); }
    },
    {
      class: 'Function',
      name: 'sync_',
      documentation: `Selected sync strategy; either syncToRemote_() or
          pollingSync_().`,
      factory: function() {
        return this.polling ? this.pollingSync_ : this.syncToRemote_;
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();

      // Only listen to DAOs that support push (i.e., do not require polling).
      if ( ! this.polling )
        this.remoteDAO$proxy.sub('on', this.onRemoteUpdate);

      // Push initial data from delegate.
      var self = this;
      self.synced = self.delegate.select().
          then(function(sink) {
            var array = sink.array;
            for ( var i = 0; i < array.length; i++ ) {
              self.syncRecordDAO.put(self.SyncRecord.create({
                id: array[i].id
              }));
            }
          }).
          // Sync as if polling on initial sync.
          then(self.pollingSync_.bind(self));

      // Setup polling after initial sync.
      if ( ! self.polling ) return;
      self.synced.then(function() {
        self.setInterval(function() {
          self.sync();
        }, self.pollingFrequency);
      });
    },
    function sync() {
      // Sync after any sync(s) in progress complete.
      return this.synced = this.synced.then(function() {
        return this.sync_();
      }.bind(this));
    },

    //
    // DAO overrides.
    //

    function put_(x, obj) {
      var self = this;
      var ret;
      return self.withSyncRecordTx_(function() {
        return self.delegate.put_(x, obj).then(function(o) {
          ret = o;
          // Updates the object's last seen info.
          return self.syncRecordDAO.put_(x, self.SyncRecord.create({
            id: o.id
          }));
        });
      }).then(self.onLocalUpdate).then(function() { return ret; });
    },
    function remove_(x, obj) {
      var self = this;
      var ret;
      return self.withSyncRecordTx_(function() {
        return self.delegate.remove_(x, obj).then(function(o) {
          ret = o;
          // Marks the object as deleted.
          self.syncRecordDAO.put_(x, self.SyncRecord.create({
            id: obj.id,
            deleted: true
          }));
        });
      }).then(self.onLocalUpdate).then(function() { return ret; });
    },
    function removeAll_(x, skip, limit, order, predicate) {
      // Marks all the removed objects' sync records as deleted via remove_().
      return this.delegate.select_(x, null, skip, limit, order, predicate).
          then(function(a) {
            a = a.array;
            var promises = [];

            for ( var i = 0 ; i < a.length ; i++ ) {
              promises.push(this.remove_(x, a[i]));
            }

            return Promise.all(promises);
          }.bind(this));
    },

    //
    // Private synchronization details.
    //

    {
      name: 'putFromRemote_',
      documentation: 'Process a put() to cache from remote.',
      code: function(obj) {
        var self = this;
        return self.withSyncRecordTx_(function() {
          return self.delegate.put(obj).then(function(o) {
            self.latestVersion_ = Math.max(self.latestVersion_,
                                           self.versionProperty.f(o));
          });
        });
      }
    },
    {
      name: 'removeFromRemote_',
      documentation: 'Process a remove() on cache from remote.',
      code: function(obj) {
        var self = this;
        return self.withSyncRecordTx_(function() {
          return self.delegate.remove(obj).then(function(o) {
            self.latestVersion_ = Math.max(self.latestVersion_,
                                           self.versionProperty.f(obj));
          });
        });
      }
    },
    {
      name: 'resetFromRemote_',
      documentation: 'Process a reset signal on cache from remote.',
      code: function(obj) {
        // Clear sync records and data not associated with unsynced data, then
        // sync.
        var self = this;
        var ret;
        return self.withSyncRecordTx_(function() {
          return self.syncRecordDAO.select().then(function(sink) {
            var idsToKeep = sink.array.map(function(syncRecord) {
              return syncRecord.id;
            });
            return self.delegate.where(
                self.NOT(self.IN(self.of.ID, idsToKeep))).
                removeAll();
          }).then(function() {
            return self.delegate.orderBy(self.DESC(self.versionProperty)).
                limit(1).select();
          }).then(function(sink) {
            return self.latestVersion_ = sink.array[0] ?
                self.versionProperty.f(sink.array[0]) : 0;
          });
        }).then(self.sync.bind(self));
      }
    },
    {
      name: 'pollingSync_',
      documentation: `Polling synchronization strategy. Determine current
          version, then push to remote, then pull update from remote.`,
      code: function() {
        var self = this;
        return self.syncToRemote_().then(function() {
          return self.remoteDAO.
              where(self.GT(self.versionProperty, self.latestVersion_)).
              orderBy(self.versionProperty).
              select();
        }).then(function(sink) {
          var array = sink.array;
          var promises = [];

          for ( var i = 0 ; i < array.length ; i++ ) {
            if ( array[i][self.deletedProperty.name] ) {
              promises.push(self.removeFromRemote_(array[i]));
            } else {
              promises.push(self.putFromRemote_(array[i]));
            }
          }

          return Promise.all(promises);
        });
      }
    },
    {
      name: 'syncToRemote_',
      documentation: `Push synchronization strategy: Push data from cach to
          remote; rely on pushed updates from server.`,
      code: function() {
        var self = this;

        return self.syncRecordDAO.select().then(function(records) {
          records = records.array;
          var promises = [];

          for ( var i = 0 ; i < records.length ; i++ ) {
            var record = records[i];
            var id = record.id;
            var deleted = record.deleted;

            if ( deleted ) {
              var obj = self.of.create(undefined, self);
              obj.id = id;
              promises.push(self.withSyncRecordTx_(function() {
                return self.remoteDAO.remove(obj).then(function() {
                  return self.syncRecordDAO.remove(record);
                });
              }));
            } else {
              // TODO(markdittmer): Deal appropriately with failed updates.
              promises.push(self.delegate.find(id).then(function(obj) {
                if ( ! obj ) return null;

                return self.withSyncRecordTx_(function() {
                  return self.remoteDAO.put(obj).then(function() {
                    return self.syncRecordDAO.remove(record);
                  });
                });
              }));
            }
          }

          return Promise.all(promises);
        });
      }
    },
    {
      name: 'withSyncRecordTx_',
      documentation: `Run a computation that writes to syncRecordDAO
          transactionally with respect to other syncRecordDAO writes.`,
      code: function(f) {
        return this.syncRecordWriteSync_ = this.syncRecordWriteSync_.then(f);
      }
    }
  ],

  listeners: [
    {
      name: 'onRemoteUpdate',
      documentation: 'Respond to push event from remote.',
      code: function(s, on, event, obj) {
        if ( event == 'put' ) {
          if ( obj[this.deletedProperty.name] ) this.removeFromRemote_(obj);
          else                                  this.putFromRemote_(obj);
        } else if ( event === 'remove' ) {
          throw new Error(`SyncDAO recieved remove() event;
                              expected put(deleted)-as-remove()`);
        } else if ( event === 'reset' ) {
          this.resetFromRemote_();
        }
      }
    },
    {
      name: 'onLocalUpdate',
      isMerged: true,
      mergeDelay: 100,
      code: function() {
        this.sync();
      }
    }
  ]
});
