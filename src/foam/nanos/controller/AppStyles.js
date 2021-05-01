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
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      letter-spacing: 0.2px;
      color: #373a3c;
      background: /*%GREY5%*/ #f5f7fa;
      margin: 0;
    }

    /* TYPOGRAPHY */ 
    h1{
      font-style: normal;
      font-weight: 700;
      font-size: 35px;
      line-height: 40px;
      margin: 0;
    }
    h2{
      font-style: normal;
      font-weight: 600;
      font-size: 29px;
      line-height: 32px;
      margin: 0;
    }
    h3{
      font-style: normal;
      font-weight: 600;
      font-size: 24px;
      line-height: 28px;
      margin: 0;
    }
    h4{
      font-style: normal;
      font-weight: 600;
      font-size: 20px;
      line-height: 24px;
      margin: 0;
    }
    h5{
      font-style: normal;
      font-weight: 600;
      font-size: 16px;
      line-height: 20px;
      margin: 0;
    }
    h6{
      font-style: normal;
      font-weight: 600;
      font-size: 14px;
      line-height: 18px;
      margin: 0;
    }
    p {
      font-style: normal;
      font-weight: normal;
      font-size: 14px;
      line-height: 24px;
      margin: 0;
    }
    p.large {
      font-size: 18px;
      line-height: 32px;
      margin: 0;
    }
    p.semiBold{
      font-style: normal;
      font-weight: 600;
      margin: 0;
    }
    p.bold{
      font-style: normal;
      font-weight: 700;
    }
    p.legalText{
      font-style: normal;
      font-weight: normal;
      font-size: 11px;
      line-height: 14px;
    }
    p.label{
      font-style: normal;
      font-weight: 500;
      font-size: 11px;
      line-height: 14px;
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
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
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
