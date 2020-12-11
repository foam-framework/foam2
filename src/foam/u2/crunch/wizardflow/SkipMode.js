/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.u2.crunch.wizardflow',
  name: 'SkipMode',
  values: [
    {
      name: 'HIDE',
      label: 'hide',
      documentation: `
        Hides all wizardlets that are PENDING or GRANTED
      `
    },
    {
      name: 'SHOW',
      label: 'show',
      documentation: `
        Shows all wizardlets regardless of PENDING or GRANTED and starts at the
        first-indexed wizard regardless of status
      `
    },
    {
      name: 'SKIP',
      label: 'skip',
      documentation: `
        Show all wizardlets regardless of PENDING or GRANTED and starts at the
        first wizard that is NOT PENDING or GRANTED
      `
    }
  ]
});
