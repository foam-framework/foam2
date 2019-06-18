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
          color: %INPUTTEXTCOLOR%;
          background-color: %INPUTBACKGROUNDCOLOR%;
          border-color: %INPUTBORDERCOLOR%;
        }

        ^:hover {
          background-color: %INPUTHOVERBACKGROUNDCOLOR%;
          border-color: %INPUTHOVERBORDERCOLOR%;
        }

        ^:hover::placeholder,
        ^:hover:-ms-input-placeholder,
        ^:hover::-ms-input-placeholder {
          color: %INPUTHOVERTEXTCOLOR%;
        }

        ^:focus {
          outline: none;
          border-color: %SECONDARYCOLOR%;
        }

        ^:disabled {
          color: %INPUTDISABLEDTEXTCOLOR%;
          background-color: %INPUTDISABLEDBACKGROUNDCOLOR%;
          border-color: %INPUTDISABLEDBORDERCOLOR%;
        }

        ^.error {
          color: %INPUTERRORTEXTCOLOR%;
          background-color: %INPUTERRORBACKGROUNDCOLOR%;
          border-color: %INPUTERRORBORDERCOLOR%;
        }
      `,
    },
  ],
});

