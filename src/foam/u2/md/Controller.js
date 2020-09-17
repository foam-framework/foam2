/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.md',
  name: 'Controller',
  extends: 'foam.nanos.controller.ApplicationController',

  requires: [
    'foam.u2.dao.MDBrowserListView',
    'foam.nanos.mobile.ui.AppStyles'
  ],

  css: `
    body {
      overflow: hidden;
    }

    ^ .foam-u2-ActionView {
      border: none !important;
    }
    ^ .foam-u2-ActionView:hover {
      background-color: unset !important;
    }

    ^ .foam-u2-layout-MDToolbarView {
//      background-color: /*%PRIMARY1%*/;
//      box-shadow: 0px 0px 50px 0px blue;
      font-size: 3.5rem;
      height: 10rem;
      z-index: 99;
    }

    ^toolbar {
      flex-grow: 1;
    }

    ^ toolbar .right {
      padding-right: 3rem;
//      width: -webkit-fill-available;
    }

    ^ toolbar .left i {
      padding-left: 3rem;
    }

    ^ toolbar .title {
      padding-left: 4rem;
      font-weight: 500;
      font-size: 3.5rem;
      width: 100%;
    }

    ^ toolbar .right span {
      width: 100%;
    }

    ^ toolbar .foam-u2-ActionView {
      background-color: unset;
      font-size: 4rem;
    }

    ^ .foam-u2-layout-MDRowView {
      padding: 3rem;
    }
    ^ .foam-u2-stack-StackView {
      margin-top: 10rem;
      height: 100rem;
    }
    ^ .foam-nanos-menu-SubMenuView-inner > div {
      position: unset;
    }

    ^ .foam-u2-view-LoginView .centerVertical {
        max-width: 100%;
        font-size: 2rem;
        padding: 8rem;
        padding-top: 10rem;
    }

    ^ .foam-u2-view-LoginView .foam-u2-detail-VerticalDetailView {
      padding-top: 4rem;
      width: 40rem;
        padding-bottom: 4rem;
    }

    ^ .foam-u2-view-LoginView .foam-u2-TextField {
      height: 5rem;
    }
    ^ .foam-u2-LoginView .foam-u2-layout-Rows m3 {
      font-size: 4rem;
    }
    ^ .foam-u2-LoginView .foam-u2-layout-Cols > button {
        font-size: 2rem;
        width: 25rem;
        padding: 2rem;
        margin: auto;
      }
  `,

  methods: [
    async function initE() {

     await this.clientPromise;
     await this.fetchTheme();

     await this.themeInstalled;
     this.__subContext__.register(this.MDBrowserListView, 'foam.comics.v2.DAOBrowseControllerView');
     this.__subContext__.register(this.MDBrowserListView, 'foam.comics.BrowserView');

     this
      .addClass(this.myClass())
      .start()
        .addClass('stack-wrapper')
        .enableClass('login-stack', this.loginSuccess$.map( ls => ! ls ))
        .tag({
          class: 'foam.u2.stack.StackView',
          data: this.stack,
          showActions: false
        })
      .end();
    }
  ]
});
