/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.INTERFACE({
  package: 'foam.nanos.ruler',
  name: 'RuleAction',
  documentation: `Interface to be implemented for 'action' and 'asyncAction' properties on a Rule object.

  RuleAction.applyAction is applied during dao operations such as put/remove and cmd. 
  We use cmd for probing purposes. To probe a dao operation client would need to submit an object on a dao 
  via using 'cmd' and get list of all the rules that are to be executed on actual dao.put/remove. 
  The response comes as RulerProbe object and contains list of TestedRules(each represnting a rule that is to be applied)
  where each defines whether the rule would be executed successfully or not(and whats the cause).

  Since we execute the same RuleAction for both: put/remove operations and cmd we want to prevent modifying actual objects while probing.
  In order to do so we pass ReadOnlyDAOContext to the applyAction method to insure that probing has no effect on the system. All the DAOs
  will be ReadOnlyDAO.
  
  ** NOTE: if applyAction implementaiton does put/remove outside of agency it will throw UnsupportedOperationException.
  
  Agency is one of the arguments on applyAction method and internally provided with writable context. 
  To perform put/remove we have to submit that code to agency, where submitted code is never executed for cmd operation,
  however, it will be processed for actual dao put/remove operations.

  We want to minimize the amount of logic in the agency and no exception should be thrown inside the agency.
  RuleAction implementation should be constructed the way that if anything can go wrong it should happen outside of agency.
  That way, while probing, it will reflect on the probe output(e.g. "rule id:666 failed with the execption: ..." );
  otherwise, as mentioned before, RulerProbe will skip agency execution and probe result will not be accurate.

  ********** USAGE:
  Rule.action
    When implementing applyAction() for Rule.action, use agency for all the write/delete operations.
    Only operations that modify other system components should be part of the agent executor.
    When submitting agent to Agency, provide description of the operation as the third argument,
    it will be reflected in RulerProbe.
    Example:
        RuleAction action = (x, obj, oldObj, ruler, agent) -> {
          DAO userDAO = x.get("userDAO"); // ReadOnlyDAO
          User user = (User) userDAO.find(888).fclone();
          user.setFirstName("Jimmy");
          
          // using lambda makes it shorter but doesn't provide system context
          agency.submit(x, x1 -> {
            DAO crudUserDAO = x1.get("userDAO); // CRUD DAO
            crudUserDAO.put(user); }, "Updating user's first name"
            );

          // if you need system context for your code use ContextAwareAgent, it will be populated with user X internally
          agency.submit(x, new ContextAwareAgent() {
            @Override
            public void execute(X x) {
              DAO crudUserDAO = x.get("userDAO");
              crudUserDAO.put(user);
            }
          }, "Updating user's first name"
            );
        };

  Rule.AsyncAction
    Async specific rule action can be implemented without use of agency. The passed agency is AsyncAgency and executes agents immediately.
  `,

  methods: [
    {
      name: 'applyAction',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'obj', type: 'foam.core.FObject' },
        { name: 'oldObj', type: 'foam.core.FObject' },
        { name: 'ruler', type: 'foam.nanos.ruler.RuleEngine' },
        { name: 'rule', type: 'foam.nanos.ruler.Rule' },
        { name: 'agency', type: 'foam.core.Agency' }
      ]
    }
  ]
});
