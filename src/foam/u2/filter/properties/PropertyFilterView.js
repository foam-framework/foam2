/**
* @license
* Copyright 2019 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.filter.property',
  name: 'PropertyFilterView',
  extends: 'foam.u2.View',

  documentation: `
    Property Filter View is in charge of displaying the correct Search View and
    restore the view's data if there is an existing predicate for the view that
    was selected by the user before.
  `,

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'filterController',
    'memento'
  ],

  css: `
    ^ {
      margin: 16px;
    }

    ^container-property {
      display: flex;
      box-sizing: border-box;
      height: 32px;
      padding: 6px 8px;
      padding-right: 4px;
      border-radius: 3px;
      border: solid 1px #cbcfd4;
    }

    ^container-property:hover {
      cursor: pointer;
    }

    ^container-property-active {
      background-color: #f5f7fa;
    }

    ^label-property {
      margin: 0;
      font-size: 14px;
      line-height: 1.43;
      color: #5e6061;
      flex: 1;
      overflow: hidden;
    }

    ^overlay-dismiss {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 2;
    }

    ^container-filter {
      position: absolute;
      z-index: 100;
      margin-top: 8px;

      min-width: 216px;

      border-radius: 3px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 2px 8px 0 rgba(0, 0, 0, 0.16);
      border: solid 1px #cbcfd4;
      background-color: #ffffff;
    }
  `,

  messages: [
    { name: 'LABEL_PROPERTY_ALL',    message: 'All' },
    { name: 'LABEL_PROPERTY_FILTER', message: 'Filtering' }
  ],

  properties: [
    {
      name: 'searchView',
      documentation: 'The FilterView to wrap. You must set this.',
      required: true
    },
    {
      class: 'Boolean',
      name: 'active',
      documentation: `
        Tracks if the property filter is currently being focused on or not. This
        affects UI and some logic.
      `
    },
    'container_',
    'property',
    'dao',
    {
      class: 'Boolean',
      name: 'firstTime_',
      value: true
    },
    'view_',
    {
      class: 'String',
      name: 'labelFiltering',
      factory: function() {
        return this.LABEL_PROPERTY_ALL;
      }
    },
    {
      class: 'String',
      name: 'iconPath',
      value: 'images/expand-more.svg'
    },
    {
      name: 'criteria'
    },
    'isInit'
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.addClass(this.myClass())
        .start().addClass(this.myClass('container-property'))
          .enableClass(this.myClass('container-property-active'), this.active$)
          .on('click', this.switchActive)
          .start('p').addClass(this.myClass('label-property'))
            .add(`${this.property.label}: `)
            .add(this.labelFiltering$)
          .end()
          .start({ class: 'foam.u2.tag.Image', data$: this.iconPath$}).end()
        .end()
        .add(this.slot(function(active) {
          return active ? self.E().start().addClass(self.myClass('overlay-dismiss'))
          .on('click', self.switchActive)
          .end() : self.E();
        }))
        .start('div', null, this.container_$).addClass(this.myClass('container-filter'))
          .show(this.active$)
        .end();

      this.isInit = true;
      this.isFiltering();
      this.isInit = false;
    }
  ],

  listeners: [
    function switchActive() {
      this.active = ! this.active;
      this.iconPath = this.active ? 'images/expand-less.svg' : 'images/expand-more.svg';

      // View is not active. Does not require creation
      if ( ! this.active ) return;
      // View has been instantiated before. Does not require creation
      if ( ! this.firstTime_ ) return;

      this.container_.tag(this.searchView, {
        property: this.property,
        dao$: this.dao$
      }, this.view_$);

      // Restore the search view using an existing predicate for that view
      // This requires that every search view implements restoreFromPredicate
      var existingPredicate = this.filterController.getExistingPredicate(this.criteria, this.property);
      if ( existingPredicate ) {
        this.view_.restoreFromPredicate(existingPredicate);
      }

      // Add the view to be managed by the FilterController
      // This enables reciprocal search
      this.filterController.add(this.view_, this.property.name, this.criteria);

      // Prevents rerendering the view.
      this.firstTime_ = false;

      this.onDetach(this.view_$.dot('predicate').sub(this.isFiltering));
    },

    function isFiltering() {
      if ( ! this.isInit ) {
        if ( ! this.view_ || ! this.memento )
          return;

        if ( ! this.memento.paramsObj.f ) {
          this.memento.paramsObj.f = [];
        }

        this.memento.paramsObj.f = this.memento.paramsObj.f.filter(f => f.n !== this.property.name || f.criteria !== this.criteria );

        var pred;
        if ( Object.keys(this.view_.predicate).length > 0 && ! foam.mlang.predicate.True.isInstance(this.view_.predicate) )
        pred =  this.view_.predicate.toMQL && this.view_.predicate.toMQL();

        if ( pred ) {
          var newFilterValue = { criteria: this.criteria, n: this.property.name, pred: pred }
          this.memento.paramsObj.f.push(newFilterValue);
        }
        if ( this.memento && this.memento.paramsObj.f && this.memento.paramsObj.f.length === 0 ) {
          delete this.memento.paramsObj.f;
        }

        this.memento.paramsObj = foam.Object.clone(this.memento.paramsObj);
      }
      
      // Since the existing predicates are lazy loaded (on opening the view),
      // check to see if there is an existing predicate to use the correct label
      if ( this.filterController.getExistingPredicate(this.criteria, this.property) && this.firstTime_ ) {
        this.labelFiltering = this.LABEL_PROPERTY_FILTER;
        return;
      }
      if ( ! this.view_ ) return;
      // Displays the correct label depending on situation
      this.labelFiltering = this.view_.predicate !== this.TRUE ?
        this.LABEL_PROPERTY_FILTER : this.LABEL_PROPERTY_ALL;
    }
  ]
});
