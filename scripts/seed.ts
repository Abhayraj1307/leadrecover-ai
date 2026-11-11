import { getDemoDashboard } from "../lib/demo-store";

const demo = getDemoDashboard();
console.log(`Demo mode is ready for ${demo.business.company_name}: ${demo.leads.length} leads and ${demo.calls.length} calls are preloaded.`);
