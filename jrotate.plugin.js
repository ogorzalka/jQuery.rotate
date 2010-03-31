/*!
 * jQuery.rotate for IE
 * http://clearideaz.com/
 *
 * Copyright (c) 2010 Olivier Gorzalka - http://clearideaz.com/
 * Licensed under the MIT license.
 */
/*
 * usage: 
 * $('.selector').rotate() // if no angle option, retrieve the standard "transform" option in the cascading style sheet
 * $('.selector').rotate({angle:50}) // force the angle value to 50 degrees
 * 
 */
 
// function to check if css transforms are available
function chk_support_transform() {
   var doc = document,
   m = doc.createElement('transform'),
   m_style = m.style,
   classes = [],
   m = f = null,
   docElement = doc.documentElement,
   properties = [ 'transformProperty', 'webkitTransform', 'MozTransform', 'mozTransform', 'oTransform', 'msTransform' ];

   for ( var i in properties ) {
      if ( m_style[ properties[i] ] !== undefined ) { return true; }
   }
   return false;
}

function chk_support_filter() {
   var doc = document,
   m = doc.createElement('filter'),
   m_style = m.style,
   classes = [],
   m = f = null,
   docElement = doc.documentElement,
   properties = [ 'filter' ];

   for ( var i in properties ) {
      if ( m_style[ properties[i] ] !== undefined ) { return true; }
   }
   return false;
}

function getTransformProperty(element) {
    var properties = ['transformProperty', 'webkitTransform', 'MozTransform', 'mozTransform', 'oTransform', 'msTransform'];
    var p;
    while (p = properties.shift()) {
        if (typeof element.style[p] != 'undefined') { return p; }
    }
    return 'transform';
}

jQuery.extend(jQuery.support, {
   'transform': chk_support_transform(),
   'filter': chk_support_filter()
});

;(function($) {
   // CSS transform proporty support
   var cssProxied = $.fn.css;
   $.fn.css = function (arg) {
       if ( typeof $.props['transform'] == 'undefined' && ( arg == 'transform' || ( typeof arg == 'object' && typeof arg['transform'] != 'undefined') ) ) {
           $.props['transform'] = getTransformProperty(this.get(0));
       }
       if (arg == 'transform') { arg = $.props['transform']; }
       return cssProxied.apply(this, arguments);
   };

   // rotate function
   $.fn.rotate = function(val) {
     if (!$.support.transform && !$.support.filter) { return; }; // if browser support transform or don't support filter, we return

     return this.each(function() {
       var $this = $(this);
       var style = $this.css('transform') || 'none';
       
       if (typeof val == 'undefined')
       {
           if (style)
           {
               if (cos = ($this.css('transform')).match(/^matrix\((.*)\)/)) {
                  sin = cos[1].split(',')[1].replace(/^\s+/g,'').replace(/\s+$/g,'');
                  angle = Math.round(Math.asin(sin)* 180/Math.PI);
               } else if (angleMatch = $this.css('transform').match(/rotate\((-?[0-9]{0,3})deg\)/)) {
                  angle = angleMatch[1]
               }
           }
       } else {
          angle = val;
       }
       if ($.support.transform) {
           $this.css({
               'transform':'rotate(' + angle +'deg)'
           });
       }
       else if ($.support.filter) {
           if (!$this.data('baseHeight')) {
              $this.data({
                 'baseHeight':$this.outerHeight(),
                 'baseWidth':$this.outerWidth()
              });
          }
          
          var baseHeight = $this.data('baseHeight'), // height of the element
             baseWidth = $this.data('baseWidth'), // width of the element
             blockDisplay = $this.css('display'), // display property
             elemFloat = $this.css('float'), // float status
             coeffMargin = (elemFloat == 'none' && blockDisplay === 'inline') ? 2 : 2, // margin coefficient
             rad = angle * (Math.PI * 2 / 360),
             costheta = Math.cos(rad), // first IE-filter property
             sintheta = Math.sin(rad), // second IE-filter property
             filter_expr = "progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand',M11="+costheta+",M12="+(-sintheta)+",M21="+sintheta+",M22="+costheta+")";
             
          // adjust appearance
          $this.css({
            position:'relative',
            overflow:'visible',
            width:(blockDisplay == 'block') ? baseWidth : 'auto',
            height:(blockDisplay == 'block') ? baseHeight : 'auto',
            display: (blockDisplay == 'inline' || blockDisplay == 'block') ? 'inline-block' : blockDisplay
          });

          $this.get(0).style.filter = filter_expr; // apply the demoniac filter
          
          // news sizes
          var newHeight = $this.outerHeight(), // new height of the element
          newWidth = $this.outerWidth(), // new width of the element
          marginTopBottom = -(newHeight-baseHeight)/coeffMargin, // margin top bottom
          marginLeftRight = -(newWidth-baseWidth)/coeffMargin; // margin left right

          var cssAfter = {};
          cssAfter['marginLeft'] = marginLeftRight;
          cssAfter['marginRight'] = marginLeftRight;
          if (elemFloat == 'left' || elemFloat == 'right' || elemFloat == 'none') 
            cssAfter['marginTop'] = marginTopBottom;
          cssAfter['marginBottom'] = marginTopBottom;
          cssAfter['transform'] = 'rotate(' + angle +'deg)';

          $this.css(cssAfter); // adjusts margins
       }
       return true;
     });
   };


   var curProxied = $.fx.prototype.cur;
   
   $.fx.prototype.cur = function () {
       if (this.prop == 'rotate') {
          return parseFloat($(this.elem).rotate());
       }
       return curProxied.apply(this, arguments);
   }

   $.fx.step.rotate = function (fx) { $(fx.elem).rotate(fx.now); }

   // Rotation animation, so cool !
   var animateProxied = $.fn.animate;
   $.fn.animate = function (prop) {
       if (typeof prop['rotate'] != 'undefined') {
           var m = prop['rotate'].toString().match(/^(([+-]=)?(-?\d+(\.\d+)?))(.+)?$/);
           prop['rotate'] = m[1];
       }

       var matchRotate = $(this).css('transform').match(/rotate\((-?[0-9]{0,3})deg\)/);
       if (!matchRotate || matchRotate[1] != m[0]) {
          return animateProxied.apply(this, arguments);
       }
   }

   var _o_css = $.fn.css;
   
   // Support for css rotate
   $.fn.css = function(prop,value){
      if (prop instanceof Array || prop instanceof Object ) {
         for(key in prop) {
            if (key.match(/^rotate$/) || key.match(/^transform$/)) {
               value = (key.match(/^rotate$/)) ? 'rotate('+prop[key]+'deg)' : prop[key];
               _o_css.call(this,'transform',value);
            }
            else {
               _o_css.call(this,key,prop[key]);
            }
         }
      }
      else if ( value && (prop == 'transform' && value.match(/rotate\(-?[0-9]{0,3}deg\)/) ) || prop == 'rotate' ) {
         value = (prop == 'rotate') ? 'rotate('+value+'deg)' : value;
         _o_css.call(this,'transform',value);
      }
      else {
         return _o_css.apply(this,arguments);
      }
   };

})(jQuery);