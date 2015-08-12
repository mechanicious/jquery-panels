(function($, window, u) {

/**
 * options
 *  string rootSelector, ex. '.jquery-panels'
 */

function Panel(options) 
{
  this._options = options;
  this._this = options._this;

  // event handlers
  this.onPanelRemoved = function(){};
  this.onPanelAdded = function(){};
}

Panel.prototype.init = function()
{
  this.defineClassRoots();
  this.defineContainers();
  this.defineButtonSelectors();
  this.defineCollectionAddButtonHandler();
  this.definePanelCollapseButtonHandler();
  this.definePanelRemoveButtonHandler();

  return new PublicPanel($.extend(this._options, {_this: this}));
}

Panel.prototype.defineClassRoots = function()
{
  this.collectionSelector = this._options['rootSelector'] || '.jquery-panels';
  this.panelSelector = '.jquery-panels > .panel';
}

Panel.prototype.defineContainers = function()
{
  this.collection = $(this._this);
  this.panels = $(this._this.find('.panel'));
}

Panel.prototype.defineButtonSelectors = function()
{
  this.addBtnSelector   = this.collectionSelector + ' > button.add:first-child', 
  this.collapseBtnSelector = this.collectionSelector + ' > .panel > .controls > button.colpse', 
  this.removeBtnSelector  = this.collectionSelector + ' > .panel > .controls > button.remove';
}

// TODO: improve treshold trigger, cleanup
Panel.prototype.registerDragging = function(panel)
{
  function _log(message) {
      debugging && console.log(message);
    }

    var debugging = true,
        _this = this;
    var onmousedown = function(e) {
        if(e.target !== e.data._header.get(0)) return;
        _log(['mousedown registered with args', arguments])
        _log(['mousedown event', e])
        _log(['start conditions', e.target.style.top])
        var _event = e,
            _header = _event.data._header,
            _panel = $(_event.target).parents('.panel').first();
            _panel = _panel.attr('class', 'panel span4');
            _panel.css({'z-index': -10}),
            _bullet = new jQuery,
            _mouseEnterRegistered = false;

        var _treshold = 1.2;
            _treshold = 1/_treshold;

        if(! _panel.offset() ) return;
        var _collectionContainer = _panel.parents('.jquery-panels').first(),
            _panelCollectionIndex = _collectionContainer.find(_panel).index(),
            _panelCollection = _collectionContainer.find('.panel');
            _panelForeignCollection = _panelCollection.not(_panel); 
            whileTarget = document,
            endTarget = whileTarget;

            // insert placeholder
            // calculate treshold for snapping
            // calculate new _panelCollectionIndex
            // remove placeholder
            // snap
            _panel.find('header').attr('class', 'head');
            _panel.css({'z-index': '-10'});
            $(_header).off('mousedown');
            var _placeholder = _panel.clone(false, false);
              _placeholder.css({display: 'none', opacity: '.3', top: 'auto', left: 'auto'});
              _placeholder.attr('class', 'panel-placeholder span4');
              _placeholder.find('header').attr('class', 'placeholder');
            if(! _collectionContainer.find('header.placeholder').length)
            _placeholder.insertBefore(_panel);

            window._header = _header;
            window._panel = _panel;
            window._collectionContainer = _collectionContainer;

            var mouse = {};

            var initMouse = function () {
              mouse = {
                // Used for relative positioning
                offsetX: _panel.offset().left - parseInt(_panel.css('margin-left')) - _collectionContainer.offset().left,
                offsetY: _panel.offset().top,
                // Used to calculate the treshold
                movementXTotal: 0,
                movementYTotal: 0
              };
            }

            _log(['starting at', mouse]);
            initMouse();
            var onmousemove = function(e) {
              reRegisterSnappingEventHandler();
              if(_mouseEnterRegistered) onmouseenter(_mouseEnterRegistered);
              _log('mousemove registered');
              mouse.movementXTotal += e.movementX;
              mouse.movementYTotal += e.movementY;
              mouse.offsetX += e.movementX; 
              mouse.offsetY += e.movementY;
              _log(_panel);
              _panel.css({
                position: 'absolute', 
                top: mouse.offsetY + 'px',
                left: mouse.offsetX + 'px'
              });
              _placeholder.css({display: 'inline-block'});
              _log(mouse.movementXTotal);
            
              _log([_panel.css('top'), mouse.offsetY, mouse.offsetX]);
            };

            var onmouseenter = function(e)
            {
              // whileTarget.removeEventListener('mousemove', onmousemove);
              // if($(e.target).parents('.panel').first().attr('class') !== _panel.attr('class')) return;

              _log(['mouseenter registered', e.target]);
              var bullet = $(e.target).parents('.panel').first(), bulletFellow, 
              bulletIndex, bulletClone = bullet.clone(), 
              trigger = _panel, triggerFellow, triggerIndex, triggerClone = _panel.clone();
              if(bullet.get(0) === trigger.get(0)) return console.log(['wrong bullet', bullet.get(0)]);
              _bullet.css({'opacity': 1})
              _bullet = bullet;

              if(_mouseEnterRegistered)
              {
                mouse.movementXTotal += e.movementX;
                mouse.movementYTotal += e.movementY;
              }

              trigger.css({'opacity': '.4'});
              _bullet.css({'opacity': '.4'});
              _mouseEnterRegistered = e;
              if(!(mouse.movementXTotal > _panel.width()    / _treshold
                || mouse.movementYTotal > _panel.height()   / _treshold
                || mouse.movementXTotal < -(_panel.width()  / _treshold)
                || mouse.movementYTotal < -(_panel.height() / _treshold) ))
                return;
              var calculateElements = function()
              {
                bulletFellow = bullet.prev();
                bulletIndex = _panelCollection.find(_bullet).index();
                triggerFellow = trigger.prev().prev();
                triggerIndex = _panelCollection.find(trigger).index();
              }

              calculateElements();
              // when trigger has no fellows
              if( ! triggerFellow.length)
              {
                // 
              }
              else
              {
                triggerClone.insertBefore(_bullet);
                bullet.insertAfter(trigger);
                trigger.detach();
                _placeholder.detach()
              }

              bullet.css({position: 'relative', top: 'auto', left: 'auto', 'z-index': 0, 'opacity': '1'});
              triggerClone.css({position: 'relative', top: 'auto', left: 'auto', 'z-index': 0,'opacity': '1'});
              clearEventListeners();
               _this.definePanelCollapseButtonHandler(triggerClone);
               _this.definePanelRemoveButtonHandler(triggerClone);
              _this.registerDragging(triggerClone);
            };

            var onmouseup = function(e) {
              _panel.css({'z-index': 0});
              _placeholder.detach();
              _panel.css({position: 'relative', top: 'auto', left: 'auto', 'z-index': 0, 'opacity': '1'});
              _bullet.css({position: 'relative', top: 'auto', left: 'auto', 'z-index': 0, 'opacity': '1'});
              clearEventListeners();
              _header.off('mousedown', _event.data._self);
              _log('mouseup registered')
              _log(mouse);
              _this.registerDragging(panel);
              return mouse;
            };

            var clearEventListeners = function() {
              whileTarget.removeEventListener('mousemove', onmousemove);
              endTarget.removeEventListener('mouseup', onmouseup);
              _panelCollection.each(function(i, e) {
                e.removeEventListener('mouseover', onmouseenter);
              });
            }

            var reRegisterSnappingEventHandler = function() {
              _panelCollection.each(function(i, e) {
                e.removeEventListener('mouseover', onmouseenter);
              });
              _log(['registering mouseenter for', _panelCollection]);
              _panelCollection.each(function(i, e) {
                e.addEventListener('mouseover', onmouseenter);
              });
            };

        _log(['registering mousemove for', whileTarget]);
        whileTarget.addEventListener('mousemove', onmousemove);

        _log(['registering mouseenter for', _panelCollection]);
        _panelCollection.each(function(i, e) {
          e.addEventListener('mouseover', onmouseenter);
        });

        _log(['registering mouseup for', endTarget]);
        endTarget.addEventListener('mouseup', onmouseup);
      };
  var _header = panel.find('header').first(); 
  _header.on('mousedown', null, {_self: onmousedown, _header: _header}, onmousedown);
  
  _log(['registering mousedown for', panel]);
}

Panel.prototype.defineCollectionAddButtonHandler = function()
{
  var _this = this;
  $(this.addBtnSelector).on('click', function(e) {
    var panel = _this.panels.first(),
        panelHtml = panel.html(),
        lastPanel = {};
    _this.collection.append('<li class="panel span4">' + panelHtml + '</li>');
    // We begin with 0 panels such that definePanelCollapeButtonHandler on init doesn't define any collpase buttons
    lastPanel = _this.collection.find('.panel').last();
    
    _this.definePanelCollapseButtonHandler(lastPanel);
    _this.definePanelRemoveButtonHandler(lastPanel);
    _this.onPanelAdded(lastPanel);
    _this.registerDragging(lastPanel);
  });
}

Panel.prototype.definePanelCollapseButtonHandler = function(panel)
{
  var panel = panel || this.panels,
      _this = this;
  panel.find('button.colpse').on('click', function(e)
  {
    var _button = $(this);
      _panel = $(e.target).parents('.panel').first(),
      _panelContainer = _panel.find('.jp-container').first();

      _panelContainer.stop().slideToggle();
      if(_button.text() === "-") _button.text('+'); else _button.text('-');
      _this.onPanelCollapsed(_panel);
  });
}

Panel.prototype.definePanelRemoveButtonHandler = function(panel)
{
  var panel = panel || this.panels,
      _this = this;
  panel.find('button.remove').attr('class', 'btn btn-warning remove');
  panel.find('button.remove').text('×');
  panel.find('button.remove').on('click', function(e)
  {
    var _button = $(this),
        _panel = $(e.target).parents('.panel').first(),
        _initalButtonHtml = _button.html();
    _button.attr('class', 'btn btn-danger remove');
    _button.text('Are you sure?');

    var reset = setTimeout(function(){
      _button.off('click');
      _button.attr('class', 'btn btn-warning remove');
      _button.html(_initalButtonHtml);
      _this.definePanelRemoveButtonHandler(_panel);
    }, 4000);

    _button.on('click', function() {
      _panel.remove();
      _this.onPanelRemoved(_panel);
      clearTimeout(reset);
    });
  });
}



function PublicPanel(options)
{
  this._options = options;
}

PublicPanel.prototype.onPanelRemoved = function(callback)
{
  this._options._this.onPanelRemoved = callback;
  return this;
}

PublicPanel.prototype.onPanelAdded = function(callback)
{
  this._options._this.onPanelAdded = callback;
  return this;
}

PublicPanel.prototype.onPanelCollapsed = function(callback)
{
  this._options._this.onPanelCollapsed = callback;
  return this;
}


/**
 * todo
 */
PublicPanel.prototype.onPanelInputEdited = function(callback) 
{
  var inputCollection = this._options._this._this.find('.jp-container input');  
  $.each(inputCollection.get(), function(i, e) {
    e.removeEventListener('blur');
  });

  var eventHandler = function(e) {
    callback(this, e);
  };

  inputCollection.on('blur', eventHandler);
}

PublicPanel.prototype.toJson = function() {

}

PublicPanel.prototype.buildFromJson = function(json) {

}

// implement dragging panels around
// finish panel templating
// add options
// generate api
// github repository page


$.fn.panel = function(options) {
  options = options || {};

  /**
   * Define a collection instance
   * A collection holds panels
   * @type {Panel}
   */
  var _options = $.extend(options, {_this: this});
  var publicPanel = (new Panel(_options)).init();
  window.jPanel = publicPanel;
  return publicPanel;
}
})(jQuery, window, undefined)