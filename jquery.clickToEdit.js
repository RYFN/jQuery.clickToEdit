/*
// Click To Edit
// v0.12
// 05/06/2013 
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
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    ClickToEdit.prototype.init = function () {
        var $element = $(this.element);
        var display = $element.find('.display');
        //this allows us to put the data-name attribute directly on the .display element, without the need for a child element.
        var displayHasChildren = false;
        var edit = $element.find('.edit');
        var options = this.options;

        if (display.length == 0) {
            throw { name: 'missing display element', message: 'display element is missing - you need an element with the class "display" as a child of the element you invoked clickToEdit on' };
        }

        if (edit.length == 0) {
            throw { name: 'missing edit element', message: 'edit element is missing - you need an element with the class "edit" as a child of the element you invoked clickToEdit on' };
        }

        edit.hide();

        $element.on('click', '.display', editMode);
        $element.on('submit', 'form', submitForm);
        $element.on('click', 'form .cancel', cancelEdit);
        $element.on('click', 'form.remove button[type="submit"]', removeClick);

        //does the display element have multiple things in it, or is it a single element just showing one piece of text?
        displayHasChildren = display.data("name") == null && display.find('[data-name]').length > 0;

        function editMode() {
            display.hide();

            if (displayHasChildren) {
                edit.find('input').not('[type=hidden]').each(function (index, item) {
                    var currentDisplay = display.find('[data-name=' + item.name + ']');
                    $(item).val(currentDisplay.text());
                });
            }
            else {
                edit.find('input[name="' + display.data('name') + '"]').val(display.text());
            }

            edit.show();
        }

        function cancelEdit() {
            display.show();
            edit.hide();
        }

        function submitForm(e) {
            var afterSuccess = editSuccess;

            if ($(this).hasClass('remove')) {
                afterSuccess = removeSuccess;
            }
        
            $.ajax({
                url: $(this)[0].action,
                type: $(this)[0].method,
                context: $(this),
                data: $(this).serialize(),
                success: afterSuccess,
                error: error
            });

            e.preventDefault();
            return false;
        }

        function removeClick(e) {
            if (options.confirmRemove != null && $.isFunction(options.confirmRemove)) {
                if (!options.confirmRemove($element))
                {
                    e.preventDefault();
                    return false;
                }
            }
        }

        function editSuccess(data) {
            if (displayHasChildren) {
                edit.find('input').not('[type=hidden]').each(function (index, item) {
                    var currentDisplay = display.find('[data-name=' + item.name + ']');
                    currentDisplay.text($(item).val());
                });
            }
            else {
                //display must contain only a single item
                var currentVal = edit.find('input').not('[type=hidden]').first().val();
                display.text(currentVal);
            }

            edit.hide();
            display.show();

            if (options.postSuccess != null && $.isFunction(options.postSuccess)) {
                options.postSuccess($element, data);
            }
        }

        function removeSuccess(data) {
            $element.remove();

            if (options.postSuccess != null && $.isFunction(options.postSuccess)) {
                options.postSuccess($element, data);
            }
        }

        function error(jqXHR, text, errThrown) {
            if (options.postFail != null && $.isFunction(options.postFail)) {
                options.postFail($element, jqXHR, text, errThrown);
            }
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
    }

})(jQuery);