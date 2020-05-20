/**
* @license
* Copyright 2020 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.filter.advanced',
  name: 'AdvancedFilterView',
  extends: 'foam.u2.View',

  documentation: `
    The Advanced Filter View allows a user to search for results that matches
    multiple criterias set by them. It functions as a huge OR(AND(...)). In
    other words, this allows for conflicting search criterias which is exactly
    what the user may want to do. This advanced filter view functions primarily
    in preview mode.
  `,

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.u2.ModalHeader',
    'foam.u2.filter.advanced.CriteriaView'
  ],

  imports: [
    'closeDialog',
    'filterController'
  ],

  css: `
    ^ {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    ^ .foam-u2-ModalHeader {
      border-radius: 5px 5px 0 0;
    }

    ^ .foam-u2-ModalHeader-title {
      font-family: 'Open Sans', sans-serif;
      font-spacing: 0;
    }

    ^label-subtitle {
      margin: 0;
      margin-bottom: 24px;
      font-size: 16px;
      font-weight: 300;
    }

    ^container-advanced {
      flex: 1;
      padding: 24px;

      overflow-y: scroll;
    }

    ^container-handle {
      height: 40px;

      padding: 0 16px;
      box-sizing: border-box;

      border: 1px solid /*%GREY4%*/ #e7eaec;
      border-radius: 5px;

      display: flex;
      align-items: center;

      margin-top: 8px;
    }

    ^container-handle:first-child {
      margin: 0;
    }

    ^container-handle:hover {
      cursor: pointer;
    }

    ^handle-title {
      flex: 1;
      margin: 0;
    }

    ^handle-remove {
      margin: 0;
      padding: 0 8px;
      color: red;
    }

    ^handle-remove:hover {
      cursor: pointer;
      color: darkred;
    }

    ^ .foam-u2-filter-advanced-CriteriaView {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.24s ease-in-out;
    }

    ^isOpen {
      max-height: 1000px !important;
      overflow: visible !important;
    }

    ^ .foam-u2-ActionView-addCriteria {
      width: 100%;

      margin-top: 16px;
      padding: 0;
    }

    ^ .foam-u2-ActionView-clearAll {
      color: red;
      padding: 0 8px;
    }

    ^ .foam-u2-ActionView-tertiary {
      color: #4D7AF7;
    }

    ^ .foam-u2-ActionView-tertiary:hover {
      color: #233E8B;
    }

    ^ .foam-u2-ActionView-tertiary:focus {
      padding: 0 8px;
      border: none;
    }

    ^container-footer {
      display: flex;
      justify-content: flex-end;

      padding: 16px 24px;

      border-top: solid 1px #CBCFD4;
      border-radius: 0 0 5px 5px;
      background-color: #F6F6F6;
    }

    ^label-results {
      margin: 0;
      font-size: 12px;
      padding: 0 8px;
      flex: 1;
      align-self: center;
    }
  `,

  messages: [
    { name: 'TITLE_HEADER', message: 'Advanced Filters' },
    { name: 'LABEL_CRITERIA', message: 'Criteria'},
    { name: 'LABEL_REMOVE', message: 'Remove'},
    { name: 'LABEL_RESULTS', message: 'Filter Results Preview: '},
    { name: 'LABEL_INSTRUCTION', message: 'In Advanced Mode, the results are an accumulation of each criteria. Within each criteria, the results will be a reflection that fully matches your selection.' }
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      documentation: 'DAO this filter is filtering on, passed by FilterView'
    },
    {
      class: 'Long',
      name: 'isOpenIndex',
      documentation: 'Keeps track what is open so we can close it when opening another criteria',
      value: 0
    },
    {
      class: 'Long',
      name: 'resultsCount',
      documentation: 'Results of current criterias'
    },
    {
      class: 'String',
      name: 'resultLabel',
      documentation: 'Returns a human readable result',
      expression: function(filterController$totalCount, filterController$resultsCount ) {
        return `${this.LABEL_RESULTS}${filterController$resultsCount} of ${filterController$totalCount}`;
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.filterController.getResultsCount();
      // This ensure that no matter how the view is closed, preview mode is disabled
      this.onDetach(() => { this.filterController.isPreview = false; });
    },

    function initE() {
      var self = this;
      this.addClass(this.myClass())
        .start(this.ModalHeader, { title: this.TITLE_HEADER }).end()
        .add(this.filterController.slot(function(previewCriterias) {
          var keys = Object.keys(previewCriterias);
          return self.E().addClass(self.myClass('container-advanced'))
            .start('p').addClass(self.myClass('label-subtitle'))
              .add(self.LABEL_INSTRUCTION)
            .end()
            .forEach(keys, function(key, index) {
              var criteria = previewCriterias[key];
              this.start().addClass(self.myClass('container-handle'))
                .on('click', () => { self.toggleDrawer(key); })
                .start('p').addClass(self.myClass('handle-title')).add(`${self.LABEL_CRITERIA} ${Number.parseInt(key) + 1}`).end()
                .start('p').addClass(self.myClass('handle-remove'))
                  .on('click', () => { self.removeCriteria(key); })
                  .add(`${self.LABEL_REMOVE}`)
                .end()
                .add(self.slot(function(isOpenIndex) {
                  var iconPath = self.getIconPath(key);
                  return this.E().start({ class: 'foam.u2.tag.Image', data: iconPath}).end()
                }))
              .end()
              .start(self.CriteriaView, { criteria: key }).enableClass(
                self.myClass('isOpen'),
                self.slot(function(isOpenIndex){ return key == isOpenIndex; })
              ).end();
            })
            .startContext({data: self})
              .start(self.ADD_CRITERIA, { buttonStyle: 'TERTIARY' }).end()
            .endContext();
        }))
        .start().addClass(this.myClass('container-footer'))
          .start('p').addClass(this.myClass('label-results'))
            .add(this.resultLabel$)
          .end()
          .startContext({ data: this })
            .start(this.CLEAR_ALL, { buttonStyle: 'TERTIARY' }).end()
            .start(this.FILTER).end()
          .endContext()
        .end();
    },

    function getIconPath(key) {
      return key == this.isOpenIndex ? 'images/expand-less.svg' : 'images/expand-more.svg';
    }
  ],

  actions: [
    {
      name: 'addCriteria',
      label: 'Add another criteria',
      code: function(X) {
        this.filterController.addCriteria();
      }
    },
    {
      name: 'closeModal',
      label: 'Cancel',
      code: function(X) {
        X.closeDialog();
      }
    },
    {
      name: 'clearAll',
      label: 'Clear All',
      code: function(X) {
        this.filterController.clearAll(true);
      }
    },
    {
      name: 'filter',
      label: 'Apply Filter',
      isEnabled: function(filterController$previewPredicate) {
        return filterController$previewPredicate !== this.TRUE;
      },
      code: function(X) {
        this.filterController.applyPreview();
        X.closeDialog();
      }
    }
  ],

  listeners: [
    {
      name: 'toggleDrawer',
      code: function(key) {
        if ( key == this.isOpenIndex ) {
          this.isOpenIndex = -1;
          return;
        }
        this.isOpenIndex = key;
      }
    },
    {
      name: 'removeCriteria',
      code: function(key) {
        if ( key == this.isOpenIndex ) this.isOpenIndex = -1;
        if ( Object.keys(this.filterController.previewCriterias).length === 1 ) {
          this.clearAll(true);
          return;
        }
        this.filterController.clearCriteria(key, true);
      }
    }
  ]
});
