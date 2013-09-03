# Basic click-to-edit functionality.

####TL;DR
This plugin displays a hidden form with the class `edit` on click of corresponding element with the class `display`. Form data is then `$.ajax data` to the action of the `edit` form.

####Basic HTML structure
	<div class="click-to-edit">
	    <h2 class="display" data-name="Something">Something</h2>
	
	    <form class="edit" action="/what/ever/" method="post">
	      <input type="text" name="Something"/>
	
	      <button type="submit">update</button>
	      <button type="button" class="cancel">cancel</button>
	    </form>
	</div>

####JS

	$('.click-to-edit').clickToEdit();
