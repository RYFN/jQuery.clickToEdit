# Basic click-to-edit functionality. #

Will show and `edit` form on click of `display` element, and `$.ajax data` to the action of the `edit` form.

Invoke on a container that contains an item with class `display`, and a form that has class `edit`. 
or alternatively, any element with class `edit` containing multiple forms.
`display` should contain items whose data-name attributes match the name attributes of inputs in the edit form,
or alternatively contain no child elements, and have the data-name attribute on itself.

`edit` should contain a button with class `cancel`.


> **NOTE:** It will ignore hidden fields, and currently only works with inputs. (not selects, checkboxes, etc)

e.g:

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


This works well with .Net MVC4 helper classes, and unobtrusive validation...






 
## TODO: ##
Add support for showing select option text, as opposed to value in display label?
