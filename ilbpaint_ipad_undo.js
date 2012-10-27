//-------------------------------------------------
//イラブペイント　UNDO
//copyright 2010-2012 ABARS all rights reserved.
//-------------------------------------------------

var UNDO_MAX=16;

var UNDO_MODE_ONE=0;
var UNDO_MODE_ALL=1;

function UndoRedo(){
	this._undo_array=new Array();
	this._redo_array=new Array();
	
	this._get_now_image=function(layer,mode){
		var obj=new Array();
		if(mode==UNDO_MODE_ONE){
			obj.push(this._get_now_image_one(layer));
			return obj;
		}
		if(mode==UNDO_MODE_ALL){
			for(var layer=0;layer<LAYER_N;layer++){
				obj.push(this._get_now_image_one(layer));
			}
			return obj;
		}
	}
	
	this._get_now_image_one=function(layer){
		var image_data = can_fixed[layer].getContext("2d").getImageData(0,0,can_fixed[layer].width, can_fixed[layer].height);
		return image_data;
	}
	
	this.push=function(){
		this.push_core(UNDO_MODE_ONE);
	}
	
	this.push_all=function(){
		this.push_core(UNDO_MODE_ALL);
	}

	this.push_core=function(mode){
		if(g_chat.is_chat_mode()){
			g_buffer.redo_clear();
			this.update_status();
			return;
		}
		var layer=g_layer.get_layer_no();
		var obj=new Object();
		obj.mode=mode;
		obj.layer=layer;
		obj.image=this._get_now_image(layer,mode);
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
		var mode=obj.mode;

		var redo_obj=new Object();
		redo_obj.layer=layer;
		redo_obj.mode=mode;
		redo_obj.image=this._get_now_image(layer,mode);
		
		this._redo_array.push(redo_obj);

		this._canvas_size_check(obj.image[0]);

		this._put_image(obj);
		g_buffer.undo_redo_exec_on_local_tool();

		this.update_status();

		return false;
	}
	
	this._put_image=function(obj){
		if(obj.mode==UNDO_MODE_ONE){
			can_fixed[obj.layer].getContext("2d").putImageData(obj.image[0],0,0);
		}
		if(obj.mode==UNDO_MODE_ALL){
			for(var layer=0;layer<obj.image.length;layer++){
				can_fixed[layer].getContext("2d").putImageData(obj.image[layer],0,0);
			}
			for(var layer=obj.image.length;layer<LAYER_N;layer++){
				g_draw_primitive.clear(can_fixed[layer]);
			}
		}
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
		var mode=obj.mode;

		var undo_obj=new Object();
		undo_obj.layer=layer;
		undo_obj.mode=mode;
		undo_obj.image=this._get_now_image(layer,mode);

		this._undo_array.push(undo_obj);

		this._canvas_size_check(obj.image[0]);
		
		this._put_image(obj);
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
