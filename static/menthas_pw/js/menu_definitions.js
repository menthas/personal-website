/**
 * This file hosts the definitions of the menu items. it's best if this file
 * was generated on the server side since many url's are now duplicated across
 * HTML files.
 * @todo move to django
 */

var menu_definition = [
    {
        id: 'projects',
        name: 'Projects',
        randomColor: true,
        showModal: 'projectsModal',
        children: [
            // {
            //     id: 'project1',
            //     name: 'Project 1',
            //     inheritColor: true,
            // },
            // {
            //     id: 'project2',
            //     name: 'Project 2',
            //     inheritColor: true,
            // },
            // {
            //     id: 'project3',
            //     name: 'Project 3',
            //     inheritColor: true,
            // }
        ]
    },
    { // About me - about the website
        id: 'about',
        name: 'About',
        showModal: 'aboutModal',
        randomColor: true,
    },
    { // link to zinnia
        id: 'blog',
        name: 'Blog',
        link: '/weblog',
        randomColor: true,
    },
    { // link to pdf
        id: 'resume',
        name: 'Résumé',
        link: '/static/menthas_pw/assets/resume_latest.pdf',
        randomColor: true,
    },
    { // simgple form
        id: 'contact',
        name: 'Contact\nMe',
        showModal: 'contactModal',
        randomColor: true,
    },
    { // dials
        id: 'skills',
        name: 'Skills',
        randomColor: true,
    },
    {
        id: 'linkedin',
        name: 'LinkedIn',
        icon: 'icon_linkedin',
        iconRatio: 0.65,
        link: 'https://www.linkedin.com/in/afghahi/',
        // color: '#007bb6',
        randomColor: true,
    },
    {
        id: 'facebook',
        name: 'Facebook',
        icon: 'icon_facebook',
        iconRatio: 0.65,
        link: 'https://www.facebook.com/behrooz.af',
        // color: '#3b5998',
        randomColor: true,
    },
    {
        id: 'github',
        name: 'Github',
        icon: 'icon_github',
        link: 'https://github.com/menthas/',
        // color: '#ddd',
        randomColor: true,
    },
]
