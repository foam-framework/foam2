![FOAM Logo](EasyDAO.png)

# EasyDAO User Guide and Documentation

## EasyDAO Description

Creating long decorator chains is a tedious and error prone process which EasyDAO works to alleviate, while providing a powerful way to easily modify the behaviour and usage of all daos within an application. Using EasyDAO will help create clean, easily maintanable code and save significant development time that is spent writing and debugging DAOs.

EasyDAO works primarily by using a builder pattern; allowing building of doas by the setting of intuitinve properties. Once the properties describing the requisite function of the DAOs being built are set, EasyDAO takes care of the rest, making the messy calls to the required decorators of all the DOAs and placing them all in a chain that has been set up to specifically avoid any bugs that may be caused by any local interdependancies between proxies.

&nbsp;
&nbsp;

## Setting up EasyDAO

#### Basic Setup

The most basic DAO that can be setup using EasyDAO only requires the specification of the property "of". This allows the EasyDAO to know what kind of objects are being placed into the DAO so it can set up the MDAO accordingly. All EasyDAO constructions end in MDAO unless otherwise specified. We will see how we casn change this behaviour later. Here is a barebones example of an EasyDAO setup,

```java
new foam.dao.EasyDAO.Builder(x)
  .setOf(MODEL_PATH.getOwnClassInfo())
  .build();
```

This creates the following decorator chain,

```
EasyDAO -> AuthorizationDAO -> RulerDAO -> MDAO
```

EasyDAO automatically tacks itself on as a decorator. As for authorization and ruler DAOs, these come automatically with every EasyDAO construction. To disable this, simply set their corresponding properties to false,

```java
new foam.dao.EasyDAO.Builder(x)
  .setOf(MODEL_PATH.getOwnClassInfo())
  .setAuthorize(false)
  .setRuler(false)
  .build();
```

&nbsp;

#### Journalling

Many application may wish to make use of the journalling abilities of foam by adding a journal to their DAOs. To do so with EasyDAO is simple. We will add a JDAO by simply specifiyng the name of our journal and the type of journal we wish to use (of which there is currently only one that defaults to foam.dao.JDAO). The type of journal is specified by an enumeration at foam.dao.JournalType from which SINGLE_JOURNAL should be used. This can of course be customized on the client side to yield any other kind of default journal (a HashingJDAO perhaps?).

```java
new foam.dao.EasyDAO.Builder(x)
  .setOf(MODEL_PATH.getOwnClassInfo())
  .setAuthorize(false)
  .setRuler(false)
  .setJournalName("docs")
  .setJournalType(foam.dao.JournalType.SINGLE_JOURNAL)
  .build();
```

Our new decorator chain now looks like the following:

```
EasyDAO -> JDAO -> MDAO
```

&nbsp;

#### MiscProxies

Any other proxy can be added to the EasyDAO generated chain. The various properties available in the faom.dao.EasyDAO model should be checked to get a feel for what sort of proxies you can add to your decorator chain. But most commonly, if a DAO is defined in foam.dao.*, chances are there is an EasyDAO property for it. But what if you want a client-side defined dao, or a DAO which is not yet defined within EasyDAO? EasyDAO allows you to create a cahin of ProxyDAO decorators ending in null that it will inset into the chain for you.

```java
new foam.dao.EasyDAO.Builder(x)
  .setOf(MODEL_PATH.getOwnClassInfo())
  .setAuthorize(false)
  .setRuler(false)
  .setDecorator(new faom.dao.DAO1(new foam.dao.DAO2(null)))
  .setJournalName("docs")
  .setJournalType(foam.dao.JournalType.SINGLE_JOURNAL)
  .build();
```

This will create the following decorator chain,

```
EasyDAO -> DAO1 -> DAO2 -> JDAO -> MDAO
```
&nbsp;

#### Inner DAOs

Sometimes you want the ability to choose which DAO EasyDAO places at the end of your chain to perform the act of storing. For instance maybe you have another more modular DAO you wish to attach it to; or simply have made your own version of MDAO. You can do so with setInnerDAO. Caution should be used here however as sometimes this will reduce the ability to upgrade the function of all DAOs and should be used sparingly as the Inner DAO property is a popular spot that is often used to modify functionality on a larger scale. The following example shows setInnerDAO at work:

```java
new foam.dao.EasyDAO.Builder(x)
  .setOf(MODEL_PATH.getOwnClassInfo())
  .setAuthorize(false)
  .setRuler(false)
  .setDecorator(new faom.dao.DAO1(new foam.dao.DAO2(null)))
  .setInnerDAO(new INDAO())
  .build();
```

This will create the following decorator chain,

```
EasyDAO -> DAO1 -> DAO2 -> INDAO
```

&nbsp;

#### Debugging Tips and Tricks

Unfortunately, setting up a decorator chain can be a very buggy and frustrating experience. The best way to set up a chain is sequentially, testing its function at each step of the way. This is because any bug that might be caused by a single step of the process can be very difficult to pinpoint once the entire decorator chain is set up. A sequential approach will give you a strong indication to what is causing each bug as it pops up. The best way to use this approach is to disable any decorators that may be added by default at first, and slowly add them one by one, taking care to prioritize adding first decorators that may conflict with others such as those performing authorization checks.

It will help to visualize what decorator chain the EasyDAO is creating at each step of the way to help identify possible culprits and mismatched orders of DAOs. This can be done using the following piece of logic to walk the chain of decorators and print them out one by one:

```java
  foam.dao.DAO delegate = EASYDAO;

  while ( delegate instanceof foam.dao.ProxyDAO) {
    System.out.println(delegate.getClass().getSimpleName());
    delegate = ((foam.dao.ProxyDAO) delegate).getDelegate();
  }

  System.out.println(delegate.getClass().getSimpleName());
```

This in fact comes built in to each EasyDAO in a method called printDecorators which you may wish to use. One of the advantages of having an EasyDAO decorator at the EasyDAO side of each chain is simply being able to call it using the built DAO,

```java
EasyDAO dao = new foam.dao.EasyDAO.Builder(x)
  ...
  ...
  ...
  .build();

  dao.printDecorators();
```

&nbsp;
&nbsp;

## Customizing EasyDAO for the Client Side

#### Overwriting Properties

Customizing EasyDAO on the client side is a bit difficult do to the nature of how it is implemented. It is however, not impossible. The first step to take would be to create a foam model extending the original EasyDAO. Here you can override properties and even add some of your own. Since all the logic of creating the decorator chain is placed within a single property it is a bit hard to modify. However, EasyDAO comes equipped with a method allowing the user to specify their own unique decorator chain using the properties that they have added. This is known as getOuterDAO. 

Here you are provided the tail of the decorator chain already constructed somewhere between JDAO and the rest of the proprietry foam DAOs, and you need only add to this and return a pointer to the last decorator in your completed chain. This is a simple way to EasyDAO whichever DAO decorators you wish, however it is not without its drawbacks. For instance if you would like a ProxyDAO to come exactly in between two specific ProxyDAOs in foam you will not be abke to make it purely with EasyDAO. Fret not, however for the next section will explain the support that EasyDAO provides for strategic placement of all your DAO needs.

&nbsp;

#### Precise Placement of EasyDAO Decorators

On some rare occations, interdependencies between the semantics of each DAO decorator do arise. Here, precise placement of a decorator is required. This can be acheived using the addDecorator method which places a null ending chain (similar to the semantics of the more familiar setDecorator()) after a specified DAO. The specific DAO it places the decorator chain is in relation to the methods second argument, which is the class info of the DAO to be placed in relation to. Set the last argument to true if you want to place it before the given DAO, and false otherwise. Although complicated, this specialized function gives full controll over where to place decorators within the EasyDAO chain. The following is an example of its use:

```java
foam.dao.EasyDAO dao = new foam.dao.EasyDAO.Builder(x)
  .setOf(MODEL_PATH.getOwnClassInfo())
  .setAuthorize(false)
  .setRuler(false)
  .setDecorator(new faom.dao.DAO1(new foam.dao.DAO2(null)))
  .setJournalName("docs")
  .setJournalType(foam.dao.JournalType.SINGLE_JOURNAL)
  .build();

dao.addDecorator(new DAO3(new DAO4(null)), DAO1.getOwnClassInfo(), false);
```

This gives the following decorator chain:

```
EasyDAO -> DAO1 -> DAO3 -> DAO4 -> DAO2 -> JDAO -> MDAO
```

#### Dynamic Modification of DAOs

The previous method can be used not only for the precise placement of decorators within the chain, but also to easily change decorator chains on the fly. Say you're doing some testing on your running server and you want to insert a decorator that checks the data flowing through the dao pipeline; simply add with the method as previously described and you'll be good to go! Light caution should be taken though, especially when dealing with DAOs that require synchronization as always.

