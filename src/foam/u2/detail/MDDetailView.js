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
    'foam.u2.md.tag.PaperDropdown',
    'foam.u2.property.MDDateField',
    'foam.u2.property.MDTextField',
    'foam.u2.property.MDIntView',
    'foam.u2.property.MDSelect',
    'foam.u2.property.MDCheckBox',
    'foam.u2.property.MDFloatView',
    'foam.u2.detail.MDDetailView',
    'foam.u2.view.MDCurrencyView',
    'foam.u2.view.ChoiceView'
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

  ^ .property-item .label-container {
    color: #999;
  }
   ^ .property-item {
   justify-content: space-between;
      padding: 4rem;
      font-size: 3rem;
      display: flex;
      background: white;
      align-items: center;
      border: 1px solid #f2f3ff;
      height: 7rem;
    }
    ^ .property-item > div {
      width: 100%;
    }

    ^ .foam-u2-view-StringView {
      width: 100%;
    }

    ^ .label {
      font-size: 2rem;
      color: #999;
      flex-grow: 1;
      font-weight: 500;
      transition: font-size 0.5s, top 0.5s;
      z-index: 0;
      top: 0;
      position: relative;
    }

    ^ .label-offset {
        font-size: 3rem;
        top: 4rem;
        position: relative;
      }

    ^ .foam-u2-property-MDCalendar-heading {
      font-size: 1.5rem;
      padding-bottom: 1rem;
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
      width: 100%;
      border: none;
    }

    ^ .foam-u2-view-RichChoiceView {
      width: 100%;
    }

    ^ .DefaultRowView-row {
      font-size: 2rem;
    }

    ^ .foam-u2-view-ReferencePropertyView {
      width: 100%;
    }

    ^ .foam-u2-view-EnumView {
    width: 100%;}
  `,
  properties: [
    {
      name: 'title',
      expression: function(of) {
        return of.model_.label;
      }
    },
    [ 'showTitle', true ],
    [ 'nodeName', 'div' ],
    {
      name: 'properties',
      // TODO: Make an FObjectArray when it validates properly
      preSet: function(_, ps) {
        foam.assert(ps, 'Properties required.');
        for ( var i = 0; i < ps.length; i++ ) {
          foam.assert(
              foam.core.Property.isInstance(ps[i]),
              `Non-Property in 'properties' list:`,
              ps);
        }
        return ps;
      },
      expression: function(of) {
        if ( ! of ) return [];
        return this.of.getAxiomsByClass(foam.core.Property).
          // TODO: this is a temporary fix, but DisplayMode.HIDDEN should be included and could be switched
          filter(function(p) {
            return ! ( p.hidden || p.visibility === foam.u2.DisplayMode.HIDDEN );
          });
      }
    },
  ],

  methods: [
    function initE() {

      this.__subContext__.register(this.MDSelect, 'foam.u2.tag.Select');
      this.__subContext__.register(this.MDSelect, 'foam.u2.view.RichChoiceView');
      this.__subContext__.register(this.MDDateField, 'foam.u2.DateTimeView');
      this.__subContext__.register(this.MDFloatView, 'foam.u2.FloatView');
      this.__subContext__.register(this.MDTextField, 'foam.u2.TextField');
      this.__subContext__.register(this.MDTextField, 'foam.u2.IntView');
      this.__subContext__.register(this.MDCheckBox, 'foam.u2.CheckBox');
//      this.__subContext__.register(this.cls_, 'foam.u2.view.FObjectView');
//      this.__subContext__.register(this.MDCurrencyView, 'foam.u2.CurrencyView');

      this.add(this.slot(function(of, properties, actions) {
        if ( ! of ) return '';
          this.
            addClass(this.myClass()).
            forEach(properties, function(p) {
              if ( ! foam.dao.OneToManyRelationshipProperty.isInstance(p) &&
                ! foam.dao.ManyToManyRelationshipProperty.isInstance(p) ) {
                this.start().addClass('property-item').add(p).end();
              }
            })
          }));
    }
  ]
});
