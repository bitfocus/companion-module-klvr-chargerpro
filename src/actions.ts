import type { KLVRChargerProInstance } from './main.js'

export function UpdateActions(self: KLVRChargerProInstance): void {
	self.setActionDefinitions({
		deviceIdentify: {
			name: 'Identify Device',
			description: 'Flashes the lights on the device',
			options: [],
			callback: () => {
				self.apiInstance.deviceIdentify()
			},
		},
	})
}
