/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'CollapseableDetailView',
  extends: 'foam.u2.View',
  documentation: `
    A detail view that initially just renders the summary of the object
    with a "Show" button that, when clicked, shows a detail view of that
    object.
  `,
  requires: [
    'foam.u2.layout.Cols',
  ],
  properties: [
    {
      class: 'Boolean',
      name: 'isCollapsed',
      value: true
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'view',
      value: { class: 'foam.u2.DetailView' }
    },
    {
      class: 'String',
      name: 'summary',
      visibility: 'RO'
    }
  ],
  reactions: [
    ['', 'propertyChange.data', 'updateSummary'],
    ['data', 'propertyChange', 'updateSummary'],
  ],
  listeners: [
    {
      name: 'updateSummary',
      isFramed: true,
      code: function() {
        this.summary = this.data.toSummary();
      }
    }
  ],
  actions: [
    {
      name: 'showAction',
      label: 'Show',
      isAvailable: function(isCollapsed) { return isCollapsed; },
      code: function() { this.isCollapsed = false; }
    },
    {
      name: 'hideAction',
      label: 'Hide',
      isAvailable: function(isCollapsed) { return ! isCollapsed; },
      code: function() { this.isCollapsed = true; }
    }
  ],
  methods: [
    function initE() {
      var self = this;
      self.SUPER();
      self
        .startContext({ data: self })
          .start(self.Cols)
            .add(self.SUMMARY)
            .add(self.SHOW_ACTION)
            .add(self.HIDE_ACTION)
          .end()
        .endContext()
        .add(self.slot(function(view, isCollapsed) {
          if ( isCollapsed ) return null;
          return self.E().tag(view, {
            data$: self.data$
          });
        }));
    }
  ]
});

