//-------------------------------------------------
//イラブペイント　iPad版
//copyright 2010-2012 ABARS all rights reserved.
//-------------------------------------------------

//-------------------------------------------------
//インスタンス化
//-------------------------------------------------

var g_draw_canvas=new DrawCanvas();
var g_palette=new Palette();
var g_upload=new Upload();
var g_undo_redo=new UndoRedo();
var g_hand=new Hand();
var g_tool_box=new ToolBox();
var g_chat=new Chat();
var g_buffer=new Buffer();
var g_draw_primitive=new DrawPrimitive();
var g_user=new User();
var g_spoit=new Spoit();
var g_tool=new Tool();
var g_color_circle=new ColorCircle();

function ipad_init(){
	ipad_get_instance();
	ipad_event_init();
	
	g_tool_box.init();
	g_hand.init();
	g_chat.init();
	g_buffer.init();
	g_draw_primitive.init();
	g_user.init();
	g_spoit.init();
	g_color_circle.init();
	g_tool.init();
	g_palette.init();
	
	if(g_viewmode){
		g_buffer._update_comment({"comment":"閲覧モードで起動しました。書き込みはできません。"});
	}
	g_buffer._update_comment({"comment":"初期読込を開始します。"});
}

//-------------------------------------------------
//インスタンス取得
//-------------------------------------------------

//can_drawingに描画->コマンド取得->can_localに描画->ネットワーク送信
//ネットワーク送信に成功->can_fixedに描画->can_localから削除

var can_fixed=new Array();		//ネットワークで確定した画像が格納される
var can_local=new Array();		//ローカルで確定した画像が格納される
var can_drawing=new Array();	//描画中の画像が格納される

var can_work;		//各種ワーク

var can_div;

var g_button_width;
var g_button_height;

var g_color_width;
var g_size_width;
var g_window_height;

function ipad_get_instance(){
	for(var layer=0;layer<LAYER_N;layer++){
		can_fixed[layer] = document.getElementById("canvas_fixed_"+layer); 
		can_local[layer] = document.getElementById("canvas_local_"+layer); 
		can_drawing[layer] = document.getElementById("canvas_drawing_"+layer);
	}
	
	//g_draw_primitive.fill_white(can_fixed[0]);
	//g_draw_primitive.fill_white(can_local[0]);
	
	can_work = document.getElementById("canvas_work");
	can_div = document.getElementById("canvas_div"); 
	
	g_button_width=48;//100;
	g_button_height=48;//20;
	
	g_size_width=32;
	g_color_width=16;
}

//-------------------------------------------------
//イベント
//-------------------------------------------------

function ipad_event_init(){
	var can_event=document.getElementById("canvas_event");

	can_div.addEventListener("mousemove", ipad_on_mouse_move, false);
	can_div.addEventListener("mousedown", ipad_on_mouse_down , false);
	//can_div.addEventListener("mouseup", ipad_on_mouse_up,false);
	can_event.addEventListener("mouseup", ipad_on_mouse_up,false);	//画面外でUpされた場合用

	can_div.addEventListener("touchmove", ipad_on_mouse_move, false);
	can_div.addEventListener("touchstart", ipad_on_mouse_down , false);
	//can_div.addEventListener("touchend", ipad_on_mouse_up,false);
	can_event.addEventListener("touchend", ipad_on_mouse_up,false);
	
	can_div.addEventListener("gesturestart", function(e){ e.preventDefault();},false);
	can_event.addEventListener("touchstart", function(e){ e.preventDefault();},false);

	//横スクロール禁止
	document.getElementById("toolmenu").addEventListener("touchmove", function(e){ e.preventDefault();},false);
	document.getElementById("bottom_tool").addEventListener("touchmove", function(e){ e.preventDefault();},false);
}

function ipad_on_mouse_move(e){
	if(e.touches){
		e.preventDefault();
		if(e.touches.length>=2){
			g_hand.on_mouse_move(e.touches[0].clientX,e.touches[0].clientY,e.touches[1].clientX,e.touches[1].clientY);
			return;
		}
		ipad_on_mouse_move_core(e.touches[0].clientX,e.touches[0].clientY);
		return;
	}
	ipad_on_mouse_move_core(e.clientX,e.clientY);
}

function ipad_on_mouse_down(e){
	if(g_draw_canvas.is_drawing()){	//OnMouseUpが呼ばれなかった
		ipad_on_mouse_up_core();
	}
	if(e.touches){
		e.preventDefault();
		if(e.touches.length>=2){
			g_hand.on_mouse_down(e.touches[0].clientX,e.touches[0].clientY,e.touches[1].clientX,e.touches[1].clientY);
			return;
		}
		ipad_on_mouse_down_core(e.touches[0].clientX,e.touches[0].clientY);
		return;
	}
	ipad_on_mouse_down_core(e.clientX,e.clientY);
}

function ipad_on_mouse_move_core(x,y){
	if(g_spoit.is_spoit_mode()){
		g_spoit.on_mouse_move(x,y);
		return;
	}
	if(g_hand.is_hand_mode()){
		g_hand.on_mouse_move(x,y,0,0);
		return;
	}
	g_draw_canvas.on_mouse_move(x,y);

}

function ipad_on_mouse_down_core(x,y){
	if(g_spoit.is_spoit_mode()){
		g_spoit.on_mouse_down(x,y);
		return;
	}
	if(g_hand.is_hand_mode()){
		g_hand.on_mouse_down(x,y,0,0);
		return;
	}
	if(!(g_chat.is_view_mode())){
		g_draw_canvas.on_mouse_down(x,y);
	}
}

function ipad_on_mouse_up(e){
	e.preventDefault();
	ipad_on_mouse_up_core();
}

function ipad_on_mouse_up_core(){
	if(g_hand.get_prevent_draw()){
		g_draw_canvas.release_flag();
	}

	var command=g_draw_canvas.on_mouse_up(0,0);
	if(command){
		g_buffer.push_command(command);
	}

	g_hand.on_mouse_up(0,0,0,0);
	g_spoit.on_mouse_up();
}

function ipad_is_pc(){
	return (window.ontouchstart===undefined);
}

//-------------------------------------------------
//アップロード通知
//-------------------------------------------------

function ipad_upload_callback(oj){
	if(oj.responseText.match("success")){
		g_upload.go_bbs();
		return;
	}
	alert("アップロードに失敗しました。");
}

//-------------------------------------------------
//ツールクリック
//-------------------------------------------------

function ipad_switch_upload_form(is_touch){
	ipad_switch_form(is_touch,"upload_form");
}

function ipad_switch_palette_form(is_touch){
	ipad_switch_form(is_touch,"palette_form");
}

function ipad_switch_pen_form(is_touch){
	ipad_switch_form(is_touch,"pensize_form");
}

function ipad_switch_form(is_touch,mode){
	if(document.getElementById(mode).style.display=="block"){
		document.getElementById(mode).style.display='none';
	}else{
		document.getElementById(mode).style.display='block';
	}
	g_hand.resize(true);
}