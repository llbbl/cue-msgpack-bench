export const jsonSchema = {
	type: "object",
	required: ["response"],
	properties: {
		response: {
			type: "object",
			required: ["teamId", "teamName", "plan", "members", "totalSeats", "usedSeats"],
			properties: {
				teamId: { type: "string" },
				teamName: { type: "string" },
				plan: { type: "string", enum: ["starter", "pro", "enterprise"] },
				totalSeats: { type: "integer", minimum: 1 },
				usedSeats: { type: "integer", minimum: 0 },
				members: {
					type: "array",
					items: {
						type: "object",
						required: ["id", "email", "displayName", "role", "verified", "createdAt", "lastLoginAt", "address", "subscription", "preferences"],
						properties: {
							id: { type: "string" },
							email: { type: "string", pattern: "^[^@]+@[^@]+$" },
							displayName: { type: "string" },
							role: { type: "string", enum: ["admin", "editor", "viewer", "owner"] },
							verified: { type: "boolean" },
							createdAt: { type: "string" },
							lastLoginAt: { type: "string" },
							address: {
								type: "object",
								required: ["street", "city", "state", "zip", "country"],
								properties: {
									street: { type: "string" },
									city: { type: "string" },
									state: { type: "string", pattern: "^[A-Z]{2}$" },
									zip: { type: "string", pattern: "^[0-9]{5}$" },
									country: { type: "string" },
								},
							},
							subscription: {
								type: "object",
								required: ["plan", "status", "billingCycle", "renewsAt", "seats", "features"],
								properties: {
									plan: { type: "string", enum: ["free", "starter", "pro", "enterprise"] },
									status: { type: "string", enum: ["active", "canceled", "past_due", "trialing"] },
									billingCycle: { type: "string", enum: ["monthly", "annual"] },
									renewsAt: { type: "string" },
									seats: { type: "integer", minimum: 1 },
									features: { type: "array", items: { type: "string" } },
								},
							},
							preferences: {
								type: "object",
								required: ["theme", "language", "timezone", "notifications"],
								properties: {
									theme: { type: "string", enum: ["light", "dark", "system"] },
									language: { type: "string" },
									timezone: { type: "string" },
									notifications: {
										type: "object",
										required: ["email", "push", "sms"],
										properties: {
											email: { type: "boolean" },
											push: { type: "boolean" },
											sms: { type: "boolean" },
										},
									},
								},
							},
						},
					},
				},
			},
		},
	},
} as const;
