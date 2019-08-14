/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
    package: 'foam.u2.view',
    name: 'RichTextEditor',
    extends: 'foam.u2.View',
  
    requires: [
      'foam.u2.texteditor.ToolBar',
    ],
  
    css: `
      ^textarea {
        min-height: 200px;
        margin: 16px;
        padding: 8px 2px;
        background-color: #ffffff;
        border-radius: 4px;
        box-shadow: inset 0 0 1px 0 rgba(0, 0, 0, 0.5);
      }
    `,
  
    methods: [
      function initE() {
        this.SUPER();
        this
            .start('div')
            .start('div').addClass(this.myClass('textarea'))
              .attrs({
                  contenteditable: true,
              })
            .end()
            .start(this.ToolBar,{}).end()
          .end();
      },
    ],
  });
  