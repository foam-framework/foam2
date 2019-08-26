/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
    package: 'foam.nanos.ruler',
    name: 'UserRefines',
    refines: 'foam.nanos.auth.User',
    imports: [
      'complianceHistoryDAO'
    ],
    actions: [
      {
        name: 'viewComplianceHistory',
        label: 'View Compliance History',
        availablePermissions: ['service.compliancehistorydao', 'foam.nanos.auth.User.permission.viewComplianceHistory'],
        code: async function(X) {
          var m = foam.mlang.ExpressionsSingleton.create({});
          this.__context__.stack.push({
            class: 'foam.comics.BrowserView',
            createEnabled: false,
            editEnabled: true,
            exportEnabled: true,
            title: `${this.legalName}'s Compliance History`,
            data: this.complianceHistoryDAO.where(m.AND(
                m.EQ(foam.nanos.ruler.RuleHistory.OBJECT_ID, this.id),
                m.EQ(foam.nanos.ruler.RuleHistory.OBJECT_DAO_KEY, 'localUserDAO')
            ))
          });
        }
      }
    ]
});
