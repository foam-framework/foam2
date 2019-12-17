![FOAM Logo](EasyDAO.png)

# EasyDAO User Guide and Documentation

## EasyDAO Description

Creating long decorator chains is a tedious and error prone process. EasyDAO works to alleviate some of the issues of manual creation of daos and also provides a powerful way to easily modify the behaviour and usage of all daos within an application. Using EasyDAO will help create clean, easily maintanable code and save significant development time that is spent writing and debugging DAOs.

EasyDAO works by using a builder pattern, allowing building of doas by the setting of intuitinve properties. Once the properties describing the requisite function of the DAO being built are set, EasyDAO takes care of the rest, making the messy calls to the required decorators of all the DOAs and placing them all in a chain that has been set up to specifically avoid any bugs that may be caused by any local interdependancies between proxies.

&nbsp;
&nbsp;

## Setting up EasyDAO

#### Basic Setup

The most basic DAO that can be setup using EasyDAO only requires the specification of a single propery; of. This allows the EasyDAO to know what kind of objects are being placed into the DAO so it can set up the MDAO accordingly. All EasyDAO constructions end in MDAO unless otherwise specified. We will see how we casn change this behaviour later. Here is a barebones example of an EasyDAO setup,

```java
new foam.dao.EasyDAO.Builder(x)
  .setOf(MODEL_PATH.getOwnClassInfo())
  .build();
```

This creates the following decorator chain,

```
EasyDAO -> AuthorizationDAO -> RulerDAO -> MDAO
```

EassyDAO automatically taccks on itself as a decorator. As for authorization and ruler DAOs, these come automatically with every EasyDAO construction. To disable this, simply set their corresponding properties to false,

```java
new foam.dao.EasyDAO.Builder(x)
  .setOf(MODEL_PATH.getOwnClassInfo())
  .setAuthorize(false)
  .setRuler(false)
  .build();
```

&nbsp;

#### Journalling

Many application may wish to make use of the journalling abilities of foam by adding a journal to their DAOs. To do so with EasyDAO is simple. We will add a JDAO by simply specifiyng the name of our journal and the type of journal we wish to use (of which there is currently only one that defaults to foam.dao.JDAO). The type of journal is specified by an enumeration at foam.dao.JournalType from which SINGLE_JOURNAL should be used.

```java
new foam.dao.EasyDAO.Builder(x)
  .setOf(MODEL_PATH.getOwnClassInfo())
  .setAuthorize(false)
  .setRuler(false)
  .setJournalName("docs")
  .setJournalType(foam.dao.JournalType.SINGLE_JOURNAL)
  .build();
```

Our new decorator chain now looks like the following,

```
EasyDAO -> JDAO -> MDAO
```

&nbsp;

#### MiscProxies

Any other proxy can be added to the EasyDAO generated chain. Feel free to look at the various properties available in the faom.dao.EasyDAO model to get a feel for what sort of proxies you can add to your decorator chain. But most commonly, if a DAO is defined in foam.dao.*, chances are there is an EasyDAO property for it. But what if you want a client-side defined dao, or a DAO which is not yet defined within EasyDAO? EasyDAO allows you to create a cahin of ProxyDAO decorators ending in null that it will inset into the chain for you,

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
&nbsp;

## Customizing EasyDAO for the CLient Side