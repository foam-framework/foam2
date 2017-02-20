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
