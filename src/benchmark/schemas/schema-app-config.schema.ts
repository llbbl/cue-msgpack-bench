import { z } from "zod";

const DatabaseReplica = z.object({
	host: z.string(),
	port: z.number().int().min(1).max(65535),
	priority: z.number().int().min(0).max(100),
});

const DatabaseConfig = z.object({
	host: z.string(),
	port: z.number().int().min(1).max(65535),
	name: z.string(),
	pool: z.object({
		min: z.number().int().min(1),
		max: z.number().int().min(1),
		idleTimeout: z.number().int().min(0),
	}),
	ssl: z.boolean(),
	replicas: z.array(DatabaseReplica),
});

const CacheConfig = z.object({
	provider: z.enum(["redis", "memcached", "in-memory"]),
	host: z.string(),
	port: z.number().int().min(1).max(65535),
	ttl: z.number().int().min(0),
	maxMemory: z.string(),
	evictionPolicy: z.enum(["lru", "lfu", "random", "ttl"]),
});

const CircuitBreaker = z.object({
	enabled: z.boolean(),
	threshold: z.number().int().min(1),
	resetTimeout: z.number().int().min(1000),
});

const ServiceEndpoint = z.object({
	url: z.string(),
	timeout: z.number().int().min(100),
	retries: z.number().int().min(0).max(10),
	circuitBreaker: CircuitBreaker,
});

const LogOutput = z.object({
	type: z.enum(["stdout", "file", "syslog", "cloudwatch"]),
	config: z.record(z.string(), z.unknown()),
});

const LogConfig = z.object({
	level: z.enum(["debug", "info", "warn", "error"]),
	format: z.enum(["json", "text", "structured"]),
	outputs: z.array(LogOutput),
});

export const schema = z.object({
	config: z.object({
		environment: z.enum(["development", "staging", "production"]),
		version: z.string(),
		server: z.object({
			host: z.string(),
			port: z.number().int().min(1).max(65535),
			cors: z.object({
				origins: z.array(z.string()),
				methods: z.array(z.string()),
				maxAge: z.number().int().min(0),
			}),
		}),
		database: DatabaseConfig,
		cache: CacheConfig,
		services: z.record(z.string(), ServiceEndpoint),
		logging: LogConfig,
		features: z.record(z.string(), z.boolean()),
	}),
});
