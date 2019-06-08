/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.INTERFACE({
  package: 'foam.nanos.ruler',
  name: 'RuleAction',
  documentation: `Interface to be implemented for 'action' and 'asyncAction' properties on a Rule object.
  ********** VERY IMPORTANT NOTE **********

  Rule.action
    When implementing applyAction() for Rule.action, use agent for all the write/delete operations.
    Only operations that modify other system components should be part of the agent executor.
    When implementing execute() method inside the action, provide description of the operation as the third argument.
    Example:
        RuleAction action = (x, obj, oldObj, ruler, agent) -> {
          DAO userDAO = x.get("userDAO"); // ReadOnlyDAO
          User user = (User) userDAO.find(888).fclone();
          user.setFirstName("Jimmy");
          userDAO.put(user); // WILL NOT WORK
          // use agent instead
          agency.submit(x1 -> {
            DAO crudUserDAO = x1.get("userDAO); // CRUD DAO
            crudUserDAO.put(user); }, "Updating user's first name"
            );
        };

  Rule.AsyncAction
    When implementing applyAction for Rule.asyncAction, do not use agent.
    The passed agent is null (!!). All the DAOs inside applyAction of AsyncAction are CRUDable.
  `,

  methods: [
    {
      name: 'applyAction',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'obj', type: 'foam.core.FObject' },
        { name: 'oldObj', type: 'foam.core.FObject' },
        { name: 'ruler', type: 'foam.nanos.ruler.RuleEngine' },
        { name: 'agency', type: 'foam.core.Agency' }
      ]
    }
  ]
});
