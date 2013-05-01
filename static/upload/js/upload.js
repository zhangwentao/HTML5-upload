$(document).ready(function(){
	var fileInput = $('#pics-input');		
	var thumbCon = $('#thumb-container');
	fileInput.on('change',handleFileInputChange);

	function adjust(img,w,h) {
		var originRatio = img.width / img.height;
		if (originRatio >= w / h) {
			img.height = h;
			img.style.left = (-(img.width - w) / 2)+'px';
		} else {
			img.width = w;
			img.style.top = (-(img.height - h) / 2)+'px';
		}
	}

	function handleFileInputChange(evt) {
		renderPicFiles(evt.target.files);
	}

	function renderPicFiles(fileList) {
		$.each(fileList,function(index,file) {
			console.log(file);
			var fileReader = new FileReader();
			fileReader.onload = function(evt) {
				var thumb = $('<div class="thumb"></div>');				
				var img = $('<img/>');
				thumb.append(img);
				thumbCon.append(thumb);
				img.on('load',function(evt){
					adjust(this,100,100);
				});
				img.attr('src',evt.target.result);
			};
			fileReader.readAsDataURL(file);
		});
	}
	
});

//TODO: a upload file list Object,contains add file, remove file function

// 上传项
function UploadItem(file,id) {
	this.file = file;
	this.id = id;
	this.status = this.WAIT;
}

UploadItem.prototype = {
	constructor: UploadItem,
	WAIT: 0,
	UPLOADING: 1,
	DONE: 2,
	FAILED: 3,
}

// 上传项 id 生成器
function UploadIdGen(prefix) {
	this.prefix = prefix;	
	this.lastGenIdNum = 0;
}

UploadIdGen.prototype.gen = function() {
	return this.prefix + this.lastGenIdNum++;
};

// 上传列表
function UploadItemList() {
	this._itemArr = [];
}

UploadItemList.prototype.addItem = function (uploadItem) {
	this._itmeArr.push(uploadItem);			
	return this._itemArr.length -1;
}

UploadItemList.prototype.removeItem = function (uploadItem) {
	var itemIndex = this._itmeArr.indexOf(uploadItem);
	if (itemIndex >= 0) {
		this._itemArr.splice(itemIndex,1);
	}
	return itemIndex;
}

UploadItemList.prototype.removeItemById = function (uploadItemId) {
	for(var i = 0; i < this._itemArr.length; i++) {
		var item = this._itemArr[i];
		if(item.id == uploadItemId) {
			this._itemArr.splice(i,1);
			return i;
		}
	}
	return -1;
}

UploadItemList.prototype.shift = function () {
	return this._itmeArr.shift();	
}

UploadItemList.prototype.length = function () {
	return this._itemArr.length;
}
