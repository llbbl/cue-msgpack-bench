import type { z } from "zod";
import userProfileCue from "./examples/user-profile.cue?raw";
import userProfileJson from "./examples/user-profile.json?raw";
import userProfileMsgpack from "./examples/user-profile.msgpack.ts";
import productListingCue from "./examples/product-listing.cue?raw";
import productListingJson from "./examples/product-listing.json?raw";
import productListingMsgpack from "./examples/product-listing.msgpack.ts";
import dashboardAnalyticsCue from "./examples/dashboard-analytics.cue?raw";
import dashboardAnalyticsJson from "./examples/dashboard-analytics.json?raw";
import dashboardAnalyticsMsgpack from "./examples/dashboard-analytics.msgpack.ts";
import chatMessagesCue from "./examples/chat-messages.cue?raw";
import chatMessagesJson from "./examples/chat-messages.json?raw";
import chatMessagesMsgpack from "./examples/chat-messages.msgpack.ts";
import orderHistoryCue from "./examples/order-history.cue?raw";
import orderHistoryJson from "./examples/order-history.json?raw";
import orderHistoryMsgpack from "./examples/order-history.msgpack.ts";
import largeProductCatalogCue from "./examples/large-product-catalog.cue?raw";
import largeProductCatalogJson from "./examples/large-product-catalog.json?raw";
import largeProductCatalogMsgpack from "./examples/large-product-catalog.msgpack.ts";
import largeAnalyticsCue from "./examples/large-analytics.cue?raw";
import largeAnalyticsJson from "./examples/large-analytics.json?raw";
import largeAnalyticsMsgpack from "./examples/large-analytics.msgpack.ts";
import schemaUserApiCue from "./examples/schema-user-api.cue?raw";
import schemaUserApiJson from "./examples/schema-user-api.json?raw";
import schemaUserApiMsgpack from "./examples/schema-user-api.msgpack.ts";
import schemaAppConfigCue from "./examples/schema-app-config.cue?raw";
import schemaAppConfigJson from "./examples/schema-app-config.json?raw";
import schemaAppConfigMsgpack from "./examples/schema-app-config.msgpack.ts";
import { schema as schemaUserApiZod } from "./schemas/schema-user-api.schema";
import { schema as schemaAppConfigZod } from "./schemas/schema-app-config.schema";
import { jsonSchema as schemaUserApiAjv } from "./schemas/schema-user-api.json-schema";
import { jsonSchema as schemaAppConfigAjv } from "./schemas/schema-app-config.json-schema";

export interface Example {
	id: string;
	name: string;
	cueText: string;
	jsonText: string;
	msgpackData: Uint8Array;
	zodSchema?: z.ZodType;
	ajvSchema?: Record<string, unknown>;
}

export const examples: Example[] = [
	{ id: "user-profile", name: "User Profile API", cueText: userProfileCue, jsonText: userProfileJson, msgpackData: userProfileMsgpack },
	{ id: "product-listing", name: "Product Listing API", cueText: productListingCue, jsonText: productListingJson, msgpackData: productListingMsgpack },
	{ id: "dashboard-analytics", name: "Dashboard Analytics API", cueText: dashboardAnalyticsCue, jsonText: dashboardAnalyticsJson, msgpackData: dashboardAnalyticsMsgpack },
	{ id: "chat-messages", name: "Chat Messages API", cueText: chatMessagesCue, jsonText: chatMessagesJson, msgpackData: chatMessagesMsgpack },
	{ id: "order-history", name: "E-commerce Order History", cueText: orderHistoryCue, jsonText: orderHistoryJson, msgpackData: orderHistoryMsgpack },
	{ id: "large-product-catalog", name: "Large Product Catalog (100 products)", cueText: largeProductCatalogCue, jsonText: largeProductCatalogJson, msgpackData: largeProductCatalogMsgpack },
	{ id: "large-analytics", name: "Large Analytics (365 days)", cueText: largeAnalyticsCue, jsonText: largeAnalyticsJson, msgpackData: largeAnalyticsMsgpack },
	{ id: "schema-user-api", name: "User Management API (Schema+Data)", cueText: schemaUserApiCue, jsonText: schemaUserApiJson, msgpackData: schemaUserApiMsgpack, zodSchema: schemaUserApiZod, ajvSchema: schemaUserApiAjv },
	{ id: "schema-app-config", name: "App Config (Schema+Data)", cueText: schemaAppConfigCue, jsonText: schemaAppConfigJson, msgpackData: schemaAppConfigMsgpack, zodSchema: schemaAppConfigZod, ajvSchema: schemaAppConfigAjv },
];
