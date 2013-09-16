/*
// Click To Edit
// v1.0
// 16/08/2013 
// Ryan French
*/

;(function ($) {
	"use strict";
    // Create the defaults once
    var pluginName = 'clickToEdit',
        defaults = {
            confirmRemove: null,
            postSuccess: null,
            postFail: null,
			matchOptionsByText: false,
			displayTitle: 'click to edit'
        };

    // The actual plugin constructor
    function ClickToEdit(element, options) {
        this.element = element;
		this.$element = null;
		this.display = null;
		this.edit = null;
		this.displayHasChildren = null;
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    ClickToEdit.prototype.init = function () {
        this.$element = $(this.element);
        this.display = this.$element.find('.display');
        //this allows us to put the data-name attribute directly on the .display element, 
		//without the need for a child element.
        this.displayHasChildren = false;
        this.edit = this.$element.find('.edit');
      
        if (this.display.length === 0) {
            throw { name: 'missing display element', message: 'display element is missing - you need an element with the class "display" as a child of the element you invoked clickToEdit on' };
        }

        if (this.edit.length === 0) {
            throw { name: 'missing edit element', message: 'edit element is missing - you need an element with the class "edit" as a child of the element you invoked clickToEdit on' };
        }
		
		//edit element should be initially hidden with css, but hide it here anyway.
        this.edit.hide();
		
		//using proxy on events to ensure this is the ClickToEdit object
		var editMode = $.proxy(this.editMode, this);
		var submitForm = $.proxy(this.submitForm, this);
		var cancelEdit = $.proxy(this.cancelEdit, this);
		var removeClick = $.proxy(this.removeClick, this);
		
        this.$element.on('click', '.display', editMode);
		this.$element.on('click', 'form .cancel', cancelEdit);
        this.$element.on('submit', 'form', submitForm);
        this.$element.on('click', 'form.remove button[type="submit"]', removeClick);
		
		if(this.options.displayTitle.length > 0){
			this.display.prop('title', this.options.displayTitle);
		}

        //does the display element have multiple things in it, or is it a single element just showing one piece of text?
        this.displayHasChildren = typeof(this.display.data("name")) === 'undefined' && this.display.find('[data-name]').length > 0;
    };
	
	ClickToEdit.prototype.editMode = function() {
		this.display.hide();
		var options = this.options;
		
		if (this.displayHasChildren) {
			//find and update text items in the edit element that match the 
			//data-name attribute of things in the display element
			var display = this.display;
			this.edit.find('input[type=text], textarea').not('[type=hidden]').each(function (index, item) {
				var currentDisplay = display.find('[data-name=' + item.name + ']');
				$(item).val(currentDisplay.text());
			});
			
			//same again, but for select items
			this.edit.find('select').each(function (index, item) {
				var currentDisplay = display.find('[data-name="' + item.name + '"]');
				var currentItem = $(item);
				
				//depending on config, match a select option by it's text, rather than value
				if(options.matchOptionsByText){
					var matchedOption = currentItem.find('option').filter(function(){
						return $(this).text() === currentDisplay.text();
					});
					
					currentItem.val(matchedOption.val());
				}
				else{
					$(item).val(currentDisplay.text());
				}
			});
		}
		else {
			//display element is only showing one thing, so data-name property is
			//directly on it, as opposed to a child element.
			var nameSelector = '[name="' + this.display.data('name') + '"]';
			var editItem = this.edit.find('input[type=text], textarea' + nameSelector);
			
			//updated text inputs
			if(editItem.length === 1)
			{
				editItem.val(this.display.text());
			}
			else
			{
				//or select elements
				var selectItem = this.edit.find('select' + nameSelector);
				if(selectItem.length === 1)
				{
					//depending on config, match a select option by it's text, rather than value
					if(options.matchOptionsByText){
						var matchedOption = selectItem.find('option').filter(function(){
								return $(this).text() === this.display.text();
							});
						this.edit.find('select' + nameSelector).val(matchedOption.val());
					}
					else {
						this.edit.find('select' + nameSelector).val(this.display.text());
					}
				}
			}
		}

		this.edit.show();
	};

	ClickToEdit.prototype.cancelEdit = function() {
		this.display.show();
		this.edit.hide();
	};

	ClickToEdit.prototype.submitForm = function(e) {
		//proxy ajax callback functions to keep 'this'
		var afterSuccess = $.proxy(this.editSuccess, this);
		var onError = $.proxy(this.ajaxError, this);
		var form = $(e.currentTarget);
		
		//for remove, use a different aftersuccess callback
		if (form.hasClass('remove')) {
			afterSuccess = $.proxy(this.removeSuccess, this);
		}
	
		$.ajax({
			url: form[0].action,
			type: form[0].method,
			context: form,
			data: form.serialize(),
			success: afterSuccess,
			error: onError
		});

		e.preventDefault();
		return false;
	};

	ClickToEdit.prototype.removeClick = function(e) {
		//if configured, optionally call a confirmRemove function
		if (this.options.confirmRemove !== null && $.isFunction(this.options.confirmRemove)) {
			//expect it to return true or false - like a confirm dialogue
			if (!this.options.confirmRemove(this.$element)){
				e.preventDefault();
				return false;
			}
		}
	};

	ClickToEdit.prototype.editSuccess = function(data) {
		//after a successful edit form post, update the display element, 
		//and close the edit mode
		
		if (this.displayHasChildren) {
			var display = this.display;
			var options = this.options;
			
			//text elements in edit element
			this.edit.find('input[type=text], textarea').each(function (index, item) {
				var currentDisplay = display.find('[data-name=' + item.name + ']');
				currentDisplay.text($(item).val());
			});
			
			//select elements in edit element
			this.edit.find('select').each(function (index, item) {
				var currentDisplay = display.find('[data-name=' + item.name + ']');
				
				//depending on config, display a select option by it's text, rather than value
				if(options.matchOptionsByText){
					currentDisplay.text($(item).find('option:selected').text());
				}
				else
				{
					currentDisplay.text($(item).val());
				}
			});
		}
		else {
			//display must contain only a single item
			var editItem = this.edit.find('input[type=text], textarea, select').first();
			
			if(editItem.is('input') || (editItem.is('select') && !this.options.matchOptionsByText)) {
				this.display.text(editItem.val());
			}
			else if(editItem.is('select') && this.options.matchOptionsByText){
				var itemText = editItem.find('option:selected').text();
				this.display.text(itemText);
			}
		}

		this.edit.hide();
		this.display.show();
		
		//fire post success function if it was configured
		if (this.options.postSuccess !== null && $.isFunction(this.options.postSuccess)) {
			this.options.postSuccess(this.$element, data);
		}
	};

	ClickToEdit.prototype.removeSuccess = function(data) {
		//after successful callback from a "remove" form
		//remove the element
		
		this.$element.remove();

		//then optionally call the postSuccess function
		if (this.options.postSuccess !== null && $.isFunction(this.options.postSuccess)) {
			this.options.postSuccess(this.$element, data);
		}
	};

	ClickToEdit.prototype.ajaxError = function(jqXHR, text, errThrown) {
		//if configured, call a postFail function if ajax call fails
		if (this.options.postFail !== null && $.isFunction(this.options.postFail)) {
			this.options.postFail(this.$element, jqXHR, text, errThrown);
		}
	};

    // preventing against multiple instantiations
    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName,
                new ClickToEdit(this, options));
            }
        });
    };

})(jQuery);