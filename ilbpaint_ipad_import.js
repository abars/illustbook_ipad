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
				g_undo_redo.push_all();
				g_layer.change_canvas_size(image);
				
				var context=can_fixed[0].getContext("2d");
				context.drawImage(image, 0, 0);
				g_buffer.undo_redo_exec_on_local_tool();
			}
			image.src = evt.target.result;
		}
		reader.readAsDataURL(f);
		g_imported=true;
		g_upload.set_illust_exist();
	}
}

function ipad_import_from_url(url){
	var image = new Image();
	image.onload = function() {
		g_undo_redo.push_all();
		g_layer.change_canvas_size(image);
		var context=can_fixed[0].getContext("2d");
		context.drawImage(image, 0, 0);
		g_buffer.undo_redo_exec_on_local_tool();
		g_upload.set_illust_exist();
	}
	image.src = "./img/"+url+".jpg";
}