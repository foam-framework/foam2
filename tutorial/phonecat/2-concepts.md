---
layout: tutorial-phonecat
permalink: /tutorial/phonecat/2-concepts/
tutorial: 2
---

# **PART II:  Core Concepts**

The tutorial user will need a good understanding of the following core concepts when developing an app with FOAM.

## **Defining Data Objects**

### **1. Defining the Class**

FOAM is, fundamentally, an object-oriented view and use of data.  The smallest unit of data is an object. An object is a collection of properties and methods. 

In Java, you write a class definition using special syntax. This creates a *class*  and you can use `new` to create an *instance* of that class.

FOAM's approach is similar in principle: you write a definition for the class and at runtime that creates a class which your code can instantiate.  

FOAM's class definitions take the form of a JSON object passed to the `CLASS()` global function. 

**JAVA Class Example:**  

     {% highlight java %}
     public class MyClass extends BaseClass {
       private int someField;
       public MyClass(someField) {
         this.someField = someField;  
       }
       public int getSomeField() {
         return someField;
       }
       public void setSomeField(int sf) {
         someField = sf;
       }
     }
     {% endhighlight %}


**FOAM Class Example:**

     {% highlight js %}
     foam.CLASS({
       name: 'MyClass',
       extends: 'BaseClass',
       properties: [
         {
           class: ‘Int’,
           name: 'someField'
         }
       ]
     });
     {% endhighlight %}



### **2. Parts of a Class**

In both Java and FOAM, a class includes the following parts:

1. a **name**
2. a parent class (**extends**)
3. a fundamental class (**FObject**) 
4. properties
5. methods

FOAM's classes are much richer than their Java counterparts. Unlike Java, FOAM has these additional features: 

1. FOAM properties are like public member variables and are accessed in the same way using: `point.x += 10` 
2. FOAM has `postSet` functions to call when the property's value changes the `view` to use when displaying this property to the user `expression` for spreadsheet-style reactive programming, 
3. `value` FOAM models support `constants`, mixins (known as `traits`) and special kinds of methods (`actions`, `listeners`, and `UI library`)

Please visit the [Appendix](../4-appendix) in the menu below for more information on FOAM classes.

### **3. A Simple FOAM Class Example:**

Here is a simple FOAM class:

     {% highlight js %}
     foam.CLASS({
       name: 'Point',
       properties: ['x', 'y'],
       methods: {
         function scale(s) {
           this.x *= s;
           this.y *= s;
         }
       }
     });
     {% endhighlight %}

and it can be instantiated and used like this:

     {% highlight js %}
     var p = Point.create({ x: 10, y: 20 });
     p.scale(2);
     p.x += p.y;
     console.log(p.toJSON());
     {% endhighlight %}

which will output

     {% highlight js %}
     {
       "class": "Point",
       "x": 60,
       "y": 40
     }
     {% endhighlight %}

These objects can be manipulated very much like plain old Javascript objects such as properties and methods, however, new instances are created with `MyClass.create({...})` rather than `new MyClass(...)`.  


### **4. Extending Classes** 

Classes can extend other classes which means they will inherit all of the parent class's properties and methods (and listeners, actions, etc ...).

For example:

     {% highlight js %}
     CLASS({
       name: 'Point3D',
       extends: 'Point',
       properties: ['z'],
       methods: {
         function scale(s) {
           this.SUPER(s);
           this.z *= s;
         }
       }
     });
     {% endhighlight %}

This example defines a new class `Point3D` that extends `Point`. It inherits all the properties (`x` and `y`) of `Point`, and adds a new one, `z`. It would inherit the method `scale` as well as override it. 

This overridden method calls `this.SUPER(s)` which is similar to calling `super.scale(s)` in Java.

FOAM uses these alternative spellings because `class` and `super` are reserved (but unused) words in Javascript.


### **5. Listeners, Actions and UI Library**

In both Java and FOAM, there are three kinds of special methods on a class:  

1. Listeners
2. Actions
3. UI Library

FOAM has a unique UI library called `U2` which can be used to generate UI elements of a web page. `U2` will be discussed in more detail in the Applied Learning section of this tutorial.


## **MVC**

MVC is a classic pattern for breaking up applications into reusable, decoupled components. The conventional definition of MVC is as follows:

- **Model:** Stores and represents your data.
- **View:** Presents your data to the user for viewing and editing.
- **Controller:** Mediates between model and view.

Many frameworks focus on the model and the view which are application-specific because every app needs its own data types, forms and style of presentation. But the definitions of the models and their views can be lightweight, especially if you're given some extensible, customizable components for common needs.

FOAM goes a step farther and allows controllers to be generic so that they can operate on all kinds of models and views. In many cases, FOAM's default controllers can be used to build the structure of your application, requiring you to write code only for application-specific details while the controllers provide navigation, animations, editing, searching, and more.


### **Controllers**

Most applications fall into one of a few categories. Since there are so few, it is possible to create a generic and reusable controller for each archetype of app with the right amount of abstraction on both your data and views.

For example, FOAM has a reusable `ThreePaneController` template for the ubiquitous application style a list of filters on the left, table of items on upper right, and details of selected item on bottom right on the bottom right. This archetype fits Gmail, Outlook and iTunes. Navigation is built into the controller; your app need only specify the views and provide a DAO (Data Access Objects).  DAOs will be discussed in more detail further into this tutorial.

These reusable controllers are a big part of why FOAM can develop applications so rapidly. Of course, if none of FOAM's controllers suit your needs, you can extend one or write your own. FOAM is a library and it does not limit your options.


## **Reactive Programming**

Reactive programming is a spreadsheet-like style of computation that abstracts the details of dataflow.

FOAM has excellent support for reactive programming. The programmer can specify a value in terms of others values and FOAM hooks up event listeners for the programmer to ensure the values are in sync. This saves the programmer from the burden of writing event handlers, callbacks and manual data binding.

FOAM's reactive programming support is event-driven and therefore has minimal overhead. It does not do dirty checking; rather each update to a value ripples through the data model, triggering further updates, and so on. No handlers are run when none of their inputs have changed. This is why FOAM's reactive programming support scales so well; it's still very fast with thousands of bindings.

The various ways of hooking up reactive listeners are detailed in the [Appendix](/Users/lilian/foam../4-appendix).

### **Animation**

   Animations in FOAM are similarly richer than Java.  An animation is a reactive program with time as an input.  FOAM includes a suite of animation functions that make it easy to have components ease in or out, slide smoothly, bounce, spin, orbit, and more.


## **Missing Utilities**

FOAM tries to provide many missing utilities from Javascript and web platform.  It has fast JSON and XML parsers, a parser combinator library, a `SyncManager` that can sync data for offline use, a powerful asynchronous function library, unit and regression testing. 

[comment]: <> (## Overhead)

[comment]: <> (FOAM is largely written in itself, which helps keep it compact despite all these)
[comment]: <> (features. Because of this meta-programming nature, FOAM is not very large.)

[comment]: <> (Minified and gzipped, it weighs in at 122 KB as of late November 2014. There is)
[comment]: <> (a great deal in the core codebase currently that should not be there; as FOAM)
[comment]: <> (moves towards a 1.0 release we will cut it into smaller pieces.)

Please proceed to the next stage of this tutorial, Applied Learning - a. Defining the Model.

## **[NEXT:  Part III - Applied Learning - Defining the Model](../3a-model/)**

### **Tutorial Menu:** 

1. [Getting Started](../1-gettingstarted/)
1. [Core Concepts](../2-concepts/)
1. Applied Learning: Build a Basic App with FOAM
    * [Defining the Model](../3a-model/)
    * [The Controller](../3b-dao/)
    * [UI Library](../3c-UI/)
    * [Navigation](../3d-navigation/)

* [Tutorial Overview](../0-intro/)
* [About FOAM](/foam/about/)
* [Appendix](../4-appendix/)