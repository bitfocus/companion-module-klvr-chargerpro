import type { KLVRChargerProInstance } from './main.js'
import { InstanceStatus } from '@companion-module/base'

import { UpdateFeedbacks } from './feedbacks.js'
import { UpdateVariableDefinitions, CheckVariables } from './variables.js'
import { UpdatePresets } from './presets.js'
import { KLVRCharger } from '@bitfocusas/klvr-charger'

export async function InitConnection(self: KLVRChargerProInstance): Promise<void> {
	self.apiInstance = null
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
		self.pollOk = null

		void getData(self)

		if (self.config.enablePolling) {
			self.log('debug', `Setting up polling with interval ${self.config.pollingInterval}ms`)
			self.apiPollIntervalInstance = setInterval(() => void getData(self), self.config.pollingInterval)
		}

		self.log('debug', 'API connection initialized successfully')
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		self.log('error', `Failed to initialize API connection: ${errorMessage}`)
		throw error
	}
}

async function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
	let timer: NodeJS.Timeout | undefined
	try {
		return await Promise.race([
			promise,
			new Promise<never>((_, reject) => {
				timer = setTimeout(() => reject(new Error(`${label} timeout`)), 5000)
			}),
		])
	} finally {
		clearTimeout(timer)
	}
}

async function getData(self: KLVRChargerProInstance): Promise<void> {
	if (self.apiCurrentlyWorking) {
		return
	}
	// A config change or destroy swaps apiInstance; results from the old one must not touch the instance
	const api = self.apiInstance
	if (!api) return
	// The client has no timeout or abort, so a request we stop waiting on keeps its socket open
	let pendingRequest: Promise<unknown> = Promise.resolve()
	try {
		self.apiCurrentlyWorking = true

		if (self.config.verbose) {
			self.log('debug', 'Getting Device Info')
		}

		// The client swallows request errors and returns null, keeping the message in getLastError()
		const deviceInfoRequest = api.deviceInfo()
		pendingRequest = deviceInfoRequest
		const deviceInfoResult = await withTimeout(deviceInfoRequest, 'Device info')
		if (!deviceInfoResult) {
			throw new Error(api.getLastError() ?? 'Device info request failed')
		}
		if (self.apiInstance !== api) return

		self.deviceInfo = deviceInfoResult

		if (self.config.verbose) {
			self.log('debug', `Device Info: ${JSON.stringify(self.deviceInfo)}`)
		}

		if (self.config.verbose) {
			self.log('debug', 'Getting Charger Status')
		}

		const chargerStatusRequest = api.chargerStatus()
		pendingRequest = chargerStatusRequest
		const chargerStatusResult = await withTimeout(chargerStatusRequest, 'Charger status')
		if (!chargerStatusResult) {
			throw new Error(api.getLastError() ?? 'Charger status request failed')
		}
		if (self.apiInstance !== api) return

		self.chargerStatus = chargerStatusResult

		if (self.config.verbose) {
			self.log('debug', `Charger Status: ${JSON.stringify(self.chargerStatus)}`)
		}

		const slotChoices = buildSlotChoices(self)
		const slotIds = (choices: { id: string }[]) => choices.map((choice) => choice.id).join(',')
		if (slotIds(slotChoices) !== slotIds(self.CHOICES_SLOTS)) {
			if (self.config.verbose) {
				self.log('debug', 'Building Slot Choices')
			}

			self.CHOICES_SLOTS = slotChoices
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

		if (self.pollOk !== true) {
			if (self.pollOk === false) {
				self.log('info', 'Connection restored')
			}
			self.pollOk = true
			self.updateStatus(InstanceStatus.Ok)
		}
	} catch (error) {
		if (self.apiInstance !== api) return
		if (self.pollOk !== false) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			self.log('error', `Error getting data: ${errorMessage}`)
			self.pollOk = false
			self.updateStatus(InstanceStatus.ConnectionFailure)
		}
	} finally {
		// Hold the busy flag until a timed-out request settles, so polls don't stack up while the device is unreachable
		await pendingRequest.catch(() => undefined)
		if (self.apiInstance === api) {
			self.apiCurrentlyWorking = false
		}
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
