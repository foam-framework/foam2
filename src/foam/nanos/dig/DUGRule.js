foam.CLASS({
  package: 'foam.nanos.dig',
  name: 'DUGRule',
  extends: 'foam.nanos.ruler.Rule',

  requires: [
    'foam.nanos.http.Format'
  ],

 tableColumns: [
    'id',
    'documentation',
    'enabled',
    'priority',
    'daoKey',
    'operation',
  ],

  searchColumns: [
    'id',
    'url',
    'enabled',
    'priority',
    'daoKey',
    'operation',
    'after',
    'validity'
  ],

  properties: [
    {
      name: 'id',
      visibility: 'RW'
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
    },
    {
      class: 'foam.core.Enum',
      of: 'foam.nanos.http.Format',
      name: 'format',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          [2, 'JSON'],
          [4, 'XML'],
        ]
      }
    },
    {
      name: 'enabled',
      value: true
    },
    {
      name: 'action',
      hidden: true
    },
    {
      name: 'asyncAction',
      view: { class: 'foam.u2.tag.TextArea' },
      javaGetter: `
          DUGRuleAction action = new DUGRuleAction();
          action.setUrl(getUrl());
          action.setFormat(getFormat());
          return action;
        `
    },
    {
      name: 'after',
      value: true
    },
    {
      name: 'predicate',
      hidden: true,
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
    }
  ],

});
