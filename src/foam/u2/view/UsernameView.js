/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'UsernameView',
  extends: 'foam.u2.View',

  documentation: 'A TextField view for checking username availability.',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'usernameService'
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
      margin-right: 18px;
      margin-top: 14px;
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
      name: 'userNameAvailable',
      documentation: `Binded property used to display failed username availability validation error`
    },
    {
      class: 'Boolean',
      name: 'showIcon',
      documentation: `Boolean toggle for displaying availability checkmark icon.`,
      value: false
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
          onKey: this.onKey
        })
          .addClass(this.myClass('input'))
          .attr('name', this.fromPropertyName + 'Input')
          .on('blur', this.checkUsername )
          .on('input', (e) => {
            this.userNameAvailable = true;
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
    function checkUsername() {
      this.usernameService.checkAvailability(this, this.data)
        .then(( isAvailable ) => {
          this.userNameAvailable = isAvailable;
          this.showIcon = isAvailable;
        })
    }
  ]
})