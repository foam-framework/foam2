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
  package: 'foam.u2.md',
  name: 'StackView',
  extends: 'foam.u2.BasicStackView',
  methods: [
    function initE() {
      this.cssClass('flex').cssClass('layout').cssClass('vertical');
      this.SUPER();
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.md',
  name: 'Toolbar',
  extends: 'foam.u2.Element',
  properties: [
    {
      name: 'title'
    },
    [ 'nodeName', 'paper-toolbar' ]
  ],

  methods: [
    function initE() {
      this.start('span').cssClass('title').add(this.title$).end();
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.md',
  name: 'ToolbarContainer',
  extends: 'foam.u2.Element',

  properties: [
    {
      name: 'toolbar',
      required: true
    },
    {
      name: 'body',
      factory: function() {
        return this.E('div');
      }
    },
    [ 'nodeName', 'paper-header-panel' ]
  ],

  methods: [
    function initE() {
      this.attrs({ fullbleed: true });
      this.add(this.toolbar.cssClass('paper-header'));
      this.add(this.body.cssClass('content'));
    }
  ]
});
