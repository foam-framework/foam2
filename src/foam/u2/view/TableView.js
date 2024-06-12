/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'TableView',
  extends: 'foam.u2.view.UnstyledTableView',

  css: `
    ^ {
      overflow-x: unset;
      height: 100%;
    }

    ^tbody {
      display: flow-root;
    }

    ^tr {
      background: white;
      display: flex;
      height: 48px;
      justify-content: space-between;
    }

    ^tbody > ^tr {
      border-left: 1px solid /*%GREY4%*/ #e7eaec;
      border-right: 1px solid /*%GREY4%*/ #e7eaec;
      border-bottom: 1px solid /*%GREY4%*/ #e7eaec;
    }

    ^tbody > ^tr:hover {
      background: /*%GREY5%*/ #f5f7fa;
      cursor: pointer;
    }

    ^thead {
      border: 1px solid /*%GREY4%*/ #e7eaec;
      border-radius: 5px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
      overflow: hidden;
      position: sticky;
      top: 0;
      overflow-x: auto;
    }

    ^td,
    ^th {
      align-self: center;
      box-sizing: border-box;
      color: /*%BLACK%*/ #1e1f21;
      display: block;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      overflow: hidden;
      padding-left: 16px;
      text-align: left;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 40px; /* So when the table's width decreases, columns aren't hidden completely */
    }

    ^th {
      font-weight: 900;
    }

    ^th:not(:last-child) > img {
      margin-left: 8px;
    }

    /**
     * OTHER
     */
    ^selected {
      background: /*%PRIMARY5%*/ #e5f1fc;
    }

    ^noselect {
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    ^ .disabled {
      color: #aaa;
    }

    ^td .foam-u2-ActionView {
      padding: 4px 12px;
    }
  `,
});
