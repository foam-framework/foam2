/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'UserPropertyAvailabilityView',
  extends: 'foam.u2.View',

  documentation: 
    'A TextField view that supports availability checks on specified User model property values (ie. Username/Email).',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'userPropertyAvailabilityService'
  ],

  requires: [
    'foam.u2.TextField'
  ],

  css: `
    ^ {
      position: relative;
    }

    ^icon {
      height: 14px;
      width: 14px;
      position: absolute;
      right: 0;
      margin-right: 11px;
      margin-top: 11px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'icon'
    },
    {
      class: 'Boolean',
      name: 'onKey'
    },
    {
      class: 'String',
      name: 'fromPropertyName'
    },
    {
      class: 'Boolean',
      name: 'isAvailable',
      documentation: `Binded property used for validation outside of view.`
    },
    {
      class: 'Boolean',
      name: 'showIcon',
      documentation: `Boolean toggle for displaying availability checkmark icon.`,
      value: false
    },
    {
      type: 'Regex',
      name: 'inputValidation',
      documentation: `Optional regular expression used to prevent invalid inputs from making network calls.`
    },
    {
      type: 'Regex',
      name: 'restrictedCharacters',
      documentation: `Optional regular expression used to prevent restricted characters from being typed.`
    },
    {
      class: 'Enum',
      of: 'foam.u2.DisplayMode',
      name: 'displayMode',
      value: foam.u2.DisplayMode.RW
    }
  ],

  methods: [
    function initE() {
      this.start()
        .addClass(this.myClass())
        .start({
          class: 'foam.u2.tag.Image',
          data: this.icon
        })
          .addClass(this.myClass('icon'))
          .attr('name', this.fromPropertyName + 'Icon')
          .show(this.showIcon$)
        .end()
        .start(this.TextField, {
          type: this.type,
          data$: this.data$,
          placeholder: this.placeholder,
          onKey: this.onKey,
          mode: this.displayMode
        })
          .addClass(this.myClass('input'))
          .attr('name', this.fromPropertyName + 'Input')
          .on('blur', this.checkAvailability )
          .on('keypress', (e) => {
            if ( this.restrictedCharacters && ! this.restrictedCharacters.test(e.key) ) {
              e.preventDefault();
            }
            this.isAvailable = true;
            this.showIcon = false;
          })
        .end()
      .end();
    },

    function fromProperty(prop) {
      this.SUPER(prop);
      if ( ! this.placeholder && prop.placeholder ) {
        this.placeholder = prop.placeholder;
      }
      if ( ! this.type && prop.type) {
        this.type = prop.type;
      }
      this.fromPropertyName = prop.name;
    }
  ],

  listeners: [
    function checkAvailability() {
      if ( this.inputValidation && ! this.inputValidation.test(this.data) ) {
        this.showIcon = false;
        return;
      }

      this.userPropertyAvailabilityService.checkAvailability(this, this.fromPropertyName, this.data)
        .then(( isAvailable ) => {
          this.isAvailable = isAvailable;
          this.showIcon = isAvailable;
        });
    }
  ]
})