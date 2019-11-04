foam.INTERFACE({
  package: 'foam.test.testdata',
  name: 'StringProducer',
  methods: [
    {
      name: 'nextValue',
      type: 'String'
    }
  ]
})

foam.CLASS({
  package: 'foam.test.testdata',
  name: 'RandomStringProducer',
  implements: ['foam.test.testdata.StringProducer'],
  // Note: it may be useful to create AvoidDuplicateRandomStringProducer

  javaImports: [
    'java.util.Random',
    'java.util.ArrayList'
  ],

  properties: [
    {
      name: 'values',
      class: 'StringArray',
    },
    {
      name: 'rng',
      class: 'Object',
      javaType: 'java.util.Random',
      javaFactory: `return new Random();`
    }
  ],

  methods: [
    {
      name: 'nextValue',
      type: 'String',
      code: function () {
        return this.values[
          Math.floor(Math.random() * this.values.length)];
      },
      javaCode: `
        return getValues()[getRng().nextInt(getValues().length)];
      `
    }
  ]
})

foam.CLASS({
  package: 'foam.test.testdata',
  name: 'RandomHexStringProducer',
  extends: 'foam.test.testdata.RandomStringProducer',

  javaImports: [
    'java.util.UUID'
  ],

  methods: [
    {
      name: 'nextValue',
      javaCode: `
        return UUID.randomUUID().toString().replace("-","");
      `
    }
  ]
})

foam.CLASS({
  package: 'foam.test.testdata',
  name: 'RandomFirstNameProducer',
  extends: 'foam.test.testdata.RandomStringProducer',

  javaImports: [
    'java.util.List',
    'java.util.Arrays'
  ],

  properties: [
    {
      name: 'values',
      javaFactory: `
        return new String[]{
          "Levin", "Merilyn", "Eunice", "Hamid", "Yorgos", "Verne", "Merle", "Trixi", "Saunderson", "Malva", "Avie", "Rance", "Abrahan", "Lethia", "Krystalle", "Robbi", "Jinny", "Kristofer", "Pierrette", "Romain", "Ricky", "Manon", "Rodolphe", "Morly", "Jillian", "Jarvis", "Brewer", "Gayel", "Marjorie", "Carlita", "Gabriela", "Culley", "Normie", "Luz","Florinda", "Dael", "Nomi", "Weber", "Dore", "Ward", "Neile", "Slade", "Paxton", "Helyn", "Meggi", "Rheta", "Sari", "Agosto", "Cyril", "Rachelle", "Andrew", "Janifer", "Ashli", "Tobi", "Odessa", "Richart", "Shermy", "Royall", "Lorna", "Haily", "Kaile", "Emmery", "Babette", "Daveen", "Barton", "Cos","Brenn", "Tabbie", "Kare", "Allyn", "Leese", "Annabel", "Dilly", "Lilli", "Heda", "Fabiano", "Gasparo", "Wilmette", "Tricia", "Grove", "Leigha", "Cris", "Leora", "Dick", "Linda", "Madalyn", "Helen-elizabeth", "Lia","Britni", "Annelise", "Pattie", "Alf", "Erin", "Kara-lynn", "Smitty", "Ashley", "Lorant", "Lorie","Florinda", "Parker"};
      `
    }
  ]
})

foam.CLASS({
  package: 'foam.test.testdata',
  name: 'RandomLastNameProducer',
  extends: 'foam.test.testdata.RandomStringProducer',

  javaImports: [
    'java.util.List',
    'java.util.Arrays'
  ],

  properties: [
    {
      name: 'values',
      javaFactory: `
        return new String[]{
          "Risby", "Latter", "Fleetham", "Summerill", "Casina", "Dillingstone", "Weedall", "Bonnick", "Janusz", "Capron", "Weston", "Dwyr", "Duffie", "Collelton", "Castard", "Burrage", "Catherall", "Janouch", "Fawson", "Jowitt", "Maty","Rosin", "Jennaway", "Gaenor", "Heggadon", "Mapam", "Baxster", "Kinvan", "Weyland", "Yurocjhin", "Piatkow", "Fransewich", "Banister", "Puckham", "Cozens", "Grima", "Bradneck", "Habben", "Hanway", "Rubenchik", "Kingswood", "Lofty", "Penswick", "Acaster", "Goadsby", "Gartery", "Maria", "Renshall", "Teasdale", "Baron", "Sarre", "Fordy", "Cathesyed", "Eliasson", "Covotto", "Garrod", "Ledbetter", "McKinney", "Smallridge", "Keysall", "Giraldez", "Broxis", "Abdie", "Kahen", "Redsall", "Kershaw", "Spiniello", "Finlason", "Lyokhin", "Paull", "Churchlow", "Sedworth", "Pratchett", "McConway", "Humphris", "Zelley", "Pennells", "Whitehorne", "Walder", "Bevans", "Hawler", "Styles", "Skippings", "Battersby", "Stell", "Snowdon", "Hoonahan", "Guard", "Roma", "Cowton", "Cicetti", "Milton-White", "Van Eeden", "Levane", "Cleghorn", "Cleaver", "Rosenstein", "Jobey", "Northam", "Spatarul"};
      `
    }
  ]
})

foam.CLASS({
  package: 'foam.test.testdata',
  name: 'RandomEmailProducer',
  extends: 'foam.test.testdata.RandomStringProducer',

  javaImports: [
    'java.util.Random'
  ],

  properties: [
    {
      name: 'emailDomains',
      class: 'StringArray',
      javaFactory: `
        return new String[]{"hotmail.com","gmail.com","nanopay.net","yahoo.ca"};
      `
    },
    {
      name: 'firstNameProducer',
      class: 'FObjectProperty',
      of: 'foam.test.testdata.StringProducer',
      factory: function () {
        return foam.test.testdata.RandomFirstNameProducer.create();
      },
      javaFactory: `
        return new foam.test.testdata.RandomFirstNameProducer();
      `
    },
    {
      name: 'lastNameProducer',
      class: 'FObjectProperty',
      of: 'foam.test.testdata.StringProducer',
      factory: function () {
        return foam.test.testdata.RandomFirstNameProducer.create();
      },
      javaFactory: `
        return new foam.test.testdata.RandomFirstNameProducer();
      `
    },
    {
      name: 'emailDomainProducer',
      class: 'FObjectProperty',
      of: 'foam.test.testdata.StringProducer',
      factory: function () {
        return foam.test.testdata.RandomStringProducer.create({
          'values': this.emailDomains
        });
      },
      javaFactory: `
        return new foam.test.testdata.RandomStringProducer.Builder(getX())
          .setValues(getEmailDomains())
          .build();
      `
    },
    {
      name: 'rng',
      tags: ['java'],
      javaType: 'java.util.Random',
      javaFactory: `return new Random();`
    }
  ],

  methods: [
    {
      name: 'nextValue',
      code: function () {
        return this.firstNameProducer.nextValue().toLowerCase() + "." +
          this.lastNameProducer.nextValue().toLowerCase() + "_" +
          Math.floor(Math.random()*8999+1000) + "@" +
          this.emailDomainProducer.nextValue();
      },
      javaCode: `
        return getFirstNameProducer().nextValue().toLowerCase() + "." +
          getLastNameProducer().nextValue().toLowerCase() + "_" +
          String.valueOf(getRng().nextInt(8999)+1000) + "@" +
          getEmailDomainProducer().nextValue();
      `
    }
  ]
})