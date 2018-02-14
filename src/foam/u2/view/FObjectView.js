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
      postSet: function(oldValue, newValue) {
        if ( newValue !== oldValue ) {
          var m = this.lookup(newValue, true);
          if ( m ) {
            this.data = m.create(this.data);
          }
        }
      }
    },
    {
      name: 'data',
      view: { class: 'foam.u2.DetailView' },
      postSet: function(_, data) {
        if ( ! data ) {
          this.objectClass = '';
        } else if ( data.cls_.id != this.objectClass ) {
          this.objectClass = data.cls_.id;
        }
      }
    },
    'choices'
  ],

  methods: [
    function initE() {
      if ( this.choices && Array.isArray(this.choices) ) {
        this.tag({class: 'foam.u2.view.ChoiceView', choices: this.choices, data$: this.objectClass$});
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
