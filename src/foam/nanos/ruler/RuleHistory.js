/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler',
  name: 'RuleHistory',
  documentation: 'Represents rule execution history.',

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.LastModifiedAware'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      visibility: 'RO'
    },
    {
      class: 'DateTime',
      name: 'created',
      documentation: 'Creation date.'
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      documentation: 'Last modified date.'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.ruler.Rule',
      name: 'ruleId',
      documentation: 'The applied rule.'
    },
    {
      class: 'Object',
      name: 'objectId',
      visibility: 'RO',
      documentation: 'Id of the object on which rule is applied.'
    },
    {
      class: 'String',
      name: 'objectDaoKey',
      visibility: 'RO',
      documentation: 'DAO name of the object'
    },
    {
      class: 'Object',
      name: 'result',
      documentation: 'Result of rule execution.',
      tableCellFormatter: function (value) {
        if ( !!value ) {
          this.add(value.toString());
        }
      },
      view: function (_, X) {
        return {
          class: 'foam.u2.TextField',
          mode: foam.u2.DisplayMode.RO,
          data$: X.data.result$.map(result => { return result ? result : ''; })
        };
      }
    },
    {
      class: 'DateTime',
      name: 'expirationDate',
      documentation: 'Expiration date to be rescheduled.'
    },
    {
      class: 'Enum',
      of: 'foam.nanos.ruler.RuleHistoryStatus',
      name: 'status',
      documentation: 'Rule history status.'
    },
    {
      class: 'String',
      name: 'note',
      documentation: 'Note appended to the rule history.',
      view: {
        class: 'foam.u2.tag.TextArea',
        rows: 20, cols: 80
      }
    }
  ]
});
