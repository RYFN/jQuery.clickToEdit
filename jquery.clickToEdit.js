/*
// Click To Edit
// v0.13
// 16/08/2013 
// Ryan French
*/

;(function ($) {
    // Create the defaults once
    var pluginName = 'clickToEdit',
        defaults = {
            confirmRemove: null,
            postSuccess: null,
            postFail: null,
        };

    // The actual plugin constructor
    function ClickToEdit(element, options) {
        this.element = element;
		this.$element, this.display,this.edit,this.displayHasChildren;
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    };

    ClickToEdit.prototype.init = function () {
        this.$element = $(this.element);
        this.display = this.$element.find('.display');
        //this allows us to put the data-name attribute directly on the .display element, without the need for a child element.
        this.displayHasChildren = false;
        this.edit = this.$element.find('.edit');
        	
        if (this.display.length == 0) {
            throw { name: 'missing display element', message: 'display element is missing - you need an element with the class "display" as a child of the element you invoked clickToEdit on' };
        }

        if (this.edit.length == 0) {
            throw { name: 'missing edit element', message: 'edit element is missing - you need an element with the class "edit" as a child of the element you invoked clickToEdit on' };
        }

        this.edit.hide();
		
		var editMode = $.proxy(this.editMode, this);
		var submitForm = $.proxy(this.submitForm, this);
		var cancelEdit = $.proxy(this.cancelEdit, this);
		var removeClick = $.proxy(this.removeClick, this);
		
        this.$element.on('click', '.display', editMode);
		this.$element.on('click', 'form .cancel', cancelEdit);
        this.$element.on('submit', 'form', submitForm);
        this.$element.on('click', 'form.remove button[type="submit"]', removeClick);

        //does the display element have multiple things in it, or is it a single element just showing one piece of text?
        this.displayHasChildren = this.display.data("name") == null && this.display.find('[data-name]').length > 0;
    };
	
	ClickToEdit.prototype.editMode = function() {
		this.display.hide();

		if (this.displayHasChildren) {
			var display = this.display;
			this.edit.find('input,select').not('[type=hidden]').each(function (index, item) {
				var currentDisplay = display.find('[data-name=' + item.name + ']');
				$(item).val(currentDisplay.text());
			});
		}
		else {
			var nameSelector = '[name="' + this.display.data('name') + '"]'
			this.edit.find('input' + nameSelector + ',select' + nameSelector).val(this.display.text());
		}

		this.edit.show();
	};

	ClickToEdit.prototype.cancelEdit = function() {
		this.display.show();
		this.edit.hide();
	};

	ClickToEdit.prototype.submitForm = function(e) {
		var afterSuccess = $.proxy(this.editSuccess, this);
		var onError = $.proxy(this.ajaxError, this);
		var form = $(e.currentTarget);
		
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
		if (this.options.confirmRemove != null && $.isFunction(this.options.confirmRemove)) {
			if (!this.options.confirmRemove(this.$element))
			{
				e.preventDefault();
				return false;
			}
		}
	};

	ClickToEdit.prototype.editSuccess = function(data) {
		if (this.displayHasChildren) {
			var display = this.display;
			this.edit.find('input,select').not('[type=hidden]').each(function (index, item) {
				var currentDisplay = display.find('[data-name=' + item.name + ']');
				this.currentDisplay.text($(item).val());
			});
		}
		else {
			//display must contain only a single item
			var currentVal = this.edit.find('input,select').not('[type=hidden]').first().val();
			this.display.text(currentVal);
		}

		this.edit.hide();
		this.display.show();

		if (this.options.postSuccess != null && $.isFunction(this.options.postSuccess)) {
			this.options.postSuccess(this.$element, data);
		}
	};

	ClickToEdit.prototype.removeSuccess = function(data) {
		this.$element.remove();

		if (this.options.postSuccess != null && $.isFunction(this.options.postSuccess)) {
			this.options.postSuccess(this.$element, data);
		}
	};

	ClickToEdit.prototype.ajaxError = function(jqXHR, text, errThrown) {
		if (this.options.postFail != null && $.isFunction(this.options.postFail)) {
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