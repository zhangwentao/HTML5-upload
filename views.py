# Create your views here.
from django.shortcuts import render_to_response
from django.http import HttpResponse
from django.template import RequestContext

def home_page(request):
	context_instance = RequestContext(request)
	return render_to_response("upload/upload.html",{},context_instance)

def upload(request):
	pic_name_list = request.FILES.keys()

	for img_name in pic_name_list:
		handle_uploaded_file(request.FILES[img_name])
	return HttpResponse('ok') 

def handle_uploaded_file(f):
	destination = open('/home/wentao/Lab/django/django_test/file/'+f.name, 'wb+')
	for chunk in f.chunks():
		destination.write(chunk)
	destination.close()
