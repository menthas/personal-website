from django.shortcuts import render


def index(request):
    return render(request, 'index.html', {})


def about(request):
    return render(request, 'about.html', {})


def contact(request):
    return render(request, 'contact.html', {})


def projects(request):
    return render(request, 'projects.html', {})


def skills(request):
    return render(request, 'skills.html', {})
