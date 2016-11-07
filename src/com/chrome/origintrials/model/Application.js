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
  package: 'com.chrome.origintrials.model',
  name: 'Application',
  properties: [
    {
      class: 'String',
      name: 'id',
      hidden: true
    },
    {
      class: 'String',
      required: true,
      name: 'applicantName'
    },
    {
      class: 'EMail',
      required: true,
      label: 'Email Address',
      name: 'applicantEmail'
    },
    {
      class: 'String',
      required: true,
      label: 'Web Origin',
      name: 'origin'
    },
    {
      class: 'Boolean',
      name: 'public',
      label: 'Publishing?',
      value: false
    },
    {
      class: 'Boolean',
      name: 'agreedToTerms',
      label: 'Agreed to Terms',
      required: true,
      value: false
    },
    {
      class: 'String',
      required: false,
      name: 'comments'
    },
    {
      class: 'Boolean',
      name: 'approved',
      value: false
    }
  ],
  actions: [
    {
      name: 'approve',
      isEnabled: function(approved) {
        return ! approved
      },
      code: function() {
        this.approved = true;
      }
    }
  ]
});
