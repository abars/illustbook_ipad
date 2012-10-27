//-------------------------------------------------
//イラブペイント　UNDO
//copyright 2010-2012 ABARS all rights reserved.
//-------------------------------------------------

var UNDO_MAX=16;

function UndoRedo(){
	this._undo_array=new Array();
	this._redo_array=new Array();
	
	this._get_now_image=function(layer){
		var image_data = can_fixed[layer].getContext("2d").getImageData(0,0,can_fixed[layer].width, can_fixed[layer].height);
		return image_data;
	}

	this.push=function(){
		if(g_chat.is_chat_mode()){
			g_buffer.redo_clear();
			this.update_status();
			return;
		}
		var layer=g_layer.get_layer_no();
		var obj=new Object();
		obj.layer=layer;
		obj.image=this._get_now_image(layer);
		this._undo_array.push(obj);
		this._redo_array=new Array();
		while(this._undo_array.length>=UNDO_MAX){
			this._undo_array.shift();
		}
		this.update_status();
	}

	this.undo=function(is_touch){
		if(g_chat.is_chat_mode()){
			g_buffer.undo();
			this.update_status();
			return false;
		}
		if(this._undo_array.length<=0){
			return false;
		}
		var obj=this._undo_array.pop();
		var layer=obj.layer;

		var redo_obj=new Object();
		redo_obj.layer=layer;
		redo_obj.image=this._get_now_image(layer);
		
		this._redo_array.push(redo_obj);

		this._canvas_size_check(obj.image);

		can_fixed[obj.layer].getContext("2d").putImageData(obj.image,0,0);
		g_buffer.undo_redo_exec_on_local_tool();

		this.update_status();

		return false;
	}
	
	this.redo=function(is_touch){
		if(g_chat.is_chat_mode()){
			g_buffer.redo();
			this.update_status();
			return false;
		}
		if(this._redo_array.length<=0){
			return false;
		}

		var obj=this._redo_array.pop();
		var layer=obj.layer;

		var undo_obj=new Object();
		undo_obj.layer=layer;
		undo_obj.image=this._get_now_image(layer);

		this._undo_array.push(undo_obj);

		this._canvas_size_check(obj.image);
		
		can_fixed[obj.layer].getContext("2d").putImageData(obj.image,0,0);
		g_buffer.undo_redo_exec_on_local_tool();

		this.update_status();
		
		return false;
	}
	
	this.update_status=function(){
		g_tool.update_undo_redo_status();
		g_bottom_tool.update_layer_thumbnail();
	}
	
	this._canvas_size_check=function(image){
		if(can_fixed[0].width!=image.width || can_fixed[0].height!=image.height){
			g_layer.change_canvas_size(image);
		}
	}
	
	this.is_redo_exist=function(){
		if(g_chat.is_chat_mode()){
			return g_buffer.is_redo_exist();
		}
		return (this._redo_array.length>0);
	}

	this.is_undo_exist=function(){
		if(g_chat.is_chat_mode()){
			return g_buffer.is_undo_exist();
		}
		return (this._undo_array.length>0);
	}
}
