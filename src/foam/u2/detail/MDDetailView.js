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
  package: 'foam.u2.detail',
  name: 'MDDetailView',
  extends: 'foam.u2.DetailView',

  requires: [
    'foam.core.Property',
    'foam.u2.DetailPropertyView',
    'foam.u2.md.CheckBox',
    'foam.u2.property.MDDateField',
    'foam.u2.property.MDTextField',
    'foam.u2.property.MDIntView'
  ],

  exports: [
    'data'
  ],

  css: `
  ^ {
    margin: auto;
    width: inherit !important;
    overflow: scroll;
    height: 100rem;
  }
   ^ .property-item {
      padding: 4rem;
      font-size: 3rem;
      display: flex;
      background: white;
      margin-top: 4px;
    }
    ^ .foam-u2-property-MDTextField-label {
      font-size: 2rem;
      top: 0rem;
    }

    ^ .foam-u2-property-MDTextField-label-offset {
        font-size: 3rem;
        top: 4rem;
        position: relative;
    }
    ^ .foam-u2-view-StringView {
      width: 100%;
    }

    ^ .foam-u2-md-CheckBox {
      width: 3rem;
      height: 3rem;
    }

    ^ .foam-u2-md-CheckBox-label {
      position: unset;
    }

    ^ .foam-u2-property-MDDatePicker-body {
      height: 22rem;
      width: 22rem;
    }

    ^ .foam-u2-property-MDCalendar-heading {
      font-size: 1.5rem;
      padding-bottom: 1rem;
    }

    ^ .foam-u2-property-MDCalendar-table {
      font-size: 1.5rem;
    }

    ^ span button {
      font-size: 2rem;
    }

    ^ .foam-u2-tag-Select {
      font-size: 2rem;
      height: 4rem;
      width: fit-content;
    }

    ^ .foam-u2-view-RichChoiceView-selection-view {
      height: 4rem;
      font-size: 2rem;
      width: fit-content;
    }

    ^ .DefaultRowView-row {
      font-size: 2rem;
    }
  `,
  properties: [
    {
      name: 'title',
      expression: function(of) {
        return of.model_.label;
      }
    },
    [ 'showTitle', true ],
    [ 'nodeName', 'div' ]
  ],

  methods: [
    function initE() {

      this.__subContext__.register(this.CheckBox, 'foam.u2.CheckBox');
      this.__subContext__.register(this.MDDateField, 'foam.u2.DateTimeView');
      this.__subContext__.register(this.MDTextField, 'foam.u2.TextField');
      this.__subContext__.register(this.MDTextField, 'foam.u2.IntView');

      this.add(this.slot(function(of, properties, actions) {
        if ( ! of ) return '';
          this.
            addClass(this.myClass()).
            forEach(properties, function(p) {
              if ( p.cls_ != foam.dao.OneToManyRelationshipProperty &&
                p.cls_ != foam.dao.ManyToManyRelationshipProperty && p.label != "User Feedback") {
                this.start().addClass('property-item').add(p).end();
              }
            })
          }));
    }
  ]
});
