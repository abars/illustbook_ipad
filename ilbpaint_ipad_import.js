//-------------------------------------------------
//イラブペイント　画像読込
//copyright 2010-2012 ABARS all rights reserved.
//-------------------------------------------------

var g_imported=false;

function Import(){
}

function ipad_import(){
	var f = document.getElementById("import").files[0];
	if(f.type.match("image.*")){
		var reader = new FileReader();
		var image = new Image();
		reader.onload = function(evt) {
			image.onload = function() {
				g_undo_redo.push();
				g_layer.change_canvas_size(image);
				
				var context=can_local[0].getContext("2d");
				context.drawImage(image, 0, 0);
			}
			image.src = evt.target.result;
		}
		reader.readAsDataURL(f);
		g_imported=true;
	}
}