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
    ^tr {
      background: white;
      border-left: 1px solid /*%GREY4%*/ #e7eaec;
      border-right: 1px solid /*%GREY4%*/ #e7eaec;
      border-bottom: 1px solid /*%GREY4%*/ #e7eaec;
      display: flex;
      height: 48px;
    }

    ^tbody > ^tr:hover {
      background: /*%GREY5%*/ #f5f7fa;
      cursor: pointer;
    }

    ^thead {
      border-radius: 5px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
      overflow: hidden;
      position: sticky;
      top: 0;
    }

    ^td,
    ^th {
      align-items: center;
      box-sizing: border-box;
      color: /*%BLACK%*/ #1e1f21;
      display: flex;
      font-family: Roboto, 'Helvetica Neue', helvetica, sans-serif;
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
