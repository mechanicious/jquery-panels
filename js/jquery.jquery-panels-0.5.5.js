(function($, window, u) {

/**
 * options
 * 	string rootSelector, ex. '.jquery-panels'
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
	this.addBtnSelector 	= this.collectionSelector + ' > button.add:first-child', 
	this.collapseBtnSelector = this.collectionSelector + ' > .panel > .controls > button.colpse', 
	this.removeBtnSelector 	= this.collectionSelector + ' > .panel > .controls > button.remove';
}

// TODO: switch at overlap, improve position guessing, fix the element replacement
Panel.prototype.registerDragging = function(panel)
{
	function _log(message) {
			debugging && console.log(message);
		}

		var debugging = false,
				_this = this;
		var onmousedown = function(e) {
				_log('mousedown registered')
				_log(['mousedown event', e])
				_log(['start conditions', e.target.style.top])
				var _event = e,
						_header = $(_event.target),
						_panel = $(_event.target).parents('.panel').first();

				if(! _panel.offset() ) return;
				var _collectionContainer = _panel.parents('.jquery-panels').first(),
						_panelCollectionIndex = _collectionContainer.find(_panel).index(),
						whileTarget = document,
						endTarget = whileTarget;

						// insert placeholder
						// calculate treshold for snapping
						// calculate new _panelCollectionIndex
						// remove placeholder
						// snap
						_panel.find('header').attr('class', 'head');
						$(_header).off('mousedown');
						var _placeholder = _panel.clone(false, false);
							_placeholder.css({display: 'none', opacity: '.3', top: 'auto', left: 'auto'});
							_placeholder.find('header').attr('class', 'placeholder');
						if(! _collectionContainer.find('header.placeholder').length)
						_placeholder.insertBefore(_panel);

						window._header = _header;
						window._panel = _panel;
						window._collectionContainer = _collectionContainer;

						var mouse = {};

						var initMouse = function () {
							mouse = {
								offsetX: _panel.offset().left - 20 - _collectionContainer.offset().left,
								offsetY: _panel.offset().top,
								movementXTotal: 0,
								movementYTotal: 0
							};
						}


						_log(['starting at', mouse]);
						initMouse();
						var onmousemove = function(e) {
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

							if(! _panel.data('jp-removed') && (
								mouse.movementXTotal > _panel.width() 			/ 1.25
								|| mouse.movementYTotal > _panel.height() 	/ 1.25
								|| mouse.movementXTotal < -(_panel.width() 	/ 1.25)
								|| mouse.movementYTotal < -(_panel.height() / 1.25) ))
							{
								_log('snapping');
								var _snapPanel = _panel.clone();

								// Either move the panel one position further in the sequence of fellow
								// elements or one position back
								if(mouse.movementXTotal > _panel.width() / 2 || mouse.movementYTotal > _panel.height() / 2)
									_snapPanel.insertAfter(_collectionContainer.find('li').get(_panelCollectionIndex+1));
								else _snapPanel.insertBefore(_collectionContainer.find('li').get(_panelCollectionIndex-2));

								initMouse();
								_panel.detach();
								_panel.data('jp-removed', true);
								_placeholder.detach();
								_snapPanel.css({position: 'relative', top: 0, left: 0});
								_this.definePanelCollapseButtonHandler(_snapPanel);
								_this.definePanelRemoveButtonHandler(_snapPanel);
								_this.registerDragging(_snapPanel);
							}
						
							_log([_panel.css('top'), mouse.offsetY, mouse.offsetX]);
						};
						var onmouseup = function(e) {
							_placeholder.detach();
							_panel.css({position: 'relative', top: 0, left: 0});
							whileTarget.removeEventListener('mousemove', onmousemove);
							endTarget.removeEventListener('mouseup', onmouseup);
							_log('mouseup registered')
							_log(mouse);
							_this.registerDragging(panel);
							return mouse;
						};

				_log(['registering mousemove for', whileTarget]);
				whileTarget.addEventListener('mousemove', onmousemove);
				_log(['registering mouseup for', endTarget]);
				endTarget.addEventListener('mouseup', onmouseup);
			};
	
	panel.find('header').on('mousedown', onmousedown);
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
	panel.find('button.remove').text('T');
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