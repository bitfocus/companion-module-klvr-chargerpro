import {
	combineRgb,
	type CompanionButtonPresetDefinition,
	type CompanionTextPresetDefinition,
	type CompanionPresetDefinitions,
} from '@companion-module/base'

import type { KLVRChargerProInstance } from './main.js'

export function UpdatePresets(self: KLVRChargerProInstance): void {
	const presets: (CompanionButtonPresetDefinition | CompanionTextPresetDefinition)[] = []

	for (const key in self.chargerStatus.batteries) {
		const batteryNumber = Number.parseInt(key) + 1

		presets.push({
			category: `Battery ${batteryNumber}`,
			name: `Battery ${batteryNumber} Charge Percent`,
			type: 'button',
			style: {
				text: '$(klvr-chargerpro:battery' + batteryNumber + '_ChargePercent)',
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 255, 0),
			},
			steps: [],
			feedbacks: [],
		})

		presets.push({
			category: `Battery ${batteryNumber}`,
			name: `Battery ${batteryNumber} Slot State`,
			type: 'button',
			style: {
				text: '$(klvr-chargerpro:battery' + batteryNumber + '_SlotState)',
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 255, 0),
			},
			steps: [],
			feedbacks: [],
		})
	}

	presets.push({
		category: 'Totals',
		name: 'Total Batteries Done',
		type: 'button',
		style: {
			text: '$(klvr-chargerpro:totalBatteriesDone)',
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 255, 0),
		},
		steps: [],
		feedbacks: [],
	})

	presets.push({
		category: 'Totals',
		name: 'Total Batteries Charging',
		type: 'button',
		style: {
			text: '$(klvr-chargerpro:totalBatteriesCharging)',
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 255, 0),
		},
		steps: [],
		feedbacks: [],
	})

	presets.push({
		category: 'Totals',
		name: 'Total Batteries Not Charging',
		type: 'button',
		style: {
			text: '$(klvr-chargerpro:totalBatteriesNotCharging)',
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 255, 0),
		},
		steps: [],
		feedbacks: [],
	})

	presets.push({
		category: 'Totals',
		name: 'Total Batteries Empty',
		type: 'button',
		style: {
			text: '$(klvr-chargerpro:totalBatteriesEmpty)',
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 255, 0),
		},
		steps: [],
		feedbacks: [],
	})

	presets.push({
		category: 'Totals',
		name: 'Total Batteries Error',
		type: 'button',
		style: {
			text: '$(klvr-chargerpro:totalBatteriesError)',
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 255, 0),
		},
		steps: [],
		feedbacks: [],
	})

	self.setPresetDefinitions(presets as unknown as CompanionPresetDefinitions)
}
