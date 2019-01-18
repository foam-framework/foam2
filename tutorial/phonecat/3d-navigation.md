---
layout: tutorial-phonecat
permalink: /tutorial/phonecat/3d-navigation/
tutorial: 3d
---
# **Part III - Applied Learning - Navigation**

FOAM's generic controllers can handle the navigation of your app. In this tutorial, you'll do navigation by hand to demonstrate
custom UI components and other concepts.

## **Tutorial Application**

**STEP #1.** Expand the `Controller` to make to decide whether to show  a single phone's page or the list. Expand it to look like this:

{% highlight js %}
foam.CLASS({
  package: 'tutorial',
  name: 'Controller',
  extends: 'foam.u2.Element',

  exports: [
    'as data',
  ],

  properties: [
    {
      name: 'search',
      class: 'String',
      view: { class: 'foam.u2.TextField', onKey: true }
    },
    {
      name: 'order',
      value: Phone.NAME,
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          [Phone.NAME, 'Alphabetical'],
          [Phone.AGE, 'Newest']
        ]
      }
    },
    { name: 'dao', value: phones },
    {
      name: 'filteredDAO',
      class: 'foam.dao.DAOProperty',
      view: {
        class: 'foam.u2.DAOList',
        rowView: { class: 'tutorial.PhoneCitationView' }
      },
      expression: function (dao, search, order) {
        var expr = foam.mlang.Expressions.create();
        return dao.orderBy(order).where(expr.OR(
          expr.CONTAINS_IC(Phone.SNIPPET, search), 
          expr.CONTAINS_IC(Phone.SNIPPET, search)));
      }
    },
    'image'
  ],

  methods: [
    function initE() {
      this.initHTML();
      window.addEventListener('hashchange', this.initHTML.bind(this));
    },

    function initHTML() {
      var self = this;
      this.removeAllChildren();

      if (window.location.hash) {
        var expr = foam.mlang.Expressions.create();
        this.dao.where(expr.EQ(Phone.ID, 
            window.location.hash.substring(1))).select()
          .then(function (sink) {
            var phone = sink.a[0];
            self.add(tutorial.PhoneDetialView.create({ data: phone }));
          })
      } else {
        this
          .add('Search: ').add(this.SEARCH)
          .br()
          .add('Sort by: ').add(this.ORDER)
          .br()
          .start('ul')
            .addClass('phones').add(this.FILTERED_DAO)
          .end();
      }
    }
  ]
});
{% endhighlight %}

#### **About the Above Code:**

1. The original `Controller` is now the `else` branch; what will be shown when `window.location.hash` is empty.
2. You're navigating by setting `window.location.hash` to the `id` of the phone we want to see.
3. In that first branch, you created a `PhoneDetailView` which you'll define shortly. You told it what `model` it should display as a view. 
4. You added `PhoneDetailView` to the view’s list of child views by calling add().
5. You looked up the phone in the master `dao`, not the filtered one, for the phone whose ID is equal to the one in the hash, with the leading # chopped off.
6. You called `select()` to retrieve the result which used the default `ArraySink` and put the results in an `a` property.
7. You also added an `initE` method. This is similar to a constructor and is called during `ControllerView.create()`.
8. Your `initE` added a listener to the `hashchange` event which will re-render the page and add the corresponding UI components to the view.


**STEP #2.** Now you need to define `PhoneDetailView`. As you did before, simply define it as an empty subclass of `DetailView`:

{% highlight js %}
foam.CLASS({
  package: 'tutorial',
  name: 'PhoneDetialView',
  extends: 'foam.u2.DetailView',

  properties: [
    'image'
  ],

  methods: [
    function initE() {
      var self = this;
      this.image = this.data.imageUrl;
      function checkmark(b) { return b ? '\u2713' : '\u2718'; }
      console.log('Found phone: ' + this.data.id);
      this
        .start('div')
          .start({ class: 'foam.u2.tag.Image', data: this.image$ })
            .addClass('phone_images').end()
          .end()
          .start('h1')
            .add(this.data.name)
          .end()
          .start('p')
            .add(this.data.description)
          .end()
          .br()
        .end();
      this.data.images.forEach(function (image) {
        self
          .start('ul')
            .start({ class: 'foam.u2.tag.Image', data: image })
              .addClass('thumb')
              .on('click', function (e) {
                self.image = image;
              })
            .end()
          .end();
      });
      this
        .start('ul').addClass('specs')
          .start('li')
            .start('span')
              .add('Availability and Network')
            .end()
            .start('dt')
              .add('Availability')
            .end()
          .end()
        .end()
      this.data.availability.forEach(function (availability) {
        self
          .start('dd')
            .add(availability)
          .end();
      });
      this
        .br()
        .start('ul')
          .addClass('specs')
          .start('li')
            .start('span')
              .add('Battery')
            .end()
            .start('dt')
              .add('Type')
            .end()
            .start('dd')
              .add(this.data.battery.type)
            .end()
            .start('dt')
              .add('Talk Time')
            .end()
            .start('dd')
              .add(this.data.battery.talkTime)
            .end()
            .start('dt')
              .add('Standby time (max)')
            .end()
              .start('dd')
                .add(this.data.battery.standbyTime)
              .end()
            .end()
        .end()
        .br()
        .start('ul')
          .addClass('specs')
          .start('li')
            .start('span')
              .add('Storage and Memory')
            .end()
            .start('dt')
              .add('RAM')
            .end()
            .start('dd')
              .add(this.data.storage.ram)
            .end()
            .start('dt')
              .add('Internal Storage')
            .end()
            .start('dd')
              .add(this.data.storage.flash)
            .end()
          .end()
        .end()
        .br()
        .start('ul')
          .addClass('specs')
          .start('li')
            .start('span')
              .add('Connectivity')
            .end()
            .start('dt')
              .add('Network Support')
            .end()
            .start('dd')
              .add(this.data.connectivity.cell)
            .end()
            .start('dt')
              .add('WiFi')
            .end()
            .start('dd')
              .add(this.data.connectivity.bluetooth)
            .end()
            .start('dt')
              .add('Infrared')
            .end()
            .start('dd')
              .add(checkmark(this.data.connectivity.infrared))
            .end()
            .start('dt')
              .add('GPS')
            .end()
            .start('dd')
             .add(checkmark(this.data.connectivity.gps))
           .end()
          .end()
        .end()
        .br()
        .start('ul')
          .addClass('specs')
          .start('li')
            .start('span')
              .add('Android')
            .end()
            .start('dt')
              .add('OS Version')
            .end()
            .start('dd')
              .add(this.data.android.os)
            .end()
            .start('dt')
              .add('UI')
            .end()
            .start('dd')
              .add(this.data.android.ui)
            .end()
          .end()
        .end()
        .br()
        .start('ul')
          .addClass('specs')
            .start('li')
              .start('span')
                .add('Size and Weight')
              .end()
              .start('dt')
                .add('Dimensions')
              .end()
            .end()
          .end()
        .end()
      this.data.sizeAndWeight.dimensions.forEach(function (dim) {
        self
          .start('dd')
            .add(dim)
          .end();
      });
      this
        .start('dt')
          .add('Weight')
        .end()
        .start('dd')
          .add(this.data.sizeAndWeight.weight)
        .end()
        .br()
        .start('ul')
          .addClass('specs')
          .start('li')
            .start('span')
              .add('Display')
            .end()
            .start('dt')
             .add('Screen size')
            .end()
            .start('dd')
              .add(this.data.display.screenSize)
            .end()
            .start('dt')
              .add('Screen resolution')
            .end()
            .start('dd')
              .add(this.data.display.screenResolution)
            .end()
            .start('dt')
              .add('Touch screen')
            .end()
           .start('dd')
              .add(checkmark(this.data.display.touchScreen))
            .end()
          .end()
        .end()
        .br()
        .start('ul')
          .addClass('specs')
          .start('li')
            .start('span')
              .add('Hardware')
            .end()
            .start('dt')
              .add('CPU')
            .end()
            .start('dd')
              .add(this.data.hardware.cpu)
           .end()
            .start('dt')
              .add('USB')
            .end()
            .start('dd')
              .add(this.data.hardware.usb)
            .end()
            .start('dt')
              .add('Audio / headphone jack')
            .end()
            .start('dd')
              .add(this.data.hardware.audioJack)
            .end()
            .start('dt')
              .add('FM Radio')
            .end()
           .start('dd')
              .add(checkmark(this.data.hardware.fmRadio))
            .end()
           .start('dt')
              .add('Accelerometer')
           .end()
           .start('dd')
             .add(checkmark(this.data.hardware.accelerometer))
            .end()
          .end()
        .end()
        .br()
        .start('ul')
          .addClass('specs')
          .start('li')
            .start('span')
              .add('Camera')
            .end()
            .start('dt')
              .add('Primary')
            .end()
            .start('dd')
              .add(this.data.camera.primary)
            .end()
            .start('dt')
              .add('Features')
            .end()
            .start('dd')
              .add(this.data.camera.features.join(', '))
            .end()
          .end()
        .end()
        .br()
        .start('ul')
          .addClass('specs')
          .start('li')
            .start('span')
              .add('Additional Features')
            .end()
            .start('dd')
              .add(this.data.additionalFeatures)
            .end()
          .end()
        .end()
    }
  ]
});
{% endhighlight %}

There’s quite a lot there but it’s mostly the same pattern repeated for each group of specs. 

#### **About the Above Code:**

The `$` appended to `this.image`. `this.image$` is `a slot` (object-oriented pointer) of `this.image`. Its value is bound to `this.image` and changes every time `this.image` changes.

Once you’ve got this file saved, reload the app and navigate to a phone.  You should see its information nicely laid out. Clicking a thumbnail image will load the larger version.


## **Finished**

And that's the complete app! Hopefully you now have a better feel for the steps for building a FOAM app and are ready to start building your own.

See the Appendix from the below menu for further reading.


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