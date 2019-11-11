![ROPE Logo](rope.png)

# ROPE User Guide and Documentation

&nbsp;

## ROPE Description

#### Idea behind it

At an abstract level, ROPE utilizes the built in FOAM relationship framework to allow the user of the FOAM framework to perform authorization checks based on previously declared relationships and the level of authorization they are configured to be granted.

The ROPE authorization system searches the tree formed by these relationships and their implied permissions to see if the object trying to perform an operation on another object is in some way connected to it through the relationship framework in a way that would imply it being able to have some desired permissions. This allows for the formation of very complex and flexible nets of permissions to be defined without the need for any of it to be hard coded into its corresponding locations in a hard to manage and modify mess; it is all defined by ROPEs.

One of the key defining features that makes the ROPE algorithm's authorization so versatile and configurable is the transitivity it gains from its nature. An abstract example being some object ***A*** attempting to perform an operation on some other object ***C***. Although ***A*** may not be directly related to ***C***, it may be related to some intermediate object ***B*** which is itself related to object ***C***. Given the correct configuration of the ROPEs on these two relationships; object A can be granted certain permissions toward object ***C*** through its relationship to object ***B***.

More generally this applies for properties themselves within the objects and the relationships between them. ROPE allows you to work at both the property level when it comes to authorization for much needed simplicity in achieving fine-grained control.

&nbsp;

#### Using ROPE with DAOs

The ROPE authorization system can be utilized by the user of the framework by appending a ROPEAuthorizer decorator to any DAO object that requires authorization. This decorator follows the standard FOAM Authorizer interface and performs authorization checks dynamically as the dao is used using the ROPE relationship search algorithm under the hood.
Here is the set up of transactionDAO if one were to use the ROPEAuthorizer.

```java
transactionDAO = new foam.dao.EasyDAO.Builder(x)
  .setAuthorizer(
    foam.nanos.rope.ROPEAuthorizer.Builder(x)
      .setTargetDAOKey("transactionDAO")
      .build()
  )
      .
      . 
      .
  .build();
```

Access control based on relationships can be configured by the user by creating instances of the ROPE.js model, setting the properties appropriately, and putting the ROPE to `ropeDAO`, which is used by `ROPEAuthorizer` to perform authorization checks.

&nbsp;

#### Composition of ROPES

There are a few higher-order ROPEs that can be used to combine regular ROPEs to form more complex logical operations. They are known more formally as composite ropes. AND and OR ROPEs can be found in the `CompositeROPE.js` file. These act as regular ROPEs except that under the hood they delegate their checks to other ropes composed within them. The OR composite authorizes if only one of the ROPEs it is composed with authorizes and the AND requires all composed ROPEs to authorize. 

&nbsp;
&nbsp;

## Technical Notes on the Proper Setup of ROPE Objects

##### ROPEAuthorizer

Akin to any standard foam authorizer, ROPEAuthorizer is an implementation of the corresponding interface and can be used interchangably on any DAO. Each ROPEAuthorizer has a corresponding targetDAOKey property which is utilized in finding the corresponding ROPEs to perform authorization checked with. The bulk of the algorithm is implemented within the ROPE model itself with an entrypoint in the check method to which the ROPEAuthorizer merely delegates.

Though it is abstracted away from the user that utilizes such authorizers, there is a slight nuance in logic between the authorization of read/delete versus that of create/update that is worth noting in order to understand the back-end functionality of ROPE. On reads and deletes, there is no need to perform authorization at the property level as the entire object is being returned or deleted as the result of a query. However, on creates and updates, the properties that are set by the user are compared with either a new instance of the model (in the case of create), or the old object before the update. For each rope, a check is called for each of the properties that are set/changed, and the checks must all return true before the action can be granted.

&nbsp;

##### ROPE Model

Contains the following properties: 
- sourceDAOKey - The DAO with which the target DAO is related to.
- targetDAOKey - The DAO to check permission/relationship on.
- cardinality - Contains `1:1`, `1:*`, and `*:*`; `1:1` is used for special cases where the targetDAO is a junctionDAO.
- relationshipKey - The name of the relationship from the target to source, is defined in the relationship between the models.
- isInverse - If the source/target is the inverse of what was defined in the relationship, used mainly to check if a 1:* rope is actually *:1 in the relationship.
- crudMap - A map containing maps for each of the crud operations, where the keys are "create", "read", "update", and "delete".
  - Each sub-map contains keys which are either "\_\_default\_\_" or some propertyName, in the case of update or create.
  - The values of each sub-map contains relationshipKeys of ropes where the targetDAOKey is the sourceDAOKey of the current rope.
- relationshipMap - A map containing keys which are the relationshipKey of the previous ROPE in the chain of ROPE lookups, and the values are the relationshipKeys of the ropes where the targetDAOKey is the sourceDAOKey of the current rope. Think of this as a mapping from "previousStep" to "nextSteps".

Additionally, there is a special value, "\_\_terminate\_\_" that can be added as an value of any map, this tells the ROPE to check if the source object in this relationship is an User and matches the User in the current context, and if so, to grant the operation into the DAO of interest.

One important method to note in the ROPE model is `check`, which handles the work of looking up relevant ropes and checking them recursively to find a path to the context user. It takes as argument the context and the object of interest, but also three keys : 
1. relationshipKey - This is used to filter the ropeDAO in the search for relevant ROPEs, this is usually provided in the intermediate steps of the rope search in the ROPEAuthorizer, but when programming with ROPE directly, this can be provided to narrow the number of ROPEs to check in subsequent steps  
2. crudKey - This is the key used in the first step of the ROPE search, representing the action to perform in the targetDAO on the target object. This must match one of the keys in the crudMap. This key is NOT used in any step of the ROPE search except the first.
3. propertyKey - This is the key that can be used along with the crudKey to check specifically the next steps that must be taken to update or set some property. This is only used when the operation is an update or create. If the propertyKey is not found in the "create" map or "update" map, depending on what the crudKey was, the values in the "\_\_default\_\_" entry are used.

&nbsp;

##### To set up which permissions this ROPE will enable

Both of the following methods of setting up a ROPE can be used in conjunction to achieve the desired functionality and are illustrated with some practical examples in the following section.

ROPE works by checking which permissions are implied given any that a User might already have in a transitive fashion. The first thing that is checked whenever an authorization check takes place is the crud matrix. This relates an operation; create, read, update, or delete which maps to another mapping. This second mapping relates properties with lists of properties that one of which must be authorized to grant authorization to that property as a whole. Also contained within is a ***\_\_default\_\_*** property which can be searched to grant authorization after all other properties have been exhausted.

&nbsp;
&nbsp;

## Working Examples with Code

#### Transaction-Account ROPE

Suppose that we want a basic ROPE which will grant permissions to write to `transactionDAO` through `accountDAO` and `userDAO`. Here we use a relationship enviroment where users of an application can own an account which can in turn have children. We use this context to create a ROPE where a transaction can be created if a user owns the sourceAccount of the transaction or the parent of the sourceAccount of a transaction.

First we start by setting up the ROPE for the `accountDAO` to `transactionDAO` in a beanshell style code snippet. Here we have that a transaction can be created or read in one of two ways, 
1. Direct ownership of the sourceAccount
2. Indirectly through checking the authorization on the parent account of the sourceAccount 

``` java
    createMap.put("__default__", new ArrayList<String>(Arrays.asList( "owner", "parent" )));
    readMap.put("__default__", new ArrayList<String>(Arrays.asList( "owner", "parent" )));

    // Non-system users should not have authorization to update or delete accounts; so no path is granted for this operation
    updateMap.put("__default__", null);
    deleteMap.put("__default__", null);
    crudMap.put("create", createMap);
    crudMap.put("read", readMap);
    crudMap.put("update", updateMap);
    crudMap.put("delete", deleteMap);

    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("transactionDAO")
      .setCardinality("1:*")
      .setRelationshipKey("sourceAccount")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .build());
```
&nbsp;
Next we setup our `accountDAO` to `accountDAO` ROPE. Here we have that an account can be created, read, updated, or deleted in one of two ways,
  1. Direct ownership of the account
  2. Indirectly through checking the authorization on the parent account 

``` java 
    createMap.put("__default__", new ArrayList<String>(Arrays.asList( "owner", "parent" )));
    readMap.put("__default__", new ArrayList<String>(Arrays.asList( "owner", "parent" )));
    updateMap.put("__default__", new ArrayList<String>(Arrays.asList( "owner", "parent" )));
    deleteMap.put("__default__", new ArrayList<String>(Arrays.asList( "owner", "parent" )));
    crudMap.put("create", createMap);
    crudMap.put("read", readMap);
    crudMap.put("update", updateMap);
    crudMap.put("delete", deleteMap);
    // this rope may be reached by the account-transaction rope defined above with relationshipKey sourceAccount
    // in this case, the next step is to check for the owner relationship rope or the parent relationship rope
    relationshipMap.put("sourceAccount", new ArrayList<String>(Arrays.asList( "owner", "parent" )));

    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("accountDAO")
      .setCardinality("1:*")
      .setRelationshipKey("parent")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); crudMap.clear(); relationshipMap.clear();
```
&nbsp;
Finally, we finish this examply by setting up the `userDAO` to `transactionDAO` ROPE and we are done. Here an account can be created, read, updated, and deleted by any user that is the "owner" to the account.

``` java
    createMap.put("__default__", new ArrayList<String>(Arrays.asList( "__terminate__" )));
    readMap.put("__default__", new ArrayList<String>(Arrays.asList( "__terminate__" )));
    updateMap.put("__default__", new ArrayList<String>(Arrays.asList( "__terminate__" )));
    deleteMap.put("__default__", new ArrayList<String>(Arrays.asList( "__terminate__" )));
    crudMap.put("create", createMap);
    crudMap.put("read", readMap);
    crudMap.put("update", updateMap);
    crudMap.put("delete", deleteMap);
    // this rope may be reached by either of the ropes reached about, and is the last step for both of those ropes
    relationshipMap.put("parent", new ArrayList<String>(Arrays.asList( "__terminate__" )));
    relationshipMap.put("sourceAccount", new ArrayList<String>(Arrays.asList( "__terminate__" )));

    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("userDAO")
      .setTargetDAOKey("accountDAO")
      .setCardinality("1:*")
      .setRelationshipKey("owner")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); crudMap.clear(); relationshipMap.clear();
```
