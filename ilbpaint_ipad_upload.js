//-------------------------------------------------
//イラブペイント　画像送信
//copyright 2010-2012 ABARS all rights reserved.
//-------------------------------------------------

function Upload(){
	this._boundary = "-----boundary_illustbook_ipad";
	this._data;
	
	this._bbs_key;
	this._thread_key;
	this._reply;
	
	this._append=function(tag,data){
		//this._data+=""+tag+"="+data+"&";
		this._data += "--"+this._boundary+"\r\n"+"Content-Disposition: form-data; name=\""+tag+"\"\r\n\r\n"+ data+"\r\n";
	}
	
	this._header_split=function(data){
		//'data:image/png;base64,iVBORw0K...'の「,」以降のデータを取得してそれをデコードする
		return data.split(",")[1];
	}
	
	this.upload=function(bbs_key,thread_key,entry_key,reply,text_only,overwrite){
		if(bbs_key==""){
			bbs_key=document.getElementById("bbs_list").value;
		}
	
		this._bbs_key=bbs_key;
		this._thread_key=thread_key;
		this._reply=reply;

		var title="";
		if(reply!="1"){
			title=document.getElementById("title").value;
		}

		var category=document.getElementById("category").value;
		if(category=="add"){
			category=document.getElementById("category_new").value;
		}

		var author=document.getElementById("name").value;
		var comment=document.getElementById("comment").value;
		var delete_key=document.getElementById("delete_key").value;
		
		if(title==""){
			title="notitle";
		}
		if(author==""){
			alert("投稿者名は必須です。");
			return;
		}

		var expires = "Thu, 1-Jan-2030 00:00:00 GMT";
		document.cookie="name="+escape(author)+"; expires="+expires;

		this.show_uploading();

		this._create_thumbnail();
	
		title=(title)
		author=(author)
		comment=(comment)
		delete_key=(delete_key)
	
		var MODE_ILLUST=1;
		var MODE_TEXT=3;
		var illust_mode=MODE_ILLUST;
		if(text_only){
			illust_mode=MODE_TEXT;
		}

		this._data="";
		this._append("bbs_key",bbs_key);
		
		if(reply=="1"){
			this._append("thread_key",thread_key);
			if(overwrite){
				this._append("entry_key",entry_key);
			}
			this._append("reply","1");
		}else{
			if(overwrite){
				this._append("thread_key",thread_key);
			}
		}

		this._append("thread_title",title);
		this._append("homepage_addr","");
		this._append("author",author);
		this._append("comment",comment);
		this._append("delete_key",delete_key);
		this._append("illust_mode",""+illust_mode);
		this._append("mode","illust_all");
		this._append("category",category);
		this._append("base64","1");

		link_to_profile=document.getElementById("link_to_profile")
		if(link_to_profile && link_to_profile.checked){
			this._append("link_to_profile","on");
		}
		if(g_imported){
			this._append("draw_time","-1");	//upload flag
		}

		var thumbnail_can=document.getElementById("canvas_thumbnail");
		var thumbnail_code=thumbnail_can.toDataURL("image/jpeg",0.95);
		if(!thumbnail_code){
			alert("toDataURL APIの呼び出しに失敗しました。");
			return;
		}
		var thumbnail = this._header_split(thumbnail_code);

		var image_can=document.getElementById("canvas_rendering");
		var image_code=image_can.toDataURL("image/jpeg");
		var image = this._header_split(image_code);

		if(!thumbnail){
			alert("サムネイルの取得に失敗しました。Android2.3の場合はFirefoxをご利用下さい。");
			return;
		}
		if(!image){
			alert("画像の取得に失敗しました。Android2.3の場合はFirefoxをご利用下さい。");
			return;
		}

		this._append("thumbnail",thumbnail);
		this._append("image",image);

		this._data += "--"+this._boundary+"--\r\n";
		
		var cmd="upl_all";
		if(reply=="1"){
			cmd="add_entry";
		}
	
		this.requestFile(this._data,"POST",cmd,false,ipad_upload_callback);
	}
	
	this.requestFile=function ( data , method , fileName , async ,callback_function){
		var httpoj = new XMLHttpRequest()
		httpoj.open( method , fileName , async )
		httpoj.onreadystatechange = function()
		{ 
			if (httpoj.readyState==4)
			{ 
				callback_function(httpoj)
			}
		}
		httpoj.setRequestHeader("content-type","multipart/form-data; boundary="+this._boundary);
		httpoj.send( data )
	}
	
	this.go_bbs=function(oj){
		NoNeedUnloadCheck();
		
		var url_text="bbs_index?bbs_key="+this._bbs_key
		if(this._reply=="1"){
			url_text="usr/"+this._bbs_key+"/"+this._thread_key+".html";
		}
		this.show_upload_finish();
		if(!(g_chat.is_chat_mode())){
			window.location.href=url_text;
		}
	}

	this._avg=function(src,fx,fy,mx,my,rgb,image_can){
		var ix=Math.floor(fx);
		var iy=Math.floor(fy);
		fx-=ix;
		fy-=iy;
		
		var sum=0;
		var cnt=0;
		for(var y=0;y<my;y++){
			for(var x=0;x<mx;x++){
				sum+=src.data[(iy+y)*image_can.width*4+(ix+x)*4+rgb];
				cnt++;
			}
		}
		
		return sum/cnt;
	}
	
	this._rendering=function(){
		g_rendering.rendering();
	}

	//平均画素法で高品質のサムネイルを作成
	this._create_thumbnail=function(){
		var thumbnail_can=document.getElementById("canvas_thumbnail");
		var image_data=thumbnail_can.getContext("2d").createImageData(thumbnail_can.width,thumbnail_can.height);

		for(var i=0;i<image_data.data.length;i++){
			image_data.data[i]=255;
		}
		
		this._rendering();
		var image_can=document.getElementById("canvas_rendering");
		var src=image_can.getContext("2d").getImageData(0,0,image_can.width,image_can.height);

		var mx=image_can.width/thumbnail_can.width;
		var my=image_can.height/thumbnail_can.height;
		
		if(mx<my){
			mx=my;
		}else{
			my=mx;
		}
		
		ox=Math.floor((100-image_can.width/mx)/2);
		oy=Math.floor((100-image_can.height/my)/2)
		
		for(var y=0;y<image_can.height/my;y++){
			for(var x=0;x<image_can.width/mx;x++){
				var fx=x*mx;
				var fy=y*my;
				for(var rgb=0;rgb<4;rgb++){
					image_data.data[(y+oy)*thumbnail_can.width*4+(x+ox)*4+rgb]=this._avg(src,fx,fy,mx,my,rgb,image_can);
				}
			}
		}
		
		thumbnail_can.getContext("2d").putImageData(image_data,0,0);
	}
	
	this._is_upload_mode=false;
	this._is_illust_exist=false;

	this.switch_upload_form=function(){
		this._is_upload_mode=!this._is_upload_mode;
		this._change_upload_button();

		/*
		var tool_height=document.getElementById("bottom_tool").clientHeight;
		document.getElementById("upload_form").style.bottom=tool_height+"px";
		document.getElementById("upload_finish").style.bottom=tool_height+"px";
		document.getElementById("uploading").style.bottom=tool_height+"px";
		*/
		
		g_tool_box.update();
	}

	this.show_uploading=function(){
		document.getElementById("uploading").style.display="block"
		document.getElementById("upload_form").style.display="none"
		document.getElementById("upload_finish").style.display="none"
	}

	this.show_upload_finish=function(){
		document.getElementById("uploading").style.display="none"
		document.getElementById("upload_form").style.display="none"
		document.getElementById("upload_finish").style.display="block"
	}
	
	this.upload_cansel=function(){
		this._is_upload_mode=false;
		document.getElementById("uploading").style.display="none"
		document.getElementById("upload_form").style.display="noone"
		document.getElementById("upload_finish").style.display="none"
		g_tool_box.update();
	}

	this.is_upload_mode=function(){
		return this._is_upload_mode;
	}

	this.set_illust_exist=function(){
		this._is_illust_exist=true;
		this._change_upload_button();
	}

	this._change_upload_button=function(){
		if(document.getElementById("submit_illust") && document.getElementById("submit_text")){
			document.getElementById("submit_illust").style.display="none";
			document.getElementById("submit_text").style.display="none";
			if(this._is_illust_exist || g_chat.is_chat_mode()){
				document.getElementById("submit_illust").style.display="block";
			}else{
				document.getElementById("submit_text").style.display="block";
			}
		}
	}
}
