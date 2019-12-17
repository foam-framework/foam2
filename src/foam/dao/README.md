![FOAM Logo](EasyDAO.png)

# EasyDAO User Guide and Documentation

&nbsp

## EasyDAO Description

Creating long decorator chains is a tedious and error prone process. EasyDAO works to alleviate some of the issues of manual creation of daos and also provides a powerful way to easily modify the behaviour and usage of all daos within an application. Using EasyDAO will help create clean, easily maintanable code and save significant development time that is spent writing and debugging DAOs.

EasyDAO works by using a builder pattern, allowing building of doas by the setting of intuitinve properties. Once the properties describing the requisite function of the DAO being built are set, EasyDAO takes care of the rest, making the messy calls to the required decorators of all the DOAs and placing them all in a chain that has been set up to specifically avoid any bugs that may be caused by any local interdependancies between proxies.

&nbsp
&nbsp

## Setting up EasyDAO

&nbsp

#### Basic Setup

The most basic DAO that can be setup using EasyDAO only requires the specification of a single propery; of. This allows the EasyDAO to know what kind of objects are being placed into the DAO so it can set up the MDAO accordingly. All EasyDAO constructions end in MDAO unless otherwise specified. We will see how we casn change this behaviour later. Here is a barebones example of an EasyDAO setup,

```java
new foam.dao.EasyDAO.Builder(x)
  .setOf(MODEL_PATH.getOwnClassInfo())
  .build();
```
