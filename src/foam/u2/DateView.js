/**
 * @license
 * Copyright 2015 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// TODO: Add datalist support.

// Should be promoted to just 'DateView' when Safari supports
// proper date fields.
foam.CLASS({
  package: 'foam.u2',
  name: 'DateView',
  extends: 'foam.u2.tag.Input',

  documentation: 'View for editing Date values.',

  css: '^:read-only { border: none; background: rgba(0,0,0,0); }',

  axioms: [
    { class: 'foam.u2.TextInputCSS' }
  ],

  messages: [
    { name: 'DATE_FORMAT', message: 'yyyy-mm-dd' }
  ],

  methods: [
    function initE() {
      this.setAttribute('type', 'date');
      this.setAttribute('max', '9999-12-31');
      this.setAttribute('placeholder', this.DATE_FORMAT);

      this.SUPER();

      // Scroll listener needed because DateView generates scroll event
      // in some foreign locales which conflicts with ScrollWizard.
      this.on('scroll', (e) => { e.preventDefault(); e.stopPropagation(); });
    },

    function link() {
      var self = this;
      var slot = this.attrSlot();

      var date = this.data;

      function updateSlot() {
        date = self.data;
        if ( foam.Number.isInstance(date) ) date = new Date(date);
        slot.set(date ? date.toISOString().substring(0,10) : '');
      }

      updateSlot();

      this.on('blur', () => {
        var value = slot.get();
        this.data = value && Date.parse(value);
      });

      this.onDetach(this.data$.sub(updateSlot));
    }
  ]
});
