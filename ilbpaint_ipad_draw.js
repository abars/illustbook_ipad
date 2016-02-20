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
	this._pressure;
	this._pos;
	
	this._draw_flag=false;
	this._pressure_enable=true;
	
	this.init=function(){
		this.on_load_pressure_enable();
	}

//-------------------------------------------------
//筆圧の有効無効
//-------------------------------------------------

	this.on_load_pressure_enable=function(){
		var target=document.getElementById("pressure_enable");

		target[0].selected=false;
		target[1].selected=false;

		var is_pressure_enable=window.localStorage["pressure_enable"];
		if(is_pressure_enable=="disable"){
			this._pressure_enable=false;
			target[1].selected=true;
		}else{
			this._pressure_enable=true;
			target[0].selected=true;
		}
	}

	this.on_change_pressure_enable=function(enable){
		if(enable=="enable"){
			this._pressure_enable=true;
		}else{
			this._pressure_enable=false;
		}
		window.localStorage["pressure_enable"]=enable;
	}

//-------------------------------------------------
//描画をキャンセルする
//-------------------------------------------------

	this.release_flag=function(){
		this._draw_flag=false;

		//消しゴムの状態をキャンセルする
		var ctx=this._target_can.getContext("2d");
		ctx.globalCompositeOperation="source-over";
		ctx.globalAlpha=1.0;

		//描画をキャンセルするために確定バッファからローカルバッファに描き戻す
		for(var layer=0;layer<LAYER_N;layer++){
			g_draw_primitive.clear(can_local[layer]);
			var ctx_local=can_local[layer].getContext("2d");
			ctx_local.drawImage(can_fixed[layer],0,0);
		}

		g_draw_primitive.clear(can_drawing[g_layer.get_layer_no()]);
	}

//-------------------------------------------------
//コマンドリスト
//-------------------------------------------------

	//コマンドを取得
	this.get_command_list=function(){
		var color=g_palette.get_color();
		var size=g_bottom_tool.get_size();
		var alpha=g_bottom_tool.get_alpha();
		var layer=g_layer.get_layer_no();
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
		txt+="],";

		txt+="'pressure':[";
		for(var i=0;i<this._pressure.length;i++){
			txt+=""+this._pressure[i];
			if(i!=this._pressure.length-1){
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
		var pressure=obj['pressure'];

		var len=point.length/2;
		var x_array=new Array(len);
		var y_array=new Array(len);
		var p_array=new Array(len);
		
		for(var i=0;i<len;i++){
			x_array[i]=point[i*2+0];
			y_array[i]=point[i*2+1];
			if(pressure){
				p_array[i]=pressure[i];
			}else{
				p_array[i]=1.0;
			}
		}
		
		var pos=0;
		for(var i=0;i<x_array.length;i++){
			if(this._draw_core(canvas,x_array,y_array,pos,color,size,tool,p_array)){
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

	this.on_mouse_down=function(x,y,pressure){
		if(!this._pressure_enable){
			pressure=1;
		}

		if(g_tool.get_tool()=="fill"){
			g_undo_redo.push();
			var context=can_fixed[g_layer.get_layer_no()].getContext("2d");
			var alpha=Math.floor(g_bottom_tool.get_alpha()*255);
			floodFill(Math.floor(this._get_mx(x)),Math.floor(this._get_my(y)),context,g_palette.get_color(),alpha);
			g_buffer.undo_redo_exec_on_local_tool();
			return;
		}

		this._draw_begin();
		
		this._add_point(this._get_mx(x),this._get_my(y),pressure);
		this._draw_flag=true;
		
		if(g_tool.get_tool()=="eraser" || g_tool.get_tool()=="blur_eraser"){
			this._target_can=can_local[g_layer.get_layer_no()];
			this._target_can.getContext("2d").globalCompositeOperation="destination-out"
			this._target_can.getContext("2d").globalAlpha=g_bottom_tool.get_alpha();
		}else{
			this._target_can=can_drawing[g_layer.get_layer_no()]
		}
		
		can_drawing[g_layer.get_layer_no()].style.opacity=g_bottom_tool.get_alpha();
		
		g_undo_redo.push();
	}

	this.update_cursor=function(x,y){
		var circle=document.getElementById("cursor");
		var size=Math.floor(g_bottom_tool.get_size()*g_hand.get_zoom_for_cursor());
		circle.style.left=""+Math.floor(x-size/2)+"px";
		circle.style.top=""+Math.floor(y-size/2)+"px";
		circle.style.width=""+size+"px";
		circle.style.height=""+size+"px";
		circle.style["borderRadius"]=""+Math.floor(size/2)+"px";
		circle.style.display="block";
		g_hand.set_zoom_cursor(this._get_mx(x),this._get_my(y));
	}
	
	this.on_mouse_move=function(x,y,pressure){
		if(!this._draw_flag){
			return;
		}
		if(!this._pressure_enable){
			pressure=1;
		}
		this._add_point(this._get_mx(x),this._get_my(y),pressure);
		if(this._draw_core(this._target_can,this._x_array,this._y_array,this._pos,g_palette.get_color(),g_bottom_tool.get_size(),g_tool.get_tool(),this._pressure)){
			this._pos+=2;
		}
	}
	
	this.on_mouse_up=function(){
		//描画モードでない場合
		if(!this._draw_flag){
			return;
		}

		//描画コマンドを確定
		var command_list=null;
		if(this._draw_flag){
			var l=this._x_array.length-1;
			while(this._x_array.length<=2){
				this._add_point(this._x_array[l],this._y_array[l],this._pressure[l]);
			}
			this._draw_core(this._target_can,this._x_array,this._y_array,this._pos,g_palette.get_color(),g_bottom_tool.get_size(),g_tool.get_tool(),this._pressure);
			command_list=this.get_command_list();
		}

		//状態クリア
		if(!this._target_can){
			alert("描画先キャンバスの取得に失敗。")
		}
		var ctx=this._target_can.getContext("2d");
		if(!ctx){
			alert("描画先コンテキストの取得に失敗。")
		}
		ctx.globalCompositeOperation="source-over"
		ctx.globalAlpha=1.0

		//ローカルモードの場合で単純描画の場合は描画バッファを流用することで高速化する
		//以下をコメントアウトするとイラブチャットと同じように再描画するコードとなる
		if(this._draw_flag && !g_chat.is_chat_mode()){
			var alpha_eraser=g_tool.get_tool()=="eraser" && g_bottom_tool.get_alpha()!=1;
			if(!alpha_eraser){	//α付き消しゴムはそのままだと微妙なので再描画をかける
				if(g_tool.get_tool()=="eraser" || g_tool.get_tool()=="blur_eraser"){
					//消しゴムはローカルバッファに直接描いてしまうので、確定バッファに転送する
					for(var layer=0;layer<LAYER_N;layer++){
						g_draw_primitive.clear(can_fixed[layer]);
						can_fixed[layer].getContext("2d").drawImage(can_local[layer],0,0);
					}
				}else{
					//ペンは一時描画バッファに描くので、一時描画バッファから確定バッファに転送する
					var ctx_fixed=can_fixed[g_layer.get_layer_no()].getContext("2d");
					if(!ctx_fixed){
						alert("fixedコンテキストの取得に失敗。");
					}
					ctx_fixed.globalAlpha=g_bottom_tool.get_alpha();
					ctx_fixed.drawImage(this._target_can,0,0);

					//確定バッファの値を単純にコピーする
					ctx_fixed.globalAlpha=1.0;
					for(var layer=0;layer<LAYER_N;layer++){
						g_draw_primitive.clear(can_local[layer]);
						var ctx_local=can_local[layer].getContext("2d");
						if(!ctx_local){
							alert("ローカルコンテキストの取得に失敗。")
						}
						ctx_local.drawImage(can_fixed[layer],0,0);
					}
				}

				command_list=null;	//ローカルバッファに書き出してしまうのでコマンドリストは不要
			}
		}

		//一時描画バッファのクリア
		g_draw_primitive.clear(can_drawing[g_layer.get_layer_no()]);

		//ネットワークモードの場合は描画コマンドから再描画
		this._draw_flag=false;

		//アンロードをロックする
		NeedUnloadCheck();

		return command_list;
	}

//-------------------------------------------------
// 描画処理
//-------------------------------------------------

	this._draw_begin=function(){
		this._x_array=new Array();
		this._y_array=new Array();
		this._pressure=new Array();
		this._pos=0;
	}
	
	this._add_point=function(x,y,pressure){
		pressure=this._adjust_pressure(pressure);
		this._x_array.push(x);
		this._y_array.push(y);
		this._pressure.push(pressure);

		//noise reduction
		if(this._pressure.length==3){
			this._pressure[0]=this._pressure[2];
			this._pressure[1]=this._pressure[2];
		}
	}
	
	this._is_same_point=function(x1,y1,x2,y2,x3,y3){
		var d1=(x2-x1)*(x2-x1)+(y2-y1)*(y2-y1);
		var d2=(x3-x1)*(x3-x1)+(y3-y1)*(y3-y1);
		if(d1+d2<1*1){
			return true;
		}
		return false;
	}

	this._adjust_pressure=function(p){
		if(g_tool.get_tool()!="pen"){
			return 1.0;
		}
		p=p*2;
		if(p>=1){
			p=1;
		}
		return p;
	}
	
	this._draw_core=function(canvas,x_array,y_array,pos,color,size,tool,pressure){
		if(x_array.length-pos<=2){
			return false;
		}

		var is_same_point=this._is_same_point(x_array[pos],y_array[pos],x_array[pos+1],y_array[pos+1],x_array[pos+2],y_array[pos+2]);
		
		if(tool=="blur" || tool=="blur_eraser"){
			return this._draw_blur(canvas,x_array,y_array,pos,color,size,is_same_point);
		}
		
		var context = canvas.getContext("2d");
		context.strokeStyle = color;
		context.fillStyle = color;
		context.lineCap = "round";

		if(is_same_point){
			this._draw_dot(context,x_array,y_array,pressure,size,pos);
		}else{
			if(pos>=1){
				this._draw_bspline(context,x_array,y_array,pressure,size,pos-1);
			}
			this._draw_bspline(context,x_array,y_array,pressure,size,pos);

			//this._draw_normal(context,x_array,y_array,pressure,size,pos);
		}
		
		return true;
	} 

	this._draw_dot=function(context,x_array,y_array,pressure,size,pos){
		size*=pressure[pos];
		context.beginPath();
		context.lineWidth = 1;
		context.arc(x_array[pos],y_array[pos],size/2,0,2*Math.PI,false);
		context.fill();
		context.stroke();
		context.closePath();
	}

	this._draw_normal=function(context,x_array,y_array,pressure,size,pos){
		size*=pressure[pos];
		context.beginPath();
		context.lineWidth = size;
		context.moveTo(x_array[pos], y_array[pos]);
		context.quadraticCurveTo(x_array[pos+1], y_array[pos+1],x_array[pos+2],y_array[pos+2]);
		context.stroke();
		context.closePath();
	}

	this._bspline2 = function (pressures, l, t){
		var x = 0.5 * (pressures[l - 1] + pressures[l - 2]) +
				t * (pressures[l - 1] - pressures[l - 2]) +
				0.5 * t * t * (pressures[l] - 2.0 * pressures[l - 1] + pressures[l - 2]);
		return x;
	}

	this._draw_bspline=function(context,x_array,y_array,pressure,size,pos){
		var sx=this._bspline2(x_array,pos+2,0);
		var sy=this._bspline2(y_array,pos+2,0);
		var sp=this._bspline2(pressure,pos+2,0);

		var div_unit=8;
		for(var t=0;t<=1.0;t+=1.0/div_unit){
			if(t==0)
				continue;
				
			var nx=this._bspline2(x_array,pos+2,t);
			var ny=this._bspline2(y_array,pos+2,t);
			var np=this._bspline2(pressure,pos+2,t);
				
			context.beginPath();
			context.moveTo(sx,sy);
			context.lineWidth = np * size;
			context.lineTo(nx,ny);
			context.stroke();
			context.closePath();

			sx=nx;
			sy=ny;
			sp=np;
		}
	}
	
	this._draw_blur=function(canvas,x_array,y_array,pos,color,size,is_same_point){
		size*=0.5;

		var context = canvas.getContext("2d");
		var sigma = 1.0;
		var cnt=size*sigma;
		var step=sigma*3/cnt;
		context.save();

		context.strokeStyle = color;
		context.fillStyle = color;
		context.shadowBlur = 30;
		context.lineCap = "round";

		context.beginPath();
		for(var i=step;i<sigma*3;i=i+step){
			var gauss=1/(Math.sqrt(2*Math.PI)*sigma)*Math.exp(-(i*i)/(2*sigma*sigma));
			context.globalAlpha=gauss;
			var add=0;
			if(is_same_point){
				add=1;
			}
			context.lineWidth = size*i;
			context.moveTo(x_array[pos], y_array[pos]);
			context.quadraticCurveTo(x_array[pos+1]+add, y_array[pos+1],x_array[pos+2]+add,y_array[pos+2]);
			context.stroke();
		}
		context.closePath();

		context.restore();
		return true;
	}

//-------------------------------------------------
//スポイトコア
//-------------------------------------------------

	this.get_color_of_canvas=function(canvas,x,y){
		x=this._get_mx(x);
		y=this._get_my(y);
		
		var image=canvas.getContext("2d").getImageData(x,y,1,1);
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
	
	this.clear=function(layer){
		g_undo_redo.push();
		//for(var layer=0;layer<LAYER_N;layer++){
			g_draw_primitive.clear(can_fixed[layer]);
			g_draw_primitive.clear(can_local[layer]);
		//}
	}
}

