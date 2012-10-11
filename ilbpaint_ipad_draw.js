//-------------------------------------------------
//イラブペイント　描画クラス
//copyright 2010-2012 ABARS all rights reserved.
//-------------------------------------------------

function DrawCanvas(){

//-------------------------------------------------
//メンバ変数
//-------------------------------------------------

	this._x_array;
	this._y_array;
	this._pos;
	
	this._draw_flag=false;
	
	this.release_flag=function(){
		this._draw_flag=false;
	}

//-------------------------------------------------
//コマンドリスト
//-------------------------------------------------

	//コマンドを取得
	this.get_command_list=function(){
		var color=g_palette.get_color();
		var size=g_color_circle.get_size();
		var alpha=g_color_circle.get_alpha();
		var layer=g_color_circle.get_layer_no();
		var tool=g_tool.get_tool();
		
		var txt="[{";
		txt+="'user_id':'"+g_chat.get_user_id()+"',"
		txt+="'packet_no':"+g_chat.get_packet_no()+","
		txt+="'cmd':"+CMD_DRAW+",";
		txt+="'color':'"+color+"',";
		txt+="'size':'"+size+"',";
		txt+="'alpha':'"+alpha+"',";
		txt+="'layer':"+layer+",";
		txt+="'tool':'"+tool+"',";

		txt+="'point':[";
		for(var i=0;i<this._x_array.length;i++){
			txt+=""+this._x_array[i]+","+this._y_array[i];
			if(i!=this._x_array.length-1){
				txt+=",";
			}
		}
		txt+="]";
		txt+="}]";
		return txt;
	}
	
	//コマンドから描画
	this.draw_command_list=function(canvas,cmd){
		var obj=eval(cmd)[0];
		
		var color=obj['color'];
		var size=obj['size'];
		var alpha=obj['alpha'];
		var point=obj['point'];
		var tool=obj['tool'];

		var len=point.length/2;
		var x_array=new Array(len);
		var y_array=new Array(len);
		
		for(var i=0;i<len;i++){
			x_array[i]=point[i*2+0];
			y_array[i]=point[i*2+1];
		}
		
		var pos=0;
		for(var i=0;i<x_array.length;i++){
			if(this._draw_core(canvas,x_array,y_array,pos,color,size,tool)){
				pos+=2;
			}
		}
	}

//-------------------------------------------------
//マウスイベント
//-------------------------------------------------

	this._target_can;

	this.is_drawing=function(){
		return this._draw_flag;
	}

	this.on_mouse_down=function(x,y){
		this._draw_begin();
		
		this._add_point(this._get_mx(x),this._get_my(y));
		this._draw_flag=true;
		
		if(g_tool.get_tool()=="eraser" || g_tool.get_tool()=="blur_eraser"){
			this._target_can=can_local[g_color_circle.get_layer_no()]
			this._target_can.getContext("2d").globalCompositeOperation="destination-out"
			this._target_can.getContext("2d").globalAlpha=g_color_circle.get_alpha();
		}else{
			this._target_can=can_drawing[g_color_circle.get_layer_no()]
		}
		
		can_drawing[g_color_circle.get_layer_no()].style.opacity=g_color_circle.get_alpha();
		
		g_undo_redo.push();
	}
	
	this.on_mouse_move=function(x,y){
		if(!this._draw_flag){
			return;
		}
		this._add_point(this._get_mx(x),this._get_my(y));
		if(this._draw_core(this._target_can,this._x_array,this._y_array,this._pos,g_palette.get_color(),g_color_circle.get_size(),g_tool.get_tool())){
			this._pos+=2;
		}
	}
	
	this.on_mouse_up=function(){
		if(!(this._draw_flag)){
			return null;
		}

		if(this._draw_flag){
			while(this._x_array.length<=2){
				this._add_point(this._x_array[0],this._y_array[0]);
			}
			this._draw_core(this._target_can,this._x_array,this._y_array,this._pos,g_palette.get_color(),g_color_circle.get_size(),g_tool.get_tool());
		}

		g_draw_primitive.clear(can_drawing[g_color_circle.get_layer_no()]);
		this._target_can.getContext("2d").globalCompositeOperation="source-over"
		this._target_can.getContext("2d").globalAlpha=1.0

		if(this._draw_flag){
			this._draw_flag=false;
			return this.get_command_list();
		}
		
		return null;
	}

//-------------------------------------------------
// 描画処理
//-------------------------------------------------

	this._draw_begin=function(){
		this._x_array=new Array();
		this._y_array=new Array();
		this._pos=0;
	}
	
	this._add_point=function(x,y){
		this._x_array.push(x);
		this._y_array.push(y);
	}
	
	this._draw_core=function(canvas,x_array,y_array,pos,color,size,tool){
		if(x_array.length-pos<=2){
			return false;
		}
		
		if(tool=="blur" || tool=="blur_eraser"){
			return this._draw_blur(canvas,x_array,y_array,pos,color,size);
		}
		
		var context = canvas.getContext("2d");
		context.strokeStyle = color;
		context.lineWidth = size;
		context.lineCap = "round";
		
		context.beginPath();
		context.moveTo(x_array[pos], y_array[pos]);
		context.quadraticCurveTo(x_array[pos+1], y_array[pos+1],x_array[pos+2],y_array[pos+2]);
		context.stroke();
		context.closePath();
		
		return true;
	} 
	
	this._draw_blur=function(canvas,x_array,y_array,pos,color,size){
		var context = canvas.getContext("2d");
		var sigma = 1.0;
		var cnt=size*sigma;
		var step=sigma*3/cnt;
		context.save();
		for(var i=step;i<sigma*3;i=i+step){
			var gauss=1/(Math.sqrt(2*Math.PI)*sigma)*Math.exp(-(i*i)/(2*sigma*sigma));
			context.strokeStyle = color;
			context.shadowBlur = 30;
			context.globalAlpha=gauss;
			context.lineWidth = size*i;
			context.lineCap = "round";
			context.beginPath();
			context.moveTo(x_array[pos], y_array[pos]);
			context.quadraticCurveTo(x_array[pos+1], y_array[pos+1],x_array[pos+2],y_array[pos+2]);
			context.stroke();
			context.closePath();
		}
		context.restore();
		return true;
	}

//-------------------------------------------------
//スポイトコア
//-------------------------------------------------

	this.get_color_of_canvas=function(x,y){
		x=this._get_mx(x);
		y=this._get_my(y);
		
		var image=can_local[g_color_circle.get_layer_no()].getContext("2d").getImageData(x,y,1,1);
		var r=image.data[0];
		var g=image.data[1];
		var b=image.data[2];
		var a=image.data[3];
		
		if(a==0){
			r=255;
			g=255;
			b=255;
		}
			
		return (a<<24) | (r<<16) | (g<<8) | b;
	}

//-------------------------------------------------
//位置取得
//-------------------------------------------------

	this._get_mx=function(x){
		var canvasRect = can_drawing[0].getBoundingClientRect();
		return (x-canvasRect.left*g_hand.get_zoom())/g_hand.get_zoom();
	}
	
	this._get_my=function(y){
		var canvasRect = can_drawing[0].getBoundingClientRect();
		return (y-canvasRect.top*g_hand.get_zoom())/g_hand.get_zoom();
	}
	
	this.clear=function(){
		g_undo_redo.push();
		for(var layer=0;layer<LAYER_N;layer++){
			g_draw_primitive.clear(can_fixed[layer]);
			g_draw_primitive.clear(can_local[layer]);
		}
	}
}

