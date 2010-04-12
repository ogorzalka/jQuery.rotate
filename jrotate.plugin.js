/*
 * jQuery.rotate for IE
 * http://clearideaz.com/
 *
 * Copyright (c) 2010 Olivier Gorzalka - http://clearideaz.com/
 * Licensed under the MIT license.
 */
/*
 * usage: 
 * $('.selector').css('transform':'rotate(50deg)') or $('.selector').css('rotate',50) // if no angle option, retrieve the standard "transform" option in the cascading style sheet
 * $('.selector').animate({transform:'rotate(-180)'}) or $('.selector').animate({'rotate:-180}) // force the angle value to 50 degrees
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

jQuery.extend(jQuery.support, {
   'transform': chk_support_transform(),
   'filter': chk_support_filter()
});


;(function($) {
   // CSS transform proporty support
   var cssProxied = $.fn.css;
   
   function getTransformProperty(element)
   {
       // Try transform first for forward compatibility
       var properties = ['transformProperty', 'webkitTransform', 'MozTransform', 'mozTransform', 'oTransform', 'msTransform'];
       var p;
       while (p = properties.shift())
       {
           if (typeof element.style[p] != 'undefined')
           {
               return p;
           }
       }
       return 'transform';
   }
   

   function _angle(expr) {
      if ( expr == 'none') {
         return 0;
      }
      if ( angleMatch = expr.toString().match(/^(rotate)?\(?(-?\d*\.?\d*)[deg]?\)?/) ) {
         return parseInt(angleMatch[2]);
      }
      return false;
   }
   
   function _css_rotate(elem,angle) {
      var raw_value = _angle(angle);
      var css3_value ='rotate('+raw_value+'deg)';
      var arg = $.props['transform'];
      if ($.support.filter) {
         ieRotate(elem,raw_value);
      }
      cssProxied.call(elem,arg,css3_value); 
   }
   
   function ieRotate(elem,angle) {
       //angle = parseInt(angle);
       if (!elem.data('baseHeight')) {
          elem.data({
             'baseHeight':elem.outerHeight(),
             'baseWidth':elem.outerWidth(),
             'marginLeft':parseInt(cssProxied.call(elem,'margin-left')),
             'marginRight':parseInt(cssProxied.call(elem,'margin-right')),
             'marginTop':parseInt(cssProxied.call(elem,'margin-top')),
             'marginBottom':parseInt(cssProxied.call(elem,'margin-bottom'))
          });
       }

       var baseHeight = elem.data('baseHeight'), // height of the element
          baseWidth = elem.data('baseWidth'), // width of the element
          dis = Math.min(baseWidth, baseHeight) / 2,
          blockDisplay = cssProxied.call(elem,'display'), // display property
          elemFloat = cssProxied.call(elem,'float'), // float status
          coeffMargin = 2, // margin coefficient
          rad = angle * (Math.PI * 2 / 360),
          cos = Math.cos(rad), // first IE-filter property
          sin = Math.sin(rad), // second IE-filter property
          filter_expr = "progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand',M11="+cos+",M12="+(-sin)+",M21="+sin+",M22="+cos+")";
       
       // adjust appearance
       cssProxied.call(elem, {
          position:'relative',
          overflow:'visible',
          width:baseWidth,
          height:baseHeight,
          display:(blockDisplay == 'inline' || blockDisplay == 'block') ? 'inline-block' : blockDisplay
       });
       cssProxied.call(elem,'filter',filter_expr);

      // news sizes
      var newHeight = elem.outerHeight(), // new height of the element
      newWidth = elem.outerWidth(), // new width of the element
      marginTopBottom = -(newHeight-baseHeight)/coeffMargin, // margin top bottom
      marginLeftRight = -(newWidth-baseWidth)/coeffMargin; // margin left right

      var cssAfter = {};
      cssAfter['marginLeft'] = marginLeftRight+elem.data('marginLeft');
      cssAfter['marginRight'] = marginLeftRight+elem.data('marginRight');
      if (elemFloat == 'left' || elemFloat == 'right' || elemFloat == 'none') 
        cssAfter['marginTop'] = marginTopBottom+elem.data('marginTop');
      cssAfter['marginBottom'] = marginTopBottom+elem.data('marginBottom');
      cssAfter['transform'] = 'rotate(' + angle +'deg)';

      cssProxied.call(elem,cssAfter);  
   }

   $.fn.css = function (arg,value) {
       if ( 
          ( typeof this.get(0) != 'undefined' && typeof $.props['transform'] == 'undefined' && ( arg == 'transform' || ( typeof arg == 'object' && typeof arg['transform'] != 'undefined') ) )
          || ( typeof this.get(0) != 'undefined' && typeof $.props['transform'] == 'undefined' && ( arg == 'rotate' || ( typeof arg == 'object' && typeof arg['rotate'] != 'undefined') ) )
           ) {
           $.props['transform'] = getTransformProperty(this.get(0));
           
           if ($.props['transform'] == 'undefined') {
              $.props['transform'] = 'none';
           }
       }

       if (arg == 'transform') { arg = $.props['transform']; }
       
       if (typeof value == 'undefined' && (arg instanceof Object) === false) {
          return cssProxied.apply(this, arguments);
       }

       else if (arg instanceof Array || arg instanceof Object) {
          for(key in arg) {
             if (key.match(/^rotate$/) || key.match(/^transform$/)) {
                _css_rotate(this,arg[key]);
             }
             else {
                cssProxied.call(this,key,arg[key]);
             }
          }
       }
       else if ( (arg == 'transform' && _angle(value) ) || arg == 'rotate' ) {
          _css_rotate(this,value);
       } else {
          cssProxied.call(this,arg,value);
       }
       return this;
   };

   // We override the animation for all of these color styles
   $.each(['rotate','transform'], function(i,attr){
      $.fx.step[attr] = function(fx) {
      if ( fx.state == 0 ) {
        fx.start = (typeof $( fx.elem ).css('transform') == 'undefined') ? 0 : _angle( $( fx.elem ).css('transform') );
        fx.end = _angle( fx.end );
      }
      $(fx.elem).css('rotate',fx.now);
    };
   });

})(jQuery);