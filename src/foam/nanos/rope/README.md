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

Setting up a ROPE can be a very complicated process; but with a little time and patience it can be done. One should not worry if they cannot get into the flow of things the first time around. Remember that you only need to write it once (usually).

ROPE works by checking which permissions are implied given any that a User might already have in a transitive fashion. The first thing that is checked whenever an authorization check takes place is the crud matrix. This relates an operation; create, read, update, or delete which maps to another mapping. This second mapping relates properties with lists of properties that one of which must be authorized to grant authorization to that property as a whole. Also contained within is a ***__default__*** property which can be searched to grant authorization after all other properties have been exhausted.

&nbsp;
&nbsp;

## Working Example with Code

#### Setting up a basic ROPE

Here we will demystify the above explanation with a more concrete example: set

``` java
    //comments
    list = new ArrayList<String>(Arrays.asList( "owner", "parent" )); 
    createMap.put("__default__", list);
    list = new ArrayList<String>(Arrays.asList( "owner", "parent" ));
    readMap.put("__default__", list);
    list = new ArrayList<String>(Arrays.asList( ));
    updateMap.put("__default__", list);
    list = new ArrayList<String>(Arrays.asList( ));
    deleteMap.put("__default__", list);
    crudMap.put("create", createMap);
    crudMap.put("read", readMap);
    crudMap.put("update", updateMap);
    crudMap.put("delete", deleteMap);
    relationshipMap.put("parent", new ArrayList<String>(Arrays.asList( "owner", "parent" )));

    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("transactionDAO")
      .setCardinality("1:*")
      .setRelationshipKey("sourceAccount")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .build());
```

Here, the first thing we do is set up the crud map to define which relations between the two objects should be checked to enable authorization on this ROPE. Then we also set up a mapping in the RelationshipMAP



