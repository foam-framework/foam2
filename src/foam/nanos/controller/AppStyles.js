/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.controller',
  name: 'AppStyles',
  extends: 'foam.u2.View',

  documentation: 'Generic CSS that can be included into the top level controller of foam app. Implement to foam class to use.',

  css: `
    body {
      font-family: 'Roboto', sans-serif;
      font-size: 14px;
      letter-spacing: 0.2px;
      color: #373a3c;
      background: #edf0f5;
      margin: 0;
    }
    table.foam-u2-view-TableView {
      border-collapse: collapse;
      border-style: hidden;
      margin: auto;
      width: 962px;
    }
    .foam-u2-view-TableView thead > tr > th {
      color: #2b2b2b;
      border-spacing: 0;
      text-align: left;
      padding-left: 15px;
      height: 40px;
      font-family: 'Roboto';
      font-size: 14px;
      font-style: normal;
      font-stretch: normal;
      font-weight: 900;
      line-height: 1.5;
      letter-spacing: 0.4px;
      background: transparent;
    }
    .foam-u2-view-TableView-row > th > td {
      font-size: 12px;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
      padding-left: 15px;
      height: 60px;
    }
    .foam-u2-view-TableView th {
      font-family: 'Roboto';
      padding-left: 15px;
      font-size: 14px;
      line-height: 1;
      letter-spacing: 0.4px;
      color: #093649;
    }
    .foam-u2-view-TableView td {
      font-family: 'Roboto';
      font-size: 12px;
      line-height: 1.33;
      letter-spacing: 0.2px;
      padding-left: 15px;
      font-size: 12px;
      color: #093649;
    }
    .foam-u2-view-TableView-row {
      height: 60px;
      background: white;
    }
    .New {
      width: 35px;
      height: 20px;
      border-radius: 100px;
      background-color: #eedb5f;
    }
    .Updated {
      width: 60px;
      height: 20px;
      border-radius: 100px;
      background-color: #093649;
    }
    .Open {
      width: 49px;
      height: 20px;
      border-radius: 100px;
      background-color: #ee5f71;
    }
    .Pending {
      width: 55px;
      height: 20px;
      border-radius: 100px;
      background-color: #59a5d5;
    }
    .Solved {
      width: 50px;
      height: 20px;
      border-radius: 100px;
      background-color: #a4b3b8;
    }
    ^ .generic-status {
      display: inline-block;
      font-family: Roboto;
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.67;
      letter-spacing: 0.2px;
      text-align: center;
      color: #ffffff;
    }
    textarea:focus{
      outline: none;
    }
    input:focus{
      outline: none;
    }
  `
});
