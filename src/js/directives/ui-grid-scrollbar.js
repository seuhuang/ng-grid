(function(){
// 'use strict';

var app = angular.module('ui.grid.scrollbar', []);

app.directive('uiGridScrollbar', ['$log', '$document', 'GridUtil', function($log, $document, GridUtil) {
  return {
    replace: true,
    // priority: 1000,
    templateUrl: 'ui-grid/ui-grid-scrollbar',
    require: '?^uiGrid',
    scope: false,
    link: function(scope, elm, attrs, uiGridCtrl) {
      if (uiGridCtrl === undefined) {
        $log.warn('[ui-grid-scrollbar] uiGridCtrl is undefined!');
      }

      $log.debug('ui-grid-scrollbar link');

      function updateScrollbar(gridScope) {
        var scrollbarHeight = Math.max(35, gridScope.options.viewportHeight / gridScope.options.canvasHeight * gridScope.options.viewportHeight);

        gridScope.scrollbarStyles = '.grid' + gridScope.gridId + ' .ui-grid-scrollbar-vertical { height: ' + scrollbarHeight + 'px; }';
      }

      scope.showScrollbar = function() {
        // return uiGridCtrl.canvas[0].scrollHeight > uiGridCtrl.viewport[0].scrollHeight;
        return true;
      };

      if (uiGridCtrl) {
        uiGridCtrl.styleComputions.push(updateScrollbar);
      }

      var startY = 0,
          y = 0;
      
      // Get the height of the scrollbar, including its margins
      var elmHeight = GridUtil.elementHeight(elm, 'margin');

      // Get the "bottom bound" which the scrollbar cannot scroll past
      var elmBottomBound = scope.options.viewportHeight - elmHeight;
      
      function mousedown(event) {
        // Prevent default dragging of selected content
        event.preventDefault();
        elmHeight = GridUtil.elementHeight(elm, 'margin');
        elmBottomBound = scope.options.viewportHeight - elmHeight;
        startY = event.screenY - y;

        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
      }

      elm.on('mousedown', mousedown);

      function mousemove(event) {
        y = event.screenY - startY;

        if (y < 0) { y = 0; }
        if (y > elmBottomBound) { y = elmBottomBound; }

        var scrollPercentage = y / elmBottomBound;

        scope.$emit('uiGridScrollVertical', { scrollPercentage: scrollPercentage, target: elm });
      }

      var scrollDereg = scope.$on('uiGridScrollVertical', function(evt, args) {
        if (args.scrollPercentage < 0) { args.scrollPercentage = 0; }
        if (args.scrollPercentage > 1) { args.scrollPercentage = 1; }

        elmHeight = GridUtil.elementHeight(elm, 'margin');
        elmBottomBound = scope.options.viewportHeight - elmHeight;

        var newScrollTop = args.scrollPercentage * elmBottomBound;

        var newTop = (scope.options.offsetTop || 0) + newScrollTop;

        $log.debug('newScrollTop', scope.options.offsetTop, newScrollTop);

        y = newScrollTop;
        elm.css({
          top: newTop + 'px'
        });
      });

      function mouseup() {
        $document.unbind('mousemove', mousemove);
        $document.unbind('mouseup', mouseup);
      }

      elm.on('$destroy', function() {
        scrollDereg();
        $document.unbind('mousemove', mousemove);
        $document.unbind('mouseup', mouseup);
        elm.unbind('mousedown');
      });
    }
  };
}]);

})();