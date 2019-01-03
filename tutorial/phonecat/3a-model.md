---
layout: tutorial-phonecat
permalink: /tutorial/phonecat/3a-model/
tutorial: 3a
---
# **Part III - Applied Learning - Defining the Model**

In Part III of this tutorial, we will build a basic FOAM app while we further explore the core concepts described in the last chapter. After completing these lessons and exercise, the user will have a basic understanding of how to use FOAM to build basic apps.

The app we're going to build here is shamelessly borrowed from the
[AngularJS tutorial](https://docs.angularjs.org/tutorial). It is a simple catalog app that shows a collection of (amusingly outdated) smartphones. It has two views: one for the list of phones and the other for the details of one phone.

You can see the finished app running live [here](../../index.html).

## **Defining the Model**

The first step to any FOAM application is to define the data model: the M of MVC.

For example, the model for an email client might consist of a handful of classes: `Email`, `Attachment`, `Contact`, and maybe `Thread` and `Label`.  Your application has only one class in its Model: `Phone`. `Phone` has many properties; most of them giving the specifications of the device.

## **Tutorial Application**

**STEP 1:** Enter the following code in `$PROJECT/Phone.js`:

     {% highlight js %}
     foam.CLASS({
       name: 'Phone',
       properties: [
         'id', 'age', 'name', 'snippet', 'additionalFeatures', 'android',
         'availability', 'battery', 'camera', 'connectivity', 'display',
         'description', 'hardware', 'sizeAndWeight', 'storage', 'details',
         { name: 'imageUrl', view: 'foam.u2.ImageView' },
         { name: 'images', class: 'StringArray' }
       ]
     });
     {% endhighlight %}


#### **About the Above Code:**

* Providing just the name of a property (`'age'`, `'snippet'`, `'battery'` and so on) is equivalent to `{ name: 'age' }`.

* Most of these properties are straightforward; just the data about each phone.  However, below is a list of notable properties: 

  1. `id` is not required, but it's generally a good idea for objects to have a primary key. If you have an `id` property, that's the primary key. Failing that, the first property in the `properties` array is the primary key.

  2. `imageUrl` has `view` specified as `ImageView` so that when we render it in a view, an `ImageView` will be created for it.

  3. `images` is defined as a `StringArray` which handles array-valued properties better than the default generic property.



## **Conclusion**

If this class doesn't seem to do much that's because it doesn't. This simply specifies what properties there are and a few extra details about some of them.  However,  like all great ideas, your app needs a basis for how it will materialize into the real world, and hence defining the model is the first step to writing a great app with FOAM. 

After entering the above code you will have defined the model for your app.  Please have the tutorial bundle ready and select NEXT below to proceed to your next lesson on DAOs and controllers in FOAM.

## **[NEXT:  Part III - Applied Learning - The Controller](../3b-dao/)**

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