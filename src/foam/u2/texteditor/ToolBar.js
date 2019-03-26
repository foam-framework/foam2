/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.texteditor',
  name: 'ToolBar',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.texteditor.DefaultTextFormats',
    'foam.u2.texteditor.FontFace',
    'foam.u2.texteditor.FontSize',
    'foam.u2.texteditor.TextAlignment',
    'foam.u2.texteditor.TextFormats',
    'foam.u2.texteditor.ListStyle',
    'foam.u2.texteditor.Popup',
    'foam.u2.DetailView',
  ],

  exports: [
    'doc_ as document'
  ],

  properties: [
    {
      name: 'doc_'
    }
  ],

  listeners: [
    {
      name: 'refresh',
      mergeDelay: 300,
      isMerged: true,
      code: function() {
        this.doc_ = null;
        this.doc_ = this.document;
        this.refresh();
      }
    }
  ],

  methods: [
    function initE() {
      this.refresh();

      this.SUPER();
      this
        .tag(this.DetailView, { data: this.DefaultTextFormats.create(), showActions: true})
        .tag(this.Popup, {
          button: 'Font Size',
          view: this.DetailView.create({ data: this.FontSize.create(), showActions: true})
        })
        .tag(this.Popup, {
          button: 'Font Face',
          view: this.DetailView.create({ data: this.FontFace.create(), showActions: true})
        })
        .tag(this.Popup, {
          button: 'Justify',
          view: this.DetailView.create({ data: this.TextAlignment.create(), showActions: true})
        })
        .tag(this.DetailView, { data: this.ListStyle.create(), showActions: true})
        .tag(this.Popup, {
          button: 'Format',
          view: this.DetailView.create({ data: this.TextFormats.create(), showActions: true})
        });
    },
  ]
});
