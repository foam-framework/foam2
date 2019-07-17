/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'JSONTextView',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.detail.SectionedDetailPropertyView',
    'foam.u2.tag.TextArea',
  ],
  properties: [
    {
      class: 'String',
      label: '',
      name: 'data_',
      view: function(_, x) {
        return x.data.TextArea.create({
          rows: x.data.rows,
          cols: x.data.cols,
        });
      },
      expression: function(data) {
        return foam.json.Pretty.stringify(data);
      },
      postSet: function(_, n) {
        try {
          this.data = foam.json.parseString(n, this.__context__);
          this.clearProperty('data_');
          this.error = '';
        } catch ( e ) {
          this.error = e;
        }
      },
      validateObj: function(error) {
        return error || null;
      }
    },
    {
      class: 'String',
      name: 'error'
    },
    'rows',
    'cols'
  ],
  methods: [
    function initE() {
      this.tag(this.SectionedDetailPropertyView, {
        prop: this.DATA_,
        data: this
      });
    }
  ]
});