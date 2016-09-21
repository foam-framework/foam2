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
  imports: [
    'stack'
  ],
  properties: [
    {
      name: 'data'
    }
  ],
  methods: [
    function initE() {
      this.setNodeName('table').
        select(this.data, function(r) {
          var e = this.E('tr').
            start('td').add(r.applicantName).end().
            start('td').add(r.applicantEmail).end().
            start('td').add(r.origin).end().
            start('td').add(r.requestedFeature).end().
            start('td').start(r.APPROVE, { data: r }).end().end().
            on('click', function() {
              this.stack.push({ class: 'foam.u2.DetailView', data: r.clone() });
            }.bind(this));
          return e;
        });
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
    'foam.u2.search.FilterController',
    'com.chrome.origintrials.ui.Browser'
  ],
  exports: [
    'stack'
  ],
  properties: [
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
        start(this.StackView, { data: this.stack }).end();

      this.stack.push({ class: 'com.chrome.origintrials.ui.Browser', data$: this.data$ });
    }
  ]
});
