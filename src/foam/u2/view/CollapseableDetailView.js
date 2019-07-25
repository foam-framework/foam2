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

  css: `
    ^citation-view {
      width: 100%;
    }
  `,

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
      class: 'foam.u2.ViewSpec',
      name: 'citationView',
      expression: function(data) {
        return {
          class: 'foam.u2.CitationView',
          of: data && data.cls_
        }
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

      this.addClass(this.myClass());
      
      self
        .startContext({ data: self })
          .start(self.Cols)
            .add(self.slot(function(citationView) {
              return citationView ? self.E().tag(citationView, {
                data$: self.data$
              }).addClass(this.myClass('citation-view')) : null;
            }))
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
