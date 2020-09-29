/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.detail',
  name: 'MDDetailView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.property.MDDateField',
    'foam.u2.property.MDTextField',
    'foam.u2.property.MDIntView',
    'foam.u2.property.MDRichSelect',
    'foam.u2.property.MDSelect',
    'foam.u2.property.MDCheckBox',
    'foam.u2.property.MDFloatView',
    'foam.u2.MDCurrencyView'
  ],

  exports: [
    'data'
  ],

  css: `
  ^ {
    width: inherit !important;
    overflow: scroll;
    height: 100em;
  }

  ^ .property-item .label-container {
    color: #999;
  }
   ^ .property-item {
      padding: 4rem;
      font-size: 3rem;
      align-items: center;
      border: 1px solid #f2f3ff;
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
      color: #999;
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
      width: 100%;
    }
  `,

  properties: [
    {
      name: 'data',
      attribute: true,
      preSet: function(_, data) {
        var of = data && data.cls_;
        if ( of !== this.of ) this.of = of;

        return data;
      },
      factory: function() {
        return this.of && this.of.create(null, this);
      }
    },
    {
      class: 'Class',
      name: 'of'
    },
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
    }
  ],

  methods: [
    function initE() {

      var self = this;
      this.__subContext__.register(this.MDSelect, 'foam.u2.view.ChoiceView');
      this.__subContext__.register(this.MDSelect, 'foam.u2.view.ReferenceView');
      this.__subContext__.register(this.MDSelect, 'foam.u2.tag.Select');
      this.__subContext__.register(this.MDRichSelect, 'foam.u2.view.RichChoiceView');
      this.__subContext__.register(this.MDDateField, 'foam.u2.DateTimeView');
      this.__subContext__.register(this.MDFloatView, 'foam.u2.FloatView');
      this.__subContext__.register(this.MDTextField, 'foam.u2.TextField');
      this.__subContext__.register(this.MDTextField, 'foam.u2.IntView');
      this.__subContext__.register(this.MDTextField, 'foam.u2.view.DualView');
      this.__subContext__.register(this.MDCheckBox, 'foam.u2.CheckBox');
//      this.__subContext__.register(this.MDCurrencyView, 'foam.u2.view.CurrencyView');

      this.add(this.slot(function(of, properties) {
        if ( ! of ) return '';
        this.
          addClass(this.myClass()).
          forEach(properties, function(p) {
            if ( ! foam.dao.OneToManyRelationshipProperty.isInstance(p) &&
              ! foam.dao.ManyToManyRelationshipProperty.isInstance(p) &&
              ! foam.core.FObjectProperty.isInstance(p)
              && ! foam.core.FObjectArray.isInstance(p)
              ) {
              this.start().addClass('property-item').add(p).end();
            }
          })
        })
      );
    }
  ]
});
