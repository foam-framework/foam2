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
  
  ------ Rule.action
  When implementing applyAction() for Rule.action, use agent for all the write/delete operations.
  Example: 
  RuleAction action = (x, obj, oldObj, ruler, agent) -> {
    User user = (User) userDAO.find(888).fclone();
    user.setFirstName("Jimmy");
    userDAO.put(user); // WILL NOT WORK
    // use agent instead 
    agent.submit(x, x1 -> userDAO.put(user));
  };
  `,

  methods: [
    {
      name: 'applyAction',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'obj', type: 'foam.core.FObject' },
        { name: 'oldObj', type: 'foam.core.FObject' },
        { name: 'ruler', type: 'foam.nanos.ruler.RuleEngine' },
        { name: 'agent', type: 'foam.core.CompoundContextAgent' }
      ]
    }
  ]
});
