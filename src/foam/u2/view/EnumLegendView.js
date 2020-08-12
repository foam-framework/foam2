foam.CLASS({
  package: 'foam.u2.view',
  name: 'EnumLegendView',
  extends: 'foam.u2.View',

  css: `
  ^container {
    border-style: solid;
    border-width: thin;
  }
  ^eachValue {
    display: inline-flex;
    padding: 12px;
    text-align: justify;
  }
  ^badge {
    float: right;
    height: 24px;
    border-radius: 12px;
    margin-top: 12px;
    margin-right: 7px;
    width: 71px;

    padding: 0 8px;
    background-color: #b5b5b5;

    font-family: IBMPlexSans;
    font-size: 11px;
    font-weight: 500;
    font-style: normal;
    font-stretch: normal;
    line-height: 24px;
    letter-spacing: normal;
    text-align: center;
    color: #ffffff;
  }

  `,
  properties: [
    {
      class: 'Class',
      name: 'of'
    },
    {
      class: 'Array',
      name: 'enumValueToHide'
    }
  ],
  methods: [
    function initE() {
      this.SUPER();

      this.start().addClass(this.myClass('container'))
      .start('h3').add('Status Legend').end()
      .add(this.of.VALUES
        .filter(
          statusEnum => ! this.enumValueToHide.includes(statusEnum.name))
        .map(
          statusEnum => {
            return this.E().start().addClass(this.myClass('eachValue'))
              .start().add(
                foam.u2.view.ReadOnlyEnumView.create({
                  data: statusEnum
                }).addClass(this.myClass('badge'))
                .style({ 'background-color': statusEnum.background })
              ).end()
              .start().add(statusEnum.documentation).end()
            .end();
          }
      ))
      .end();
    }
  ]
});
