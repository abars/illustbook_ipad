//-------------------------------------------------
//イラブペイント　レイヤー管理
//copyright 2010-2012 ABARS all rights reserved.
//-------------------------------------------------

function Layer(){
	this._canvas_width=0;
	this._canvas_height=0;

	this._layer=0;
	this._layer_mode=new Array();

	this.init=function(canvas_width,canvas_height){
		this._canvas_width=canvas_width;
		this._canvas_height=canvas_height;
		var default_layer_count=1;
		if(g_chat.is_chat_mode()){
			default_layer_count=2;
			this._layer=1;
		}
		LAYER_N=0;
		for(var layer=0;layer<default_layer_count;layer++){
			this._add_layer_core();
		}
	}
	
	this.get_canvas=function(){
		for(var layer=0;layer<LAYER_N;layer++){
			can_fixed[layer] = document.getElementById("canvas_fixed_"+layer); 
			can_local[layer] = document.getElementById("canvas_local_"+layer); 
			can_drawing[layer] = document.getElementById("canvas_drawing_"+layer);
		}
	}
	
	this.add_layer=function(){
		var max_layer=5;
		if(g_chat.is_chat_mode()){
			max_layer=2;
		}
		if(LAYER_N>=max_layer){
			return;
		}
		this._add_layer_core();
		this.show_layer_tool();
	}
	
	this._add_layer_core=function(){
		var txt="";
		var layer=LAYER_N;
		txt+='<canvas id="canvas_fixed_'+layer+'" width="'+this._canvas_width+'px" height="'+this._canvas_height+'px" style="position: absolute; top: 32; left: 32;z-index: '+(layer*3+1)+';display:none;"></canvas>';
		txt+='<canvas id="canvas_local_'+layer+'" width="'+this._canvas_width+'px" height="'+this._canvas_height+'px" style="position: absolute; top: 32; left: 32;z-index: '+(layer*3+2)+';"></canvas>';
		txt+='<canvas id="canvas_drawing_'+layer+'" width="'+this._canvas_width+'px" height="'+this._canvas_height+'px"  style="position: absolute; top: 32; left: 32;z-index: '+(layer*3+3)+';"></canvas>';
		LAYER_N++;
		this._layer_mode.push(LAYER_MODE_NORMAL);
		
		var new_layer=document.createElement("div");
		new_layer.innerHTML=txt;
		document.getElementById("canvas_div").appendChild(new_layer);
		
		this.get_canvas();
	}
	
	this.show_layer_tool=function(){
		var txt="";
		for(var layer=LAYER_N-1;layer>=0;layer--){
			var button_width=200;
			var button_height=40;
			if(this._layer==layer){
				button_width+=2;
				button_height+=2;
			}
			var layer_style="width:"+button_width+"px;height:"+button_height+"px;border-radius:4px;padding:4px;margin:4px;";
			if(this._layer==layer){
				layer_style+="background-color:#c7e5f9;";
			}else{
				layer_style+="border:solid 1px #c7e5f9;";
			}
			var layer_event="";
			if(ipad_is_pc()){
				layer_event=" onclick='javascript:g_layer.on_click_layer("+layer+",false);'";
			}
			txt+="<div id='layer_button_"+layer+"' "+layer_event+" style='"+layer_style+"'>";
			txt+="<div style='float:left;'>";
				txt+="<canvas id='layer_button_canvas_"+layer+"' width='42px' height='42px'></canvas>";
			txt+="</div>";
			txt+="<div style='padding-left:4px;float:left;'>";
			if(ipad_is_english()){
				txt+="Layer";
			}else{
				txt+="レイヤー";
			}
			txt+=""+(layer+1)+"　";
			var layer_enable="";
			var lang=0;
			if(ipad_is_english()){
				lang=1;
			}
			txt+=LAYER_MODE_NAME[this._layer_mode[layer]*2+lang];
			if(this._layer_mode[layer]){
				layer_enable="block";
			}else{
				layer_enable="none";
			}
			can_local[layer].style.display=layer_enable;
			can_drawing[layer].style.display=layer_enable;
			txt+="</div>";
			txt+="</div>";
		}
		document.getElementById("palette_tool_layer_list").innerHTML=txt;

		var txt="";
		if(!(g_chat.is_chat_mode())){
			txt+='<div class="layer_button" ';
			if(ipad_is_pc()){
				txt+='onmousedown="g_layer.add_layer();" ';
			}else{
				txt+='ontouchstart="g_layer.add_layer();" ';
			}
			txt+='>';
			if(ipad_is_english()){
				txt+='Add layer';
			}else{
				txt+='レイヤーの追加';
			}
			txt+='</div>';
			txt+='<div class="layer_button" ';
			if(ipad_is_pc()){
				txt+='onmousedown="g_layer.clear_layer();" ';
			}else{
				txt+='ontouchstart="g_layer.clear_layer();" '
			}
			txt+='>';
			if(ipad_is_english()){
				txt+='Clear layer';
			}else{
				txt+='レイヤーのクリア';
			}
			txt+='</div>';
			txt+='<div class="layer_button" ';
			if(ipad_is_pc()){
				txt+='onmousedown="g_layer.up_layer();" ';
			}else{
				txt+='ontouchstart="g_layer.up_layer();" ';
			}
			txt+='>';
			if(ipad_is_english()){
				txt+='Up';
			}else{
				txt+='一つ上に移動';
			}
			txt+='</div>';
			txt+='<div class="layer_button" ';
			if(ipad_is_pc()){
				txt+='onmousedown="g_layer.down_layer();" ';
			}else{
				txt+='ontouchstart="g_layer.down_layer();" ';
			}
			txt+='>';
			if(ipad_is_english()){
				txt+='Down';
			}else{
				txt+='一つ下に移動';
			}
			txt+='</div>';
		}
		document.getElementById("layer_button_list").innerHTML=txt;
		
		if(!ipad_is_pc()){
			for(var layer=LAYER_N-1;layer>=0;layer--){
				document.getElementById("layer_button_"+layer).addEventListener("touchstart", g_layer_click,false);
			}
		}
		
		this.update_thumbnail();
	}
	
	this.update_thumbnail=function(){
		for(var layer=LAYER_N-1;layer>=0;layer--){
			var image_can=document.getElementById("layer_button_canvas_"+layer);
			g_draw_primitive.fill_white(image_can);
			var context=image_can.getContext("2d");
			var scale_h=image_can.width/can_fixed[layer].width;
			var scale_v=image_can.height/can_fixed[layer].height;
			context.save();
			context.scale(scale_h,scale_v);
			context.drawImage(can_fixed[layer],0,0);
			context.drawImage(can_local[layer],0,0);
			context.restore();
		}
	}

	this.get_layer_no=function(){
		return this._layer;
	}
	
	this.get_layer_mode=function(layer){
		return this._layer_mode[layer];
	}
	
	this.clear_layer=function(){
		g_draw_canvas.clear(this._layer);
		this.update_thumbnail();
	}
	
	this._canvas_swap=function(image1,image2){
		var data1=image1.getContext("2d").getImageData(0,0,image1.width,image1.height);
		var data2=image2.getContext("2d").getImageData(0,0,image2.width,image2.height);
		image1.getContext("2d").putImageData(data2,0,0);
		image2.getContext("2d").putImageData(data1,0,0);
	}
	
	this.up_layer=function(){
		if(this._layer+1>=LAYER_N){
			return;
		}
		g_undo_redo.push_all();
		this._canvas_swap(can_fixed[this._layer],can_fixed[this._layer+1]);
		this._canvas_swap(can_local[this._layer],can_local[this._layer+1]);
		this._layer=this._layer+1;
		this.show_layer_tool();
	}
	
	this.down_layer=function(){
		if(this._layer-1<0){
			return;
		}
		g_undo_redo.push_all();
		this._canvas_swap(can_fixed[this._layer],can_fixed[this._layer-1]);
		this._canvas_swap(can_local[this._layer],can_local[this._layer-1]);
		this._layer=this._layer-1;
		this.show_layer_tool();
	}

	this._update_canvas_size=function(canvas,image){
		canvas.width=image.width;
		canvas.height=image.height;
	}
	
	this.change_canvas_size=function(image){
		this._canvas_width=image.width;
		this._canvas_height=image.height;
		for(var layer=0;layer<LAYER_N;layer++){
			this._update_canvas_size(can_fixed[layer],image);
			this._update_canvas_size(can_local[layer],image);
			this._update_canvas_size(can_drawing[layer],image);
		}
		this._update_canvas_size(document.getElementById("canvas_background"),image);
		this._update_canvas_size(document.getElementById("canvas_work"),image);
		this._update_canvas_size(document.getElementById("canvas_rendering"),image);
		document.getElementById("canvas_div").style.width=image.width+64;
		document.getElementById("canvas_div").style.height=image.height+64;

		g_hand.init();
	}

	this.on_click_layer=function(layer_no,is_touch){
		layer_no=Number(layer_no);
		if(this._layer==layer_no){
			this._layer_mode[this._layer]++;
			if(this._layer_mode[this._layer]>=LAYER_MODE_N){
				this._layer_mode[this._layer]=0;
			}
		}else{
			this._layer=layer_no;
		}
		this.show_layer_tool();
	}

	this.set_layer_mode=function(layer_no,mode){
		this._layer_mode[layer_no]=mode;
	}
}

function g_layer_click(e){
	g_layer.on_click_layer(this.id.split("layer_button_")[1],true);
	e.preventDefault();
}

function LayerMove(){
	this._layer;
	this._image_data=null;
	this._sx;
	this._sy;

	this.is_move_mode=function(){
		return g_tool.get_tool()=="hand" && !(g_chat.is_chat_mode() || ipad_is_pc());
	}
	
	this.on_mouse_down=function(x,y,layer){
		g_undo_redo.push();
		var context=can_fixed[layer].getContext("2d");
		this._image_data = context.getImageData(0,0,can_fixed[layer].width, can_fixed[layer].height);
		this._layer=layer;
		this._sx=x;
		this._sy=y;
	}
	
	this.on_mouse_move=function(x,y){
		if(this._image_data==null){
			return;
		}
		var context=can_fixed[this._layer].getContext("2d");
		context.clearRect(0,0,can_fixed[this._layer].width, can_fixed[this._layer].height);
		can_fixed[this._layer].getContext("2d").putImageData(this._image_data,x-this._sx,y-this._sy);
		g_buffer.undo_redo_exec_on_local_tool();
	}
	
	this.on_mouse_up=function(){
		this._image_data=null;
	}
}

