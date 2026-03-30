import { z } from "zod";

const Address = z.object({
	street: z.string(),
	city: z.string(),
	state: z.string().regex(/^[A-Z]{2}$/),
	zip: z.string().regex(/^[0-9]{5}$/),
	country: z.string(),
});

const Subscription = z.object({
	plan: z.enum(["free", "starter", "pro", "enterprise"]),
	status: z.enum(["active", "canceled", "past_due", "trialing"]),
	billingCycle: z.enum(["monthly", "annual"]),
	renewsAt: z.string(),
	seats: z.number().int().min(1),
	features: z.array(z.string()),
});

const User = z.object({
	id: z.string(),
	email: z.string().regex(/^[^@]+@[^@]+$/),
	displayName: z.string(),
	role: z.enum(["admin", "editor", "viewer", "owner"]),
	verified: z.boolean(),
	createdAt: z.string(),
	lastLoginAt: z.string(),
	address: Address,
	subscription: Subscription,
	preferences: z.object({
		theme: z.enum(["light", "dark", "system"]),
		language: z.string(),
		timezone: z.string(),
		notifications: z.object({
			email: z.boolean(),
			push: z.boolean(),
			sms: z.boolean(),
		}),
	}),
});

export const schema = z.object({
	response: z.object({
		teamId: z.string(),
		teamName: z.string(),
		plan: z.enum(["starter", "pro", "enterprise"]),
		members: z.array(User),
		totalSeats: z.number().int().min(1),
		usedSeats: z.number().int().min(0),
	}),
});
