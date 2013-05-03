$(document).ready(function(){
	var uploadList = new UploadItemList();
	var fileInput = $('#pics-input');		
	var thumbCon = $('#thumb-container');
	var idGen = new UploadIdGen('upload-pic-');
	var key = $('input[type="hidden"]')[0];
	console.log(key);
	fileInput.on('change',handleFileInputChange);
	$('#upload-btn').on('click',handleUploadBtnClick);	

	function handleFileInputChange(evt) {
		renderPicFiles(evt.target.files);
	}

	function renderPicFiles(fileList) {
		$.each(fileList,function(index,file) {
			var fileItem = new UploadItem(file,idGen.gen());
			uploadList.push(fileItem);
			var thumb = new Thumb(fileItem);
			$(thumb.dom).on('cancelupload',handleCancelUpload);
			thumbCon.append(thumb.dom);
		});
	}

	function handleUploadBtnClick(evt) {
		for(var i = 0; i < uploadList.length; i++) {
			var file = uploadList[i];
			if(file.status == file.WAIT) {
				uploadFile(file);
			}
		}
	}

	function uploadFile(fileItem) {
		var req = new XMLHttpRequest();
		req.upload.onprogress = function(evt) {
			fileItem.status = fileItem.UPLOADING;
			fileItem.thumb.setProgress(evt.position,evt.total);
			fileItem.thumb.setStatus(fileItem.status);
		};
		req.upload.onload = function(evt) {
			fileItem.status = fileItem.DONE;
			fileItem.thumb.setStatus(fileItem.status);
		};
		$(fileItem.thumb.dom).on('cancelupload',function(evt){
			console.log('-abort');
			req.abort();
			console.log('abort-');
		});
		req.open('POST','/upload/upload/');
		var data = new FormData();
		data.append(key.name,key.value);
		data.append(fileItem.id,fileItem.file);
		req.send(data);
	}

	function handleCancelUpload(evt) {
		uploadList.removeItem(evt.fileItem);
		thumbCon[0].removeChild(evt.target);
	}

});

//TODO: a upload file list Object,contains add file, remove file function
function adjust(img,w,h) {
	var originRatio = img.width / img.height;
	if (originRatio >= w / h) {
		img.height = h;
		var width = img.height * originRatio;
		img.style.left = (-(width - w) / 2)+'px';
	} else {
		img.width = w;
		var height = img.width / originRatio;
		img.style.top = (-(height - h) / 2)+'px';
	}
}

// 缩略图view
function Thumb(fileItem) {
	var self = this;
	var thumb = $(this.TEMPLATE_HTML);	
	this.fileItem = fileItem;
	this.fileItem.thumb = this;
	var fileReader = new FileReader();
	fileReader.onloadend = function(evt) {
		var img = $('img',thumb);
		img.on('load',function(evt){
			adjust(this,100,100);
		});
		img.attr('src',evt.target.result);
	};
	fileReader.readAsDataURL(fileItem.file);
	this.dom = thumb[0];
	$('.close-btn',thumb).on('click',function(evt) {
		var event = new $.Event('cancelupload');
		event.fileItem = self.fileItem;
		thumb.trigger(event);
	});
}

Thumb.prototype.TEMPLATE_HTML = '<div class="thumb"><img src=""/><div class="mask"></div><div class="close-btn">x</div></div>';

Thumb.prototype.setProgress = function(position, total) {
	var mask = $('.mask',this.dom);
	var originMaskHeight = $(this.dom).height();
	mask.height(originMaskHeight - originMaskHeight*(position/total));
};

Thumb.prototype.setStatus = function(statusString) {
	var mask = $('.mask',this.dom);
	mask.text(statusString);
};
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

}

UploadItemList.prototype = Array.prototype;

UploadItemList.prototype.constructor = UploadItemList;

UploadItemList.prototype.removeItem = function (uploadItem) {
	var itemIndex = this.indexOf(uploadItem);
	if (itemIndex >= 0) {
		this.splice(itemIndex,1);
	}
	return itemIndex;
}

UploadItemList.prototype.removeItemById = function (uploadItemId) {
	for(var i = 0; i < this.length; i++) {
		var item = this[i];
		if(item.id == uploadItemId) {
			this.splice(i,1);
			return i;
		}
	}
	return -1;
}
