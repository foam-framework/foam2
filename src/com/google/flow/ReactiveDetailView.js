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
  package: 'com.google.flow',
  name: 'ReactiveDetailView',
  extends: 'foam.u2.DetailView',

  requires: [ 'com.google.flow.DetailPropertyView' ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'DetailPropertyView',
  extends: 'foam.u2.DetailPropertyView',

  axioms: [
    foam.u2.CSS.create({
      code: function() {/*
      ^label {
        color: #444;
        display: block;
        float: left;
        font-size: 13px;
        padding-left: 6px;
        padding-top: 6px;
        text-align: right;
        vertical-align: top;
      }
      ^switch { color: #ccc; }
      ^ .reactive {
        font-weight: 600;
        color: red !important;
      }
      ^units  {
        color: #444;
        font-size: 12px;
        padding: 4px;
        text-align: right;
      }
      */}
    })
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'reactive'
    },
    'prop',
    [ 'nodeName', 'tr' ]
  ],

  methods: [
    function initE() {
      var prop = this.prop;

      this.cssClass(this.myCls()).
          start('td').cssClass(this.myCls('label')).add(prop.label).end().
          start('td').
            cssClass(this.myCls('switch')).
            enableCls('reactive', this.reactive$).
            on('click', this.toggleMode).
            add(' = ').
          end().
          start('td').cssClass(this.myCls('view')).add(
              prop,
              prop.units && this.E('span').cssClass(this.myCls('units')).add(' ', prop.units)).
          end();
    }
  ],

  listeners: [
    function toggleMode() {
      this.reactive = ! this.reactive;
    }
  ]
});
