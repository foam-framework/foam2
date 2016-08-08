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
      name: 'remoteDAO',
      transient: true,
      required: true,
      postSet: function(old, nu) {
        if ( old ) old.on.unsub(this.onRemoteUpdate);
        if ( nu ) nu.on.sub(this.onRemoteUpdate);
      }
    },
    {
      name: 'syncRecordDAO',
      transient: true,
      required: true
    },
    {
      name: 'syncProperty',
      required: true,
      transient: true
    },
    {
      name: 'of',
      required: true,
      transient: true
    },
    {
      class: 'Boolean',
      name: 'polling',
      value: false
    },
    {
      class: 'Int',
      name: 'pollingFrequency',
      value: 1000
    }
  ],

  listeners: [
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
      name: 'onLocalUpdate',
      isMerged: 100,
      code: function() {
        this.sync();
      }
    }
  ],

  methods: [
    function init() {
      this.delegate.on.sub(this.onLocalUpdate);
      if ( this.polling ) {
        this.setInterval(function() {
          this.sync();
        }.bind(this), this.pollingFrequency);
      }
    },

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

    function removeAll(skip, limit, order, predicate) {
      this.delegate.select(null, skip, limit, order, predicate).then(function(a) {
        a = a.a;
        for ( var i = 0 ; i < a.length ; i++ ) {
          this.remove(a[i]);
        }
      }.bind(this));
    },

    function processFromServer(obj) {
      this.delegate.put(obj).then(function(obj) {
        this.syncRecordDAO.put(
          this.SyncRecord.create({
            id: obj.id,
            syncNo: obj[this.syncProperty.name]
          }));
      }.bind(this));
    },

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

    function sync() {
      this.syncToServer();
      this.syncFromServer();
    }
  ]
});
