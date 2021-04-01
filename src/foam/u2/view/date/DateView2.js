/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view.date',
  name: 'DateView2',
  extends: 'foam.u2.tag.Input',

  documentation: 'View for editing Date values. TEMP view for fixing input field updates from text and OS regioning',

  css: '^:read-only { border: none; background: rgba(0,0,0,0); }',

  axioms: [
    { class: 'foam.u2.TextInputCSS' }
  ],

  properties: [
    [ 'placeholder', 'yyyy-mm-dd' ]
  ],

  listeners: [
    {
      name: 'onBlur',
      isFramed: true,
      code: function() {
        if ( ! this.el() || ! this.data ) return;
        this.el().value = this.dataToInput(this.data);
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.setAttribute('type', 'date');
      this.setAttribute('max', '9999-12-31');
      this.setAttribute('placeholder', 'yyyy/mm/dd');
      //this.on('blur', this.onBlur);
      this.on('scroll', function(evt) { evt.preventDefault(); evt.stopPropagation(); });
    },

    function link() {
      var slot = this.attrSlot(null, 'change');
      slot.set(this.dataToInput(this.data));
      slot.sub(() => this.data = this.inputToData(slot.get()));
     
    },

    function inputToData(input) {
      var d = new Date(input);
      return isNaN(d.getTime()) ? null : d;
    },

    function dataToInput(data) {
      if ( ! data ) return data;

      // Using our own formatter to keep the date in the format (yyyy-mm-dd) while maintaining the locale date
      const year  = data.getFullYear();
      const month = (data.getMonth() + 1).toString().padStart(2, '0');
      const day   = data.getDate().toString().padStart(2, '0');

      return `${year}-${month}-${day}`;
    }
  ]
});
