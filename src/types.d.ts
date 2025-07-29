// types.d.ts

interface DeviceInfo {
	deviceInternalTemperatureC: number
	name: string
	firmwareVersion: string
	firmwareBuild: string
}

interface Battery {
	index: number
	batteryBayTempC: number
	batteryDetected: string
	slotState: 'error' | 'done' | 'charging' | 'not charging' | 'empty'
	stateOfChargePercent: number
	timeRemainingSeconds: number
	errorMsg: string
}

interface ChargerStatus {
	deviceStatus: 'ok' | 'error'
	batteries: Battery[] // Array of batteries instead of object
}
