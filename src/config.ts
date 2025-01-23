import type { SomeCompanionConfigField } from '@companion-module/base'

export interface ModuleConfig {
	ip: string
	enablePolling: boolean
	pollingInterval: number
	verbose: boolean
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'static-text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: 'This module will communicate with a KLVR Charger Pro to show status of the device and batteries.',
		},
		{
			type: 'textinput',
			id: 'ip',
			width: 6,
			label: 'Device IP Address',
			default: '192.168.0.1',
		},
		{
			type: 'static-text',
			id: 'hr1',
			width: 12,
			label: ' ',
			value: '<hr />',
		},
		{
			type: 'checkbox',
			id: 'enablePolling',
			label: 'Enable Polling',
			default: true,
			width: 4,
		},
		{
			type: 'number',
			id: 'pollingInterval',
			label: 'Polling Interval (milliseconds)',
			width: 8,
			default: 1000,
			min: 100,
			max: 10000,
		},
		{
			type: 'static-text',
			id: 'hr3',
			width: 12,
			label: ' ',
			value: '<hr />',
		},
		{
			type: 'checkbox',
			id: 'verbose',
			label: 'Enable Verbose Logging',
			default: false,
			width: 4,
		},
	]
}
