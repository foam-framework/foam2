/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.md',
  name: 'CheckBox',
  extends: 'foam.u2.CheckBox',

  axioms: [
    foam.u2.CSS.create({
      code: `
        ^ {
          padding: 0px !important;

          -webkit-appearance: none;
          border-radius: 2px;
          border: solid 2px #5a5a5a;
          box-sizing: border-box;
          display: inline-block;
          fill: rgba(0, 0, 0, 0);

          height: 18px;
          width: 18px;

          opacity: 1;

          transition: background-color 140ms, border-color 140ms;
        }

        ^:checked {
          background-color: #093649;
          border-color: #093649;
          fill: white;
        }

        ^:checked:after {
          content: url(data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%2048%2048%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2215%22%20height%3D%2215%22%20version%3D%221.1%22%3E%0A%20%20%20%3Cpath%20fill%3D%22white%22%20stroke-width%3D%223%22%20d%3D%22M18%2032.34L9.66%2024l-2.83%202.83L18%2038l24-24-2.83-2.83z%22/%3E%0A%3C/svg%3E);
        }

        ^:focus {
          outline:0;
        }

        ^label {
          margin-top: 9px;
          position: absolute;
        }
      `
    })
  ]
});
