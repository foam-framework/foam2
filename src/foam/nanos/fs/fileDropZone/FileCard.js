/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.fs.fileDropZone',
  name: 'FileCard',
  extends: 'foam.u2.View',

  documentation: 'Card based on SME Design',

  requires: [
    'foam.blob.BlobBlob',
    'foam.nanos.fs.File'
  ],

  imports: [
    'allowRemoval',
    'removeFile',
    'highlight'
  ],

  exports: [
    'as fileCard'
  ],

  css: `
    ^ {
      display: flex;
      flex-direction: row;
      width: 100%;
      height: 40px;
      margin-top: 8px;
      border: 1px solid #e2e2e3;
      border-radius: 3px;
      box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.16);
      box-sizing: border-box;
      padding: 10px 16px;

      -webkit-transition: all .15s ease-in-out;
      -moz-transition: all .15s ease-in-out;
      -ms-transition: all .15s ease-in-out;
      -o-transition: all .15s ease-in-out;
      transition: all .15s ease-in-out;
    }

    ^:first-child {
      margin-top: 0;
    }

    ^ img {
      /*TODO: Remove this important once Action button CSS is fixed*/
      margin-right: 0px !important;
      width: 16px;
      height: 16px;
    }

    ^name {
      cursor: pointer;
      margin: 0;
      font-size: 14px;
      color: /*%BLACK%*/ #1e1f21;
      line-height: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    ^name:hover {
      color: #604AFF;
    }

    ^ .foam-u2-ActionView {
      border: none !important;
      background: none !important;
      box-shadow: none !important;
      border: none;
      box-shadow: none;
      width: auto;
      height: 16px;
      padding: 0;
      margin-left: auto;
    }

    ^close-action {
      margin-left: auto;
      padding: 0;
    }

    ^close-action:focus {
      /*TODO: Remove this important once Action button CSS is fixed*/
      border: 1px solid /*%PRIMARY1%*/ #406DEA !important;
    }

    ^close-action span {
      display: none;
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'canBeRemoved',
      value: true
    },
    {
      name: 'index'
    },
    {
      name: 'selected'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      if ( this.selected == this.index ) {
        this.style({
          "border-color": "/*%PRIMARY1%*/ #604aff"
        })
      }
      this.addClass(this.myClass())
        .start({ class: 'foam.u2.tag.Image', data: 'images/attach-icon.svg' }).end()
        .start('p').addClass(this.myClass('name'))
          .add(this.data.filename)
          .on('click', this.viewFile)
        .end()
        .start(this.REMOVE_FILE_X, {
          buttonStyle: foam.u2.ButtonStyle.TERTIARY,
          icon: 'images/cancel-x.png'
        }).show(this.allowRemoval && this.canBeRemoved).addClass(this.myClass('close-action')).end();

      this.on('click', this.pick);
    }
  ],

  actions: [
    {
      name: 'removeFileX',
      icon: 'images/cancel-x.png',
      code: function(X) {
        X.removeFile(X.fileCard.index);
      }
    }
  ],

  listeners: [
    {
      name: 'viewFile',
      code: function() {
        var blob = this.data.data;
        if ( this.BlobBlob.isInstance(blob) ) {
          window.open(URL.createObjectURL(blob.blob));
        } else {
          var url = this.data.address;
          window.open(url);
        }
      }
    },
    {
      name: 'pick',
      code: function(X) {
        this.highlight(this.index);
      }
    }
  ]
});
