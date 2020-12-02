/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.flow.widgets',
  name: 'DocumentationIncomplete',
  extends: 'foam.u2.Element',

  css: `
    ^ {
      padding: 10pt;
    }
    ^ > .cautionTape {
      background-color: #e6e600;
      padding: 8pt;
      /*
        transform: rotateZ(-4deg);

        it was a fun idea, but not practical as it will overlap
        other text at certain widths.
      */
      font-size: 14pt;
      text-align: center;
      pointer-events: none;
      opacity: 0.9;
    }
  `,

  properties: [
    {
      name: 'status',
      class: 'String'
    },
    {
      name: 'isSection',
      class: 'Boolean'
    },
    {
      name: 'message',
      class: 'String',
      expression: function (status, isSection) {
        return 'This '
          + (isSection ? 'section' : 'documentation') + ' '
          + (status == 'todo'
            ? 'has not been written yet'
            : 'is incomplete'
          )
          + '.'
          ;
      }
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start()
          .addClass('cautionTape')
          .add(this.message$)
        .end()
        ;
    }
  ],
});
