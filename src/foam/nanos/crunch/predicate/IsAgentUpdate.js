/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'foam.nanos.crunch.predicate',
  name: 'IsAgentUpdate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: `
    Returns true if session user(s) is not the same as the user(s) of the usercapabilityjunction,
    excludes system updates
  `,

  javaImports: [
    'foam.core.X',
    'foam.nanos.auth.Subject',
    'foam.nanos.crunch.AgentCapabilityJunction',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.session.Session'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        X x = (X) obj;
        UserCapabilityJunction ucj = (UserCapabilityJunction) x.get("NEW");

        Session session = (Session) x.get(Session.class);
        Long userId = session.getUserId();
        Long agentId = session.getAgentId();
        if ( userId == 1 ) return false;

        Subject ucjSubject = ucj.getSubject(x);
        if ( ucjSubject.isAgent() ) {
          return userId != ucjSubject.getUser().getId() ||
            agentId != ucjSubject.getRealUser().getId();
        } else {
          return userId != ucjSubject.getUser().getId() && agentId != ucjSubject.getUser().getId();
        }
      `
    }
  ]
});
