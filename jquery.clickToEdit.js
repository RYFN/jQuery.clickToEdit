/*
// Click To Edit
// v0.12
// 05/06/2013 
// Ryan French

// Basic click-to-edit functionality.

// Will show 'edit' form on click of 'display' element, and $.ajax data to the action of the 'edit' form.

// Invoke on a container that contains an item with class 'display', and a form that has class 'edit'. 
// or alternatively, any element with class 'edit' containing multiple forms.
// 'display' should contain items whose data-name attributes match the name attributes of inputs in the edit form,
// or alternatively contain no child elements, and have the data-name attribute on itself.

// 'edit' should contain a button with class 'cancel'.
// It will ignore hidden fields, and currently only works with inputs. (not selects etc)

// e.g

<div class="click-to-edit">
    <div class="display">
      <span data-name="Something">initial value</span>
      <span data-name="SomethingElse">some other value</span>
    </div>
    <form class="edit" action="/what/ever/" method="post">
      <input type="hidden" name="SomethingId"/>
      <input type="text" name="Something"/>
      <input type="text" name="SomethingElse"/>

      <button type="submit">update</button>
      <button type="button" class="cancel">cancel</button>
    </form>
</div>

OR:

<div class="click-to-edit">
    <h2 class="display">Something</h2>

    <form class="edit" action="/what/ever/" method="post">
      <input type="hidden" name="SomethingId"/>
      <input type="text" name="Something"/>

      <button type="submit">update</button>
      <button type="button" class="cancel">cancel</button>
    </form>
</div>

invoked:

    $('.click-to-edit').clickToEdit();

Optionally add a postSuccess or postFail function, which are invoked after successful or failing ajaxy call,
where 'element' is the element clickToEdit was initially called on.

    myPostSuccess = function(element, data){};
    myPostFail = function(element, jqXHR, text, errThrown){};

Also you can provide a "confirm remove" function, which should return true or false, and is called when a button of type "submit" is clicked in a form with class "remove".

    myConfirmRemove = function(element){ return true | false };

    $('.click-to-edit').clickToEdit({postSuccess:myPostSuccess, postFail:myPostFail, confirmRemove:myConfirmRemove});
*/

/* 
TODO:
    Refactor function placement, where should they go?
    Add support for checkboxes/selects etc
*/

(function ($) {
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