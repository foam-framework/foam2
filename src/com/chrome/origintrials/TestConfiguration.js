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
  name: 'TestConfiguration',
  requires: [
    'foam.dao.EasyDAO',
    'com.chrome.origintrials.model.Application',
    'com.chrome.origintrials.model.Experiment'
  ],
  exports: [
    'applicationDAO',
    'experimentDAO',
    'applicationDAO as com.chrome.origintrials.model.ApplicationDAO',
    'experimentDAO as com.chrome.origintrials.model.ExperimentDAO'
  ],
  methods: [
    function genTestData() {
      var data = [];
      for ( var i = 0 ; i < 10 ; i++ ) {
        data.push(this.genApplication());
      }
      return data;
    },
    function rand(a) {
      return a[Math.floor(Math.random() * a.length)]
    },
    function bool() { return Math.random() < 0.5; },
    function genApplication() {
      var names = [ 'Adam', 'Alex', 'Kevin', 'Braden', 'Jackson' ];
      var emails = [ 'adamvy@google.com', 'kgr@google.com', 'foo@example.com', 'unknown@somehwere.asdfasdf' ];
      var origins = [ '127.0.0.1:8888', 'google.com', 'chrome.com', 'some.sub.domain.at.example.com' ];
      var features = ['bluetooth', 'usb', 'sockets', 'storage', 'other'];
      var comments = [ 'this is sweet', 'can i have access pls?', "I'm not sure what I'm doing." ];

      return {
        applicantName: this.rand(names),
        applicantEmail: this.rand(emails),
        origin: this.rand(origins),
        public: this.bool(),
        experiment: this.rand(features),
        agreedToTerms: this.bool(),
        comments: this.rand(comments)
      };
    },
    function genExperiments() {
      var names = ['bluetooth', 'usb', 'sockets', 'storage', 'other'];
      var owners = ['adamvy@google.com', 'kgrgreer@gmail.com'];
      var data = [];

      for ( var i = 0 ; i < names.length ; i++ ) {
        var start = new Date();
        start.setMonth(Math.floor(Math.random() * 12));

        data[i] = {
          name: names[i],
          owner: this.rand(owners),
          startTime: start
        };
      }

      return data;
    }
  ],
  properties: [
    {
      name: 'applicationDAO',
      factory: function() {
        var dao = this.EasyDAO.create({
          of: this.Application,
          guid: true,
          daoType: 'MDAO',
          testData: this.genTestData()
        });

        return dao;
      }
    },
    {
      name: 'experimentDAO',
      factory: function() {
        var dao = this.EasyDAO.create({
          of: this.Experiment,
          daoType: 'MDAO',
          testData: this.genExperiments()
        });

        return dao;
      }
    }
  ]
});