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
  package: 'com.google.foam.demos.heroes',
  name: 'CitationView',
  extends: 'foam.u2.Element',

  imports: [
    'heroDAO',
    'editHero'
  ],

  css: `
    ^ {
      padding-right: 8px;
      margin: 8px;
      display: flex;
      background: #EEE;
      width: 220px;
      border-radius: 5px;
    }
    ^:hover {
      background: #DDD;
    }
    ^id {
      padding: 8px;
      border-radius: 4px 0 0 4px;
      color: white;
      background: #607D8B;
    }
    ^name {
      margin: 8px 0 0 10px;
      width: 100%;
    }
    ^ button {
      box-shadow: none;
      cursor: pointer;
      border: none;
      border-radius: 4px;
      padding: 6px 8px;
      margin: 4px;
      margin-right: -4px;
      background: gray;
      color: white;
    }
    ^ i {
      margin-top: 5px;
    }
  `,

  properties: [
    'data'
  ],

  methods: [
    function initE() {
      this.
        addClass(this.myClass()).
        on('click', this.onClick).
        start('div').addClass(this.myClass('id')).add(this.data.id).end().
        start('div').addClass(this.myClass('name')).add(this.data.name).end().
        start(this.REMOVE_HERO, { data: this }).end();
    }
  ],

  actions: [
    {
      name: 'removeHero',
      label: 'X',
      speechLabel: 'delete',
      toolTip: 'delete',
      iconFontName: 'delete_forever',
      code: function() { this.heroDAO.remove(this.data); }
    }
  ],

  listeners: [
    function onClick() { this.editHero(this.data); }
  ]
});
