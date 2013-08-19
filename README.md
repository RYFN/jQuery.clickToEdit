# Basic click-to-edit functionality. #

Will show and `edit` form on click of `display` element, and `$.ajax data` to the action of the `edit` form.

Invoke on a container that contains an item with class `display`, and a form that has class `edit`, 
or alternatively, any element with class `edit` containing multiple forms.
`display` should contain elements whose data-name attributes match the name attributes of inputs in the edit form,
or alternatively contain no child elements, and have the data-name attribute on itself.

`edit` should contain a button with class `cancel`.


> **NOTE:** It will ignore hidden fields, and only works with inputs of type "text", textareas, and selects.

e.g:

	<div class="click-to-edit">
	    <h2 class="display" data-name="Something">Something</h2>
	
	    <form class="edit" action="/what/ever/" method="post">
	      <input type="hidden" name="SomethingId"/>
	      <input type="text" name="Something"/>
	
	      <button type="submit">update</button>
	      <button type="button" class="cancel">cancel</button>
	    </form>
	</div>

OR:

	<div class="click-to-edit">
	    <div class="display">
	      	<span data-name="Something">initial value</span>
	      	<span data-name="SomethingElse">some other value</span>
			<span data-name="SelectField">Value 1</span>
	    </div>
	    <form class="edit" action="/what/ever/" method="post">
	      <input type="hidden" name="SomethingId"/>
	      <input type="text" name="Something"/>
	      <input type="text" name="SomethingElse"/>
		  <select name="SelectField">
			<option value=""></option>
			<option value="Value 1">Value 1</option>
			<option value="Value 2">Value 2</option>
			<option value="Value 3">Value 3</option>
		  </select>
	
	      <button type="submit">update</button>
	      <button type="button" class="cancel">cancel</button>
	    </form>
	</div>

>By default, select fields will be matched by value, you can change this with the `matchOptionsByText` option, if you want your values to be different to your displayed item.

If you provide a form with class `remove` inside your edit container, the element on which `clickToEdit` was invoked will get automatically removed upon successful post of the `remove` form.

	<div class="click-to-edit">
	    <div class="display">
	      	<span data-name="Something">initial value</span>
	    </div>
		<div class="edit">
		    <form action="/what/ever/" method="post">
		      <input type="hidden" name="SomethingId"/>
		      <input type="text" name="Something"/>
		      <button type="submit">update</button>
		      <button type="button" class="cancel">cancel</button>
		    </form>
			<form class="remove" action="/remove/me/" method="post">
				<input type="hidden" name="SomethingId"/>
		      	<button type="submit">remove</button>
		    </form>
		</div>
	</div>

> Check out the demos folder for more examples.

Optionally add a postSuccess or postFail function, which are invoked after successful or failing ajaxy call,
where 'element' is the element clickToEdit was initially called on.

    myPostSuccess = function(element, data){};
    myPostFail = function(element, jqXHR, text, errThrown){};

You can also provide a "confirm remove" function, which should return true or false, and is called when a button of type `submit` is clicked in a form with class `remove`.

    myConfirmRemove = function(element){ return true | false };

Finally, you can change the behaviour of select items. By default, if you have a select item as an edit field, it will attempt to match by value. If you want to change this so it matches on the select item option's text instead, set `matchOptionsByText=true`.

    $('.click-to-edit').clickToEdit(
	{
		postSuccess:myPostSuccess, 
		postFail:myPostFail, 
		confirmRemove:myConfirmRemove, 
		matchOptionsByText:true|false
	});


This works well with .Net MVC4 helper classes, and unobtrusive validation, for example, given a `Model` containing a list of arbitrary items...

	<ol>
    @foreach (var item in Model)
    {
        <li class="click-to-edit">
            <div class="display" data-name="Description">@Html.DisplayFor(modelItem => item.Description)</div>
                @using (@Html.BeginForm("Edit", "Item", FormMethod.Post, new { @class="edit" }))
                { 
                    @Html.Hidden("ItemId", item.ItemId)
                    @Html.TextBox("Description", "");
                    <button type="submit">save</button>
					<button type="button" class="cancel">cancel</button>
                }
        </li>
    }
	</ol>

This will work in conjunction with client-side MVC4 unobtrusive form validation.