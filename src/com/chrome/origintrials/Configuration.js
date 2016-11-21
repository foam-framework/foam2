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
  package: 'com.chrome.origintrials',
  name: 'SyncDAO',
  extends: 'foam.dao.ProxyDAO',
  properties: [
    'network'
  ],
  methods: [
    {
      name: 'put',
      code: function(obj) {
        return this.SUPER(obj).then(function(obj) {
          this.network.put(obj);
          return obj;
        }.bind(this));
      }
    },
    {
      name: 'remove',
      code: function(obj) {
        return this.SUPER(obj).then(function() {
          this.network.remove(obj);
          return obj;
        }.bind(this));
      }
    }
  ]
});

foam.CLASS({
  package: 'com.chrome.origintrials',
  name: 'Configuration',
  extends: 'com.chrome.origintrials.TestConfiguration',
  implements: [ 'foam.box.Context' ],
  requires: [
    'foam.dao.ClientDAO',
    'com.chrome.origintrials.SyncDAO',
    'foam.box.SubBox',
    'foam.box.HTTPBox'
  ],
  properties: [
    {
      name: 'networkApplicationDAO',
      factory: function() {
        var dao = this.ClientDAO.create({
          of: this.Application,
          delegate: this.SubBox.create({
            name: 'applications',
            delegate: this.HTTPBox.create({
              url: document.location.origin + '/api',
              method: 'POST'
            })
          })
        });

        return dao;
      }
    },
    {
      name: 'applicationDAO',
      factory: function() {
        var dao = this.EasyDAO.create({
          of: this.Application,
          guid: true,
          daoType: 'MDAO'
        });

        var sync = this.SyncDAO.create({
          delegate: dao,
          network: this.networkApplicationDAO
        });

        this.networkApplicationDAO.select().then(function(objs) {
          objs.a.map(function(o) { dao.put(o); });
        });

        return sync;
      }
    },
    {
      name: 'networkExperimentDAO',
      factory: function() {
        var dao = this.ClientDAO.create({
          of: this.Experiment,
          delegate: this.SubBox.create({
            name: 'experiments',
            delegate: this.HTTPBox.create({
              url: document.location.origin + '/api',
              method: 'POST'
            })
          })
        });
        return dao;
      }
    },
    {
      name: 'experimentDAO',
      factory: function() {
        var dao = this.EasyDAO.create({
          of: this.Experiment,
          daoType: 'MDAO'
        });

        var sync = this.SyncDAO.create({
          delegate: dao,
          network: this.networkExperimentDAO
        });

        this.networkExperimentDAO.select().then(function(objs) {
          objs.a.map(function(o) { dao.put(o); });
        });

        return sync;
      }
    }
  ]
});
