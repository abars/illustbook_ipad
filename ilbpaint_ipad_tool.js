//-------------------------------------------------
//イラブペイント　基本ツール
//copyright 2010-2012 ABARS all rights reserved.
//-------------------------------------------------

//-------------------------------------------------
//ツールボックス
//-------------------------------------------------

var TOOL_ENABLE_ALPHA=1.0;
var TOOL_DISABLE_ALPHA=0.5;

function ToolBox(){
	this._add_button=function(cmd,info,info_eng,icon,s,margin){
		if(ipad_is_english()){
			info=info_eng;
		}
		var txt='<div id="'+cmd+'"';
		if(ipad_is_pc()){
			txt+=' onclick="javascript:'+cmd+'(false);"';
		}else{
			txt+=' ontouchstart="javascript:'+cmd+'(false);"';
		}
		txt+=' class="tool_button" style="position:relative;float:left;margin-left:'+margin+'px;">';
		if(icon!=""){
			txt+='<img src=\'js/ipad/icons/'+icon+'.png\' class="tool_button_icon"/>';
		}
		txt+='<div class="tool_button_option">'+info_eng+'</div>';
		txt+='</div>';
		return txt;
	}

	this.init=function(){
		var txt="";
		var s=0;
		var margin=16;

		txt+=this._add_button("g_bottom_tool.click_color_button","","","",s,0);
		txt+=this._add_button("g_undo_redo.undo","","","undo",s,0);
		txt+=this._add_button("g_undo_redo.redo","","","redo",s,0);

		txt+=this._add_button("g_tool.set_pen","","","pen",s,margin);
		if(!g_chat.is_chat_mode()){
			txt+=this._add_button("g_tool.set_blur","","","brush",s,0);
			txt+=this._add_button("g_tool.set_fill","","","fill",s,0);
		}
		txt+=this._add_button("g_tool.set_eraser","","","eraser",s,0);
		if(!g_chat.is_chat_mode()){
			txt+=this._add_button("g_tool.set_blur_eraser","","B","eraser",s,0);
		}
		txt+=this._add_button("g_tool.set_spoit","","","spoit",s,0);
		//txt+=this._add_button("g_tool.set_canvas_spoit","","C","spoit",s,0);
		
		if(g_chat.is_chat_mode()){
			txt+=this._add_button("g_tool.set_hand","","","hand",s,margin);
			txt+=this._add_button("g_hand.zoom_in","","","zoom_in",s,0);
			txt+=this._add_button("g_hand.zoom_out","","","zoom_out",s,0);
		}else{
			if(ipad_is_pc()){
				txt+=this._add_button("g_tool.set_hand","","","hand",s,0);
			}else{
				txt+=this._add_button("g_tool.set_hand","","","hand",s,0);
			}
		}

		document.getElementById("toolmenu").innerHTML=txt;

		txt="";

		txt+=this._add_button("g_bottom_tool.click_layer_button","","","layer",s,0);
		if(!g_chat.is_chat_mode()){
			txt+=this._add_button("ipad_switch_storage_form","","","setting",s,0);
		}
		var submit_button_exist=(window.innerWidth>480 || !g_chat.is_chat_mode());
		if(!(g_chat.is_view_mode()) && submit_button_exist){
			txt+=this._add_button("ipad_switch_upload_form","","","upload",s,0);
		}
		
		//デバッグ
		if(SNAPSHOT_SNAP_BUTTON){
			txt+=this._add_button("g_chat.prepare_snapshot();g_chat.snapshot","","Snap","snap",s,margin);
		}

		document.getElementById("toolmenu2").innerHTML=txt;
	}

	this._get_button_color=function(enable){
		if(enable){
			return "#292929";
		}
		return "#494949";
	}

	this.update=function(){
		document.getElementById("ipad_switch_upload_form").style["backgroundColor"]=this._get_button_color(g_upload.is_upload_mode());
		document.getElementById("ipad_switch_storage_form").style["backgroundColor"]=this._get_button_color(g_storage.is_storage_mode());
	}
}

//-------------------------------------------------
//ツール
//-------------------------------------------------

function Tool(){
	this._tool;
	
	this.init=function(){
		this._tool=="";
		this._set_core("pen");
		this.update_undo_redo_status();
	}
	
	this.set_hand=function(){
		this._set_core("hand");
	}
	
	this.set_pen=function(){
		this._set_core("pen");
	}

	this.set_blur=function(){
		this._set_core("blur");
	}

	this.set_fill=function(){
		this._set_core("fill");
	}
	
	this.set_eraser=function(){
		this._set_core("eraser");
	}

	this.set_blur_eraser=function(){
		this._set_core("blur_eraser");
	}

	this.set_spoit=function(){
		this._set_core("spoit");
	}

	this.set_canvas_spoit=function(){
		this._set_core("canvas_spoit");
	}

	this._set_core=function(tool){
		if(this._tool==tool){
			return;
		}

		//background-colorだとFirefoxで動作しない
		//backgroundColorにすること

		var color="#494949";
		document.getElementById("g_tool.set_pen").style["backgroundColor"]=color;
		if(!g_chat.is_chat_mode()){
			document.getElementById("g_tool.set_fill").style["backgroundColor"]=color;
			document.getElementById("g_tool.set_blur").style["backgroundColor"]=color;
			document.getElementById("g_tool.set_blur_eraser").style["backgroundColor"]=color;
		}
		document.getElementById("g_tool.set_eraser").style["backgroundColor"]=color;
		document.getElementById("g_tool.set_hand").style["backgroundColor"]=color;
		document.getElementById("g_tool.set_spoit").style["backgroundColor"]=color;
		//document.getElementById("g_tool.set_canvas_spoit").style["backgroundColor"]=color;

		color="#292929";
		document.getElementById("g_tool.set_"+tool).style["backgroundColor"]=color;
		
		this._tool=tool;
		g_bottom_tool.on_tool_change(this.get_tool());
	}
	
	this.get_tool=function(){
		return this._tool;
	}

	this.update_undo_redo_status=function(){
		var color=TOOL_DISABLE_ALPHA;
		if(g_undo_redo.is_undo_exist()){
			color=TOOL_ENABLE_ALPHA;
		}
		document.getElementById("g_undo_redo.undo").style["opacity"]=color;

		color=TOOL_DISABLE_ALPHA;
		if(g_undo_redo.is_redo_exist()){
			color=TOOL_ENABLE_ALPHA;
		}
		document.getElementById("g_undo_redo.redo").style["opacity"]=color;
	}

	this.update_color_status=function(color){
		document.getElementById("g_bottom_tool.click_color_button").style["backgroundColor"]=color;
	}
}

