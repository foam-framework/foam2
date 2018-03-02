foam.CLASS({
  package: 'demo.build',
  name: 'ModelToBuild',
  requires: [
    {
      path: 'foam.swift.parse.json.output.Outputter',
      flags: ['swift'],
    },
    {
      path: 'foam.dao.EasyDAO',
      flags: ['js'],
    },
  ],
  properties: [
    {
      name: 'jsProp',
      flags: ['js'],
    },
    {
      name: 'swiftProp',
      flags: ['swift'],
    },
  ],
});
