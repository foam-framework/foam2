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
    'com.chrome.origintrials.model.Application'
  ],
  exports: [
    'applicationDAO'
  ],
  methods: [
    function genApplication() {
      var names = [ 'Adam', 'Alex', 'Kevin', 'Braden', 'Jackson' ];
      var emails = [ 'adamvy@google.com', 'kgr@google.com', 'foo@example.com', 'unknown@somehwere.asdfasdf' ];
      var origins = [ '127.0.0.1:8888', 'google.com', 'chrome.com', 'some.sub.domain.at.example.com' ];
      var features = [ 'bluetooth', 'usb', 'sockets', 'storage', 'other' ];
      var comments = [ 'this is sweet', 'can i have access pls?', "I'm not sure what I'm doing." ];

      function rand(a) {
        return a[Math.floor(Math.random() * a.length)]
      }
      function bool() { return Math.random() < 0.5; }

      return this.Application.create({
        applicantName: rand(names),
        applicantEmail: rand(emails),
        origin: rand(origins),
        public: bool(),
        requestedFeature: rand(features),
        agreedToTerms: bool(),
        comments: rand(comments)
      });
    }
  ],
  properties: [
    {
      name: 'applicationDAO',
      factory: function() {
        var dao = this.EasyDAO.create({
          of: this.Application,
          guid: true,
          daoType: 'MDAO'
        });

        for ( var i = 0 ; i < 50 ; i++ ) {
          dao.put(this.genApplication());
        }

        return dao;
      }
    }
  ]
});