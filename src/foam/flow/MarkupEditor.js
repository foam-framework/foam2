/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.flow',
  name: 'MarkupEditor',
  extends: 'foam.u2.View',
  requires: [
    // We don't require Document as it causes a circular dependency
    // that the classloader can't deal with yet.
//    'foam.flow.Document',
    'foam.u2.tag.TextArea'
  ],
  properties: [
    {
      name: 'preview'
    }
  ],
  css: `
^{
table-layout: fixed;
}

^left {
}
^right {
}`,

  methods: [
    function initE() {
      this.onDetach(this.data$.sub(this.updatePreview));
      this.updatePreview();

      this.
        start('table').
        addClass(this.myClass()).
        start('tr').
        start('td').
        attrs({ valign: 'top' }).
        addClass(this.myClass('left')).
        add(this.slot(function(preview) {
          return preview ? preview.toE(this.__subSubContext__) : this.E();
        })).
        end('td').
        start('td').
        attrs({ valign: 'top' }).
        addClass(this.myClass('right')).
        start(this.TextArea, { rows: 24, cols: 80, onKey: true, data$: this.data$ }).
        end('td').
        end('tr').
        end('table');
    }
  ],
  listeners: [
    {
      name: 'updatePreview',
      isMerged: 1000,
      code: function() {
        this.preview = this.__context__.lookup('foam.flow.Document').create({ markup: this.data });
      }
    }
  ]
});
