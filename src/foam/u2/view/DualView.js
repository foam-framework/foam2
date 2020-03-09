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
  package: 'foam.u2.view',
  name: 'DualView',
  extends: 'foam.u2.Element',

  css: `
    ^viewa, ^viewb { padding: 2px 0; }
    ^viewa { margin-right: 8px; }
  `,

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'viewa'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'viewb'
    },
    'data',
    'prop'
  ],

  methods: [
    function initE() {
      var a = foam.u2.ViewSpec.createView(this.viewa, {
        data$: this.data$ }, this, this);
      var b = foam.u2.ViewSpec.createView(this.viewb, {
        data$: this.data$ }, this, this);

      if ( this.prop ) {
        a.fromProperty && a.fromProperty(this.prop);
        b.fromProperty && b.fromProperty(this.prop);
      }

      this
        .start(a).addClass(this.myClass('viewa')).end()
        .start(b).addClass(this.myClass('viewb')).end();
    },

    function fromProperty(prop) {
      this.prop = prop;
    }
  ]
});
