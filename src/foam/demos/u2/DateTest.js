/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'DateTest',

  properties: [
    {
      class: 'Date',
      name: 'date'
    },
    {
      class: 'Date',
      name: 'datePicker',
      view: 'foam.u2.property.MDDateField'
    }
  ]
});

var d = DateTest.create();
foam.u2.DetailView.create({ data: d }).write();
foam.u2.DetailView.create({ data: d }).write();
