import type { CompanionVariableDefinition, CompanionVariableValues } from '@companion-module/base'

import type { KLVRChargerProInstance } from './main.js'

export function UpdateVariableDefinitions(self: KLVRChargerProInstance): void {
	const variables: CompanionVariableDefinition[] = []

	variables.push({ variableId: 'deviceInternalTemperature', name: 'Device Internal Temperature' })
	variables.push({ variableId: 'name', name: 'Device Name' })
	variables.push({ variableId: 'firmwareVersion', name: 'Firmware Version' })
	variables.push({ variableId: 'firmwareBuild', name: 'Firmware Build' })

	for (const key in self.chargerStatus.batteries) {
		const batteryNumber = Number.parseInt(key) + 1

		variables.push(
			{ variableId: `battery${batteryNumber}_BayTemperature`, name: `Battery ${batteryNumber} Bay Temperature` },
			{ variableId: `battery${batteryNumber}_SlotState`, name: `Battery ${batteryNumber} Slot State` },
			{ variableId: `battery${batteryNumber}_ChargePercent`, name: `Battery ${batteryNumber} Charge Percent` },
			{
				variableId: `battery${batteryNumber}_TimeRemaining`,
				name: `Battery ${batteryNumber} Time Remaining (Seconds)`,
			},
			{ variableId: `battery${batteryNumber}_ErrorMsg`, name: `Battery ${batteryNumber} Error Message` },
		)
	}

	variables.push({ variableId: 'totalBatteriesDone', name: 'Total Batteries Done' })
	variables.push({ variableId: 'totalBatteriesCharging', name: 'Total Batteries Charging' })
	variables.push({ variableId: 'totalBatteriesNotCharging', name: 'Total Batteries Not Charging' })
	variables.push({ variableId: 'totalBatteriesEmpty', name: 'Total Batteries Empty' })
	variables.push({ variableId: 'totalBatteriesError', name: 'Total Batteries with Error' })

	self.setVariableDefinitions(variables)
}

export function CheckVariables(self: KLVRChargerProInstance): void {
	const variableValues: CompanionVariableValues = {}

	variableValues.deviceInternalTemperature = self.deviceInfo.deviceInternalTemperatureC
	variableValues.name = self.deviceInfo.name
	variableValues.firmwareVersion = self.deviceInfo.firmwareVersion
	variableValues.firmwareBuild = self.deviceInfo.firmwareBuild

	let totalBatteriesDone = 0
	let totalBatteriesCharging = 0
	let totalBatteriesNotCharging = 0
	let totalBatteriesError = 0
	let totalBatteriesEmpty = 0

	for (const key in self.chargerStatus.batteries) {
		const battery = self.chargerStatus.batteries[key]

		if (battery.slotState === 'done') {
			totalBatteriesDone++
		} else if (battery.slotState === 'charging') {
			totalBatteriesCharging++
		} else if (battery.slotState === 'not charging') {
			totalBatteriesNotCharging++
		} else if (battery.slotState === 'empty') {
			totalBatteriesEmpty++
		} else if (battery.slotState === 'error') {
			totalBatteriesError++
		}

		const batteryNumber = Number.parseInt(key) + 1

		variableValues[`battery${batteryNumber}_BayTemperature`] = Number.parseFloat(battery.batteryBayTempC.toFixed(2))

		const slotState = battery.slotState
		let slotStateMsg = slotState
		if (slotState === 'done') {
			slotStateMsg = 'Done'
		} else if (slotState === 'charging') {
			slotStateMsg = 'Charging'
		} else if (slotState === 'not charging') {
			slotStateMsg = 'Not Charging'
		} else if (slotState === 'empty') {
			slotStateMsg = 'Empty'
		} else if (slotState === 'error') {
			slotStateMsg = 'Error'
		}

		variableValues[`battery${batteryNumber}_SlotState`] = slotStateMsg

		variableValues[`battery${batteryNumber}_ChargePercent`] = Number.parseFloat(
			battery.stateOfChargePercent.toFixed(2),
		)
		variableValues[`battery${batteryNumber}_TimeRemaining`] = battery.timeRemainingSeconds
		variableValues[`battery${batteryNumber}_ErrorMsg`] = battery.errorMsg
	}

	variableValues.totalBatteriesDone = totalBatteriesDone
	variableValues.totalBatteriesCharging = totalBatteriesCharging
	variableValues.totalBatteriesNotCharging = totalBatteriesNotCharging
	variableValues.totalBatteriesEmpty = totalBatteriesEmpty
	variableValues.totalBatteriesError = totalBatteriesError

	self.setVariableValues(variableValues)
}
