import type { KLVRChargerProInstance } from './main.js'

import { UpdateFeedbacks } from './feedbacks.js'
import { UpdateVariableDefinitions, CheckVariables } from './variables.js'
import { UpdatePresets } from './presets.js'

import { KLVRCharger } from '@bitfocusas/klvr-charger'

export async function InitConnection(self: KLVRChargerProInstance): Promise<void> {
	self.CHARGER = KLVRCharger(self.config.ip)

	await getData(self) // Get initial data once

	if (self.config.enablePolling) {
		self.INTERVAL = setInterval(() => {
			getData(self).catch((error) => {
				self.log('error', `Error getting data: ${error.message}`)
			})
		}, self.config.pollingInterval)
	}
}

async function getData(self: KLVRChargerProInstance): Promise<void> {
	if (self.config.verbose) {
		self.log('debug', 'Getting Device Info')
	}

	self.deviceInfo = await self.CHARGER.deviceInfo()

	if (self.config.verbose) {
		self.log('debug', `Device Info: ${JSON.stringify(self.deviceInfo)}`)
	}

	if (self.config.verbose) {
		self.log('debug', 'Getting Charger Status')
	}

	self.chargerStatus = await self.CHARGER.chargerStatus()

	if (self.config.verbose) {
		self.log('debug', `Charger Status: ${JSON.stringify(self.chargerStatus)}`)
	}

	if (self.CHOICES_SLOTS.length === 0) {
		if (self.config.verbose) {
			self.log('debug', 'Building Slot Choices')
		}

		self.CHOICES_SLOTS = buildSlotChoices(self)
		UpdateFeedbacks(self)

		if (self.config.verbose) {
			self.log('debug', `Slot Choices: ${JSON.stringify(self.CHOICES_SLOTS)}`)
		}

		if (self.config.verbose) {
			self.log('debug', 'Updating Variables to include Battery Slots')
		}

		UpdateVariableDefinitions(self)

		if (self.config.verbose) {
			self.log('debug', 'Updating Presets to include Battery Slots')
		}

		UpdatePresets(self)
	}

	self.checkFeedbacks()
	CheckVariables(self)
}

export function buildSlotChoices(self: KLVRChargerProInstance): { id: string; label: string }[] {
	const choices = []

	if (!self.chargerStatus.batteries) {
		choices.push({ id: '0', label: 'Battery Slot #1' })
	}

	for (const key in self.chargerStatus.batteries) {
		const batteryNumber = parseInt(key) + 1
		choices.push({ id: `${key}`, label: `Battery Slot #${batteryNumber}` })
	}

	return choices
}
