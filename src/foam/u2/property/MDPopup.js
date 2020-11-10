/**
* @license
* Copyright 2020 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/


foam.CLASS({
  package: 'foam.u2.property',
  name: 'MDPopup',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.property.MenuElement'
  ],

  imports: [
    'window',
    'setTimeout'
  ],

  exports: [
    'as popup'
  ],

  documentation: 'A floating menu that pops up, positioning itself over the ' +
      'element that launches it with $$DOC{ref:".open"}.',

  properties: [
    ['hMargin', 8],
    ['vMargin', 8],
    ['maxDisplayCount', 5],
    ['itemHeight', 48],
    ['itemWidth', 100],
    ['isHidden', true],
    ['removeTimeout', 0],
    ['isClosing', false],
    'choices',
    'data',
    'index'
  ],

  methods: [
    function open(index, sourceElement) {
      /* Launches the menu, with the given selected item index, animating out
         from the given sourceElement's client rect. */
      var startingClientRect = sourceElement.getBoundingClientRect();
      var vp = {
        height: this.window.innerHeight || this.document.documentElement.clientHeight,
        width: this.window.innerWidth || this.document.documentElement.clientWidth
      };
      this.itemHeight = startingClientRect.height;
      this.itemWidth = startingClientRect.width - 16;

      var pxAbove = startingClientRect.top - this.vMargin - 4;
      var pxBelow = vp.height - startingClientRect.bottom - this.vMargin - 4;

      // "Slots" represent potential screen real estate for drawing the menu.
      var slotsAbove = Math.floor((pxAbove > 0) ? pxAbove / this.itemHeight : 0);
      var slotsBelow = Math.floor((pxBelow > 0) ? pxBelow / this.itemHeight : 0);
      // "Items" are the menu items going into these slots.
      var itemsAbove = index;
      var itemsBelow = this.choices.length - index - 1;

      // Show as many choices as there is room for, capped by how many we have
      // and by the maxDisplayCount (usually 5).
      var menuCount = Math.min(this.choices.length, this.maxDisplayCount,
          slotsAbove + slotsBelow + 1);
      var halfMenuCount = Math.floor(menuCount / 2);

      // If scrolling, this becomes the scroll offset.
      var itemForFirstSlot = 0;
      // If the selecteditem can't be in the best place, we animate it from the
      // start rect by this many slots. Negative offset means move up.
      var selectedOffset = 0;

      if ( menuCount < this.choices.length ) { // Scrolling required.
        // Check if there are enough slots to center the selected item.
        if ( itemsBelow >= halfMenuCount && itemsAbove >= halfMenuCount &&
            slotsAbove >= halfMenuCount && slotsBelow >= halfMenuCount ) {
          slotsAbove = halfMenuCount;
          slotsBelow = menuCount - slotsAbove - 1;
          selectedOffset = 0;
          itemForFirstSlot = index - slotsAbove;
        } else if ( itemsAbove <= slotsAbove && itemsAbove < menuCount ) {
          // Not enough items above, so we truncate and scroll to the top.
          slotsAbove = Math.min(slotsAbove, Math.max(itemsAbove, menuCount - slotsBelow - 1));
          selectedOfset = itemsAbove - slotsAbove;
          itemForFirstSlot = 0; // Scroll to top.
          slotsBelow = Math.min(slotsBelow, menuCount - slotsAbove - 1);
        } else if ( itemsBelow <= slotsBelow && itemsBelow < menuCount ) {
          // Not enough items below, so truncate and scroll to the bottom.
          slotsBelow = Math.min(slotsBelow, Math.max(itemsBelow, menuCount - slotsAbove - 1));
          selectedOffset = -(itemsBelow - slotsBelow);
          itemForFirstSlot = this.choices.length - menuCount; // Scroll to end.
          slotsAbove = Math.min(slotsAbove, menuCount - slotsBelow - 1);
        } else {
          // Use all slots, scroll to put the selected index exactly where it
          // should be. Make sure we never try to use too many slots.
          if ( slotsAbove < halfMenuCount ) {
            slotsBelow = Math.min(slotsBelow, menuCount - slotsAbove - 1);
          } else if ( slotsBelow < halfMenuCount ) {
            slotsAbove = Math.min(slotsAbove, menuCount - slotsBelow - 1);
          } else {
            slotsAbove = Math.min(slotsAbove, halfMenuCount);
            slotsBelow = Math.min(slotsBelow, menuCount - slotsAbove - 1);
          }

          selectedOffset = 0;
          itemForFirstSlot = index - slotsAbove;
        }
      } else {
        // No scrolling. The list wants to be centered on the selected index,
        // but may have to move up or down to fit in slotsAbove/Below.
        if ( itemsAbove > slotsAbove ) {
          selectedOffset = itemsAbove - slotsAbove;
          slotsBelow = menuCount - slotsAbove - 1;
        } else if ( itemsBelow > slotsBelow ) {
          selectedOffset = -(itemsBelow - slotsBelow);
          slotsAbove = menuCount - slotsBelow - 1;
        } else {
          selectedOffset = 0;
          slotsAbove = itemsAbove;
          slotsBelow = itemsBelow;
        }
        // ASSERT: slotsAbove + slotsBelow + 1 === menuCount
        itemForFirstSlot = 0; // Slots are always clamped exactly as needed.
      }

      // At this point, slotsAbove and slotsBelow are the actual screen areas
      // we're definitely using.
      // We update menuCount to the real count we're going to use.
      menuCount = Math.min(menuCount, slotsAbove + slotsBelow + 1);

      // If we couldn't fit so that our selected item is in the right place,
      // animate it up or down into the place it will appear in the list.
      // TODO: Or add empty entries to leave open space?
      if ( selectedOffset !== 0 ) {
        // TODO: Animate this.
      }

      var bodyRect = this.document.body.getBoundingClientRect();
      var finalRect = {
        top:    -bodyRect.top + startingClientRect.top - (slotsAbove * this.itemHeight) - 2,
        bottom: -bodyRect.top + startingClientRect.top + startingClientRect.height + (slotsBelow * this.itemHeight) + 2 + this.vMargin * 2,
        height: ( menuCount + 2 ) * this.itemHeight + this.vMargin * 2,
        left: -bodyRect.left + startingClientRect.left - 2 - this.hMargin,
        right: -bodyRect.left + startingClientRect.left + startingClientRect.width + 2,
        width: startingClientRect.width + this.hMargin * 2 + 4
      };

      this.delegate_ = this.MenuElement.create({
        choices: this.choices,
        data: this.data$,
        autoSetData: this.autoSetData,
        itemHeight: this.itemHeight,
        itemWidth: this.itemWidth,
        hMargin: this.hMargin,
        index$: this.index$
      });

      sourceElement.insertAdjacentHTML('beforeend', this.delegate_.outerHTML);
      this.delegate_.load();

      this.initializePosition(startingClientRect, finalRect);
      this.scrollToIndex(itemForFirstSlot);
      this.animateToExpanded();
    },

    function initializePosition(startingClientRect, finalRect) {
      var vDiff = startingClientRect.top - finalRect.top +
          startingClientRect.height / 2;
      var transformOrigin = '0 ' + vDiff + 'px';

      this.delegate_.style({
        padding: '0px 0px ' + this.vMargin * 2 + 'px 0px',
        height: finalRect.height + 'px',
        bottom: -finalRect.height - 40 + 'px',
        width: '100%',
        'z-index': 10,
        transition: 'all 0.5s ease-in-out',
        transform: 'scaleY(0)'
      });
    },

    function animateToExpanded() {
      this.delegate_.style({
        transition: 'transform cubic-bezier(0.0, 0.0, 0.2, 1) .1s',
        transform: 'scaleY(1)',
        '-webkit-transform': 'scaleY(1)',
      });
      this.isHidden = false;
    },

    function animateToHidden() {
      this.isHidden = true;
      this.delegate_.style({
        transition: 'opacity cubic-bezier(0.4, 0.0, 1, 1) .1s',
        opacity: '0',
        'pointer-events': 'none'
      });
    },

    function close() {
      if ( this.isClosing ) return;
      this.isClosing = true;
      this.animateToHidden();
      this.removeTimeout = this.setTimeout(function() {
        this.delegate_.remove();
        this.delegate_ = null;
      }.bind(this), 500);
    },

    function scrollToIndex(index) {
      // Three cases: in view, need to scroll up, need to scroll down.
      // Determine the parent's scrolling bounds first:
      var e = this.delegate_.children[index];
      // TODO(braden): This sucks and needs fixing.
      if ( ! e ) return;

      this.delegate_.el().scrollTop = e.el().offsetTop - this.vMargin;
    }
  ]
});
