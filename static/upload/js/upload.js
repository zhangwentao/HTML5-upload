$(document).ready(function(){
	var fileInput = $('#pics-input');		
	var thumbCon = $('#thumb-container');
	var uploadList = new UploadItemList();
	var idGen = new UploadIdGen('upload-pic-');
	var key = $('input[type="hidden"]')[0];
	console.log(key);
	fileInput.on('change',handleFileInputChange);
	$('#upload-btn').on('click',handleUploadBtnClick);	
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
			var fileItem = new UploadItem(file,idGen.gen());
			uploadList.push(fileItem);
			var fileReader = new FileReader();
			fileReader.onload = function(evt) {
				var thumb = $('<div class="thumb"><div class="close-btn" upload-id="'+fileItem.id+'">x</div><progress></progress></div>');				
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

	function handleUploadBtnClick(evt) {
		for(var i = 0; i < uploadList.length; i++) {
			uploadFile(uploadList[i]);
		}
	}

	function uploadFile(fileItem) {
		var req = new XMLHttpRequest();
		req.upload.onprogress = function(evt) {
			var progressbar = $('[upload-id="'+fileItem.id+'"]').siblings('progress')[0];
			console.log(progressbar);
			progressbar.max = evt.total;
			progressbar.value = evt.position;
		}
		req.open('POST','/upload/upload/');
		var data = new FormData();
		data.append(key.name,key.value);
		data.append(fileItem.id,fileItem.file);
		req.send(data);
	}

	$('.close-btn').live('click',function(evt){
		var closeBtn = $(evt.target);
		var uploadId = closeBtn.attr('upload-id');
		console.log(uploadId);
		uploadList.removeItemById(uploadId);
		closeBtn.parent().parent().get(0).removeChild(closeBtn.parent().get(0));
	});
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
