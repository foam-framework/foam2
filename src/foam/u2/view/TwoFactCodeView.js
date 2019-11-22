foam.CLASS({
  package: 'foam.u2.view',
  name: 'TwoFactCodeView',
  extends: 'foam.u2.View',
  requires: ['foam.u2.TextField'],

  css: `
  ^ {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
  }
  ^ input {
    border-width: 1px;
    border-radius: 5px;
    width: 48px;
    height: 48px;
    text-align: center;
    margin: 8px 14px 8px 0;
    font-size: 22px;
  }
  ^ .wrong-code {
    border-color: #f91c1c;
    background-color: #fff6f6;
  }
  `,
  properties: [
    {
      class: 'Boolean',
      name: 'incorrectCode',
    },
    {
      class: 'Int',
      name: 'currentIndex',
      value: -1,
      preSet: function(old, nu) {
        if ( this.numOfParts === 0 ) return nu;
        if ( nu < 0 || this.numOfParts === 0 ) return 0;
        if ( nu >= this.numOfParts ) return this.numOfParts - 1;
        return nu;
      }
    },
    {
      class: 'Int',
      name: 'numOfParts',
      value: 6
    },
    {
      class: 'Array',
      name: 'tokenId',
    },
  ],
  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      for ( var i = 0; i < this.numOfParts; i++ ) {
      var isFirstElement = i == 0 ? true : false;
      let v = this.TextField.create({ onKey: true });
      v.setAttribute('maxlength', 1);
      v.setAttribute('autofocus', isFirstElement);
      v.addClass('input').enableClass('wrong-code', this.incorrectCode$ );
      v.on('focus', function() {
        self.currentIndex = self.findIndexOfInput(this.id);
      });
        this.tokenId.push(v.id);
        this.tag(v).addClass(this.myClass());
        v.data$.sub(this.onDataUpdate);
        v.data$.relateFrom(this.data$, (_) => this.data.substring(0, this.currentIndex) + v.data.substring(0) + this.data.substring(this.currentIndex+1), (_) => v.data);
      }
    },
    function findIndexOfInput(id) {
      return this.tokenId.indexOf(id);
    }
  ],
  listeners: [
    {
      name: 'onDataUpdate',
      code: function() {
        this.getElementById(this.tokenId[this.currentIndex + 1]).focus();
      }
    }
  ],
});