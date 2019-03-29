/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'Dialog',
  extends: 'foam.u2.Element',

  documentation: `This class is a basic dialog container: it has a heading,
    a body, and a set of actions. Generally, use
    $$DOC{ref:"foam.u2.EasyDialog"} to easily handle simple cases. For
    more complex cases, you can put any Element you like into a
    $$DOC{ref:"foam.u2.ModalOverlay"}.`,

  requires: [
    'Action'
  ],

  imports: [
    'overlay'
  ],

  properties: [
    'title',
    'body',
    {
      type: 'Array',
      name: 'buttons',
      documentation: `An array of buttons. Each is a [function, label] pair
        or an Action. These will be displayed in <em>reverse</em> order
        as MD buttons at the bottom of the dialog. The default is a
        single "OK" button that closes the dialog.`,
      factory: function() {
        return [[function() { this.overlay.close(); }.bind(this), 'OK']];
      },
      adapt: function(old, nu) {
        if ( nu ) {
          for ( var i = 0 ; i < nu.length ; i++ ) {
            if ( ! this.Action.isInstance(nu[i]) ) {
              nu[i] = this.Action.create({
                name:  nu[i][1],
                label: nu[i][1],
                code:  nu[i][0]
              });
            }
          }
        }
        return nu;
      }
    },
    {
      class: 'Boolean',
      name: 'padding',
      documetation: 'Controls the padding inside the dialog.',
      attribute: true,
      value: true
    },
  ],

  methods: [
    function initE() {
      this.SUPER();

      this.addClass(this.myClass());
      if ( this.title ) {
        this.start()
          .addClass(this.myClass('header'))
          .enableClass(this.myClass('padding'), this.padding$)
          .add(this.title)
        .end();
      }
      this.start()
        .addClass(this.myClass('body'))
        .enableClass(this.myClass('padding'), this.padding$)
        .add(this.body)
      .end();

      this.start().addClass(this.myClass('buttons')).add(this.buttons).end();
    }
  ],

  css: `
    ^ {
      background-color: #fff;
      display: block;
      margin: 10px;
      overflow: hidden;
    }
    ^header {
      font-size: 20px;
      font-weight: 500;
    }
    ^padding {
      margin: 24px;
    }
    ^buttons {
      display: flex;
      flex-direction: row-reverse;
    }
  `
});
