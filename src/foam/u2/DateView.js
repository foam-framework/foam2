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
      this.on('scroll', e => { e.preventDefault(); e.stopPropagation(); });

/*
      this.on('focus',  e => { console.log('focus', e); });
      this.on('blur',   e => { console.log('blur', e); });
      this.on('input',  e => { console.log('input', e); });
      this.on('change', e => { console.log('change', e); });
      this.on('beforeinput', e => { console.log('beforeinput', e); });
      */
    },

    function link() {
      if ( this.linked ) return;
      this.linked = true;
      var self    = this;
      var focused = false;
      var slot    = this.attrSlot(); //null, this.onKey ? 'input' : null);

      function updateSlot() {
        var date = self.data;
        if ( focused ) return;
        if ( foam.Number.isInstance(date) ) date = new Date(date);
        if ( ! date ) {
          slot.set('');
        } else {
          slot.set(date ? date.toISOString().substring(0,10) : '');
        }
      }

      function updateData() {
        var value = slot.get();
        self.data = value ? Date.parse(value) : undefined;
      }

      if ( this.onKey ) {
        var focused = false;
        this.on('focus', () => { focused = true; });
        this.on('blur',  () => { focused = false; });
        this.on('change', updateData);
      } else {
        this.on('blur', updateData);
      }

      updateSlot();
      this.onDetach(this.data$.sub(updateSlot));
    }
  ]
});
