//-------------------------------------------------
//イラブペイント　ローカルストレージへの保存
//copyright 2013 ABARS all rights reserved.
//-------------------------------------------------

function Storage(){
	this._is_storage_mode=false;

	this.switch_storage_form=function(){
		this._is_storage_mode=!this._is_storage_mode;
		var tool_height=document.getElementById("bottom_tool").clientHeight;
		document.getElementById("storage_form").style.bottom=tool_height+"px";
		g_tool_box.update();
	}

	this.is_storage_mode=function(){
		return this._is_storage_mode;
	}

	this.save=function(){
		if(!confirm((ipad_is_english() ? "Save to local storage?":"ローカルストレージに保存しますか？"))){
			return;
		}
		var id="temp";
		window.localStorage[id+"_enable"]=true
		window.localStorage[id+"_layers"]=LAYER_N
		window.localStorage[id+"_width"]=can_fixed[0].width
		window.localStorage[id+"_height"]=can_fixed[0].height
		for(var layer=0;layer<LAYER_N;layer++){
			var layer_image=can_fixed[layer].toDataURL("image/png");
			var layer_mode=g_layer.get_layer_mode(layer);
			window.localStorage[id+"_layer"+layer+"_mode"]=layer_mode;
			window.localStorage[id+"_layer"+layer+"_image"]=layer_image;
		}
		alert((ipad_is_english() ? "Complete":"保存が完了しました。"));
		ipad_switch_storage_form();
	}

	this.load=function(){
		var id="temp";
		if(!window.localStorage[id+"_enable"]){
			alert((ipad_is_english() ? "No data exist":"保存されているデータがありません。"));
			return;
		}
		var layer_n=Number(window.localStorage[id+"_layers"]);
		var width=Number(window.localStorage[id+"_width"]);
		var height=Number(window.localStorage[id+"_height"]);
		
		//現在のキャンバスをクリア
		g_undo_redo.push_all();
		for(var layer=0;layer<LAYER_N;layer++){
			var context=can_fixed[layer].getContext("2d");
			context.clearRect(0,0,can_fixed[layer].width, can_fixed[layer].height);
		}

		//画像を読込
		var layer_image_list=new Array();
		var layer_mode_list=new Array();

		for(var layer=0;layer<layer_n;layer++){
			var layer_mode=Number(window.localStorage[id+"_layer"+layer+"_mode"]);
			var layer_image=window.localStorage[id+"_layer"+layer+"_image"];
			layer_image_list[layer]=layer_image;
			layer_mode_list[layer]=layer_mode;
		}

		//レイヤー数を拡張
		var add_layer_n=layer_n-LAYER_N;
		for(var i=0;i<add_layer_n;i++){
			g_layer.add_layer();
		}

		//キャンバスサイズを変更
		var size_object=new Object();
		size_object.width=width;
		size_object.height=height;

		g_layer.change_canvas_size(size_object);

		//画像のロード
		var image_list=new Array();
		for(var layer=0;layer<layer_n;layer++){
			g_layer.set_layer_mode(layer,layer_mode_list[layer]);

			image_list[layer]=new Image();

			function load_image_layer(layer,image) {
				return function(){
					var context=can_fixed[layer].getContext("2d");
					context.drawImage(image, 0, 0);
					g_buffer.undo_redo_exec_on_local_tool();
					g_layer.update_thumbnail();
				}
			}

			image_list[layer].onload = load_image_layer(layer,image_list[layer]);
			image_list[layer].src=layer_image_list[layer];
		}

		//完了通知
		g_upload.set_illust_exist();
		alert((ipad_is_english() ? "Complete":"読込が完了しました。取り消しで読込前の状態に戻ることもできます。"));
		ipad_switch_storage_form();
	}

	this.resize=function(){
		var width=Number(document.getElementById("canvas_width").value);
		var height=Number(document.getElementById("canvas_height").value);
		
		if(!width || !height){
			return;
		}

		//現在のキャンバスをクリア
		g_undo_redo.push_all();
		for(var layer=0;layer<LAYER_N;layer++){
			var context=can_fixed[layer].getContext("2d");
			context.clearRect(0,0,can_fixed[layer].width, can_fixed[layer].height);
		}

		//キャンバスサイズを変更
		var size_object=new Object();
		size_object.width=width;
		size_object.height=height;

		g_layer.change_canvas_size(size_object);

		ipad_switch_storage_form();
	}
}
