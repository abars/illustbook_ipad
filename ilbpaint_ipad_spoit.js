//-------------------------------------------------
//イラブペイント　スポイト
//copyright 2010-2012 ABARS all rights reserved.
//-------------------------------------------------

function Spoit(){
	this._hold=false;
	
	this.init=function(){
	}
	
	this.is_spoit_mode=function(){
		var tool=g_tool.get_tool();
		return tool=="spoit" || tool=="canvas_spoit";
	}
	
	this.on_mouse_move=function(x,y){
		if(this._hold){
			this._spoit_core(x,y,g_tool.get_tool()=="canvas_spoit");
		}
	}
	
	this.on_mouse_down=function(x,y){
		this._hold=true;
		this._spoit_core(x,y,g_tool.get_tool()=="canvas_spoit");
	}
	
	this.on_mouse_up=function(){
		this._hold=false;
	}

	this.on_context_menu=function(x,y){
		this._spoit_core(x,y,g_tool.get_tool()=="canvas_spoit");
	}
	
	this._spoit_core=function(x,y,is_canvas_spoit){
		var color=g_draw_canvas.get_color_of_canvas(can_local[g_layer.get_layer_no()],x,y);
		if(is_canvas_spoit){
			g_rendering.rendering();
			color=g_draw_canvas.get_color_of_canvas(g_rendering.get_canvas(),x,y);
		}
		g_color_circle.set_color(color);
	}
}
