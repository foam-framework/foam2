/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


foam.CLASS({
  package: 'foam.u2.property',
  name: 'MDRichSelect',
  extends: 'foam.u2.property.MDSelect',

  documentation: `
    MD view for  RichChoiceView
  `,

  properties: [
    {
      name: 'sections',
      postSet: function(old, nu) {
      var self = this;
        nu.forEach(function(section) {
          section.dao.select(obj => {
            self.choices.push([obj.id, obj.toSummary()]);
          });
        });
      },
    }
  ]
});