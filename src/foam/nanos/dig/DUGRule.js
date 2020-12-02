/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig',
  name: 'DUGRule',
  extends: 'foam.nanos.ruler.Rule',

  requires: [
    'foam.nanos.http.Format'
  ],

  tableColumns: [
    'name',
    'url',
    'daoKey',
    'format'
  ],

  searchColumns: [
    'name',
    'url',
    'enabled',
    'daoKey',
    'operation'
  ],

  sections: [
    {
      name: 'basicInfo',
      permissionRequired: true
    },
    {
      name: '_defaultSection',
      permissionRequired: true
    },
    {
      name: 'dugInfo',
      order: 10
    }
  ],

  properties: [
    {
      name: 'id',
      hidden: true
    },
    {
      name: 'documentation',
      hidden: true
    },
    {
      class: 'String',
      name: 'name',
      section: 'dugInfo',
      tableWidth: 250
    },
    {
      name: 'daoKey',
      label: 'DAO',
      section: 'dugInfo',
      tableWidth: 150,
      view: function(_, X) {
        var E = foam.mlang.Expressions.create();
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          sections: [
            {
              heading: 'DAO',
              dao: X.AuthenticatedNSpecDAO
                .where(E.AND(
                  E.EQ(foam.nanos.boot.NSpec.SERVE, true),
                  E.ENDS_WITH(foam.nanos.boot.NSpec.ID, 'DAO')
                ))
                .orderBy(foam.nanos.boot.NSpec.ID)
            }
          ]
        };
      }
    },
    {
      name: 'ruleGroup',
      value: 'DUG',
      hidden: true
    },
    {
      name: 'priority',
      hidden: true
    },
    {
      class: 'URL',
      name: 'url',
      label: 'URL',
      section: 'dugInfo'
    },
    {
      class: 'String',
      name: 'bearerToken',
      section: 'dugInfo'
    },
    {
      class: 'foam.core.Enum',
      of: 'foam.nanos.http.Format',
      name: 'format',
      value: foam.nanos.http.Format.JSON,
      tableWidth: 100,
      section: 'dugInfo',
      readVisibility: 'HIDDEN',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          ['JSON', 'JSON'],
          ['XML',  'XML']
        ],
        placeholder: '--'
      },
    },
    {
      name: 'enabled',
      value: true,
      section: 'basicInfo'
    },
    {
      name: 'action',
      hidden: true,
      section: 'basicInfo',
      networkTransient: true
    },
    {
      name: 'asyncAction',
      section: 'dugInfo',
      view: { class: 'foam.u2.tag.TextArea' },
      javaGetter: `
        DUGRuleAction action = new DUGRuleAction();
        action.setUrl(getUrl());
        action.setBearerToken(getBearerToken());
        action.setFormat(getFormat());
        return action;
      `
    },
    {
      name: 'after',
      value: true,
      section: 'basicInfo',
      hidden: true
    },
    {
      name: 'predicate',
      hidden: true,
      section: 'basicInfo',
      // FIX ME: Currently the front end does not load this correctly, causing incorrect values to be saved with each update.
      networkTransient: true
    },
    {
      name: 'validity',
      hidden: true
    },
    {
      name: 'saveHistory',
      hidden: true
    },
    {
      name: 'operation',
      hidden: true,
      value: 'CREATE_OR_UPDATE'
    },
    {
      name: 'debug',
      hidden: true
    },
    {
      name: 'lifecycleState',
      hidden: true
    },
    {
      name: 'createdByAgent',
      hidden: true
    }
  ]
});
