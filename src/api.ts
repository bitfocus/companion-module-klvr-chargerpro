import type { KLVRChargerProInstance } from './main.js'
import { InstanceStatus } from '@companion-module/base'

import { UpdateFeedbacks } from './feedbacks.js'
import { UpdateVariableDefinitions, CheckVariables } from './variables.js'
import { UpdatePresets } from './presets.js'
import { KLVRCharger } from '@bitfocusas/klvr-charger'

export async function InitConnection(self: KLVRChargerProInstance): Promise<void> {
	try {
		// Validate config before proceeding
		if (!self.config) {
			throw new Error('Configuration is not available')
		}

		if (!self.config.ip) {
			throw new Error('IP address is not configured')
		}

		self.log('debug', `Initializing API connection to ${self.config.ip}`)

		self.apiInstance = KLVRCharger(self.config.ip)
		self.apiCurrentlyWorking = false

		// Add timeout for initial data fetch
		try {
			await Promise.race([
				getData(self),
				new Promise((_, reject) => setTimeout(() => reject(new Error('Initial data fetch timeout')), 10000)),
			])
			self.log('debug', 'Initial data fetch completed successfully')
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			self.log('warn', `Initial data fetch failed: ${errorMessage}. Module will continue with default values.`)
			// Don't throw here - let the module continue with default values
		}

		if (self.config.enablePolling) {
			self.log('debug', `Setting up polling with interval ${self.config.pollingInterval}ms`)
			self.apiPollIntervalInstance = setInterval(() => {
				getData(self).catch((error) => {
					const errorMessage = error instanceof Error ? error.message : String(error)
					self.log('error', `Error getting data: ${errorMessage}`)
				})
			}, self.config.pollingInterval)
		}

		self.log('debug', 'API connection initialized successfully')
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		self.log('error', `Failed to initialize API connection: ${errorMessage}`)
		throw error
	}
}

async function getData(self: KLVRChargerProInstance): Promise<void> {
	if (self.apiCurrentlyWorking) {
		return
	}
	try {
		self.apiCurrentlyWorking = true

		if (self.config.verbose) {
			self.log('debug', 'Getting Device Info')
		}

		// Add timeout for deviceInfo call
		const deviceInfoResult = await Promise.race([
			self.apiInstance.deviceInfo(),
			new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Device info timeout')), 5000)),
		])

		if (deviceInfoResult) {
			self.deviceInfo = deviceInfoResult
		}

		if (self.config.verbose) {
			self.log('debug', `Device Info: ${JSON.stringify(self.deviceInfo)}`)
		}

		if (self.config.verbose) {
			self.log('debug', 'Getting Charger Status')
		}

		// Add timeout for chargerStatus call
		const chargerStatusResult = await Promise.race([
			self.apiInstance.chargerStatus(),
			new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Charger status timeout')), 5000)),
		])

		if (chargerStatusResult) {
			self.chargerStatus = chargerStatusResult
		}

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

		// Update status to OK when we successfully get data
		self.updateStatus(InstanceStatus.Ok)
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		self.log('error', `Error getting data: ${errorMessage}`)
		// Update status to indicate connection failure
		self.updateStatus(InstanceStatus.ConnectionFailure)
		throw error // Re-throw to let caller handle it
	} finally {
		self.apiCurrentlyWorking = false
	}
}

export function buildSlotChoices(self: KLVRChargerProInstance): { id: string; label: string }[] {
	const choices = []

	if (!self.chargerStatus.batteries || self.chargerStatus.batteries.length === 0) {
		choices.push({ id: '0', label: 'Battery Slot #1' })
	}

	for (const battery of self.chargerStatus.batteries) {
		const batteryNumber = battery.index + 1
		choices.push({ id: `${battery.index}`, label: `Battery Slot #${batteryNumber}` })
	}

	return choices
}
