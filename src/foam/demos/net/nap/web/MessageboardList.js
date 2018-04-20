/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.demos.net.nap.web',
  name: 'MessageboardList',
  extends: 'foam.u2.Controller',

  documentation: '',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.demos.net.nap.web.model.Messageboard'
  ],

  imports: [
     'stack',
     'messageboardDAO'
  ],

  exports: [
    'dblclick'
  ],

  css: `
    ^ {
      width: 1240px;
      margin: 0 auto;
    }
    ^ .searchIcon {
      position: absolute;
      margin-left: 5px;
      margin-top: 8px;
    }
    ^ .filter-search {
      width: 225px;
      height: 40px;
      border-radius: 2px;
      background-color: #ffffff;
      display: inline-block;
      margin: 0;
      margin-bottom: 30px;
      vertical-align: top;
      border: 0;
      box-shadow:none;
      padding: 10px 10px 10px 31px;
      font-size: 14px;
    }
    ^ .inline-float-right {
      float: right;
      display: inline-block;
    }
    ^ .net-nanopay-ui-ActionView-exportButton {
      float: right;
      background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      width: 75px;
      height: 40px;
      cursor: pointer;
      z-index: 100;
      margin-right: 5px;
    }
    ^ .net-nanopay-ui-ActionView-exportButton img {
      margin-right: 5px;
    }
    ^ .net-nanopay-ui-ActionView-addUser {
      background-color: %SECONDARYCOLOR%;
      border: solid 1px %SECONDARYCOLOR%;
      color: white;
      float: right;
    }
    ^ .net-nanopay-ui-ActionView-addUser::after {
      content: ' ';
      position: absolute;
      height: 0;
      width: 0;
      border: 6px solid transparent;
      border-top-color: white;
      transform: translate(5px, 5px);
    }
    ^ .popUpDropDown {
      padding: 0 !important;
      z-index: 10000;
      width: 135px;
      background: white;
      opacity: 1;
      box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.19);
      position: absolute;
    }
    ^ .popUpDropDown > div {
      width: 135px;
      height: 30px;
      font-size: 14px;
      font-weight: 300;
      letter-spacing: 0.2px;
      color: #093649;
      line-height: 30px;
    }
    ^ .popUpDropDown > div:hover {
      background-color: %SECONDARYCOLOR%;
      color: white;
      cursor: pointer;
    }
    ^ table {
      width: 1240px;
    }
    ^ .foam-u2-view-TableView-row:hover {
      cursor: pointer;
      background: %TABLEHOVERCOLOR%;
    }
    ^ .foam-u2-view-TableView-row {
      height: 40px;
    }
  `,

  properties: [
    { name: 'data',
      factory: function() { return this.messageboardDAO; },
      view: {
        class: 'foam.u2.view.ScrollTableView',
        columns: [
          'id', 'title', 'creator', 'createdDate',
        ]
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start()
          .start().addClass('container')
            .start().addClass('button-div')
              .start(this.CREATE_ACTION).end()
            .end()
          .end()
          .start().addClass('container')
          .end()
          .add(this.DATA)
          .tag({ class: 'net.nanopay.ui.Placeholder', dao: this.messageboardDAO, message: this.placeholderText, image: 'images/person.svg'})
        .end();
    },
    function dblclick(obj) {  //messageboard
      //this.stack.push({ class: 'foam.demos.net.nap.web.MessageboardForm', data: messageboard });
      this.stack.push(this.EditMessageboardView.create({ data: this.data }));
    }
  ],

  actions: [
    {
      name: 'createAction',
      label: 'Create',
      code: function(X) {
        var self = this;

        this.stack.push({ class: 'foam.demos.net.nap.web.MessageboardForm' });
      }
    }
  ]
});
