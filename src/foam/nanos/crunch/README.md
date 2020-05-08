# CRUNCH User Guide and Documentation

&nbsp;

### CRUNCH - Continuous Reactive User Nano-Capability Hierarchy

CRUNCH is a [Knowledge-Based Configuration System](https://en.wikipedia.org/wiki/Knowledge-based_configuration) that configures a user's account with various capabilities.
Using CRUNCH we model all the potential capabilities of a user along with various compliance, onboarding, security, and approval requirements of those capabilities. Those models form a knowledge-graph which allows CRUNCH to generate onboarding requirements based on the individual's needs and existing capabilities.
CRUNCH uses this knowledge graph to dynamically generate onboarding wizards for the particular configuration or set of capabilities that a user has requested, as well as dynamically add capabilities to a user's account at run-time and provide a gradual onboarding experience.

#### Capability
Capability is the core model of CRUNCH, and describes a task that the user can perform, or a permission they are granted. 

Some important properties on the Capability model are: 
- `name` - This could be the "permission" granted by this capability, or simply a descriptive name for the capability.
- `of` - The ClassInfo for the `data` of the `UserCapabilityJunction`
- `daoKey` - If provided, the `data` of the `UserCapabilityJunction` is stored in this DAO
- `permissionsGranted` - A list of String denoting the permissions implied by this Capability. If a user has a capability granting permission p, CapabilityAuthService.check(x, p) will return true.
- `enabled` - If a capability is not enabled, it will be ignored by the system.

Below are some properties that may be useful in the onboarding use case of crunch
- `visible` - Denotes whether or not a Capability is viewable by a user. For example, a Capability such as "Make Payment" would be viewable whereas a Capability such as "Compliance Passed" may just be an intermediate step to obtain another Capability, and may not be explicitly shown to the user.
- `expiry` - A DateTime denoting when this Capability will expire, this property is mutually exclusive with `duration`.
- `duration`- An int value representing the number of days for which this Capability will the valid, once GRANTED to a user.

#### Relationships Between Capabilities and Other Entities

##### Capability - (Prerequisite) Capability
- Stored in the `prerequisiteCapabilityJunctionDAO`
- If a Capability has a prerequisite Capability, the user must be GRANTED the prerequisite Capability before being eligible to apply for the Capability

##### Capability - (Deprecated) Capability
- stored in the `deprecatedCapabilityJunctionDAO`
- If a Capability has been deprecated by another Capability, the existing UCJs with the Capability are still valid, but the Capability is no longer a valid selection for new UCJs.

##### User - Capability 
- stored in the `userCapabilityJunctionDAO`
- refined by `UserCapabilityJunctionRefine`
Notable properties on the UCJ model :
- `status` - an Enum of CapabilityJunctionStatus, `PENDING` unless `GRANTED` or `EXPIRED`
- `expiry` - A DateTime calculated at the time the UCJ becomes GRANTED
- `data` - Information relating to the user and the capability. 
    - In the liquid use case, this field was used to add information about the extend of the Capability granted to the user. 
    - In the onboarding use case, this could be information that need be collected from the user in order to grant a Capability
The UserCapabilityJunctionDAO decorator :
- This decorator was created with the onboarding use case in mind and can be excluded depending on need
- Behavior on put :
    - ownership of the UCJ is checked
    - UCJs with prerequisite Capabilities are checked
    - the `data` of the UCJ must be a validatable, and its `validate` method is checked 
    - the `data` is saved to the `daoKey` of the Capability, if `daoKey` is provided
    - if the prerequistes are fulfilled and the data is validated, the `status` of the UCJ is set to `GRANTED`, and the `expiry` is calculated. Otherwise, the `status` is set to `PENDING`

#### CapabilityJunctionStatus
Includes : 
- PENDING
- GRANTED
- EXPIRED

#### CapabilityAuthService
Overrides the `checkUser` method: Given a permission `p`, and User `u`,
1. Check whether `p` is the name of an enabled Capability
2. Try to find a GRANTED and non-EXPIRED UserCapabilityJunction such that `User == u && Capability == p`. If found, return true
3. Find the non-EXPIRED UserCapabilityJunctions where `User == u`, for each UCJ, check if the Capability implies `p`
    - `implies` is a method on the Capability model. A Capability `c` implies a String `p` if :
        - `c` has a prerequisite Capability which implies `p`
        - `p` is in the set of `permissionsGranted` by `c`, or implied by the set of `permissionsGranted` by `c`*.
        - the name of `c` implies `p`* 
        - *e.g., `obj.*` implies `obj.read`

A notable difference between this decorator and other AuthService decorators is that if at any point, the result of the check is found to be true, `true` is returned instead of moving on to the next decorators in the AuthService chain. And if at any point, the result of the check is found to be false, the check moves on to return the result of its delegate



#### Rules 
- IsUserCapabilityJunctionStatusUpdate (Predicate)
- SendNotificationOnTopLevelCapabilityStatusUpdate
- RemoveJunctionsOnUserRemoval

#### Crons
- ExpireUserCapabilityJunctionsCron
