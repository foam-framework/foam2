![ROPE Logo](rope.png)

# TODO DOC IS OUTDATED
# ROPE User Guide and Documentation

&nbsp;

## ROPE Description

#### Idea behind it

At an abstract level, ROPE utilizes the built in FOAM relationship framework to allow the user of the FOAM framework to perform authorization checks based on previously declared relationships and the level of authorization they are configured to be granted.

The ROPE authorization system searches the tree formed by these relationships and their implied permissions to see if the object trying to perform an operation on another object is in some way connected to it through the relationship framework in a way that would imply it being able to have some desired permissions. This allows for the formation of very complex and flexible nets of permissions to be defined without the need for any of it to be hard coded into its corresponding locations in a hard to manage and modify mess; it is all defined by ROPEs.

One of the key defining features that makes the ROPE algorithm's authentication so versatile and configurable is the transitivity it gains from its nature. An abstract example being some object ***A*** attempting to perform an operation on some other object ***C***. Although ***A*** may not be directly related to ***C***, it may be related to some intermediate object ***B*** which is itself related to object ***C***. Given the correct configuration of the ROPEs on these two relationships; object A can be granted certain permissions toward object ***C*** through its relationship to object ***B***.

More generally this applies for properties themselves within the objects and the relationships between them. ROPE allows you to work at both the property level when it comes to authorization for much needed simplicity in acheiving fine-grained controll. 

#### Using ROPE with DAOs

The ROPE authorization system can be utilized by the user of the framework by appending a ROPEAuthorizer decorator to any DAO object that requires authorization. This decorator follows the standard FOAM Authorizer interface and performs authentication checks dynamically as the dao is used using the ROPE relationship search algorithm under the hood.

Permissions based on relationships can be configured by the user by creating a ROPE objects from the ROPE.js model and setting the properties accordingly and afterwards appending the object to the application's ropeDAO which will be utilized by the ROPE algorithm to perform authentication checks. Given a missing ROPE, the algorithm trivially assumes that all permissions are not granted on that object.

&nbsp;
&nbsp;

## Technical Notes on the Proper Setup of ROPE Objects

#### Setup of Miscellany

One trivial requirement of all ROPE objects is to set up the source and target models, their respective DAO keys, and the cardinality which is a string representing the type of the relationship be it one to many or many to one, the uses should specify this field as a String of the form ***"1:1"***, ***"1:\*"***, ***"\*:1"***, or ***"\*:\*"***. Note here that ***"1:1"*** describes a special case which refers to relationships to the junction objects themselves. There are also 3 additional fields that must be set up to describe the relation and the dao in which the relation's objects are held. These include junctionModel, junctionDAOKey, and inverseName.

#### To set up which permissions this ROPE will enable

Both of the following methods of setting up a ROPE can be used in conjunction to achieve the desired functionality and are illustrated with some practical examples in the following section.

ROPE works by checking which permissions are implied given any that a User might already have in a transitive fashion. 

&nbsp;
&nbsp;

## Working Example with Code

#### Access of a User's Bank Account

Here we want to show ROPE in action in the context of being able to access a transaction as a bank account owner. First we will set up our ROPE fields as described in the previous method,

``` java
ROPE transactionROPE = new ROPE();
  transactionROPE.setSourceModel(foam.nanos.rope.test.ROPEBankAccount.getOwnClassInfo());
  transactionROPE.setTargetModel(foam.nanos.rope.test.ROPETransaction.getOwnClassInfo());
  transactionROPE.setCardinality("1:*");
  transactionROPE.setInverseName("sourceAccount");
  transactionROPE.setIsInverse(false);
  transactionROPE.setSourceDAOKey("ropeAccountDAO");
  transactionROPE.setTargetDAOKey("ropeTransactionDAO");
```

Next we will add the capabilities on the transaction which our relationship will allow to our previously created ROPE; we are here requiring that the BankAccount object be owned in order to allow the capabilities of create, read, own we wish to authorize,

``` java
List<ROPEActions> ownImplies = new ArrayList<ROPEActions>();
  ownImplies.add(ROPEActions.C);
  ownImplies.add(ROPEActions.R);
  ownImplies.add(ROPEActions.OWN);
  transactionROPE.setRelationshipImplies(relationshipImplies);
List<ROPEActions> requiredSourceActions = new new ArrayList<ROPEActions>(Arrays.asList(ROPEActions.OWN));
  transactionROPE.setRequiredSourceAction(requiredSourceActions);
```

That's all! we now have a fully working ROPE that allows anyone who owns a bank account to perform the operations of create read and *own* ( a more abstract construct that will allow permissions on other ROPEs ) on a transaction. Now finally we add this to the ropeDAO and our authorization is fully set up.

``` java
x.get("ropeDAO").put(transactionROPE);
```

#### More Fine Grained Control

Suppose we now want some additional, more complex functionality to add to our bank account accesses. People who are able to read a bank account should be able to read a transaction as well. We can achieve this by using the ROPE matrix. First we setup everything just as before,

``` java
ROPE transactionROPE = new ROPE();
  transactionROPE.setSourceModel(foam.nanos.rope.test.ROPEBankAccount.getOwnClassInfo());
  transactionROPE.setTargetModel(foam.nanos.rope.test.ROPETransaction.getOwnClassInfo());
  transactionROPE.setCardinality("1:*");
  transactionROPE.setInverseName("sourceAccount");
  transactionROPE.setIsInverse(false);
  transactionROPE.setSourceDAOKey("ropeAccountDAO");
  transactionROPE.setTargetDAOKey("ropeTransactionDAO");
```

Now we just set up our matrix and set it as the property of our transactionROPE and we are good to go,

``` java
List<ROPEActions> ownImplies = new ArrayList<ROPEActions>();
  ownImplies.add(ROPEActions.C);
  ownImplies.add(ROPEActions.R);
  ownImplies.add(ROPEActions.OWN);

List<ROPEActions> readImplies = new ArrayList<ROPEActions>();
  readImplies.add(ROPEActions.R);

HashMap<ROPEActions, List<ROPEActions>> matrix = new HashMap<ROPEActions, List<ROPEActions>>();
  matrix.put(ROPEActions.OWN, ownImplies);
  matrix.put(ROPEActions.READ, readImplies);

transactionROPE.setCRUD(matrix);
x.get("ropeDAO").put(transactionROPE);
```


