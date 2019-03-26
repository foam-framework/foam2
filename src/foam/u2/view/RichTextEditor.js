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
  
    exports: [
     'document'
    ],
  
    css: `
     ^ .foam-flow-Document {
       width: 600px;
       margin: 0px;
       background-color: #ffffff;
       border-radius: 4px;
       box-shadow: inset 0 0 1px 0 rgba(0, 0, 0, 0.5);
     }
  
     .richtext-actions {
        -webkit-align-items: center;
        align-items: center;
        border: none;
        -webkit-border-radius: 2px;
        border-radius: 2px;
        -webkit-box-shadow: 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12), 0 2px 4px -1px rgba(0,0,0,0.2);
        box-shadow: 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12), 0 2px 4px -1px rgba(0,0,0,0.2);
        display: -webkit-inline-box;
        display: -webkit-inline-flex;
        display: -ms-inline-flexbox;
        display: inline-flex;
        margin: 16px;
        padding: 8px 2px;
        white-space: nowrap;
  
        /* Firefox */
        display: -moz-box;
        -moz-box-pack: center;
        -moz-box-align: center;
  
        /* Safari and Chrome */
        display: -webkit-box;
        -webkit-box-pack: center;
        -webkit-box-align: center;
  
        /* W3C */
        display: box;
        box-pack: center;
        box-align: center;
      }
  
      .iframeContainer {
        background: white;
        width: 100%;
        border: none;
        margin: 0;
      }
  
      .richtext-button {
        width: auto;
        height: 40px;
        border-radius: 4px;
        text-align: center;
        display: inline-block;
        font-size: 14px;
        background: none !important;
        color: #373a3c !important;
        padding: 16px;
      }
      
      .richtext-button:hover {
        background: #f0f0f0 !important;
      }
  
      .dropdown-content {
        position: absolute;
        background-color: #f0f0f0;
        min-width: 50px;
        min-height: 50px;
        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
        z-index: 1;
      }
  
      /* Links inside the dropdown */
      .dropdown-content a {
        color: black;
        padding: 12px 16px;
        text-decoration: none;
        display: block;
      }
  
      /* Change color of dropdown links on hover */
      .dropdown-content a:hover {background-color: #ddd}    
    `,
  
    properties: [
      // {
      //   name: 'document'
      // },
      {
        class: 'Boolean',
        name: 'onKey',
        attribute: true
      },
      {
        name: 'frame',
        // postSet: function (_, n) {
        //   var self = this;
        //   n.onload.sub(function () {
        //     self.document = n.el().contentDocument;
  
        //     n.el().contentDocument.body.style.whiteSpace = 'pre-wrap';
        //     n.el().contentDocument.head.insertAdjacentHTML(
        //       'afterbegin',
        //       '<style>blockquote{border-left-color:#fff;border-left-style:none;padding-left:1ex;}</style>');
        //     n.el().contentDocument.body.style.overflow = 'auto';
        //     n.el().contentDocument.body.style.margin = '5px';
        //     n.el().contentDocument.body.contentEditable = true;
        //     n.el().contentDocument.body.insertAdjacentHTML('beforeend', self.data);
        //     n.el().contentDocument.body.addEventListener('input', function () {
        //       self.data = n.el().contentDocument.body.innerHTML;
        //     }, false);
  
        //   });
        // }
      },
    ],
  
    methods: [
      function initE() {
        this.SUPER();
        this
            .start('div').addClass('foam-flow-Document')
            .start('div', null, this.frame$).addClass('iframeContainer')
            .attrs({
                id: 'frame',
                contenteditable: true,
            })
            .end()
            
            .start(this.ToolBar,{}).end()
          .end();
      },
    ],
  });
  