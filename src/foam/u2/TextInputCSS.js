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
          height: %INPUTHEIGHT%;
          font-size: 14px;
          padding-left: %INPUTHORIZONTALPADDING%;
          padding-right: %INPUTHORIZONTALPADDING%;
          border: 1px solid;
          border-radius: 3px;
          color: %BLACK%;
          background-color: white;
          border-color: %GREY3%;
        }

        ^:hover {
          border-color: %GREY2%;
        }

        ^:hover::placeholder,
        ^:hover:-ms-input-placeholder,
        ^:hover::-ms-input-placeholder {
          color: %GREY2%;
        }

        ^:focus {
          outline: none;
          border-color: %PRIMARY3%;
        }

        ^:disabled {
          color: %GREY2%;
          background-color: %GREY5%;
          border-color: %GREY3%;
        }

        ^.error {
          color: %DESTRUCTIVE3%;
          background-color: %DESTRUCTIVE5%;
          border-color: %DESTRUCTIVE3%;
        }
      `,
    },
  ],
});

