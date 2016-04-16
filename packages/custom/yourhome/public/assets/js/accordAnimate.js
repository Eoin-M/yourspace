$(document).on('click',"a.jobLink", function(){
	var quickCheck = true;
	if($(this).find("h6").find(".rotate").hasClass("down")) quickCheck = false;
	$('.down').removeClass('down');
	if(quickCheck) $(this).find("h6").find(".rotate").addClass("down");
	
});

$(document).ready(function(){ 		
	setTimeout(function(){
		jQuery('.sortable').sortable({
		  handle: "#handle",
		  cursor: 'move',
		  opacity: 0.4,
		  stop: function(event, ui) {
			jQuery(ui.item).find('h3').click();
			var sortorder = [];
			var itemorder;
			$('.sortable').each(function() {
			  itemorder = jQuery(this).sortable('toArray');
			  console.dir(itemorder);
			  itemorder = itemorder.toString();
			 
			});
			//console.log('SortOrder: ' + sortorder);
			sortorder = itemorder.split(",");
			sortorder.shift();
			angular.element(document.getElementById("yourhome")).scope().saveModules(sortorder);
		  }
		});
		//jQuery('.sortable').disableSelection(); don't have this if you want working input boxes!!
	}, 3000);
		
});

$(document).ready(function() {
    $(document).on("click","#joannaDrop",function() {
        $('.dropdown-accordion').on('click', 'a[data-toggle="collapse"]', function(event) {
		  event.preventDefault();
		  event.stopPropagation();
		  $($(this).data('parent')).find('.panel-collapse.in').collapse('hide');
		  $($(this).attr('href')).collapse('show');
		});
		$('.dropdown-accordion').on('click', 'div[class="opt"]', function(event) {
			//event.preventDefault(); //prevents jumping to top of page
			//event.stopPropagation();
		  $($(this).data('parent')).find('.panel-collapse.in').collapse('hide');
		  $($(this).attr('href')).collapse('show');
		});

		$('.dropdown-accordion').on('show.bs.dropdown', function(event) {
		  var accordion = $(this).find($(this).data('accordion'));
		  accordion.find('.panel-collapse.in').collapse('hide');
		});
		
	
    });
	

});



function removeTheModule(id){
	angular.element(document.getElementById("yourhome")).scope().removeModule(id);
}