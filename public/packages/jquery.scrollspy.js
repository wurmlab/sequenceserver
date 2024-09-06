/**
 * A jQuery Plugin for a ScrollSpy Navigation.
 * v1.0.1
 * MIT license
 * 
 */

 ( function($){
  $.fn.scrollSpy = function(options){
    var $Root = $('html');
    var rootScrollBehavior = $Root.css('scroll-behavior');
    var settings = $.extend( {
      offset: 0,
      offsetElement: null,
      activeClass: 'active',
      anchors: ['a[href*=\\#]'],
      ignoreAnchors: [],
      scrollDuration: 0,
      scrollEasing: 'swing',
    }, options );
    
    if( $.ui === undefined ) {
      // Fallbacks if jQuery UI is not loaded
      settings = $.extend( settings, {
        scrollEasing: 'swing'
      } );
    }
    
    var scrollTo = function(hash){
      var $Target = $(hash);
      if ( $Target.length ) {
        $Root.css( 'scroll-behavior', 'unset' ); // jquery.animate is not compatible with "scroll-behavior: smooth;"
        $Root.animate( { scrollTop: $Target.offset().top - settings.offset }, { 
          duration: settings.scrollDuration,
          easing: settings.scrollEasing,
        } );
        setTimeout(function(){
          $Root.css('scroll-behavior', rootScrollBehavior);
        }, settings.scrollDuration);
      }
    }
    
    var update = function(){
      // update offset
      if ( $(settings.offsetElement).length ) {
        settings = $.extend( settings, {
          offset: $(settings.offsetElement).height(),
        } );
      }
    }
    update();
    $(window).on('resize', update);
    
    $(window).on('load', function(){
      if (location.hash) {
        scrollTo(location.hash);
      }
    });
    
    return this.each(function(){
      var $ScrollSpy = this;
      var $Anchors = $();
      var scrollMap = [];
      var activeNavElement = undefined;
      
      if ( Array.isArray( settings.anchors ) ) {
        settings.anchors.forEach( function(e) {
          $Anchors = $Anchors.add( $($ScrollSpy).find(e) );
        } );
      }

      if ( Array.isArray( settings.ignoreAnchors ) ) {
        settings.ignoreAnchors.forEach( function(e) {
          $Anchors = $Anchors.filter(':not(' + e + ')');
        } );
      }
      
      var updateScrollMap = function(){
        $Anchors.each((i,el) => {
          var $Target = $(el.hash);
          
          if ( $Target.length ) {
            scrollMap.push({
              navElement: el,
              targetOffset: $Target.offset(),
              targetHeight: $Target.outerHeight(),
            });
          }
        });
        scrollMap.sort(function(a,b){
          return a.targetOffset.top - b.targetOffset.top;
        })
        scrollMap.reverse();
      }
      updateScrollMap();
      $(window).on('resize', updateScrollMap);
      
      var scrollSpy = function(){
        var scrollPos = $(document).scrollTop() + settings.offset;
        var posElement = scrollMap.find(function(el){
          if ( el.targetOffset.top <= scrollPos ) {
            if ( el.targetOffset.top + el.targetHeight >= scrollPos ) {
              return true;
            }
          }
        });
        
        if ( posElement && posElement.navElement != activeNavElement ) {
          $(activeNavElement).removeClass(settings.activeClass);
          $(posElement.navElement).addClass(settings.activeClass);
          activeNavElement = posElement.navElement;
        } else if (!posElement) {
          $(activeNavElement).removeClass(settings.activeClass);
          activeNavElement = undefined;
        }
      };
      scrollSpy();
      $(document).on('scroll', scrollSpy);
      
      $Anchors.click(function(e){
        e.preventDefault();
        var hash = e.currentTarget.hash;        
        history.pushState({}, '', hash);
        scrollTo(hash);
      });
    });
  }
})(jQuery);