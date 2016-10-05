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
  name: 'Apply',
  extends: 'foam.u2.Element',
  requires: [
    'foam.u2.DetailView',
    'com.chrome.origintrials.model.Application'
  ],
  imports: [
    'applicationDAO',
    'stack'
  ],
  exports: ['as data'],
  properties: [
    {
      name: 'data',
      factory: function() {
        return this.Application.create();
      }
    }
  ],
  methods: [
    function initE() {
      this.setNodeName('div').
        start(this.DetailView, {
          data: this.data,
          config: {
            applicantName: { label: 'How should we address you?' },
            public: {
              label:  'I agree that this origin may be published as part of ' +
                  'a list of origins using this experimental feature.'
            },
            agreedToTerms: {
              label:  'I accept the Google Chrome Terms of Service'
            }
          },
          properties: [
            this.data.APPLICANT_NAME,
            this.data.APPLICANT_EMAIL,
            this.data.ORIGIN,
            this.data.PUBLIC,
            this.data.REQUESTED_FEATURE,
            this.data.AGREED_TO_TERMS,
            this.data.COMMENTS
          ]
        }).end().
        add(this.SUBMIT);
    }
  ],
  actions: [
    {
      name: 'submit',
      code: function() {
        var self = this;
        this.applicationDAO.put(this.data).then(function() {
          self.stack.back();
        }, function() {
          // TODO: Better error handling.
        });
      }
    }
  ]
});
