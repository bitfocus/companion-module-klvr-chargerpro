import { InstanceBase, runEntrypoint, InstanceStatus, type SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpdatePresets } from './presets.js'
import { InitConnection } from './api.js'
import type { KLVRCharger } from '@bitfocusas/klvr-charger'

export class KLVRChargerProInstance extends InstanceBase<ModuleConfig> {
	config: ModuleConfig = {
		ip: '192.168.0.1',
		enablePolling: true,
		pollingInterval: 1000,
		verbose: false,
	}
	apiPollIntervalInstance!: NodeJS.Timeout
	apiInstance!: ReturnType<typeof KLVRCharger>
	apiCurrentlyWorking = false

	deviceInfo: DeviceInfo = {
		deviceInternalTemperatureC: 0,
		name: '',
		firmwareVersion: '',
		firmwareBuild: '',
	}

	chargerStatus: ChargerStatus = {
		deviceStatus: 'ok',
		batteries: [],
	}

	CHOICES_SLOTS: { id: string; label: string }[] = []

	constructor(internal: unknown) {
		super(internal)
		this.CHOICES_SLOTS = []
	}

	async init(config: ModuleConfig): Promise<void> {
		try {
			this.log('debug', 'Starting module initialization')

			// Ensure config has all required properties with defaults
			this.config = {
				ip: config?.ip || '192.168.0.1',
				enablePolling: config?.enablePolling !== undefined ? config.enablePolling : true,
				pollingInterval: config?.pollingInterval || 1000,
				verbose: config?.verbose !== undefined ? config.verbose : false,
			}

			this.log('debug', `Initializing with config: ${JSON.stringify(this.config)}`)

			// Set status before attempting connection
			this.updateStatus(InstanceStatus.Connecting)

			// Update all definitions first
			this.updateActions()
			this.updateFeedbacks()
			this.updateVariableDefinitions()
			this.updatePresets()

			// Initialize connection
			await this.initConnection()

			this.log('debug', 'Module initialization completed')
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			this.log('error', `Failed to initialize module: ${errorMessage}`)
			this.updateStatus(InstanceStatus.ConnectionFailure)
			throw error
		}
	}

	// When module gets deleted
	async destroy(): Promise<void> {
		this.log('debug', 'Destroying module')
		if (this.apiPollIntervalInstance) {
			clearInterval(this.apiPollIntervalInstance)
		}
		this.log('debug', 'destroy')
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		try {
			this.log('debug', 'Config update requested')

			// Set status to connecting immediately when config changes
			this.updateStatus(InstanceStatus.Connecting)

			// Ensure config has all required properties with defaults
			this.config = {
				ip: config?.ip || '192.168.0.1',
				enablePolling: config?.enablePolling !== undefined ? config.enablePolling : true,
				pollingInterval: config?.pollingInterval || 1000,
				verbose: config?.verbose !== undefined ? config.verbose : false,
			}

			this.log('debug', `Config updated: ${JSON.stringify(this.config)}`)

			// Clear existing interval if polling was enabled
			if (this.apiPollIntervalInstance) {
				clearInterval(this.apiPollIntervalInstance)
			}

			await this.initConnection()
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			this.log('error', `Failed to update config: ${errorMessage}`)
			this.updateStatus(InstanceStatus.ConnectionFailure)
		}
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}

	updatePresets(): void {
		UpdatePresets(this)
	}

	async initConnection(): Promise<void> {
		try {
			this.log('debug', 'Initializing connection')
			await InitConnection(this)
			this.log('debug', 'Connection initialized successfully')
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			this.log('error', `Failed to initialize connection: ${errorMessage}`)
			this.updateStatus(InstanceStatus.ConnectionFailure)
			throw error
		}
	}
}

runEntrypoint(KLVRChargerProInstance, UpgradeScripts)
