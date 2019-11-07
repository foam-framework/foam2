![ROPE Logo](rope.png)

# TODO DOC IS OUTDATED
# ROPE User Guide and Documentation

&nbsp;

## ROPE Description

#### Idea behind it

At an abstract level, ROPE utilizes the built in FOAM relationship framework to allow the user of the FOAM framework to perform authorization checks based on previously declared relationships and the level of authorization they are configured to be granted.

The ROPE authorization system searches the tree formed by these relationships and their implied permissions to see if the object trying to perform an operation on another object is in some way connected to it through the relationship framework in a way that would imply it being able to have some desired permissions. This allows for the formation of very complex and flexible nets of permissions to be defined without the need for any of it to be hard coded into its corresponding locations in a hard to manage and modify mess; it is all defined by ROPEs.

One of the key defining features that makes the ROPE algorithm's authorization so versatile and configurable is the transitivity it gains from its nature. An abstract example being some object ***A*** attempting to perform an operation on some other object ***C***. Although ***A*** may not be directly related to ***C***, it may be related to some intermediate object ***B*** which is itself related to object ***C***. Given the correct configuration of the ROPEs on these two relationships; object A can be granted certain permissions toward object ***C*** through its relationship to object ***B***.

More generally this applies for properties themselves within the objects and the relationships between them. ROPE allows you to work at both the property level when it comes to authorization for much needed simplicity in acheiving fine-grained controll. 

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

Permissions based on relationships can be configured by the user by creating a ROPE objects from the ROPE.js model and setting the properties accordingly and afterwards appending the object to the application's ropeDAO which will be utilized by the ROPE algorithm to perform authorization checks. Given a missing ROPE, the algorithm trivially assumes that all permissions are not granted on that object.

#### Composition of ROPES

There are a few helper ROPEs with which can be used to combine regular ROPEs to form more complex logical operations. There are known more formally as composite ropes. AND and OR ROPEs can be found in the compositeROPE.js file. These act as regular ROPEs except that under the hood they delegate their checks to other ropes composed within them. The OR composite authorizes if only one of the ROPEs it is composed with authorizes and the AND requires all composed ROPEs to authorize. 

// TODO James integrate this with the above paragraph
CompositeROPEs extend the CompositeROPE class which contains a `List<ROPE>` property and extends the ROPE class
For CompositeROPEs, only this property and the `ids` of the ROPE, which include `targetDAOKey`, `sourceDAOKey`, and `relationshipKey` should be provided.
The `targetDAOKey` must match that of its children, but the `sourceDAOKey` and `relationshipKey` has no such requirements, and is only provided to refine lookup of ROPEs.
The classes extending the CompositeROPE class have their own implementations of check.

&nbsp;
&nbsp;

## Technical Notes on the Proper Setup of ROPE Objects

#### The ROPE Models

##### ROPEAuthorizer
TODO James
The ROPEAuthorizer extends the Authorizer interface and implements the methods `authorizeOnCreate`, `authorizeOnRead`, `authorizeOnUpdate`, and `authorizeOnDelete`.

The ROPEAuthorizer has one property called the `targetDAOKey`, and it is used to find the first ROPE and initialize the chain of ROPE searches.
The main difference between the ROPEAuthorizer and other authorizers is that the implemented methods for authorizing CRUD operations all call a method called `authorizeByROPE`, which simply returns a list of ROPEs in the ropeDAO where the targetDAOKey of the ROPE matches the targetDAOKey of the authorizer. For each of those ropes, the `check` method implemented in the ROPE model is called until one of them returns true, or else the operation in not authorized.

Furthermore, there is a difference in logic between the authorization of read/delete versus that of create/update.
In `authorizeOnRead` and `authorizeOnDelete`, there is no need to perform authorization at the property level. In the case of read, the visibility of individual properties are not in the scope of ROPE, and in the case of delete, it is redundant.
However, in `authorizeOnCreate` and `authorizeOnUpdate`, the properties that are set by the user are compared with either a new instance of the model, in the case of create, or the old object before the update. For each rope, a check is called for each of the properties that are set/changed, and the checks must all return true before the action can be granted.

##### ROPE
TODO James
This is a description of the ROPE model.

Contains the following properties: 
- sourceDAOKey - DAO with relationship to target DAO
- targetDAOKey - the DAO to check permission/relationship on
- cardinality - contains `1:1`, `1:*`, and `*:*`. `1:1` is used in the case where the targetDAO is a junctionDAO.
- relationshipKey - the name of the relationship from the target to source, is defined in the relationship between the models
- isInverse - if the source/target is the inverse of what was defined in the relationship, used mainly to check if a 1:* rope is actually *:1 in the relationship
- crudMap - A map containing maps for each of the crud operations, where the keys are "create", "read", "update", and "delete". 
  - Each sub-map contains keys which are either "__default__" or some propertyName, in the case of update or create
  - The values of each sub-map contains relationshipKeys of ropes where the targetDAOKey is the sourceDAOKey of the current rope.
- relationshipMap - a map containing keys which are the relationshipKey of the previous ROPE in the chain of ROPE lookups, and the values are the relationshipKeys of the ropes where the targetDAOKey is the sourceDAOKey of the current rope. Think of this as a mapping from "previousStep" to "nextSteps"
- There is a special value, "__terminate__" that can be added as an value of any map, this tells the ROPE to check if the source object in this relationship is an User and matches the User in the current context, and if so, to grant the operation into the DAO of interest.

One important method to note in the ROPE model is `check`, which handles the work of looking up relevant ropes and checking them recursively to find a path to the context user. It takes as argument the context and the object of interest, but also three keys : 
1. relationshipKey - this is used to filter the ropeDAO in the search for relevant ROPEs, this is usually provided in the intermediate steps of the rope search in the ROPEAuthorizer, but when programming with ROPE directly, this can be provided to narrow the number of ROPEs to check in subsequent steps  
2. crudKey - this is the key used in the first step of the ROPE search, representing the action to perform in the targetDAO on the target object. This must match one of the keys in the crudMap. This key is NOT used in any step of the ROPE search except the first.
3. propertyKey - this is the key that can be used along with the crudKey to check specifically the next steps that must be taken to update or set some property. This is only used when the operation is an update or create. If the propertyKey is not found in the "create" map or "update" map, depending on what the crudKey was, the values in the "__default__" entry are used.


#### Setup of Miscellany

One trivial requirement of all ROPE objects is to set up the source and target models, their respective DAO keys, and the cardinality which is a string representing the type of the relationship be it one to many or many to one, the uses should specify this field as a String of the form ***"1:1"***, ***"1:\*"***, ***"\*:1"***, or ***"\*:\*"***. Note here that ***"1:1"*** describes a special case which refers to relationships to the junction objects themselves. There are also 3 additional fields that must be set up to describe the relation and the dao in which the relation's objects are held. These include junctionModel, junctionDAOKey, and inverseName.

#### To set up which permissions this ROPE will enable

Both of the following methods of setting up a ROPE can be used in conjunction to achieve the desired functionality and are illustrated with some practical examples in the following section.

ROPE works by checking which permissions are implied given any that a User might already have in a transitive fashion. The first thing that is checked whenever an authorization check takes place is the crud matrix. This relates an operation; create, read, update, or delete which maps to another mapping. This second mapping relates properties with lists of properties that one of which must be authorized to grant authorization to that property as a whole. Also contained within is a ***__default__*** property which can be searched to grant authorization after all other properties have been exhausted.

&nbsp;
&nbsp;

## Working Example with Code

#### Setting up a basic ROPE
TODO James

Here we will demystify the above explanation with a more concrete example.
We will setup ROPEs such that we have a chain from Transaction to User.

Setup of a Transaction-Account example

This is example of a rope for granting permissions to write to transactionDAO through accountDAO and userDAO.
This example is under the assumption that user can own accounts, and those accounts can form a trees of child accounts. 
Transactions can be created if a user owns the sourceAccount of the transaction or the parent of the sourceAccount of a transaction.

``` java
    // declare and initialize maps and list

    // TRANSACTIONDAO - ACCOUNTDAO (sourceAccount)

    // this is the default maps for crud. 
    // An transaction can be created or read in one of two ways:
    //  1. Direct ownership of the sourceAccount
    //  2. Indirectly through checking the authorization on the parent account of the sourceAccount 
    createMap.put("__default__", new ArrayList<String>(Arrays.asList( "owner", "parent" )));
    readMap.put("__default__", new ArrayList<String>(Arrays.asList( "owner", "parent" )));
    // non-system users should not have authorization to update or delete accounts, so no path is granted for this operation
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
    
    // clear maps    

    // ACCOUNTDAO - ACCOUNT DAO (parent)

    // an account can be created, read, update, or deleted in one of two ways
    //  1. Direct ownership of the account
    //  2. Indirectly through checking the authorization on the parent account 
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

    // clear maps

    // ACCOUNTDAO - USERDAO (owner)

    // an account can be created, read, updated, and deleted by any user that has this relationship
    // "owner", to the account
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
