/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.filter',
  name: 'FilterViewController',
  extends: 'foam.u2.View',

  documentation: 'Manages the FilterViews',

  imports: [
    'searchManager'
  ],

  messages: [
    { name: 'LABEL_PROPERTY_ALL',    message: 'All' },
    { name: 'LABEL_PROPERTY_FILTER', message: 'Filtering' }
  ],

  css: `
    ^ {
      margin: 8px 0;
      margin-left: 32px;
    }

    ^:first-child {
      margin-left: 0;
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

  properties: [
    {
      name: 'searchView',
      documentation: `The FilterView to wrap. You must set this.`,
      required: true
    },
    {
      class: 'Boolean',
      name: 'active',
      documentation: `Tracks whether the property is being used as part of the
        filter criteria or not.`
    },
    {
      name: 'filterViewElement_'
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
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this
        .addClass(this.myClass())
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

    }
  ],

  listeners: [
    function switchActive() {
      this.active = ! this.active;
      // NOTE: expand-less is off color
      this.iconPath = this.active ? 'images/expand-less.svg' : 'images/expand-more.svg';

      if ( ! this.active ) return;
      if ( ! this.firstTime_ ) return;

      this.container_.tag(this.searchView, {
        property: this.property,
        dao$: this.dao$
      }, this.view_$);

      this.searchManager.add(this.view_);
      this.firstTime_ = false;

      this.onDetach(this.view_$.dot('predicate').sub(this.isFiltering));
    },

    function isFiltering() {
      const instance = this.view_.predicate.instance_;
      this.labelFiltering = instance.arg1 || instance.args ?
        this.LABEL_PROPERTY_FILTER :
        this.LABEL_PROPERTY_ALL;
    }
  ]
});
