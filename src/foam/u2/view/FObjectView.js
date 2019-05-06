/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'FObjectView',
  extends: 'foam.u2.Controller',

  documentation: 'View for editing FObjects.',

  // css: '^:read-only { border: none; background: rgba(0,0,0,0); }'

  properties: [
    {
      class: 'String',
      name: 'objectClass',
      displayWidth: 70,
      view: { class: 'foam.u2.TextField', size: 80 },
      postSet: function(oldValue, newValue) {
        if ( newValue !== oldValue ) {
          var m = this.__context__.lookup(newValue, true);
          if ( m ) {
            this.data = m.create(this.data, this);
          }
        }
      }
    },
    {
      name: 'data',
      view: { class: 'foam.u2.DetailView', showActions: false },
      postSet: function(_, data) {
        if ( ! data ) {
          this.objectClass = undefined;
        } else if ( data.cls_.id != this.objectClass ) {
          this.objectClass = data.cls_.id;
        }
      }
    },
    'choices'
  ],

  methods: [
    function initE() {
      this.SUPER();

      this.addClass(this.myClass());

      if ( this.choices && Array.isArray(this.choices) ) {
        this.tag(this.OBJECT_CLASS, {choices: this.choices});
        /*
         * NOTE:
         * Displays the first choice on init.
         * Compensates for both types of choices accepted in ChoicesView.
         */
        if ( ! this.objectClass ) {
          if ( Array.isArray(this.choices[0]) ) {
            this.objectClass = this.choices[0][0];
          } else {
            this.objectClass = this.choices[0];
          }
        }
      } else {
        this.add(this.OBJECT_CLASS);
      }

      this.add(this.DATA);
    }
  ]
});
