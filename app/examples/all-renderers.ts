import type { WFModel } from "../src/types";

const model: WFModel = {
  feature: "All Renderers Showcase",
  change: "Demonstrate and verify all components, kinds, layout modifiers, and enriched renderings.",
  designSource: "guess: engineering design specs",
  screens: [
    {
      id: "screen_nav_struct",
      name: "1. Navigation & Structure",
      states: [
        {
          id: "state_nav_struct",
          name: "Navigation & Structure Showcase",
          nodes: [
            {
              type: "col",
              children: [
                {
                  type: "row",
                  children: [
                    {
                      type: "box",
                      kind: "breadcrumb",
                      crumbs: ["Home", "Settings", "Billing", "Invoices"],
                    },
                    {
                      type: "box",
                      kind: "breadcrumb",
                      label: "Breadcrumb Fallback (No enrichment)",
                    },
                  ],
                },
                {
                  type: "row",
                  children: [
                    {
                      type: "box",
                      kind: "search",
                      placeholder: "Search transactions...",
                      filters: ["All", "Pending", "Failed", "Cleared"],
                    },
                    {
                      type: "box",
                      kind: "search",
                      label: "Search Fallback",
                    },
                  ],
                },
                {
                  type: "row",
                  children: [
                    {
                      type: "box",
                      kind: "stepper",
                      steps: ["Cart", "Delivery", "Payment", "Confirm"],
                      activeStep: 2,
                    },
                    {
                      type: "box",
                      kind: "stepper",
                      label: "Stepper Fallback",
                    },
                  ],
                },
                {
                  type: "row",
                  children: [
                    {
                      type: "box",
                      kind: "sidebar",
                      activeItem: "Invoices",
                      sidebarGroups: [
                        {
                          label: "Dashboard",
                          items: ["Overview", "Analytics"],
                        },
                        {
                          label: "Finance",
                          items: ["Transactions", "Invoices", "Settings"],
                        },
                      ],
                    },
                    {
                      type: "box",
                      kind: "sidebar",
                      label: "Sidebar Fallback",
                    },
                  ],
                },
                {
                  type: "row",
                  children: [
                    {
                      type: "box",
                      kind: "accordion",
                      sections: [
                        { title: "General Settings", expanded: true },
                        { title: "Notifications Control", expanded: false },
                        { title: "Developer API Access", expanded: false },
                      ],
                    },
                    {
                      type: "box",
                      kind: "accordion",
                      label: "Accordion Fallback",
                    },
                  ],
                },
                {
                  type: "row",
                  children: [
                    {
                      type: "box",
                      kind: "pagination",
                      pages: 6,
                      current: 3,
                    },
                    {
                      type: "box",
                      kind: "pagination",
                      label: "Pagination Fallback",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "screen_data_display",
      name: "2. Data Display",
      states: [
        {
          id: "state_data_display",
          name: "Data Display Showcase",
          nodes: [
            {
              type: "col",
              children: [
                {
                  type: "row",
                  children: [
                    {
                      type: "box",
                      kind: "table",
                      headers: ["User", "Access Level", "Status"],
                      selectable: true,
                      actions: ["Edit", "Delete"],
                      rows: [
                        ["Alice Vance", "Administrator", "Active"],
                        ["Bob Vance", "Editor", "Suspended"],
                        ["Charlie Vance", "Viewer", "Active"],
                      ],
                    },
                    {
                      type: "box",
                      kind: "table",
                      label: "Table Fallback",
                    },
                  ],
                },
                {
                  type: "row",
                  children: [
                    {
                      type: "box",
                      kind: "timeline",
                      events: [
                        { label: "Created database cluster", meta: "10:30 AM" },
                        { label: "Triggered auto-failover test", meta: "11:15 AM" },
                        { label: "Completed compliance check", meta: "1:00 PM" },
                      ],
                    },
                    {
                      type: "box",
                      kind: "timeline",
                      label: "Timeline Fallback",
                    },
                  ],
                },
                {
                  type: "row",
                  children: [
                    {
                      type: "box",
                      kind: "progress",
                      label: "Upload Progress",
                      percent: 75,
                    },
                    {
                      type: "box",
                      kind: "progress",
                      label: "Progress Fallback",
                    },
                  ],
                },
                {
                  type: "row",
                  children: [
                    {
                      type: "box",
                      kind: "badge",
                      text: "In Production",
                      variant: "success",
                    },
                    {
                      type: "box",
                      kind: "badge",
                      text: "Needs Review",
                      variant: "warning",
                    },
                    {
                      type: "box",
                      kind: "badge",
                      text: "Deployment Failed",
                      variant: "error",
                    },
                    {
                      type: "box",
                      kind: "badge",
                      text: "Draft Status",
                      variant: "default",
                    },
                    {
                      type: "box",
                      kind: "badge",
                      label: "Badge Fallback",
                    },
                  ],
                },
                {
                  type: "row",
                  children: [
                    {
                      type: "box",
                      kind: "rating",
                      label: "Customer Rating",
                      max: 5,
                      rating: 4,
                    },
                    {
                      type: "box",
                      kind: "rating",
                      label: "Rating Fallback",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "screen_user_input",
      name: "3. User Input",
      states: [
        {
          id: "state_user_input",
          name: "User Input Showcase",
          nodes: [
            {
              type: "col",
              children: [
                {
                  type: "row",
                  children: [
                    {
                      type: "box",
                      kind: "toggle",
                      checked: true,
                      toggleLabel: "Dark Mode Enabled",
                    },
                    {
                      type: "box",
                      kind: "toggle",
                      checked: false,
                      toggleLabel: "Automatic Updates",
                    },
                    {
                      type: "box",
                      kind: "toggle",
                      label: "Toggle Fallback",
                    },
                  ],
                },
                {
                  type: "row",
                  children: [
                    {
                      type: "box",
                      kind: "slider",
                      label: "Volume Control",
                      min: 0,
                      max: 100,
                      sliderValue: 65,
                    },
                    {
                      type: "box",
                      kind: "slider",
                      label: "Slider Fallback",
                    },
                  ],
                },
                {
                  type: "row",
                  children: [
                    {
                      type: "box",
                      kind: "datepicker",
                      label: "Due Date",
                      dateValue: "June 25, 2026",
                    },
                    {
                      type: "box",
                      kind: "datepicker",
                      label: "Datepicker Fallback",
                    },
                  ],
                },
                {
                  type: "row",
                  children: [
                    {
                      type: "box",
                      kind: "upload",
                      uploadLabel: "Drag CSV invoice files here to parse",
                    },
                    {
                      type: "box",
                      kind: "upload",
                      label: "Upload Fallback",
                    },
                  ],
                },
                {
                  type: "row",
                  children: [
                    {
                      type: "box",
                      kind: "radio-group",
                      label: "Subscription Type",
                      options: ["Free Tier", "Standard Monthly", "Professional Annual"],
                      selected: 1,
                    },
                    {
                      type: "box",
                      kind: "radio-group",
                      label: "Radio Fallback",
                    },
                  ],
                },
                {
                  type: "row",
                  children: [
                    {
                      type: "box",
                      kind: "checkbox-group",
                      label: "User Preferences",
                      options: ["Receive newsletters", "Enable SMS logs", "Share analytics data"],
                      checkedItems: [0, 2],
                    },
                    {
                      type: "box",
                      kind: "checkbox-group",
                      label: "Checkbox Group Fallback",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "screen_feedback_composite",
      name: "4. Feedback & Composite",
      states: [
        {
          id: "state_feedback_composite",
          name: "Feedback & Composite Showcase",
          nodes: [
            {
              type: "col",
              children: [
                {
                  type: "row",
                  children: [
                    {
                      type: "box",
                      kind: "alert",
                      message: "Connection has been successfully restored.",
                      alertType: "success",
                    },
                    {
                      type: "box",
                      kind: "alert",
                      message: "Vitals check warning: memory utilization at 92%.",
                      alertType: "warning",
                    },
                    {
                      type: "box",
                      kind: "alert",
                      message: "Fatal database lock error in cluster-A.",
                      alertType: "error",
                    },
                    {
                      type: "box",
                      kind: "alert",
                      label: "Alert Fallback",
                    },
                  ],
                },
                {
                  type: "row",
                  children: [
                    {
                      type: "box",
                      kind: "modal",
                      modalTitle: "Delete Workspace Confirmation",
                      modalFooter: ["Cancel", "Confirm Delete"],
                      children: [
                        {
                          type: "row",
                          children: [
                            {
                              type: "box",
                              kind: "alert",
                              message: "Warning: This action is permanent and cannot be undone.",
                              alertType: "warning",
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: "box",
                      kind: "modal",
                      label: "Modal Fallback",
                    },
                  ],
                },
                {
                  type: "row",
                  children: [
                    {
                      type: "box",
                      kind: "notification-list",
                      label: "Security Center Alerts",
                      notifications: [
                        { text: "Suspicious login attempt detected from IP 192.168.1.55", meta: "5m ago", unread: true },
                        { text: "TLS Certificate has been renewed automatically", meta: "1h ago", unread: false },
                        { text: "New API secret key generated by developer", meta: "2d ago", unread: false },
                      ],
                    },
                    {
                      type: "box",
                      kind: "notification-list",
                      label: "Notifications Fallback",
                    },
                  ],
                },
                {
                  type: "row",
                  children: [
                    {
                      type: "box",
                      kind: "chat-window",
                      label: "Customer Support Thread",
                      messages: [
                        { from: "System Bot", text: "Hello! How can we assist you today?", sent: false },
                        { from: "Customer", text: "I'm having trouble configuring the webhook endpoint.", sent: true },
                        { from: "Agent Sarah", text: "Let me check that. Can you share the endpoint URL?", sent: false },
                      ],
                    },
                    {
                      type: "box",
                      kind: "chat-window",
                      label: "Chat Fallback",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "screen_layout_modifiers",
      name: "5. Layout & Grid Mods",
      states: [
        {
          id: "state_layout_modifiers",
          name: "Layout Alignments, Spacing, and Flex Sizing",
          nodes: [
            {
              type: "col",
              children: [
                // Horizontal alignment testing
                {
                  type: "row",
                  mods: ["end"],
                  children: [
                    { type: "box", kind: "badge", text: "Aligned End (Right)", variant: "default" },
                    { type: "box", kind: "badge", text: "Secondary Badge", variant: "default" },
                  ],
                },
                {
                  type: "row",
                  mods: ["center"],
                  children: [
                    { type: "box", kind: "badge", text: "Aligned Center", variant: "default" },
                    { type: "box", kind: "badge", text: "Secondary Badge", variant: "default" },
                  ],
                },
                {
                  type: "row",
                  mods: ["between"],
                  children: [
                    { type: "box", kind: "badge", text: "Aligned Between (Left)", variant: "default" },
                    { type: "box", kind: "badge", text: "Aligned Between (Right)", variant: "default" },
                  ],
                },
                // Vertical alignment testing
                {
                  type: "row",
                  mods: ["middle", "tall"],
                  children: [
                    { type: "box", kind: "badge", text: "Vertically Centered (Middle)", variant: "default" },
                    { type: "box", kind: "badge", text: "In Tall Row", variant: "default" },
                  ],
                },
                // Spacing testing
                {
                  type: "row",
                  mods: ["compact"],
                  children: [
                    { type: "box", kind: "badge", text: "Compact Gap", variant: "default" },
                    { type: "box", kind: "badge", text: "6px spacing", variant: "default" },
                  ],
                },
                {
                  type: "row",
                  mods: ["loose"],
                  children: [
                    { type: "box", kind: "badge", text: "Loose Gap", variant: "default" },
                    { type: "box", kind: "badge", text: "20px spacing", variant: "default" },
                  ],
                },
                // Flex sizing on columns testing
                {
                  type: "row",
                  children: [
                    {
                      type: "col",
                      flex: 1,
                      children: [
                        { type: "box", label: "Column Weight: flex = 1" },
                      ],
                    },
                    {
                      type: "col",
                      flex: 3,
                      children: [
                        { type: "box", label: "Column Weight: flex = 3 (Should take up 3x horizontal space)" },
                      ],
                    },
                    {
                      type: "col",
                      mods: ["narrow"],
                      children: [
                        { type: "box", label: "Narrow Column (Takes min space)" },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "screen_enriched_kinds",
      name: "6. Enriched Kinds",
      states: [
        {
          id: "state_enriched_kinds",
          name: "Enriched Kinds Showcase",
          nodes: [
            {
              type: "col",
              children: [
                // KPI / Stat
                {
                  type: "row",
                  children: [
                    {
                      type: "box",
                      kind: "kpi",
                      label: "KPI Enriched (Up Trend)",
                      value: "$45.2M",
                      subtitle: "Total revenue",
                      trend: "up",
                    },
                    {
                      type: "box",
                      kind: "stat",
                      label: "Stat Enriched (Down Trend)",
                      value: "12%",
                      subtitle: "Bounce rate",
                      trend: "down",
                    },
                    {
                      type: "box",
                      kind: "kpi",
                      label: "KPI Fallback (No enrichment)",
                    },
                  ],
                },

                // Form
                {
                  type: "row",
                  children: [
                    {
                      type: "box",
                      kind: "form",
                      label: "Enriched Form (2-Col Grid)",
                      fields: [
                        { label: "Full Name", type: "text", cols: 2 },
                        { label: "Work Email", type: "text", cols: 1 },
                        { label: "Role", type: "select", cols: 1 },
                        { label: "Bio / Description", type: "textarea", cols: 2 },
                        { label: "Enable Notifications", type: "toggle", cols: 1 },
                      ],
                    },
                    {
                      type: "box",
                      kind: "form",
                      label: "Form Fallback (No enrichment)",
                    },
                  ],
                },

                // Card
                {
                  type: "row",
                  children: [
                    {
                      type: "box",
                      kind: "card",
                      title: "Enriched Card Title",
                      label: "Secondary Label / Category",
                      meta: ["Updated 2h ago", "Owner: AJ"],
                      badges: ["Production", "Active"],
                      stats: ["✓ 12 Tasks", "3 Comments"],
                    },
                    {
                      type: "box",
                      kind: "card",
                      label: "Card Fallback (No enrichment)",
                    },
                  ],
                },

                // List
                {
                  type: "row",
                  children: [
                    {
                      type: "box",
                      kind: "list",
                      label: "Enriched List Header",
                      items: [
                        "Intake battery batch completed",
                        "Compliance filing generated",
                        "EPR certificate issued successfully",
                      ],
                    },
                    {
                      type: "box",
                      kind: "list",
                      label: "List Fallback (No enrichment)",
                    },
                  ],
                },

                // Tabs
                {
                  type: "row",
                  children: [
                    {
                      type: "box",
                      kind: "tabs",
                      tabs: ["Overview", "Settings", "Analytics", "Logs"],
                      activeTab: 1, // "Settings" active
                    },
                    {
                      type: "box",
                      kind: "tabs",
                      label: "Tabs Fallback (No enrichment)",
                    },
                  ],
                },

                // Button and Avatar
                {
                  type: "row",
                  children: [
                    {
                      type: "box",
                      kind: "button",
                      label: "Outline Button",
                    },
                    {
                      type: "box",
                      kind: "button",
                      mods: ["solid"],
                      label: "Solid Button",
                    },
                    {
                      type: "box",
                      kind: "avatar",
                      initials: "JD",
                      label: "John Doe",
                    },
                    {
                      type: "box",
                      kind: "avatar",
                      label: "Avatar Fallback",
                    },
                  ],
                },

                // Children support and Image scaling
                {
                  type: "row",
                  children: [
                    {
                      type: "box",
                      label: "Box with custom children nesting",
                      children: [
                        {
                          type: "row",
                          children: [
                            { type: "box", kind: "avatar", initials: "TM" },
                            { type: "box", kind: "button", label: "Message" },
                          ],
                        },
                      ],
                    },
                    {
                      type: "box",
                      kind: "image",
                      label: "Default Image Scale",
                    },
                    {
                      type: "box",
                      kind: "image",
                      mods: ["tall"],
                      label: "Tall Image Scale",
                    },
                    {
                      type: "box",
                      kind: "image",
                      mods: ["taller"],
                      label: "Taller Image Scale",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default model;
