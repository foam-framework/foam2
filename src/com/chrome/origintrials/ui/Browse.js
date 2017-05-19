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
  package: 'com.chrome.origintrials.ui',
  name: 'Browser',
  extends: 'foam.u2.Element',
  requires: [
    'foam.u2.Tab',
    'foam.u2.Tabs',
    'foam.u2.TableSelection',
    'foam.u2.TableView',
    'foam.u2.search.FilterController',
    'com.chrome.origintrials.model.Application',
    'com.chrome.origintrials.ui.Admin'
  ],
  imports: [
    'stack',
    'applicationDAO',
    'experimentDAO'
  ],
  exports: [
    'data'
  ],
  properties: [
    {
      name: 'data'
    }
  ],
  methods: [
    function initE() {
      this.
        start(this.APPLY, { data: this }).
        end().
        start(this.CREATE_EXPERIMENT, { data: this }).
        end().
        start(this.Tabs).
          start(this.Tab, { label: 'Applications' }).
            start(this.FilterController, {
              searchFields: [ 'origin', 'applicantEmail', 'approved' ],
              tableView: {
                class: 'foam.u2.TableSelection',
                bulkActions: [ this.BULK_APPROVE ]
              },
              data: this.applicationDAO
            }).
            end().
          end().
          start(this.Tab, { label: 'Experiments' }).
            start(this.FilterController, {
              searchFields: [ 'name', 'owner' ],
              data: this.experimentDAO
            }).
            end().
          end().
          start(this.Tab, { label: 'Admin' }).
            start(this.Admin).end().
          end().
        end();
    }
  ],
  actions: [
    {
      name: 'apply',
      code: function() {
        this.stack.push({
          class: 'foam.comics.DAOCreateController',
          of: 'com.chrome.origintrials.model.Application'
        });
      }
    },
    {
      name: 'createExperiment',
      code: function() {
        this.stack.push({
          class: 'foam.comics.DAOCreateController',
          of: 'com.chrome.origintrials.model.Experiment'
        });
      }
    },
    {
      name: 'bulkApprove',
      code: function(X) {
        var self = this;
        var model = X.lookup('com.chrome.origintrials.model.Application');
        this.where(X.selectionQuery).select().then(function(sink) {
          for ( var i = 0; i < sink.array.length; i++ ) {
            model.APPROVE.maybeCall(X, sink.array[i]);
            self.put(sink.array[i]);
          }
        });
      }
    }
  ]
});

foam.CLASS({
  package: 'com.chrome.origintrials.ui',
  name: 'Admin',
  extends: 'foam.u2.Element',
  imports: [
    'stack'
  ],
  exports: [
    'as data'
  ],
  methods: [
    function initE() {
      this.add(this.ADD_USER);
    }
  ],
  actions: [
    {
      name: 'addUser',
      code: function() {
        this.stack.push({
          class: 'foam.comics.DAOCreateController',
          of: 'com.chrome.origintrials.model.User'
        });
      }
    }
  ]
});

foam.CLASS({
  package: 'com.chrome.origintrials.ui',
  name: 'GoogleSignIn',
  extends: 'foam.u2.Element',
  imports: [
    'idToken'
  ],
  methods: [
    function initE() {
      this.setNodeName('div');

      this.onload.sub(this.render);
    }
  ],
  listeners: [
    function render() {
      gapi.signin2.render(this.id, {
        scope: 'profile email',
        width: 240,
        height: 50,
        longtitle: true,
        theme: 'dark',
        onsuccess: this.onSuccess,
        onfailure: this.onFailure
      });
    },
    function onSuccess(e) {
      this.idToken$.set(e.getAuthResponse().id_token);
    },
    function onFailure() {
      // TODO
    }
  ]
});

foam.CLASS({
  package: 'com.chrome.origintrials.ui',
  name: 'Browse',
  extends: 'foam.u2.Element',
  requires: [
    'com.chrome.origintrials.model.Application',
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView',
    'com.chrome.origintrials.ui.Browser',
    'com.chrome.origintrials.ui.GoogleSignIn'
  ],
  exports: [
    'stack',
    'idToken',
    'as data'
  ],
  properties: [
    {
      name: 'idToken'
    },
    {
      name: 'stack',
      factory: function() { return this.Stack.create(); }
    },
    {
      name: 'data'
    }
  ],
  methods: [
    function initE() {
      this.setNodeName('div').
        start(this.GoogleSignIn).end().
        start(this.StackView, { data: this.stack }).end();

      this.stack.push({
        class: 'com.chrome.origintrials.ui.Browser',
        data$: this.data$
      });
    }
  ]
});
