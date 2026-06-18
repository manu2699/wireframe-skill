// Demonstrates compact JSON syntax: shared $ref, shorthand row/col,
// omitted type:"box", single-state screens, flows, roles, new/changed flags.
import type { WFModel } from "../src/types";

const model: WFModel = {
  feature: "News Feed App",
  change: "Feed + post creation",
  designSource: "guess: social media",

  shared: {
    left_nav: {
      type: "nav",
      side: "left",
      groups: [
        {
          label: "Menu",
          items: [
            { text: "Home", goto: "s_feed" },
            { text: "Explore" },
            { text: "Notifications", badge: "3" },
            { text: "Messages" },
            { text: "Profile" },
          ],
        },
      ],
    },
    sidebar_panels: {
      type: "col",
      children: [
        {
          kind: "card",
          title: "Trending",
          backend: "GET /api/trending",
          ds: "guess: SidebarCard / list",
          children: [
            { kind: "list", items: ["#TechNews", "#AI", "Next.js 15", "#Design"] },
          ],
        },
        {
          kind: "card",
          title: "Who to follow",
          backend: "GET /api/suggestions",
          ds: "guess: SidebarCard / userList",
          children: [
            {
              col: [
                {
                  row: [
                    { kind: "avatar", initials: "JD" },
                    { col: [{ kind: "heading", level: 5, label: "Jane Doe" }, { kind: "heading", level: 6, label: "@janedoe" }], mods: ["compact"] },
                    { kind: "button", label: "Follow" },
                  ],
                  mods: ["middle"],
                },
                {
                  row: [
                    { kind: "avatar", initials: "JS" },
                    { col: [{ kind: "heading", level: 5, label: "John Smith" }, { kind: "heading", level: 6, label: "@johnsmith" }], mods: ["compact"] },
                    { kind: "button", label: "Follow" },
                  ],
                  mods: ["middle"],
                },
              ],
            },
          ],
        },
      ],
    },
  },

  flows: [
    { from: "s_feed", via: "click post card", to: "s_post_detail" },
    { from: "s_feed", via: "compose card", to: "m_compose" },
    { from: "s_post_detail", via: "reply input", to: "m_compose" },
    { from: "s_post_detail", via: "← Back", to: "s_feed" },
  ],

  screens: [
    {
      id: "s_feed",
      name: "Home Feed",
      role: "list",
      // single-state shorthand: nodes directly on screen
      nodes: [
        {
          row: [
            { $ref: "left_nav" },
            {
              col: [
                {
                  kind: "tabs",
                  tabs: ["For You", "Following"],
                  activeTab: 0,
                  new: true,
                  backend: "GET /api/feed?tab=",
                },
                {
                  kind: "card",
                  title: "What's happening?",
                  stats: ["Share a post"],
                  opens: "m_compose",
                  backend: "POST /api/posts",
                  ds: "guess: Card / interactive",
                },
                {
                  kind: "card",
                  title: "Alice Smith",
                  meta: ["@alicesmith", "2h ago"],
                  label: "Shipped a new feature...",
                  stats: ["12 Likes", "4 Comments"],
                  goto: "s_post_detail",
                  backend: "GET /api/feed",
                  ds: "guess: FeedItem / default",
                },
                {
                  kind: "card",
                  title: "Bob Builder",
                  meta: ["@bob", "4h ago"],
                  label: "Morning hike photo",
                  children: [{ kind: "image", label: "Mountain sunrise" }],
                  stats: ["45 Likes", "2 Comments"],
                  backend: "GET /api/feed",
                  ds: "guess: FeedItem / image",
                },
                {
                  kind: "card",
                  title: "Web Dev News",
                  meta: ["@webdev", "10h ago"],
                  label: "Favorite frontend framework?",
                  children: [{ kind: "list", items: ["React", "Vue", "Svelte", "Angular"] }],
                  stats: ["102 Votes", "15 Comments"],
                  backend: "GET /api/feed",
                  ds: "guess: FeedItem / poll",
                },
              ],
            },
            { $ref: "sidebar_panels" },
          ],
        },
      ],
    },
    {
      id: "s_post_detail",
      name: "Post Detail",
      role: "detail",
      nodes: [
        {
          row: [
            { $ref: "left_nav" },
            {
              col: [
                {
                  row: [
                    { kind: "button", label: "← Back", goto: "s_feed", action: "back" },
                    { kind: "heading", label: "Post", level: 2 },
                  ],
                },
                {
                  kind: "card",
                  title: "Alice Smith",
                  meta: ["@alicesmith", "2h ago"],
                  label: "Shipped a new feature...",
                  stats: ["12 Likes", "4 Comments", "3 Reposts"],
                  backend: "GET /api/posts/:id",
                  ds: "guess: PostDetail / main",
                },
                {
                  kind: "input",
                  label: "Post your reply",
                  opens: "m_compose",
                  backend: "POST /api/posts/:id/reply",
                  ds: "guess: ReplyInput / default",
                },
                {
                  kind: "card",
                  title: "Charlie",
                  meta: ["@charlie", "1h ago"],
                  label: "Looks amazing!",
                  stats: ["2 Likes"],
                  backend: "GET /api/posts/:id/replies",
                  ds: "guess: ReplyItem / default",
                },
                {
                  kind: "card",
                  title: "Dave",
                  meta: ["@dave", "30m ago"],
                  label: "Is there a changelog?",
                  stats: ["1 Like"],
                  backend: "GET /api/posts/:id/replies",
                  ds: "guess: ReplyItem / default",
                },
              ],
            },
            { $ref: "sidebar_panels" },
          ],
        },
      ],
    },
  ],

  modals: [
    {
      id: "m_compose",
      name: "Create Post",
      nodes: [
        {
          kind: "form",
          fields: [
            { label: "Your post", type: "textarea", placeholder: "What's on your mind?" },
            { label: "Attach image", type: "upload", uploadLabel: "Select file" },
          ],
          backend: "POST /api/posts (multipart)",
          ds: "guess: Form / standard",
          new: true,
        },
        { kind: "button", label: "Post", action: "submit", goto: "s_feed" },
      ],
    },
  ],
};

export default model;
