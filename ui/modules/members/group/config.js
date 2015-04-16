"use strict";

var groupsConfig = {
	grid: {
		recordsPerPageArray: [5, 10, 50, 100],
		'columns': [
			{'label': 'Code', 'field': 'code'},
			{'label': 'Name', 'field': 'name'},			
			{'label': 'Description', 'field': 'description'}
		],
		'leftActions': [],
		'topActions': [],
		'defaultSortField': '',
		'defaultLimit': 10
	},

	form: {
		'name': '',
		'label': '',
		'actions': {},
		'entries': [
			{
				'name': 'code',
				'label': 'Code',
				'type': 'text',
				'placeholder': 'Enter the Code of the Group',
				'value': '',
				'tooltip': 'Group codes are alphanumeric. Maximum length 20 characters',
				'required': true
			},
			{
				'name': 'name',
				'label': 'Name',
				'type': 'text',
				'placeholder': 'Enter  Name...',
				'value': '',
				'tooltip': 'Enter the Name of the group',
				'required': true
			},
			{
				'name': 'description',
				'label': 'Description',
				'type': 'textarea',
				'rows': 2,
				'placeholder': 'Enter Last Name...',
				'value': '',
				'tooltip': 'Enter the Description of the Group',
				'required': true
			},
			{
				'name': 'permissions',
				'label': 'Permissions',
				'type': 'checkbox',
				'placeholder': ' members,environments',
				'value': [{v:'members', lb:'members'}, {v:'environments', lb:'environments'},
					{v:'productization', lb:'productization'}, {v:'productization_packages', lb:'productization_packages'}, {v:'multi-tenancy', lb:'multi-tenancy'},
					{v:'multi-tenancy_applications', lb:'multi-tenancy_applications'}, {v:'multi-tenancy_keys', lb:'multi-tenancy_keys'}
				],
				'rows': 2,
				'tooltip': 'Choose the Permissions of the Group.',
				'required': false
			}
		]
	},
	users: {
		'name': '',
		'label': '',
		'msgs':{},
		'actions': {},
		'entries': [
			{
				'name': 'users',
				'label': 'Users',
				'type': 'checkbox',
				'placeholder': 'Add users',
				'value': [],
				'tooltip': 'Check to add user to group',
				'required': true
			}
		]
	}
};