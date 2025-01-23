import { combineRgb } from '@companion-module/base'
import type { KLVRChargerProInstance } from './main.js'

export function UpdateFeedbacks(self: KLVRChargerProInstance): void {
	self.setFeedbackDefinitions({
		deviceStatus: {
			name: 'Device Status',
			description: 'Change colors based on device status',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					id: 'state',
					type: 'dropdown',
					label: 'State',
					default: 'ok',
					choices: [
						{ id: 'ok', label: 'OK' },
						{ id: 'warning', label: 'Warning' },
						{ id: 'error', label: 'Error' },
					],
				},
			],
			callback: (feedback) => {
				let state = feedback.options.state

				if (self.chargerStatus.deviceStatus == state) {
					return true
				}

				return false
			},
		},

		slotStatus: {
			name: 'Slot State',
			description: 'Change colors based on battery slot state',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					id: 'slot',
					type: 'dropdown',
					label: 'Slot',
					default: '0',
					choices: self.CHOICES_SLOTS,
				},
				{
					id: 'state',
					type: 'dropdown',
					label: 'State',
					default: 'done',
					choices: [
						{ id: 'done', label: 'Done' },
						{ id: 'charging', label: 'Charging' },
						{ id: 'not charging', label: 'Not Charging' },
						{ id: 'empty', label: 'Empty' },
						{ id: 'error', label: 'Error' },
					],
				},
			],
			callback: (feedback) => {
				let slot: string = String(feedback.options.slot)
				let state = feedback.options.state

				try {
					if (self.chargerStatus.batteries && self.chargerStatus.batteries[slot].slotState == state) {
						return true
					}
				} catch (e) {
					self.log('warn', `Slot ${slot} not found`)
				}

				return false
			},
		},
	})
}
