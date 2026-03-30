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

export interface Example {
	id: string;
	name: string;
	cueText: string;
	jsonText: string;
	msgpackData: Uint8Array;
}

export const examples: Example[] = [
	{ id: "user-profile", name: "User Profile API", cueText: userProfileCue, jsonText: userProfileJson, msgpackData: userProfileMsgpack },
	{ id: "product-listing", name: "Product Listing API", cueText: productListingCue, jsonText: productListingJson, msgpackData: productListingMsgpack },
	{ id: "dashboard-analytics", name: "Dashboard Analytics API", cueText: dashboardAnalyticsCue, jsonText: dashboardAnalyticsJson, msgpackData: dashboardAnalyticsMsgpack },
	{ id: "chat-messages", name: "Chat Messages API", cueText: chatMessagesCue, jsonText: chatMessagesJson, msgpackData: chatMessagesMsgpack },
	{ id: "order-history", name: "E-commerce Order History", cueText: orderHistoryCue, jsonText: orderHistoryJson, msgpackData: orderHistoryMsgpack },
];
