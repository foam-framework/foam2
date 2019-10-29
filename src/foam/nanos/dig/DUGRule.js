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
      class: 'String',
      name: 'name'
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
      value: foam.nanos.http.Format.JSON,
      required: true,
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
      // Currently the front end does not load this correctly, causing incorrect values to be saved with each update.
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
