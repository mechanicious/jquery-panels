(function($, window, u) {

/**
 * options
 *  string rootSelector, ex. '.jquery-panels'
 */

function Panel(options) 
{
  this._options = $.extend(this.getDefaultOptions(), options);
  this._this = options._this;

  // event handlers
  this.onPanelRemoved = function(callback){};
  this.onPanelAdded = function(callback){};
}

Panel.prototype.init = function()
{
  this.defineContainers();
  this.defineCollectionAddButtonHandler();
  this.definePanelCollapseButtonHandler();
  this.definePanelRemoveButtonHandler();

  return new PublicPanel($.extend(this._options, {_this: this}));
}

Panel.prototype.defineContainers = function()
{
  this.collection = $(this._this);
  this.panels = $(this._this.find('.panel'));
}

Panel.prototype.getDefaultOptions = function()
{
  return {
    panelsCollectionClass: '.jquery-panels',
    panelPlaceholderClass: '.panel-placeholder',
    headerPlaceholderClass: '.placeholder',
    panelContainerClass: '.jp-container',
    panelClass: '.panel',
    panelBlueprintClass: '.blueprint',
    buttonCollapseClass: '.colpse',
    buttonRemoveClass: '.btn.btn-warning.remove',
    buttonAddClass: '.btn.btn-info.add',
    buttonConfirmRemoveClass: '.btn.btn-danger.remove',
    confirmDeleteMessage: 'Are you sure?',
    cancelRemoveDelay: 4000,
    collapseButtonCollapseText: '-',
    collapseButtonExpandText: '+'
  };
}

Panel.prototype.registerDragging = function(panel)
{

    var _this = this,
        _options = _this._options,
        _eventNames = {mousemove: 'mousemove', mousedown: 'mousedown', mouseup: 'mouseup', mouseover: 'mouseover'};

    var onmousedown = function(e) {
        // Ignore header children generated events
        if(e.target !== e.data._header.get(0)) return;

        var _event = e,
            _header = _event.data._header,
            _panel = $(_event.target).parents(_options.panelClass).first(),
            _panel = _panel.replaceClass(_options.panelBlueprintClass.stripDot()).with(''),
            _bullet = new jQuery,
            _mouseEnterRegistered = false,
            _treshold = 1.2,
            _treshold = 1/_treshold,
            _collectionContainer = _panel.parents(_options.panelsCollectionClass).first(),
            _panelCollectionIndex = _collectionContainer.find(_panel).index(),
            _panelCollection = _collectionContainer.find(_options.panelClass),
            _panelForeignCollection = _panelCollection.not(_panel), 
            whileTarget = document,
            endTarget = whileTarget;

            _panel.css({'z-index': -10});


            var _placeholder = _panel.clone(false, false);
                _placeholder.css({display: 'none', opacity: '.3', top: 'auto', left: 'auto'});
                _placeholder.replaceClass(_options.panelClass.stripDot()).with(_options.panelPlaceholderClass.stripDot());
                _placeholder.find('header').addClass(_options.headerPlaceholderClass);
            
            if(! _collectionContainer.find('header' + _options.headerPlaceholderClass).length) _placeholder.insertBefore(_panel);


            function Mouse() {}
            Mouse.prototype.init = function() {
              this.offsetX = _panel.offset().left - parseInt(_panel.css('margin-left')) - _collectionContainer.offset().left;
              this.offsetY = _panel.offset().top;
              this.movementXTotal = 0;
              this.movementYTotal = 0;
              return this;
            }
            Mouse.prototype.reset = function() { return this.init(); }
            Mouse.prototype.sumUpTotalMovement = function(x, y) {
              this.movementXTotal += x;
              this.movementYTotal += y;
              return this;
            }
            Mouse.prototype.sumUpOffset = function(x, y) {
              this.offsetX += x; 
              this.offsetY += y;
              return this;
            }

            var mouse = (new Mouse).init();

            var onmousemove = function(e) {
              if(_mouseEnterRegistered) onmouseenter(_mouseEnterRegistered);
              mouse.sumUpTotalMovement(e.movementX, e.movementY)
                    .sumUpOffset(e.movementX, e.movementY);
              
              movePanelTo(_panel, mouse.offsetX, mouse.offsetY);
              _placeholder.css({display: 'inline-block'});
            };

            var onmouseenter = function(e)
            {
              var bullet = $(e.target).parents(_options.panelClass).first(), 
                  bulletClone = bullet.clone(), trigger = _panel, triggerClone = _panel.clone();
              
              initPanelStyle(_bullet);
              _bullet = bullet;

              if(_mouseEnterRegistered) mouse.sumUpTotalMovement(e.movementX, e.movementY);

              initPanelDragStyle(trigger);
              initPanelDragStyle(_bullet);

              _mouseEnterRegistered = e;

              if(tresholdReached(mouse) === false) return;

              triggerClone.insertBefore(_bullet);
              bullet.insertAfter(trigger);
              trigger.detach();
              _placeholder.detach()

              initPanelStyle(bullet);
              initPanelStyle(triggerClone);
              clearEventListeners();
               _this.definePanelCollapseButtonHandler(triggerClone);
               _this.definePanelRemoveButtonHandler(triggerClone);
              _this.registerDragging(triggerClone);
            };

            var onmouseup = function(e) {
              _panel.css({'z-index': 0});
              _placeholder.detach();
              initPanelStyle(_panel);
              initPanelStyle(_bullet);
              clearEventListeners();
              _header.off(_eventNames.mousedown, _event.data._self);
              _this.registerDragging(panel);
              return mouse;
            };

            var movePanelTo = function(panel, x, y) {
              panel.css({
                position: 'absolute', 
                top: y + 'px',
                left: x + 'px'
              });
            };

            var initPanelStyle = function(panel) {
              panel.css({position: 'relative', top: 'auto', left: 'auto', 'z-index': 0, 'opacity': '1'});
            };

            var initPanelDragStyle = function(panel) {
              panel.css({opacity: '0.4'});
            }

            var tresholdReached = function(mouse) {
              return (mouse.movementXTotal  > _panel.width()    / _treshold
                || mouse.movementYTotal     > _panel.height()   / _treshold
                || mouse.movementXTotal     < -(_panel.width()  / _treshold)
                || mouse.movementYTotal     < -(_panel.height() / _treshold) );
            }

            var clearEventListeners = function() {
              whileTarget.removeEventListener(_eventNames.mousemove, onmousemove);
              endTarget.removeEventListener(_eventNames.mouseup, onmouseup);
              _panelCollection.each(function(i, e) {
                e.removeEventListener(_eventNames.mouseover, onmouseenter);
              });
            }

        whileTarget.addEventListener(_eventNames.mousemove, onmousemove);

        _panelCollection.each(function(i, e) {
          e.addEventListener(_eventNames.mouseover, onmouseenter);
        });

        endTarget.addEventListener(_eventNames.mouseup, onmouseup);
      };
  var _header = panel.find('header').first(); 
      _header.on(_eventNames.mousedown, null, {_self: onmousedown, _header: _header}, onmousedown);
}

Panel.prototype.defineCollectionAddButtonHandler = function()
{
  var _this = this,
      _options = _this._options;
  $(_options.buttonAddClass).on('click', function(e) {
    var panel = _this.panels.first(),
        blueprintPanel = $('li' + _options.panelBlueprintClass).first(),
        blueprintInstance = blueprintPanel.clone(),
        panelHtml = panel.html(),
        lastPanel = {},
        panelBlueprintClass = _this.collection.find(_this._options.panelBlueprintClass).class(),
        panelClass = panelBlueprintClass.stripSegment(_this._options.panelBlueprintClass, ' ');

    blueprintInstance.removeClass(_options.panelBlueprintClass.stripDots());
    blueprintInstance.css({display: 'inline-block'});
    _this.collection.append(blueprintInstance);
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
      _this = this,
      _options = _this._options,
      button = panel.find('button' + _options.buttonCollapseClass).first();

  button.text(_options.collapseButtonCollapseText);

  button.on('click', function(e)
  {
    var _button = $(this),
        _panel = $(e.target).parents(_options.panelClass).first(),
        _panelContainer = _panel.find(_options.panelContainerClass).first();

      _panelContainer.stop().slideToggle();
      if(_button.text() === _options.collapseButtonCollapseText) _button.text(_options.collapseButtonExpandText); 
      else _button.text(_options.collapseButtonCollapseText);
      _this.onPanelCollapsed(_panel);
  });
}

Panel.prototype.definePanelRemoveButtonHandler = function(panel)
{
  var panel = panel || this.panels,
      _this = this,
      _options = _this._options,
      button = panel.find('button' + _options.buttonRemoveClass),
      _buttonDefaultClass = button.class(),
      _buttonDefaultText = button.text();
  
  button.class(_options.buttonRemoveClass.stripDots(' '));
  button.text(_buttonDefaultText);

  panel.find('button' + _options.buttonRemoveClass).on('click', function(e)
  {
    var _button = $(this),
        _panel = $(e.target).parents(_options.panelClass).first(),
        _initalButtonHtml = _button.html();
    _button.class(_options.buttonConfirmRemoveClass.stripDots(' '));
    _button.text(_options.confirmDeleteMessage);

    var reset = setTimeout(function(){
      _button.off('click');
      _button.class(_options.buttonRemoveClass.stripDots(' '));
      _button.html(_initalButtonHtml);
      _this.definePanelRemoveButtonHandler(_panel);
    }, _options.cancelRemoveDelay);

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
 * inmplement event binding on add
 */
PublicPanel.prototype.onPanelInputEdited = function(callback) 
{
  var _this = this,
      _options = this._options, 
      inputCollection = this._options._this._this
      .find(_options.panelContainerClass + ' input, ' + _options.panelContainerClass + ' select, ' + _options.panelContainerClass + ' textarea');

      console.log(inputCollection);

      // .on('blur', function(e) {
      //   callback(e);
      // });
}

PublicPanel.prototype.toJson = function() {
  var panelsCollection = $(this._options.panelsCollectionClass)
                          .find(this._options.panelClass)
                          .not(this._options.panelBlueprintClass),
      parsedData = $.map(panelsCollection, function(e, i) {
        var data = {};
        $(e).find('input, select, textarea').each(function(i, e) {
          var key = $(e).attr('name'),
              value = $(e).val();
          data[key] = value;
        });
        return data;
      });

  return JSON.stringify(parsedData);
}

PublicPanel.prototype.buildFromJson = function(json) {
  var _this = this,
      _options = _this._options,
      panelAddButton = $(_options.buttonAddClass).first(),
      parsedJson = JSON.parse(json);

  $.each(parsedJson, function(i, panel) {
    panelAddButton.click();
    $(_options.panelClass).last().find('input, select, textarea').each(function(i, input) {
      for(inputName in panel)
      {
        if($(input).attr('name') === inputName) $(input).val(panel[inputName]);
      }
    })
  });
}

PublicPanel.prototype.collapseAll = function() {
  var _options = this._options;
  $(_options.panelClass).not(this._options.panelBlueprintClass)
  .find(_options.panelContainerClass).each(function(i, e) {
    $(e).css({display: 'none'});
    $(e).text(this.collapseButtonExpandText);
  });
}

PublicPanel.prototype.expandAll = function() {
  var _options = this._options;
  $(_options.panelClass).not(this._options.panelBlueprintClass)
  .find(_options.panelContainerClass).each(function(i, e) {
    $(e).css({display: 'inline-block'});
    $(e).text(this.collapseButtonCollapseText);
  });
}

PublicPanel.prototype.deleteAll = function() {
  $(this._options.panelClass).not(this._options.panelBlueprintClass).detach();
}

String.prototype.stripSegment = function(segment, delimiter) {
  var segments = this.split(delimiter);
  segments.splice(segments.indexOf(segment), 1);
  return segments.join(delimiter);
}

String.prototype.stripDots = function(replacement) {
  return this.split('.').join(replacement || '');
}

// Alias of String.stripDots
String.prototype.stripDot = function() {
  return this.stripDots();
}

$.fn.class = function(overwrite) {
  if(typeof overwrite === 'undefined') {
    return $(this).attr('class')
  } else {
    return $(this).attr('class', overwrite);
  }
}


$.fn.replaceClass = function(find) {
  var el = $(this),
      _class = el.attr('class'),
      _classDelimiter = ' ',
      segments = _class.split(_classDelimiter);
  return {
    'with': function(replace) {
      segments[segments.indexOf(find)] = replace;
      return el.attr('class', segments.join(_classDelimiter));
    }
  }
}


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