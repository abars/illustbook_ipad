//-------------------------------------------------
//イラブペイント　ハンド
//copyright 2010-2012 ABARS all rights reserved.
//-------------------------------------------------

function Hand(){
	this._EVENT_MARGIN=32;	//キャンバス外イベント確保用マージン

	this._hand_x=0;
	this._hand_y=0;

	this._before_x=0;
	this._begore_y=0;

	this._flag=false;
	this._zoom=1;
	
	this.resize=function(){
		g_window_height=window.innerHeight;
		
		var cheight=document.getElementById("canvas_event").clientHeight;

		var toolheight=document.getElementById("bottom_tool").clientHeight;
		var new_height=(g_window_height-toolheight);
		document.getElementById("canvas_event").style.height=""+new_height+"px";
		
		this._center();
	}

	this._center=function(){
		var cwidth=document.getElementById("canvas_event").clientWidth;
		var cheight=document.getElementById("canvas_event").clientHeight;
	
		this._hand_x=Math.floor((cwidth-(can_drawing[0].width+this._EVENT_MARGIN*2)*this._zoom)/2/this._zoom);
		this._hand_y=Math.floor((cheight-(can_drawing[0].height+this._EVENT_MARGIN*2)*this._zoom)/2/this._zoom);


		can_div.style.left=""+this._hand_x+"px";
		can_div.style.top=""+this._hand_y+"px";
	}
	
	this.init=function(){
		this.resize();
	}
	
	this.get_zoom=function(){
		return this._zoom;
	}
	
	this.get_prevent_draw=function(){
		return this._flag;
	}
	
	this.on_mouse_down=function(x,y,x2,y2){
		this._flag=true;
		this._before_x=0;
	}
	
	this.on_mouse_up=function(x,y,x2,y2){
		this._flag=false;
	}
	
	this.on_mouse_move=function (x,y,x2,y2){
		if(!this._flag)
			return;

		var dist=Math.sqrt((x-x2)*(x-x2)+(y-y2)*(y-y2));
		
		x=(x+x2)/2;
		y=(y+y2)/2;

		if(this._before_x){
			this._hand_x+=(x-this._before_x)/this._zoom;
			this._hand_y+=(y-this._before_y)/this._zoom;
			can_div.style.top=""+Math.floor(this._hand_y)+"px";
			can_div.style.left=""+Math.floor(this._hand_x)+"px";
		}
		
		this._before_x=x;
		this._before_y=y;
	}

	this._zoom_cursor_x=0;
	this._zoom_cursor_y=0;

	this.set_zoom_cursor=function(x,y){
		this._zoom_cursor_x=x;
		this._zoom_cursor_y=y;
	}

	this.zoom_wheel=function(delta){
		var cursor=document.getElementById("cursor");
		var z=this._zoom+(delta/1000.0);
		this._zoom_core(z);
	}
	
	this.zoom_in=function(){
		this._zoom_core(this._zoom*1.2);
	}

	this.zoom_out=function(){
		this._zoom_core(this._zoom/1.2);
	}
	
	this._ipad_zoom=1;
	
	this.zoom_ipad_begin=function(){
		this._ipad_zoom=this._zoom;
	}

	this.zoom_ipad_change=function(m){
		this._zoom_core(this._ipad_zoom*m);
	}
	
	this._zoom_core=function(m){
		var new_zoom=m;
		if(new_zoom<1.0){
			new_zoom=1.0;
		}
		if(new_zoom>10){
			new_zoom=10;
		}

		this._hand_x-=(this._hand_x*new_zoom-this._hand_x*this._zoom)/new_zoom;
		this._hand_y-=(this._hand_y*new_zoom-this._hand_y*this._zoom)/new_zoom;

		var pos_x=(can_fixed[0].width+this._EVENT_MARGIN)/2;
		var pos_y=(can_fixed[0].height+this._EVENT_MARGIN)/2;
	
		if(ipad_is_pc()){
			pos_x=(this._zoom_cursor_x+this._EVENT_MARGIN/2);
			pos_y=(this._zoom_cursor_y+this._EVENT_MARGIN/2);
		}

		this._hand_x-=(pos_x*new_zoom-pos_x*this._zoom)/new_zoom;
		this._hand_y-=(pos_y*new_zoom-pos_y*this._zoom)/new_zoom;
		
		can_div.style.left=""+Math.floor(this._hand_x)+"px";
		can_div.style.top=""+Math.floor(this._hand_y)+"px";

		this._zoom=new_zoom;
		can_div.style.zoom=""+Math.floor(this._zoom*100)+"%";
	}
	
	this.get_zoom_for_cursor=function(){
		return this._zoom;
	}

	this.is_hand_mode=function(){
		return g_tool.get_tool()=="hand" && (g_chat.is_chat_mode() || ipad_is_pc());
	}
}
