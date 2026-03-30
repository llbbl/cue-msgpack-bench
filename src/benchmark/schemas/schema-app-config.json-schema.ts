export const jsonSchema = {
	type: "object",
	required: ["config"],
	properties: {
		config: {
			type: "object",
			required: ["environment", "version", "server", "database", "cache", "services", "logging", "features"],
			properties: {
				environment: { type: "string", enum: ["development", "staging", "production"] },
				version: { type: "string" },
				server: {
					type: "object",
					required: ["host", "port", "cors"],
					properties: {
						host: { type: "string" },
						port: { type: "integer", minimum: 1, maximum: 65535 },
						cors: {
							type: "object",
							required: ["origins", "methods", "maxAge"],
							properties: {
								origins: { type: "array", items: { type: "string" } },
								methods: { type: "array", items: { type: "string" } },
								maxAge: { type: "integer", minimum: 0 },
							},
						},
					},
				},
				database: {
					type: "object",
					required: ["host", "port", "name", "pool", "ssl", "replicas"],
					properties: {
						host: { type: "string" },
						port: { type: "integer", minimum: 1, maximum: 65535 },
						name: { type: "string" },
						pool: {
							type: "object",
							required: ["min", "max", "idleTimeout"],
							properties: {
								min: { type: "integer", minimum: 1 },
								max: { type: "integer", minimum: 1 },
								idleTimeout: { type: "integer", minimum: 0 },
							},
						},
						ssl: { type: "boolean" },
						replicas: {
							type: "array",
							items: {
								type: "object",
								required: ["host", "port", "priority"],
								properties: {
									host: { type: "string" },
									port: { type: "integer", minimum: 1, maximum: 65535 },
									priority: { type: "integer", minimum: 0, maximum: 100 },
								},
							},
						},
					},
				},
				cache: {
					type: "object",
					required: ["provider", "host", "port", "ttl", "maxMemory", "evictionPolicy"],
					properties: {
						provider: { type: "string", enum: ["redis", "memcached", "in-memory"] },
						host: { type: "string" },
						port: { type: "integer", minimum: 1, maximum: 65535 },
						ttl: { type: "integer", minimum: 0 },
						maxMemory: { type: "string" },
						evictionPolicy: { type: "string", enum: ["lru", "lfu", "random", "ttl"] },
					},
				},
				services: {
					type: "object",
					additionalProperties: {
						type: "object",
						required: ["url", "timeout", "retries", "circuitBreaker"],
						properties: {
							url: { type: "string" },
							timeout: { type: "integer", minimum: 100 },
							retries: { type: "integer", minimum: 0, maximum: 10 },
							circuitBreaker: {
								type: "object",
								required: ["enabled", "threshold", "resetTimeout"],
								properties: {
									enabled: { type: "boolean" },
									threshold: { type: "integer", minimum: 1 },
									resetTimeout: { type: "integer", minimum: 1000 },
								},
							},
						},
					},
				},
				logging: {
					type: "object",
					required: ["level", "format", "outputs"],
					properties: {
						level: { type: "string", enum: ["debug", "info", "warn", "error"] },
						format: { type: "string", enum: ["json", "text", "structured"] },
						outputs: {
							type: "array",
							items: {
								type: "object",
								required: ["type", "config"],
								properties: {
									type: { type: "string", enum: ["stdout", "file", "syslog", "cloudwatch"] },
									config: { type: "object" },
								},
							},
						},
					},
				},
				features: {
					type: "object",
					additionalProperties: { type: "boolean" },
				},
			},
		},
	},
} as const;
