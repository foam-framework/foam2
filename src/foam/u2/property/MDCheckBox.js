/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


foam.CLASS({
  package: 'foam.u2.property',
  name: 'MDCheckBox',
  extends: 'foam.u2.tag.Input',

  css: `
    ^ {
    order: 1;
      padding: 0px !important;

      -webkit-appearance: none;
      border-radius: 2px;
      border: solid 2px #5a5a5a;
      box-sizing: border-box;
      display: inline-block;
      fill: rgba(0, 0, 0, 0);

      height: 18px;
      width: 18px;

      opacity: 1;
      width: 3rem;
      height: 3rem;

      transition: background-color 140ms, border-color 140ms;
    }

    ^:hover {
      cursor: pointer;
    }

    ^:checked {
      background-color: /*%BLACK%*/ #1e1f21;
      border-color: /*%BLACK%*/ #1e1f21;
      fill: white;
    }

    ^:focus {
      outline:0;
    }

    ^ .label-container {
      margin-top: 9px;
      color: #999;
    }
   `,

   properties: [
     {
       class: 'Boolean',
       name: 'data'
     },
     {
       class: 'Boolean',
       name: 'showLabel',
       factory: function() { return this.label || this.labelFormatter },
     },
     {
       class: 'String',
       name: 'label'
     },
     {
       name: 'labelFormatter'
     }
   ],

   methods: [
    function initE() {
      this.SUPER();
      this.setAttribute('type', 'checkbox');
      this.addClass(this.myClass())
        .on('click', function() {
           if ( this.getAttribute('disabled') ) return;
           this.data = ! this.data;
         }.bind(this));
      var self = this;

      this.start('div')
        .addClass('label-container')
        .add(this.label$)
      .end();
    },

    function updateMode_(mode) {
     var disabled = mode === foam.u2.DisplayMode.RO ||
                    mode === foam.u2.DisplayMode.DISABLED;
     this.setAttribute('disabled', disabled);
    },

    function link() {
     this.data$.linkTo(this.attrSlot('checked'));
    }
    ]
  });
