var input = document.getElementById('pics-input');
var uploadBtn =document.getElementById('upload-btn');
var key = document.querySelector('input[type="hidden"]');

uploadBtn.onclick = handleUploadBtnClick;

function handleUploadBtnClick(evt) {
	var fileList = input.files;
	var uploader = new XMLHttpRequest();
	var formData = new FormData();
	formData.append(key.name,key.value);
	for(var i = 0;i<fileList.length;i++) {
		formData.append('pic'+i,fileList[i],fileList[i].name);
	}
	uploader.upload.onprogress = function(evt){
		console.log(evt.loaded/evt.total*100);
	};
	uploader.open("POST","/upload/upload/");
	uploader.send(formData);
}
