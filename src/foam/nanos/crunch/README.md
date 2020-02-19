# CRUNCH User Guide and Documentation

&nbsp;

## CRUNCH - Continuous Reactive User Nano-Capability Hierarchy

CRUNCH is a [Knowledge-Based Configuration System](https://en.wikipedia.org/wiki/Knowledge-based_configuration) that configures a user's account with various capabilities based upon the features and functionalities.
Using CRUNCH we model all the potential capabilities of a user along with various compliance, onboarding, security, and approval requirements of those capabilities. Those models form a knowledge-graph which allows CRUNCH to query for set of capabilities and receive sets of onboarding requirements.
CRUNCH uses this knowledge graph to dynamically generate onboarding wizards for the particular configuration or set of capabilities that a user has requested, as well as dynamically add capabilities to a user's account at run-time and provide a gradual onboarding experience.
For more information on CRUNCH as a solution to the onboarding problem, and some concrete use cases of CRUNCH, please visit the [CRUNCH wiki](https://github.com/nanoPayinc/NANOPAY/wiki/CRUNCH)

## Capability
Capability is the core model of CRUNCH, and describes a task that the user can perform, or a permission they are granted. 
In the liquid use case, they denote a set of actions that a user may or may not perform on an object. For more detail, please visit the README under `liquid/crunch/`

Some important properties on the Capability model are: 
- `id` - A descriptive String id, which will soon be migrated to a Long id (TODO ruby) 
- `of` - The ClassInfo for the `data` of the `UserCapabilityJunction`
- `daoKey` - If provided, the `data` of the `UserCapabilityJunction` is stored in this DAO
- `permissionsGranted` - A list of String denoting the permissions implied by this Capability. If a user has a capability granting permission p, CapabilityAuthService.check(x, p) will return true.
- `enabled` - If a capability is not enabled, it will be ignored by the system.

Below are some properties that may be useful in the onboarding use case of crunch
- `visible` - Denotes whether or not a Capability is viewable by a user. For example, a Capability such as "Make Payment" would be viewable whereas a Capability such as "Compliance Passed" may just be an intermediate step to obtain another Capability, and may not be explicitly shown to the user.
- `expiry` - A DateTime denoting when this Capability will expire, this property is mutually exclusive with `duration`.
- `duration`- An int value representing the number of days for which this Capability will the valid, once GRANTED to a user.




