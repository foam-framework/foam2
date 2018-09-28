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
        return dao.orderBy(order).where(expr.OR(expr.CONTAINS_IC(Phone.SNIPPET, search), expr.CONTAINS_IC(Phone.SNIPPET, search)));
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
        this.dao.where(expr.EQ(Phone.ID, window.location.hash.substring(1))).select().then(function (sink) {
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

foam.CLASS({
  package: 'tutorial',
  name: 'PhoneCitationView',
  extends: 'foam.u2.DetailView',

  methods: [
    function initE() {
      this
        .start('li')
          .start('a')
            .attrs({ href: '#' + this.data.id })
            .start({ class: 'foam.u2.tag.Image', data: this.data.imageUrl }).addClass('thumb').end()
          .end()
          .start('a')
            .attrs({ href: '#' + this.data.id })
            .add(this.data.name)
          .end()
          .start()
            .add(this.data.snippet)
          .end()
        .end();
    }
  ]
});
