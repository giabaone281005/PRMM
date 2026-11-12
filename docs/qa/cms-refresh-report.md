# CMS update and engine extension

The CMS has 12 tested interaction families. New templates use `contracts/problems/*.problem.json`; only mathematical data belongs in JSON, never executable scripts.

For a genuinely new interaction: add a model and capability to the contract/schema, register it in the router and SQL registry source, implement the same controls/metrics in TypeScript and Dart, render it in React and Flutter, add an authoring blueprint with mathematical answer validation, and export shared gesture scenarios. Test scene continuity, checkpoint/restore, invalid data, phone preview and actual Android completion before exposing the template in CMS.

The “Có đề khác?” flow suggests existing tools by keywords. Unknown requests are saved in browser storage and listed under Công cụ tương tác. It does not turn an unsupported problem into a published lesson.

Scripts should have one short action per checkpoint. The editor limits instruction/hint entry to 160 characters; generated scripts use current numeric data. Existing authored content is preserved.

Local testing: http://127.0.0.1:5173/admin/studio. Mobile reads http://10.0.2.2:5173/api. Supabase remains deferred.
