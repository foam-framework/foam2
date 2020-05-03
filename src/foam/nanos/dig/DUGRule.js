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
    'format',
    'daoKey',
    'url'
  ],

  searchColumns: [
    'name',
    'url',
    'enabled',
    'daoKey',
    'operation',
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
      section: 'basicInfo'
    },
    {
      name: 'daoKey',
      label: 'DAO',
      section: 'basicInfo'
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
      section: 'basicInfo'
    },
    {
      class: 'String',
      name: 'bearerToken',
      section: 'basicInfo'
    },
    {
      class: 'foam.core.Enum',
      of: 'foam.nanos.http.Format',
      name: 'format',
      value: foam.nanos.http.Format.JSON,
      required: true,
      section: 'basicInfo',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          [2, 'JSON'],
          [4, 'XML'],
        ],
        placeholder: '--',
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
      section: 'basicInfo',
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
      hidden: true,
    },
    {
      name: 'saveHistory',
      hidden: true,
    },
    {
      name: 'operation',
      hidden: true,
      value: 'CREATE_OR_UPDATE'
    }
  ],

});
