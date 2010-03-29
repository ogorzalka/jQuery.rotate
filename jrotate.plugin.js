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
 * $('.selector').rotate({angle:50}) // force the angle value to 50 degree
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
      if ( m_style[ properties[i] ] !== undefined ) {
         return true;
      }
   }
   return false;
}

// Extend $.support.transform
jQuery.extend(jQuery.support, { 'transform': chk_support_transform() });

// $.rotate plugin
;(function($) {
   $.fn.rotate = function(options) {
      
     if ($.support.transform) { return; }; // if browser don't support transform
     
     var opts = $.extend({}, $.fn.rotate.defaults, options); // merge default options
     
     return this.each(function() {
       var $this = $(this),
       baseHeight = $this.outerHeight(), // height of the element
       baseWidth = $this.outerWidth(), // width of the element
       blockDisplay = $this.css('display'), // display property
       coeffMargin = (blockDisplay === 'inline') ? 1.4 : 2, // margin coefficient
       transformExpr = new RegExp(/rotate\((-?[0-9]{0,3})deg\)/), // rotate propertie regexp
       angleMatch = $this.addClass('ie-rotate').css('transform').match(transformExpr), // test if transform property match rotate value
       angle = (opts.angle == 'csstransform-property') ? angleMatch[1] : opts.angle, // rotation angle value
       rad = angle * (Math.PI * 2 / 360),
       costheta = Math.cos(rad), // first IE-filter property
       sintheta = Math.sin(rad), // second IE-filter property
       filter_expr = "progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand',M11="+costheta+",M12="+(-sintheta)+",M21="+sintheta+",M22="+costheta+");",

       // adjust appearance
       $this.css({
         position:'relative',
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
       
       $this.css('margin',marginTopBottom+' '+marginLeftRight); // adjusts margins
       
       return true;
     });
   };
   $.fn.rotate.defaults = { angle:'csstransform-property' }; // default property

})(jQuery);