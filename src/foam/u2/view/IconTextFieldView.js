/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'IconTextFieldView',
  extends: 'foam.u2.View',

  documentation: 'A TextField with an icon attached.',

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
      margin-left: 10px;
      margin-top: 14px;
    }
    ^input {
      padding-left: 32px !important;
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
    // Set 'focused_' instead of focused
    // so that the inner TextField
    // can get the focus instead of this wrapper.
    {
      name: 'focused',
      setter: function(f) {
        this.focused_ = f;
      }
    },
    'focused_'
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
        .end()
        .start(this.TextField, {
          type: this.type,
          data$: this.data$,
          placeholder: this.placeholder,
          onKey: this.onKey,
          focused: this.focused_
        })
          .addClass(this.myClass('input'))
          .attr('name', this.fromPropertyName + 'Input')
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
  ]
})
