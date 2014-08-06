function floodfill_hexToR(h) {
		return parseInt((floodfill_cutHex(h)).substring(0,2),16)
}
function floodfill_hexToG(h) {
		return parseInt((floodfill_cutHex(h)).substring(2,4),16)
}
function floodfill_hexToB(h) {
		return parseInt((floodfill_cutHex(h)).substring(4,6),16)
}
function floodfill_cutHex(h) {
		return (h.charAt(0)=="#") ? h.substring(1,7):h
}

function floodfill_colorPixel(imageData,pixelPos,color,alpha){
	imageData.data[pixelPos] = floodfill_hexToR(color);
	imageData.data[pixelPos+1] = floodfill_hexToG(color);
	imageData.data[pixelPos+2] = floodfill_hexToB(color);
	imageData.data[pixelPos+3] = alpha;
}

function floodFill(x,y,context,color,alpha){
	var width = context.canvas.width;
	var height = context.canvas.height;
	var pixelPos = (y*width + x) * 4;
	var imageData =  context.getImageData(0, 0, width, height);
	var startR = imageData.data[pixelPos];
	var startG = imageData.data[pixelPos+1];
	var startB = imageData.data[pixelPos+2];
	var startA = imageData.data[pixelPos+3];

	if(startA==alpha && floodfill_hexToR(color)==startR && floodfill_hexToG(color)==startG && floodfill_hexToB(color)==startB){
		return;
	}

	var stack=[[x,y]];

	while(stack.length){
		var x=stack[stack.length-1][0];
		var y=stack[stack.length-1][1];
		stack.pop();

		var pixelPos = (y*width + x) * 4;
		var R = imageData.data[pixelPos];
		var G = imageData.data[pixelPos+1];
		var B = imageData.data[pixelPos+2];
		var A = imageData.data[pixelPos+3];

		if(R==startR && G==startG && B==startB && A==startA){
			floodfill_colorPixel(imageData,pixelPos,color,alpha);
		}else{
			continue;
		}
		if(x>=1){
				stack.push([x-1,y]);
		}
		if(x<width-1){
				stack.push([x+1,y]);
		}
		if(y>=1){
				stack.push([x,y-1]);
		}
		if(y<height-1){
				stack.push([x,y+1]);
		}
	}

	context.putImageData(imageData, 0, 0);
}
