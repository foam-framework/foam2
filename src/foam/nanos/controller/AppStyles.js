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
      font-family: Roboto, 'Helvetica Neue', helvetica, sans-serif;
      font-size: 14px;
      letter-spacing: 0.2px;
      color: #373a3c;
      background: /*%GREY5%*/ #f5f7fa;
      margin: 0;
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
      background-color: /*%BLACK%*/ #1e1f21;
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
      font-family: Roboto, 'Helvetica Neue', helvetica, sans-serif;
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
    .horizontal-flip {
    -moz-transform: scale(-1, 1);
    -webkit-transform: scale(-1, 1);
    -o-transform: scale(-1, 1);
    -ms-transform: scale(-1, 1);
    transform: scale(-1, 1);
    margin-right: 10px;
  }
  .inline-block {
    display: inline-block;
  }

  `
});
