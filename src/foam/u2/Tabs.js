/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

// TODO: don't instantiate tabs until viewed

foam.CLASS({
  package: 'foam.u2',
  name: 'Tab',
  extends: 'foam.u2.Element',

  properties: [
    { class: 'String',  name: 'label' },
    { class: 'Boolean', name: 'selected' }
  ]
});

foam.CLASS({
  package: 'foam.u2',
  name: 'Tabs',
  extends: 'foam.u2.UnstyledTabs',
  css: `
    ^tabRow {
      height: 48px;
      border-bottom: 1px solid #e7eaec;
      background-color: white;
    }
    ^tab {
      border-top: 3px solid transparent;
      border-bottom: 3px solid transparent;
      display: inline-block;
      height: 48px;
      box-sizing: border-box;
      padding: 13px 16px;
    }
    ^tab:hover {
      cursor: pointer;
    }
    ^tab.selected {
      border-bottom: 3px solid %SECONDARYCOLOR%;
    }
  `,
});
