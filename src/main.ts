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
	config!: ModuleConfig // Setup in init()
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
		batteries: {},
	}

	CHOICES_SLOTS: { id: string; label: string }[] = []

	constructor(internal: unknown) {
		super(internal)
		this.CHOICES_SLOTS = []
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config
		this.updateStatus(InstanceStatus.Ok)
		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
		this.updatePresets() // export presets

		await this.initConnection()
	}
	// When module gets deleted
	async destroy(): Promise<void> {
		clearInterval(this.apiPollIntervalInstance)
		this.log('debug', 'destroy')
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config

		await this.initConnection()
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
		await InitConnection(this)
	}
}

runEntrypoint(KLVRChargerProInstance, UpgradeScripts)
