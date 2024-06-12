/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'TextInputCSS',
  extends: 'foam.u2.CSS',

  documentation: `
    A CSS axiom for text-based inputs such as normal text inputs, date & time
    inputs, selects, and number inputs. We didn't put this directly on
    foam.u2.Input because other inputs that extend that model such as checkbox
    and radio inputs aren't text-based and therefore the styles don't make sense
    for them.
  `,

  properties: [
    {
      name: 'code',
      value: `
        ^ {
          min-width: 64px;
          height: /*%INPUTHEIGHT%*/ 34px;
          font-size: 14px;
          padding-left: /*%INPUTHORIZONTALPADDING%*/ 8px;
          padding-right: /*%INPUTHORIZONTALPADDING%*/ 8px;
          border: 1px solid;
          border-radius: 3px;
          color: /*%BLACK%*/ #1e1f21;
          background-color: white;
          border-color: /*%GREY3%*/ #cbcfd4;
        }

        ^:hover {
          border-color: /*%GREY2%*/ #9ba1a6;
        }

        ^:hover::placeholder,
        ^:hover:-ms-input-placeholder,
        ^:hover::-ms-input-placeholder {
          color: /*%GREY2%*/ #9ba1a6;
        }

        ^:focus {
          outline: none;
          border-color: /*%PRIMARY3%*/ #406dea;
        }

        ^:disabled {
          color: /*%GREY1%*/ #5e6061;
          background-color: /*%GREY5%*/ #f5f7fa;
          border-color: /*%GREY3%*/ #cbcfd4;
        }

        ^.error {
          color: /*%DESTRUCTIVE3%*/ #d9170e;
          background-color: /*%DESTRUCTIVE5%*/ #fbedec;
          border-color: /*%DESTRUCTIVE3%*/ #d9170e;
        }
      `,
    },
  ],
});
