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

/**
  Used by foam.dao.SyncDAO to track object updates and deletions.
*/
foam.CLASS({
  package: 'foam.dao.sync',
  name: 'SyncRecord',

  properties: [
    'id',
    {
      class: 'Int',
      name: 'syncNo',
      value: -1
    },
    {
      class: 'Boolean',
      name: 'deleted',
      value: false
    }
  ]
});


/**
  SyncDAO synchronizes data between multiple client's offline caches and a server.
  When syncronizing, each client tracks the last-seen version of each object,
  or if the object was deleted. The most recent version is retained.
  <p>
  Make sure to set the syncProperty to use to track each object's version.
  It will automatically be incremented as changes are put() into the SyncDAO.
*/
foam.CLASS({
  package: 'foam.dao',
  name: 'SyncDAO',
  extends: 'foam.dao.ProxyDAO',

  requires: [
    'foam.dao.sync.SyncRecord'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'setInterval'
  ],

  properties: [
    {
      /**
        The shared server DAO to synchronize through.
      */
      class: 'foam.dao.DAOProperty',
      name: 'remoteDAO',
      transient: true,
      required: true
    },
    {
      /** The local cache to sync with the server DAO. */
      name: 'delegate',
    },
    {
      /**
        The DAO in which to store SyncRecords for each object. Each client
        tracks their own sync state in a separate syncRecordDAO.
      */
      name: 'syncRecordDAO',
      transient: true,
      required: true
    },
    {
      /**
        The property to use to store the object version. This value on each
        object will be incremented each time it is put() into the SyncDAO.
      */
      name: 'syncProperty',
      required: true,
      transient: true
    },
    {
      /**
        The class of object this DAO will store.
      */
      name: 'of',
      required: true,
      transient: true
    },
    {
      /**
        If using a remote DAO without push capabilities, such as an HTTP
        server, polling will periodically attempt to synchronize.
      */
      class: 'Boolean',
      name: 'polling',
      value: false
    },
    {
      /**
        If using polling, pollingFrequency will determine the number of
        milliseconds to wait between synchronization attempts.
      */
      class: 'Int',
      name: 'pollingFrequency',
      value: 1000
    }
  ],

  methods: [
    /** @private */
    function init() {
      this.SUPER();

      this.remoteDAO$proxy.sub('on', this.onRemoteUpdate);

      this.delegate.on.sub(this.onLocalUpdate);

      if ( this.polling ) {
        this.setInterval(function() {
          this.sync();
        }.bind(this), this.pollingFrequency);
      }
    },

    /**
      Updates the object's last seen info.
    */
    function put(obj) {
      return this.delegate.put(obj).then(function(o) {
        this.syncRecordDAO.put(
          this.SyncRecord.create({
            id: o.id,
            syncNo: -1
          }));
        return o;
      }.bind(this));
    },

    /**
      Marks the object as deleted.
    */
    function remove(obj) {
      return this.delegate.remove(obj).then(function(o) {
        this.syncRecordDAO.put(
          this.SyncRecord.create({
            id: obj.id,
            deleted: true,
            syncNo: -1
          }));
      }.bind(this));
    },

    /**
      Marks all the removed objects' sync records as deleted.
    */
    function removeAll(skip, limit, order, predicate) {
      this.delegate.select(null, skip, limit, order, predicate).then(function(a) {
        a = a.a;
        for ( var i = 0 ; i < a.length ; i++ ) {
          this.remove(a[i]);
        }
      }.bind(this));
    },

    /** @private */
    function processFromServer(obj) {
      this.delegate.put(obj).then(function(obj) {
        this.syncRecordDAO.put(
          this.SyncRecord.create({
            id: obj.id,
            syncNo: obj[this.syncProperty.name]
          }));
      }.bind(this));
    },

    /** @private */
    function syncFromServer() {
      var E = this;

      this.syncRecordDAO.select(E.MAX(this.SyncRecord.SYNC_NO)).then(function(m) {
        this.remoteDAO
          .where(
            E.GT(this.syncProperty, m.value))
          .select().then(function(a) {
            a = a.a;
            for ( var i = 0 ; i < a.length ; i++ ) {
              this.processFromServer(a[i]);
            }
          }.bind(this));
      }.bind(this));
    },

    /** @private */
    function syncToServer() {
      var E = this;
      var self = this;

      this.syncRecordDAO
        .where(E.EQ(this.SyncRecord.SYNC_NO, -1))
        .select().then(function(records) {
          records = records.a;

          for ( var i = 0 ; i < records.length ; i++ ) {
            var record = records[i]
            var id = record.id;
            var deleted = record.deleted;

            if ( deleted ) {
              var obj = self.of.create();
              obj.id = id;
              self.remoteDAO.remove(obj);
            } else {
              // TODO: Stop sending updates if the first one fails.
              self.delegate.find(id).then(function(obj) {
                return self.remoteDAO.put(obj);
              }).then(function(obj) {
                self.processFromServer(obj);
              });
            }
          }
        });
    },

    /** @private */
    function sync() {
      this.syncToServer();
      this.syncFromServer();
    }
  ],

  listeners: [
    /** @private */
    function onRemoteUpdate(s, on, event, obj) {
      if ( event == 'put' ) {
        this.processFromServer(obj);
      } else if ( event === 'remove' ) {
        this.delegate.remove(obj);
      } else if ( event === 'reset' ) {
        this.delegate.removeAll();
      }
    },

    {
      /** @private */
      name: 'onLocalUpdate',
      isMerged: true,
      mergeDelay: 100,
      code: function() {
        this.sync();
      }
    }
  ]
});
